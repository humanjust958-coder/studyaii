import React, { useState } from 'react';
import { useUser } from '../store/UserContext';
import { askGemini, generateSystemPrompt } from '../lib/gemini';
import { Flame, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStickyState } from '../lib/hooks';
import { AILoadingIndicator } from './AILoadingIndicator';
import { ShareButton } from './ShareButton';
import { TopicSuggestions } from './TopicSuggestions';
import { TutorialButton } from './TutorialButton';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function RevisionBooster() {
  const { profile, addXP } = useUser();
  const [topic, setTopic] = useStickyState('', 'studygenie_revision_topic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useStickyState<string | null>(null, 'studygenie_revision_result');

  const customColor = localStorage.getItem('setting_revision_color');
  const headingColorClass = customColor ? `text-transparent bg-clip-text bg-gradient-to-r ${customColor}` : 'text-brand-orange';
  const iconClass = customColor ? `bg-gradient-to-br ${customColor} text-white p-1.5 rounded-lg` : 'text-brand-orange w-8 h-8';

  const generate = async () => {
    if (!topic || !profile || !profile.apiKey) return;
    setLoading(true);
    try {
      const moduleContext = `You are a Revision Strategist. The user has an upcoming exam. Based on the subject/topic provided, create a high-impact, intense 1-day revision sprint. Include:
- 'Golden 5' topics to focus on
- Most likely formulas/dates to be asked
- Common mistakes to avoid
- A quick review checklist.
Format using markdown.`;
      const systemPrompt = generateSystemPrompt(profile, moduleContext);
      const res = await askGemini(profile.apiKey, `Subject/Topic: ${topic}`, systemPrompt);
      setResult(res);
      addXP(10);
    } catch (e) {
      alert("Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
      <div className="glass-card p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className={`text-3xl font-display font-bold flex items-center gap-3 ${headingColorClass}`}>
            <Flame className={`w-8 h-8 ${iconClass}`} />
            Revision Booster
            <TutorialButton 
              title="Revision Booster" 
              instructions={[
                "Enter the subject or chapter you are revising.",
                "AI provides a highly focused 'Golden 5' topics list.",
                "Review the suggested formulas and common mistakes.",
                "Share the revision checklist with your study group."
              ]} 
              resources={[
                { label: "Pomodoro Technique", url: "https://todoist.com/productivity-methods/pomodoro-technique" }
              ]}
            />
          </h2>
        </div>
        
        <div className="flex flex-col mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter subject for crash-course revision..."
              className="flex-1 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') generate(); } }
            />
            <button 
              className="glow-btn flex justify-center items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)' }}
              onClick={generate}
              disabled={loading || !topic}
            >
              <Send className="w-5 h-5"/> Boost Me
            </button>
          </div>
          <TopicSuggestions onSelect={setTopic} />
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <AILoadingIndicator text="Designing study sprint..." />
            </motion.div>
          )}
          {!loading && result && (
             <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 md:p-8"
            >
              <div className="flex justify-end mb-4">
                <ShareButton content={result} />
              </div>
              <div 
                className="markdown-body prose prose-invert prose-brand max-w-none prose-p:my-2"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


