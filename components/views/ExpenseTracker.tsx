import React, { useState } from 'react';
import { Transaction, TransactionType, ExpenseCategory } from '../../types';
import { Button, Input, Select, Card } from '../ui/UIComponents';
import { Plus, TrendingUp, TrendingDown, Sparkles, AlertCircle } from 'lucide-react';
import { predictCategory, analyzeSpending } from '../../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseTrackerProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  budget: number;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ transactions, setTransactions, budget }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.Expense);
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Food);
  const [showTips, setShowTips] = useState(false);
  const [tips, setTips] = useState('');
  const [loadingTips, setLoadingTips] = useState(false);

  const totalIncome = transactions.filter(t => t.type === TransactionType.Income).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === TransactionType.Expense).reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handleDescChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDesc(val);
    if (val.length > 3 && type === TransactionType.Expense) {
      // Debounce could be better, but direct for simplicity
      // Only predict if no manual category set? 
      // For now just background predict
      try {
        const pred = await predictCategory(val);
        setCategory(pred);
      } catch (e) {}
    }
  };

  const handleAdd = () => {
    if (!desc || !amount) return;
    const newTx: Transaction = {
      id: uuidv4(),
      description: desc,
      amount: parseFloat(amount),
      type,
      category: type === TransactionType.Income ? ExpenseCategory.Income : category,
      date: new Date().toISOString(),
      createdAt: Date.now()
    };
    setTransactions(prev => [newTx, ...prev]);
    setDesc('');
    setAmount('');
  };

  const getTips = async () => {
    setShowTips(!showTips);
    if (!tips && !showTips) {
      setLoadingTips(true);
      const advice = await analyzeSpending(transactions, budget);
      setTips(advice);
      setLoadingTips(false);
    }
  };

  // Group by date
  const grouped = transactions.reduce((groups, tx) => {
    const date = tx.date.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10 shadow-2xl p-6 text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
        <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Net Balance</p>
        <h2 className={`text-4xl font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          ₹{netBalance.toFixed(2)}
        </h2>
        <div className="flex justify-center gap-8 mt-4">
           <div className="text-center">
             <span className="text-xs text-emerald-500 flex items-center gap-1 justify-center"><TrendingUp size={12}/> Income</span>
             <p className="text-white font-semibold">₹{totalIncome.toFixed(0)}</p>
           </div>
           <div className="text-center">
             <span className="text-xs text-rose-500 flex items-center gap-1 justify-center"><TrendingDown size={12}/> Expenses</span>
             <p className="text-white font-semibold">₹{totalExpense.toFixed(0)}</p>
           </div>
        </div>
      </div>

      <Card className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg">
          <button 
            className={`flex-1 py-2 text-sm rounded-md transition-all ${type === TransactionType.Expense ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}
            onClick={() => setType(TransactionType.Expense)}
          >
            Expense
          </button>
          <button 
            className={`flex-1 py-2 text-sm rounded-md transition-all ${type === TransactionType.Income ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}
            onClick={() => setType(TransactionType.Income)}
          >
            Income
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Input 
            className="col-span-2"
            placeholder="Description (e.g. Starbucks)"
            value={desc} 
            onChange={handleDescChange}
          />
          <Input 
            type="number"
            placeholder="Amount"
            value={amount} 
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        {type === TransactionType.Expense && (
          <div className="flex items-center gap-2">
            <Select 
              value={category}
              onChange={e => setCategory(e.target.value as ExpenseCategory)}
              options={Object.values(ExpenseCategory).filter(c => c !== 'Income').map(c => ({ label: c, value: c }))}
            />
            <div className="text-xs text-slate-500 px-2 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400"/> AI Auto-Select
            </div>
          </div>
        )}

        <Button onClick={handleAdd} className={`w-full ${type === TransactionType.Expense ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
          <Plus size={18} /> Add {type}
        </Button>
      </Card>

      <div className="flex justify-between items-center px-1">
        <h3 className="text-lg font-semibold text-white">History</h3>
        <button 
            onClick={getTips}
            className="text-xs text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors"
        >
          <Sparkles size={14} /> AI Analysis
        </button>
      </div>

      {showTips && (
        <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-xl text-sm text-indigo-200 animate-fade-in">
          {loadingTips ? (
            <div className="flex items-center gap-2"><div className="animate-spin h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full"/> Analyzing...</div>
          ) : (
            <div className="whitespace-pre-line leading-relaxed">{tips}</div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).sort((a,b) => b[0].localeCompare(a[0])).map(([date, txs]) => (
          <div key={date}>
            <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </h4>
            <div className="space-y-2">
              {txs.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'Income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                       {tx.type === 'Income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{tx.description}</p>
                      <p className="text-xs text-slate-500">{tx.category}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${tx.type === 'Income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseTracker;