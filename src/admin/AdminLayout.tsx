import { ReactNode, useEffect } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, BarChart3, LogOut, ArrowLeft, ShieldCheck, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/app/dashboard');
    }
  }, [user, navigate]);

  if (!user?.isAdmin) return null;

  const menuItems = [
    { label: 'Dashboard',         icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'User Management',   icon: Users,           path: '/admin/users' },
    { label: 'Behavioral Rules',  icon: Shield,          path: '/admin/rules' },
    { label: 'Behavioral Audit',  icon: ShieldAlert,     path: '/admin/audit' },
    { label: 'Platform Stats',    icon: BarChart3,       path: '/admin/stats' },
  ];

  return (
    <div className="flex h-screen bg-tv-surface2 font-sans overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-tv-surface border-r border-tv-border flex flex-col">
        <div className="p-6 border-b border-tv-border">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-tv-blue" />
            <span className="font-bold text-xl tracking-tight text-tv-text">TradeGuru <span className="text-tv-blue">Admin</span></span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-tv-muted font-bold">Command Center v1.0</div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                  active 
                    ? "bg-tv-blue text-white shadow-lg shadow-tv-blue/20" 
                    : "text-tv-muted hover:bg-tv-surface2 hover:text-tv-text"
                )}
              >
                <item.icon className={cn("w-5 h-5", active ? "text-white" : "text-tv-muted group-hover:text-tv-blue")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-tv-border">
          <Link to="/app/dashboard" className="flex items-center gap-3 px-4 py-3 text-tv-muted hover:text-tv-text transition-colors mb-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Go to App</span>
          </Link>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-tv-red hover:bg-tv-red/10 rounded-xl transition-colors font-medium border border-transparent hover:border-tv-red/20"
          >
            <LogOut className="w-5 h-5" />
            Logout Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-tv-surface2 custom-scrollbar">
        {/* Admin Header */}
        <header className="sticky top-0 z-10 bg-tv-surface/80 backdrop-blur-md border-b border-tv-border px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-tv-text">
            {menuItems.find(i => i.path === location.pathname)?.label || 'Administration'}
          </h2>
          <div className="flex items-center gap-3 bg-tv-surface2 px-3 py-1.5 rounded-full border border-tv-border">
            <div className="w-2 h-2 rounded-full bg-tv-green animate-pulse" />
            <span className="text-xs font-bold text-tv-text">{user.name}</span>
            <span className="text-[10px] bg-tv-blue/20 text-tv-blue px-2 py-0.5 rounded-full uppercase font-black">Super Admin</span>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
