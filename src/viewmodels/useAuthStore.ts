import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../models/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (value: boolean) => set({ hasSeenOnboarding: value }),
      login: (userData: User, token: string) => {
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        });
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
