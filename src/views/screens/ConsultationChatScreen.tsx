import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../viewmodels/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';

const API_URL = 'https://nabilnih1302-mindscan-api.hf.space/api/consultation'; 

export default function ConsultationChatScreen({ route, navigation }: any) {
  const { sessionId, partnerName, status, mahasiswaId } = route.params;
  const user = useAuthStore((state) => state.user);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
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
        // Prevent duplicate if it's our own optimistic message
        const isOptimistic = prev.find(m => m.sender_id === newMsg.sender_id && m.text === newMsg.text && newMsg.id !== m.id && m.id > 1000000000000);
        if (isOptimistic) {
          return prev.map(m => m === isOptimistic ? newMsg : m);
        }
        // Avoid inserting if it already exists
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
    setInputText(''); // Optimistic clear

    // Optimistic update
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

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === user?.id;
    const date = new Date(item.created_at);
    
    return (
      <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
        <View className={`p-3 rounded-2xl ${isMe ? 'bg-blue-600 rounded-tr-none' : 'bg-white rounded-tl-none border border-gray-200'}`}>
          <Text className={`${isMe ? 'text-white' : 'text-gray-800'} text-base`}>{item.text}</Text>
        </View>
        <Text className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAvoidingView 
        className="flex-1" 
        style={{ paddingBottom: Platform.OS === 'android' ? kbHeight : 0 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className="bg-white px-4 py-3 shadow-sm z-10 flex-row items-center border-b border-gray-100 justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-gray-100 rounded-full">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-sm text-gray-500">Konsultasi dengan</Text>
              <Text className="text-lg font-bold text-gray-800">{partnerName}</Text>
            </View>
          </View>
          
          {user?.role === 'psikolog' && mahasiswaId && (
            <TouchableOpacity 
              onPress={fetchAssessment}
              className="bg-blue-100 px-3 py-2 rounded-lg"
            >
              <Text className="text-blue-700 font-medium text-xs">Lihat Asesmen</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Chat List */}
        {isLoading && messages.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 20, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input Area */}
        <View className="bg-white px-4 py-3 border-t border-gray-100 flex-row items-end">
          {status === 'closed' ? (
            <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 items-center">
              <Text className="text-gray-500 font-medium">Sesi ini telah selesai.</Text>
            </View>
          ) : (
            <>
              <TextInput
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-base text-gray-800 max-h-32 min-h-[48px]"
                placeholder="Tulis pesan..."
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity 
                onPress={handleSend}
                disabled={!inputText.trim()}
                className={`ml-3 p-3 rounded-full mb-1 ${inputText.trim() ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Assessment Modal */}
      <Modal visible={showAssessment} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl h-[80%] px-6 pt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Hasil Asesmen Pasien</Text>
              <TouchableOpacity onPress={() => setShowAssessment(false)} className="p-2 bg-gray-100 rounded-full">
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
            
            {assessmentData ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="bg-blue-50 p-4 rounded-xl mb-4">
                  <Text className="text-sm text-gray-500">Tingkat Kecemasan</Text>
                  <Text className="text-xl font-bold text-blue-700">{assessmentData.anxiety_level}</Text>
                  <Text className="text-xs text-gray-500 mt-1">Selesai pada: {assessmentData.date}</Text>
                </View>
                
                <Text className="font-bold text-gray-800 mb-3">Riwayat Chat Asesmen:</Text>
                {assessmentData.messages.map((msg: any, index: number) => (
                  <View key={index} className={`mb-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                    <View className={`p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-gray-200 rounded-tr-none' : 'bg-blue-100 rounded-tl-none'}`}>
                      <Text className="text-gray-800">{msg.text}</Text>
                    </View>
                    <Text className={`text-xs text-gray-400 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>{msg.time}</Text>
                  </View>
                ))}
                <View className="h-10" />
              </ScrollView>
            ) : (
              <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
