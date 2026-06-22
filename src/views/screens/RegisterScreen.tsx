import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'https://griminess-unblended-enslave.ngrok-free.dev/api/register';

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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 40, flexGrow: 1, justifyContent: 'center' }}>
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Buat Akun</Text>
          <Text className="text-gray-500">Mulai perjalanan kesehatan mental Anda</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Nama Lengkap</Text>
            <TextInput
              className="w-full bg-black-100 px-4 py-3 rounded-xl border border-gray-200"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
            <TextInput
              className="w-full bg-black-100 px-4 py-3 rounded-xl border border-gray-200"
              placeholder="Masukkan email Anda"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Kata Sandi</Text>
            <TextInput
              className="w-full bg-black-100 px-4 py-3 rounded-xl border border-gray-200"
              placeholder="Buat kata sandi"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Daftar Sebagai</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setRole('mahasiswa')}
                className={`flex-1 py-3 rounded-xl border ${role === 'mahasiswa' ? 'bg-blue-50 border-blue-600' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`text-center font-medium ${role === 'mahasiswa' ? 'text-blue-700' : 'text-gray-600'}`}>Mahasiswa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setRole('psikolog')}
                className={`flex-1 py-3 rounded-xl border ${role === 'psikolog' ? 'bg-blue-50 border-blue-600' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`text-center font-medium ${role === 'psikolog' ? 'text-blue-700' : 'text-gray-600'}`}>Psikolog</Text>
              </TouchableOpacity>
            </View>
          </View>

          {role === 'psikolog' && (
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Nomor SIPP (Surat Izin Praktik Psikologi)</Text>
              <TextInput
                className="w-full bg-black-100 px-4 py-3 rounded-xl border border-gray-200"
                placeholder="Masukkan Nomor SIPP Anda"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
              />
            </View>
          )}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl items-center mt-6 ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Daftar</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-blue-600 font-bold">Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
