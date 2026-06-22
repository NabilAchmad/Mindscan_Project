import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import { useIsFocused } from '@react-navigation/native';

const API_BASE = 'https://griminess-unblended-enslave.ngrok-free.dev/api';

export default function DashboardScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isFocused = useIsFocused();
  
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    logout();
  };

  const fetchHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/student/history/${user.id}`);
      const data = await response.json();
      if (data.status === 'success') {
        setHistory(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchHistory();
    }
  }, [isFocused]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-blue-600 px-6 pt-6 pb-12 rounded-b-[40px]">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-blue-100 text-lg">Selamat pagi,</Text>
              <Text className="text-white text-2xl font-bold">{user?.name || 'Mahasiswa'}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} className="bg-white/20 p-2 rounded-full">
              <Text className="text-white">Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center mt-20">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : history.length === 0 ? (
          <View className="flex-1 px-6 mt-10 items-center justify-center">
            <View className="bg-blue-50 w-40 h-40 rounded-full items-center justify-center mb-6">
              <Text className="text-6xl">📝</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">Belum Ada Riwayat Tes</Text>
            <Text className="text-gray-500 text-center mb-10 px-4 leading-6">
              Anda belum pernah melakukan asesmen kesehatan mental. Mulai asesmen pertama Anda sekarang untuk mengetahui tingkat stres dan kecemasan Anda.
            </Text>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Chatbot')}
              className="bg-blue-600 w-full py-4 rounded-2xl items-center shadow-lg shadow-blue-300"
            >
              <Text className="text-white font-bold text-lg">Mulai Asesmen Sekarang</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 mt-6 flex-1">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Riwayat Asesmen</Text>
            </View>
            
            {history.map((item) => (
              <View key={item.id} className="bg-white p-4 rounded-2xl mb-4 border border-gray-100 shadow-sm flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-500 text-sm mb-1">{item.date}</Text>
                  <Text className="text-lg font-bold text-gray-800">{item.anxiety_level}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${
                  item.anxiety_level.includes('Berat') ? 'bg-red-100' :
                  item.anxiety_level.includes('Sedang') ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <Text className={`text-xs font-bold ${
                    item.anxiety_level.includes('Berat') ? 'text-red-700' :
                    item.anxiety_level.includes('Sedang') ? 'text-yellow-700' : 'text-green-700'
                  }`}>Selesai</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity 
              onPress={() => navigation.navigate('Chatbot')}
              className="bg-blue-600 w-full py-4 rounded-2xl items-center shadow-lg shadow-blue-300 mt-6"
            >
              <Text className="text-white font-bold text-lg">Mulai Asesmen Baru</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
