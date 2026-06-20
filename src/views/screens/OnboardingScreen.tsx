import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ONBOARDING_DATA = [
  {
    title: 'Analisis Teks',
    description: 'Ceritakan perasaan Anda secara bebas. MindScan akan memahami sentimen Anda.',
    icon: '📝',
  },
  {
    title: 'Deteksi Ekspresi Wajah',
    description: 'Sistem mengenali emosi melalui wajah Anda untuk hasil yang lebih akurat.',
    icon: '📸',
  },
  {
    title: 'Rekomendasi Cerdas',
    description: 'Dapatkan tips self-help harian yang disesuaikan dengan kondisi Anda.',
    icon: '💡',
  },
  {
    title: 'Bantuan Profesional',
    description: 'Hubungkan dengan psikolog profesional kapan pun Anda butuh.',
    icon: '🤝',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-between pb-10 pt-10">
      {/* Skip Button */}
      <View className="px-6 items-end">
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text className="text-gray-500 font-medium">Lewati</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-8xl mb-8">{ONBOARDING_DATA[currentIndex].icon}</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {ONBOARDING_DATA[currentIndex].title}
        </Text>
        <Text className="text-base text-gray-600 text-center leading-6">
          {ONBOARDING_DATA[currentIndex].description}
        </Text>
      </View>

      {/* Footer Navigation */}
      <View className="px-6">
        <View className="flex-row justify-center mb-8 space-x-2">
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 rounded-full ${
                currentIndex === index ? 'bg-blue-600 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
