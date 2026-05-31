import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';
import { useAuthStore } from './authStore';
import { toast } from 'sonner';

export interface DailyCheckin {
  id: string;
  date: string;
  emotionBefore: string;
  sleepHours: number;
  stressLevel: number;
  energyLevel: number;
  reviewedSetups: boolean;
  maxRiskToday: number;
  maxTradesToday: number;
  hasRevengeMindset: boolean;
  emotionalRisk: string;
}

export interface Trade {
  id: string;
  date: string;
  symbol: string;
  direction: 'long' | 'short';
  entry: number;
  exit: number;
  sl: number;
  tp: number;
  riskPct: number;
  pnl: number;
  timeframe: string;
  setupType: string;
  emotionBefore: string;
  emotionAfter: string;
  confidence: number;
  followedPlan: boolean;
  isImpulsive: boolean;
  lesson: string;
  notes: string;
  tags: string[];
  rulesChecked?: string[];
  rulesViolated?: string[];
  platform?: string;
  entryType?: string; // 'System Generated' | 'Customer Generated'
}

export interface SessionPlan {
  id: string;
  date: string;
  markets: string[];
  setups: string;
  maxLoss: number;
  maxTrades: number;
  rules: string[];
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  coingeckoId: string;
  rank?: number;
  price?: number;
}

export interface ActiveSession {
  planId: string;
  date: string;
  startTime: Date;
  endTime?: Date;
  reviewNotes?: string;
  startStatsSnapshot: {
    chartChecks: number;
    symbolSwitches: number;
    postLossSpikes: number;
  };
  computedStats?: any;
}

