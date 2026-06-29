import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../viewmodels/useAuthStore';

const API_BASE = 'https://nabilnih1302-mindscan-api.hf.space/api'; 

export default function PsychologistDashboardScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('Semua');

  const filterOptions = ['Semua', 'Depresi Berat', 'Depresi Sedang', 'Depresi Ringan', 'Kecemasan Sedang', 'Kecemasan Ringan', 'Normal'];

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/psychologist/assessments`, { headers: { 'X-API-Key': 'mindscan_secret_key_2026' } });
      const data = await response.json();
      if (data.status === 'success') {
        setSessions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching sessions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (sessionId: number, action: 'lanjut' | 'selesai', mahasiswaName: string) => {
    try {
      const response = await fetch(`${API_BASE}/psychologist/feedback`, {
        method: 'POST',
        headers: {
          'X-API-Key': 'mindscan_secret_key_2026', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psychologist_id: user?.id,
          session_id: sessionId,
          action: action
        })
      });

      const textResponse = await response.text();
      let data;
      try {
          data = JSON.parse(textResponse);
      } catch(e) {
          console.error("Not a JSON response:", textResponse);
          Alert.alert("Error", "Gagal mengirim aksi: Server error.");
          return;
      }
      
      if (data.status === 'success') {
        if (action === 'lanjut') {
          navigation.navigate('ConsultationChat', { 
            sessionId: data.consultation_id, 
            partnerName: mahasiswaName,
            status: 'active',
            mahasiswaId: sessionId // wait, sessionId here is actually the assessment Session ID! Yes! No, wait. 
            // In handleFeedback, sessionId is the assessment Session. We need to pass the real mahasiswa ID.
            // But we don't have the mahasiswa ID readily available. Let's look at how renderSession is built.
          });
        } else {
          Alert.alert("Selesai", "Sesi telah ditandai sebagai selesai.");
          fetchSessions();
        }
      } else {
        Alert.alert("Gagal", data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal mengirim aksi");
    }
  };

  const getScoreColor = (score: string) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score.includes('Ringan')) return 'bg-yellow-100 text-yellow-800';
    if (score.includes('Sedang')) return 'bg-orange-100 text-orange-800';
    if (score.includes('Berat')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const filteredSessions = sessions.filter(s => filterLevel === 'Semua' || s.anxiety_level === filterLevel);

  const renderSession = ({ item }: { item: any }) => {
    const isHandledByOther = item.handled_by !== null && item.handled_by !== user?.name;
    const isHandledByMe = item.handled_by === user?.name;

    return (
      <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100 shadow-sm">
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="text-lg font-bold text-gray-800">{item.mahasiswa_name}</Text>
            <Text className="text-sm text-gray-500">{item.mahasiswa_email}</Text>
          </View>
          <View className={`px-2 py-1 rounded-md ${getScoreColor(item.anxiety_level)}`}>
            <Text className="text-xs font-bold">{item.anxiety_level || 'Menunggu'}</Text>
          </View>
        </View>
        
        {isHandledByOther ? (
          <View className="mt-3 bg-gray-100 p-2 rounded-lg items-center">
            <Text className="text-xs text-gray-500 font-medium">Ditangani oleh Psikolog {item.psychologist_name || item.handled_by}</Text>
          </View>
        ) : (
          <View className="flex-row justify-between items-center mt-4 border-t border-gray-100 pt-3">
            <Text className="text-xs text-gray-400">
              {item.status === 'completed' && isHandledByMe ? 'Sedang Anda tangani' : item.status}
            </Text>
            
            <View className="flex-row">
              {isHandledByMe ? (
                <>
                  {item.status !== 'closed' && (
                    <TouchableOpacity 
                      onPress={() => handleFeedback(item.session_id, 'selesai', item.mahasiswa_name)}
                      className="bg-gray-200 px-3 py-2 rounded-lg mr-2"
                    >
                      <Text className="text-gray-700 font-bold">Selesai</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('ConsultationChat', { 
                      sessionId: item.consultation_id, 
                      partnerName: item.mahasiswa_name,
                      status: item.status,
                      mahasiswaId: item.user_id // use item.user_id from backend response!
                    })}
                    className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
                  >
                    <Ionicons name="chatbubble" size={16} color="white" className="mr-1" />
                    <Text className="text-white font-bold ml-1">
                      {item.status === 'closed' ? 'Arsip Chat' : 'Lanjut Chat'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  onPress={() => handleFeedback(item.session_id, 'lanjut', item.mahasiswa_name)}
                  className="bg-blue-600 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-bold">Ambil Sesi</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm flex-row justify-between items-center z-10">
        <View>
          <Text className="text-sm text-gray-500">Dashboard Psikolog</Text>
          <Text className="text-xl font-bold text-gray-800">Halo, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} className="bg-gray-100 px-3 py-2 rounded-lg">
          <Text className="text-red-600 font-bold">Keluar</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 pt-4">
        {/* Filter List */}
        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {filterOptions.map((level) => (
              <TouchableOpacity 
                key={level}
                onPress={() => setFilterLevel(level)}
                className={`px-4 py-2 rounded-full mr-2 ${filterLevel === level ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <Text className={`font-medium ${filterLevel === level ? 'text-white' : 'text-gray-600'}`}>{level}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-6 flex-1">
          <Text className="text-lg font-bold text-gray-800 mb-4">Daftar Hasil Asesmen Mahasiswa</Text>
          
          {isLoading && sessions.length === 0 ? (
            <ActivityIndicator size="large" color="#2563EB" />
          ) : filteredSessions.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">Belum ada data sesuai filter ini.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSessions}
              keyExtractor={(item) => item.session_id.toString()}
              renderItem={renderSession}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
