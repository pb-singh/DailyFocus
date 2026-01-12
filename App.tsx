import React, { useState, useEffect, useRef } from 'react';
import { Tab, Task, Transaction, UserProfile, UserSettings, AppData } from './types';
import Navbar from './components/Navbar';
import UserHeader from './components/UserHeader';
import Dashboard from './components/views/Dashboard';
import TaskManager from './components/views/TaskManager';
import ExpenseTracker from './components/views/ExpenseTracker';
import Stats from './components/views/Stats';
import Profile from './components/views/Profile';
import { generateContextualAdvice } from './services/geminiService';

const DEFAULT_PROFILE: UserProfile = {
  name: 'User',
  email: '',
  monthlyBudget: 2000,
};

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  snoozeDurationMinutes: 5
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('df_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('df_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('df_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('df_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // --- Persistence ---
  useEffect(() => localStorage.setItem('df_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('df_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('df_profile', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('df_settings', JSON.stringify(settings)), [settings]);

  // --- Notifications ---
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      setTasks(prevTasks => {
        let hasChanges = false;
        const updated = prevTasks.map(task => {
          if (!task.completed && !task.notified && task.reminderTime) {
            const reminderTime = new Date(task.reminderTime);
            if (now >= reminderTime) {
               // Trigger
               if (Notification.permission === 'granted') {
                 new Notification('DailyFocus Task Reminder', {
                   body: task.title,
                   icon: '/icon.png' // Fallback
                 });
               }
               if (settings.soundEnabled) {
                 const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple notification ping
                 audio.play().catch(e => console.error("Audio play failed", e));
               }
               hasChanges = true;
               return { ...task, notified: true };
            }
          }
          return task;
        });
        return hasChanges ? updated : prevTasks;
      });
    }, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [settings.soundEnabled]);

  // --- Actions ---
  const handleImport = (data: AppData) => {
    setTasks(data.tasks);
    setTransactions(data.transactions);
    setUser(data.profile);
    setSettings(data.settings);
  };

  const handleReset = () => {
    localStorage.clear();
    setTasks([]);
    setTransactions([]);
    setUser(DEFAULT_PROFILE);
    setSettings(DEFAULT_SETTINGS);
    window.location.reload();
  };

  const handleSparkle = async () => {
    const tip = await generateContextualAdvice(activeTab, { tasks, transactions, profile: user });
    alert(tip); // Simple alert for now, could be a custom toast
  };

  const fullData: AppData = { tasks, transactions, profile: user, settings };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
      <UserHeader user={user} onSparkle={handleSparkle} />
      
      <main className="max-w-lg mx-auto p-4 min-h-[calc(100vh-140px)]">
        {activeTab === 'dashboard' && <Dashboard tasks={tasks} transactions={transactions} user={user} />}
        {activeTab === 'tasks' && <TaskManager tasks={tasks} setTasks={setTasks} settings={settings} />}
        {activeTab === 'expenses' && <ExpenseTracker transactions={transactions} setTransactions={setTransactions} budget={user.monthlyBudget} />}
        {activeTab === 'stats' && <Stats transactions={transactions} />}
        {activeTab === 'profile' && (
          <Profile 
            user={user} 
            setUser={setUser} 
            settings={settings} 
            setSettings={setSettings} 
            fullData={fullData}
            onImport={handleImport}
            onReset={handleReset}
          />
        )}
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
