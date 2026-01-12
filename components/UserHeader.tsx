import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, Bell } from 'lucide-react';

interface UserHeaderProps {
  user: UserProfile;
  onSparkle: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, onSparkle }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-white/5 px-4 py-3 flex justify-between items-center">
       <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">DF</div>
              )}
            </div>
         </div>
         <div>
            <h1 className="text-sm font-bold text-white leading-tight">DailyFocus</h1>
            <p className="text-xs text-slate-400">Tracker</p>
         </div>
       </div>

       <div className="flex items-center gap-3">
         <button 
           onClick={onSparkle}
           className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/20 transition-colors"
         >
           <Sparkles size={20} />
         </button>
       </div>
    </header>
  );
};

export default UserHeader;
