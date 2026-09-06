import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE = 'https://nabilnih1302-mindscan-api.hf.space/api'; 

export default function PsychologistDashboardScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
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
      const response = await fetch(`${API_BASE}/psychologist/assessments`, { 
        headers: { 
          'X-API-Key': 'mindscan_secret_key_2026',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        } 
      });
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
          'X-API-Key': 'mindscan_secret_key_2026', 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
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
            mahasiswaId: sessionId 
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
    if (!score) return 'bg-slate-100 text-slate-500';
    if (score.includes('Ringan')) return 'bg-yellow-100 text-yellow-700';
    if (score.includes('Sedang')) return 'bg-orange-100 text-orange-700';
    if (score.includes('Berat')) return 'bg-red-100 text-red-700';
    return 'bg-teal-100 text-teal-700';
  };

  const filteredSessions = sessions.filter(s => filterLevel === 'Semua' || s.anxiety_level === filterLevel);

  const renderSession = ({ item, index }: { item: any; index: number }) => {
    const isHandledByOther = item.handled_by !== null && item.handled_by !== user?.name;
    const isHandledByMe = item.handled_by === user?.name;

    return (
      <View 
        className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-3">
            <Text className="text-lg font-black text-slate-800">{item.mahasiswa_name}</Text>
            <Text className="text-sm font-medium text-slate-500">{item.mahasiswa_email}</Text>
          </View>
          <View className={`px-3 py-1.5 rounded-full ${getScoreColor(item.anxiety_level)}`}>
            <Text className="text-xs font-black tracking-wide">{item.anxiety_level || 'Menunggu'}</Text>
          </View>
        </View>
        
        {isHandledByOther ? (
          <View className="mt-3 bg-slate-50 p-3 rounded-2xl items-center border border-slate-100">
            <Text className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Ditangani oleh: <Text className="text-slate-700">{item.psychologist_name || item.handled_by}</Text>
            </Text>
          </View>
        ) : (
          <View className="flex-row justify-between items-center mt-4 border-t border-slate-100 pt-4">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {item.status === 'completed' && isHandledByMe ? 'Sedang Anda tangani' : item.status}
            </Text>
            
            <View className="flex-row">
              {isHandledByMe ? (
                <>
                  {item.status !== 'closed' && (
                    <TouchableOpacity 
                      onPress={() => handleFeedback(item.session_id, 'selesai', item.mahasiswa_name)}
                      className="bg-slate-100 px-4 py-2.5 rounded-xl mr-2"
                    >
                      <Text className="text-slate-600 font-bold">Selesai</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('ConsultationChat', { 
                      sessionId: item.session_id, 
                      partnerName: item.mahasiswa_name,
                      status: item.status,
                      mahasiswaId: item.mahasiswa_id
                    })}
                    className="bg-teal-600 px-4 py-2.5 rounded-xl flex-row items-center shadow-md shadow-teal-600/30"
                  >
                    <Ionicons name="chatbubble" size={16} color="white" className="mr-1" />
                    <Text className="text-white font-bold ml-1">
                      {item.status === 'closed' ? 'Arsip' : 'Lanjut'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  onPress={() => handleFeedback(item.session_id, 'lanjut', item.mahasiswa_name)}
                  className="bg-indigo-600 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/30"
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
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <LinearGradient 
        colors={['#4F46E5', '#4338CA']} 
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        className="pt-16 pb-6 px-6 rounded-b-[40px] shadow-lg shadow-indigo-900/20 z-10"
      >
        <SafeAreaView edges={['top']} className="flex-row justify-between items-center">
          <View>
            <Text className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-1">Ruang Praktik</Text>
            <Text className="text-2xl font-black text-white tracking-tight">Halo, {user?.name}</Text>
          </View>
          <TouchableOpacity onPress={logout} className="bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">
            <Text className="text-white font-bold text-xs tracking-wide">Keluar</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <View className="flex-1 pt-6">
        {/* Filter List */}
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}>
            {filterOptions.map((level) => (
              <TouchableOpacity 
                key={level}
                onPress={() => setFilterLevel(level)}
                className={`px-5 py-2.5 rounded-full border ${
                  filterLevel === level 
                    ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-600/30' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`font-bold text-sm ${filterLevel === level ? 'text-white' : 'text-slate-500'}`}>{level}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-6 flex-1">
          <Text className="text-lg font-black text-slate-800 mb-4 tracking-tight">Antrean Asesmen Mahasiswa</Text>
          
          {isLoading && sessions.length === 0 ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>
          ) : filteredSessions.length === 0 ? (
            <View className="flex-1 items-center justify-center -mt-20">
              <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-4">
                <Text className="text-5xl">☕</Text>
              </View>
              <Text className="text-lg font-bold text-slate-700 mb-2">Belum ada pasien</Text>
              <Text className="text-slate-500 text-center px-6">Tidak ada data asesmen mahasiswa untuk filter saat ini. Waktunya istirahat sejenak!</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSessions}
              keyExtractor={(item) => item.session_id.toString()}
              renderItem={renderSession}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
