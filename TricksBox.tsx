import React, { useState } from 'react';
import { useUser } from '../store/UserContext';
import { askGemini, generateSystemPrompt } from '../lib/gemini';
import { Lightbulb, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStickyState } from '../lib/hooks';
import { AILoadingIndicator } from './AILoadingIndicator';
import { ShareButton } from './ShareButton';
import { TopicSuggestions } from './TopicSuggestions';
import { TutorialButton } from './TutorialButton';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function TricksBox() {
  const { profile, addXP } = useUser();
  const [topic, setTopic] = useStickyState('', 'studygenie_tricks_topic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useStickyState<string | null>(null, 'studygenie_tricks_result');

  const customColor = localStorage.getItem('setting_tricks_color');
  const headingColorClass = customColor ? `text-transparent bg-clip-text bg-gradient-to-r ${customColor}` : 'text-brand-pink';
  const iconClass = customColor ? `bg-gradient-to-br ${customColor} text-white p-1.5 rounded-lg` : 'text-brand-pink w-8 h-8';

  const generate = async () => {
    if (!topic || !profile || !profile.apiKey) return;
    setLoading(true);
    try {
      const moduleContext = `You are a creative Memory Coach. Provide simple mnemonics, analogies, or acronym tricks to help remember the concept easily. Limit to 3 powerful tricks. formatting in markdown`;
      const systemPrompt = generateSystemPrompt(profile, moduleContext);
      const res = await askGemini(profile.apiKey, `Provide memory tricks for: ${topic}`, systemPrompt);
      setResult(res);
      addXP(10);
    } catch (e) {
      alert("Failed to generate tricks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
      <div className="glass-card p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className={`text-3xl font-display font-bold flex items-center gap-3 ${headingColorClass}`}>
            <Lightbulb className={`w-8 h-8 ${iconClass}`} />
            Mnemonic Tricks Box
            <TutorialButton 
              title="Mnemonic Tricks Box" 
              instructions={[
                "Enter a concept you find hard to memorize (e.g., 'Krebs Cycle').",
                "The AI will invent catchy acronyms or stories to help you remember.",
                "Share the tricks with your friends or copy them to your notes."
              ]} 
              resources={[
                { label: "Memory Palace Technique", url: "https://artofmemory.com/blog/how-to-build-a-memory-palace/" }
              ]}
            />
          </h2>
        </div>
        
        <div className="flex flex-col mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="E.g., Periodic Table, Right Hand Rule..."
              className="flex-1 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') generate(); } }
            />
            <button 
              className="glow-btn flex justify-center items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)' }}
              onClick={generate}
              disabled={loading || !topic}
            >
              <Send className="w-5 h-5"/> Invent Trick
            </button>
          </div>
          <TopicSuggestions onSelect={setTopic} />
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <AILoadingIndicator text="Generating mnemonics..." />
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


