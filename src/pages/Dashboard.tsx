import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, AlertTriangle, Flame, Target, Brain, ArrowRight, Plus, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { formatCurrency, formatPct, scoreColor, emotionLabel } from '../lib/utils';
import { computeBehavioralScores } from '../lib/scoring';
import ScoreRing from '../components/ui/ScoreRing';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const PNL_DATA = [
  { date: 'May 12', pnl: 320 },
  { date: 'May 13', pnl: 680 },
  { date: 'May 14', pnl: 420 },
  { date: 'May 15', pnl: 1080 },
  { date: 'May 16', pnl: 740 },
  { date: 'May 17', pnl: -880 },
  { date: 'May 18', pnl: 340 },
  { date: 'May 19', pnl: 1700 },
];

const CUMULATIVE_DATA = PNL_DATA.reduce((acc, d, i) => {
  const prev = i === 0 ? 0 : acc[i - 1].cumulative;
  acc.push({ ...d, cumulative: prev + d.pnl });
  return acc;
}, [] as { date: string; pnl: number; cumulative: number }[]);

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-tv-surface border border-tv-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-tv-muted mb-1">{label}</div>
      <div className="font-bold" style={{ color: val >= 0 ? '#26a69a' : '#ef5350' }}>
        {formatCurrency(val)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { trades, todayCheckin } = useAppStore();
  const navigate = useNavigate();

  const recentTrades = trades.slice(0, 5);
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const wins = trades.filter(t => t.pnl > 0).length;
  const winRate = trades.length ? (wins / trades.length) * 100 : 0;
  const avgWin = wins ? trades.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0) / wins : 0;
  const losses = trades.filter(t => t.pnl < 0).length;
  const avgLoss = losses ? Math.abs(trades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0) / losses) : 0;

  const { discipline, emotion, process } = computeBehavioralScores(trades, useAppStore.getState().checkins);

  const alerts = [
    { text: 'Risk increased 3× after losses on May 17', color: '#ef5350', icon: AlertTriangle },
    { text: 'You tend to overtrade after 2 PM — 68% of afternoon trades are losers', color: '#f7b500', icon: Activity },
    { text: 'Best sessions: calm emotion + 7h+ sleep → 89% win rate', color: '#26a69a', icon: Target },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tv-text">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-tv-muted text-sm mt-0.5">Here's your behavioral overview for today</p>
        </div>
        <div className="flex items-center gap-3">
          {!todayCheckin && (
            <button onClick={() => navigate('/app/checkin')} className="btn-primary">
              <Brain className="w-4 h-4" /> Start Check-In
            </button>
          )}
          <button onClick={() => navigate('/app/journal')} className="btn-ghost border border-tv-border">
            <Plus className="w-4 h-4" /> Add Trade
          </button>
        </div>
      </div>

      {/* Mental Check-In Banner */}
      {todayCheckin ? (
        <div className="card border-tv-green/30 bg-tv-green/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-tv-green" />
            <div>
              <div className="text-tv-text font-semibold text-sm">Today's check-in complete</div>
              <div className="text-tv-muted text-xs">
                {emotionLabel(todayCheckin.emotionBefore).label} · Sleep {Number(todayCheckin.sleepHours).toFixed(2)}/10 · Stress {todayCheckin.stressLevel}/10
                {todayCheckin.hasRevengeMindset && <span className="text-tv-red ml-2">⚠ Revenge mindset detected</span>}
              </div>
            </div>
          </div>
          <span className="badge-green">Ready to trade</span>
        </div>
      ) : (
        <div className="card border-tv-yellow/30 bg-tv-yellow/5 flex items-center justify-between cursor-pointer hover:border-tv-yellow/50 transition-colors"
          onClick={() => navigate('/app/checkin')}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-tv-yellow" />
            <div>
              <div className="text-tv-text font-semibold text-sm">Daily check-in required</div>
              <div className="text-tv-muted text-xs">Complete your mental pre-flight before trading today</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-tv-yellow" />
        </div>
      )}

      {/* Score Rings */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="section-title">Behavioral Scores</div>
          <span className="text-tv-muted text-xs">Updated after each session</span>
        </div>
        <div className="flex items-center justify-around gap-4 flex-wrap">
          <ScoreRing score={discipline} label="Discipline" sublabel="Sticking to rules" />
          <ScoreRing score={emotion} label="Emotional Stability" sublabel="Calm trading" />
          <ScoreRing score={process} label="Process Score" sublabel="Checklist adherence" />
          {/* Streak */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-[100px] h-[100px] rounded-full bg-tv-yellow/10 border-2 border-tv-yellow/40 flex flex-col items-center justify-center">
              <Flame className="w-8 h-8 text-tv-yellow" />
              <span className="text-xl font-bold text-tv-yellow">7</span>
            </div>
            <div className="text-center">
              <div className="text-tv-text text-xs font-semibold">Streak</div>
              <div className="text-tv-muted text-[10px]">Days journaled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="text-tv-muted text-xs">Total P&L</span>
          <span className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
            {formatCurrency(totalPnl)}
          </span>
          <span className="text-tv-muted text-xs">{trades.length} trades logged</span>
        </div>
        <div className="stat-card">
          <span className="text-tv-muted text-xs">Win Rate</span>
          <span className="text-2xl font-bold text-tv-text">{winRate.toFixed(0)}%</span>
          <span className="text-tv-muted text-xs">{wins}W / {losses}L</span>
        </div>
        <div className="stat-card">
          <span className="text-tv-muted text-xs">Avg Win</span>
          <span className="text-2xl font-bold text-tv-green">{formatCurrency(avgWin)}</span>
          <span className="text-tv-muted text-xs">per winning trade</span>
        </div>
        <div className="stat-card">
          <span className="text-tv-muted text-xs">Avg Loss</span>
          <span className="text-2xl font-bold text-tv-red">-${avgLoss.toFixed(0)}</span>
          <span className="text-tv-muted text-xs">per losing trade</span>
        </div>
      </div>

      {/* Chart + Alerts */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Equity curve */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title">Equity Curve</div>
            <div className={`text-sm font-semibold ${totalPnl >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
              {formatCurrency(totalPnl)} {formatPct((totalPnl / 10000) * 100)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={CUMULATIVE_DATA}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2962ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2962ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--tv-chart-grid))" />
              <XAxis dataKey="date" tick={{ fill: 'rgb(var(--tv-chart-label))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgb(var(--tv-chart-label))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cumulative" stroke="#2962ff" strokeWidth={2} fill="url(#pnlGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Alerts */}
        <div className="card">
          <div className="section-title mb-4">AI Behavioral Coach</div>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="flex gap-2.5 p-3 bg-tv-surface2 rounded-lg">
                <a.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: a.color }} />
                <p className="text-tv-text text-xs leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/app/analytics')} className="btn-ghost w-full justify-center mt-3 text-sm">
            Full Analytics <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title">Recent Trades</div>
          <button onClick={() => navigate('/app/journal')} className="text-tv-blue text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-tv-muted text-xs border-b border-tv-border">
                {['Symbol', 'Dir', 'Entry', 'Exit', 'P&L', 'Emotion', 'Followed Plan'].map(h => (
                  <th key={h} className="text-left pb-2 pr-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTrades.map(t => {
                const em = emotionLabel(t.emotionBefore);
                return (
                  <tr key={t.id} className="border-b border-tv-border/50 hover:bg-tv-surface2 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-tv-text">{t.symbol}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge-${t.direction === 'long' ? 'green' : 'red'}`}>
                        {t.direction === 'long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {t.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-tv-muted">{t.entry}</td>
                    <td className="py-3 pr-4 text-tv-muted">{t.exit}</td>
                    <td className={`py-3 pr-4 font-semibold ${t.pnl >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
                      {formatCurrency(t.pnl)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: em.color + '22', color: em.color }}>
                        {em.label}
                      </span>
                    </td>
                    <td className="py-3">
                      {t.followedPlan
                        ? <span className="badge-green">Yes</span>
                        : <span className="badge-red">No</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
