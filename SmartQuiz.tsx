import React, { useState } from 'react';
import { useUser } from '../store/UserContext';
import { askGemini, generateSystemPrompt } from '../lib/gemini';
import { CheckCircle, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useStickyState } from '../lib/hooks';
import { AILoadingIndicator } from './AILoadingIndicator';
import { TopicSuggestions } from './TopicSuggestions';
import { TutorialButton } from './TutorialButton';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export function SmartQuiz() {
  const { profile, addXP, completeChallenge } = useUser();
  const [topic, setTopic] = useStickyState('', 'studygenie_quiz_topic');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useStickyState<QuizQuestion[]>([], 'studygenie_quiz_questions');
  const [currentQIndex, setCurrentQIndex] = useStickyState(0, 'studygenie_quiz_index');
  const [selectedOption, setSelectedOption] = useStickyState<string | null>(null, 'studygenie_quiz_selected');
  const [showAnswer, setShowAnswer] = useStickyState(false, 'studygenie_quiz_showans');
  const [score, setScore] = useStickyState(0, 'studygenie_quiz_score');
  const [finished, setFinished] = useStickyState(false, 'studygenie_quiz_finished');

  const customColor = localStorage.getItem('setting_quiz_color');
  const headingColorClass = customColor ? `text-transparent bg-clip-text bg-gradient-to-r ${customColor}` : 'text-brand-green';
  const iconClass = customColor ? `bg-gradient-to-br ${customColor} text-white p-1.5 rounded-lg` : 'text-brand-green w-8 h-8';

  const generate = async () => {
    if (!topic || !profile || !profile.apiKey) return;
    setLoading(true);
    try {
      const maxCount = localStorage.getItem('setting_quiz_count') || '5';
      const difficulty = localStorage.getItem('setting_quiz_difficulty') || 'medium';
      const moduleContext = `Generate exactly ${maxCount} multiple-choice questions for the topic provided at a ${difficulty} difficulty level. Return ONLY a raw JSON array. Do not wrap in markdown blocks. Format: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "Exact string of correct option", "explanation": "Why..."}]`;
      const systemPrompt = generateSystemPrompt(profile, moduleContext);
      const res = await askGemini(profile.apiKey, `Topic: ${topic}\nDifficulty: ${difficulty}`, systemPrompt);
      const jsonMatch = res.match(/\[([\s\S]*?)\]/);
      const cleaned = jsonMatch ? jsonMatch[0] : res.replace(/```json/gi, '').replace(/```/g, '').trim();
      setQuestions(JSON.parse(cleaned));
      setCurrentQIndex(0);
      setScore(0);
      setFinished(false);
      setSelectedOption(null);
      setShowAnswer(false);
    } catch (e) {
      alert("Failed to generate quiz. The AI might not have returned valid JSON. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    if (showAnswer) return;
    setSelectedOption(option);
    setShowAnswer(true);
    
    if (option === questions[currentQIndex].answer) {
      setScore(s => s + 1);
      addXP(10); // Reward XP!
    }
    const cur = parseInt(localStorage.getItem('quizProgress') || '0', 10);
    localStorage.setItem('quizProgress', (cur + 1).toString());
    localStorage.setItem('lastQuizActivity', new Date().toISOString());
    completeChallenge('quiz');
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setFinished(true);
      if (score === questions.length || score + 1 === questions.length) { 
          // Confetti for perfect or near perfect score!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          // Extra XP for finishing
          addXP(50);
      } else {
          addXP(20);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative z-10">
      <div className="glass-card p-6 md:p-8">
        {!questions.length && !loading && !finished && (
          <>
            <div className="flex justify-between items-start mb-6">
              <h2 className={`text-3xl font-display font-bold flex items-center gap-3 ${headingColorClass}`}>
                <CheckCircle className={`w-8 h-8 ${iconClass}`} />
                Smart Quiz Generator
                <TutorialButton 
                  title="Smart Quiz" 
                  instructions={[
                    "Enter a topic you want to test yourself on.",
                    "The AI will generate multiple-choice questions.",
                    "Select an answer to see the explanation.",
                    "Adjust the number of questions in the Dashboard settings."
                  ]} 
                  resources={[
                    { label: "Active Recall Study Method", url: "https://en.wikipedia.org/wiki/Active_recall" },
                    { label: "Spaced Repetition", url: "https://ncase.me/remember/" }
                  ]}
                />
              </h2>
            </div>
            <div className="flex flex-col mb-4">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Enter topic to test yourself..."
                  className="flex-1 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') generate(); } }
                />
                <button 
                  className="glow-btn flex justify-center items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)' }}
                  onClick={generate}
                  disabled={loading || !topic}
                >
                  <Send className="w-5 h-5"/> Start Quiz
                </button>
              </div>
              <TopicSuggestions onSelect={setTopic} />
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <AILoadingIndicator text="Crafting your quiz..." />
            </motion.div>
          )}

          {!loading && questions.length > 0 && !finished && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center mb-6 text-sm font-mono text-[var(--color-text-secondary)]">
              <span>Question {currentQIndex + 1} of {questions.length}</span>
              <span>Score: {score}</span>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold mb-8">{questions[currentQIndex].question}</h3>
            
            <div className="space-y-3">
              {questions[currentQIndex].options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === questions[currentQIndex].answer;
                
                let btnClass = "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] text-white";
                
                if (showAnswer) {
                  if (isCorrect) {
                     btnClass = "bg-green-500/20 border-green-500 text-green-400";
                  } else if (isSelected && !isCorrect) {
                     btnClass = "bg-red-500/20 border-red-500 text-red-400";
                  } else {
                     btnClass = "bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.05)] opacity-50";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={showAnswer}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-300",
                      btnClass
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {showAnswer && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 rounded-xl bg-brand-blue/10 border border-brand-blue/30"
                >
                  <p className="text-sm text-brand-blue/80 mb-4">{questions[currentQIndex].explanation}</p>
                  <button 
                    onClick={nextQuestion}
                    className="bg-brand-blue text-[#000] px-6 py-2 rounded-lg font-bold w-full hover:bg-brand-blue/80"
                  >
                    {currentQIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
        </AnimatePresence>

        {finished && (
          <div className="text-center py-10">
            <h2 className="text-4xl font-display font-bold mb-4">Quiz Complete!</h2>
            <div className="text-6xl font-bold mb-6 text-brand-green">
              {Math.round((score / questions.length) * 100)}%
            </div>
            <p className="text-xl mb-8">You scored {score} out of {questions.length}.</p>
            <button 
              onClick={() => { setQuestions([]); setTopic(''); }}
              className="glow-btn px-8 py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)' }}
            >
              Take Another Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
