import React from 'react';
import { Tab } from '../types';
import { Home, ListTodo, Wallet, PieChart, User } from 'lucide-react';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'tasks', icon: ListTodo, label: 'Tasks' },
    { id: 'expenses', icon: Wallet, label: 'Money' },
    { id: 'stats', icon: PieChart, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-slate-900/80 backdrop-blur-xl border-t border-white/5">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
