import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert from '../../components/CustomAlert';

const API_URL = 'https://nabilnih1302-mindscan-api.hf.space/api/login'; 

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' as 'success'|'error'|'info', action: () => {} });

  const handleLogin = async () => {
    if (!email || !password) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Email dan password harus diisi',
        type: 'error',
        action: () => {}
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': 'mindscan_secret_key_2026',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        login(data.user, data.token);
      } else if (data.status === 'unverified') {
        setAlertConfig({
          visible: true,
          title: 'Belum Terverifikasi',
          message: 'Email Anda belum diverifikasi. Kami telah mengirimkan OTP baru.',
          type: 'info',
          action: () => navigation.navigate('VerifyEmail', { email: email })
        });
      } else {
        setAlertConfig({
          visible: true,
          title: 'Login Gagal',
          message: data.error || 'Terjadi kesalahan',
          type: 'error',
          action: () => {}
        });
      }
    } catch (error) {
      console.error(error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Gagal terhubung ke server',
        type: 'error',
        action: () => {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAwareScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, flexGrow: 1, justifyContent: 'center' }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
      >
          <Animated.View entering={FadeInDown.duration(800).springify()} className="mb-10">
            <View className="w-16 h-16 bg-teal-100 rounded-3xl items-center justify-center mb-6 transform -rotate-6">
              <Text className="text-3xl">🌿</Text>
            </View>
            <Text className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Selamat Datang</Text>
            <Text className="text-base text-slate-500 font-medium">Masuk untuk melanjutkan ke MindScan</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="space-y-5">
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</Text>
              <TextInput
                className="w-full bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm text-slate-800 font-medium"
                placeholder="Masukkan email Anda"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Kata Sandi</Text>
            <View className="flex-row items-center w-full bg-white px-5 rounded-2xl border border-slate-100 shadow-sm">
              <TextInput
                className="flex-1 py-4 text-slate-800 font-medium"
                placeholder="Masukkan kata sandi"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                className="ml-2 py-4" 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

            <TouchableOpacity className="items-end mt-1">
              <Text className="text-teal-600 font-bold text-sm">Lupa Kata Sandi?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="w-full shadow-lg shadow-teal-600/30 rounded-2xl overflow-hidden mt-6"
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
                  <Text className="text-white font-black text-lg tracking-wide">Masuk</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500 font-medium">Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-teal-600 font-bold">Daftar sekarang</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
      </KeyboardAwareScrollView>
      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          alertConfig.action();
        }}
      />
    </SafeAreaView>
  );
}
