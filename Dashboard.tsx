import { useUser } from '../store/UserContext';
import { BookOpen, Sparkles, Send, ArrowLeft, Search, MessageSquare, Settings, CheckSquare, Layers, FileSearch, FileText, Lightbulb, Flame, CalendarDays, Leaf, X, FileSignature, Network, Target, Award, Zap, Users } from 'lucide-react';
import { SmartNotes } from './SmartNotes';
import React, { useEffect, useState } from 'react';
import { Relaxation } from './Relaxation';
import { PYQAnalyser } from './PYQAnalyser';
import { Flashcards } from './Flashcards';
import { SmartQuiz } from './SmartQuiz';
import { TricksBox } from './TricksBox';
import { RevisionBooster } from './RevisionBooster';
import { TimetableGen } from './TimetableGen';
import { PomodoroTimer } from './PomodoroTimer';
import { AnswerEvaluator } from './AnswerEvaluator';
import { ConceptMapper } from './ConceptMapper';
import { AnalyticsModal } from './AnalyticsModal';
import { StudyGoals } from './StudyGoals';
import { CommunityHub } from './CommunityHub';
import { motion, AnimatePresence } from 'motion/react';

const MOTIVATIONAL_QUOTES = [
  { text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.", author: "Pelé" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" }
];

export function Dashboard() {
  const { profile, updateProfile, toggleTheme, theme } = useUser();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [settingsActiveId, setSettingsActiveId] = useState<string | null>(null);
  const [colorVersion, setColorVersion] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const getModuleColor = (id: string, defaultColor: string) => {
    return localStorage.getItem(`setting_${id}_color`) || defaultColor;
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "studygenie_profile.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (parsed && typeof parsed === 'object') {
             updateProfile(parsed);
             setIsProfileOpen(false);
          }
        } catch(err) {
          console.error("Failed to import", err);
        }
      };
      reader.readAsText(file);
    }
  };
  const [stats, setStats] = useState({ quiz: 0, flashcards: 0, lastQuiz: '', lastFlashcard: '' });

  useEffect(() => {
    // Basic local progress tracking
    const q = parseInt(localStorage.getItem('quizProgress') || '0', 10);
    const f = parseInt(localStorage.getItem('flashcardProgress') || '0', 10);
    
    const tryFormatDate = (key: string) => {
        try {
            const dateStr = localStorage.getItem(key);
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) return 'Last reviewed: Today';
            if (diffDays === 1) return 'Last reviewed: Yesterday';
            return `Last reviewed: ${diffDays} days ago`;
        } catch(e) { return ''; }
    };

    setStats({ 
        quiz: q, 
        flashcards: f,
        lastQuiz: tryFormatDate('lastQuizActivity'),
        lastFlashcard: tryFormatDate('lastFlashcardActivity')
    });

    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 8000);
    return () => clearInterval(quoteTimer);
  }, [activeModule]);

  if (!profile) return null;

  const modules = [
    { id: 'pyq', title: "PYQ Analyser", icon: <FileSearch className="w-6 h-6" />, color: "from-brand-blue to-cyan-500", desc: "Past year patterns", category: 'Practice', lastUsed: localStorage.getItem('lastPyqActivity') },
    { id: 'notes', title: "Smart Notes", icon: <FileText className="w-6 h-6" />, color: "from-brand-purple to-fuchsia-500", desc: "AI generated notes", category: 'AI Tools', lastUsed: localStorage.getItem('lastNotesActivity') },
    { id: 'flashcards', title: "Flashcards", icon: <Layers className="w-6 h-6" />, color: "from-brand-gold to-yellow-600", desc: "Spaced repetition", progress: `${stats.flashcards} cards reviewed`, lastActive: stats.lastFlashcard, category: 'Practice', lastUsed: localStorage.getItem('lastFlashcardActivity') },
    { id: 'quiz', title: "Smart Quiz", icon: <CheckSquare className="w-6 h-6" />, color: "from-brand-green to-emerald-600", desc: "Practice & Test", progress: `${stats.quiz} questions answered`, lastActive: stats.lastQuiz, category: 'Practice', lastUsed: localStorage.getItem('lastQuizActivity') },
    { id: 'evaluator', title: "Answer Evaluator", icon: <FileSignature className="w-6 h-6" />, color: "from-emerald-400 to-emerald-600", desc: "AI subjective grading", category: 'Practice', lastUsed: localStorage.getItem('lastEvaluatorActivity') },
    { id: 'mapper', title: "Concept Mapper", icon: <Network className="w-6 h-6" />, color: "from-blue-400 to-indigo-600", desc: "Visual mind maps", category: 'AI Tools', lastUsed: localStorage.getItem('lastMapActivity') },
    { id: 'goals', title: "Study Goals", icon: <Target className="w-6 h-6" />, color: "from-purple-400 to-fuchsia-600", desc: "Track milestones", category: 'Utilities', lastUsed: 'null' },
    { id: 'community', title: "Community Hub", icon: <Users className="w-6 h-6" />, color: "from-teal-400 to-cyan-600", desc: "Share & connect", category: 'Utilities', lastUsed: 'null' },
    { id: 'tricks', title: "Tricks Box", icon: <Lightbulb className="w-6 h-6" />, color: "from-brand-pink to-rose-500", desc: "Mnemonics & shortcuts", category: 'AI Tools', lastUsed: localStorage.getItem('lastTricksActivity') },
    { id: 'revision', title: "Revision Booster", icon: <Flame className="w-6 h-6" />, color: "from-brand-orange to-red-500", desc: "Exam sprint", category: 'AI Tools', lastUsed: localStorage.getItem('lastRevisionActivity') },
    { id: 'timetable', title: "Timetable Gen", icon: <CalendarDays className="w-6 h-6" />, color: "from-indigo-400 to-indigo-600", desc: "AI study planner", category: 'Utilities', lastUsed: localStorage.getItem('lastTimetableActivity') },
    { id: 'relax', title: "Relaxation", icon: <Leaf className="w-6 h-6" />, color: "from-teal-400 to-teal-600", desc: "Sounds & breathing", category: 'Utilities', lastUsed: localStorage.getItem('lastRelaxActivity') },
  ];

  const filteredModules = modules.filter(m => 
    (filterCategory === 'All' || m.category === filterCategory) &&
    (m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    if (sortBy === 'lastUsed') {
      const timeA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
      const timeB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
      return timeB - timeA;
    }
    return 0;
  });

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 max-w-7xl mx-auto">
      {/* Top Header */}
      <header className="flex justify-between items-center mb-10 glass-card p-4 rounded-2xl relative z-10">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsProfileOpen(true)}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-xl shadow-glow-blue group-hover:scale-110 transition-transform">
            {profile.avatar}
          </div>
          <div className="group-hover:opacity-80 transition-opacity">
            <h1 className="font-display font-bold text-xl">StudyGenie</h1>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center gap-2">
              <span className="bg-brand-blue/20 text-brand-blue px-1.5 py-0.5 rounded text-[10px]">Lvl {profile.level || 1}</span>
              <span>{profile.board} • {profile.class}</span>
              {profile.streak && profile.streak > 0 ? (
                 <span className="text-brand-orange flex items-center gap-1">
                   <Flame className="w-3 h-3"/> {profile.streak}
                 </span>
              ) : null}
            </div>
            {/* Very simple XP bar */}
            <div className="w-full bg-[rgba(255,255,255,0.1)] h-1 rounded-full mt-1 overflow-hidden">
               <div className="h-full bg-brand-blue transition-all" style={{ width: `${((profile.xp || 0) % 100)}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2 w-64 focus-within:border-brand-blue transition-colors">
          <Search className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full font-heading"
          />
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2 text-sm font-heading hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            <Layers className="w-4 h-4" /> Analytics
          </button>
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="hidden xl:flex items-center gap-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2 text-sm font-heading hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> Feedback
          </button>
          <select 
            className="bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2 focus:outline-none focus:border-brand-blue text-sm font-heading"
            value={profile.examType || ''}
            onChange={(e) => updateProfile({ examType: e.target.value })}
          >
            <option value="boards">Board Exams</option>
            <option value="jee">JEE Main/Adv</option>
            <option value="neet">NEET</option>
            <option value="cuet">CUET / General</option>
          </select>
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors text-xl"
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!activeModule ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Hero + Pomodoro */}
            <div className="mb-12 relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start">
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                  Ready to conquer today, <span className="vibrant-text">{profile.name.split(' ')[0]}?</span> ⚡
                </h2>
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 mt-4 max-w-lg min-h-[90px] relative overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.div 
                      key={quoteIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-[var(--color-text-secondary)] italic text-sm mb-2">
                        "{MOTIVATIONAL_QUOTES[quoteIndex].text}"
                      </p>
                      <p className="text-brand-blue font-bold text-xs">— {MOTIVATIONAL_QUOTES[quoteIndex].author}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
                {profile.examDate && (
                  <div className="inline-block bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-6 py-2 text-sm font-mono text-brand-gold mt-4">
                    📅 Mission Board: {Math.max(0, Math.ceil((new Date(profile.examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} Days Left
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-6">
                   <div className="flex items-center gap-2 bg-[rgba(245,158,11,0.1)] border border-brand-orange text-brand-orange px-3 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-orange-500/10">
                     <Zap className="w-4 h-4 fill-brand-orange" /> {profile.streak || 0} Day Streak
                   </div>
                   {profile.badges?.map(badge => (
                     <div key={badge} className="flex items-center gap-1.5 bg-[rgba(168,85,247,0.1)] border border-brand-purple text-[var(--color-text-primary)] px-3 py-1.5 rounded-full text-xs font-medium">
                       <Award className="w-3.5 h-3.5 text-brand-purple" /> {badge}
                     </div>
                   ))}
                </div>
              </div>
              <div className="shrink-0 w-[300px]">
                <PomodoroTimer />
              </div>
            </div>

            {/* Daily Quests */}
            <div className="mb-12 relative z-10 glass-card p-6 border-l-4 border-l-brand-gold">
              <h3 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-brand-gold" /> Daily Quests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.challenges?.map(challenge => (
                  <div key={challenge.id} className={`p-4 rounded-xl border flex items-center justify-between ${challenge.completed ? 'bg-[rgba(16,185,129,0.1)] border-emerald-500/30' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${challenge.completed ? 'bg-emerald-500 text-white' : 'bg-[rgba(255,255,255,0.1)] text-[var(--color-text-secondary)]'}`}>
                        {challenge.completed ? <CheckSquare className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${challenge.completed ? 'text-emerald-400 line-through opacity-70' : 'text-white'}`}>{challenge.name}</p>
                        <p className="text-xs text-brand-gold font-mono">+{challenge.xp} XP</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 relative z-10 justify-between items-center bg-[rgba(255,255,255,0.02)] p-4 rounded-2xl border border-[rgba(255,255,255,0.05)]">
              <div className="flex gap-2">
                {['All', 'AI Tools', 'Practice', 'Utilities'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-heading transition-colors ${filterCategory === cat ? 'bg-brand-blue text-white' : 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.1)]'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-secondary)] font-heading">Sort by:</span>
                <select 
                  className="bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2 focus:outline-none focus:border-brand-blue text-sm font-heading"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="lastUsed">Last Used</option>
                </select>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
              {filteredModules.map((mod) => {
                const currentTheme = getModuleColor(mod.id, mod.color);
                return (
                <div 
                  key={mod.id} 
                  onClick={() => setActiveModule(mod.id)}
                  className="glass-card p-6 cursor-pointer group hover:border-[var(--color-theme-primary)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style={{ backgroundImage: `var(--tw-gradient-stops)`, '--tw-gradient-from': currentTheme.split(' ')[0].replace('from-', ''), '--tw-gradient-to': currentTheme.split(' ')[2]?.replace('to-', '') } as any} />
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSettingsActiveId(mod.id);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-[rgba(255,255,255,0.05)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-text-secondary)] hover:text-white z-10"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentTheme} flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg relative z-10`}>
                    {mod.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2 relative z-10">{mod.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4 relative z-10">{mod.desc}</p>
                  {mod.progress && (
                    <div className="flex flex-col items-start gap-1 relative z-10">
                      <div className="text-xs font-mono bg-brand-blue/10 text-brand-blue inline-block px-2 py-1 rounded">
                        {mod.progress}
                      </div>
                      {mod.lastActive && (
                        <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                          {mod.lastActive}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )})}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="module"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10"
          >
            <button 
              onClick={() => setActiveModule(null)}
              className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white mb-6 font-heading transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </button>
            
            {activeModule === 'notes' && <SmartNotes />}
            {activeModule === 'relax' && <Relaxation />}
            {activeModule === 'pyq' && <PYQAnalyser />}
            {activeModule === 'flashcards' && <Flashcards />}
            {activeModule === 'quiz' && <SmartQuiz />}
            {activeModule === 'evaluator' && <AnswerEvaluator />}
            {activeModule === 'mapper' && <ConceptMapper />}
            {activeModule === 'goals' && <StudyGoals />}
            {activeModule === 'community' && <CommunityHub />}
            {activeModule === 'tricks' && <TricksBox />}
            {activeModule === 'revision' && <RevisionBooster />}
            {activeModule === 'timetable' && <TimetableGen />}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAnalyticsOpen && <AnalyticsModal onClose={() => setIsAnalyticsOpen(false)} />}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--color-bg-secondary)] border border-[rgba(255,255,255,0.1)] p-6 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-3xl rounded-full pointer-events-none"></div>
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-display font-bold text-2xl flex items-center gap-2">
                   Feedback
                </h3>
                <button onClick={() => setIsFeedbackOpen(false)} className="text-[var(--color-text-secondary)] hover:text-white bg-[rgba(255,255,255,0.05)] p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 relative z-10">
                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-4 text-center">How would you rate StudyGenie?</label>
                <div className="flex flex-col items-center gap-4">
                   <div className="flex items-center justify-center gap-2 mb-2">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <motion.button
                         key={star}
                         whileHover={{ scale: 1.1 }}
                         whileTap={{ scale: 0.9 }}
                         onClick={() => setFeedbackRating(star)}
                         className={`text-3xl transition-colors ${star <= feedbackRating ? 'text-brand-gold drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-gray-600'}`}
                       >
                         ★
                       </motion.button>
                     ))}
                   </div>
                   <input 
                     type="range" 
                     min="1" 
                     max="5" 
                     step="1"
                     value={feedbackRating}
                     onChange={(e) => setFeedbackRating(parseInt(e.target.value))}
                     className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-brand-gold"
                   />
                   <div className="flex justify-between w-full text-xs text-[var(--color-text-secondary)] font-mono px-1">
                     <span>Needs work</span>
                     <span>Amazing!</span>
                   </div>
                </div>
              </div>

              <div className="relative z-10">
                <textarea 
                  className="w-full h-32 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-4 focus:outline-none focus:border-brand-blue focus:bg-[rgba(0,0,0,0.5)] transition-all font-heading text-sm resize-none mb-6 placeholder-[var(--color-text-secondary)]"
                  placeholder="Tell us what you love or what we can improve..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 relative z-10">
                <button 
                   onClick={() => setIsFeedbackOpen(false)}
                   className="px-6 py-2.5 rounded-xl font-bold text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const logs = JSON.parse(localStorage.getItem('userFeedback') || '[]');
                    logs.push({ text: feedbackText, rating: feedbackRating, date: new Date().toISOString() });
                    localStorage.setItem('userFeedback', JSON.stringify(logs));
                    setFeedbackText('');
                    setFeedbackRating(5);
                    setIsFeedbackOpen(false);
                  }}
                  className="bg-gradient-to-r from-brand-blue to-brand-purple hover:to-brand-blue text-white font-bold px-8 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,184,212,0.3)] hover:shadow-[0_0_25px_rgba(6,184,212,0.5)] transform hover:-translate-y-0.5"
                  disabled={!feedbackText.trim()}
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Module Settings Modal */}
      <AnimatePresence>
        {settingsActiveId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-secondary)] border border-[rgba(255,255,255,0.1)] p-6 rounded-2xl max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-xl flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[var(--color-text-secondary)]" /> {modules.find(m => m.id === settingsActiveId)?.title} Settings
                </h3>
                <button onClick={() => setSettingsActiveId(null)} className="text-[var(--color-text-secondary)] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {settingsActiveId === 'quiz' && (
                <div className="mb-6">
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-3">Difficulty Level</label>
                  <div className="flex gap-2 bg-[rgba(0,0,0,0.3)] p-1 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    {['easy', 'medium', 'hard'].map(level => {
                      const isActive = (localStorage.getItem(`setting_quiz_difficulty`) || 'medium') === level;
                      return (
                        <button
                          key={level}
                          onClick={() => {
                            localStorage.setItem(`setting_quiz_difficulty`, level);
                            setColorVersion(v => v + 1);
                          }}
                          className={`flex-1 py-2 text-sm rounded-lg capitalize font-mono transition-colors ${isActive ? 'bg-[var(--color-theme-primary, #6366f1)] text-white font-bold' : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(settingsActiveId === 'quiz' || settingsActiveId === 'flashcards') ? (
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-heading text-[var(--color-text-secondary)]">Items to Generate</label>
                    <span className="text-sm font-mono text-brand-blue font-bold">{localStorage.getItem(`setting_${settingsActiveId}_count`) || '5'}</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    className="w-full accent-brand-blue"
                    onChange={(e) => {
                      localStorage.setItem(`setting_${settingsActiveId}_count`, e.target.value);
                      setColorVersion(v => v + 1);
                    }}
                    defaultValue={localStorage.getItem(`setting_${settingsActiveId}_count`) || '5'}
                  />
                  <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1 font-mono">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>
              ) : settingsActiveId === 'notes' ? (
                <div className="mb-6">
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-3">Level of Detail</label>
                  <div className="flex gap-2 bg-[rgba(0,0,0,0.3)] p-1 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    {['concise', 'detailed', 'expert'].map(level => {
                      const isActive = (localStorage.getItem(`setting_notes_detail`) || 'concise') === level;
                      return (
                        <button
                          key={level}
                          onClick={() => {
                            localStorage.setItem(`setting_notes_detail`, level);
                            setColorVersion(v => v + 1);
                          }}
                          className={`flex-1 py-2 text-sm rounded-lg capitalize font-mono transition-colors ${isActive ? 'bg-brand-purple text-white font-bold' : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-3">Settings</label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 bg-[rgba(0,0,0,0.3)] p-3 rounded-xl border border-[rgba(255,255,255,0.05)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <input 
                        type="checkbox" 
                        defaultChecked={localStorage.getItem(`setting_${settingsActiveId}_pref_hard`) === 'true'}
                        onChange={(e) => localStorage.setItem(`setting_${settingsActiveId}_pref_hard`, e.target.checked.toString())}
                        className="accent-brand-orange w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-heading text-white">Hard Mode</span>
                    </label>
                    <label className="flex items-center gap-3 bg-[rgba(0,0,0,0.3)] p-3 rounded-xl border border-[rgba(255,255,255,0.05)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <input 
                        type="checkbox" 
                        defaultChecked={localStorage.getItem(`setting_${settingsActiveId}_pref_focus`) === 'true'}
                        onChange={(e) => localStorage.setItem(`setting_${settingsActiveId}_pref_focus`, e.target.checked.toString())}
                        className="accent-brand-blue w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-heading text-white">Focus Mode</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="mb-6 border-t border-[rgba(255,255,255,0.1)] pt-4">
                <label className="block text-sm font-heading font-bold text-white mb-2">Study Reminder</label>
                <div className="flex gap-2">
                  <select 
                    className="w-1/2 bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-sm font-heading"
                    onChange={(e) => localStorage.setItem(`reminder_${settingsActiveId}_day`, e.target.value)}
                    defaultValue={localStorage.getItem(`reminder_${settingsActiveId}_day`) || ''}
                  >
                    <option value="">No Reminder</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Daily">Daily</option>
                  </select>
                  <input 
                    type="time"
                    className="w-1/2 bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-sm font-heading"
                    onChange={(e) => localStorage.setItem(`reminder_${settingsActiveId}_time`, e.target.value)}
                    defaultValue={localStorage.getItem(`reminder_${settingsActiveId}_time`) || ''}
                  />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">We'll alert you locally when it's time.</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">Module Theme Color</label>
                <select 
                  className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-sm font-heading"
                  onChange={(e) => {
                    if (e.target.value) {
                        localStorage.setItem(`setting_${settingsActiveId}_color`, e.target.value);
                    } else {
                        localStorage.removeItem(`setting_${settingsActiveId}_color`);
                    }
                    setColorVersion(v => v + 1); // trigger re-render
                  }}
                  defaultValue={localStorage.getItem(`setting_${settingsActiveId}_color`) || ''}
                >
                  <option value="">Default Theme</option>
                  <option value="from-cyan-400 to-blue-600">Ocean Blue</option>
                  <option value="from-fuchsia-500 to-purple-600">Royal Purple</option>
                  <option value="from-amber-400 to-orange-500">Golden Sunset</option>
                  <option value="from-emerald-400 to-green-600">Emerald Green</option>
                  <option value="from-pink-400 to-rose-600">Neon Pink</option>
                  <option value="from-orange-400 to-red-600">Flaming Orange</option>
                  <option value="from-indigo-400 to-blue-600">Deep Indigo</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => setSettingsActiveId(null)}
                  className="bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-white font-heading font-medium px-6 py-2 rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Settings Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-secondary)] border border-[rgba(255,255,255,0.1)] p-8 rounded-2xl max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-xl flex items-center gap-2">
                  Profile Settings
                </h3>
                <button onClick={() => setIsProfileOpen(false)} className="text-[var(--color-text-secondary)] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-[rgba(0,0,0,0.2)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-2xl shadow-glow-blue shrink-0">
                    {profile.avatar}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg">{profile.name}</h4>
                    <p className="text-sm text-[var(--color-text-secondary)] font-mono">{profile.xp || 0} XP • Lvl {profile.level || 1}</p>
                    <p className="text-xs text-brand-orange">🔥 {profile.streak || 0} Day Streak</p>
                  </div>
                </div>

                {profile.badges && profile.badges.length > 0 && (
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[var(--color-text-secondary)] mb-2">Badges</h5>
                    <div className="flex flex-wrap gap-2">
                       {profile.badges.map(b => (
                         <div key={b} className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-3 py-1 rounded-full text-xs font-bold text-brand-gold flex items-center gap-1">
                           <Sparkles className="w-3 h-3" /> {b}
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {profile.challenges && profile.challenges.length > 0 && (
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[var(--color-text-secondary)] mb-2">Daily Challenges</h5>
                    <div className="flex flex-col gap-2">
                       {profile.challenges.map(c => (
                         <div key={c.id} className="bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] p-3 rounded-xl flex items-center justify-between">
                            <span className={`text-sm ${c.completed ? 'text-[var(--color-text-secondary)] line-through' : 'text-white'}`}>{c.name}</span>
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${c.completed ? 'bg-brand-green/20 text-brand-green' : 'bg-[rgba(255,255,255,0.1)] text-[var(--color-text-secondary)]'}`}>
                              {c.completed ? 'Done' : `+${c.xp} XP`}
                            </span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-[rgba(255,255,255,0.1)] my-2"></div>

                <button 
                  onClick={handleExport}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors py-3 rounded-xl font-heading text-sm text-brand-blue font-bold flex justify-center items-center gap-2"
                >
                  Export Data to JSON
                </button>

                <div className="relative">
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors py-3 rounded-xl font-heading text-sm text-brand-pink font-bold flex justify-center items-center gap-2">
                    Import Data from JSON
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
