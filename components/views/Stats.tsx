import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../../types';
import { Card } from '../ui/UIComponents';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StatsProps {
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'];

const Stats: React.FC<StatsProps> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === TransactionType.Expense);

  const monthlyData = useMemo(() => {
    const data = new Array(12).fill(0).map((_, i) => ({
      name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      amount: 0
    }));
    
    expenses.forEach(t => {
      const month = new Date(t.date).getMonth();
      data[month].amount += t.amount;
    });
    return data;
  }, [expenses]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalSpent = expenses.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>
      
      <Card>
        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase">Monthly Spending</h3>
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: '#334155', opacity: 0.4 }}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center">
          <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase w-full text-left">Distribution</h3>
          <div className="h-48 w-full relative">
             <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                </PieChart>
             </ResponsiveContainer>
          </div>
        </Card>

        <Card>
           <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase">Breakdown</h3>
           <div className="space-y-3">
             {categoryData.length > 0 ? (
               categoryData.map((cat, idx) => (
                 <div key={cat.name} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                     <span className="text-slate-200">{cat.name}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-white font-medium">₹{cat.value.toFixed(0)}</span>
                     <span className="text-xs text-slate-500 ml-2">({((cat.value / totalSpent) * 100).toFixed(0)}%)</span>
                   </div>
                 </div>
               ))
             ) : (
                <div className="text-center text-slate-500 py-4 text-sm">No expense data available</div>
             )}
           </div>
        </Card>
      </div>
    </div>
  );
};

export default Stats;