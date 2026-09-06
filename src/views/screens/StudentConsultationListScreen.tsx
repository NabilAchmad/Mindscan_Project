import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';

const API_BASE = 'https://nabilnih1302-mindscan-api.hf.space/api'; 

export default function StudentConsultationListScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isFocused = useIsFocused();
  
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConsultations = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/student/${user.id}/consultations`, {
        headers: {
          'X-API-Key': 'mindscan_secret_key_2026',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        }
      });
      const textResponse = await response.text();
      let data;
      try {
          data = JSON.parse(textResponse);
      } catch(e) {
          console.error("Not a JSON response:", textResponse);
          return;
      }

      if (data.status === 'success') {
        setConsultations(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchConsultations();
    }
  }, [isFocused]);

  const renderConsultation = ({ item, index }: { item: any, index: number }) => {
    const isClosed = item.status === 'closed';
    return (
      <Animated.View layout={Layout.springify()} entering={FadeInUp.delay(index * 100).duration(600).springify()}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ConsultationChat', { 
            sessionId: item.consultation_id, 
            partnerName: item.psikolog_name,
            status: item.status
          })}
          activeOpacity={0.7}
          className={`bg-white p-5 rounded-[24px] mb-4 border ${isClosed ? 'border-slate-200 opacity-80' : 'border-teal-100 shadow-lg shadow-teal-900/5'} flex-row items-center justify-between`}
        >
          <View className="flex-1 pr-4">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{item.start_time}</Text>
            <Text className={`text-lg font-black ${isClosed ? 'text-slate-600' : 'text-slate-800'}`}>Dr. {item.psikolog_name}</Text>
            <View className="flex-row items-center mt-2">
              <View className={`w-2 h-2 rounded-full mr-2 ${isClosed ? 'bg-slate-300' : 'bg-teal-500'}`} />
              <Text className={`text-xs font-bold uppercase tracking-wide ${isClosed ? 'text-slate-500' : 'text-teal-600'}`}>
                {isClosed ? 'Sesi Selesai (Arsip)' : 'Konsultasi Aktif'}
              </Text>
            </View>
          </View>
          <View className={`${isClosed ? 'bg-slate-50' : 'bg-teal-50'} w-12 h-12 rounded-full items-center justify-center`}>
            <Ionicons name="chatbubble-ellipses" size={24} color={isClosed ? '#94a3b8' : '#0D9488'} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Animated.View entering={FadeInDown.duration(600)} className="bg-white/80 backdrop-blur-xl px-6 py-5 shadow-sm flex-row items-center border-b border-slate-100 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 rounded-full bg-slate-50">
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-800 tracking-tight">Riwayat Chat Psikolog</Text>
      </Animated.View>
      
      <View className="flex-1 px-6 pt-6">
        {isLoading ? (
          <ActivityIndicator size="large" color="#0D9488" className="mt-10" />
        ) : consultations.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(600)} className="mt-20 items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <View className="w-16 h-16 bg-teal-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="chatbubbles-outline" size={32} color="#0D9488" />
            </View>
            <Text className="text-slate-800 text-lg font-bold mb-2">Belum ada obrolan</Text>
            <Text className="text-slate-500 text-center text-sm leading-6">Riwayat konsultasi dengan psikolog akan muncul di sini.</Text>
          </Animated.View>
        ) : (
          <FlatList
            data={consultations}
            keyExtractor={(item) => item.consultation_id.toString()}
            renderItem={renderConsultation}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
