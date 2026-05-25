import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser, UserProfile } from '../store/UserContext';
import { ChevronRight, ChevronLeft, Rocket, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';

const AVATARS = ['🧑‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️'];
const BOARDS = [
  { id: 'CBSE', desc: 'Central Board' },
  { id: 'ICSE', desc: 'Council for the Indian School' },
  { id: 'SSC', desc: 'State Board' }
];

const SUBJECTS_LIST = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Civics', 'English', 'Hindi', 'Computer Science'];

const TESTIMONIALS = [
  { name: "Rahul S.", exam: "JEE Advanced 2025", text: "StudyGenie's PYQ analyzer completely changed how I study. I went from 120 to 180+ in mocks!", avatar: "🧑‍💻", rating: 5 },
  { name: "Priya M.", exam: "CBSE Class 12", text: "The Smart Notes feature saves me hours every week. Plus the community is so supportive.", avatar: "👩‍🎓", rating: 5 },
  { name: "Ananya D.", exam: "NEET UG", text: "I love the flashcards and the concept mapper! It helps me visualize complex biology topics so easily.", avatar: "🦸‍♀️", rating: 5 },
  { name: "Aryan K.", exam: "ICSE Class 10", text: "The answer evaluator is crazy accurate. It tells me exactly what points I missed in my subjective answers.", avatar: "🧑‍🎓", rating: 5 },
];

export function Onboarding() {
  const { completeOnboarding } = useUser();
  const [step, setStep] = useState(1);
  const [testingKey, setTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [data, setData] = useState<Partial<UserProfile>>({
    avatar: '🧑‍🎓',
    subjects: [],
    weakSubjects: [],
    medium: 'English'
  });

  const updateData = (key: keyof UserProfile, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const testApiKey = async () => {
    if (!data.apiKey) return;
    setTestingKey(true);
    setKeyStatus('idle');
    try {
      const ai = new GoogleGenAI({ apiKey: data.apiKey });
      await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'reply "ok"'
      });
      setKeyStatus('success');
    } catch (e) {
      setKeyStatus('error');
    } finally {
      setTestingKey(false);
    }
  };

  const handleComplete = () => {
    completeOnboarding(data as UserProfile);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 relative z-10 flex flex-col lg:flex-row gap-8 items-start">
      {/* Main Onboarding Form */}
      <div className="flex-1 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
              step >= s ? "bg-brand-blue text-[#000]" : "bg-[var(--bg-card)] text-[var(--color-text-muted)] border border-[rgba(255,255,255,0.1)]"
            )}>
              {s}
            </div>
            {s < 5 && (
              <div className={cn(
                "h-1 flex-1 mx-2 rounded-full transition-colors",
                step > s ? "bg-brand-blue" : "bg-[var(--bg-card)]"
              )} />
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-6 md:p-10 relative overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepWrapper key="step1">
              <h2 className="text-3xl font-display font-bold mb-6">Hello, Future Topper! 👋</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">What should I call you?</label>
                  <input 
                    type="text" 
                    placeholder="Your full name"
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                    value={data.name || ''}
                    onChange={(e) => updateData('name', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">Age</label>
                    <input 
                      type="number" 
                      className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-all"
                      value={data.age || ''}
                      onChange={(e) => updateData('age', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">School (Optional)</label>
                    <input 
                      type="text" 
                      className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-all"
                      value={data.school || ''}
                      onChange={(e) => updateData('school', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-3">Choose your Avatar</label>
                  <div className="flex gap-3 flex-wrap">
                    {AVATARS.map(avatar => (
                      <button
                        key={avatar}
                        className={cn(
                          "text-3xl w-14 h-14 rounded-full flex items-center justify-center transition-all",
                          data.avatar === avatar ? "bg-brand-blue/20 ring-2 ring-brand-blue scale-110" : "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"
                        )}
                        onClick={() => updateData('avatar', avatar)}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {step === 2 && (
            <StepWrapper key="step2">
              <h2 className="text-3xl font-display font-bold mb-6">Tell Me About Your Studies 📚</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">Which Class?</label>
                  <select 
                    className="w-full bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue"
                    value={data.class || ''}
                    onChange={(e) => updateData('class', e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={`Class ${i+1}`}>Class {i+1}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">Board</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {BOARDS.map(board => (
                      <div 
                        key={board.id}
                        onClick={() => updateData('board', board.id)}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition-all",
                          data.board === board.id ? "bg-brand-blue/10 border-brand-blue animated-border" : "border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]"
                        )}
                      >
                        <div className="font-bold text-lg">{board.id}</div>
                        <div className="text-xs text-[var(--color-text-muted)] line-clamp-2">{board.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">Select Your Subjects</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS_LIST.map(sub => {
                      const isSelected = data.subjects?.includes(sub);
                      return (
                        <button
                          key={sub}
                          onClick={() => {
                            if (isSelected) {
                              updateData('subjects', data.subjects?.filter(s => s !== sub));
                            } else {
                              updateData('subjects', [...(data.subjects || []), sub]);
                            }
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm transition-all",
                            isSelected ? "bg-brand-purple text-white font-bold shadow-[0_0_15px_rgba(179,136,255,0.4)]" : "bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.1)]"
                          )}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {step === 3 && (
            <StepWrapper key="step3">
              <h2 className="text-3xl font-display font-bold mb-6">Your Exam Mission 🎯</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">
                    Primary Goal
                    <p className="text-xs text-white/40 mt-1 mb-2 font-normal">This helps the AI tune its language. Board exams focus on clear steps, while JEE/NEET are more conceptual.</p>
                  </label>
                  <select 
                    className="w-full bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue"
                    value={data.examType || ''}
                    onChange={(e) => updateData('examType', e.target.value)}
                  >
                    <option value="">Select Target Exam</option>
                    <option value="Board Exams">Board Exams</option>
                    <option value="JEE">JEE Main / Advanced</option>
                    <option value="NEET">NEET</option>
                    <option value="School Unit Tests">School Unit Tests</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">Exam Target Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-all [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                    value={data.examDate || ''}
                    onChange={(e) => updateData('examDate', e.target.value)}
                  />
                  {data.examDate && (
                    <div className="mt-3 text-brand-gold font-mono border border-brand-gold/30 bg-brand-gold/10 p-3 rounded-lg inline-block">
                      {Math.max(0, Math.ceil((new Date(data.examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} Days Left!
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">Weakest Subjects (Choose max 2)</label>
                  <div className="flex flex-wrap gap-2">
                    {data.subjects?.map(sub => {
                      const isSelected = data.weakSubjects?.includes(sub);
                      return (
                        <button
                          key={'weak_'+sub}
                          onClick={() => {
                            if (isSelected) {
                              updateData('weakSubjects', data.weakSubjects?.filter(s => s !== sub));
                            } else if ((data.weakSubjects?.length || 0) < 2) {
                              updateData('weakSubjects', [...(data.weakSubjects || []), sub]);
                            }
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm transition-all",
                            isSelected ? "bg-[#ffab40]/20 text-[#ffab40] border border-[#ffab40]" : "bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.1)]"
                          )}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {step === 4 && (
            <StepWrapper key="step4">
              <h2 className="text-3xl font-display font-bold mb-6">Study Schedule Preferences ⏰</h2>
              
              <div className="space-y-6">
                 <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-4">Daily Study Hours Goal: {data.dailyHours || 3} Hours</label>
                  <input 
                    type="range" min="1" max="14" 
                    value={data.dailyHours || 3}
                    onChange={(e) => updateData('dailyHours', parseInt(e.target.value))}
                    className="w-full accent-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">Preferred Study Time</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map(t => (
                      <div 
                        key={t}
                        onClick={() => updateData('studyTime', t)}
                        className={cn(
                          "p-3 text-center rounded-xl border cursor-pointer transition-all",
                          data.studyTime === t ? "bg-brand-blue/20 border-brand-blue text-brand-blue" : "border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)]"
                        )}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">Do you attend coaching/tuition?</label>
                  <p className="text-xs text-white/40 mt-1 mb-3">We'll adjust your study hours and breaks assuming you have less free time if you attend coaching.</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => updateData('coaching', true)}
                      className={cn("flex-1 py-3 rounded-xl border transition-all", data.coaching === true ? "bg-brand-purple/20 border-brand-purple text-brand-purple" : "border-[rgba(255,255,255,0.1)]")}
                    >Yes</button>
                    <button 
                      onClick={() => updateData('coaching', false)}
                      className={cn("flex-1 py-3 rounded-xl border transition-all", data.coaching === false ? "bg-brand-purple/20 border-brand-purple text-brand-purple" : "border-[rgba(255,255,255,0.1)]")}
                    >No</button>
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {step === 5 && (
            <StepWrapper key="step5">
              <h2 className="text-3xl font-display font-bold mb-4">Connect Your AI Brain 🧠</h2>
              <p className="text-[var(--color-text-secondary)] mb-6">StudyGenie uses the FREE Google Gemini API. Follow these steps to unlock AI power.</p>
              
              <div className="space-y-6">
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-5">
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-[var(--color-text-muted)]">
                    <li>Go to <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">aistudio.google.com</a></li>
                    <li>Sign in with your Google Account</li>
                    <li>Click <strong>"Get API Key"</strong></li>
                    <li>Create and copy your free key</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">
                    Paste Your Gemini API Key
                    <p className="text-xs text-white/40 mt-1 font-normal">Your Gemini API Key acts as a secure passport for your study assistant. Since StudyGenie runs entirely in your browser, your key is saved locally in your browser and NEVER sent to our servers. Treat it like a password.</p>
                  </label>
                  <input 
                    type="password" 
                    placeholder="AIzaSy..."
                    className="w-full bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.2)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all"
                    value={data.apiKey || ''}
                    onChange={(e) => updateData('apiKey', e.target.value)}
                  />
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    Your key is stored ONLY on your device locally. It is never sent to our servers.
                  </p>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={testApiKey}
                    disabled={!data.apiKey || testingKey}
                    className="w-full flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    {testingKey ? "Testing..." : "Test Connection"}
                  </button>

                  {keyStatus === 'success' && (
                    <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mt-4 flex items-center gap-3 text-brand-green bg-brand-green/10 border border-brand-green/20 p-4 rounded-xl">
                      <CheckCircle className="w-5 h-5" />
                      <div>
                        <strong>Connection Suberb!</strong>
                        <div className="text-sm opacity-80">AI Brain connected and ready.</div>
                      </div>
                    </motion.div>
                  )}

                  {keyStatus === 'error' && (
                    <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mt-4 flex items-center gap-3 text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-xl">
                      <AlertCircle className="w-5 h-5" />
                      <div>
                        <strong>Connection Failed</strong>
                        <div className="text-sm opacity-80">Make sure you pasted the exact key without spaces.</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </StepWrapper>
          )}
        </AnimatePresence>

        <div className="mt-10 flex justify-between pt-6 border-t border-[rgba(255,255,255,0.05)]">
          <button 
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl disabled:opacity-30 hover:bg-[rgba(255,255,255,0.05)] transition-all font-heading"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          {step < 5 ? (
            <button 
              onClick={() => setStep(s => s + 1)}
              className="glow-btn flex items-center gap-2 px-8 py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all font-heading font-bold"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleComplete}
              disabled={keyStatus !== 'success'}
              className="glow-btn flex items-center gap-2 px-8 py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all font-heading font-bold disabled:opacity-50 disabled:grayscale"
            >
              <Rocket className="w-4 h-4" /> Enter StudyGenie
            </button>
          )}
        </div>
      </div>
      </div>
      
      {/* Sliding Feedback Box (Desktop Only) */}
      <div className="hidden lg:block w-[350px] xl:w-[400px] shrink-0 sticky top-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card p-6 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-3xl rounded-full"></div>
          
          <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
            <span className="text-brand-gold">★</span> Wall of Love
          </h3>

          <div className="relative h-[250px] w-full">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-2xl shadow-glow-blue">
                    {TESTIMONIALS[activeTestimonial].avatar}
                  </div>
                  <div>
                    <div className="font-bold font-heading">{TESTIMONIALS[activeTestimonial].name}</div>
                    <div className="text-xs text-brand-blue font-mono">{TESTIMONIALS[activeTestimonial].exam}</div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-brand-gold fill-brand-gold" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[var(--color-text-secondary)] text-sm italic font-body flex-1 overflow-y-auto hide-scrollbar">
                  "{TESTIMONIALS[activeTestimonial].text}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === activeTestimonial ? "w-6 bg-brand-blue shadow-[0_0_8px_rgba(6,184,212,0.8)]" : "w-1.5 bg-[rgba(255,255,255,0.2)]"
                )} 
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sliding Feedback Box (Mobile Layout) */}
      <div className="w-full lg:hidden mt-8 mb-4">
        <h3 className="font-display text-[var(--color-text-secondary)] text-sm uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
          Wall of Love
        </h3>
        <div className="h-[200px] w-full relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 glass-card p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-xl">
                  {TESTIMONIALS[activeTestimonial].avatar}
                </div>
                <div>
                  <div className="font-bold text-sm">{TESTIMONIALS[activeTestimonial].name}</div>
                  <div className="text-[10px] text-brand-gold flex items-center gap-1">
                    {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-white/70 text-sm italic">"{TESTIMONIALS[activeTestimonial].text}"</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {TESTIMONIALS.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                idx === activeTestimonial ? "w-5 bg-brand-blue" : "w-1.5 bg-white/20"
              )} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const StepWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};
