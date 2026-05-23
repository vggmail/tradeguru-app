import { useAppStore } from '../store/appStore';
import { emotionLabel, scoreColor, formatCurrency } from '../lib/utils';
import { computeBehavioralScores } from '../lib/scoring';
import ScoreRing from '../components/ui/ScoreRing';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
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

  // 1. Equity Curve Calculation
  let cumulative = 0;
  const equityData = trades
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(t => {
      cumulative += t.pnl;
      return { date: t.date.slice(5), equity: cumulative };
    });

  // 2. Dynamic Sleep Correlation
  const sleepStats = [
    { label: 'Well Rested (7h+)', filter: (c: any) => c.sleepHours >= 7 },
    { label: 'Sleep Deprived (<7h)', filter: (c: any) => c.sleepHours < 7 },
  ].map(group => {
    const dates = checkins.filter(group.filter).map(c => c.date);
    const ts = trades.filter(t => dates.includes(t.date));
    const wins = ts.filter(t => t.pnl > 0).length;
    return { name: group.label, winRate: ts.length ? Math.round(wins/ts.length*100) : 0, count: ts.length };
  });

  // 3. Dynamic Insights Generation
  const dynamicInsights = [];
  
  // Stress vs Winflow
  const lowStressDates = checkins.filter(c => c.stressLevel <= 4).map(c => c.date);
  const highStressDates = checkins.filter(c => c.stressLevel > 6).map(c => c.date);
  const lowStressWR = trades.filter(t => lowStressDates.includes(t.date)).length > 0
    ? Math.round(trades.filter(t => lowStressDates.includes(t.date) && t.pnl > 0).length / trades.filter(t => lowStressDates.includes(t.date)).length * 100)
    : 0;
  const highStressWR = trades.filter(t => highStressDates.includes(t.date)).length > 0
    ? Math.round(trades.filter(t => highStressDates.includes(t.date) && t.pnl > 0).length / trades.filter(t => highStressDates.includes(t.date)).length * 100)
    : 0;

  if (lowStressWR > highStressWR + 5) {
    dynamicInsights.push({ 
      emoji: '🧘', title: 'Stress Impact', 
      desc: `Your Win Rate is ${lowStressWR}% when calm, but drops to ${highStressWR}% when stressed.`, 
      color: '#ef5350' 
    });
  }

  // Revenge Pattern
  const revengeSess = checkins.filter(c => c.hasRevengeMindset).length;
  if (revengeSess > 0) {
    dynamicInsights.push({ 
      emoji: '🔁', title: 'Revenge Loop detected', 
      desc: `You've traded ${revengeSess} sessions with a revenge mindset. This is your #1 profit killer.`, 
      color: '#ff9800' 
    });
  }
  
  // Sleep Insight
  if (sleepStats[0].winRate > sleepStats[1].winRate) {
    dynamicInsights.push({
      emoji: '😴', title: 'Sleep Performance',
      desc: `You win ${sleepStats[0].winRate}% of trades after 7h+ sleep, compared to only ${sleepStats[1].winRate}% when tired.`,
      color: '#26a69a'
    });
  }

  // Radar data for scores
  const radarData = [
    { subject: 'Discipline', A: discipline },
    { subject: 'Emotion', A: emotion },
    { subject: 'Process', A: process },
    { subject: 'Risk Mgmt', A: Math.round((discipline + process) / 2) },
    { subject: 'Consistency', A: 75 },
    { subject: 'Patience', A: 69 },
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

      {/* Total Equity Curve */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="section-title">Growth Curve (Cumulative p&l)</div>
          <div className={`font-bold ${cumulative >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
            {cumulative >= 0 ? '+' : ''}{formatCurrency(cumulative)} Total
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={equityData}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cumulative >= 0 ? '#26a69a' : '#ef5350'} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={cumulative >= 0 ? '#26a69a' : '#ef5350'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--tv-chart-grid))" vertical={false}/>
            <XAxis dataKey="date" tick={{fill:'rgb(var(--tv-chart-label))',fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'rgb(var(--tv-chart-label))',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={(v)=>formatCurrency(v)}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Area type="monotone" dataKey="equity" stroke={cumulative >= 0 ? '#26a69a' : '#ef5350'} fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
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
      <div className="card border-l-4 border-l-tv-blue">
        <div className="section-title mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-tv-blue/10 flex items-center justify-center">🤖</span> 
          AI Behavioral Coach — Real-time Correlation Analysis
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynamicInsights.length > 0 ? (
            dynamicInsights.map(ins=>(
              <div key={ins.title} className="p-4 bg-tv-surface2 rounded-xl border border-tv-border hover:border-tv-blue/30 transition-all hover:scale-[1.02]">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{ins.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm mb-1" style={{color:ins.color}}>{ins.title}</div>
                    <div className="text-tv-muted text-xs leading-relaxed">{ins.desc}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-tv-muted italic">
              Collecting more behavioral data to generate AI insights...
            </div>
          )}
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
