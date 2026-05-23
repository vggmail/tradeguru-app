import { useEffect, useState } from 'react';
import { Shield, Clock, Activity, AlertTriangle, RefreshCw, Moon, TrendingDown, BarChart2, Timer, Info, CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../api/client';
import { toast } from 'sonner';

const ALL_RULES = [
  {
    key: 'maxSessionHours',
    label: 'Max Session Duration',
    icon: Clock,
    color: '#2962ff',
    description: 'Limits how many continuous hours a trader can stay on the charts per session. Trading fatigue sets in after 3–4 hours — decisions degrade significantly beyond this.',
    unit: 'hours', placeholder: '4',
  },
  {
    key: 'forcedBreakMins',
    label: 'Forced Break Reminder',
    icon: Timer,
    color: '#26a69a',
    description: 'Sends a notification after X minutes urging the trader to step away from the screen. Prevents cognitive exhaustion from non-stop focus.',
    unit: 'mins', placeholder: '90',
  },
  {
    key: 'lateNightBlock',
    label: 'Late Night / Low-Liquidity Warning',
    icon: Moon,
    color: '#9c27b0',
    description: 'Warns the trader if they open trading platforms in low-liquidity hours (e.g., midnight to 6 AM local time). Late-night trading correlates with impulsive, emotional decisions.',
    unit: 'start hour (0–23)', placeholder: '22',
  },
  {
    key: 'maxSymbolHops',
    label: 'Symbol Hopping Limit (FOMO)',
    icon: Activity,
    color: '#ff9800',
    description: 'Alerts when the trader rapidly switches between more than X different charts within 5 minutes — a classic FOMO-hunting signature.',
    unit: 'switches / 5m', placeholder: '8',
  },
  {
    key: 'maxDwellMins',
    label: 'Chart Paralysis Dwell Time',
    icon: BarChart2,
    color: '#f7b500',
    description: 'Flags when the trader stares at a single chart without interaction for longer than X minutes — indicating indecision, fear, or hope-based watching.',
    unit: 'mins', placeholder: '15',
  },
  {
    key: 'maxRefreshPerHour',
    label: 'Compulsive Refresh Limit',
    icon: RefreshCw,
    color: '#ef5350',
    description: 'Sends a nudge if the trader refreshes the page or P&L tab more than X times in one hour — a strong anxiety and loss-chasing indicator.',
    unit: 'refreshes / hr', placeholder: '20',
  },
  {
    key: 'maxTradesPerDay',
    label: 'Max Trades Per Day (Overtrading)',
    icon: TrendingDown,
    color: '#e91e63',
    description: 'Triggers a critical "Stop Trading" alert once the trader executes more than X trades in a single day. Overtrading is the #1 behavioral mistake across all markets.',
    unit: 'trades', placeholder: '3',
  },
  {
    key: 'postLossCooldownMins',
    label: 'Post-Loss Cooldown (Revenge Guard)',
    icon: AlertTriangle,
    color: '#ff5722',
    description: 'Forces a mandatory waiting period in minutes after every losing trade before opening a new one. This breaks the revenge-trading cycle at its root.',
    unit: 'mins', placeholder: '15',
  },
  {
    key: 'maxConsecutiveLosses',
    label: 'Consecutive Loss Kill Switch',
    icon: Shield,
    color: '#795548',
    description: 'Fires a harsh "Stop Trading for Today" alert when the trader hits X back-to-back losses. Consecutive losses create emotional spirals that compound losses.',
    unit: 'losses', placeholder: '2',
  },
];

export default function AdminRules() {
  const [globalConfig, setGlobalConfig] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/global-rules').then(({ data }) => {
      setGlobalConfig(data);
    }).catch(() => toast.error('Failed to load rule config')).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: string, current: boolean) => {
    setSaving(key);
    try {
      await api.patch(`/admin/global-rules/${key}`, { enabled: !current });
      setGlobalConfig(prev => ({ ...prev, [key]: !current }));
      toast.success(`Rule "${key}" ${!current ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update rule');
    } finally {
      setSaving(null);
    }
  };

  const enabledCount = Object.values(globalConfig).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card border-tv-blue/30 bg-tv-blue/5">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-tv-blue mt-0.5" />
          <div>
            <h2 className="font-bold text-tv-text text-lg">Behavioral Rule Configuration</h2>
            <p className="text-tv-muted text-sm mt-0.5">
              Toggle which behavioral limit questions are visible to traders in their Settings page.
              Currently <span className="text-tv-blue font-bold">{enabledCount} of {ALL_RULES.length}</span> rules are enabled.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="card flex items-center justify-center py-16 text-tv-muted gap-3">
          <Loader className="w-5 h-5 animate-spin" /> Loading rule configuration...
        </div>
      ) : (
        <div className="grid gap-4">
          {ALL_RULES.map((rule) => {
            const Icon = rule.icon;
            const enabled = globalConfig[rule.key] ?? true;
            const isSaving = saving === rule.key;
            return (
              <div
                key={rule.key}
                className={`card flex items-center gap-4 transition-all duration-200 ${enabled ? 'border-tv-border' : 'opacity-50 border-tv-border/30 bg-tv-surface/50'}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: rule.color + '22' }}>
                  <Icon className="w-5 h-5" style={{ color: rule.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-tv-text">{rule.label}</span>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setTooltip(rule.key)}
                        onMouseLeave={() => setTooltip(null)}
                        className="text-tv-muted hover:text-tv-blue transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      {tooltip === rule.key && (
                        <div className="absolute left-6 top-0 z-50 w-72 p-3 bg-tv-surface2 border border-tv-border rounded-xl shadow-xl text-xs text-tv-muted leading-relaxed">
                          {rule.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-tv-muted mt-0.5">
                    Unit: <span className="font-mono text-tv-text/60">{rule.unit}</span>
                    <span className="mx-2">·</span>
                    <span className="font-mono text-[10px] text-tv-muted/60">{rule.key}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {enabled
                    ? <span className="text-[10px] font-black uppercase tracking-widest text-tv-green bg-tv-green/10 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Visible</span>
                    : <span className="text-[10px] font-black uppercase tracking-widest text-tv-red bg-tv-red/10 px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Hidden</span>
                  }
                  <button
                    onClick={() => handleToggle(rule.key, enabled)}
                    disabled={isSaving}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${enabled ? 'bg-tv-blue' : 'bg-tv-surface2 border border-tv-border'}`}
                  >
                    {isSaving
                      ? <Loader className="w-3 h-3 animate-spin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                      : <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow ${enabled ? 'left-7' : 'left-1'}`} />
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
