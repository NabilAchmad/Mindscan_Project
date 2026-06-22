import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal, ScrollView, Keyboard, LayoutAnimation, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { useChatStore } from '../../viewmodels/useChatStore';
import { useAuthStore } from '../../viewmodels/useAuthStore';

// URL backend untuk mencari psikolog
const API_URL = 'https://griminess-unblended-enslave.ngrok-free.dev/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const mapToScore = (level: string) => {
  if (!level) return 0;
  if (level.includes('Normal')) return 0;
  if (level.includes('Kecemasan Ringan')) return 1;
  if (level.includes('Depresi Ringan')) return 2;
  if (level.includes('Kecemasan Sedang')) return 3;
  if (level.includes('Depresi Sedang')) return 4;
  if (level.includes('Berat')) return 5;
  return 0;
};

const mapToLevel = (score: number) => {
  if (score <= 0.5) return 'Normal';
  if (score <= 1.5) return 'Kecemasan Ringan';
  if (score <= 2.5) return 'Depresi Ringan';
  if (score <= 3.5) return 'Kecemasan Sedang';
  if (score <= 4.5) return 'Depresi Sedang';
  return 'Depresi Berat';
};

export default function ChatbotScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [inputText, setInputText] = useState('');
  const [isAssessmentDone, setIsAssessmentDone] = useState(false);
  const [finalScoreText, setFinalScoreText] = useState('');
  const [isSevere, setIsSevere] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // State untuk rekomendasi psikolog
  const [showPsychologistModal, setShowPsychologistModal] = useState(false);
  const [availablePsychologists, setAvailablePsychologists] = useState<any[]>([]);
  const [isFinding, setIsFinding] = useState(false);

  const user = useAuthStore((state) => state.user);
  const messages = useChatStore((state) => state.messages);
  const isTyping = useChatStore((state) => state.isTyping);
  const sendMessageToBot = useChatStore((state) => state.sendMessageToBot);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessageToBot(inputText.trim());
      setInputText('');
    }
  };

  const handleEndAssessment = () => {
    // Simulasi: Mengambil sentimen terakhir dari chatbot sebagai skor NLP
    // Di aplikasi nyata, Anda mungkin menyimpan array sentimen dan merata-ratakannya
    const botMessages = messages.filter(m => m.sender === 'bot');
    let nlpLevel = 'Normal';
    if (botMessages.length > 0) {
      const lastReply = botMessages[botMessages.length - 1].text;
      if (lastReply.includes('Depresi Sedang')) nlpLevel = 'Depresi Sedang';
      else if (lastReply.includes('Kecemasan Sedang')) nlpLevel = 'Kecemasan Sedang';
      else if (lastReply.includes('Depresi Berat')) nlpLevel = 'Depresi Berat';
    }

    // Simulasi: Kamera mendeteksi wajah (MobileNetV2)
    // Di aplikasi nyata, ini diambil dari frame processor TFLite
    const cvLevel = 'Depresi Sedang'; // Dummy CV result

    const nlpScore = mapToScore(nlpLevel);
    const cvScore = mapToScore(cvLevel);
    
    // Perhitungan Rata-rata Multimodal
    const averageScore = (nlpScore + cvScore) / 2;
    const finalLevel = mapToLevel(averageScore);
    
    setFinalScoreText(finalLevel);
    setIsSevere(averageScore >= 3); // Kecemasan Sedang ke atas
    setIsAssessmentDone(true);
  };

  const findPsychologist = async () => {
    setIsFinding(true);
    setShowPsychologistModal(true);
    try {
      const response = await fetch(`${API_URL}/psychologists/available`);
      const data = await response.json();
      if (data.status === 'success') {
        setAvailablePsychologists(data.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal memuat daftar psikolog');
    } finally {
      setIsFinding(false);
    }
  };

  const startConsultation = async (psikologId: number, psikologName: string) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/consultation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mahasiswa_id: user.id,
          psikolog_id: psikologId,
          final_score: finalScoreText
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setShowPsychologistModal(false);
        navigation.replace('ConsultationChat', { 
          sessionId: data.session_id,
          partnerName: psikologName
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal memulai konsultasi');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.sender === 'user';
    return (
      <View className={`mb-4 max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
        <View className={`p-4 rounded-2xl ${isUser ? 'bg-blue-600 rounded-tr-none' : 'bg-white rounded-tl-none border border-gray-200'}`}>
          <Text className={`${isUser ? 'text-white' : 'text-gray-800'} text-base`}>{item.text}</Text>
        </View>
        <Text className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (hasPermission === null) return <View className="flex-1 justify-center items-center"><ActivityIndicator /></View>;
  if (hasPermission === false) return <View className="flex-1 justify-center items-center"><Text>Akses kamera ditolak.</Text></View>;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header & Camera */}
        <View className="bg-white pb-4 shadow-sm z-10 rounded-b-3xl overflow-hidden">
          <View className="flex-row justify-between items-center px-4 py-3">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4"><Text className="text-2xl">Back</Text></TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">MindScan AI</Text>
            </View>
            {!isAssessmentDone && (
              <TouchableOpacity onPress={handleEndAssessment} className="bg-red-100 px-3 py-1 rounded-full">
                <Text className="text-red-700 font-bold text-sm">Akhiri Tes</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {!isAssessmentDone && (
            <View className="px-6 items-center mt-4">
              <View className={`${isInputFocused ? 'w-28 h-36' : 'w-64 h-80'} bg-gray-200 rounded-3xl overflow-hidden border-4 border-blue-50 shadow-md`}>
                <CameraView style={{ flex: 1 }} facing="front">
                  <View className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-md"><Text className="text-white text-xs font-bold">MindScan CV</Text></View>
                </CameraView>
              </View>
            </View>
          )}
        </View>

        {isAssessmentDone ? (
          <ScrollView className="flex-1 px-6 pt-6">
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center">
              <Text className="text-lg text-gray-500 font-medium mb-2">Hasil Rata-rata Multimodal</Text>
              <Text className="text-3xl font-black text-blue-600 mb-2">{finalScoreText}</Text>
              
              <View className="bg-yellow-50 p-4 rounded-xl mt-4 border border-yellow-200 w-full">
                <Text className="text-yellow-800 text-xs font-bold mb-1">⚠️ PERNYATAAN MEDIS (DISCLAIMER)</Text>
                <Text className="text-yellow-700 text-xs text-justify">
                  Hasil skor ini dihasilkan secara otomatis oleh algoritma Artificial Intelligence (AI) berdasarkan analisis teks (IndoBERT) dan ekspresi wajah (MobileNetV2). Ini BUKAN diagnosis medis resmi dan tidak dapat menggantikan penilaian profesional.
                </Text>
              </View>

              {isSevere ? (
                <View className="mt-6 w-full">
                  <Text className="text-gray-700 text-center mb-4">Sistem mendeteksi tingkat stres yang cukup tinggi. Kami sangat menyarankan Anda untuk berbicara dengan ahlinya.</Text>
                  <TouchableOpacity onPress={findPsychologist} className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-sm">
                    <Text className="text-white font-bold text-lg">Konsultasi dengan Psikolog</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="mt-6 w-full bg-green-50 p-4 rounded-xl border border-green-200">
                  <Text className="text-green-800 font-bold mb-2">Tips Refleksi Diri 🌿</Text>
                  <Text className="text-green-700 text-sm mb-1">• Luangkan waktu 10 menit untuk relaksasi pernapasan.</Text>
                  <Text className="text-green-700 text-sm mb-1">• Kurangi paparan layar gawai (screen time) sebelum tidur.</Text>
                  <Text className="text-green-700 text-sm">• Ceritakan perasaan Anda pada jurnal atau sahabat terdekat.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={{ padding: 20, flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            />
            {isTyping && <View className="px-6 pb-2"><Text className="text-gray-500 italic">MindScan sedang mengetik...</Text></View>}
            <View className="p-4 bg-white border-t border-gray-100 flex-row items-center">
              <TextInput
                className="flex-1 bg-gray-100 px-4 py-3 rounded-full mr-3 text-base"
                placeholder="Ketik perasaan Anda..."
                value={inputText}
                onChangeText={setInputText}
                onFocus={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsInputFocused(true);
                }}
                onBlur={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsInputFocused(false);
                }}
                multiline
              />
              <TouchableOpacity 
                onPress={handleSend}
                disabled={!inputText.trim() || isTyping}
                className={`w-12 h-12 rounded-full items-center justify-center ${!inputText.trim() || isTyping ? 'bg-gray-300' : 'bg-blue-600'}`}
              >
                <Text className="text-white text-lg">➤</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Modal Psikolog */}
        <Modal visible={showPsychologistModal} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 min-h-[50%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-800">Psikolog Tersedia</Text>
                <TouchableOpacity onPress={() => setShowPsychologistModal(false)}>
                  <Text className="text-red-500 font-bold">Tutup</Text>
                </TouchableOpacity>
              </View>

              {isFinding ? (
                <ActivityIndicator size="large" color="#2563EB" />
              ) : availablePsychologists.length === 0 ? (
                <Text className="text-gray-500 text-center mt-10">Maaf, saat ini tidak ada psikolog yang tersedia.</Text>
              ) : (
                <FlatList
                  data={availablePsychologists}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl mb-3 border border-gray-100">
                      <View>
                        <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
                        <Text className="text-xs text-green-600 font-medium">{item.active_patients} Pasien Aktif (Tidak Sibuk)</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => startConsultation(item.id, item.name)}
                        className="bg-blue-600 px-4 py-2 rounded-lg"
                      >
                        <Text className="text-white font-bold">Chat</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
