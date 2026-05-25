import React, { useState } from 'react';
import { useUser, StudyGoal } from '../store/UserContext';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Plus, CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react';

export function StudyGoals() {
  const { profile, updateProfile } = useUser();
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'short' | 'long'>('short');
  const [newDeadline, setNewDeadline] = useState('');

  if (!profile) return null;

  const goals = profile.goals || [];

  const addGoal = () => {
    if (!newTitle.trim()) return;
    const goal: StudyGoal = {
      id: Math.random().toString(36).substring(7),
      title: newTitle.trim(),
      type: newType,
      deadline: newDeadline || undefined,
      completed: false
    };
    updateProfile({ goals: [...goals, goal] });
    setNewTitle('');
    setNewDeadline('');
  };

  const toggleGoal = (id: string) => {
    const updated = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    updateProfile({ goals: updated });
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    updateProfile({ goals: updated });
  };

  const shortTerm = goals.filter(g => g.type === 'short');
  const longTerm = goals.filter(g => g.type === 'long');

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
      <div className="glass-card p-6 md:p-8">
        <h2 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-2 flex items-center gap-2">
          <Target className="w-8 h-8 text-blue-500" /> Study Goals
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">Set and track your academic milestones.</p>

        <div className="bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 flex flex-col md:flex-row gap-4 mb-8">
           <input
             type="text"
             className="flex-1 bg-transparent border-b border-[rgba(255,255,255,0.1)] px-2 py-2 focus:outline-none focus:border-brand-blue"
             placeholder="Goal (e.g., Score 90% in Math)"
             value={newTitle}
             onChange={e => setNewTitle(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && addGoal()}
           />
           <input 
             type="date"
             className="bg-transparent border-b border-[rgba(255,255,255,0.1)] px-2 py-2 focus:outline-none text-sm text-[var(--color-text-secondary)]"
             value={newDeadline}
             onChange={e => setNewDeadline(e.target.value)}
           />
           <select 
             className="bg-transparent border-none text-sm px-2 focus:outline-none"
             value={newType}
             onChange={e => setNewType(e.target.value as 'short'|'long')}
           >
             <option value="short" className="bg-black">Short Term</option>
             <option value="long" className="bg-black">Long Term</option>
           </select>
           <button 
             onClick={addGoal}
             className="bg-brand-blue text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"
           >
             <Plus className="w-4 h-4" /> Add
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
             <h3 className="font-heading font-bold text-lg mb-4 text-emerald-400 flex items-center gap-2">Short-Term Goals</h3>
             <ul className="space-y-3">
               <AnimatePresence>
                 {shortTerm.length === 0 && <p className="text-[var(--color-text-secondary)] italic text-sm">No short-term goals set.</p>}
                 {shortTerm.map(goal => (
                   <motion.li 
                     key={goal.id} 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, height: 0 }}
                     className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[rgba(255,255,255,0.05)] group"
                   >
                     <button onClick={() => toggleGoal(goal.id)} className="text-[var(--color-text-secondary)] hover:text-emerald-400">
                       {goal.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                     </button>
                     <div className={`flex-1 ${goal.completed ? 'line-through opacity-50' : ''}`}>
                       <p className="text-sm font-medium">{goal.title}</p>
                       {goal.deadline && <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 mt-1"><Calendar className="w-3 h-3"/> {new Date(goal.deadline).toLocaleDateString()}</p>}
                     </div>
                     <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                     </button>
                   </motion.li>
                 ))}
               </AnimatePresence>
             </ul>
           </div>

           <div>
             <h3 className="font-heading font-bold text-lg mb-4 text-brand-purple flex items-center gap-2">Long-Term Goals</h3>
             <ul className="space-y-3">
               <AnimatePresence>
                 {longTerm.length === 0 && <p className="text-[var(--color-text-secondary)] italic text-sm">No long-term goals set.</p>}
                 {longTerm.map(goal => (
                   <motion.li 
                     key={goal.id} 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, height: 0 }}
                     className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[rgba(255,255,255,0.05)] group"
                   >
                     <button onClick={() => toggleGoal(goal.id)} className="text-[var(--color-text-secondary)] hover:text-emerald-400">
                       {goal.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                     </button>
                     <div className={`flex-1 ${goal.completed ? 'line-through opacity-50' : ''}`}>
                       <p className="text-sm font-medium">{goal.title}</p>
                       {goal.deadline && <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 mt-1"><Calendar className="w-3 h-3"/> {new Date(goal.deadline).toLocaleDateString()}</p>}
                     </div>
                     <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                     </button>
                   </motion.li>
                 ))}
               </AnimatePresence>
             </ul>
           </div>
        </div>

      </div>
    </div>
  );
}
