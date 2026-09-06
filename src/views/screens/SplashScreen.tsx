import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
    <LinearGradient 
      colors={['#0F766E', '#0D9488', '#14B8A6']} 
      className="flex-1 justify-center items-center px-6"
    >
      <Animated.View 
        entering={FadeIn.duration(1000)} 
        className="w-36 h-36 bg-white/90 rounded-[40px] justify-center items-center mb-8 shadow-2xl overflow-hidden border border-white/40 backdrop-blur-md"
      >
        <Image 
          source={require('../../../assets/mindscan_logo.png')} 
          style={{ width: '80%', height: '80%', resizeMode: 'contain' }} 
        />
      </Animated.View>
      <Animated.Text 
        entering={SlideInDown.delay(300).duration(800)} 
        className="text-white text-4xl font-black text-center mb-3 tracking-tight"
      >
        MindScan
      </Animated.Text>
      <Animated.Text 
        entering={SlideInDown.delay(500).duration(800)} 
        className="text-teal-100 text-sm font-medium text-center px-4 leading-5"
      >
        Ruang Aman Anda untuk Kesadaran Kesehatan Mental
      </Animated.Text>
    </LinearGradient>
  );
}
