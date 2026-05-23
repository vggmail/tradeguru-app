import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, X, Check } from 'lucide-react';
import { useAppStore, SessionPlan } from '../store/appStore';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const MARKETS = ['BTC/USDT','ETH/USDT','EUR/USD','GBP/USD','NIFTY50','GOLD','AAPL','TSLA'];

export default function SessionPlanning() {
  const { sessionPlans, addSessionPlan, activeSession, startSession } = useAppStore();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(!sessionPlans.length);
  const [markets, setMarkets] = useState<string[]>([]);
  const [rules, setRules] = useState(['No revenge trading', 'Respect stop-loss', 'Max 3 trades']);
  const [newRule, setNewRule] = useState('');
  const [form, setForm] = useState({ setups:'', maxLoss:3, maxTrades:3, notes:'' });

  const toggleMarket = (m:string) => setMarkets(p => p.includes(m)?p.filter(x=>x!==m):[...p,m]);

  const addRule = () => {
    if(newRule.trim()){ setRules(p=>[...p,newRule.trim()]); setNewRule(''); }
  };

  const submit = (e:React.FormEvent) => {
    e.preventDefault();
    addSessionPlan({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      markets, rules, ...form,
      maxLoss: Number(form.maxLoss),
      maxTrades: Number(form.maxTrades),
    });
    toast.success('Session plan saved! 📋');
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="w-6 h-6 text-tv-blue"/>Session Planning</h1>
          <p className="text-tv-muted text-sm mt-0.5">Define your rules before entering the market</p>
        </div>
        <button onClick={()=>setShowForm(p=>!p)} className="btn-primary">
          <Plus className="w-4 h-4"/>New Plan
        </button>
      </div>

      {showForm&&(
        <form onSubmit={submit} className="card space-y-5 animate-slide-up">
          <div className="font-bold text-tv-text">Today's Session Plan — {new Date().toLocaleDateString()}</div>

          <div>
            <label className="label">Markets to Watch</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {MARKETS.map(m=>(
                <button type="button" key={m} onClick={()=>toggleMarket(m)}
                  className={cn('px-3 py-1.5 rounded-lg border text-sm transition-all',
                    markets.includes(m)?'border-tv-blue bg-tv-blue/15 text-tv-blue':'border-tv-border text-tv-muted hover:text-tv-text')}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Planned Setups</label>
            <textarea value={form.setups} onChange={e=>setForm(p=>({...p,setups:e.target.value}))}
              placeholder="e.g. BTC breakout above 68k with volume confirmation; EUR/USD rejection at 1.09..."
              className="input h-20 resize-none"/>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Max Daily Loss (%)</label>
              <input type="number" className="input" step="0.5" value={form.maxLoss}
                onChange={e=>setForm(p=>({...p,maxLoss:Number(e.target.value)}))}/>
            </div>
            <div>
              <label className="label">Max Trades</label>
              <input type="number" className="input" value={form.maxTrades}
                onChange={e=>setForm(p=>({...p,maxTrades:Number(e.target.value)}))}/>
            </div>
          </div>

          <div>
            <label className="label">Discipline Rules</label>
            <ul className="space-y-2 mb-3">
              {rules.map((r,i)=>(
                <li key={i} className="flex items-center gap-2 text-sm text-tv-text">
                  <Check className="w-4 h-4 text-tv-green flex-shrink-0"/>
                  <span className="flex-1">{r}</span>
                  <button type="button" onClick={()=>setRules(p=>p.filter((_,j)=>j!==i))} className="text-tv-muted hover:text-tv-red transition-colors">
                    <X className="w-3 h-3"/>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input value={newRule} onChange={e=>setNewRule(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addRule())}
                placeholder="Add a custom rule..." className="input flex-1 text-sm"/>
              <button type="button" onClick={addRule} className="btn-ghost border border-tv-border">Add</button>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
              placeholder="Market conditions, key levels, news events to watch..." className="input h-16 resize-none"/>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost border border-tv-border">Cancel</button>
            <button type="submit" className="btn-primary glow-blue"><Check className="w-4 h-4"/>Save Plan</button>
          </div>
        </form>
      )}

      {/* Past plans */}
      <div className="space-y-3">
        {sessionPlans.map(p=>(
          <div key={p.id} className="card hover:border-tv-blue/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="font-semibold text-tv-text flex items-center gap-2">
                {p.date}
                {activeSession?.planId === p.id && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tv-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tv-green"></span>
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {p.markets.map(m=><span key={m} className="badge-blue">{m}</span>)}
              </div>
            </div>
            {p.setups&&<p className="text-tv-muted text-sm mb-3">{p.setups}</p>}
            <div className="flex gap-4 text-xs text-tv-muted mb-3">
              <span>Max Loss: <strong className="text-tv-red">{p.maxLoss}%</strong></span>
              <span>Max Trades: <strong className="text-tv-text">{p.maxTrades}</strong></span>
            </div>
            <div className="flex items-center justify-between border-t border-tv-border/40 pt-3 mt-3">
              <div className="flex flex-wrap gap-1.5">
                {p.rules.map((r,i)=>(
                  <span key={i} className="inline-flex items-center gap-1 text-xs text-tv-text bg-tv-surface2 px-2 py-1 rounded-lg border border-tv-border">
                    <Check className="w-3 h-3 text-tv-green"/>{r}
                  </span>
                ))}
              </div>
              
              {/* Session Controls */}
              {activeSession?.planId === p.id ? (
                <button type="button" onClick={() => navigate('/app/session/review')} 
                  className="btn-primary py-1 px-3 text-xs bg-tv-red hover:bg-tv-red/90 border-tv-red glow-red flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span> End & Review
                </button>
              ) : !activeSession ? (
                <button type="button" onClick={() => {
                  startSession(p.id);
                  toast.success('Trading session started! Live tracking enabled. 📈');
                  navigate('/app/dashboard');
                }} className="btn-primary py-1 px-3 text-xs glow-blue">
                  Start Trading
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {!sessionPlans.length&&!showForm&&(
          <div className="card text-center py-12 text-tv-muted">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30"/>
            <div>No session plans yet. Create one before trading.</div>
            <button onClick={()=>setShowForm(true)} className="btn-primary mx-auto mt-4">
              <Plus className="w-4 h-4"/>Create Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
