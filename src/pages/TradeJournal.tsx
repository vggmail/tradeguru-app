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

function AddTradeModal({ onClose }: { onClose:()=>void }) {
  const addTrade = useAppStore(s=>s.addTrade);
  const [form, setForm] = useState({
    symbol:'', direction:'long' as 'long'|'short',
    entry:'', exit:'', sl:'', tp:'', riskPct:'1',
    timeframe:'1H', setupType:'Breakout',
    emotionBefore:'calm', emotionAfter:'calm', confidence:7,
    followedPlan:true, isImpulsive:false, lesson:'', notes:'',
  });

  const pnl = form.entry && form.exit
    ? (Number(form.exit)-Number(form.entry)) * (form.direction==='long'?1:-1)
    : 0;

  const submit = (e:React.FormEvent) => {
    e.preventDefault();
    if(!form.symbol||!form.entry||!form.exit) { toast.error('Fill required fields'); return; }
    addTrade({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      symbol: form.symbol.toUpperCase(),
      direction: form.direction,
      entry: Number(form.entry), exit: Number(form.exit),
      sl: Number(form.sl), tp: Number(form.tp),
      riskPct: Number(form.riskPct), pnl,
      timeframe: form.timeframe, setupType: form.setupType,
      emotionBefore: form.emotionBefore, emotionAfter: form.emotionAfter,
      confidence: form.confidence,
      followedPlan: form.followedPlan, isImpulsive: form.isImpulsive,
      lesson: form.lesson, notes: form.notes, tags:[],
    } as Trade);
    toast.success('Trade logged! 📈');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-tv-surface border border-tv-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-tv-border sticky top-0 bg-tv-surface">
          <div className="font-bold text-tv-text text-lg">Log Trade</div>
          <button onClick={onClose} className="text-tv-muted hover:text-tv-text transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-5">
          {/* Trade Details */}
          <div>
            <div className="label mb-3">Trade Details</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="label">Symbol *</label>
                <input className="input" placeholder="BTC/USDT" value={form.symbol} onChange={e=>setForm(p=>({...p,symbol:e.target.value}))} required/>
              </div>
              <div>
                <label className="label">Direction *</label>
                <div className="flex gap-2">
                  {(['long','short'] as const).map(d=>(
                    <button type="button" key={d} onClick={()=>setForm(p=>({...p,direction:d}))}
                      className={cn('flex-1 py-2.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-1 transition-all',
                        form.direction===d
                          ?d==='long'?'border-tv-green bg-tv-green/15 text-tv-green':'border-tv-red bg-tv-red/15 text-tv-red'
                          :'border-tv-border text-tv-muted hover:text-tv-text')}>
                      {d==='long'?<TrendingUp className="w-4 h-4"/>:<TrendingDown className="w-4 h-4"/>}
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Timeframe</label>
                <select className="input" value={form.timeframe} onChange={e=>setForm(p=>({...p,timeframe:e.target.value}))}>
                  {TIMEFRAMES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              {[['entry','Entry Price *'],['exit','Exit Price *'],['sl','Stop Loss'],['tp','Take Profit']].map(([k,l])=>(
                <div key={k}>
                  <label className="label">{l}</label>
                  <input type="number" className="input" placeholder="0.00"
                    value={(form as any)[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <label className="label">Risk %</label>
                <input type="number" className="input" step="0.1" value={form.riskPct} onChange={e=>setForm(p=>({...p,riskPct:e.target.value}))}/>
              </div>
            </div>
            {form.entry&&form.exit&&(
              <div className={cn('mt-3 p-3 rounded-lg border text-sm font-semibold flex items-center gap-2',
                pnl>=0?'bg-tv-green/10 border-tv-green/30 text-tv-green':'bg-tv-red/10 border-tv-red/30 text-tv-red')}>
                {pnl>=0?<TrendingUp className="w-4 h-4"/>:<TrendingDown className="w-4 h-4"/>}
                Estimated P&L: {formatCurrency(pnl)}
              </div>
            )}
          </div>

          {/* Setup */}
          <div>
            <label className="label">Setup Type</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SETUPS.map(s=>(
                <button type="button" key={s} onClick={()=>setForm(p=>({...p,setupType:s}))}
                  className={cn('px-3 py-1.5 rounded-lg border text-sm transition-all',
                    form.setupType===s?'border-tv-blue bg-tv-blue/15 text-tv-blue':'border-tv-border text-tv-muted hover:border-tv-hover hover:text-tv-text')}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Psychology */}
          <div>
            <div className="label mb-3">Pre-Trade Psychology</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Emotion Before</label>
                <select className="input" value={form.emotionBefore} onChange={e=>setForm(p=>({...p,emotionBefore:e.target.value}))}>
                  {EMOTIONS.map(e=><option key={e} value={e}>{emotionLabel(e).label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Emotion After</label>
                <select className="input" value={form.emotionAfter} onChange={e=>setForm(p=>({...p,emotionAfter:e.target.value}))}>
                  {EMOTIONS.map(e=><option key={e} value={e}>{emotionLabel(e).label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="label">Confidence (1-10): {form.confidence}</label>
              <input type="range" min={1} max={10} value={form.confidence}
                onChange={e=>setForm(p=>({...p,confidence:Number(e.target.value)}))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mt-1"
                style={{background:`linear-gradient(to right,#2962ff ${(form.confidence-1)/9*100}%,#2a2e39 ${(form.confidence-1)/9*100}%)`}}/>
            </div>
          </div>

          {/* Reflection */}
          <div className="space-y-3">
            <div className="label">Post-Trade Reflection</div>
            <div className="flex gap-4">
              {[
                {label:'Followed plan?',key:'followedPlan',val:form.followedPlan},
                {label:'Impulsive trade?',key:'isImpulsive',val:form.isImpulsive},
              ].map(item=>(
                <label key={item.key} className="flex items-center gap-2 cursor-pointer text-sm text-tv-text">
                  <div onClick={()=>setForm(p=>({...p,[item.key]:!item.val}))}
                    className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                      item.val?'bg-tv-blue border-tv-blue':'border-tv-border')}>
                    {item.val&&<Check className="w-3 h-3 text-white"/>}
                  </div>
                  {item.label}
                </label>
              ))}
            </div>
            <textarea value={form.lesson} onChange={e=>setForm(p=>({...p,lesson:e.target.value}))}
              placeholder="What's the biggest lesson from this trade?" className="input h-16 resize-none"/>
          </div>

          {form.isImpulsive&&(
            <div className="p-3 bg-tv-yellow/10 border border-tv-yellow/30 rounded-lg flex items-center gap-2 text-tv-yellow text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0"/>This will be flagged as an impulsive trade in your behavioral analytics.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost border border-tv-border">Cancel</button>
            <button type="submit" className="btn-primary glow-blue">Log Trade</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TradeJournal() {
  const { trades } = useAppStore();
  const [showModal, setShowModal] = useState(false);
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
          <button onClick={()=>setShowModal(true)} className="btn-primary glow-blue">
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
            </div>
          );
        })}
      </div>

      {showModal&&<AddTradeModal onClose={()=>setShowModal(false)}/>}
      {showImport&&<CsvImportModal onClose={()=>setShowImport(false)}/>}
    </div>
  );
}
