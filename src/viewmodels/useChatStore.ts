import { create } from 'zustand';
import axios from 'axios';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (text: string, sender: 'user' | 'bot') => void;
  sendMessageToBot: (text: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: '0',
      sender: 'bot',
      text: 'Halo! Saya chatbot MindScan. Ceritakan apa yang sedang Anda rasakan saat ini.',
      timestamp: new Date(),
    }
  ],
  isTyping: false,
  
  addMessage: (text, sender) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },

  sendMessageToBot: async (text) => {
    const { addMessage } = get();
    
    // Tambahkan pesan user ke UI
    addMessage(text, 'user');
    
    // Tampilkan indikator bot sedang mengetik
    set({ isTyping: true });

    try {
      // Menggunakan IPv4 Address laptop Anda agar bisa diakses dari HP
      const API_URL = 'http://10.60.80.72:5000/api/analyze-text'; 
      
      const response = await axios.post(API_URL, {
        text: text,
      });

      // Misalkan bot mengembalikan field 'message' atau 'bot_reply'
      const botReply = response.data?.bot_reply || response.data?.message || 'Maaf, saya tidak mengerti.';
      
      addMessage(botReply, 'bot');
    } catch (error) {
      console.error("Error calling backend:", error);
      addMessage('Maaf, sistem sedang mengalami gangguan koneksi.', 'bot');
    } finally {
      set({ isTyping: false });
    }
  },
}));
