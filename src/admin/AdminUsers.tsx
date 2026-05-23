import { useEffect, useState } from 'react';
import { Search, Filter, ShieldCheck, ShieldAlert, Ban, Trash2, ExternalLink, ChevronLeft, ChevronRight, UserMinus, UserPlus } from 'lucide-react';
import api from '../api/client';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  status: 'active' | 'suspended' | 'banned';
  experience: string;
  tradeCount: number;
  checkinCount: number;
  winRate: number;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?search=${search}&status=${status}&page=${page}`);
      setUsers(data.users);
      setMeta(data.pagination);
    } catch (err) {
      toast.error('Failed to reload database records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      toast.success(`Access updated for user.`);
      fetchUsers();
    } catch (err) {
      toast.error('Privilege escalation failed.');
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Permanently purge user ${email}? This collapses all trades and telemetry data.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.error('Entity permanently deleted 💀');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to commit deletion.');
    }
  };

  const handleRoleToggle = async (id: string, currentlyAdmin: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/admin`, { isAdmin: !currentlyAdmin });
      toast.success(`Admin privileges ${currentlyAdmin ? 'revoked' : 'granted'}.`);
      fetchUsers();
    } catch (err) {
      toast.error('Role modification failed.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tv-muted" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search email, name, or UUID..."
            className="input pl-10 w-full"
          />
        </form>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="input py-2 text-xs font-bold uppercase tracking-widest bg-tv-surface"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
          <button onClick={fetchUsers} className="btn-ghost border border-tv-border px-4 py-2 rounded-xl text-tv-muted hover:text-tv-text">
            Refetch DB
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden border border-tv-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-tv-surface2 border-b border-tv-border">
              <tr className="text-[10px] text-tv-muted uppercase font-black tracking-widest">
                <th className="px-6 py-4">Trader Entity</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Logs</th>
                <th className="px-6 py-4 text-center">Performance</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Strategic Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tv-border/50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-tv-muted font-mono animate-pulse">Scanning SQL records...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-tv-muted font-bold">No trader entities match this signature.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-tv-surface group transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-xs",
                        u.isAdmin ? "bg-tv-blue/10 border-tv-blue text-tv-blue" : "bg-tv-surface2 border-tv-border text-tv-muted"
                      )}>
                        {u.isAdmin ? <ShieldCheck className="w-5 h-5" /> : u.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-tv-text flex items-center gap-2">
                          {u.name || 'Incognito User'}
                          {u.isAdmin && <span className="text-[8px] bg-tv-blue text-white px-1 py-0.5 rounded uppercase font-black">ADMIN</span>}
                        </div>
                        <div className="text-xs text-tv-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-tighter",
                      u.status === 'active' ? "bg-tv-green/10 text-tv-green" : 
                      u.status === 'suspended' ? "bg-tv-orange/10 text-tv-orange" : "bg-tv-red/10 text-tv-red"
                    )}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono">
                    <div className="text-xs font-bold text-tv-text">{u.tradeCount}T</div>
                    <div className="text-[9px] text-tv-muted">{u.checkinCount}C</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-bold text-tv-text">{u.winRate}%</div>
                    <div className="text-[9px] text-tv-muted font-bold uppercase tracking-widest">{u.experience}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-tv-muted">
                    {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleRoleToggle(u.id, u.isAdmin)}
                        title={u.isAdmin ? "Revoke Admin" : "Make Admin"}
                        className="p-2 bg-tv-surface2 border border-tv-border rounded-lg hover:border-tv-blue hover:text-tv-blue transition-colors"
                      >
                        {u.isAdmin ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleStatusChange(u.id, u.status === 'active' ? 'suspended' : 'active')}
                        title={u.status === 'active' ? 'Suspend' : 'Reactivate'}
                        className="p-2 bg-tv-surface2 border border-tv-border rounded-lg hover:border-tv-orange hover:text-tv-orange transition-colors"
                      >
                        {u.status === 'active' ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id, u.email)}
                        title="Purge"
                        className="p-2 bg-tv-surface2 border border-tv-border rounded-lg hover:border-tv-red hover:text-tv-red transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="bg-tv-surface2 border-t border-tv-border px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-tv-muted font-bold tracking-widest uppercase">
            Showing {users.length} of {meta.total} records
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 bg-tv-surface border border-tv-border rounded-lg disabled:opacity-30 hover:border-tv-blue transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-tv-text" />
            </button>
            <span className="text-xs font-black text-tv-text px-4 py-2 bg-tv-surface border border-tv-border rounded-lg">
              {page} / {meta.pages}
            </span>
            <button 
              disabled={page === meta.pages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 bg-tv-surface border border-tv-border rounded-lg disabled:opacity-30 hover:border-tv-blue transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-tv-text" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
