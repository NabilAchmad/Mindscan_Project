import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import { useDashboardStore } from '../../viewmodels/useDashboardStore';

export default function DashboardScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { currentMoodScore, moodStatus, history, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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

        {/* Card Info */}
        <View className="px-6 -mt-8">
          <View className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-500 font-medium">MOOD SCORE</Text>
              <Text className="text-3xl">😊</Text>
            </View>
            <View className="flex-row items-end mb-2">
              <Text className="text-5xl font-bold text-gray-800">{currentMoodScore}</Text>
              <Text className="text-gray-400 mb-1 ml-1">/100</Text>
            </View>
            <View className="bg-green-100 self-start px-3 py-1 rounded-full">
              <Text className="text-green-700 font-medium">{moodStatus}</Text>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View className="px-6 mt-8">
          <TouchableOpacity 
            onPress={() => navigation.navigate('Chatbot')}
            className="bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-300"
          >
            <Text className="text-white font-bold text-lg">Mulai Assessment</Text>
          </TouchableOpacity>
        </View>

        {/* History List */}
        <View className="px-6 mt-10">
          <Text className="text-xl font-bold text-gray-800 mb-4">Riwayat Terakhir</Text>
          {history.length > 0 ? (
            history.map((item) => (
              <View key={item.id} className="bg-white p-4 rounded-2xl mb-3 flex-row justify-between items-center shadow-sm border border-gray-100">
                <View>
                  <Text className="text-gray-800 font-bold text-lg mb-1">{item.status}</Text>
                  <Text className="text-gray-500 text-sm">{item.date}</Text>
                </View>
                <View className="bg-gray-50 px-4 py-2 rounded-xl">
                  <Text className="text-blue-600 font-bold">{item.moodScore}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-center mt-4">Belum ada riwayat sesi.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
