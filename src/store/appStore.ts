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
}

export interface SessionPlan {
  id: string;
  date: string;
  markets: string[];
  setups: string;
  maxLoss: number;
  maxTrades: number;
  rules: string[];
  notes: string;
}

export interface ActiveSession {
  id: string;
  planId: string;
  date: string;
  startTime: string;
  endTime?: string;
  startStatsSnapshot: {
    chartChecks: number;
    symbolSwitches: number;
    postLossSpikes: number;
  };
  computedStats?: {
    sessionChartChecks: number;
    sessionSymbolSwitches: number;
    sessionPostLossSpikes: number;
    totalTrades: number;
    winRate: number;
    netPnl: number;
    rulesViolatedCount: number;
    disciplineScore: number;
  };
  reviewNotes?: string;
}

interface AppState {
  checkins: DailyCheckin[];
  trades: Trade[];
  sessionPlans: SessionPlan[];
  tradingRules: string[];
  entryChecklistRules: string[];
  lastRulesReadDate: string | null;
  todayCheckin: DailyCheckin | null;
  extensionInstalled: boolean;
  extensionEvents: any[];
  extensionStats: {
    chartChecks: number;
    symbolSwitches: number;
    postLossSpikes: number;
    lastRefreshTime?: Record<string, number>;
  };
  activeSession: ActiveSession | null;
  pastSessions: ActiveSession[];
  fetchCheckins: () => Promise<void>;
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
}

// Seed data for demo
const DEMO_TRADES: Trade[] = [
  { id:'t1', date:'2026-05-19', symbol:'BTC/USDT', direction:'long', entry:67200, exit:68900, sl:66500, tp:69500, riskPct:1.5, pnl:1700, timeframe:'4H', setupType:'Breakout', emotionBefore:'focused', emotionAfter:'calm', confidence:8, followedPlan:true, isImpulsive:false, lesson:'Held through noise', notes:'', tags:['crypto'] },
  { id:'t2', date:'2026-05-18', symbol:'EUR/USD', direction:'short', entry:1.0850, exit:1.0800, sl:1.0880, tp:1.0780, riskPct:1.0, pnl:340, timeframe:'1H', setupType:'Rejection', emotionBefore:'calm', emotionAfter:'focused', confidence:7, followedPlan:true, isImpulsive:false, lesson:'Perfect entry', notes:'', tags:['forex'] },
  { id:'t3', date:'2026-05-17', symbol:'NIFTY50', direction:'long', entry:23400, exit:23180, sl:23320, tp:23600, riskPct:2.0, pnl:-880, timeframe:'15M', setupType:'Momentum', emotionBefore:'frustrated', emotionAfter:'frustrated', confidence:4, followedPlan:false, isImpulsive:true, lesson:'Revenge trade after morning loss', notes:'', tags:['indices'] },
  { id:'t4', date:'2026-05-16', symbol:'ETH/USDT', direction:'long', entry:3180, exit:3290, sl:3120, tp:3300, riskPct:1.5, pnl:660, timeframe:'4H', setupType:'Support bounce', emotionBefore:'calm', emotionAfter:'excited', confidence:8, followedPlan:true, isImpulsive:false, lesson:'', notes:'', tags:['crypto'] },
  { id:'t5', date:'2026-05-15', symbol:'BTC/USDT', direction:'short', entry:66800, exit:66200, sl:67200, tp:65800, riskPct:1.0, pnl:400, timeframe:'1H', setupType:'Distribution', emotionBefore:'focused', emotionAfter:'calm', confidence:7, followedPlan:true, isImpulsive:false, lesson:'Good patience', notes:'', tags:['crypto'] },
];

