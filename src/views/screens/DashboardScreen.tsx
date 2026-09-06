import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import { useIsFocused } from '@react-navigation/native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE = 'https://nabilnih1302-mindscan-api.hf.space/api';

export default function DashboardScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
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
          'X-API-Key': 'mindscan_secret_key_2026',
          'Authorization': `Bearer ${token}`,
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
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 pt-16 pb-12 rounded-b-[40px] shadow-lg shadow-teal-900/20">
          <LinearGradient 
            colors={['#0F766E', '#0D9488']} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
          />
          <View className="flex-row justify-between items-start mb-8">
            <Animated.View entering={FadeInDown.duration(600)}>
              <Text className="text-teal-100 text-sm font-medium mb-1 tracking-wider uppercase">Selamat Datang Kembali,</Text>
              <Text className="text-3xl font-black text-white tracking-tight">{user?.name}</Text>
            </Animated.View>
            <TouchableOpacity onPress={handleLogout} className="bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Text className="text-white font-bold text-xs tracking-wide">Keluar</Text>
            </TouchableOpacity>
          </View>
          
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <TouchableOpacity 
              activeOpacity={0.9}
              className="w-full bg-white rounded-3xl p-5 flex-row items-center justify-between shadow-xl shadow-teal-900/10"
              onPress={() => navigation.navigate('Chatbot')}
            >
              <View className="flex-1">
                <View className="bg-teal-50 self-start px-3 py-1 rounded-full mb-3">
                  <Text className="text-teal-700 text-xs font-bold uppercase tracking-widest">Sesi Baru</Text>
                </View>
                <Text className="text-slate-800 font-black text-2xl mb-1">Mulai Curhat</Text>
                <Text className="text-slate-500 text-sm leading-5">Ceritakan perasaanmu hari ini dengan AI pendamping kami</Text>
              </View>
              <View className="w-16 h-16 bg-teal-50 rounded-2xl items-center justify-center ml-4 transform rotate-3">
                <Text className="text-3xl">🌿</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Secondary Actions */}
        <View className="px-6 -mt-4 mb-8">
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <TouchableOpacity 
              activeOpacity={0.9}
              className="w-full bg-indigo-600 rounded-3xl p-5 flex-row items-center justify-between shadow-lg shadow-indigo-600/30"
            onPress={() => navigation.navigate('RealtimeExpression')}
          >
            <View className="flex-1">
              <Text className="text-white font-black text-xl mb-1">Live Scanner</Text>
              <Text className="text-indigo-200 text-sm leading-5">Analisis instan 52 otot wajah Anda secara real-time</Text>
            </View>
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center ml-4 backdrop-blur-md">
              <Text className="text-xl">📸</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            className="w-full bg-white border border-slate-100 rounded-3xl p-5 flex-row items-center justify-between shadow-sm mt-4"
            onPress={() => navigation.navigate('StudentConsultationList')}
          >
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-lg mb-1">Riwayat Konsultasi</Text>
              <Text className="text-slate-500 text-xs">Lanjutkan obrolan dengan psikolog Anda</Text>
            </View>
            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center ml-4">
              <Text className="text-lg">💬</Text>
            </View>
          </TouchableOpacity>
          </Animated.View>
        </View>

        {/* History Section */}
        <View className="px-6 flex-1">
          <Text className="text-lg font-black text-slate-800 mb-4 tracking-tight">Riwayat Sesi AI Anda</Text>
          
          {isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color="#0D9488" />
            </View>
          ) : history.length === 0 ? (
            <Animated.View entering={FadeIn.duration(800)}>
              <View className="bg-white rounded-3xl p-8 items-center border border-slate-100 shadow-sm mt-2">
                <View className="w-20 h-20 bg-teal-50 rounded-full items-center justify-center mb-4">
                  <Text className="text-4xl">🪴</Text>
                </View>
                <Text className="text-lg font-bold text-slate-800 mb-2 text-center">Belum Ada Riwayat</Text>
                <Text className="text-slate-500 text-center text-sm leading-6">
                  Anda belum pernah melakukan sesi curhat. Tekan tombol "Mulai Curhat" untuk memulai perjalanan Anda.
                </Text>
              </View>
            </Animated.View>
          ) : (
            history.map((item, index) => (
              <Animated.View 
                key={item.id} 
                entering={FadeInDown.delay(300 + (index * 100)).duration(500)}
                style={{ marginBottom: 12 }}
              >
                <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-row justify-between items-center">
                  <View>
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{item.date}</Text>
                    <Text className="text-base font-black text-slate-800">{item.anxiety_level}</Text>
                  </View>
                  <View className={`px-4 py-2 rounded-full ${
                    item.anxiety_level.includes('Berat') ? 'bg-red-50' :
                    item.anxiety_level.includes('Sedang') ? 'bg-orange-50' : 'bg-teal-50'
                  }`}>
                    <Text className={`text-xs font-bold ${
                      item.anxiety_level.includes('Berat') ? 'text-red-600' :
                      item.anxiety_level.includes('Sedang') ? 'text-orange-600' : 'text-teal-600'
                    }`}>Selesai</Text>
                  </View>
                </View>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
