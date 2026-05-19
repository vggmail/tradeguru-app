import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TrendingUp, HelpCircle, Activity, Award, Brain, RefreshCw, LogOut, ArrowRight, MessageSquare } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';

export default function SessionReview() {
  const { activeSession, trades, extensionStats, endSession } = useAppStore();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [seconds, setSeconds] = useState(0);

  // If there's no active session, direct to planning
  useEffect(() => {
    if (!activeSession) {
      navigate('/app/session');
    }
  }, [activeSession, navigate]);

  // Track session timer
  useEffect(() => {
    if (activeSession) {
      const elapsed = Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000);
      setSeconds(elapsed);
      const interval = setInterval(() => {
        setSeconds(p => p + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  if (!activeSession) return null;

  // Calculate real-time session metrics
  const sessionTrades = trades.filter(t => t.date === activeSession.date);
  const totalTrades = sessionTrades.length;
  const netPnl = sessionTrades.reduce((acc, t) => acc + t.pnl, 0);
  const wins = sessionTrades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades ? Math.round((wins / totalTrades) * 100) : 0;
  
  const currentChartChecks = Math.max(0, (extensionStats.chartChecks || 0) - activeSession.startStatsSnapshot.chartChecks);
  const currentSymbolSwitches = Math.max(0, (extensionStats.symbolSwitches || 0) - activeSession.startStatsSnapshot.symbolSwitches);
  const currentPostLossSpikes = Math.max(0, (extensionStats.postLossSpikes || 0) - activeSession.startStatsSnapshot.postLossSpikes);

  const rulesViolatedCount = sessionTrades.reduce((acc, t) => acc + (t.rulesViolated?.length || 0), 0);
  const impulsiveCount = sessionTrades.filter(t => t.isImpulsive).length;

  // Real-time discipline score formula
  let disciplineScore = 100;
  if (totalTrades > 0) {
    disciplineScore -= (rulesViolatedCount * 15);
    disciplineScore -= (impulsiveCount * 25);
    if (currentChartChecks > 30) disciplineScore -= 10;
    if (currentSymbolSwitches > 10) disciplineScore -= 10;
    disciplineScore = Math.max(0, Math.min(100, disciplineScore));
  }

  // Format timer duration
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleEndSession = () => {
    endSession(notes);
    toast.success('Trading session ended and cataloged! 🎯');
    navigate('/app/dashboard');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header section with live glowing timer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-tv-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tv-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-tv-green"></span>
            </span>
            <h1 className="text-2xl font-bold flex items-center gap-2">Live Session Review</h1>
          </div>
          <p className="text-tv-muted text-sm mt-0.5">Reflecting on behaviors and performance</p>
        </div>
        <div className="flex items-center gap-3 bg-tv-surface2 border border-tv-border px-4 py-2 rounded-xl">
          <Activity className="w-5 h-5 text-tv-green animate-pulse" />
          <div className="text-right">
            <div className="text-xs text-tv-muted font-medium">Session Duration</div>
            <div className="text-lg font-mono font-bold text-tv-text">{formatTime(seconds)}</div>
          </div>
        </div>
      </div>

      {/* Grid of Scores */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Discipline Score dial card */}
        <div className="card flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-tv-surface to-tv-surface2 relative overflow-hidden">
          <div className="absolute top-3 left-3 bg-tv-blue/10 text-tv-blue border border-tv-blue/20 text-xs px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Process
          </div>
          <div className="relative flex items-center justify-center mt-3">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="50" stroke="#2a2e39" strokeWidth="8" fill="transparent" />
              <circle cx="64" cy="64" r="50" stroke={disciplineScore >= 80 ? '#26a69a' : disciplineScore >= 50 ? '#ffb119' : '#ef5350'} strokeWidth="8" fill="transparent"
                strokeDasharray="314.16" strokeDashoffset={314.16 - (314.16 * disciplineScore) / 100} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute text-3xl font-bold text-tv-text font-mono">{disciplineScore}%</div>
          </div>
          <div className="font-bold text-tv-text text-sm">Discipline Score</div>
          <p className="text-xs text-tv-muted max-w-[200px]">Computed dynamically from rule compliance and focus consistency</p>
        </div>

        {/* Real-time stats card */}
        <div className="card p-6 space-y-4">
          <div className="font-semibold text-tv-text flex items-center gap-2 border-b border-tv-border pb-2">
            <TrendingUp className="w-4 h-4 text-tv-blue" /> Session Metrics
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-tv-surface2 p-3 rounded-lg border border-tv-border/50 text-center">
              <div className="text-xs text-tv-muted">Net P&L</div>
              <div className={`text-lg font-bold font-mono mt-1 ${netPnl >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
                {netPnl >= 0 ? `+$${netPnl.toLocaleString()}` : `-$${Math.abs(netPnl).toLocaleString()}`}
              </div>
            </div>
            <div className="bg-tv-surface2 p-3 rounded-lg border border-tv-border/50 text-center">
              <div className="text-xs text-tv-muted">Total Trades</div>
              <div className="text-lg font-bold font-mono text-tv-text mt-1">{totalTrades}</div>
            </div>
            <div className="bg-tv-surface2 p-3 rounded-lg border border-tv-border/50 text-center">
              <div className="text-xs text-tv-muted">Win Rate</div>
              <div className="text-lg font-bold font-mono text-tv-text mt-1">{winRate}%</div>
            </div>
            <div className="bg-tv-surface2 p-3 rounded-lg border border-tv-border/50 text-center">
              <div className="text-xs text-tv-muted">Rules Violated</div>
              <div className={`text-lg font-bold font-mono mt-1 ${rulesViolatedCount > 0 ? 'text-tv-orange' : 'text-tv-green'}`}>
                {rulesViolatedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Extension real-time monitoring */}
        <div className="card p-6 space-y-4">
          <div className="font-semibold text-tv-text flex items-center gap-2 border-b border-tv-border pb-2">
            <Activity className="w-4 h-4 text-tv-green" /> Attention Tracker
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1 border-b border-tv-border/40">
              <span className="text-sm text-tv-muted">Chart Checks</span>
              <span className="font-mono font-bold text-tv-text text-sm">{currentChartChecks}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-tv-border/40">
              <span className="text-sm text-tv-muted">Symbol Switches</span>
              <span className="font-mono font-bold text-tv-text text-sm">{currentSymbolSwitches}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-tv-border/40">
              <span className="text-sm text-tv-muted">Post-Loss Screen Spikes</span>
              <span className={`font-mono font-bold text-sm ${currentPostLossSpikes > 0 ? 'text-tv-red' : 'text-tv-text'}`}>
                {currentPostLossSpikes}
              </span>
            </div>
            <p className="text-[10px] text-tv-muted leading-relaxed mt-2">
              ⚠️ Frequent switches and refreshes correlate directly with emotional impulse trading patterns. Keep screens calm.
            </p>
          </div>
        </div>
      </div>

      {/* AI Behavioral Coach - Rule-based Agent */}
      <div className="card p-6 space-y-4 border border-tv-blue/20 bg-gradient-to-r from-tv-surface to-tv-blue/5">
        <div className="font-semibold text-tv-text flex items-center gap-2">
          <Brain className="w-5 h-5 text-tv-blue animate-pulse" /> Live Behavioral Diagnosis
        </div>
        <div className="space-y-3 text-sm text-tv-muted">
          {totalTrades === 0 ? (
            <div className="flex gap-3 items-start p-3 bg-tv-surface2 rounded-lg border border-tv-border">
              <HelpCircle className="w-5 h-5 text-tv-blue flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-tv-text block mb-0.5">No trades logged yet</strong>
                Your behavioral scores will update dynamically as soon as you record your first trade entry for today's session.
              </div>
            </div>
          ) : (
            <>
              {impulsiveCount > 0 && (
                <div className="flex gap-3 items-start p-3 bg-tv-red/10 rounded-lg border border-tv-red/25">
                  <span className="text-tv-red font-bold text-xs bg-tv-red/20 px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">CRITICAL</span>
                  <div>
                    <strong className="text-tv-text block mb-0.5">Impulsive Trade Registered</strong>
                    You flagged {impulsiveCount} trade(s) as impulsive. Impulsive entries bypass planned checklists and represent the primary risk vector to your capital drawdown.
                  </div>
                </div>
              )}
              {currentSymbolSwitches > 8 && (
                <div className="flex gap-3 items-start p-3 bg-tv-orange/10 rounded-lg border border-tv-orange/25">
                  <span className="text-tv-orange font-bold text-xs bg-tv-orange/20 px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">WARNING</span>
                  <div>
                    <strong className="text-tv-text block mb-0.5">High Asset hopping / Hyper-Vigilance</strong>
                    You switched asset screens {currentSymbolSwitches} times. Hyper-monitoring charts causes cognitive fatigue and leads directly to revenge entries. Focus on a single instrument.
                  </div>
                </div>
              )}
              {rulesViolatedCount === 0 && impulsiveCount === 0 && (
                <div className="flex gap-3 items-start p-3 bg-tv-green/10 rounded-lg border border-tv-green/25">
                  <span className="text-tv-green font-bold text-xs bg-tv-green/20 px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">KUDOS</span>
                  <div>
                    <strong className="text-tv-text block mb-0.5">Plan Compliance Maintained</strong>
                    Excellent work! You strictly respected your stop-losses, followed your setups, and experienced zero rule violations. This is professional execution.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reflection notes form */}
      <div className="card p-6 space-y-4">
        <div className="font-semibold text-tv-text flex items-center gap-2 border-b border-tv-border pb-2">
          <MessageSquare className="w-4 h-4 text-tv-blue" /> Post-Session Notes & Reflection
        </div>
        <div className="space-y-3">
          <label className="label">What went well today? What will you do differently next session?</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Write down any details on psychological focus, sleep impact, or broker chart performance..."
            className="input h-28 resize-none" />
        </div>
      </div>

      {/* Action panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-tv-surface border border-tv-border p-4 rounded-2xl">
        <div className="text-xs text-tv-muted text-center sm:text-left">
          ⚠️ Ending this session will calculate final scores and archive today's behavioral timeline.
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button type="button" onClick={() => navigate('/app/dashboard')} className="btn-ghost border border-tv-border flex-1 sm:flex-initial">
            Back to Dashboard
          </button>
          <button type="button" onClick={handleEndSession} className="btn-primary flex-1 sm:flex-initial glow-red bg-tv-red border-tv-red text-white hover:bg-tv-red/90 flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> End Trading Session <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
