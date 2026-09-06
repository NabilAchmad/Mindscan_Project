import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const VERIFY_URL = 'https://nabilnih1302-mindscan-api.hf.space/api/verify-email'; 

export default function VerifyEmailScreen({ route, navigation }: any) {
  const { email } = route.params || {};
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Masukkan 6 digit kode OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(VERIFY_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': 'mindscan_secret_key_2026',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        Alert.alert('Berhasil', 'Email berhasil diverifikasi! Silakan masuk.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Gagal', data.error || 'Verifikasi gagal');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-slate-50" 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20 }}>
          <Animated.View entering={FadeInDown.duration(800).springify()} className="mb-10 items-center">
            <View className="w-20 h-20 bg-teal-100 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">✉️</Text>
            </View>
            <Text className="text-3xl font-black text-slate-800 mb-2 text-center tracking-tight">Verifikasi Email</Text>
            <Text className="text-base text-slate-500 font-medium text-center">
              Kami telah mengirimkan 6-digit kode OTP ke email <Text className="font-bold text-slate-700">{email}</Text>.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="space-y-6">
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 text-center">Kode OTP</Text>
              <TextInput
                className="w-full bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm text-slate-800 font-black text-center text-2xl tracking-widest"
                placeholder="000000"
                placeholderTextColor="#cbd5e1"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              onPress={handleVerify}
              disabled={isLoading}
              className="w-full shadow-lg shadow-teal-600/30 rounded-2xl overflow-hidden mt-4"
            >
              <LinearGradient 
                colors={isLoading ? ['#99F6E4', '#5EEAD4'] : ['#0F766E', '#0D9488']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }}
                className="py-4 items-center justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-black text-lg tracking-wide">Verifikasi Akun</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-slate-500 font-bold">Kembali ke Login</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
