import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Moon, Target, Check, AlertTriangle, Zap } from 'lucide-react';
import { useAppStore, DailyCheckin } from '../store/appStore';
import { emotionLabel, cn } from '../lib/utils';
import { toast } from 'sonner';

const EMOTIONS = ['calm','focused','frustrated','fearful','revenge','fomo','excited','impulsive'];

function RangeSlider({ value, onChange, min=1, max=10, upColor='#26a69a', downColor='#ef5350' }:
  { value:number; onChange:(v:number)=>void; min?:number; max?:number; upColor?:string; downColor?:string }) {
  const pct = ((value-min)/(max-min))*100;
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
        style={{background:`linear-gradient(to right,${upColor} ${pct}%,#2a2e39 ${pct}%)`}}/>
      <span className="w-6 text-center font-bold text-sm" style={{color:pct>50?upColor:downColor}}>{value}</span>
    </div>
  );
}

export default function DailyCheckin() {
  const navigate = useNavigate();
  const addCheckin = useAppStore(s=>s.addCheckin);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    emotionBefore:'calm', sleepHours:7, stressLevel:3, energyLevel:7,
    hasRevengeMindset:false, reviewedSetups:true, maxRiskToday:1, maxTradesToday:3, emotionalRisk:'',
  });

  const steps = [
    {title:'Emotional State',icon:Brain},
    {title:'Energy & Health',icon:Moon},
    {title:'Trading Readiness',icon:Target},
    {title:'Final Review',icon:Check},
  ];

  const submit = async () => {
    await addCheckin({ 
      date: new Date().toISOString().split('T')[0], 
      ...form 
    });
    navigate('/app/dashboard');
  };

  const em = emotionLabel(form.emotionBefore);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2"><Brain className="w-6 h-6 text-tv-blue"/>Daily Mental Check-In</h1>
        <p className="text-tv-muted text-sm mt-1">Mandatory pre-flight ritual. Your behavioral data depends on honesty.</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {steps.map((s,i)=>(
          <div key={i} className="flex items-center flex-1">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all',
              i<step?'bg-tv-green text-white':i===step?'bg-tv-blue text-white ring-4 ring-tv-blue/20':'bg-tv-surface2 text-tv-muted')}>
              {i<step?<Check className="w-4 h-4"/>:i+1}
            </div>
            {i<steps.length-1&&<div className={`flex-1 h-0.5 mx-2 ${i<step?'bg-tv-green':'bg-tv-border'}`}/>}
          </div>
        ))}
      </div>

      <div className="card animate-slide-up" key={step}>
        <div className="flex items-center gap-3 mb-6">
          {(() => { const I=steps[step].icon; return <I className="w-5 h-5 text-tv-blue"/>; })()}
          <div className="font-bold text-tv-text">{steps[step].title}</div>
        </div>

        {step===0&&(
          <div className="space-y-4">
            <label className="label">How are you feeling right now?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EMOTIONS.map(e=>{const el=emotionLabel(e);return(
                <button key={e} onClick={()=>setForm(p=>({...p,emotionBefore:e}))}
                  className={cn('p-3 rounded-xl border text-sm font-medium transition-all text-center',
                    form.emotionBefore===e?'scale-105':'border-tv-border text-tv-muted hover:border-tv-hover hover:text-tv-text')}
                  style={form.emotionBefore===e?{borderColor:el.color,color:el.color,background:el.color+'18'}:{}}>
                  {el.label}
                </button>
              );})}
            </div>
            {(form.emotionBefore==='revenge'||form.emotionBefore==='frustrated')&&(
              <div className="p-3 bg-tv-red/10 border border-tv-red/30 rounded-lg flex items-center gap-2 text-tv-red text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0"/>Consider reducing size or skipping today.
              </div>
            )}
            <textarea value={form.emotionalRisk} onChange={e=>setForm(p=>({...p,emotionalRisk:e.target.value}))}
              placeholder="Anything on your mind that could affect trading today..." className="input h-20 resize-none"/>
          </div>
        )}

        {step===1&&(
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2"><label className="label">Sleep Quality</label><span className="text-tv-muted text-xs">Last night's sleep</span></div>
              <RangeSlider value={form.sleepHours} onChange={v=>setForm(p=>({...p,sleepHours:v}))}/>
              {form.sleepHours<=4&&<p className="text-tv-red text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>Poor sleep → impulsive trades. Trade minimal size.</p>}
            </div>
            <div>
              <div className="flex justify-between mb-2"><label className="label">Stress Level</label><span className="text-tv-muted text-xs">External life stress</span></div>
              <RangeSlider value={form.stressLevel} onChange={v=>setForm(p=>({...p,stressLevel:v}))} upColor="#ef5350" downColor="#26a69a"/>
              {form.stressLevel>=7&&<p className="text-tv-yellow text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>High stress — tighten risk rules today.</p>}
            </div>
            <div>
              <div className="flex justify-between mb-2"><label className="label">Mental Clarity</label><span className="text-tv-muted text-xs">Can you think clearly?</span></div>
              <RangeSlider value={form.energyLevel} onChange={v=>setForm(p=>({...p,energyLevel:v}))}/>
            </div>
            <div className="flex items-center gap-3 p-4 bg-tv-surface2 rounded-xl border border-tv-border cursor-pointer"
              onClick={()=>setForm(p=>({...p,hasRevengeMindset:!p.hasRevengeMindset}))}>
              <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-all',form.hasRevengeMindset?'bg-tv-red border-tv-red':'border-tv-border')}>
                {form.hasRevengeMindset&&<Check className="w-3 h-3 text-white"/>}
              </div>
              <div>
                <div className="text-tv-text text-sm font-medium">I have a revenge trading mindset</div>
                <div className="text-tv-muted text-xs">Feeling like I need to make back yesterday's losses</div>
              </div>
            </div>
          </div>
        )}

        {step===2&&(
          <div className="space-y-6">
            <div>
              <label className="label">Max Risk Per Trade (%)</label>
              <RangeSlider value={form.maxRiskToday} onChange={v=>setForm(p=>({...p,maxRiskToday:v}))} min={1} max={5} upColor="#2962ff" downColor="#ef5350"/>
            </div>
            <div>
              <label className="label">Max Trades Today</label>
              <div className="flex gap-2 flex-wrap mt-2">
                {[1,2,3,4,5,6,8,10].map(n=>(
                  <button key={n} onClick={()=>setForm(p=>({...p,maxTradesToday:n}))}
                    className={cn('w-12 h-12 rounded-xl border font-bold text-sm transition-all',
                      form.maxTradesToday===n?'border-tv-blue bg-tv-blue/15 text-tv-blue':'border-tv-border text-tv-muted hover:border-tv-hover hover:text-tv-text')}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-tv-blue/5 border border-tv-blue/20 rounded-xl">
              <div className="text-tv-blue text-sm font-semibold mb-2 flex items-center gap-1"><Zap className="w-4 h-4"/>Today's Auto-Rules</div>
              <ul className="text-tv-muted text-sm space-y-1">
                <li>• No revenge trades after losses</li>
                <li>• Stop after {form.maxTradesToday} trades or {form.maxRiskToday*3}% daily drawdown</li>
                <li>• Respect all stop-losses — no manual overrides</li>
                <li>• Journal every trade immediately after close</li>
              </ul>
            </div>
          </div>
        )}

        {step===3&&(
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                {label:'Emotion',value:em.label},{label:'Sleep',value:`${form.sleepHours}/10`},
                {label:'Stress',value:`${form.stressLevel}/10`},{label:'Clarity',value:`${form.energyLevel}/10`},
                {label:'Max Risk',value:`${form.maxRiskToday}%`},{label:'Max Trades',value:String(form.maxTradesToday)},
              ].map(s=>(
                <div key={s.label} className="bg-tv-surface2 rounded-lg p-3 border border-tv-border">
                  <div className="text-tv-muted text-xs">{s.label}</div>
                  <div className="text-tv-text font-semibold text-sm mt-0.5">{s.value}</div>
                </div>
              ))}
            </div>
            {form.hasRevengeMindset&&(
              <div className="p-4 bg-tv-red/10 border border-tv-red/30 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-tv-red flex-shrink-0"/>
                <div>
                  <div className="text-tv-red font-semibold text-sm">⚠ Revenge mindset detected</div>
                  <div className="text-tv-muted text-xs mt-1">Consider reducing size 50% or sitting today out. 73% of revenge sessions end in losses.</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button onClick={()=>step===0?navigate('/app/dashboard'):setStep(s=>s-1)} className="btn-ghost border border-tv-border">
            {step===0?'Cancel':'Back'}
          </button>
          {step<3
            ?<button onClick={()=>setStep(s=>s+1)} className="btn-primary">Continue</button>
            :<button onClick={submit} className="btn-primary glow-blue"><Check className="w-4 h-4"/>Complete Check-In</button>}
        </div>
      </div>
    </div>
  );
}
