import { useState, useEffect } from 'react';
import { BookOpen, Shield, Plus, X, Save, Clock, Activity, AlertTriangle, Lock, Info, RefreshCw, Moon, TrendingDown, BarChart2, Timer } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';

const ALL_RULES = [
  { key: 'maxSessionHours', label: 'Max Session Duration', icon: Clock, color: '#2962ff', unit: 'hours', placeholder: '4',
    desc: 'Limits how many continuous hours a trader can stay on the charts. Trading fatigue sets in after 3–4 hours — decisions degrade significantly beyond this threshold.' },
  { key: 'forcedBreakMins', label: 'Forced Break Reminder', icon: Timer, color: '#26a69a', unit: 'minutes', placeholder: '90',
    desc: 'Sends a notification after X minutes urging you to step away from the screen. Prevents cognitive exhaustion from non-stop focus.' },
  { key: 'lateNightBlock', label: 'Late Night / Low-Liquidity Alert', icon: Moon, color: '#9c27b0', unit: 'start hour (0-23)', placeholder: '22',
    desc: 'Warns you if you open trading platforms in low-liquidity hours. Late-night trading correlates strongly with impulsive, emotionally-driven decisions.' },
  { key: 'maxSymbolHops', label: 'Symbol Hopping Limit (FOMO)', icon: Activity, color: '#ff9800', unit: 'switches / 5 min', placeholder: '8',
    desc: 'Alerts when you rapidly switch between more than X different charts within 5 minutes — a classic FOMO-hunting signature. Forces you to commit to a single setup.' },
  { key: 'maxDwellMins', label: 'Chart Paralysis Dwell Time', icon: BarChart2, color: '#f7b500', unit: 'minutes', placeholder: '15',
    desc: 'Flags when you stare at a single chart without interaction for longer than X minutes — indicating indecision, fear, or hope-based watching instead of acting on your plan.' },
  { key: 'maxRefreshPerHour', label: 'Compulsive Refresh Limit', icon: RefreshCw, color: '#ef5350', unit: 'refreshes / hour', placeholder: '20',
    desc: 'Sends a nudge if you refresh the page or P&L tab more than X times per hour — a strong anxiety and loss-chasing indicator that precedes impulsive trades.' },
  { key: 'maxTradesPerDay', label: 'Max Trades Per Day (Overtrading)', icon: TrendingDown, color: '#e91e63', unit: 'trades', placeholder: '3',
    desc: 'Triggers a critical "Stop Trading" alert once you execute more than X trades in a single day. Overtrading is the #1 behavioral mistake across all markets.' },
  { key: 'postLossCooldownMins', label: 'Post-Loss Cooldown (Revenge Guard)', icon: AlertTriangle, color: '#ff5722', unit: 'minutes', placeholder: '15',
    desc: 'Forces a mandatory waiting period in minutes after every losing trade before opening a new one. This directly breaks the revenge-trading cycle at its root.' },
  { key: 'maxConsecutiveLosses', label: 'Consecutive Loss Kill Switch', icon: Shield, color: '#795548', unit: 'losses', placeholder: '2',
    desc: 'Fires a harsh "Stop Trading for Today" alert when you hit X back-to-back losses. Consecutive losses create emotional spirals that exponentially compound your drawdown.' },
];

