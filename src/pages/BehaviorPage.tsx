import { useState, useEffect } from 'react';
import { Activity, Eye, AlertTriangle, Clock, TrendingUp, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import api from '../api/client';

export default function BehaviorPage() {
  const { extensionInstalled, extensionData: extensionEvents = [], extensionStats, trades } = useAppStore();
  const [dbEvents, setDbEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/telemetry/events');
        setDbEvents(data);
      } catch (err) {
        console.error('Failed to fetch telemetry history', err);
      }
    };
    fetchHistory();
  }, []);

  // Merge events: Preference to local live events, but show history from DB
  const allEvents = [...(extensionEvents || [])];
  (dbEvents || []).forEach(dbE => {
    if (!allEvents.some(e => e.timestamp === dbE.timestamp && e.type === dbE.eventType)) {
      allEvents.push({ ...dbE, type: dbE.eventType });
    }
  });

  // Sort by time
  const sortedEvents = allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Reset extension data handler
  const handleResetData = () => {
    window.postMessage({ source: 'tradeguru-web-app', type: 'RESET_EXTENSION_DATA' }, '*');
  };

  // Compile real events or fallback
  const checksToday = extensionInstalled ? extensionStats.chartChecks : 63;
  const switchesToday = extensionInstalled ? extensionStats.symbolSwitches : 18;
  const lateNightEvents = (extensionEvents || []).filter(e => e.type === 'late_night');
  const lateNightCount = extensionInstalled ? lateNightEvents.length : 2;

  // Process live alerts
  let liveAlerts: { text: string; color: string; icon: any }[] = [];
  if (extensionInstalled) {
    const compulsiveChecks = (extensionEvents || []).filter(e => e.type === 'compulsive_check');
    const compulsiveRefreshes = (extensionEvents || []).filter(e => e.type === 'compulsive_refresh');
    
    compulsiveChecks.slice(-2).forEach(c => {
      liveAlerts.push({
        text: c.message,
        color: '#f7b500',
        icon: AlertTriangle
      });
    });

    compulsiveRefreshes.slice(-2).forEach(r => {
      liveAlerts.push({
        text: r.message,
        color: '#ff9800',
        icon: RefreshCw
      });
    });

    (extensionEvents || []).filter(e => ['hover_anxiety', 'analysis_paralysis', 'rule_broken'].includes(e.type)).slice(-3).forEach(e => {
      liveAlerts.push({
        text: e.message,
        color: e.type === 'rule_broken' ? '#f44336' : (e.type === 'hover_anxiety' ? '#ffeb3b' : '#03a9f4'),
        icon: AlertTriangle
      });
    });

    lateNightEvents.forEach(l => {
      liveAlerts.push({
        text: l.message,
        color: '#ef5350',
        icon: Clock
      });
    });

    // Check plan overrides
    const lastTrade = trades[0];
    if (lastTrade && lastTrade.isImpulsive) {
      liveAlerts.push({
        text: `Impulsive trade logged on ${lastTrade.symbol} — emotional discipline breach identified`,
        color: '#ef5350',
        icon: AlertTriangle
      });
    }
  } else {
    // Mock alerts
    liveAlerts = [
      { text: 'You checked BTC 47 times in the last 2 hours — post-loss anxiety signal', color: '#ef5350', icon: AlertTriangle },
      { text: 'Trading session exceeds 4 hours — fatigue risk increases after 3h', color: '#f7b500', icon: Clock },
      { text: 'Risk increased 3× compared to your plan — overconfidence after win', color: '#ff9800', icon: AlertTriangle },
    ];
  }

  // Process most monitored assets
  let monitoredAssets: { symbol: string; checks: number; pct: number; color: string }[] = [];
  if (extensionInstalled && (allEvents || []).length > 0) {
    const counts: Record<string, number> = {};
    (allEvents || []).forEach(e => {
      if (e.symbol && e.symbol !== 'UNKNOWN' && e.symbol !== 'N/A') {
        counts[e.symbol] = (counts[e.symbol] || 0) + 1;
      }
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const maxVal = sorted.length > 0 ? sorted[0][1] : 1;
    
    const colors = ['#ef5350', '#f7b500', '#2962ff', '#26a69a', '#ff9800'];
    monitoredAssets = sorted.slice(0, 5).map(([symbol, count], i) => ({
      symbol,
      checks: count,
      pct: Math.round((count / maxVal) * 100),
      color: colors[i % colors.length]
    }));
  } else {
    monitoredAssets = [
      { symbol: 'BTC/USDT', checks: 63, pct: 100, color: '#ef5350' },
      { symbol: 'ETH/USDT', checks: 28, pct: 44, color: '#f7b500' },
      { symbol: 'EUR/USD', checks: 15, pct: 24, color: '#2962ff' },
      { symbol: 'NIFTY50', checks: 9, pct: 14, color: '#26a69a' },
    ];
  }

  // Compile timeline items
  const timelineItems = sortedEvents
    .filter(e => ['symbol_switch', 'compulsive_check', 'compulsive_refresh', 'late_night', 'symbol_view', 'hover_anxiety', 'analysis_paralysis', 'rule_broken'].includes(e.type))
    .slice(0, 50)
    .map(e => {
      const timeStr = new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const good = e.signal === 'calm' || e.signal === 'focused';
      return {
        time: timeStr,
        title: `${(e.type || e.eventType || '').replace('_', ' ').toUpperCase()} (${e.symbol || 'N/A'})`,
        desc: e.message || 'Behavior tracked',
        good
      };
    });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-6 h-6 text-tv-blue"/>Behavioral Tracking</h1>
          <p className="text-tv-muted text-sm mt-0.5">Attention patterns, emotional triggers, and behavioral signals</p>
        </div>
        {extensionInstalled && (
          <button 
            onClick={handleResetData}
            className="btn-ghost border border-tv-red/30 hover:bg-tv-red/10 text-tv-red text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            Reset Tracker Data
          </button>
        )}
      </div>

      {/* Extension status & control panel */}
      {extensionInstalled ? (
        <div className="card border-tv-green/30 bg-tv-green/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tv-green/10 rounded-xl flex items-center justify-center border border-tv-green/20">
              <CheckCircle className="w-6 h-6 text-tv-green" />
            </div>
            <div>
              <div className="font-bold text-tv-text flex items-center gap-2">
                Chrome Extension Connected
                <span className="w-2 h-2 rounded-full bg-tv-green animate-pulse" />
              </div>
              <div className="text-tv-muted text-xs mt-0.5">
                Successfully tracking active symbol views, refreshes, and late-night sessions on TradingView and Binance.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Chart Checks Today', value: checksToday, color: '#26a69a' },
              { label: 'Symbol Switches', value: switchesToday, color: '#2962ff' },
              { label: 'Late Session Logs', value: lateNightCount, color: '#ef5350' },
            ].map(s => (
              <div key={s.label} className="bg-tv-surface rounded-lg p-3.5 border border-tv-border">
                <div className="text-tv-muted text-xs font-medium uppercase tracking-wider">{s.label}</div>
                <div className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Uninstalled banner */}
          <div className="card border-tv-blue/30 bg-tv-blue/5">
            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-tv-blue mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-tv-text">Activate Premium Attention Tracking Moat</div>
                <div className="text-tv-muted text-xs leading-relaxed max-w-2xl">
                  Connect your Chrome browser to track compulsive monitoring, chart switches, late-night trading, and focus retention on <strong>TradingView</strong>, <strong>Binance</strong>, <strong>XM Broker</strong>, and <strong>Exness</strong> in real-time.
                </div>
              </div>
            </div>

            {/* Instruction manual / Web store install */}
            <div className="mt-5 p-4 bg-tv-surface rounded-xl border border-tv-border space-y-4">
              <div className="text-xs font-bold text-tv-text flex items-center gap-1.5">
                <Info className="w-4 h-4 text-tv-blue" />
                Available on the Chrome Web Store
              </div>
              <div className="text-xs text-tv-muted">
                Install our official extension to instantly connect your broker platforms and TradingView to your Behavioral OS.
              </div>
              <button 
                onClick={() => window.open('https://chrome.google.com/webstore/detail/your-extension-id-here', '_blank')}
                className="btn-primary w-full sm:w-auto flex justify-center text-sm"
              >
                Install TradeGuru Extension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live alerts */}
      <div className="card">
        <div className="section-title mb-4">Live Behavioral Signals</div>
        {liveAlerts.length > 0 ? (
          <div className="space-y-3">
            {liveAlerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border"
                style={{ background: a.color + '10', borderColor: a.color + '30' }}>
                <a.icon className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" style={{ color: a.color }} />
                <span className="text-sm text-tv-text font-medium">{a.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 bg-tv-green/5 border border-tv-green/20 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-tv-green mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-tv-text">Flow State Stable</div>
              <div className="text-tv-muted text-xs mt-0.5">No emotional triggers, over-monitoring, or focus decay flags detected in this session. Good discipline!</div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline & Most Monitored Rows */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Behavioral Timeline */}
        <div className="card">
          <div className="section-title mb-4">
            {extensionInstalled ? "Real-Time Attention Events Timeline" : "Today's Behavioral Timeline (Demo)"}
          </div>
          <div className="space-y-0">
            {timelineItems.map((e, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${e.good ? 'bg-tv-green' : 'bg-tv-red'}`} />
                  {i < timelineItems.length - 1 && <div className="w-0.5 flex-1 bg-tv-border my-1" />}
                </div>
                <div className={`card mb-3.5 flex-1 border-l-2 ${e.good ? 'border-l-tv-green' : 'border-l-tv-red'}`}>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="text-tv-muted text-xs mb-1 font-semibold">{e.time}</div>
                      <div className="font-bold text-sm text-tv-text">{e.title}</div>
                      <div className="text-tv-muted text-xs mt-1 leading-relaxed">{e.desc}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attention heatmap preview */}
        <div className="card">
          <div className="section-title mb-4">
            {extensionInstalled ? "Monitored Symbol Frequency" : "Most Monitored Assets (Demo)"}
          </div>
          <div className="space-y-4">
            {monitoredAssets.map(a => (
              <div key={a.symbol} className="bg-tv-surface2 p-3 rounded-xl border border-tv-border/50 hover:border-tv-border transition-colors">
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="font-bold text-tv-text">{a.symbol}</span>
                  <span className="text-tv-muted text-xs font-semibold">{a.checks} checks</span>
                </div>
                <div className="h-2.5 bg-tv-surface rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${a.pct}%`, background: a.color }} />
                </div>
              </div>
            ))}
            {monitoredAssets.length === 0 && (
              <div className="text-center p-10 text-tv-muted text-sm">
                No asset views tracked yet. Open charts on TradingView or Binance to generate reports!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
