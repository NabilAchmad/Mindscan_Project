import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../viewmodels/useAuthStore';

// Sesuaikan dengan IP address backend Anda
const API_URL = 'https://griminess-unblended-enslave.ngrok-free.dev/api/psychologist'; 

export default function PsychologistDashboardScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Polling data setiap 5 detik agar real-time jika ada pasien masuk
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/${user.id}/sessions`);
      const data = await response.json();
      if (data.status === 'success') {
        setSessions(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: string) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score.includes('Ringan')) return 'bg-yellow-100 text-yellow-800';
    if (score.includes('Sedang')) return 'bg-orange-100 text-orange-800';
    if (score.includes('Berat')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const renderSession = ({ item }: { item: any }) => (
    <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-lg font-bold text-gray-800">{item.mahasiswa_name}</Text>
          <Text className="text-sm text-gray-500">{item.mahasiswa_email}</Text>
        </View>
        <View className={`px-2 py-1 rounded-md ${getScoreColor(item.final_score)}`}>
          <Text className="text-xs font-bold">{item.final_score || 'Menunggu'}</Text>
        </View>
      </View>
      
      <View className="flex-row justify-between items-center mt-4">
        <Text className="text-xs text-gray-400">Status: {item.status === 'active' ? 'Aktif' : 'Selesai'}</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ConsultationChat', { 
            sessionId: item.session_id,
            partnerName: item.mahasiswa_name
          })}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-bold">Buka Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

      <View className="flex-1 px-6 pt-6">
        <Text className="text-lg font-bold text-gray-800 mb-4">Daftar Pasien Anda</Text>
        
        {isLoading && sessions.length === 0 ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : sessions.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">Belum ada pasien yang dialokasikan ke Anda.</Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.session_id.toString()}
            renderItem={renderSession}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