export default function MyRulesPage() {
  const { user, updateUser } = useAuthStore();
  const { tradingRules, updateRules, markRulesRead, entryChecklistRules, updateEntryChecklistRules } = useAppStore();

  const [localRules, setLocalRules] = useState<string[]>([...tradingRules]);
  const [newRule, setNewRule] = useState('');
  const [localEntryRules, setLocalEntryRules] = useState<string[]>([...entryChecklistRules]);
  const [newEntryRule, setNewEntryRule] = useState('');
  const [bRules, setBRules] = useState<Record<string, any>>(user?.behaviorRules || {});
  const [lockDays, setLockDays] = useState(1);
  const [globalConfig, setGlobalConfig] = useState<Record<string, boolean>>({});
  const [tooltip, setTooltip] = useState<string | null>(null);

  const isLocked = bRules.tiltLockUntil ? bRules.tiltLockUntil > Date.now() : false;
  const lockUntilDate = isLocked ? new Date(bRules.tiltLockUntil).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  useEffect(() => {
    api.get('/global-rules').then(({ data }) => setGlobalConfig(data)).catch(() => {});
  }, []);

  const visibleRules = ALL_RULES.filter(r => globalConfig[r.key] !== false);

  const handleSaveBehaviorRules = () => {
    updateUser({ behaviorRules: bRules });
    window.postMessage({ source: 'tradeguru-web-app', type: 'UPDATE_RULES', payload: bRules }, '*');
    toast.success('Behavioral limits saved! 🛡️');
  };

  const handleApplyLock = () => {
    if (isLocked) return toast.error('Rules are already locked!');
    const newRules = { ...bRules, tiltLockUntil: Date.now() + lockDays * 24 * 60 * 60 * 1000 };
    setBRules(newRules);
    updateUser({ behaviorRules: newRules });
    window.postMessage({ source: 'tradeguru-web-app', type: 'UPDATE_RULES', payload: newRules }, '*');
    toast.success(`Rules locked for ${lockDays} day${lockDays > 1 ? 's' : ''}! 🔒`);
  };

  const handleSaveRules = () => {
    updateRules(localRules);
    markRulesRead();
    toast.success('Rules updated successfully');
  };

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setLocalRules([...localRules, newRule.trim()]);
    setNewRule('');
  };

  const handleSaveEntryRules = () => {
    updateEntryChecklistRules(localEntryRules);
    toast.success('Trade entry checklist updated');
  };

  const handleAddEntryRule = () => {
    if (!newEntryRule.trim()) return;
    setLocalEntryRules([...localEntryRules, newEntryRule.trim()]);
    setNewEntryRule('');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-tv-blue"/>My Rules</h1>
        <p className="text-tv-muted text-sm mt-0.5">Manage your behavioral limits and trading rules</p>
      </div>

      {/* ── Behavioral Limits & Tilt Protection ── */}
      <div className="card space-y-5">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-tv-blue mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-tv-text text-base">Behavioral Limits &amp; Tilt Protection</h3>
            <p className="text-tv-muted text-xs mt-0.5">
              Set your hard limits below. Once locked, you cannot <em>relax</em> these rules until the lock expires — but you can always make them stricter.
              {isLocked && <span className="ml-2 text-tv-red font-bold">🔒 Locked until {lockUntilDate}</span>}
            </p>
          </div>
        </div>

        {visibleRules.length === 0 ? (
          <div className="text-center py-8 text-tv-muted text-sm">
            No behavioral rules are currently enabled by the platform administrator.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleRules.map(rule => {
              const Icon = rule.icon;
              return (
                <div key={rule.key} className={`bg-tv-surface2 p-4 rounded-xl border transition-all ${isLocked ? 'border-tv-border/40 opacity-60' : 'border-tv-border hover:border-tv-blue/30'}`}>
                  <label className="text-xs text-tv-muted font-bold flex items-center gap-1.5 mb-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: rule.color }} />
                    {rule.label}
                    {/* Info tooltip */}
                    <div className="relative ml-auto">
                      <button
                        type="button"
                        onMouseEnter={() => setTooltip(rule.key)}
                        onMouseLeave={() => setTooltip(null)}
                        className="text-tv-muted hover:text-tv-blue transition-colors"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                      {tooltip === rule.key && (
                        <div className="absolute right-0 bottom-5 z-50 w-64 p-3 bg-tv-surface border border-tv-blue/30 rounded-xl shadow-2xl text-[11px] text-tv-muted leading-relaxed">
                          {rule.desc}
                          <div className="text-[10px] mt-1.5 text-tv-muted/60 font-mono">unit: {rule.unit}</div>
                        </div>
                      )}
                    </div>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input text-sm"
                    placeholder={`e.g. ${rule.placeholder}`}
                    value={(bRules as any)[rule.key] || ''}
                    onChange={e => setBRules({ ...bRules, [rule.key]: Number(e.target.value) })}
                    disabled={isLocked}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Save + Lock row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-4 border-t border-tv-border">
          <button onClick={handleSaveBehaviorRules} disabled={isLocked} className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" /> Save Behavioral Rules
          </button>
          <div className="flex gap-2 flex-1">
            <select
              className="input flex-1 bg-tv-bg text-sm"
              onChange={e => setLockDays(Number(e.target.value))}
              disabled={isLocked}
              value={isLocked ? 'locked' : lockDays}
            >
              {isLocked && <option value="locked">Currently Locked</option>}
              <option value={1}>Lock for 1 Day</option>
              <option value={7}>Lock for 7 Days</option>
              <option value={30}>Lock for 30 Days</option>
            </select>
            <button
              onClick={handleApplyLock}
              disabled={isLocked}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${isLocked ? 'bg-tv-surface border border-tv-border text-tv-muted cursor-not-allowed' : 'bg-tv-red text-white hover:bg-tv-red/80 glow-blue'}`}
            >
              <Lock className="w-4 h-4" />
              {isLocked ? 'Locked' : 'Apply Lock'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          {/* My Trading Rules Card */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-tv-blue"/>
              <div className="font-bold">My Trading Rules</div>
            </div>
            <p className="text-sm text-tv-muted mb-4">
              These rules will be presented to you every day before you can access the dashboard.
            </p>
            <ul className="space-y-2">
              {localRules.map((rule, idx) => (
                <li key={idx} className="flex gap-2 items-center bg-tv-surface2 p-3 rounded-lg border border-tv-border">
                  <span className="text-tv-muted font-bold text-xs">{idx + 1}.</span>
                  <span className="flex-1 text-sm text-tv-text">{rule}</span>
                  <button onClick={() => setLocalRules(localRules.filter((_, i) => i !== idx))} className="text-tv-muted hover:text-tv-red transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-4">
              <input value={newRule} onChange={(e) => setNewRule(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddRule()} placeholder="Add a new rule (e.g., Never average into a loser)" className="input flex-1" />
              <button onClick={handleAddRule} className="btn-ghost border border-tv-border"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleSaveRules} className="btn-primary w-full justify-center mt-4 glow-blue">
              <Save className="w-4 h-4" /> Save Rules
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Trade Entry Checklist Rules Card */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-tv-blue"/>
              <div className="font-bold">Trade Entry Checklist Rules</div>
            </div>
            <p className="text-sm text-tv-muted mb-4">
              These rules will be displayed as an interactive checklist when logging a new entry in your Trade Journal.
            </p>
            <ul className="space-y-2">
              {localEntryRules.map((rule, idx) => (
                <li key={idx} className="flex gap-2 items-center bg-tv-surface2 p-3 rounded-lg border border-tv-border">
                  <span className="text-tv-muted font-bold text-xs">{idx + 1}.</span>
                  <span className="flex-1 text-sm text-tv-text">{rule}</span>
                  <button onClick={() => setLocalEntryRules(localEntryRules.filter((_, i) => i !== idx))} className="text-tv-muted hover:text-tv-red transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-4">
              <input value={newEntryRule} onChange={(e) => setNewEntryRule(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddEntryRule()} placeholder="Add entry criterion (e.g., Risk-to-reward is at least 1:2)" className="input flex-1" />
              <button onClick={handleAddEntryRule} className="btn-ghost border border-tv-border"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleSaveEntryRules} className="btn-primary w-full justify-center mt-4 glow-blue">
              <Save className="w-4 h-4" /> Save Entry Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
