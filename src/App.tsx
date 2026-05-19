import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import DailyCheckin from './pages/DailyCheckin';
import SessionPlanning from './pages/SessionPlanning';
import TradeJournal from './pages/TradeJournal';
import Analytics from './pages/Analytics';
import BehaviorPage from './pages/BehaviorPage';
import SettingsPage from './pages/SettingsPage';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
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
            <Route path="journal" element={<TradeJournal />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="behavior" element={<BehaviorPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
