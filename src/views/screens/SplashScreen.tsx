import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useAuthStore } from '../../viewmodels/useAuthStore';

export default function SplashScreen({ navigation }: any) {
  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);

  useEffect(() => {
    // Navigate after 2.5 seconds based on onboarding status
    const timer = setTimeout(() => {
      if (hasSeenOnboarding) {
        navigation.replace('Login');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation, hasSeenOnboarding]);

  return (
    <View className="flex-1 bg-blue-600 justify-center items-center px-6">
      <View className="w-32 h-32 bg-white rounded-3xl justify-center items-center mb-6 shadow-xl overflow-hidden border-2 border-blue-200">
        <Image 
          source={require('../../../assets/mindscan_logo.png')} 
          style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
        />
      </View>
      <Text className="text-white text-3xl font-bold text-center mb-2">MindScan</Text>
      <Text className="text-blue-100 text-base text-center">Ruang Aman Anda untuk Kesadaran Kesehatan Mental</Text>
    </View>
  );
}
