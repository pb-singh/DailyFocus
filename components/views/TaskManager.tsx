import React, { useState } from 'react';
import { Task, Priority, UserSettings } from '../../types';
import { Button, Input, Select, Card } from '../ui/UIComponents';
import { Plus, Sparkles, Trash2, Check, Clock, AlertCircle, AlertTriangle, ArrowDown, Minimize2, CalendarClock, X, ChevronRight, BellOff } from 'lucide-react';
import { polishTask, summarizeTask } from '../../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  settings: UserSettings;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks, settings }) => {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('Pending');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    let reminderISO = undefined;
    if (reminderDateTime) {
      const d = new Date(reminderDateTime);
      if (!isNaN(d.getTime())) {
        reminderISO = d.toISOString();
      }
    }

    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle,
      priority,
      completed: false,
      createdAt: Date.now(),
      reminderTime: reminderISO,
      notified: false
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setReminderDateTime('');
  };

  const handlePolish = async () => {
    if (!newTaskTitle) return;
    setIsProcessingAI(true);
    const polished = await polishTask(newTaskTitle);
    setNewTaskTitle(polished);
    setIsProcessingAI(false);
  };

  const handleSummarize = async () => {
    if (!newTaskTitle) return;
    setIsProcessingAI(true);
    const summarized = await summarizeTask(newTaskTitle);
    setNewTaskTitle(summarized);
    setIsProcessingAI(false);
  };

  const handleSnooze = (taskId: string) => {
    const minutes = settings.snoozeDurationMinutes || 5;
    const newTime = new Date(Date.now() + minutes * 60000).toISOString();
    
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, reminderTime: newTime, notified: false } 
        : t
    ));
  };

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return !t.completed;
    if (filter === 'Completed') return t.completed;
    return true;
  });

  const getPriorityIcon = (p: Priority) => {
    switch (p) {
      case Priority.High: return <AlertCircle size={14} className="text-rose-400" />;
      case Priority.Medium: return <AlertTriangle size={14} className="text-amber-400" />;
      case Priority.Low: return <ArrowDown size={14} className="text-blue-400" />;
    }
  };

  const formatReminderDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute:'2-digit' });
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Tasks</h2>
        <div className="flex bg-slate-800/50 p-1 rounded-xl">
          {(['All', 'Pending', 'Completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="space-y-4 border-indigo-500/20">
        <div className="flex gap-2 items-start">
          <Input 
            placeholder="Add a new task..." 
            value={newTaskTitle} 
            onChange={e => setNewTaskTitle(e.target.value)}
          />
          <div className="flex gap-1 pt-1">
            <Button variant="secondary" onClick={handleSummarize} disabled={isProcessingAI || !newTaskTitle || newTaskTitle.length < 10} className="!px-3" title="AI Summarize (Shorten)">
              <Minimize2 size={18} className={isProcessingAI ? 'animate-spin text-indigo-400' : 'text-indigo-400'} />
            </Button>
            <Button variant="secondary" onClick={handlePolish} disabled={isProcessingAI || !newTaskTitle} className="!px-3" title="AI Polish">
               <Sparkles size={18} className={isProcessingAI ? 'animate-spin text-amber-400' : 'text-amber-400'} />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           <Select 
             options={[
               { label: 'Medium Priority', value: Priority.Medium },
               { label: 'High Priority', value: Priority.High },
               { label: 'Low Priority', value: Priority.Low }
             ]}
             value={priority}
             onChange={(e) => setPriority(e.target.value as Priority)}
             className="h-[66px]" 
           />
           
           <div className="relative group w-full">
              {/* Visual Container */}
              <div className={`
                flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all duration-500 h-[66px] backdrop-blur-xl relative overflow-hidden
                ${reminderDateTime 
                  ? 'bg-gradient-to-r from-indigo-900/40 to-slate-900/40 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                  : 'bg-slate-900/40 border-white/10 hover:bg-slate-800/60 hover:border-indigo-500/30'}
              `}>
                  {/* Subtle Glow Effect */}
                  {reminderDateTime && <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none"></div>}

                  <div className="flex items-center gap-3 relative z-0 overflow-hidden">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-500 shrink-0
                      ${reminderDateTime 
                        ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 scale-105 rotate-3' 
                        : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-slate-700'}
                    `}>
                      <CalendarClock size={20} strokeWidth={reminderDateTime ? 2.5 : 2} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 ${reminderDateTime ? 'text-indigo-300' : 'text-slate-500'}`}>
                        {reminderDateTime ? 'Reminder Set' : 'Schedule'}
                      </span>
                      <span className={`text-sm font-medium transition-colors duration-300 truncate ${reminderDateTime ? 'text-white' : 'text-slate-400'}`}>
                        {reminderDateTime ? formatReminderDate(reminderDateTime) : "Add date & time"}
                      </span>
                    </div>
                  </div>

                  {!reminderDateTime && (
                    <div className="text-slate-600 group-hover:text-indigo-400 transition-colors duration-300 relative z-0">
                      <ChevronRight size={18} />
                    </div>
                  )}
              </div>
              
              {/* Actual Input */}
              <input 
                 type="datetime-local" 
                 value={reminderDateTime} 
                 onChange={e => setReminderDateTime(e.target.value)} 
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
                 aria-label="Set reminder date and time"
              />

              {/* Clear Button - z-index higher than input */}
              {reminderDateTime && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setReminderDateTime('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/50 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all duration-200 backdrop-blur-sm"
                  title="Clear reminder"
                >
                  <X size={16} />
                </button>
              )}
           </div>
        </div>

        <Button className="w-full" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
          <Plus size={18} /> Add Task
        </Button>
      </Card>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center text-slate-500 py-10">No tasks found.</div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center justify-between p-4 rounded-xl border backdrop-blur-md transition-all relative ${
                task.completed 
                  ? 'bg-slate-800/30 border-slate-700 opacity-50' 
                  : task.priority === Priority.High
                    ? 'bg-rose-900/10 border-rose-500/40 hover:bg-rose-900/20'
                    : task.priority === Priority.Medium
                      ? 'bg-amber-900/10 border-amber-500/40 hover:bg-amber-900/20'
                      : 'bg-blue-900/10 border-blue-500/40 hover:bg-blue-900/20'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button 
                  onClick={() => toggleComplete(task.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500 hover:border-indigo-400'
                  }`}
                >
                  {task.completed && <Check size={14} className="text-white" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!task.completed && getPriorityIcon(task.priority)}
                    <p className={`text-sm font-medium truncate ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {task.title}
                    </p>
                  </div>
                  {task.reminderTime && (
                    <div className={`flex items-center gap-1 text-xs mt-0.5 ${task.notified && !task.completed ? 'text-indigo-400 font-semibold animate-pulse' : 'text-slate-500'}`}>
                       <Clock size={10} />
                       {new Date(task.reminderTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                       {task.notified && !task.completed && <span className="ml-1 uppercase tracking-wider text-[10px] bg-indigo-500/20 px-1 rounded">Active</span>}
                    </div>
                  )}
                </div>

                {task.notified && !task.completed && (
                  <Button 
                    variant="secondary" 
                    onClick={() => handleSnooze(task.id)}
                    className="!px-3 !py-1 h-8 text-xs shrink-0 flex items-center gap-1 border-indigo-500/30 text-indigo-200 bg-indigo-900/30 hover:bg-indigo-900/50"
                    title={`Snooze for ${settings.snoozeDurationMinutes}m`}
                  >
                    <BellOff size={14} />
                    <span className="hidden sm:inline">Snooze</span>
                  </Button>
                )}
              </div>
              
              <button 
                onClick={() => deleteTask(task.id)}
                className="text-slate-600 hover:text-rose-500 transition-colors p-2 ml-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;