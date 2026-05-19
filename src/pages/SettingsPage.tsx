import { useState } from 'react';
import { Settings, User, Bell, Shield, BookOpen, Plus, X, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { tradingRules, updateRules, markRulesRead, entryChecklistRules, updateEntryChecklistRules } = useAppStore();
  
  const [localRules, setLocalRules] = useState<string[]>([...tradingRules]);
  const [newRule, setNewRule] = useState('');

  const [localEntryRules, setLocalEntryRules] = useState<string[]>([...entryChecklistRules]);
  const [newEntryRule, setNewEntryRule] = useState('');

  const handleSaveRules = () => {
    updateRules(localRules);
    markRulesRead(); // reset the read date so they can bypass if they just saved
    toast.success('Rules updated successfully');
  };

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setLocalRules([...localRules, newRule.trim()]);
    setNewRule('');
  };

  const handleSaveEntryRules = () => {
    updateEntryChecklistRules(localEntryRules);
    toast.success('Trade entry checklist updated');
  };

  const handleAddEntryRule = () => {
    if (!newEntryRule.trim()) return;
    setLocalEntryRules([...localEntryRules, newEntryRule.trim()]);
    setNewEntryRule('');
  };
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

          {/* My Trading Rules Card */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-tv-blue"/>
              <div className="font-bold">My Trading Rules</div>
            </div>
            <p className="text-sm text-tv-muted mb-4">
              These rules will be presented to you every day before you can access the dashboard.
            </p>
            
            <ul className="space-y-2">
              {localRules.map((rule, idx) => (
                <li key={idx} className="flex gap-2 items-center bg-tv-surface2 p-3 rounded-lg border border-tv-border">
                  <span className="text-tv-muted font-bold text-xs">{idx + 1}.</span>
                  <span className="flex-1 text-sm text-tv-text">{rule}</span>
                  <button 
                    onClick={() => setLocalRules(localRules.filter((_, i) => i !== idx))}
                    className="text-tv-muted hover:text-tv-red transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 mt-4">
              <input 
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                placeholder="Add a new rule (e.g., Never average into a loser)"
                className="input flex-1"
              />
              <button onClick={handleAddRule} className="btn-ghost border border-tv-border">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button onClick={handleSaveRules} className="btn-primary w-full justify-center mt-4 glow-blue">
              <Save className="w-4 h-4" /> Save Rules
            </button>
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
          {/* Trade Entry Checklist Rules Card */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-tv-blue"/>
              <div className="font-bold">Trade Entry Checklist Rules</div>
            </div>
            <p className="text-sm text-tv-muted mb-4">
              These rules will be displayed as an interactive checklist when logging a new entry in your Trade Journal.
            </p>
            
            <ul className="space-y-2">
              {localEntryRules.map((rule, idx) => (
                <li key={idx} className="flex gap-2 items-center bg-tv-surface2 p-3 rounded-lg border border-tv-border">
                  <span className="text-tv-muted font-bold text-xs">{idx + 1}.</span>
                  <span className="flex-1 text-sm text-tv-text">{rule}</span>
                  <button 
                    onClick={() => setLocalEntryRules(localEntryRules.filter((_, i) => i !== idx))}
                    className="text-tv-muted hover:text-tv-red transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 mt-4">
              <input 
                value={newEntryRule}
                onChange={(e) => setNewEntryRule(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEntryRule()}
                placeholder="Add entry criterion (e.g., Risk-to-reward is at least 1:2)"
                className="input flex-1"
              />
              <button onClick={handleAddEntryRule} className="btn-ghost border border-tv-border">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button onClick={handleSaveEntryRules} className="btn-primary w-full justify-center mt-4 glow-blue">
              <Save className="w-4 h-4" /> Save Entry Rules
            </button>
          </div>

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
        </div>
      </div>
    </div>
  );
}
