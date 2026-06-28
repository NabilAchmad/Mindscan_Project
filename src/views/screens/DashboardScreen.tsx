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
      const response = await fetch(`${API_BASE}/student/history/${user.id}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      const textResponse = await response.text();
      try {
        const data = JSON.parse(textResponse);
        if (data.status === 'success') {
          setHistory(data.data);
        }
      } catch (parseError) {
        console.error("Dashboard API Error (Not JSON):", textResponse.substring(0, 100));
        // Abaikan data jika bukan JSON (contoh: ngrok expired HTML)
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
        <View className="bg-white px-6 py-8 rounded-b-3xl shadow-sm mb-6 border-b border-gray-100">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-gray-500 text-sm mb-1">Selamat datang kembali,</Text>
              <Text className="text-2xl font-black text-gray-800 tracking-tight">{user?.name}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} className="bg-red-50 px-3 py-2 rounded-xl border border-red-100">
              <Text className="text-red-600 font-bold text-xs">Keluar</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            className="w-full bg-blue-600 rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
            onPress={() => navigation.navigate('Chatbot')}
          >
            <View className="flex-1">
              <Text className="text-white font-black text-xl mb-1">Mulai Curhat</Text>
              <Text className="text-blue-100 text-sm">Ceritakan perasaanmu hari ini dengan AI kami</Text>
            </View>
            <View className="bg-white/20 p-3 rounded-full ml-4">
              <Text className="text-2xl">🤖</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full bg-white border border-blue-200 rounded-2xl p-4 flex-row items-center justify-between shadow-sm mt-3"
            onPress={() => navigation.navigate('StudentConsultationList')}
          >
            <View className="flex-1">
              <Text className="text-blue-700 font-bold text-lg mb-1">Riwayat Chat Psikolog</Text>
              <Text className="text-gray-500 text-xs">Lanjutkan sesi obrolan dengan psikolog Anda</Text>
            </View>
            <View className="bg-blue-50 p-3 rounded-full ml-4">
              <Text className="text-xl">💬</Text>
            </View>
          </TouchableOpacity>
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
