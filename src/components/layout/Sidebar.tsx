import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Brain, ClipboardList, TrendingUp,
  BarChart2, Settings, LogOut, Activity, Zap, Moon, Sun, ShieldCheck, Bell
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../lib/utils';

const NAV = [
  { to: '/app/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/checkin',    icon: Brain,            label: 'Mental Check-In' },
  { to: '/app/session',    icon: ClipboardList,    label: 'Session Plan' },
  { to: '/app/journal',    icon: TrendingUp,       label: 'Trade Journal' },
  { to: '/app/analytics',  icon: BarChart2,        label: 'Analytics' },
  { to: '/app/behavior',   icon: Activity,         label: 'Behavior' },
  { to: '/app/tools',      icon: Zap,              label: 'Mental Tools' },
  { to: '/app/notifications', icon: Bell,         label: 'Notifications' },
  { to: '/app/rules',      icon: ClipboardList,    label: 'My Rules' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { activeSession } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-tv-surface border-r border-tv-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-tv-border">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg overflow-hidden bg-transparent">
          <img src="/logo.png" alt="TradeGuru Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="font-bold text-tv-text text-base leading-none">TradeGuru</div>
          <div className="text-tv-muted text-[10px] uppercase tracking-widest mt-0.5">Behavioral OS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
              isActive
                ? 'bg-tv-blue/15 text-tv-blue border border-tv-blue/25'
                : 'text-tv-muted hover:bg-tv-hover hover:text-tv-text border border-transparent'
            )
          }>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {label === 'Session Plan' && activeSession && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tv-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tv-green"></span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-tv-border pt-3 space-y-0.5">
        {(user?.isAdmin === true || (user as any)?.isAdmin === 1) && (
          <NavLink to="/admin/dashboard" className={({ isActive }) =>
            cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 bg-tv-blue/5 border border-tv-blue/10 mb-2',
              isActive ? 'bg-tv-blue/15 text-tv-blue' : 'text-tv-blue hover:bg-tv-blue/10')
          }>
            <ShieldCheck className="w-4 h-4" />
            Admin Panel
          </NavLink>
        )}
        <NavLink to="/app/settings" className={({ isActive }) =>
          cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
            isActive ? 'bg-tv-blue/15 text-tv-blue' : 'text-tv-muted hover:bg-tv-hover hover:text-tv-text')
        }>
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-tv-muted hover:bg-tv-red/10 hover:text-tv-red transition-all duration-150">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <button onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-tv-muted hover:bg-tv-hover hover:text-tv-text transition-all duration-150">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        {/* User pill */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2 bg-tv-surface2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tv-blue to-tv-green flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0) ?? 'T'}
          </div>
          <div className="min-w-0">
            <div className="text-tv-text text-xs font-semibold truncate">{user?.name ?? 'Trader'}</div>
            <div className="text-tv-muted text-[10px] truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
