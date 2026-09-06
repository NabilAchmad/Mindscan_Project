import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    title: 'Analisis Sentimen Teks',
    description: 'Ceritakan perasaan Anda secara bebas. AI MindScan akan memahami makna di balik kata-kata Anda secara mendalam.',
    icon: '💬',
  },
  {
    title: 'Live Face Scanner',
    description: 'Kenali emosi tersembunyi. Sistem memindai 52 otot wajah Anda secara real-time untuk akurasi tinggi.',
    icon: '📸',
  },
  {
    title: 'Rekomendasi Cerdas',
    description: 'Dapatkan tips self-help harian yang disesuaikan secara khusus dengan kondisi mental Anda saat ini.',
    icon: '💡',
  },
  {
    title: 'Bantuan Profesional',
    description: 'Terhubung langsung dengan psikolog bersertifikat kapan pun Anda merasa butuh tempat bersandar.',
    icon: '👨‍⚕️',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const setHasSeenOnboarding = useAuthStore((state) => state.setHasSeenOnboarding);

  const handleComplete = () => {
    setHasSeenOnboarding(true);
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <LinearGradient colors={['#F0FDF4', '#CCFBF1', '#F8FAFC']} className="flex-1">
      <SafeAreaView className="flex-1 justify-between pb-10 pt-4">
        {/* Skip Button */}
        <View className="px-6 items-end z-10">
          <TouchableOpacity onPress={handleComplete} className="bg-teal-900/5 px-4 py-2 rounded-full">
            <Text className="text-teal-700 font-bold text-sm">Lewati</Text>
          </TouchableOpacity>
        </View>

        {/* Content Wrapper */}
        <View className="flex-1 justify-center items-center px-6">
          <Animated.View 
            key={currentIndex} 
            entering={FadeInRight.duration(500)} 
            exiting={FadeOutLeft.duration(300)}
            layout={Layout.springify()}
            className="items-center w-full"
          >
            <View className="w-40 h-40 bg-white rounded-[40px] shadow-xl items-center justify-center border border-white mb-10 transform -rotate-3">
              <Text style={{ fontSize: 80 }}>{ONBOARDING_DATA[currentIndex].icon}</Text>
            </View>
            
            <Text className="text-3xl font-black text-slate-800 mb-4 text-center tracking-tight">
              {ONBOARDING_DATA[currentIndex].title}
            </Text>
            
            <Text className="text-base font-medium text-slate-500 text-center leading-7 px-4">
              {ONBOARDING_DATA[currentIndex].description}
            </Text>
          </Animated.View>
        </View>

        {/* Footer Navigation */}
        <View className="px-6 w-full">
          {/* Pagination Indicators */}
          <View className="flex-row justify-center mb-10 space-x-2">
            {ONBOARDING_DATA.map((_, index) => (
              <Animated.View
                key={index}
                layout={Layout.springify()}
                className={`h-2 rounded-full ${
                  currentIndex === index ? 'bg-teal-600 w-8' : 'bg-teal-200 w-2'
                }`}
              />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.8}
            className="w-full shadow-lg shadow-teal-600/30 rounded-2xl overflow-hidden"
          >
            <LinearGradient 
              colors={['#0F766E', '#0D9488']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }}
              className="py-4 items-center justify-center"
            >
              <Text className="text-white font-black text-lg tracking-wide">
                {currentIndex === ONBOARDING_DATA.length - 1 ? 'Mulai Perjalanan' : 'Selanjutnya'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
