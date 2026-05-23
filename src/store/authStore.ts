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
  isAdmin: boolean;
  status: 'active' | 'suspended' | 'banned';
  behaviorRules?: {
    maxSessionHours?: number;
    forcedBreakMins?: number;
    maxSymbolHops?: number;
    maxDwellMins?: number;
    maxRefreshPerHour?: number;
    maxTradesPerDay?: number;
    postLossCooldownMins?: number;
    maxConsecutiveLosses?: number;
    tiltLockUntil?: number; // timestamp
  };
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
          console.log('[TradeGuru Auth] Profile Sync Success:', data);
          set({ user: data });
        } catch (err) {
          console.error('[TradeGuru Auth] Profile Sync Failed:', err);
        }
      },
    }),
    { name: 'tradeguru-auth' }
  )
);
