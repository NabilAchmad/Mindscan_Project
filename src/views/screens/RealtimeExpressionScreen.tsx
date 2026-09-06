import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Reanimated, { FadeInDown, FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const API_URL = 'https://nabilnih1302-mindscan-api.hf.space/api';

export default function RealtimeExpressionScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [emotion, setEmotion] = useState<string>('Mendeteksi...');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animasi detak jantung (pulse) untuk UI indikator
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const isCapturing = useRef(false);

  // Interval otomatis setiap 800ms untuk Real-time Scanner
  useEffect(() => {
    let intervalId: any;

    if (hasPermission && isScanning) {
      intervalId = setInterval(async () => {
        if (cameraRef.current && !isCapturing.current) {
          isCapturing.current = true;
          try {
            // Mengambil gambar secara background (silent & low quality)
            const photo = await cameraRef.current.takePictureAsync({ 
              base64: true, 
              quality: 0.1, 
              shutterSound: false 
            });
            
            if (photo && photo.base64) {
              const response = await fetch(`${API_URL}/analyze-face`, {
                method: 'POST',
                headers: {
                  'X-API-Key': 'mindscan_secret_key_2026',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ base64_image: photo.base64 })
              });
              
              const data = await response.json();
              if (data.status === 'success' && data.emotion) {
                setEmotion(data.emotion);
              } else {
                setEmotion('Wajah tidak terlihat');
              }
            }
          } catch (e) {
            console.error("Scanner Error:", e);
          } finally {
            isCapturing.current = false;
          }
        }
      }, 800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [hasPermission, isScanning]);

  const getEmotionEmoji = (em: string) => {
    const text = em.toLowerCase();
    if (text.includes('senang')) return '😊';
    if (text.includes('sedih')) return '😔';
    if (text.includes('marah')) return '😠';
    if (text.includes('jijik')) return '🤢';
    if (text.includes('takut')) return '😨';
    if (text.includes('terkejut')) return '😲';
    if (text.includes('netral')) return '😐';
    return '👤';
  };

  const getEmotionColors = (em: string) => {
    const text = em.toLowerCase();
    if (text.includes('senang')) return ['#10B981', '#059669']; // Emerald
    if (text.includes('sedih')) return ['#3B82F6', '#2563EB']; // Blue
    if (text.includes('marah')) return ['#EF4444', '#DC2626']; // Red
    if (text.includes('jijik')) return ['#84CC16', '#65A30D']; // Lime
    if (text.includes('takut')) return ['#8B5CF6', '#7C3AED']; // Violet
    if (text.includes('terkejut')) return ['#F59E0B', '#D97706']; // Amber
    if (text.includes('netral')) return ['#64748B', '#475569']; // Slate
    return ['#0F766E', '#0D9488']; // Default Teal
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900 px-6">
        <Text className="text-white text-lg font-bold text-center">Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView style={{ flex: 1 }} facing="front" ref={cameraRef} />

      {/* Header Overlay */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-50 pointer-events-box-none">
        <Reanimated.View entering={FadeInDown.duration(800)} className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="w-12 h-12 rounded-full items-center justify-center overflow-hidden border border-white/20"
          >
            <BlurView intensity={20} tint="dark" className="absolute inset-0" />
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View className="rounded-full overflow-hidden border border-white/20 flex-row items-center">
             <BlurView intensity={20} tint="dark" className="absolute inset-0" />
             <View className="px-4 py-2 flex-row items-center">
              <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: isScanning ? 1 : 0 }} className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
              <Text className="text-white font-bold text-[10px] tracking-widest uppercase">{isScanning ? 'LIVE SCAN' : 'PAUSED'}</Text>
             </View>
          </View>
          
          <View className="w-12 h-12" />
        </Reanimated.View>
      </SafeAreaView>

      {/* Bottom Overlay */}
      <View className="absolute bottom-10 left-6 right-6 z-50">
        <Reanimated.View 
          key={emotion} // Force re-render animation when emotion changes
          entering={FadeInUp.duration(400)} 
          layout={Layout.springify()}
          className="rounded-[32px] overflow-hidden border border-white/20 shadow-2xl mb-6"
        >
          <BlurView intensity={40} tint="dark" className="absolute inset-0" />
          <LinearGradient 
            colors={getEmotionColors(emotion) as [string, string]} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={{ opacity: 0.85 }}
            className="p-6 items-center"
          >
            <Text className="text-white/80 font-bold text-[10px] tracking-widest mb-3 uppercase">Ekspresi Terdeteksi</Text>
            <View className="flex-row justify-center items-center">
              <View className="bg-white/20 w-16 h-16 rounded-2xl items-center justify-center mr-4">
                <Text className="text-4xl">{getEmotionEmoji(emotion)}</Text>
              </View>
              <Text className="text-white text-3xl font-black capitalize tracking-tight">{emotion.split(' ')[0]}</Text>
            </View>
            <Text className="text-white/60 font-medium text-[10px] uppercase tracking-widest mt-5">MindScan Face Blendshapes AI</Text>
          </LinearGradient>
        </Reanimated.View>

        <Reanimated.View entering={FadeInUp.delay(200).duration(800)}>
          <TouchableOpacity 
            onPress={() => setIsScanning(!isScanning)}
            className="rounded-2xl overflow-hidden border border-white/30"
          >
            <BlurView intensity={20} tint="dark" className="absolute inset-0" />
            <View className={`py-4 items-center justify-center flex-row ${!isScanning ? 'bg-white/10' : ''}`}>
              <Ionicons name={isScanning ? "pause" : "play"} size={20} color="white" className="mr-2" />
              <Text className="text-white font-bold text-sm tracking-wide uppercase">
                {isScanning ? "Jeda Pemindaian" : "Lanjutkan Pemindaian"}
              </Text>
            </View>
          </TouchableOpacity>
        </Reanimated.View>
      </View>
    </View>
  );
}
