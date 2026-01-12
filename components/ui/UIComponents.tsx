import React from 'react';

// --- Card ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}
export const Card: React.FC<CardProps> = ({ children, className = '', gradient = false }) => (
  <div className={`p-4 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg transition-all duration-300 ${gradient ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-slate-800/60'} ${className}`}>
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) => {
  const base = "rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-white/10",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {loading ? <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full"/> : children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">{label}</label>}
    <input 
      className={`w-full bg-slate-900/50 border ${error ? 'border-rose-500' : 'border-white/10 focus:border-indigo-500'} rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${className}`}
      {...props} 
    />
    {error && <span className="text-rose-400 text-xs ml-1">{error}</span>}
  </div>
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}
export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">{label}</label>}
    <div className="relative">
      <select 
        className={`w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none transition-all ${className}`}
        {...props}
      >
        {options.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">{opt.label}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  </div>
);
