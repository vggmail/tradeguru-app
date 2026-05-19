import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Brain, Activity, BarChart2, Shield, Monitor, Eye, Star, Check } from 'lucide-react';

const FEATURES = [
  { icon: Brain, title: 'Mental Check-In', color: '#2962ff', desc: 'Pre-session emotional state tracking: sleep, stress, revenge mindset, max risk. The ritual that changes everything.' },
  { icon: Activity, title: 'Attention Tracking', color: '#26a69a', desc: 'Chrome extension catches compulsive chart-checking, symbol refreshing, and post-loss over-monitoring.' },
  { icon: Shield, title: 'Discipline Engine', color: '#f7b500', desc: 'Discipline Score, Emotional Stability Score, and Process Score — shifting focus from P&L to behavior.' },
  { icon: BarChart2, title: 'Behavioral Analytics', color: '#9c27b0', desc: 'Correlations between sleep → overtrading, frustration → risk spikes. Your personal behavioral dataset.' },
  { icon: Eye, title: 'Behavioral Timeline', color: '#ef5350', desc: 'Visual chain: Emotion → Behavior → Trade → Outcome. See why you made each decision.' },
  { icon: Monitor, title: 'Live Warnings', color: '#ff9800', desc: '"You checked BTC 63 times after a loss." Real-time nudges before bad decisions become bad trades.' },
];

const TESTIMONIALS = [
  { name: 'Arjun M.', role: 'Prop Firm Trader', text: 'Realized I had a revenge trading loop every Monday. TradeGuru caught it before I did.' },
  { name: 'Priya K.', role: 'Funded Trader – FTMO', text: 'My discipline score improved 34 points in 3 weeks. The pre-session checkin is the best habit I\'ve built.' },
  { name: 'Chris R.', role: 'Discretionary Trader', text: 'No other tool tracks why I traded. This is the missing piece every serious trader needs.' },
];

