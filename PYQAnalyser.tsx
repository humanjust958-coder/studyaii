import React, { useState, useMemo } from 'react';
import { useUser } from '../store/UserContext';
import { askGemini, generateSystemPrompt } from '../lib/gemini';
import { Book, Send, Sparkles, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStickyState } from '../lib/hooks';
import { AILoadingIndicator } from './AILoadingIndicator';
import { ShareButton } from './ShareButton';
import { TopicSuggestions } from './TopicSuggestions';
import { TutorialButton } from './TutorialButton';

interface PYQ {
  question: string;
  marks: string;
  difficulty: string;
  answer: string;
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function PYQAnalyser() {
  const { profile, addXP } = useUser();
  const [topic, setTopic] = useStickyState('', 'studygenie_pyq_topic');
  const [loading, setLoading] = useState(false);
  const [pyqs, setPyqs] = useStickyState<PYQ[]>([], 'studygenie_pyq_list');
  const [searchQuery, setSearchQuery] = useState('');

  const customColor = localStorage.getItem('setting_pyq_color');
  const headingColorClass = customColor ? `text-transparent bg-clip-text bg-gradient-to-r ${customColor}` : 'text-brand-blue';
  const iconClass = customColor ? `bg-gradient-to-br ${customColor} text-white p-1.5 rounded-lg` : 'text-brand-blue w-8 h-8';

  const generate = async () => {
    if (!topic || !profile || !profile.apiKey) return;
    setLoading(true);
    setSearchQuery('');
    try {
      const moduleContext = `
You are the PYQ (Previous Year Questions) Analyser. 
Generate 5 highly probable previous year exam questions for the given topic based on the student's class and board.
Return ONLY a raw JSON array. Do not wrap in markdown blocks. Format:
[
  {
    "question": "Text of the actual question",
    "marks": "Number (e.g. 3, 5)",
    "difficulty": "Easy/Medium/Hard",
    "answer": "Detailed expected answer"
  }
]
      `;
      const systemPrompt = generateSystemPrompt(profile, moduleContext);
      const res = await askGemini(profile.apiKey, `Topic: ${topic}`, systemPrompt);
      const jsonMatch = res.match(/\[([\s\S]*?)\]/);
      const cleaned = jsonMatch ? jsonMatch[0] : res.replace(/```json/gi, '').replace(/```/g, '').trim();
      setPyqs(JSON.parse(cleaned));
      addXP(10);
    } catch (e) {
      alert("Failed to fetch PYQs. Check API Key and connection.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPyqs = useMemo(() => {
    if (!searchQuery) return pyqs;
    const lower = searchQuery.toLowerCase();
    return pyqs.filter(p => 
      p.question.toLowerCase().includes(lower) || 
      p.difficulty.toLowerCase().includes(lower) || 
      p.marks.toLowerCase().includes(lower)
    );
  }, [pyqs, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
      <div className="glass-card p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className={`text-3xl font-display font-bold flex items-center gap-3 ${headingColorClass}`}>
            <Book className={`w-8 h-8 ${iconClass}`} />
            PYQ Analyser
            <TutorialButton 
              title="PYQ Analyser" 
              instructions={[
                "Enter a chapter name to see frequently asked past year questions.",
                "The AI will output probable questions, their weightage, and detailed answers.",
                "Focus on the 'High Probability' questions during your final revision.",
                "Share the output to save it for later."
              ]} 
              resources={[
                { label: "Using Past Papers to Revise", url: "https://www.themix.org.uk/work-and-study/study-and-exam-tips/using-past-papers-to-revise-1241.html" }
              ]}
            />
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter chapter or topic name..."
            className="flex-1 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') generate(); }}
          />
          <button 
            className="glow-btn px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
            onClick={generate}
            disabled={loading || !topic}
          >
            <Send className="w-5 h-5" />
            Analyze PYQs
          </button>
        </div>
        <div className="mb-8">
          <TopicSuggestions onSelect={setTopic} />
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <AILoadingIndicator text="Analysing past exam patterns..." />
            </motion.div>
          )}

          {!loading && pyqs.length > 0 && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Filter by keyword, difficulty, or marks..."
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-blue"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ShareButton content={JSON.stringify(pyqs, null, 2)} />
              </div>
              
              <div className="space-y-6">
                {filteredPyqs.map((pyq, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] p-5 rounded-xl">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded text-xs font-mono font-bold">Marks: {pyq.marks}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${pyq.difficulty.toLowerCase() === 'hard' ? 'bg-red-500/20 text-red-400' : pyq.difficulty.toLowerCase() === 'easy' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>Difficulty: {pyq.difficulty}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3">{pyq.question}</h3>
                    <div className="text-[var(--color-text-secondary)] text-sm leading-relaxed p-4 bg-[rgba(0,0,0,0.2)] rounded-lg border border-[rgba(255,255,255,0.05)]">
                      <strong className="text-white mb-2 block">Answer:</strong>
                      <div className="markdown-body prose prose-invert prose-brand max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{pyq.answer}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPyqs.length === 0 && (
                  <p className="text-center text-[var(--color-text-secondary)] py-8">No matching questions found.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
