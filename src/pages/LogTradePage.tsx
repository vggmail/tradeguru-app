import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { emotionLabel, formatCurrency, cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Check, AlertTriangle, ArrowLeft, Save, Pencil, Bot } from 'lucide-react';
import { toast } from 'sonner';
import AssetSelector from '../components/AssetSelector';

const EMOTIONS = ['calm','focused','frustrated','fearful','revenge','fomo','excited','impulsive'];
const SETUPS = ['Breakout','Pullback','Rejection','Support bounce','Momentum','Range','Pattern','Other'];
const TIMEFRAMES = ['1M','5M','15M','1H','4H','1D','1W','Live'];
const PLATFORMS = ['Manual', 'XM', 'Binance', 'TradingView', 'Exness'];

export default function LogTradePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const addTrade = useAppStore(s => s.addTrade);
  const updateTrade = useAppStore(s => s.updateTrade);
  const trades = useAppStore(s => s.trades);
  const entryChecklistRules = useAppStore(s => s.entryChecklistRules);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    symbol: '',
    direction: 'long' as 'long' | 'short',
    entry: '',
    exit: '',
    sl: '',
    tp: '',
    riskPct: '1',
    timeframe: '1H',
    setupType: 'Breakout',
    emotionBefore: 'calm',
    emotionAfter: 'calm',
    confidence: 7,
    followedPlan: true,
    isImpulsive: false,
    lesson: '',
    notes: '',
    platform: 'Manual',
    entryType: 'Customer Generated',
  });

  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    entryChecklistRules.forEach((_, idx) => { initial[idx] = true; });
    return initial;
  });

  // Pre-fill if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const trade = trades.find(t => t.id === id);
      if (trade) {
        setForm({
          symbol: trade.symbol || '',
          direction: trade.direction || 'long',
          entry: trade.entry !== -1 ? String(trade.entry) : '',
          exit: trade.exit !== -1 ? String(trade.exit) : '',
          sl: String(trade.sl || ''),
          tp: String(trade.tp || ''),
          riskPct: String(trade.riskPct || 1),
          timeframe: trade.timeframe || '1H',
          setupType: trade.setupType || 'Breakout',
          emotionBefore: trade.emotionBefore || 'calm',
          emotionAfter: trade.emotionAfter || 'calm',
          confidence: trade.confidence || 7,
          followedPlan: trade.followedPlan ?? true,
          isImpulsive: trade.isImpulsive ?? false,
          lesson: trade.lesson || '',
          notes: trade.notes || '',
          platform: trade.platform || 'Manual',
          entryType: trade.entryType || 'Customer Generated',
        });
        // Restore checklist state from violated rules
        if (entryChecklistRules.length > 0) {
          const violated = new Set(trade.rulesViolated || []);
          const rules: Record<number, boolean> = {};
          entryChecklistRules.forEach((r, i) => { rules[i] = !violated.has(r); });
          setCheckedRules(rules);
        }
      } else {
        toast.error('Trade not found');
        navigate('/app/journal');
      }
    }
  }, [id, isEditMode, trades]);

  const toggleRule = (idx: number) => {
    setCheckedRules(prev => {
      const next = { ...prev, [idx]: !prev[idx] };
      const allChecked = Object.values(next).every(v => v);
      setForm(f => ({ ...f, followedPlan: allChecked }));
      return next;
    });
  };

  const pnl = form.entry && form.exit
    ? (Number(form.exit) - Number(form.entry)) * (form.direction === 'long' ? 1 : -1)
    : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol) { toast.error('Symbol is required'); return; }

    setLoading(true);
    const rulesChecked = entryChecklistRules.filter((_, i) => checkedRules[i]);
    const rulesViolated = entryChecklistRules.filter((_, i) => !checkedRules[i]);

    try {
      const payload = {
        // Preserve original date in edit mode; use today for new trades
        date: (isEditMode && existingTrade) ? existingTrade.date : new Date().toISOString().split('T')[0],
        symbol: form.symbol.toUpperCase(),
        direction: form.direction,
        entry: form.entry ? Number(form.entry) : -1,
        exit: form.exit ? Number(form.exit) : -1,
        sl: Number(form.sl) || 0,
        tp: Number(form.tp) || 0,
        riskPct: Number(form.riskPct) || 1,
        pnl,
        timeframe: form.timeframe,
        setupType: form.setupType,
        emotionBefore: form.emotionBefore,
        emotionAfter: form.emotionAfter,
        confidence: form.confidence,
        followedPlan: form.followedPlan,
        isImpulsive: form.isImpulsive,
        lesson: form.lesson,
        notes: form.notes,
        platform: form.platform,
        tags: [],
        rulesChecked,
        rulesViolated,
        // updateTrade on backend will force entryType = 'Customer Generated'
      };

      if (isEditMode && id) {
        await updateTrade(id, payload);
      } else {
        await addTrade({ ...payload, entryType: 'Customer Generated' } as any);
      }
      navigate('/app/journal');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const existingTrade = isEditMode ? trades.find(t => t.id === id) : null;
  const isSystemGenerated = existingTrade?.entryType === 'System Generated';

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/journal')}
            className="p-2 bg-tv-surface2 hover:bg-tv-hover border border-tv-border rounded-xl text-tv-muted hover:text-tv-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-tv-text">
              {isEditMode ? 'Edit Trade' : 'Log New Trade'}
            </h1>
            <p className="text-tv-muted text-sm mt-0.5">
              {isEditMode ? 'Update trade details and compliance metrics' : 'Record transaction details and plan compliance metrics'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Entry type badge */}
          {isEditMode && (
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border',
              isSystemGenerated
                ? 'bg-tv-blue/10 border-tv-blue/30 text-tv-blue'
                : 'bg-tv-green/10 border-tv-green/30 text-tv-green'
            )}>
              {isSystemGenerated ? <Bot className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
              {existingTrade?.entryType || 'Customer Generated'}
            </div>
          )}
          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary glow-blue flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : isEditMode ? 'Update Trade' : 'Save Trade'}
          </button>
        </div>
      </div>

      {/* System-generated notice */}
      {isEditMode && isSystemGenerated && (
        <div className="p-3.5 bg-tv-blue/5 border border-tv-blue/20 rounded-xl flex items-start gap-3 text-sm">
          <Bot className="w-4 h-4 text-tv-blue flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-tv-blue font-semibold">Auto-detected trade.</span>
            <span className="text-tv-muted ml-1">This entry was created automatically by the TradeGuru Extension. Update the entry/exit prices and details, then save. It will be marked as <strong className="text-tv-text">Customer Generated</strong>.</span>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Left: Trade Parameters */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card space-y-4">
            <div className="font-bold text-tv-text text-base border-b border-tv-border pb-2">Trade Details</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="label">Symbol *</label>
                <AssetSelector value={form.symbol} onChange={val => setForm(p => ({ ...p, symbol: val }))} />
              </div>

              <div>
                <label className="label">Direction *</label>
                <div className="flex gap-2 mt-1">
                  {(['long', 'short'] as const).map(d => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setForm(p => ({ ...p, direction: d }))}
                      className={cn(
                        'flex-1 py-2 rounded-lg border text-sm font-semibold flex items-center justify-center gap-1 transition-all',
                        form.direction === d
                          ? d === 'long' ? 'border-tv-green bg-tv-green/15 text-tv-green' : 'border-tv-red bg-tv-red/15 text-tv-red'
                          : 'border-tv-border text-tv-muted hover:text-tv-text'
                      )}
                    >
                      {d === 'long' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Timeframe</label>
                <select className="input mt-1" value={form.timeframe} onChange={e => setForm(p => ({ ...p, timeframe: e.target.value }))}>
                  {TIMEFRAMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Platform</label>
                <select className="input mt-1" value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              {[
                ['entry', 'Entry Price'],
                ['exit', 'Exit Price'],
                ['sl', 'Stop Loss'],
                ['tp', 'Take Profit']
              ].map(([k, l]) => (
                <div key={k}>
                  <label className="label">{l}</label>
                  <input
                    type="number"
                    className="input mt-1"
                    placeholder="0.00"
                    value={(form as any)[k]}
                    onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Risk %</label>
                <input type="number" className="input mt-1" step="0.1" value={form.riskPct} onChange={e => setForm(p => ({ ...p, riskPct: e.target.value }))} />
              </div>
            </div>

            {form.entry && form.exit && (
              <div className={cn(
                'mt-4 p-4 rounded-xl border text-sm font-semibold flex items-center gap-2.5 transition-all',
                pnl >= 0 ? 'bg-tv-green/10 border-tv-green/20 text-tv-green' : 'bg-tv-red/10 border-tv-red/20 text-tv-red'
              )}>
                {pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                Estimated P&L: {formatCurrency(pnl)}
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <div className="font-bold text-tv-text text-base border-b border-tv-border pb-2">Setup & Rationale</div>
            <div>
              <label className="label mb-2 block">Trigger Strategy</label>
              <div className="flex flex-wrap gap-2">
                {SETUPS.map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setForm(p => ({ ...p, setupType: s }))}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all',
                      form.setupType === s
                        ? 'border-tv-blue bg-tv-blue/15 text-tv-blue'
                        : 'border-tv-border text-tv-muted hover:border-tv-hover hover:text-tv-text'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="label">Notes / Context</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Market context, order flow, chart structure..."
                  className="input mt-1 h-20 resize-none"
                />
              </div>
              <div>
                <label className="label">Lessons Learned</label>
                <textarea
                  value={form.lesson}
                  onChange={e => setForm(p => ({ ...p, lesson: e.target.value }))}
                  placeholder="Key takeaway or behavioral rule reinforced..."
                  className="input mt-1 h-20 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Rules & Psychology */}
        <div className="lg:col-span-2 space-y-6">
          {entryChecklistRules.length > 0 && (
            <div className="card space-y-4">
              <div className="font-bold text-tv-text text-base border-b border-tv-border pb-2">Entry Rule Verification</div>
              <p className="text-xs text-tv-muted">Unchecking a rule automatically flags this as plan-violating.</p>
              <div className="space-y-2">
                {entryChecklistRules.map((rule, idx) => {
                  const isChecked = checkedRules[idx] ?? true;
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleRule(idx)}
                      className={cn(
                        'flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:bg-tv-hover',
                        isChecked ? 'border-tv-green/20 bg-tv-green/5' : 'border-tv-red/25 bg-tv-red/5'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded flex items-center justify-center border-2 mt-0.5 transition-all flex-shrink-0',
                        isChecked ? 'bg-tv-green border-tv-green' : 'border-tv-border'
                      )}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="text-xs flex-1 leading-normal">
                        <span className="text-tv-muted font-bold mr-1">{idx + 1}.</span>
                        <span className={cn(isChecked ? 'text-tv-text font-medium' : 'text-tv-muted line-through')}>{rule}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card space-y-4">
            <div className="font-bold text-tv-text text-base border-b border-tv-border pb-2">Psychological Reflection</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Emotion Before Entry</label>
                <select className="input mt-1" value={form.emotionBefore} onChange={e => setForm(p => ({ ...p, emotionBefore: e.target.value }))}>
                  {EMOTIONS.map(e => <option key={e} value={e}>{emotionLabel(e).label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Emotion After Exit</label>
                <select className="input mt-1" value={form.emotionAfter} onChange={e => setForm(p => ({ ...p, emotionAfter: e.target.value }))}>
                  {EMOTIONS.map(e => <option key={e} value={e}>{emotionLabel(e).label}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="label">Confidence Level (1-10): {form.confidence}</label>
              <input
                type="range" min={1} max={10}
                value={form.confidence}
                onChange={e => setForm(p => ({ ...p, confidence: Number(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mt-2"
                style={{ background: `linear-gradient(to right, #2962ff ${(form.confidence - 1) / 9 * 100}%, #2a2e39 ${(form.confidence - 1) / 9 * 100}%)` }}
              />
            </div>

            <div className="pt-4 border-t border-tv-border space-y-3">
              <div className="flex gap-4">
                {[
                  { label: 'Followed trade plan?', key: 'followedPlan', val: form.followedPlan },
                  { label: 'Was this impulsive?', key: 'isImpulsive', val: form.isImpulsive },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2.5 cursor-pointer text-sm text-tv-text">
                    <div
                      onClick={() => setForm(p => ({ ...p, [item.key]: !item.val }))}
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        item.val ? 'bg-tv-blue border-tv-blue' : 'border-tv-border'
                      )}
                    >
                      {item.val && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {item.label}
                  </label>
                ))}
              </div>

              {form.isImpulsive && (
                <div className="p-3 bg-tv-yellow/10 border border-tv-yellow/30 rounded-lg flex items-center gap-2 text-tv-yellow text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> This trade will be flagged as impulsive in behavioral diagnostics.
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
