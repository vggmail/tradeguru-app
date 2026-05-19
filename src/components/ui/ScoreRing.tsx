import { scoreColor } from '../../lib/utils';

interface ScoreRingProps {
  score: number;
  size?: number;
  label: string;
  sublabel?: string;
}

export default function ScoreRing({ score, size = 100, label, sublabel }: ScoreRingProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="#2a2e39" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-tv-text text-xs font-semibold">{label}</div>
        {sublabel && <div className="text-tv-muted text-[10px]">{sublabel}</div>}
      </div>
    </div>
  );
}
