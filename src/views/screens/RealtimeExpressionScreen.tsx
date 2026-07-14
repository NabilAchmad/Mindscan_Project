import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

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
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Interval otomatis setiap 800ms untuk Real-time Scanner
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (hasPermission && isScanning) {
      intervalId = setInterval(async () => {
        if (cameraRef.current) {
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
          }
        }
      }, 800); // 800ms cukup optimal agar tidak membuat HP panas (1 FPS+)
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [hasPermission, isScanning]);

  const getEmotionEmoji = (em: string) => {
    const text = em.toLowerCase();
    if (text.includes('senang')) return '😁';
    if (text.includes('sedih')) return '😢';
    if (text.includes('marah')) return '😡';
    if (text.includes('jijik')) return '🤢';
    if (text.includes('takut')) return '😨';
    if (text.includes('terkejut')) return '😲';
    if (text.includes('netral')) return '😐';
    return '👤';
  };

  const getEmotionColor = (em: string) => {
    const text = em.toLowerCase();
    if (text.includes('senang')) return 'bg-green-500';
    if (text.includes('sedih')) return 'bg-blue-500';
    if (text.includes('marah')) return 'bg-red-500';
    if (text.includes('jijik')) return 'bg-green-800';
    if (text.includes('takut')) return 'bg-purple-500';
    if (text.includes('terkejut')) return 'bg-yellow-500';
    if (text.includes('netral')) return 'bg-gray-500';
    return 'bg-blue-600';
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-lg font-bold">Akses kamera ditolak.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView style={{ flex: 1 }} facing="front" ref={cameraRef} />

      <SafeAreaView className="absolute top-0 left-0 right-0 z-50">
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="w-12 h-12 bg-black/40 rounded-full items-center justify-center backdrop-blur-md border border-white/20"
          >
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          
          <View className="bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 flex-row items-center">
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            <Text className="text-white font-bold text-xs tracking-wider">LIVE SCAN</Text>
          </View>
          
          <View className="w-12 h-12" />
        </View>
      </SafeAreaView>

      <View className="absolute bottom-10 left-6 right-6 z-50">
        <View className={`rounded-3xl p-6 shadow-2xl ${getEmotionColor(emotion)} border-4 border-white/20 backdrop-blur-lg`}>
          <Text className="text-white/80 text-center font-bold text-sm tracking-widest mb-2 uppercase">Ekspresi Terdeteksi</Text>
          <View className="flex-row justify-center items-center">
            <Text className="text-6xl mr-4">{getEmotionEmoji(emotion)}</Text>
            <Text className="text-white text-4xl font-black">{emotion.split(' ')[0]}</Text>
          </View>
          <Text className="text-white/90 text-center text-xs mt-4">MindScan Face Blendshapes AI</Text>
        </View>

        <TouchableOpacity 
          onPress={() => setIsScanning(!isScanning)}
          className="mt-6 bg-white/20 rounded-full py-4 border border-white/40"
        >
          <Text className="text-white text-center font-bold text-lg">
            {isScanning ? "⏸ Jeda Pemindaian" : "▶ Lanjutkan Pemindaian"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
