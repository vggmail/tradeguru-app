import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  marketFocus: string[];
  dailyLossLimit: number;
  tradingRules: string[];
  entryChecklistRules: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: async (partial) => {
        try {
          const { data } = await api.put('/auth/profile', partial);
          set({ user: data });
        } catch (err) {
          console.error('Failed to update profile', err);
        }
      },
      fetchProfile: async () => {
        try {
          const { data } = await api.get('/auth/profile');
          set({ user: data });
        } catch (err) {
          console.error('Failed to sync profile', err);
        }
      },
    }),
    { name: 'tradeguru-auth' }
  )
);
