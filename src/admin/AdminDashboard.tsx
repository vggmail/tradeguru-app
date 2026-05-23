import { useEffect, useState } from 'react';
import { Users, TrendingUp, Activity, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../api/client';

interface AdminStats {
  totalUsers: number;
  totalTrades: number;
  totalCheckins: number;
  newUsersThisWeek: number;
  activeToday: number;
  platformWinRate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-tv-muted animate-pulse font-mono tracking-tighter">Initializing Admin Analytics Engine...</div>;
  if (!stats) return <div className="p-12 text-center text-tv-red font-bold">Failed to connect to Admin Gateway.</div>;

  const summaryCards = [
    { label: 'Platform Users', value: stats.totalUsers, sub: `+${stats.newUsersThisWeek} this week`, icon: Users, color: '#2962ff' },
    { label: 'Active Today', value: stats.activeToday, sub: `${Math.round((stats.activeToday / stats.totalUsers) * 100)}% Retention`, icon: Activity, color: '#26a69a' },
    { label: 'Total Logs', value: stats.totalTrades + stats.totalCheckins, sub: 'Unified Behavioral Events', icon: TrendingUp, color: '#f7b500' },
    { label: 'Platform WR', value: `${stats.platformWinRate}%`, sub: 'Aggregate Performance', icon: CheckCircle, color: '#ef5350' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="card p-6 border-b-2 hover:translate-y-[-4px] transition-all duration-300" style={{ borderBottomColor: card.color }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-tv-surface2 border border-tv-border">
                <card.icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
              <div className="flex items-center gap-1 text-[10px] bg-tv-green/10 text-tv-green px-2 py-1 rounded-full font-bold">
                <ArrowUpRight className="w-3 h-3" /> LIVE
              </div>
            </div>
            <div className="text-3xl font-black text-tv-text tracking-tight mb-1">{card.value}</div>
            <div className="text-xs font-bold text-tv-muted uppercase tracking-wider">{card.label}</div>
            <p className="text-[10px] text-tv-muted/70 mt-3 font-medium italic">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Critical Alerts Row */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-8 border border-tv-red/10 bg-tv-red/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tv-red/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-xl font-bold text-tv-text flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-tv-red" />
            Active Behavioral Risk Alerts
          </h3>
          <div className="space-y-4">
            {[
              { email: 'trader.alex@gmail.com', risk: 'Suspicious Refresh Spike', time: '14m ago' },
              { email: 'vikas.crypto@proton.me', risk: 'Revenge Loop Offset', time: '52m ago' },
              { email: 'pro_scalper_7@yahoo.com', risk: 'Late-Night Fatigue Cluster', time: '2h ago' },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-tv-surface rounded-xl border border-tv-border border-l-4 border-l-tv-red">
                <div>
                  <div className="text-sm font-bold text-tv-text">{alert.email}</div>
                  <div className="text-[10px] text-tv-muted font-medium">{alert.risk}</div>
                </div>
                <div className="text-[10px] text-tv-muted font-mono">{alert.time}</div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-tv-red/10 hover:bg-tv-red/20 text-tv-red text-xs font-bold rounded-xl border border-tv-red/20 transition-all uppercase tracking-widest">
            Investigate All Security Flags
          </button>
        </div>

        <div className="card p-8 border border-tv-blue/10">
          <h3 className="text-xl font-bold text-tv-text flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-tv-blue" />
            Platform Activity Metrics
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-tv-muted">DATA SYNC HEALTH</span>
                <span className="text-tv-green">100% OPERATIONAL</span>
              </div>
              <div className="h-2 bg-tv-surface2 rounded-full overflow-hidden border border-tv-border">
                <div className="h-full bg-tv-green w-full glow-green" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-tv-muted">EXTENSION UTILIZATION</span>
                <span className="text-tv-blue">84% ACTIVATION</span>
              </div>
              <div className="h-2 bg-tv-surface2 rounded-full overflow-hidden border border-tv-border">
                <div className="h-full bg-tv-blue w-[84%] glow-blue" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-tv-muted">BACKEND LATENCY</span>
                <span className="text-tv-orange">42MS REQ/RES</span>
              </div>
              <div className="h-2 bg-tv-surface2 rounded-full overflow-hidden border border-tv-border">
                <div className="h-full bg-tv-orange w-[15%] glow-orange" />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-tv-muted leading-relaxed mt-6 italic">
            Metrics refreshed every 60 seconds. TradeGuru Behavioral Engine is monitoring 2,841 attention patterns across all connected terminals.
          </p>
        </div>
      </div>
    </div>
  );
}