interface AppState {
  checkins: DailyCheckin[];
  trades: Trade[];
  assets: Asset[];
  sessionPlans: SessionPlan[];
  tradingRules: string[];
  entryChecklistRules: string[];
  lastRulesReadDate: string | null;
  todayCheckin: DailyCheckin | null;
  extensionInstalled: boolean;
  extensionData: any[];
  extensionStats: {
    chartChecks: number;
    symbolSwitches: number;
    postLossSpikes: number;
  };
  activeSession: ActiveSession | null;
  pastSessions: ActiveSession[];
  fetchCheckins: () => Promise<void>;
  fetchAssets: () => Promise<void>;
  addCheckin: (c: Omit<DailyCheckin, 'id'>) => Promise<void>;
  setTodayCheckin: (c: DailyCheckin | null) => void;
  addTrade: (t: Omit<Trade, 'id'>) => Promise<void>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  fetchTrades: () => Promise<void>;
  syncRules: () => void;
  addSessionPlan: (s: SessionPlan) => void;
  updateRules: (rules: string[]) => void;
  updateEntryChecklistRules: (rules: string[]) => void;
  markRulesRead: () => void;
  setExtensionInstalled: (installed: boolean) => void;
  setExtensionData: (events: any[], stats: any) => void;
  clearExtensionData: () => void;
  startSession: (planId: string) => void;
  endSession: (notes?: string) => void;
  seedAllDemoData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      checkins: [],
      trades: [],
      assets: [],
      sessionPlans: [],
      tradingRules: [],
      entryChecklistRules: [],
      lastRulesReadDate: null,
      todayCheckin: null,
      extensionInstalled: false,
      extensionData: [],
      extensionStats: { chartChecks: 0, symbolSwitches: 0, postLossSpikes: 0 },
      activeSession: null,
      pastSessions: [],
      fetchAssets: async () => {
        try {
          const { data } = await api.get('/assets');
          set({ assets: data });
        } catch (err) {
          console.error('Failed to fetch assets', err);
        }
      },
      fetchCheckins: async () => {
        try {
          const { data } = await api.get('/checkins');
          set({ checkins: data });
          const today = new Date().toISOString().split('T')[0];
          const todayC = data.find((c: DailyCheckin) => c.date === today);
          if (todayC) set({ todayCheckin: todayC });
        } catch (err) {
          console.error('Failed to fetch checkins', err);
        }
      },
      addCheckin: async (c) => {
        try {
          const { data } = await api.post('/checkins', c);
          set((s) => ({ 
            checkins: [data, ...s.checkins.filter(prev => prev.date !== data.date)], 
            todayCheckin: data 
          }));
          toast.success('Mental state recorded! 🧠');
        } catch (err) {
          toast.error('Failed to sync check-in.');
        }
      },
      setTodayCheckin: (c) => set({ todayCheckin: c }),
      addTrade: async (t) => {
        try {
          const { data } = await api.post('/trades', t);
          set((s) => ({ trades: [data, ...s.trades] }));
          toast.success('Trade logged successfully! 📈');
        } catch (err) {
          toast.error('Failed to save trade.');
        }
      },
      updateTrade: async (id, updates) => {
        try {
          const { data } = await api.put(`/trades/${id}`, updates);
          set((s) => ({ trades: s.trades.map(t => t.id === id ? data : t) }));
          toast.success('Trade updated!');
        } catch (err) {
          toast.error('Update failed.');
        }
      },
      deleteTrade: async (id) => {
        try {
          await api.delete(`/trades/${id}`);
          set((s) => ({ trades: s.trades.filter(t => t.id !== id) }));
          toast.success('Trade deleted.');
        } catch (err) {
          toast.error('Delete failed.');
        }
      },
      fetchTrades: async () => {
        try {
          const { data } = await api.get('/trades');
          set({ trades: data });
        } catch (err) {
          console.error('Failed to sync trades:', err);
        }
      },
      syncRules: () => {
        const { user } = useAuthStore.getState();
        if (user) {
          set({ 
            tradingRules: user.tradingRules || [], 
            entryChecklistRules: user.entryChecklistRules || [] 
          });
        }
      },
      addSessionPlan: (sp) => set((s) => ({ sessionPlans: [sp, ...s.sessionPlans] })),
      updateRules: async (rules) => {
        set({ tradingRules: rules });
        const { isAuthenticated, updateUser } = useAuthStore.getState();
        if (isAuthenticated) await updateUser({ tradingRules: rules });
      },
      updateEntryChecklistRules: async (rules) => {
        set({ entryChecklistRules: rules });
        const { isAuthenticated, updateUser } = useAuthStore.getState();
        if (isAuthenticated) await updateUser({ entryChecklistRules: rules });
      },
      markRulesRead: () => set({ lastRulesReadDate: new Date().toISOString().split('T')[0] }),
      setExtensionInstalled: (installed) => set({ extensionInstalled: installed }),
      setExtensionData: (events, stats) => set({ extensionData: events, extensionStats: stats }),
      clearExtensionData: () => set({ extensionData: [], extensionStats: { chartChecks: 0, symbolSwitches: 0, postLossSpikes: 0 } }),
      startSession: (planId) => {
        const { extensionStats } = get();
        set({ 
          activeSession: { 
            planId, 
            date: new Date().toISOString().split('T')[0],
            startTime: new Date(),
            startStatsSnapshot: { ...extensionStats }
          } 
        });
      },
      endSession: (notes) => set((s) => {
        if (!s.activeSession) return s;
        return {
          activeSession: null,
          pastSessions: [{ ...s.activeSession, endTime: new Date(), reviewNotes: notes || '' }, ...s.pastSessions]
        };
      }),
      seedAllDemoData: () => {
        const trades: Trade[] = [];
        const checkins: DailyCheckin[] = [];
        const symbols = ['BTC/USDT', 'ETH/USDT', 'EUR/USD', 'GBP/USD', 'GOLD', 'NAS100'];
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          const sleep = isWeekend ? 8 : 6 + Math.random() * 2;
          const stress = isWeekend ? 2 : Math.floor(Math.random() * 6) + 2;
          const checkin: DailyCheckin = {
            id: `c-${i}`,
            date: dateStr,
            emotionBefore: sleep > 7 ? 'focused' : 'frustrated',
            sleepHours: sleep,
            stressLevel: stress,
            energyLevel: sleep > 7 ? 8 : 5,
            reviewedSetups: true,
            maxRiskToday: 1.0,
            maxTradesToday: 5,
            hasRevengeMindset: stress > 6,
            emotionalRisk: stress > 6 ? 'Feeling impulsive' : 'Clear mind'
          };
          checkins.push(checkin);

          if (!isWeekend || Math.random() > 0.8) {
            const count = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < count; j++) {
              const isWin = Math.random() > 0.45;
              const risk = 100 + Math.random() * 200;
              trades.push({
                id: `t-${i}-${j}`,
                date: dateStr,
                symbol: symbols[Math.floor(Math.random() * symbols.length)],
                direction: Math.random() > 0.5 ? 'long' : 'short',
                entry: 50000,
                exit: isWin ? 51500 : 49000,
                sl: 49000,
                tp: 52000,
                riskPct: 1.0,
                pnl: isWin ? risk * 1.5 : -risk,
                timeframe: '1H',
                setupType: 'Trend Following',
                emotionBefore: checkin.emotionBefore,
                emotionAfter: isWin ? 'excited' : 'frustrated',
                confidence: 8,
                followedPlan: stress < 6,
                isImpulsive: stress > 7,
                lesson: 'Stick to rules',
                notes: 'Seeded trade',
                tags: ['seeded']
              });
            }
          }
        }
        set({ trades, checkins, todayCheckin: checkins[checkins.length-1] });
        toast.success('30 days of behavioral data seeded locally! 🧬');
      }
    }),
    { name: 'tradeguru-app-storage' }
  )
);