const DEMO_CHECKINS: DailyCheckin[] = []; // Clear demo data for live sync

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      checkins: DEMO_CHECKINS,
      trades: DEMO_TRADES,
      sessionPlans: [],
      tradingRules: [],
      entryChecklistRules: [],
      lastRulesReadDate: null,
      todayCheckin: DEMO_CHECKINS[0],
      extensionInstalled: false,
      extensionEvents: [],
      extensionStats: { chartChecks: 0, symbolSwitches: 0, postLossSpikes: 0 },
      activeSession: null,
      pastSessions: [],
      fetchCheckins: async () => {
        try {
          const { data } = await api.get('/checkins');
          set({ checkins: data });
          // Check if today's checkin exists
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
      addTrade: async (t) => {
        try {
          const { data } = await api.post('/trades', t);
          set((s) => ({ trades: [data, ...s.trades] }));
          toast.success('Trade logged to cloud! ☁️');
        } catch (err: any) {
          toast.error('Failed to save trade.');
        }
      },
      updateTrade: async (id, updates) => {
        // Local update for now
        set((s) => ({ trades: s.trades.map((t) => t.id === id ? { ...t, ...updates } : t) }));
      },
      deleteTrade: async (id) => {
        // Local delete for now
        set((s) => ({ trades: s.trades.filter((t) => t.id !== id) }));
      },
      fetchTrades: async () => {
        try {
          const { data } = await api.get('/trades');
          set({ trades: data });
        } catch (err: any) {
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
      setTodayCheckin: (c) => set({ todayCheckin: c }),
      setExtensionInstalled: (installed) => set({ extensionInstalled: installed }),
      setExtensionData: async (events, stats) => {
        set({ extensionEvents: events, extensionStats: stats });
        
        // Sync new behavioral signals to backend if authenticated
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated && events.length > 0) {
          const lastEvent = events[events.length - 1];
          // We only sync "signal" events (anxiety, fomo, etc) to keep the DB clean
          if (lastEvent.signal !== 'calm') {
            try {
              await api.post('/telemetry/events', {
                eventType: lastEvent.type,
                symbol: lastEvent.symbol,
                source: 'Chrome Extension',
                message: lastEvent.message,
                signal: lastEvent.signal
              });
            } catch (err) {
              console.error('[Telemetry Sync Error]:', err);
            }
          }
        }
      },
      clearExtensionData: () => set({ extensionEvents: [], extensionStats: { chartChecks: 0, symbolSwitches: 0, postLossSpikes: 0 } }),
      startSession: (planId) => set((s) => {
        const today = new Date().toISOString().split('T')[0];
        return {
          activeSession: {
            id: Date.now().toString(),
            planId,
            date: today,
            startTime: new Date().toISOString(),
            startStatsSnapshot: {
              chartChecks: s.extensionStats.chartChecks || 0,
              symbolSwitches: s.extensionStats.symbolSwitches || 0,
              postLossSpikes: s.extensionStats.postLossSpikes || 0,
            }
          }
        };
      }),
      endSession: (notes) => set((s) => {
        if (!s.activeSession) return {};
        
        const sessionTrades = s.trades.filter(t => t.date === s.activeSession!.date);
        const totalTrades = sessionTrades.length;
        const winningTrades = sessionTrades.filter(t => t.pnl > 0).length;
        const winRate = totalTrades ? Math.round((winningTrades / totalTrades) * 100) : 0;
        const netPnl = sessionTrades.reduce((acc, t) => acc + t.pnl, 0);
        
        const sessionChartChecks = Math.max(0, (s.extensionStats.chartChecks || 0) - s.activeSession.startStatsSnapshot.chartChecks);
        const sessionSymbolSwitches = Math.max(0, (s.extensionStats.symbolSwitches || 0) - s.activeSession.startStatsSnapshot.symbolSwitches);
        const sessionPostLossSpikes = Math.max(0, (s.extensionStats.postLossSpikes || 0) - s.activeSession.startStatsSnapshot.postLossSpikes);
        
        const rulesViolatedCount = sessionTrades.reduce((acc, t) => acc + (t.rulesViolated?.length || 0), 0);
        const impulsiveCount = sessionTrades.filter(t => t.isImpulsive).length;
        
        let disciplineScore = 100;
        if (totalTrades > 0) {
          disciplineScore -= (rulesViolatedCount * 15);
          disciplineScore -= (impulsiveCount * 25);
          if (sessionChartChecks > 30) disciplineScore -= 10;
          if (sessionSymbolSwitches > 10) disciplineScore -= 10;
          disciplineScore = Math.max(0, Math.min(100, disciplineScore));
        }

        const completedSession: ActiveSession = {
          ...s.activeSession,
          endTime: new Date().toISOString(),
          computedStats: {
            sessionChartChecks,
            sessionSymbolSwitches,
            sessionPostLossSpikes,
            totalTrades,
            winRate,
            netPnl,
            rulesViolatedCount,
            disciplineScore
          },
          reviewNotes: notes || ''
        };

        return {
          activeSession: null,
          pastSessions: [completedSession, ...s.pastSessions]
        };
      }),
    }),
    { name: 'tradeguru-data' }
  )
);
