import { useState, useEffect, useRef } from 'react';
import { Play, Square, Wind, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PHASE_DURATIONS = {
  inhale: 4000,
  hold1: 4000,
  exhale: 4000,
  hold2: 4000,
};

const PHASE_TEXT = {
  inhale: "Breathe In...",
  hold1: "Hold...",
  exhale: "Breathe Out...",
  hold2: "Hold...",
};

export default function BoxBreathing() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [timeLeft, setTimeLeft] = useState(10);
  const [round, setRound] = useState(1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const phaseRef = useRef<Phase>(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const playTick = () => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      
      const p = phaseRef.current;
      const freq = p === 'inhale' ? 800 :
                   p === 'hold1' ? 600 :
                   p === 'exhale' ? 400 : 300; // Distinct sounds per phase

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignore audio errors
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      // Play initial tick for the very first step when activated
      playTick();
      interval = setInterval(() => {
        playTick();
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPhase((p) => {
              if (p === 'hold2') setRound(r => r + 1);
              const next: Record<Phase, Phase> = {
                inhale: 'hold1',
                hold1: 'exhale',
                exhale: 'hold2',
                hold2: 'inhale'
              };
              return next[p];
            });
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  // Reset when stopped
  useEffect(() => {
    if (!isActive) {
      setPhase('inhale');
      setTimeLeft(10);
      setRound(1);
    }
  }, [isActive]);

  const toggleSession = () => setIsActive(!isActive);

  return (
    <div className="card space-y-6 flex flex-col items-center p-8 relative overflow-hidden bg-tv-surface border-tv-border">
      {/* Background glow when active */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-[10000ms] ease-in-out pointer-events-none",
          isActive && phase === 'inhale' ? "bg-tv-blue/5 opacity-100" : "opacity-0"
        )} 
      />

      <div className="text-center z-10 space-y-1">
        <h3 className="text-xl font-bold text-tv-text flex items-center gap-2 justify-center">
          <Wind className="w-5 h-5 text-tv-blue" />
          Tactical Box Breathing - Stress Relief
        </h3>
        <p className="text-tv-muted text-sm max-w-sm">
          Reset your cortisol and tilt levels before a new session. 10 seconds in, 10 hold, 10 out, 10 hold.
        </p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center z-10 my-8">
        {/* Core animated circle */}
        <div 
          className={cn(
            "rounded-full border-4 flex items-center justify-center transition-all ease-linear",
            // State-based sizing and UI
            !isActive && "w-32 h-32 border-tv-border/50 bg-tv-surface2",
            isActive && phase === 'inhale' && "w-64 h-64 border-tv-blue bg-tv-blue/10 duration-[10000ms]",
            isActive && phase === 'hold1'  && "w-64 h-64 border-tv-blue bg-tv-blue/20 duration-1000",
            isActive && phase === 'exhale' && "w-32 h-32 border-tv-green bg-tv-surface2 duration-[10000ms]",
            isActive && phase === 'hold2'  && "w-32 h-32 border-tv-green/50 bg-tv-surface2 duration-1000"
          )}
        >
          {isActive ? (
            <div className="text-center">
              <Heart 
                className={cn(
                  "w-12 h-12 mx-auto fill-current transition-all text-tv-red",
                  phase === 'inhale' ? "scale-150 duration-[10000ms]" :
                  phase === 'hold1' ? "scale-150 duration-1000" :
                  phase === 'exhale' ? "scale-75 duration-[10000ms]" :
                  "scale-75 duration-1000" // hold2
                )} 
              />
              <div className="text-xl font-bold text-tv-text animate-fade-in drop-shadow-lg mt-4">
                {PHASE_TEXT[phase]}
              </div>
            </div>
          ) : (
            <div className="text-tv-muted font-medium text-sm flex flex-col items-center">
              <Heart className="w-8 h-8 text-tv-muted/50 mb-2" />
              Press Play
            </div>
          )}
        </div>
      </div>

      {isActive && (
        <div className="flex gap-8 items-center z-10 mb-4 bg-tv-surface2 p-4 rounded-xl border border-tv-border">
          <div className="text-center">
            <div className="text-tv-muted text-[10px] uppercase font-bold tracking-widest mb-1">Round</div>
            <div className="text-3xl font-mono text-tv-text font-bold">{round}</div>
          </div>
          <div className="w-px h-10 bg-tv-border"></div>
          <div className="text-center">
            <div className="text-tv-muted text-[10px] uppercase font-bold tracking-widest mb-1">Seconds</div>
            <div className={`text-3xl font-mono font-bold ${phase === 'inhale' || phase === 'hold1' ? 'text-tv-blue' : 'text-tv-green'}`}>
              {timeLeft}
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={toggleSession}
        className={cn(
          "btn-primary w-48 justify-center gap-2 z-10 transition-colors mt-2",
          isActive ? "bg-tv-red hover:bg-tv-red/80 glow-red" : "glow-blue"
        )}
      >
        {isActive ? (
          <><Square className="w-4 h-4 fill-current" /> Stop Exercise</>
        ) : (
          <><Play className="w-4 h-4 fill-current" /> Start Breathing</>
        )}
      </button>

    </div>
  );
}
