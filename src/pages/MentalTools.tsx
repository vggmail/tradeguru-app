import BoxBreathing from '../components/BoxBreathing';
import CognitiveGame from '../components/CognitiveGame';
import { Target } from 'lucide-react';

export default function MentalTools() {
  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-tv-blue" />
          Mental Tools
        </h1>
        <p className="text-tv-muted text-sm mt-0.5">
          Reset your mind, lower cortisol, and test your cognitive readiness before entering the market.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <BoxBreathing />
        <CognitiveGame />
      </div>
    </div>
  );
}
