import { useState, useEffect, useRef } from 'react';
import { Target, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CognitiveGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [targetColorClass, setTargetColorClass] = useState<string>('bg-tv-blue border-tv-blue glow-blue');
  const [score, setScore] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const startTimeRef = useRef<number>(0);
  const roundCount = 10;

  const startGame = () => {
    setScore(0);
    setReactionTimes([]);
    setGameOver(false);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isPlaying && !gameOver && reactionTimes.length === 0) {
      // Countdown finished, start the game
      setIsPlaying(true);
      nextRound();
    }
  }, [countdown, isPlaying, gameOver]);

  const nextRound = () => {
    // Pick a random square (0-8)
    const nextIdx = Math.floor(Math.random() * 9);
    
    const TARGET_COLORS = [
      'bg-tv-blue border-tv-blue shadow-[0_0_20px_rgba(41,98,255,0.6)]',
      'bg-tv-green border-tv-green shadow-[0_0_20px_rgba(38,166,154,0.6)]',
      'bg-tv-red border-tv-red shadow-[0_0_20px_rgba(239,83,80,0.6)]',
      'bg-purple-500 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]',
      'bg-yellow-500 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.6)]',
      'bg-pink-500 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.6)]'
    ];
    
    setTargetColorClass(TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)]);
    setTargetIndex(nextIdx);
    startTimeRef.current = Date.now();
  };

  const handleBoxClick = (index: number) => {
    if (!isPlaying) return;

    if (index === targetIndex) {
      const reactionTime = Date.now() - startTimeRef.current;
      const newTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newTimes);
      setScore(score + 1);

      if (newTimes.length >= roundCount) {
        setIsPlaying(false);
        setGameOver(true);
        setTargetIndex(null);
      } else {
        setTargetIndex(null);
        // Small delay before next target appears
        setTimeout(() => nextRound(), 200 + Math.random() * 400);
      }
    } else {
      // Miss click penalty (+500ms)
      const newTimes = [...reactionTimes, 500]; // simulate slow reaction on miss
      setReactionTimes(newTimes);
      if (newTimes.length >= roundCount) {
        setIsPlaying(false);
        setGameOver(true);
        setTargetIndex(null);
      } else {
        setTargetIndex(null);
        setTimeout(() => nextRound(), 200);
      }
    }
  };

  const avgReactionTime = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  let assessment = "";
  let colorClass = "";
  if (gameOver) {
    if (avgReactionTime < 350) {
      assessment = "Excellent Focus. You are sharp and ready to trade.";
      colorClass = "text-tv-green";
    } else if (avgReactionTime < 500) {
      assessment = "Moderate Readiness. Proceed with standard caution.";
      colorClass = "text-tv-blue";
    } else {
      assessment = "Cognitive Fatigue Detected. Avoid trading right now.";
      colorClass = "text-tv-red";
    }
  }

  return (
    <div className="card space-y-6 flex flex-col items-center p-8 bg-tv-surface border-tv-border min-h-[400px]">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-tv-text flex items-center gap-2 justify-center">
          <Zap className="w-5 h-5 text-tv-blue" />
          Focus Calibrator test
        </h3>
        <p className="text-tv-muted text-sm max-w-sm">
          Test your reaction time. Click the randomly appearing colored squares as fast as you can. 10 rounds.
        </p>
      </div>

      {!isPlaying && !gameOver && countdown === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <button onClick={startGame} className="btn-primary py-3 px-8 text-lg glow-blue">
            <Target className="w-5 h-5 mr-2" /> Start Focus Test
          </button>
        </div>
      )}

      {countdown > 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-6xl font-bold text-tv-blue animate-bounce">
            {countdown}
          </div>
        </div>
      )}

      {isPlaying && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-tv-muted font-bold tracking-widest text-sm uppercase">
            Round {reactionTimes.length + 1} / {roundCount}
          </div>
          <div className="grid grid-cols-3 gap-2 p-2 bg-tv-surface2 rounded-xl border border-tv-border">
            {Array.from({ length: 9 }).map((_, idx) => (
              <button
                key={idx}
                onMouseDown={() => handleBoxClick(idx)}
                className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-lg transition-colors border",
                  targetIndex === idx 
                    ? `${targetColorClass} scale-105` 
                    : "bg-tv-bg border-tv-border/50 hover:bg-tv-hover"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 w-full max-w-sm animate-fade-in">
          <div className="bg-tv-surface2 p-6 rounded-xl border border-tv-border w-full text-center space-y-2">
            <div className="text-tv-muted text-sm uppercase tracking-wider font-bold">Average Reaction Time</div>
            <div className={`text-4xl font-bold ${colorClass}`}>
              {avgReactionTime} <span className="text-xl">ms</span>
            </div>
            <div className="text-sm mt-3 pt-3 border-t border-tv-border text-tv-text font-medium flex items-center gap-2 justify-center">
              {avgReactionTime >= 500 && <AlertTriangle className="w-4 h-4 text-tv-red" />}
              {assessment}
            </div>
          </div>
          
          <button onClick={startGame} className="btn-ghost border border-tv-border w-full justify-center">
            <RefreshCw className="w-4 h-4 mr-2" /> Retest Focus
          </button>
        </div>
      )}
    </div>
  );
}
