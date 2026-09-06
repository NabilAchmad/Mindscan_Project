import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal, ScrollView, Keyboard, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { useChatStore } from '../../viewmodels/useChatStore';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'https://nabilnih1302-mindscan-api.hf.space/api';

export default function ChatbotScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [inputText, setInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const flatListRef = React.useRef<FlatList>(null);
  
  const [showPsychologistModal, setShowPsychologistModal] = useState(false);
  const [availablePsychologists, setAvailablePsychologists] = useState<any[]>([]);
  const [isFinding, setIsFinding] = useState(false);
  
  const [realtimeEmotion, setRealtimeEmotion] = useState<string>('');
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
        setKbHeight(e.endCoordinates.height);
      });
      const hideSub = Keyboard.addListener('keyboardDidHide', () => {
        setKbHeight(0);
      });
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }
  }, []);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { messages, isTyping, sessionStatus, finalSentiment, startSession, sendMessageToBot, endSession, resetSession } = useChatStore();

  const cameraRef = React.useRef<CameraView>(null);
  const cameraContainerRef = React.useRef<View>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    
    if (user?.id) {
      resetSession(); 
      startSession(user.id);
    }
  }, [user?.id]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    
    sendMessageToBot(textToSend);
    
    if (hasPermission && sessionStatus === 'active' && cameraRef.current) {
      try {
        setRealtimeEmotion('Menganalisis...');
        
        cameraRef.current.takePictureAsync({ base64: true, quality: 0.1, shutterSound: false })
          .then(async (photo) => {
            if (!photo || !photo.base64) return;
            
            const response = await fetch(`${API_URL}/analyze-face`, {
              method: 'POST',
              headers: {
                'X-API-Key': 'mindscan_secret_key_2026',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ base64_image: photo.base64 })
            });
            
            const data = await response.json();
            if (data.status === 'success' && data.emotion) {
              setRealtimeEmotion(data.emotion);
            } else {
              setRealtimeEmotion('Wajah kurang jelas');
            }
          })
          .catch(e => {
            console.error("Camera capture error", e);
            setRealtimeEmotion('Error kamera');
          });
      } catch (e) {
        console.error("Camera setup error", e);
      }
    }
  };

  const findPsychologist = async () => {
    setIsFinding(true);
    setShowPsychologistModal(true);
    try {
      const response = await fetch(`${API_URL}/psychologists/available`, { 
        headers: { 
          'X-API-Key': 'mindscan_secret_key_2026',
          'Authorization': `Bearer ${token}` 
        } 
      });
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
        headers: {
          'X-API-Key': 'mindscan_secret_key_2026', 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          mahasiswa_id: user.id,
          psikolog_id: psikologId,
          final_score: finalSentiment
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
      <Animated.View layout={Layout.springify()} className={`mb-4 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}>
        <View className={`p-4 rounded-3xl ${isUser ? 'bg-teal-600 rounded-tr-sm shadow-md shadow-teal-600/20' : 'bg-white rounded-tl-sm shadow-sm border border-slate-100'}`}>
          <Text className={`${isUser ? 'text-white' : 'text-slate-700'} text-base leading-6`}>{item.text}</Text>
        </View>
        <Text className={`text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider ${isUser ? 'text-right mr-1' : 'text-left ml-1'}`}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Animated.View>
    );
  };

  if (hasPermission === null) return <View className="flex-1 bg-slate-50 justify-center items-center"><ActivityIndicator color="#0D9488" /></View>;
  if (hasPermission === false) return <View className="flex-1 bg-slate-50 justify-center items-center"><Text className="text-slate-500 font-medium">Akses kamera ditolak.</Text></View>;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <KeyboardAvoidingView className="flex-1" style={{ paddingBottom: Platform.OS === 'android' ? kbHeight : 0 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        
        {/* Floating Camera Window (Picture-in-Picture) */}
        {sessionStatus === 'active' && hasPermission && (
          <Animated.View 
            entering={FadeInDown.delay(300).duration(800)}
            ref={cameraContainerRef}
            className="absolute top-24 right-5 w-24 h-36 bg-slate-900 rounded-2xl overflow-hidden border-2 border-white shadow-xl shadow-slate-900/20 z-50"
            collapsable={false}
          >
            <CameraView style={{ flex: 1 }} facing="front" ref={cameraRef} />
            <View className="absolute bottom-2 left-2 right-2 bg-black/40 px-2 py-1.5 rounded-lg backdrop-blur-md items-center">
              <Text className="text-white text-[8px] font-black tracking-widest uppercase text-center" numberOfLines={1}>
                {realtimeEmotion ? realtimeEmotion : 'SCANNING...'}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Header */}
        <View className="bg-white/80 backdrop-blur-xl shadow-sm z-10 border-b border-slate-100">
          <View className="flex-row justify-between items-center px-4 py-4">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1 rounded-full bg-slate-50">
                <Ionicons name="arrow-back" size={24} color="#334155" />
              </TouchableOpacity>
              <View>
                <Text className="text-lg font-black text-slate-800 tracking-tight">MindScan AI</Text>
                <View className="flex-row items-center mt-0.5">
                  <View className="w-2 h-2 rounded-full bg-teal-500 mr-1.5" />
                  <Text className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Online</Text>
                </View>
              </View>
            </View>
            {sessionStatus === 'active' && (
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert("Akhiri Sesi", "Apakah Anda yakin ingin mengakhiri sesi curhat ini?", [
                    { text: "Batal", style: "cancel" },
                    { text: "Akhiri", style: "destructive", onPress: () => endSession() }
                  ]);
                }} 
                className="bg-rose-50 px-4 py-2 rounded-xl"
              >
                <Text className="text-rose-600 font-bold text-xs">Akhiri Sesi</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {sessionStatus === 'completed' ? (
          <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInUp.duration(800).springify()} className="bg-white p-6 rounded-[32px] shadow-xl shadow-teal-900/5 border border-slate-100 items-center mb-10">
              <View className="w-16 h-16 bg-teal-50 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl">📋</Text>
              </View>
              <Text className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">Hasil Akhir Asesmen</Text>
              <Text className="text-3xl font-black text-teal-700 mb-6 text-center">{finalSentiment}</Text>
              
              <View className="bg-amber-50 p-5 rounded-2xl border border-amber-100 w-full mb-6">
                <Text className="text-amber-800 text-[10px] font-black tracking-widest uppercase mb-2">⚠️ Pernyataan Medis</Text>
                <Text className="text-amber-700/80 text-xs leading-5 text-justify font-medium">
                  Hasil skor ini dihasilkan secara otomatis oleh algoritma AI berdasarkan analisis teks dan ekspresi wajah. Ini BUKAN diagnosis medis resmi dan tidak dapat menggantikan penilaian profesional.
                </Text>
              </View>

              {finalSentiment.includes('Berat') || finalSentiment.includes('Sedang') ? (
                <View className="w-full">
                  <Text className="text-slate-600 text-center mb-6 text-sm leading-6">Sistem mendeteksi tingkat stres yang cukup tinggi. Kami sangat menyarankan Anda untuk berbicara dengan ahlinya.</Text>
                  
                  {finalSentiment.includes('Berat') && (
                    <TouchableOpacity onPress={() => Alert.alert('SOS', 'Menghubungi layanan darurat kesehatan mental (119)...')} className="bg-rose-600 w-full rounded-2xl overflow-hidden shadow-lg shadow-rose-600/30 mb-4">
                      <LinearGradient colors={['#E11D48', '#BE123C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="py-4 items-center">
                        <Text className="text-white font-black text-base tracking-wide">🚨 SOS Darurat (119)</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={findPsychologist} className="bg-teal-600 w-full rounded-2xl overflow-hidden shadow-lg shadow-teal-600/30">
                     <LinearGradient colors={['#0F766E', '#0D9488']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="py-4 items-center">
                        <Text className="text-white font-black text-base tracking-wide">Konsultasi dengan Psikolog</Text>
                     </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="w-full bg-teal-50 p-5 rounded-2xl border border-teal-100">
                  <Text className="text-teal-800 font-black mb-3">Tips Refleksi Diri 🌱</Text>
                  <View className="space-y-2">
                    <Text className="text-teal-700 text-xs leading-5 font-medium">• Luangkan waktu 10 menit untuk relaksasi pernapasan.</Text>
                    <Text className="text-teal-700 text-xs leading-5 font-medium">• Kurangi paparan layar gawai (screen time) sebelum tidur.</Text>
                    <Text className="text-teal-700 text-xs leading-5 font-medium">• Ceritakan perasaan Anda pada jurnal atau sahabat terdekat.</Text>
                  </View>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={{ padding: 20, paddingTop: 30, flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            {isTyping && (
              <Animated.View entering={FadeInUp.duration(400)} className="px-6 pb-4">
                <View className="bg-white self-start px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                  <Text className="text-teal-600 text-xs font-bold italic tracking-wide">MindScan sedang mengetik...</Text>
                </View>
              </Animated.View>
            )}
            <View className="p-4 bg-white border-t border-slate-100 flex-row items-center shadow-lg shadow-slate-900/5 pb-8">
              <TextInput
                className="flex-1 bg-slate-50 px-5 py-3.5 rounded-full mr-3 text-sm text-slate-800 font-medium border border-slate-200"
                placeholder="Ketik perasaan Anda..."
                placeholderTextColor="#94a3b8"
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
                className={`w-12 h-12 rounded-full items-center justify-center shadow-sm ${!inputText.trim() || isTyping ? 'bg-slate-200' : 'bg-teal-600 shadow-teal-600/40'}`}
              >
                <Ionicons name="send" size={18} color={!inputText.trim() || isTyping ? '#94a3b8' : 'white'} className="ml-1" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Modal Psikolog */}
        <Modal visible={showPsychologistModal} transparent animationType="slide">
          <View className="flex-1 justify-end bg-slate-900/40 backdrop-blur-sm">
            <View className="bg-white rounded-t-[40px] p-8 min-h-[60%] shadow-2xl">
              <View className="flex-row justify-between items-center mb-8">
                <View>
                  <Text className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Tersedia Saat Ini</Text>
                  <Text className="text-2xl font-black text-slate-800">Pilih Psikolog</Text>
                </View>
                <TouchableOpacity onPress={() => setShowPsychologistModal(false)} className="bg-slate-100 p-2 rounded-full">
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {isFinding ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#0D9488" />
                  <Text className="text-slate-500 font-medium mt-4 text-sm">Mencari psikolog terbaik...</Text>
                </View>
              ) : availablePsychologists.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                  <Text className="text-5xl mb-4">💤</Text>
                  <Text className="text-slate-500 text-center font-medium leading-6">Maaf, saat ini tidak ada psikolog yang tersedia. Silakan coba beberapa saat lagi.</Text>
                </View>
              ) : (
                <FlatList
                  data={availablePsychologists}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
                      <View className="flex-row items-center justify-between bg-white p-5 rounded-3xl mb-4 border border-slate-100 shadow-sm">
                        <View className="flex-1 pr-4">
                          <Text className="font-black text-slate-800 text-lg mb-1">{item.name}</Text>
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {item.active_patients} Pasien Aktif
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          onPress={() => startConsultation(item.id, item.name)}
                          className="bg-teal-50 px-5 py-3 rounded-2xl border border-teal-100"
                        >
                          <Text className="text-teal-700 font-bold">Chat</Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
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