const PLANS = [
  { name: 'Free', price: '$0', period: 'forever', features: ['50 trades/month', 'Daily check-in', 'Basic dashboard', 'Session planning'], cta: 'Start Free', highlight: false },
  { name: 'Pro', price: '$29', period: '/month', features: ['Unlimited trades', 'Behavioral scoring', 'AI Coach insights', 'Chrome extension', 'Habit analytics', 'CSV import'], cta: 'Start Pro Trial', highlight: true },
  { name: 'Team', price: '$79', period: '/month', features: ['Everything in Pro', 'Coach dashboard', '5 trader seats', 'Team analytics', 'Priority support'], cta: 'Contact Sales', highlight: false },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setJoined(true);
  };

  return (
    <div className="min-h-screen bg-tv-bg text-tv-text overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-tv-border bg-tv-bg/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-tv-blue rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-tv-text text-lg">TradeGuru</span>
            <span className="hidden sm:inline-flex badge-blue ml-2">Beta</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')} className="btn-ghost text-sm">
              Sign In
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary text-sm">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-tv-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[200px] bg-tv-green/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative animate-slide-up">
          <span className="badge-blue mb-6 text-sm px-3 py-1 inline-flex">
            🧠 Behavioral Operating System for Traders
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-tv-text mt-4 mb-6 leading-tight">
            Most tools track<br />
            <span className="gradient-text">your trades.</span><br />
            We track your <span className="gradient-text">behavior.</span>
          </h1>
          <p className="text-tv-muted text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Understand your emotional patterns, eliminate revenge trading, build discipline — 
            with psychology-driven journaling, attention tracking, and behavioral AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/login')} className="btn-primary text-base px-7 py-3 glow-blue">
              Start Free <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/login')} className="btn-ghost text-base px-7 py-3 border border-tv-border">
              View Demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-tv-muted text-sm">
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-tv-green" /> No credit card</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-tv-green" /> Free forever plan</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-tv-green" /> Works with any broker</div>
          </div>
        </div>

        {/* Dashboard preview card */}
        <div className="relative mt-16 rounded-2xl border border-tv-border bg-tv-surface overflow-hidden shadow-2xl animate-fade-in">
          <div className="h-8 bg-tv-surface2 border-b border-tv-border flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-tv-red/60" />
            <div className="w-3 h-3 rounded-full bg-tv-yellow/60" />
            <div className="w-3 h-3 rounded-full bg-tv-green/60" />
            <span className="text-tv-muted text-xs ml-3">tradeguru.app/dashboard</span>
          </div>
          {/* Mock dashboard inside */}
          <div className="p-6 grid grid-cols-3 gap-4 text-left">
            {[
              { label: 'Discipline Score', value: '82', color: '#26a69a', sub: '+12 this week' },
              { label: 'Emotional Stability', value: '74', color: '#f7b500', sub: '3 violation flags' },
              { label: 'Process Score', value: '91', color: '#2962ff', sub: 'All checklists done' },
            ].map(s => (
              <div key={s.label} className="bg-tv-surface2 rounded-xl p-4 border border-tv-border">
                <div className="text-tv-muted text-xs mb-2">{s.label}</div>
                <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-tv-muted text-xs">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 grid grid-cols-2 gap-4">
            <div className="bg-tv-surface2 rounded-xl p-4 border border-tv-border">
              <div className="text-tv-muted text-xs mb-3">Today's Behavioral Insight</div>
              <div className="text-tv-blue text-sm font-medium">⚡ You tend to increase risk 3x after 2 consecutive losses. Consider stopping after loss #2.</div>
            </div>
            <div className="bg-tv-surface2 rounded-xl p-4 border border-tv-border">
              <div className="text-tv-muted text-xs mb-3">Attention Pattern</div>
              <div className="text-tv-yellow text-sm font-medium">👁 You checked BTC 47 times in the last 2 hours — a post-loss anxiety signal.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Six pillars competitors can't replicate</h2>
          <p className="text-tv-muted text-lg">Built for serious traders who want to understand themselves, not just their trades.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="card hover:border-tv-blue/30 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: f.color + '22' }}>
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-tv-text mb-2">{f.title}</h3>
              <p className="text-tv-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Flow */}
      <section className="bg-tv-surface border-y border-tv-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Your daily trading ritual</h2>
            <p className="text-tv-muted text-lg">Every step reinforces discipline. Every screen asks: what behavior is happening?</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-tv-border hidden md:block" />
            <div className="space-y-6">
              {[
                { step: 1, title: 'Dashboard Briefing', desc: 'See yesterday\'s mistake, today\'s focus, your streak, and behavioral alerts.', color: '#2962ff' },
                { step: 2, title: 'Mental Check-In', desc: 'Emotional state, sleep quality, stress, revenge mindset check. Mandatory before trading.', color: '#26a69a' },
                { step: 3, title: 'Session Planning', desc: 'Define markets, setups, max loss, max trades, and discipline rules.', color: '#f7b500' },
                { step: 4, title: 'Live Behavioral Tracking', desc: 'Extension monitors attention, chart-switching, and compulsive behavior in real-time.', color: '#9c27b0' },
                { step: 5, title: 'Psychology-Driven Trade Log', desc: 'Every trade captures emotion, confidence, plan adherence, and post-trade reflection.', color: '#ff9800' },
                { step: 6, title: 'Session Review', desc: 'AI-generated behavioral summary: discipline score, violations, patterns, insights.', color: '#ef5350' },
              ].map(s => (
                <div key={s.step} className="md:pl-16 relative flex gap-4 items-start">
                  <div className="absolute left-0 w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm hidden md:flex flex-shrink-0"
                    style={{ borderColor: s.color, color: s.color, background: s.color + '15' }}>
                    {s.step}
                  </div>
                  <div className="card flex-1 hover:border-tv-blue/30 transition-colors">
                    <div className="font-semibold text-tv-text mb-1">{s.title}</div>
                    <div className="text-tv-muted text-sm">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Traders who upgraded their OS</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card hover:border-tv-green/30 transition-all duration-300">
              <div className="flex gap-1 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-tv-yellow text-tv-yellow" />)}</div>
              <p className="text-tv-text text-sm mb-4 leading-relaxed">"{t.text}"</p>
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-tv-muted text-xs">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-tv-surface border-y border-tv-border py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Simple, transparent pricing</h2>
            <p className="text-tv-muted">Start free. Upgrade when you're ready to go deeper.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {PLANS.map(p => (
              <div key={p.name} className={`card flex flex-col ${p.highlight ? 'border-tv-blue glow-blue' : ''}`}>
                {p.highlight && <div className="badge-blue mb-3 self-start">Most Popular</div>}
                <div className="text-tv-muted text-sm mb-1">{p.name}</div>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-4xl font-bold text-tv-text">{p.price}</span>
                  <span className="text-tv-muted text-sm mb-1">{p.period}</span>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-tv-text">
                      <Check className="w-4 h-4 text-tv-green flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/login')}
                  className={p.highlight ? 'btn-primary justify-center' : 'btn-ghost justify-center border border-tv-border'}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Join the behavioral revolution</h2>
        <p className="text-tv-muted text-lg mb-8">Get early access and be among the first traders to use the Behavioral OS.</p>
        {joined ? (
          <div className="badge-green text-base px-5 py-3 rounded-xl inline-flex">
            ✅ You're on the waitlist! We'll reach out soon.
          </div>
        ) : (
          <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input flex-1 text-base py-3"
              required
            />
            <button type="submit" className="btn-primary whitespace-nowrap py-3 px-6 glow-blue">
              Join Waitlist <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-tv-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-tv-muted text-sm">
            <Zap className="w-4 h-4 text-tv-blue" />
            TradeGuru · Behavioral OS for Traders
          </div>
          <div className="text-tv-muted text-xs">© 2026 TradeGuru. Built for serious traders.</div>
        </div>
      </footer>
    </div>
  );
}
