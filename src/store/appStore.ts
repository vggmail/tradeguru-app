import { create } from 'zustand';

export interface DailyCheckin {
  id: string;
  date: string;
  emotion: string;
  sleepQuality: number;
  stressLevel: number;
  mentalClarity: number;
  hasRevengeMindset: boolean;
  maxRisk: number;
  maxTrades: number;
  notes: string;
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

interface AppState {
  checkins: DailyCheckin[];
  trades: Trade[];
  sessionPlans: SessionPlan[];
  todayCheckin: DailyCheckin | null;
  addCheckin: (c: DailyCheckin) => void;
  addTrade: (t: Trade) => void;
  addSessionPlan: (s: SessionPlan) => void;
  setTodayCheckin: (c: DailyCheckin | null) => void;
}

// Seed data for demo
const DEMO_TRADES: Trade[] = [
  { id:'t1', date:'2026-05-19', symbol:'BTC/USDT', direction:'long', entry:67200, exit:68900, sl:66500, tp:69500, riskPct:1.5, pnl:1700, timeframe:'4H', setupType:'Breakout', emotionBefore:'focused', emotionAfter:'calm', confidence:8, followedPlan:true, isImpulsive:false, lesson:'Held through noise', notes:'', tags:['crypto'] },
  { id:'t2', date:'2026-05-18', symbol:'EUR/USD', direction:'short', entry:1.0850, exit:1.0800, sl:1.0880, tp:1.0780, riskPct:1.0, pnl:340, timeframe:'1H', setupType:'Rejection', emotionBefore:'calm', emotionAfter:'focused', confidence:7, followedPlan:true, isImpulsive:false, lesson:'Perfect entry', notes:'', tags:['forex'] },
  { id:'t3', date:'2026-05-17', symbol:'NIFTY50', direction:'long', entry:23400, exit:23180, sl:23320, tp:23600, riskPct:2.0, pnl:-880, timeframe:'15M', setupType:'Momentum', emotionBefore:'frustrated', emotionAfter:'frustrated', confidence:4, followedPlan:false, isImpulsive:true, lesson:'Revenge trade after morning loss', notes:'', tags:['indices'] },
  { id:'t4', date:'2026-05-16', symbol:'ETH/USDT', direction:'long', entry:3180, exit:3290, sl:3120, tp:3300, riskPct:1.5, pnl:660, timeframe:'4H', setupType:'Support bounce', emotionBefore:'calm', emotionAfter:'excited', confidence:8, followedPlan:true, isImpulsive:false, lesson:'', notes:'', tags:['crypto'] },
  { id:'t5', date:'2026-05-15', symbol:'BTC/USDT', direction:'short', entry:66800, exit:66200, sl:67200, tp:65800, riskPct:1.0, pnl:400, timeframe:'1H', setupType:'Distribution', emotionBefore:'focused', emotionAfter:'calm', confidence:7, followedPlan:true, isImpulsive:false, lesson:'Good patience', notes:'', tags:['crypto'] },
];

const DEMO_CHECKINS: DailyCheckin[] = [
  { id:'c1', date:'2026-05-19', emotion:'focused', sleepQuality:8, stressLevel:3, mentalClarity:8, hasRevengeMindset:false, maxRisk:2, maxTrades:3, notes:'' },
  { id:'c2', date:'2026-05-18', emotion:'calm', sleepQuality:7, stressLevel:2, mentalClarity:9, hasRevengeMindset:false, maxRisk:2, maxTrades:4, notes:'' },
  { id:'c3', date:'2026-05-17', emotion:'frustrated', sleepQuality:5, stressLevel:7, mentalClarity:4, hasRevengeMindset:true, maxRisk:3, maxTrades:5, notes:'Bad night, should not trade' },
];

export const useAppStore = create<AppState>()((set) => ({
  checkins: DEMO_CHECKINS,
  trades: DEMO_TRADES,
  sessionPlans: [],
  todayCheckin: DEMO_CHECKINS[0],
  addCheckin: (c) => set((s) => ({ checkins: [c, ...s.checkins], todayCheckin: c })),
  addTrade: (t) => set((s) => ({ trades: [t, ...s.trades] })),
  addSessionPlan: (sp) => set((s) => ({ sessionPlans: [sp, ...s.sessionPlans] })),
  setTodayCheckin: (c) => set({ todayCheckin: c }),
}));
