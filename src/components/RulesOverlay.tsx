import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RulesOverlay() {
  const { tradingRules, lastRulesReadDate, markRulesRead } = useAppStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if rules have been read today
    const today = new Date().toISOString().split('T')[0];
    if (lastRulesReadDate !== today) {
      // Delay the popup by 5 seconds as requested
      const popupTimeout = setTimeout(() => {
        setIsVisible(true);
        
        // Calculate required reading time based on user rules
        const totalWords = tradingRules.join(' ').split(/\s+/).length;
        const requiredSeconds = Math.max(10, Math.ceil((totalWords / 150) * 60));
        setTimeLeft(requiredSeconds);
      }, 5000);

      return () => clearTimeout(popupTimeout);
    }
  }, [lastRulesReadDate, tradingRules]);

  useEffect(() => {
    if (!isVisible || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isVisible, timeLeft]);

  const handleAcknowledge = () => {
    if (timeLeft > 0) return;
    markRulesRead();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-tv-bg flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-2xl w-full bg-tv-surface border border-tv-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up mt-10 mb-10">
        
        <div className="p-8 border-b border-tv-border bg-tv-yellow/5">
          <div className="flex items-center gap-4 text-tv-yellow mb-2">
            <ShieldAlert className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-tv-text">Daily Rules Acknowledgment</h1>
          </div>
          <p className="text-tv-muted mt-2">
            Before you access the terminal, you must read and acknowledge your trading rules. 
            This screen cannot be bypassed until the timer expires.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {tradingRules.length === 0 ? (
            <div className="text-tv-muted italic">You have no rules defined. You can add them in Settings.</div>
          ) : (
            <ul className="space-y-4">
              {tradingRules.map((rule, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-tv-surface2 flex items-center justify-center font-bold text-tv-text flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="pt-1 text-lg text-tv-text font-medium leading-relaxed">
                    {rule}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-8 border-t border-tv-border flex flex-col items-center gap-4 bg-tv-surface2/50">
          <div className="text-sm font-bold text-tv-muted uppercase tracking-wider">
            Time required to digest rules
          </div>
          <div className={cn(
            "text-4xl font-black font-mono transition-colors duration-300",
            timeLeft > 0 ? "text-tv-yellow" : "text-tv-green"
          )}>
            {timeLeft > 0 ? formatTime(timeLeft) : '0:00'}
          </div>
          
          <button
            onClick={handleAcknowledge}
            disabled={timeLeft > 0}
            className={cn(
              "mt-4 w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300",
              timeLeft > 0 
                ? "bg-tv-surface2 text-tv-muted cursor-not-allowed border border-tv-border" 
                : "bg-tv-green hover:bg-emerald-600 text-white shadow-lg shadow-tv-green/20"
            )}
          >
            {timeLeft > 0 ? (
              <>Wait {timeLeft}s to Acknowledge</>
            ) : (
              <><CheckCircle className="w-6 h-6" /> I Accept My Rules for Today</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
