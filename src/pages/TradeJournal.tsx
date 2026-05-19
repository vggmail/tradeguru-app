import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, Trade } from '../store/appStore';
import { emotionLabel, formatCurrency, cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Plus, X, Check, AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import CsvImportModal from '../components/CsvImportModal';

const EMOTIONS = ['calm','focused','frustrated','fearful','revenge','fomo','excited','impulsive'];
const SETUPS = ['Breakout','Pullback','Rejection','Support bounce','Momentum','Range','Pattern','Other'];
const TIMEFRAMES = ['1M','5M','15M','1H','4H','1D','1W'];

export default function TradeJournal() {
  const { trades } = useAppStore();
  const navigate = useNavigate();
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState<'all'|'wins'|'losses'|'impulsive'>('all');

  const filtered = trades.filter(t => {
    if(filter==='wins') return t.pnl>0;
    if(filter==='losses') return t.pnl<0;
    if(filter==='impulsive') return t.isImpulsive;
    return true;
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trade Journal</h1>
          <p className="text-tv-muted text-sm mt-0.5">Psychology-driven trading log — not just P&L</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowImport(true)} className="btn-ghost border border-tv-border">
            <Upload className="w-4 h-4"/> Import CSV
          </button>
          <button onClick={() => navigate('/app/journal/log')} className="btn-primary glow-blue">
            <Plus className="w-4 h-4"/>Log Trade
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:'Total Trades',value:trades.length,color:'#d1d4dc'},
          {label:'P&L',value:formatCurrency(trades.reduce((s,t)=>s+t.pnl,0)),color:trades.reduce((s,t)=>s+t.pnl,0)>=0?'#26a69a':'#ef5350'},
          {label:'Win Rate',value:`${trades.length?(trades.filter(t=>t.pnl>0).length/trades.length*100).toFixed(0):0}%`,color:'#2962ff'},
          {label:'Impulsive',value:trades.filter(t=>t.isImpulsive).length,color:'#f7b500'},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <span className="text-tv-muted text-xs">{s.label}</span>
            <span className="text-xl font-bold" style={{color:s.color}}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all','wins','losses','impulsive'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={cn('px-4 py-1.5 rounded-lg border text-sm font-medium transition-all capitalize',
              filter===f?'border-tv-blue bg-tv-blue/15 text-tv-blue':'border-tv-border text-tv-muted hover:text-tv-text')}>
            {f}
          </button>
        ))}
      </div>

      {/* Trades */}
      <div className="space-y-3">
        {filtered.map(t=>{
          const em = emotionLabel(t.emotionBefore);
          return (
            <div key={t.id} className="card hover:border-tv-blue/30 transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-tv-text">{t.symbol}</span>
                  <span className={cn('badge-'+(t.direction==='long'?'green':'red'))}>
                    {t.direction==='long'?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}
                    {t.direction.toUpperCase()}
                  </span>
                  <span className="text-tv-muted text-xs">{t.timeframe} · {t.setupType}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{background:em.color+'20',color:em.color}}>{em.label}</span>
                  {t.isImpulsive&&<span className="badge-yellow"><AlertTriangle className="w-3 h-3"/>Impulsive</span>}
                  {!t.followedPlan&&<span className="badge-red">Plan violated</span>}
                </div>
                <div className={cn('text-lg font-bold flex-shrink-0',t.pnl>=0?'text-tv-green':'text-tv-red')}>
                  {formatCurrency(t.pnl)}
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3 text-xs">
                {[['Entry',t.entry],['Exit',t.exit],['SL',t.sl],['TP',t.tp],['Risk',`${t.riskPct}%`],['Date',t.date]].map(([l,v])=>(
                  <div key={l as string} className="bg-tv-surface2 rounded-lg p-2">
                    <div className="text-tv-muted">{l}</div>
                    <div className="font-semibold text-tv-text mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
              {t.lesson&&(
                <div className="mt-3 p-3 bg-tv-blue/5 border border-tv-blue/15 rounded-lg text-tv-text text-sm">
                  💡 {t.lesson}
                </div>
              )}
              {/* Rules Checklist results */}
              {t.rulesViolated && t.rulesViolated.length > 0 ? (
                <div className="mt-3 p-3 bg-tv-red/5 border border-tv-red/15 rounded-lg text-xs space-y-1.5">
                  <div className="font-bold text-tv-red flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5"/> Violated Trading Plan Rules:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-tv-muted">
                    {t.rulesViolated.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : t.rulesChecked && t.rulesChecked.length > 0 ? (
                <div className="mt-3 p-2.5 bg-tv-green/5 border border-tv-green/15 rounded-lg text-xs text-tv-green font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5"/> Followed all trading plan rules successfully!
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {showImport&&<CsvImportModal onClose={()=>setShowImport(false)}/>}
    </div>
  );
}
