import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from './api/client';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import DailyCheckin from './pages/DailyCheckin';
import SessionPlanning from './pages/SessionPlanning';
import TradeJournal from './pages/TradeJournal';
import LogTradePage from './pages/LogTradePage';
import Analytics from './pages/Analytics';
import BehaviorPage from './pages/BehaviorPage';
import SettingsPage from './pages/SettingsPage';
import MyRulesPage from './pages/MyRulesPage';
import MentalTools from './pages/MentalTools';
import SessionReview from './pages/SessionReview';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useEffect, useRef } from 'react';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminRules from './admin/AdminRules';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const initTheme = useThemeStore(s => s.initTheme);
  const user = useAuthStore(s => s.user);
  const login = useAuthStore(s => s.login);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const initialized = useRef(false);
  
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (isAuthenticated) {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.cancel();
      }
      return;
    }

    if (initialized.current) return;
    
    /* global google */
    const setupGoogle = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "440039434568-p7k6oq8p78sqi52or6j5rtpjq5m4qv41.apps.googleusercontent.com",
          callback: async (response: any) => {
            try {
              const { data } = await api.post('/api/auth/google', { credential: response.credential });
              login(data.user);
              window.location.href = '/app/dashboard';
            } catch (err) {
              console.error('Account selection failed', err);
            }
          },
          auto_select: false
        });
        
        google.accounts.id.cancel();
        google.accounts.id.prompt();
        initialized.current = true;
        return true;
      }
      return false;
    };

    if (!setupGoogle()) {
      const timer = setInterval(() => {
        if (setupGoogle()) clearInterval(timer);
      }, 500);
      return () => {
        clearInterval(timer);
        if ((window as any).google?.accounts?.id) (window as any).google.accounts.id.cancel();
      };
    }

    return () => {
      if ((window as any).google?.accounts?.id) (window as any).google.accounts.id.cancel();
    };
  }, [login, isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/app" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="checkin" element={<DailyCheckin />} />
            <Route path="session" element={<SessionPlanning />} />
            <Route path="session/review" element={<SessionReview />} />
            <Route path="journal" element={<TradeJournal />} />
            <Route path="journal/log" element={<LogTradePage />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="behavior" element={<BehaviorPage />} />
            <Route path="tools" element={<MentalTools />} />
            <Route path="rules" element={<MyRulesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Routes */}
          {user?.isAdmin && (
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="rules" element={<AdminRules />} />
              <Route path="audit" element={<div className="p-12 text-center text-tv-muted font-mono tracking-widest uppercase">Behavioral Audit Module [ENCRYPTED]</div>} />
              <Route path="stats" element={<div className="p-12 text-center text-tv-muted font-mono tracking-widest uppercase">Deep Analytics Engine [PROCESSING]</div>} />
            </Route>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
