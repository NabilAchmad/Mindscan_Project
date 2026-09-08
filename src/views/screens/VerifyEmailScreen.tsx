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
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6 shadow-sm border border-slate-50">
            <View className="w-16 h-16 bg-teal-50 rounded-full items-center justify-center">
              <Ionicons name="mail-unread-outline" size={32} color="#0D9488" />
            </View>
          </View>
          <Text className="text-3xl font-bold text-slate-800 mb-3 text-center tracking-tight">Verifikasi Email</Text>
          <Text className="text-sm text-slate-500 font-medium text-center leading-relaxed px-4">
            Kami telah mengirimkan 6-digit kode OTP ke email <Text className="font-bold text-slate-800">{email}</Text>. Silakan periksa kotak masuk atau folder spam Anda.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="space-y-6">
          <View>
            <TextInput
              className="w-full bg-white px-5 py-5 rounded-2xl border border-slate-200 text-slate-800 font-bold text-center text-3xl tracking-[10px]"
              placeholder="••••••"
              placeholderTextColor="#e2e8f0"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              style={{ letterSpacing: 12 }}
            />
          </View>

          <TouchableOpacity
            onPress={handleVerify}
            disabled={isLoading}
            className="w-full mt-2"
          >
            <View
              className={`py-4 items-center justify-center rounded-2xl ${isLoading ? 'bg-teal-300' : 'bg-teal-600'}`}
              style={{ shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-base tracking-wide">Verifikasi Akun</Text>
              )}
            </View>
          </TouchableOpacity>

          <View className="flex-col justify-center mt-6 items-center space-y-4">
            {countdown > 0 ? (
              <Text className="text-sm text-slate-400 font-medium">
                Kirim ulang kode dalam <Text className="font-bold text-teal-600">{countdown}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                <Text className="text-teal-600 font-bold text-sm">
                  {isResending ? 'Mengirim ulang...' : 'Kirim Ulang Kode OTP'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-2 py-2">
              <Text className="text-slate-400 font-medium text-sm">Kembali ke halaman <Text className="font-bold text-slate-600">Login</Text></Text>
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
