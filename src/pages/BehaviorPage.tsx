import { Activity, Eye, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

const EVENTS = [
  { time:'14:32', symbol:'BTC/USDT', type:'Compulsive refresh', count:23, signal:'anxiety', color:'#f7b500' },
  { time:'14:15', symbol:'ETH/USDT', type:'Rapid symbol switch', count:8, signal:'fomo', color:'#ff9800' },
  { time:'13:58', symbol:'BTC/USDT', type:'Post-loss monitoring', count:47, signal:'revenge', color:'#ef5350' },
  { time:'11:20', symbol:'EUR/USD', type:'Normal monitoring', count:5, signal:'calm', color:'#26a69a' },
  { time:'10:45', symbol:'NIFTY50', type:'Pre-trade research', count:12, signal:'focused', color:'#2962ff' },
];

const TIMELINE = [
  { time:'09:15', emotion:'😌 Calm', behavior:'Focused research', trade:'Long EUR/USD', outcome:'+$340', good:true },
  { time:'11:30', emotion:'😤 Frustrated', behavior:'Rapid switching', trade:'Short NIFTY50 (impulsive)', outcome:'-$880', good:false },
  { time:'13:45', emotion:'😡 Revenge', behavior:'Over-monitoring BTC', trade:'Long BTC (3× size)', outcome:'+$120', good:false },
  { time:'15:00', emotion:'🎯 Focused', behavior:'Checklist completed', trade:'Long BTC/USDT', outcome:'+$1700', good:true },
];

export default function BehaviorPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-6 h-6 text-tv-blue"/>Behavioral Tracking</h1>
        <p className="text-tv-muted text-sm mt-0.5">Attention patterns, emotional triggers, and behavioral signals</p>
      </div>

      {/* Extension placeholder */}
      <div className="card border-tv-blue/30 bg-tv-blue/5">
        <div className="flex items-center gap-3 mb-3">
          <Eye className="w-6 h-6 text-tv-blue"/>
          <div>
            <div className="font-bold text-tv-text">Chrome Extension — Attention Tracker</div>
            <div className="text-tv-muted text-sm">Tracks chart-checking, symbol switching, compulsive refreshing on TradingView & Binance</div>
          </div>
          <a href="#" className="btn-primary ml-auto whitespace-nowrap text-sm">Install Extension</a>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            {label:'Chart Checks Today',value:'63',color:'#f7b500'},
            {label:'Symbol Switches',value:'18',color:'#ff9800'},
            {label:'Post-Loss Spikes',value:'2',color:'#ef5350'},
          ].map(s=>(
            <div key={s.label} className="bg-tv-surface rounded-lg p-3 border border-tv-border">
              <div className="text-tv-muted text-xs">{s.label}</div>
              <div className="text-2xl font-bold mt-1" style={{color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live alerts */}
      <div className="card">
        <div className="section-title mb-4">Live Behavioral Signals</div>
        <div className="space-y-3">
          {[
            {text:'You checked BTC 47 times in the last 2 hours — post-loss anxiety signal',color:'#ef5350',icon:AlertTriangle},
            {text:'Trading session exceeds 4 hours — fatigue risk increases after 3h',color:'#f7b500',icon:Clock},
            {text:'Risk increased 3× compared to your plan — overconfidence after win',color:'#ff9800',icon:AlertTriangle},
          ].map((a,i)=>(
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border"
              style={{background:a.color+'10',borderColor:a.color+'30'}}>
              <a.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:a.color}}/>
              <span className="text-sm text-tv-text">{a.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Timeline */}
      <div className="card">
        <div className="section-title mb-4">Today's Behavioral Timeline</div>
        <div className="space-y-0">
          {TIMELINE.map((e,i)=>(
            <div key={i} className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${e.good?'bg-tv-green':'bg-tv-red'}`}/>
                {i<TIMELINE.length-1&&<div className="w-0.5 flex-1 bg-tv-border my-1"/>}
              </div>
              <div className={`card mb-3 flex-1 border-l-2 ${e.good?'border-l-tv-green':'border-l-tv-red'}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-tv-muted text-xs mb-1">{e.time}</div>
                    <div className="font-semibold text-sm text-tv-text">{e.emotion} → {e.behavior}</div>
                    <div className="text-tv-muted text-xs mt-0.5">{e.trade}</div>
                  </div>
                  <span className={`text-sm font-bold ${e.outcome.startsWith('+')?'text-tv-green':'text-tv-red'}`}>{e.outcome}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attention heatmap preview */}
      <div className="card">
        <div className="section-title mb-4">Most Monitored Assets</div>
        <div className="space-y-3">
          {[
            {symbol:'BTC/USDT',checks:63,pct:100,color:'#ef5350'},
            {symbol:'ETH/USDT',checks:28,pct:44,color:'#f7b500'},
            {symbol:'EUR/USD',checks:15,pct:24,color:'#2962ff'},
            {symbol:'NIFTY50',checks:9,pct:14,color:'#26a69a'},
          ].map(a=>(
            <div key={a.symbol}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-tv-text">{a.symbol}</span>
                <span className="text-tv-muted">{a.checks} checks</span>
              </div>
              <div className="h-2 bg-tv-surface2 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{width:`${a.pct}%`,background:a.color}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
