import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../store/UserContext';
import { askGemini, generateSystemPrompt } from '../lib/gemini';
import { Network, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStickyState } from '../lib/hooks';
import { AILoadingIndicator } from './AILoadingIndicator';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
});

export function ConceptMapper() {
  const { profile, addXP, completeChallenge } = useUser();
  const [topic, setTopic] = useStickyState('', 'studygenie_concept_topic');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useStickyState<string | null>(null, 'studygenie_concept_code');
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (code && graphRef.current) {
      const renderGraph = async () => {
        try {
          if (graphRef.current) {
             graphRef.current.innerHTML = '';
             const { svg } = await mermaid.render(`mermaid-${Date.now()}`, code);
             graphRef.current.innerHTML = svg;
          }
        } catch (e) {
          console.error("Mermaid error:", e);
          if (graphRef.current) {
             graphRef.current.innerHTML = '<p class="text-red-400">Failed to render concept map. Try regenerating.</p>';
          }
        }
      };
      renderGraph();
    }
  }, [code]);

  const generate = async () => {
    if (!topic || !profile || !profile.apiKey) return;
    setLoading(true);
    setCode(null);
    try {
      const moduleContext = `You are a Concept Mapper. Give me a Mermaid.js diagram code that breaks down the subject. Use ONLY a valid "graph TD" mermaid syntax. Do not wrap in markdown \`\`\` blocks, just return the raw text starting with graph TD. 
IMPORTANT: 
- Use ONLY standard rectangular nodes format: Id[Node Text]
- DO NOT use any parentheses (), brackets [], braces {}, or quotes "" inside the node text.
- ONLY use alphanumeric characters and spaces in the node text.
- Do NOT use special node shapes like id{text} or id((text)).
Example format:
graph TD
A[Main Topic] --> B[Subtopic one]
A --> C[Subtopic two]
B --> D[Detail Extra]
`;
      const systemPrompt = generateSystemPrompt(profile, moduleContext);
      const res = await askGemini(profile.apiKey, `Topic: ${topic}`, systemPrompt);
      let cleaned = res.replace(/```mermaid/gi, '').replace(/```/g, '').trim();
      // Aggressively sanitize output to prevent Mermaid parsing errors from special characters
      cleaned = cleaned.replace(/["()\\`]/g, '');
      setCode(cleaned);
      addXP(10);
      completeChallenge('map');
      
      const cur = parseInt(localStorage.getItem('mapProgress') || '0', 10);
      localStorage.setItem('mapProgress', (cur + 1).toString());
      localStorage.setItem('lastMapActivity', new Date().toISOString());

    } catch (e) {
      console.error(e);
      alert("Failed to fetch map. Check API Key and connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
      <div className="glass-card p-6 md:p-8">
        <h2 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-2 flex items-center gap-2">
          <Network className="w-8 h-8 text-blue-500" /> Concept Mapper
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">Generate visual mind maps for any topic in seconds.</p>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-brand-blue text-lg transition-colors"
            placeholder="e.g., Photosynthesis, Newton's Laws..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
          />
        </div>

        <button 
          onClick={generate}
          disabled={loading || !topic.trim()}
          className="glow-btn w-full py-4 rounded-xl font-bold font-heading text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)' }}
        >
          {loading ? <AILoadingIndicator /> : <><Sparkles className="w-5 h-5" /> Generate Map</>}
        </button>
      </div>

      <AnimatePresence>
        {code && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 md:p-8 overflow-x-auto"
          >
             <div ref={graphRef} className="flex justify-center min-h-[300px]"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
