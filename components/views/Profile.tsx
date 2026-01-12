import React, { useRef } from 'react';
import { UserProfile, UserSettings, AppData } from '../../types';
import { Button, Input, Card } from '../ui/UIComponents';
import { Download, Upload, Trash2, Save, User } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  fullData: AppData;
  onImport: (data: AppData) => void;
  onReset: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser, settings, setSettings, fullData, onImport, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dailyfocus_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json.tasks && json.transactions && json.profile) {
            onImport(json);
            alert('Data imported successfully!');
          } else {
            alert('Invalid file format');
          }
        } catch (e) {
          alert('Error parsing JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold text-white">Profile & Settings</h2>

      <Card className="flex flex-col items-center py-8 gap-4 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500/30 bg-slate-800 flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-slate-500" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white">Change</span>
          </div>
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleAvatarChange} />
        </div>
        <div className="w-full space-y-3 px-4">
          <Input 
            label="Display Name" 
            value={user.name} 
            onChange={e => setUser(p => ({ ...p, name: e.target.value }))} 
          />
          <Input 
            label="Email" 
            value={user.email} 
            onChange={e => setUser(p => ({ ...p, email: e.target.value }))} 
          />
          <Input 
            label="Monthly Budget (₹)" 
            type="number" 
            value={user.monthlyBudget} 
            onChange={e => setUser(p => ({ ...p, monthlyBudget: parseFloat(e.target.value) }))} 
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase">Notifications</h3>
        <div className="flex items-center justify-between">
          <span className="text-white">Enable Sound Effects</span>
          <button 
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
            onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
          >
             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.soundEnabled ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase">Data Management</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" onClick={handleExport}>
            <Download size={18} /> Export
          </Button>
          <Button variant="secondary" onClick={handleImportClick}>
            <Upload size={18} /> Import
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportFile} />
        </div>
      </Card>

      <div className="pt-8 border-t border-white/10">
        <Button variant="danger" className="w-full" onClick={() => { if(confirm("Are you sure? This deletes everything.")) onReset(); }}>
          <Trash2 size={18} /> Reset All Data
        </Button>
      </div>
    </div>
  );
};

export default Profile;