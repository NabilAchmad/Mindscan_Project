import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../components/CustomAlert';

const VERIFY_URL = 'https://nabilnih1302-mindscan-api.hf.space/api/verify-email';
const RESEND_URL = 'https://nabilnih1302-mindscan-api.hf.space/api/resend-otp';

export default function VerifyEmailScreen({ route, navigation }: any) {
  const { email } = route.params || {};
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' as 'success' | 'error' | 'info', action: () => { } });
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      const response = await fetch(RESEND_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': 'mindscan_secret_key_2026',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setAlertConfig({
          visible: true,
          title: 'Berhasil',
          message: 'Kode OTP baru telah dikirim ke email Anda.',
          type: 'success',
          action: () => { }
        });
        setCountdown(30); // Restart countdown
      } else {
        setAlertConfig({
          visible: true,
          title: 'Gagal',
          message: data.error || 'Gagal mengirim ulang OTP',
          type: 'error',
          action: () => { }
        });
      }
    } catch (error) {
      console.error(error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Gagal terhubung ke server',
        type: 'error',
        action: () => { }
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Masukkan 6 digit kode OTP',
        type: 'error',
        action: () => { }
      });
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
        setAlertConfig({
          visible: true,
          title: 'Verifikasi Berhasil',
          message: 'Email Anda telah berhasil diverifikasi. Silakan login.',
          type: 'success',
          action: () => navigation.navigate('Login')
        });
      } else {
        setAlertConfig({
          visible: true,
          title: 'Gagal',
          message: data.error || 'Verifikasi gagal',
          type: 'error',
          action: () => { }
        });
      }
    } catch (error) {
      console.error(error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Gagal terhubung ke server',
        type: 'error',
        action: () => { }
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

          <View className="flex-row justify-center mt-6 items-center flex-col space-y-4">
            {countdown > 0 ? (
              <Text className="text-slate-500 font-medium">
                Kirim ulang kode dalam <Text className="font-bold text-teal-600">{countdown} detik</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                <Text className="text-teal-600 font-bold text-base">
                  {isResending ? 'Mengirim ulang...' : 'Kirim Ulang Kode OTP'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-4">
              <Text className="text-slate-500 font-bold">Kembali ke Login</Text>
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
