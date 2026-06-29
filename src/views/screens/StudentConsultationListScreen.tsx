import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'https://nabilnih1302-mindscan-api.hf.space/api'; 

export default function StudentConsultationListScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const isFocused = useIsFocused();
  
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConsultations = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/student/${user.id}/consultations`, {
        headers: {
          'X-API-Key': 'mindscan_secret_key_2026', 'ngrok-skip-browser-warning': 'true' }
      });
      const textResponse = await response.text();
      let data;
      try {
          data = JSON.parse(textResponse);
      } catch(e) {
          console.error("Not a JSON response:", textResponse);
          // Abaikan data jika bukan JSON (contoh: ngrok expired HTML)
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

  const renderConsultation = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ConsultationChat', { 
        sessionId: item.consultation_id, 
        partnerName: item.psikolog_name,
        status: item.status
      })}
      className={`bg-white p-4 rounded-xl mb-4 border ${item.status === 'closed' ? 'border-gray-300 opacity-80' : 'border-gray-100'} shadow-sm flex-row items-center justify-between`}
    >
      <View>
        <Text className="text-gray-500 text-xs font-medium mb-1">{item.start_time}</Text>
        <Text className="text-lg font-bold text-gray-800">Dr. {item.psikolog_name}</Text>
        <Text className={`text-sm font-medium mt-1 ${item.status === 'closed' ? 'text-gray-500' : 'text-blue-600'}`}>
          {item.status === 'closed' ? 'Sesi Selesai (Arsip)' : 'Konsultasi Aktif'}
        </Text>
      </View>
      <View className={`${item.status === 'closed' ? 'bg-gray-100' : 'bg-blue-50'} p-3 rounded-full`}>
        <Text className={`${item.status === 'closed' ? 'text-gray-500' : 'text-blue-600'} text-lg`}>💬</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm flex-row items-center border-b border-gray-100 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#4B5563" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Riwayat Chat Psikolog</Text>
      </View>
      
      <View className="flex-1 px-6 pt-6">
        {isLoading ? (
          <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
        ) : consultations.length === 0 ? (
          <View className="mt-20 items-center">
            <Text className="text-4xl mb-4">💬</Text>
            <Text className="text-gray-500 text-center text-base">Belum ada obrolan aktif dengan psikolog.</Text>
          </View>
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
