import React, { useState } from 'react';
import { useUser } from '../store/UserContext';
import { askGemini, generateSystemPrompt } from '../lib/gemini';
import { CheckCircle, AlertTriangle, FileSignature, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStickyState } from '../lib/hooks';
import { AILoadingIndicator } from './AILoadingIndicator';
import { ShareButton } from './ShareButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EvaluationResult {
  score: number;
  totalMarks: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

export function AnswerEvaluator() {
  const { profile, addXP, completeChallenge } = useUser();
  const [question, setQuestion] = useStickyState('', 'studygenie_evaluator_question');
  const [answer, setAnswer] = useStickyState('', 'studygenie_evaluator_answer');
  const [marks, setMarks] = useStickyState('10', 'studygenie_evaluator_marks');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useStickyState<EvaluationResult | null>(null, 'studygenie_evaluator_result');

  const generate = async () => {
    if (!question || !answer || !profile || !profile.apiKey) return;
    setLoading(true);
    setResult(null);
    try {
      const moduleContext = `You are an expert examiner. Evaluate the student's answer based on the question provided. The maximum marks for this question is ${marks}.
Evaluate critically but fairly. Provide a precise score.
Return ONLY a valid JSON object with no markdown block ticks.
Format:
{
  "score": <number>,
  "totalMarks": ${marks},
  "feedback": "Overall summary of the answer quality",
  "strengths": ["Strong point 1", "Strong point 2"],
  "improvements": ["Area to improve 1", "Missed concept"],
  "modelAnswer": "An ideal, perfect answer for this question"
}`;
      const systemPrompt = generateSystemPrompt(profile, moduleContext);
      const res = await askGemini(profile.apiKey, `Question: ${question}\n\nStudent Answer: ${answer}`, systemPrompt);
      const jsonMatch = res.match(/\{[\s\S]*\}/);
      const cleaned = jsonMatch ? jsonMatch[0] : res.replace(/```json/gi, '').replace(/```/g, '').trim();
      setResult(JSON.parse(cleaned));
      
      const cur = parseInt(localStorage.getItem('evaluatorProgress') || '0', 10);
      localStorage.setItem('evaluatorProgress', (cur + 1).toString());
      localStorage.setItem('lastEvaluatorActivity', new Date().toISOString());

      addXP(15);
      completeChallenge('evaluate');
    } catch (e) {
      console.error(e);
      alert("Failed to evaluate answer. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
      <div className="glass-card p-6 md:p-8">
        <h2 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2 flex items-center gap-2">
          <FileSignature className="w-8 h-8 text-emerald-500" /> Answer Evaluator
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">Paste your subjective answer to get instant grading and feedback.</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">The Question</label>
            <input
              type="text"
              className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors"
              placeholder="e.g., Explain the causes of the French Revolution..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-heading text-[var(--color-text-secondary)]">Your Answer</label>
            </div>
            <textarea
              className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue min-h-[150px] transition-colors resize-y"
              placeholder="Type your detailed answer here..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
          </div>

          <div>
             <label className="block text-sm font-heading text-[var(--color-text-secondary)] mb-2">Max Marks</label>
             <input
              type="number"
              className="w-32 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors"
              value={marks}
              min="1"
              max="100"
              onChange={e => setMarks(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={generate}
          disabled={loading || !question.trim() || !answer.trim()}
          className="glow-btn w-full py-4 rounded-xl font-bold font-heading text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
        >
          {loading ? <AILoadingIndicator /> : <><Sparkles className="w-5 h-5" /> Evaluate My Answer</>}
        </button>
      </div>

      <AnimatePresence>
        {result && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 md:p-8"
          >
            <div className="flex justify-between items-start mb-8 pb-8 border-b border-[rgba(255,255,255,0.1)]">
              <div>
                <h3 className="text-xl font-bold mb-2">Evaluation Result</h3>
                <p className="text-[var(--color-text-secondary)]">{result.feedback}</p>
              </div>
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-emerald-500 bg-[rgba(16,185,129,0.1)] shrink-0">
                <span className="text-3xl font-display font-bold text-emerald-400">{result.score}</span>
                <span className="text-xs text-[var(--color-text-secondary)] font-mono">/ {result.totalMarks}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div className="bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)] p-5 rounded-xl">
                 <h4 className="font-bold text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Strengths</h4>
                 <ul className="space-y-2">
                   {result.strengths.map((str, i) => (
                     <li key={i} className="flex gap-2 text-sm text-[var(--color-text-primary)]">
                       <span className="text-emerald-500 mt-0.5">•</span> {str}
                     </li>
                   ))}
                 </ul>
               </div>

               <div className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.1)] p-5 rounded-xl">
                 <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Areas to Improve</h4>
                 <ul className="space-y-2">
                   {result.improvements.map((imp, i) => (
                     <li key={i} className="flex gap-2 text-sm text-[var(--color-text-primary)]">
                       <span className="text-amber-500 mt-0.5">•</span> {imp}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>

            <div className="bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] p-6 rounded-xl">
               <h4 className="font-bold mb-4 border-b border-[rgba(255,255,255,0.1)] pb-2 flex items-center justify-between">
                 Model Answer
                 <ShareButton content={result.modelAnswer} />
               </h4>
               <div className="markdown-body prose prose-invert prose-brand max-w-none prose-p:my-2">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.modelAnswer}</ReactMarkdown>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
