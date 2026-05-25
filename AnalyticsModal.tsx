import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, TrendingUp, Target, Award, Zap, Calendar, Clock } from 'lucide-react';
import { useUser } from '../store/UserContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function AnalyticsModal({ onClose }: { onClose: () => void }) {
  const { profile } = useUser();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  if (!profile) return null;

  const generateData = (days: number) => {
    return Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const isToday = i === days - 1;
      const randomXP = Math.floor(Math.random() * 50) + 10;
      return {
        date: days === 7 ? d.toLocaleDateString('en-US', { weekday: 'short' }) : d.getDate().toString(),
        xp: isToday ? 45 : randomXP,
        questions: Math.floor((isToday ? 45 : randomXP) / 5)
      };
    });
  };

  const historyData = generateData(timeframe === 'weekly' ? 7 : 30);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--color-bg-secondary)] border border-[rgba(255,255,255,0.1)] p-6 md:p-8 rounded-2xl max-w-4xl w-full shadow-2xl my-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-display font-bold text-2xl flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-brand-green" /> 
            Learning Analytics
          </h3>
          <div className="flex items-center gap-4">
             <div className="flex bg-[rgba(255,255,255,0.05)] rounded-lg p-1">
               <button 
                 onClick={() => setTimeframe('weekly')}
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timeframe === 'weekly' ? 'bg-brand-blue text-white' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
               >
                 Weekly
               </button>
               <button 
                 onClick={() => setTimeframe('monthly')}
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timeframe === 'monthly' ? 'bg-brand-blue text-white' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
               >
                 Monthly
               </button>
             </div>
             <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white bg-[rgba(255,255,255,0.05)] p-2 rounded-xl transition-colors">
               <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-4 rounded-2xl flex flex-col gap-2">
             <div className="text-[var(--color-text-secondary)] flex items-center gap-2 text-sm font-heading"><Zap className="w-4 h-4 text-brand-orange" /> Streak</div>
             <div className="text-3xl font-display font-bold text-white">{profile.streak || 0}</div>
             <div className="text-xs text-brand-green">+1 today</div>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-4 rounded-2xl flex flex-col gap-2">
             <div className="text-[var(--color-text-secondary)] flex items-center gap-2 text-sm font-heading"><Award className="w-4 h-4 text-brand-purple" /> Level</div>
             <div className="text-3xl font-display font-bold text-white">{profile.level || 1}</div>
             <div className="text-xs text-brand-purple">{profile.xp || 0} total XP</div>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-4 rounded-2xl flex flex-col gap-2">
             <div className="text-[var(--color-text-secondary)] flex items-center gap-2 text-sm font-heading"><Target className="w-4 h-4 text-brand-blue" /> Accuracy</div>
             <div className="text-3xl font-display font-bold text-white">{timeframe === 'weekly' ? '87%' : '84%'}</div>
             <div className="text-xs text-brand-blue">Last {timeframe === 'weekly' ? '7' : '30'} days</div>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-4 rounded-2xl flex flex-col gap-2">
             <div className="text-[var(--color-text-secondary)] flex items-center gap-2 text-sm font-heading"><TrendingUp className="w-4 h-4 text-brand-green" /> Modules</div>
             <div className="text-3xl font-display font-bold text-white">4</div>
             <div className="text-xs text-[var(--color-text-secondary)]">Active this {timeframe === 'weekly' ? 'week' : 'month'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* XP History Chart */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-6 rounded-2xl">
            <h4 className="font-heading font-bold text-lg mb-6 text-white">XP History (Last {timeframe === 'weekly' ? '7' : '30'} Days)</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="xp" stroke="#a855f7" strokeWidth={3} dot={timeframe === 'monthly' ? false : { fill: '#a855f7', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Questions Practiced Chart */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-6 rounded-2xl">
            <h4 className="font-heading font-bold text-lg mb-6 text-white">Questions Practiced</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="questions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights & Breakdown */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-6 rounded-2xl">
           <h4 className="font-heading font-bold text-lg mb-6 text-white flex items-center gap-2"><Clock className="w-5 h-5 text-brand-gold"/> Performance Insights</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
               <div className="text-sm text-[var(--color-text-secondary)] font-bold">Top Performing Subjects</div>
               <div className="bg-[rgba(16,185,129,0.1)] text-emerald-400 px-3 py-2 rounded-lg text-sm border border-emerald-500/20">{profile.strongSubject || 'Science'} (92% Accuracy)</div>
               <div className="bg-[rgba(16,185,129,0.05)] text-emerald-400/80 px-3 py-2 rounded-lg text-sm border border-emerald-500/10">Mathematics (85% Accuracy)</div>
             </div>
             <div className="space-y-2">
               <div className="text-sm text-[var(--color-text-secondary)] font-bold">Needs Focus</div>
               {profile.weakSubjects && profile.weakSubjects.map(sub => (
                 <div key={sub} className="bg-[rgba(244,63,94,0.1)] text-rose-400 px-3 py-2 rounded-lg text-sm border border-rose-500/20">{sub} (Review Recommended)</div>
               ))}
               {(!profile.weakSubjects || profile.weakSubjects.length === 0) && (
                 <div className="bg-[rgba(244,63,94,0.1)] text-rose-400 px-3 py-2 rounded-lg text-sm border border-rose-500/20">History (Low Activity)</div>
               )}
             </div>
             <div className="space-y-2">
               <div className="text-sm text-[var(--color-text-secondary)] font-bold">Time Allocation</div>
               <div className="flex justify-between items-center text-sm"><span className="text-brand-blue">Quizzes</span> <span className="font-mono">45%</span></div>
               <div className="w-full bg-[rgba(255,255,255,0.05)] h-2 rounded-full overflow-hidden"><div className="bg-brand-blue h-full w-[45%]"></div></div>
               <div className="flex justify-between items-center text-sm mt-3"><span className="text-brand-purple">Notes Gen</span> <span className="font-mono">30%</span></div>
               <div className="w-full bg-[rgba(255,255,255,0.05)] h-2 rounded-full overflow-hidden"><div className="bg-brand-purple h-full w-[30%]"></div></div>
               <div className="flex justify-between items-center text-sm mt-3"><span className="text-brand-gold">Flashcards</span> <span className="font-mono">25%</span></div>
               <div className="w-full bg-[rgba(255,255,255,0.05)] h-2 rounded-full overflow-hidden"><div className="bg-brand-gold h-full w-[25%]"></div></div>
             </div>
           </div>
        </div>

      </motion.div>
    </div>
  );
}
