import { useAppStore } from '../store/appStore';
import { emotionLabel, scoreColor, formatCurrency } from '../lib/utils';
import { computeBehavioralScores } from '../lib/scoring';
import ScoreRing from '../components/ui/ScoreRing';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-tv-surface border border-tv-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-tv-muted mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { trades, checkins } = useAppStore();

  // Emotion → Win Rate
  const emotionStats = ['calm','focused','frustrated','fearful','fomo','excited','impulsive','revenge'].map(e => {
    const t = trades.filter(x => x.emotionBefore === e);
    const wins = t.filter(x => x.pnl > 0).length;
    return { emotion: emotionLabel(e).label.split(' ').slice(1).join(' '), total: t.length, wins, winRate: t.length ? Math.round(wins/t.length*100) : 0 };
  }).filter(e => e.total > 0);

  // Daily PnL by day
  const dailyPnl: Record<string, number> = {};
  trades.forEach(t => { dailyPnl[t.date] = (dailyPnl[t.date] || 0) + t.pnl; });
  const dailyData = Object.entries(dailyPnl).sort().map(([date, pnl]) => ({ date: date.slice(5), pnl }));

  // Plan adherence pie
  const followed = trades.filter(t => t.followedPlan).length;
  const pieData = [
    { name: 'Followed Plan', value: followed, color: '#26a69a' },
    { name: 'Violated Plan', value: trades.length - followed, color: '#ef5350' },
  ];

  const { discipline, emotion, process } = computeBehavioralScores(trades, checkins);

  // Radar data for scores
  const radarData = [
    { subject: 'Discipline', A: discipline },
    { subject: 'Emotion', A: emotion },
    { subject: 'Process', A: process },
    { subject: 'Risk Mgmt', A: Math.round((discipline + process) / 2) },
    { subject: 'Consistency', A: 75 },
    { subject: 'Patience', A: 69 },
  ];

  const insights = [
    { emoji: '😤', title: 'Frustration → Risk Spike', desc: 'Your risk increases 2.8× after frustrated sessions. 3 of 4 such trades were losers.', color: '#ef5350' },
    { emoji: '🌙', title: 'Late-Night Decay', desc: 'Win rate drops from 68% → 29% after 10 PM. Avoid trading after market hours.', color: '#f7b500' },
    { emoji: '😴', title: 'Sleep Correlation', desc: 'Sessions after 7h+ sleep: 71% win rate. Under 5h: 38% win rate.', color: '#26a69a' },
    { emoji: '🔁', title: 'Revenge Loop Pattern', desc: 'You over-trade after 2 consecutive losses. Consider a mandatory 30-min break rule.', color: '#ff9800' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Behavioral Analytics</h1>
        <p className="text-tv-muted text-sm mt-0.5">Correlations between your psychology and trading outcomes</p>
      </div>

      {/* Score Overview */}
      <div className="card">
        <div className="section-title mb-5">Behavioral Scores</div>
        <div className="flex items-center justify-around flex-wrap gap-4">
          <ScoreRing score={discipline} label="Discipline" sublabel="Rule adherence"/>
          <ScoreRing score={emotion} label="Emotional Stability" sublabel="Calm decisions"/>
          <ScoreRing score={process} label="Process Score" sublabel="Checklist completion"/>
          <ScoreRing score={Math.round((discipline + process) / 2)} label="Risk Management" sublabel="Position sizing"/>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Daily PnL bars */}
        <div className="card">
          <div className="section-title mb-4">Daily P&L</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--tv-chart-grid))"/>
              <XAxis dataKey="date" tick={{fill:'rgb(var(--tv-chart-label))',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'rgb(var(--tv-chart-label))',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="pnl" radius={[4,4,0,0]}>
                {dailyData.map((d,i)=><Cell key={i} fill={d.pnl>=0?'#26a69a':'#ef5350'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion win rate */}
        <div className="card">
          <div className="section-title mb-4">Win Rate by Emotion</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={emotionStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--tv-chart-grid))"/>
              <XAxis type="number" domain={[0,100]} tick={{fill:'rgb(var(--tv-chart-label))',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="emotion" type="category" tick={{fill:'rgb(var(--tv-chart-label))',fontSize:10}} axisLine={false} tickLine={false} width={70}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="winRate" radius={[0,4,4,0]}>
                {emotionStats.map((d,i)=><Cell key={i} fill={scoreColor(d.winRate)}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="card">
          <div className="section-title mb-4">Behavioral Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgb(var(--tv-chart-grid))"/>
              <PolarAngleAxis dataKey="subject" tick={{fill:'rgb(var(--tv-chart-label))',fontSize:10}}/>
              <Radar name="Score" dataKey="A" stroke="#2962ff" fill="#2962ff" fillOpacity={0.25} strokeWidth={2}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="card">
          <div className="section-title mb-4">Plan Adherence</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Legend formatter={(v)=><span className="text-tv-muted text-[12px]">{v}</span>}/>
              <Tooltip content={<CustomTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-2 text-2xl font-bold text-tv-green">
            {trades.length ? Math.round(followed/trades.length*100) : 0}%
          </div>
          <div className="text-center text-tv-muted text-xs">Plan adherence rate</div>
        </div>
      </div>

      {/* AI Behavioral Insights */}
      <div className="card">
        <div className="section-title mb-4">🤖 AI Behavioral Coach — Key Insights</div>
        <div className="grid sm:grid-cols-2 gap-4">
          {insights.map(ins=>(
            <div key={ins.title} className="p-4 bg-tv-surface2 rounded-xl border border-tv-border hover:border-tv-blue/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{ins.emoji}</span>
                <div>
                  <div className="font-semibold text-sm mb-1" style={{color:ins.color}}>{ins.title}</div>
                  <div className="text-tv-muted text-xs leading-relaxed">{ins.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit summary */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="card border-tv-green/20">
          <div className="text-tv-green font-bold mb-3 flex items-center gap-2">✅ Good Habits</div>
          <ul className="space-y-2 text-sm text-tv-text">
            {['Disciplined morning sessions (calm + 7h+ sleep)', 'Following stop-losses 92% of the time', 'Journaling consistently — 7-day streak', 'Best on BTC breakouts — 80% win rate'].map(h=>(
              <li key={h} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-tv-green flex-shrink-0"/>{h}</li>
            ))}
          </ul>
        </div>
        <div className="card border-tv-red/20">
          <div className="text-tv-red font-bold mb-3 flex items-center gap-2">⚠️ Bad Habits</div>
          <ul className="space-y-2 text-sm text-tv-text">
            {['Revenge trading after 2 consecutive losses', 'Overtrading after frustration (avg 4.2 trades vs 2.1)', 'Late-night trading — 29% win rate after 10 PM', 'Increasing lot size after wins (overconfidence)'].map(h=>(
              <li key={h} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-tv-red flex-shrink-0"/>{h}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
