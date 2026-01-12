import React, { useMemo } from 'react';
import { Task, Transaction, UserProfile } from '../../types';
import { Card } from '../ui/UIComponents';
import { CheckCircle2, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  transactions: Transaction[];
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, transactions, user }) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const pendingTasks = tasks.filter(t => !t.completed).length;
  
  const spentToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return transactions
      .filter(t => t.type === 'Expense' && t.date.startsWith(today))
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const recentActivity = useMemo(() => {
    const allItems = [
      ...tasks.map(t => ({ ...t, type: 'task' as const, dateObj: new Date(t.createdAt) })),
      ...transactions.map(t => ({ ...t, type: 'transaction' as const, dateObj: new Date(t.createdAt) }))
    ];
    return allItems.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).slice(0, 5);
  }, [tasks, transactions]);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          {greeting}, {user.name.split(' ')[0]}
        </h2>
        <p className="text-slate-400">Here's your daily overview.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600/20 to-indigo-900/20 border-indigo-500/30">
          <div className="flex flex-col">
            <span className="text-slate-400 text-sm mb-1">Pending Tasks</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{pendingTasks}</span>
              <span className="text-xs text-indigo-300">items</span>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border-emerald-500/30">
          <div className="flex flex-col">
            <span className="text-slate-400 text-sm mb-1">Spent Today</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">₹{spentToday.toFixed(0)}</span>
              <span className="text-xs text-emerald-300">INR</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white px-1">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((item: any) => (
            <Card key={item.id} className="flex items-center gap-4 py-3">
              <div className={`p-2 rounded-full ${
                item.type === 'task' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : item.type === 'transaction' && item.category === 'Income'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
              }`}>
                {item.type === 'task' ? <CheckCircle2 size={18} /> : 
                 item.category === 'Income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {item.type === 'task' ? item.title : item.description}
                </p>
                <p className="text-xs text-slate-400">
                  {item.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {item.type === 'transaction' && ` • ${item.category}`}
                </p>
              </div>
              <div className="text-right">
                {item.type === 'transaction' && (
                  <span className={`text-sm font-semibold ${item.category === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.category === 'Income' ? '+' : '-'}₹{Math.abs(item.amount)}
                  </span>
                )}
                {item.type === 'task' && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    item.priority === 'High' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                    item.priority === 'Medium' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                    'border-blue-500/30 text-blue-400 bg-blue-500/10'
                  }`}>
                    {item.priority}
                  </span>
                )}
              </div>
            </Card>
          ))}
          {recentActivity.length === 0 && (
            <div className="text-center py-8 text-slate-500">No activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;