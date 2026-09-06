import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, ScrollView, Keyboard, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const API_URL = 'https://nabilnih1302-mindscan-api.hf.space/api/consultation'; 

export default function ConsultationChatScreen({ route, navigation }: any) {
  const { sessionId, partnerName, status, mahasiswaId } = route.params;
  const user = useAuthStore((state) => state.user);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const showSub = Keyboard.addListener('keyboardDidShow', (e: any) => {
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

  useEffect(() => {
    fetchMessages();
    
    socketRef.current = io('https://nabilnih1302-mindscan-api.hf.space');
    
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join_consultation', { session_id: sessionId });
    });

    socketRef.current.on('receive_message', (newMsg: any) => {
      setMessages((prev) => {
        const isOptimistic = prev.find(m => m.sender_id === newMsg.sender_id && m.text === newMsg.text && newMsg.id !== m.id && m.id > 1000000000000);
        if (isOptimistic) {
          return prev.map(m => m === isOptimistic ? newMsg : m);
        }
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/${sessionId}/messages`, { 
        headers: { 
          'X-API-Key': 'mindscan_secret_key_2026', 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        } 
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMessages(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    const textToSend = inputText.trim();
    setInputText(''); 

    const tempMsg = {
      id: Date.now(),
      sender_id: user.id,
      text: textToSend,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);

    socketRef.current?.emit('send_message', {
      session_id: sessionId,
      sender_id: user.id,
      text: textToSend
    });
  };

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.sender_id === user?.id;
    const date = new Date(item.created_at);
    
    return (
      <Animated.View layout={Layout.springify()} entering={FadeInUp.delay(Math.min(index * 50, 500)).springify()} className={`mb-4 max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
        <View className={`p-4 rounded-3xl shadow-sm ${isMe ? 'bg-teal-600 rounded-tr-sm shadow-teal-600/20' : 'bg-white rounded-tl-sm border border-slate-100'}`}>
          <Text className={`${isMe ? 'text-white' : 'text-slate-700'} text-base leading-6`}>{item.text}</Text>
        </View>
        <Text className={`text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider ${isMe ? 'text-right mr-1' : 'text-left ml-1'}`}>
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Animated.View>
    );
  };

  const fetchAssessment = async () => {
    if (!mahasiswaId) return;
    try {
      const response = await fetch(`https://nabilnih1302-mindscan-api.hf.space/api/psychologist/student_assessment/${mahasiswaId}`, {
        headers: { 
          'X-API-Key': 'mindscan_secret_key_2026', 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setAssessmentData(data);
        setShowAssessment(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <KeyboardAvoidingView 
        className="flex-1" 
        style={{ paddingBottom: Platform.OS === 'android' ? kbHeight : 0 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className="bg-white/90 backdrop-blur-md px-4 py-4 shadow-sm z-10 flex-row items-center border-b border-slate-100 justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1 rounded-full bg-slate-50">
              <Ionicons name="arrow-back" size={24} color="#334155" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-0.5">Konsultasi Live</Text>
              <Text className="text-lg font-black text-slate-800" numberOfLines={1}>{partnerName}</Text>
            </View>
          </View>
          
          {user?.role === 'psikolog' && mahasiswaId && (
            <TouchableOpacity 
              onPress={fetchAssessment}
              className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm"
            >
              <Text className="text-indigo-700 font-bold text-xs uppercase tracking-wide">Asesmen</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Chat List */}
        {isLoading && messages.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0D9488" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 20, paddingTop: 30, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input Area */}
        <Animated.View layout={Layout.springify()} className="bg-white px-5 py-4 border-t border-slate-100 flex-row items-end shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          {status === 'closed' ? (
            <View className="flex-1 bg-rose-50 rounded-2xl px-5 py-4 border border-rose-100 items-center">
              <Text className="text-rose-600 font-bold text-sm tracking-wide">Sesi Konsultasi Selesai</Text>
            </View>
          ) : (
            <>
              <TextInput
                className="flex-1 bg-slate-50 rounded-3xl px-5 py-3.5 text-sm text-slate-800 font-medium border border-slate-200 max-h-32 min-h-[50px]"
                placeholder="Tulis pesan..."
                placeholderTextColor="#94a3b8"
                value={inputText}
                onChangeText={setInputText}
                multiline
                onFocus={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsInputFocused(true);
                }}
                onBlur={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsInputFocused(false);
                }}
              />
              <TouchableOpacity 
                onPress={handleSend}
                disabled={!inputText.trim()}
                className={`w-12 h-12 rounded-full items-center justify-center shadow-sm ml-3 mb-0.5 ${inputText.trim() ? 'bg-teal-600 shadow-teal-600/30' : 'bg-slate-200'}`}
              >
                <Ionicons name="send" size={18} color={inputText.trim() ? "white" : "#94a3b8"} className="ml-1" />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Assessment Modal */}
      <Modal visible={showAssessment} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-slate-900/40 backdrop-blur-sm">
          <View className="bg-white rounded-t-[40px] h-[85%] px-8 pt-8 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">MindScan AI</Text>
                <Text className="text-2xl font-black text-slate-800">Hasil Asesmen</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAssessment(false)} className="p-2 bg-slate-100 rounded-full">
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            {assessmentData ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <Animated.View entering={FadeInDown.duration(600).springify()} className="bg-indigo-50 p-6 rounded-[24px] mb-8 border border-indigo-100">
                  <Text className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Tingkat Kecemasan</Text>
                  <Text className="text-3xl font-black text-indigo-700 mb-2">{assessmentData.anxiety_level}</Text>
                  <Text className="text-xs font-medium text-indigo-400">Selesai pada: {assessmentData.date}</Text>
                </Animated.View>
                
                <Text className="font-black text-slate-800 text-lg mb-4">Riwayat Chat Asesmen</Text>
                {assessmentData.messages.map((msg: any, index: number) => (
                  <Animated.View key={index} entering={FadeInUp.delay(index * 50).duration(500)} className={`mb-4 max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                    <View className={`p-4 rounded-3xl ${msg.sender === 'user' ? 'bg-slate-100 rounded-tr-sm border border-slate-200' : 'bg-indigo-50 rounded-tl-sm border border-indigo-100'}`}>
                      <Text className={`text-sm leading-6 ${msg.sender === 'user' ? 'text-slate-700' : 'text-indigo-900 font-medium'}`}>{msg.text}</Text>
                    </View>
                    <Text className={`text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider ${msg.sender === 'user' ? 'text-right mr-1' : 'text-left ml-1'}`}>{msg.time}</Text>
                  </Animated.View>
                ))}
              </ScrollView>
            ) : (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="text-slate-500 font-medium mt-4 text-sm">Memuat data asesmen...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
