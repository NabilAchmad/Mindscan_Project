import { create } from 'zustand';
import axios from 'axios';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatState {
  sessionId: number | null;
  sessionStatus: 'active' | 'completed' | 'error';
  finalSentiment: string;
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (text: string, sender: 'user' | 'bot') => void;
  startSession: (userId: string | number) => Promise<void>;
  sendMessageToBot: (text: string) => Promise<void>;
  resetSession: () => void;
}

const API_BASE = 'https://griminess-unblended-enslave.ngrok-free.dev/api';

export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: null,
  sessionStatus: 'active',
  finalSentiment: '',
  messages: [],
  isTyping: false,
  
  resetSession: () => set({ sessionId: null, sessionStatus: 'active', messages: [], finalSentiment: '' }),
  
  addMessage: (text, sender) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },

  startSession: async (userId: string | number) => {
    set({ isTyping: true, messages: [] });
    try {
      const response = await axios.post(`${API_BASE}/chatbot/start`, { user_id: userId });
      const { session_id, bot_reply } = response.data;
      set({ sessionId: session_id });
      get().addMessage(bot_reply, 'bot');
    } catch (error) {
      console.error("Error starting session:", error);
      get().addMessage('Maaf, gagal memulai sesi.', 'bot');
    } finally {
      set({ isTyping: false });
    }
  },

  sendMessageToBot: async (text) => {
    const { addMessage, sessionId } = get();
    
    // Tambahkan pesan user ke UI
    addMessage(text, 'user');
    
    // Tampilkan indikator bot sedang mengetik
    set({ isTyping: true });

    try {
      const response = await axios.post(`${API_BASE}/analyze-text`, {
        text: text,
        session_id: sessionId
      });

      const data = response.data;
      const botReply = data.bot_reply || 'Maaf, saya tidak mengerti.';
      const sessionStatus = data.session_status || 'active';
      const sentiment = data.sentiment_detected || '';
      
      addMessage(botReply, 'bot');
      set({ sessionStatus: sessionStatus, finalSentiment: sentiment });
      
    } catch (error) {
      console.error("Error calling backend:", error);
      addMessage('Maaf, sistem sedang mengalami gangguan koneksi.', 'bot');
    } finally {
      set({ isTyping: false });
    }
  },
}));
