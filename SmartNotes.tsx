import React, { useState, useRef } from 'react';
import { useUser } from '../store/UserContext';
import { askGemini, generateSystemPrompt } from '../lib/gemini';
import { Sparkles, Send, BookOpen, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStickyState } from '../lib/hooks';
import { AILoadingIndicator } from './AILoadingIndicator';
import { ShareButton } from './ShareButton';
import { TopicSuggestions } from './TopicSuggestions';
import { TutorialButton } from './TutorialButton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function SmartNotes() {
  const { profile } = useUser();
  const [topic, setTopic] = useStickyState('', 'studygenie_notes_topic');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useStickyState<string | null>(null, 'studygenie_notes_content');
  const notesRef = useRef<HTMLDivElement>(null);

  const customColor = localStorage.getItem('setting_notes_color');
  const headingColorClass = customColor ? `text-transparent bg-clip-text bg-gradient-to-r ${customColor}` : 'text-brand-purple';
  const iconClass = customColor ? `bg-gradient-to-br ${customColor} text-white p-1.5 rounded-lg` : 'text-brand-purple w-8 h-8';

  const exportPDF = async () => {
    if (!notesRef.current) return;
    try {
      const canvas = await html2canvas(notesRef.current, { scale: 2, useCORS: true, backgroundColor: '#1E1E2E' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`StudyGenie_Notes_${topic.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error("PDF Export failed", e);
      alert("Failed to export PDF.");
    }
  };

  const generateNotes = async () => {
    if (!topic || !profile || !profile.apiKey) return;
    
    setLoading(true);
    try {
      const detailLevel = localStorage.getItem('setting_notes_detail') || 'detailed';
      const moduleContext = `
You are a Smart Notes Generator. 
The user will provide a topic. Generate comprehensive, exam-focused study notes.
The user requested detail level: ${detailLevel}.
Structure:
- Title + One-line summary
- Key Concepts (definitions)
- Detailed explanation with sub-headings
- Important Formulas / Dates / Names box
- Examples and solved problems
- Common Mistakes students make
- 3 practice questions
      `;
      const systemPrompt = generateSystemPrompt(profile, moduleContext);
      const res = await askGemini(profile.apiKey, `Generate notes for topic: ${topic}`, systemPrompt);
      setNotes(res);
    } catch (e) {
      alert("Failed to generate notes. Check your API key or connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
      <div className="glass-card p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className={`text-3xl font-display font-bold flex items-center gap-3 ${headingColorClass}`}>
            <BookOpen className={`w-8 h-8 ${iconClass}`} />
            Smart Notes Generator
            <TutorialButton 
              title="Smart Notes" 
              instructions={[
                "Enter a specific topic (e.g., 'Thermodynamics Laws', 'World War II').",
                "Select a detail level from the Dashboard settings gear.",
                "Wait for AI to generate comprehensive notes with formulas and examples.",
                "Share or copy the notes to read anywhere."
              ]} 
              resources={[
                { label: "Cornell Note Taking System", url: "https://lsc.cornell.edu/how-to-study/taking-notes/cornell-note-taking-system/" },
                { label: "Feynman Technique for Learning", url: "https://fs.blog/feynman-technique/" }
              ]}
            />
          </h2>
        </div>
        
        <div className="flex flex-col mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="E.g., Quantum Mechanics or The French Revolution..."
              className="flex-1 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') generateNotes(); }}
            />
            <button 
              className="glow-btn px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              onClick={generateNotes}
              disabled={loading || !topic}
            >
              <Send className="w-5 h-5" />
              Generate
            </button>
          </div>
          <TopicSuggestions onSelect={setTopic} />
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <AILoadingIndicator text="Crafting your notes..." />
            </motion.div>
          )}

          {!loading && notes && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 md:p-8"
            >
              <div className="flex justify-end mb-4 gap-2">
                <button
                  onClick={exportPDF}
                  className="p-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-xl transition-colors border border-[rgba(255,255,255,0.1)] text-white hover:text-brand-purple flex items-center gap-2 text-sm"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <ShareButton content={notes} />
              </div>
              <div 
                ref={notesRef}
                className="markdown-body prose prose-invert prose-brand max-w-none prose-headings:font-display prose-a:text-brand-blue p-4"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
