import { Settings, User, Bell, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-tv-blue"/>Settings</h1>
        <p className="text-tv-muted text-sm mt-0.5">Manage your profile and preferences</p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-tv-blue"/>
          <div className="font-bold">Profile</div>
        </div>
        {[
          {label:'Full Name',value:user?.name||''},
          {label:'Email',value:user?.email||''},
        ].map(f=>(
          <div key={f.label}>
            <label className="label">{f.label}</label>
            <input className="input" defaultValue={f.value}/>
          </div>
        ))}
        <div>
          <label className="label">Trading Experience</label>
          <select className="input" defaultValue={user?.experience}>
            {['beginner','intermediate','advanced','professional'].map(e=>(
              <option key={e} value={e} className="capitalize">{e.charAt(0).toUpperCase()+e.slice(1)}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary">Save Changes</button>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <Bell className="w-5 h-5 text-tv-blue"/>
          <div className="font-bold">Notifications</div>
        </div>
        {[
          'Daily check-in reminder (9:00 AM)',
          'Behavioral warnings during session',
          'End-of-session review prompt',
          'Weekly progress report',
        ].map(n=>(
          <label key={n} className="flex items-center justify-between p-3 bg-tv-surface2 rounded-lg cursor-pointer group">
            <span className="text-sm text-tv-text">{n}</span>
            <div className="w-10 h-5 bg-tv-blue rounded-full relative flex-shrink-0">
              <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow transition-all"/>
            </div>
          </label>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-tv-blue"/>
          <div className="font-bold">Security</div>
        </div>
        <button className="btn-ghost border border-tv-border text-sm">Change Password</button>
      </div>
    </div>
  );
}
