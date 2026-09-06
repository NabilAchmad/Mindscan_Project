import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'https://nabilnih1302-mindscan-api.hf.space/api/register';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'mahasiswa' | 'psikolog'>('mahasiswa');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Semua kolom wajib diisi');
      return;
    }

    if (role === 'psikolog' && !licenseNumber) {
      Alert.alert('Error', 'Nomor SIPP wajib diisi untuk Psikolog');
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
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          role,
          license_number: role === 'psikolog' ? licenseNumber : undefined
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        Alert.alert('Berhasil', 'Pendaftaran berhasil. Silakan masuk.');
        navigation.goBack();
      } else {
        Alert.alert('Gagal', data.error || 'Pendaftaran gagal');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, flexGrow: 1, justifyContent: 'center' }}>
          
          <Animated.View entering={FadeInDown.duration(800).springify()} className="mb-8">
            <View className="w-16 h-16 bg-teal-100 rounded-3xl items-center justify-center mb-4 transform -rotate-3">
              <Text className="text-3xl">✨</Text>
            </View>
            <Text className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Buat Akun</Text>
            <Text className="text-base text-slate-500 font-medium">Mulai perjalanan kesehatan mental Anda</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="space-y-4">
            
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</Text>
              <TextInput
                className="w-full bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm text-slate-800 font-medium"
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

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
              <TextInput
                className="w-full bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm text-slate-800 font-medium"
                placeholder="Buat kata sandi"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View className="mt-2">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Daftar Sebagai</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={() => setRole('mahasiswa')}
                  className={`flex-1 py-4 rounded-2xl border shadow-sm ${role === 'mahasiswa' ? 'bg-teal-50 border-teal-500' : 'bg-white border-slate-100'}`}
                >
                  <Text className={`text-center font-bold ${role === 'mahasiswa' ? 'text-teal-700' : 'text-slate-500'}`}>Mahasiswa</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => setRole('psikolog')}
                  className={`flex-1 py-4 rounded-2xl border shadow-sm ${role === 'psikolog' ? 'bg-teal-50 border-teal-500' : 'bg-white border-slate-100'}`}
                >
                  <Text className={`text-center font-bold ${role === 'psikolog' ? 'text-teal-700' : 'text-slate-500'}`}>Psikolog</Text>
                </TouchableOpacity>
              </View>
            </View>

            {role === 'psikolog' && (
              <Animated.View entering={FadeInDown.duration(400)} className="mt-2">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nomor SIPP</Text>
                <TextInput
                  className="w-full bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm text-slate-800 font-medium"
                  placeholder="Surat Izin Praktik Psikologi"
                  placeholderTextColor="#94a3b8"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                />
              </Animated.View>
            )}

            <TouchableOpacity
              onPress={handleRegister}
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
                  <Text className="text-white font-black text-lg tracking-wide">Daftar Sekarang</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500 font-medium">Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text className="text-teal-600 font-bold">Masuk di sini</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
