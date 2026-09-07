import React from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  buttonText?: string;
}

const { width } = Dimensions.get('window');

export default function CustomAlert({ 
  visible, 
  title, 
  message, 
  type = 'info', 
  onClose,
  buttonText = 'Oke'
}: CustomAlertProps) {
  
  if (!visible) return null;

  const getIcon = () => {
    switch(type) {
      case 'success': return <Ionicons name="checkmark-circle" size={56} color="#0D9488" />;
      case 'error': return <Ionicons name="close-circle" size={56} color="#E11D48" />;
      case 'info': return <Ionicons name="information-circle" size={56} color="#3B82F6" />;
    }
  };

  const getGradient = () => {
    switch(type) {
      case 'success': return ['#0F766E', '#14B8A6'] as const;
      case 'error': return ['#BE123C', '#F43F5E'] as const;
      case 'info': return ['#1D4ED8', '#3B82F6'] as const;
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View 
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
      >
        <Animated.View 
          entering={ZoomIn.duration(300).springify()}
          exiting={ZoomOut.duration(200)}
          className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
          style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 15,
          }}
        >
          {/* Header Graphic Background */}
          <View className="h-24 w-full bg-slate-50 items-center justify-end relative">
            <View className="absolute -top-10 w-32 h-32 rounded-full bg-white/40 blur-2xl" />
            <View className="absolute top-8 bg-white rounded-full p-2" style={{ transform: [{ translateY: 20 }], zIndex: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
              {getIcon()}
            </View>
          </View>

          {/* Content */}
          <View className="px-6 pt-12 pb-6 items-center">
            <Text className="text-2xl font-black text-slate-800 text-center mb-3 tracking-tight">
              {title}
            </Text>
            <Text className="text-base text-slate-500 text-center leading-relaxed font-medium">
              {message}
            </Text>
          </View>

          {/* Action Button */}
          <View className="px-6 pb-6 pt-2">
            <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
              <LinearGradient 
                colors={getGradient()} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }}
                className="py-4 rounded-2xl items-center shadow-md shadow-teal-500/20"
              >
                <Text className="text-white font-bold text-lg tracking-wide">{buttonText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
