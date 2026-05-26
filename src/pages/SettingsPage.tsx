import { Settings, User, Bell, Shield, Brain } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { seedAllDemoData } = useAppStore();

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-tv-blue"/>Settings</h1>
        <p className="text-tv-muted text-sm mt-0.5">Manage your profile and preferences</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-tv-blue"/>
              <div className="font-bold">Profile</div>
            </div>
            {[
              {label:'Full Name',eval:user?.name||''},
              {label:'Email',eval:user?.email||''},
            ].map(f=>(
              <div key={f.label}>
                <label className="label">{f.label}</label>
                <input className="input" defaultValue={f.eval}/>
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

          {/* Security Card */}
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-tv-blue"/>
              <div className="font-bold">Security</div>
            </div>
            <button className="btn-ghost border border-tv-border text-sm">Change Password</button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications Card */}
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

          {/* Developer Utilities */}
          <div className="card border-tv-blue/20 bg-tv-blue/5">
            <h3 className="text-tv-blue font-bold flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5"/> Developer Utilities
            </h3>
            <p className="text-tv-muted text-sm mb-4 italic">
              Generate 30 days of realistic behavioral data to demonstrate the AI Coach and Advanced Analytics.
            </p>
            <button onClick={seedAllDemoData} className="btn-primary bg-tv-blue hover:bg-tv-blue/80 text-sm px-6 glow-blue">
              Seed Behavioral History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
