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
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        // Clear cookie by calling a logout endpoint or letting frontend clear state
        // For HttpOnly, we should theoretically call API, but clearing state is enough to require new login
        set({ user: null, isAuthenticated: false });
      },
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
          set({ user: null, isAuthenticated: false }); // Logout if profile fetch fails (e.g. cookie expired)
        }
      },
    }),
    { 
      name: 'tradeguru-auth',
      // Only keep user and isAuthenticated in localStorage, no tokens!
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
