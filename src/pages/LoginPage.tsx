import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import api from '../api/client';

// Use a placeholder or env variable
const GOOGLE_CLIENT_ID = "440039434568-p7k6oq8p78sqi52or6j5rtpjq5m4qv41.apps.googleusercontent.com";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    /* global google */
    if (typeof (window as any).google !== 'undefined') {
      const google = (window as any).google;

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: true
      });

      google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "filled_blue", size: "large", width: "100%", shape: "rectangular" }
      );

      // Display One Tap prompt
      google.accounts.id.prompt();
    }
  }, [mode]);

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { credential: response.credential });

      login(
        {
          id: data.user.id,
          name: data.user.name || 'Trader',
          email: data.user.email,
          experience: data.user.experience || 'intermediate',
          markets: data.user.marketFocus || ['Forex'],
          joinedAt: data.user.createdAt || new Date().toISOString()
        },
        data.token
      );

      toast.success('Signed in with Google! 🚀');
      navigate('/app/dashboard');
    } catch (err: any) {
      toast.error('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, name: form.name };

      const { data } = await api.post(endpoint, payload);

      login(
        {
          id: data.user.id,
          name: data.user.name || 'Trader',
          email: data.user.email,
          experience: data.user.experience || 'intermediate',
          markets: data.user.marketFocus || ['Forex'],
          joinedAt: data.user.createdAt || new Date().toISOString()
        },
        data.token
      );

      toast.success(mode === 'login' ? 'Welcome back! 🚀' : 'Account created successfully! ✨');
      navigate('/app/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Authentication failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    login(
      { id: '1', name: 'Demo Trader', email: 'demo@tradeguru.app', experience: 'advanced', markets: ['Crypto', 'Forex', 'Indices'], joinedAt: new Date().toISOString() },
      'demo-token'
    );
    toast.success('Loaded demo account!');
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-tv-bg flex items-center justify-center p-4">
      {/* Ambient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-tv-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-tv-blue rounded-xl flex items-center justify-center glow-blue">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-tv-text text-xl">TradeGuru</div>
              <div className="text-tv-muted text-xs">Behavioral OS for Traders</div>
            </div>
          </button>
        </div>

        <div className="card">
          {/* Tabs */}
          <div className="flex bg-tv-surface2 rounded-lg p-1 mb-6">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200 capitalize
                  ${mode === m ? 'bg-tv-blue text-white shadow' : 'text-tv-muted hover:text-tv-text'}`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tv-muted" />
                  <input type="text" placeholder="Arjun Mehta" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input pl-10" required />
                </div>
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tv-muted" />
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input pl-10" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tv-muted" />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tv-muted hover:text-tv-text transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 glow-blue mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="relative my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-tv-border" />
            <span className="text-tv-muted text-xs">or</span>
            <div className="flex-1 h-px bg-tv-border" />
          </div>

          <div id="googleSignInDiv" className="w-full mb-3" />

          <button onClick={handleDemo}
            className="w-full btn-ghost justify-center border border-tv-border py-2.5 text-sm">
            ⚡ Continue with Demo Account
          </button>
        </div>

        <p className="text-center text-tv-muted text-xs mt-5">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
