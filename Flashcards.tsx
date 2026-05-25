import React, { useState } from 'react';
import { useUser } from '../store/UserContext';
import { askGemini, generateSystemPrompt } from '../lib/gemini';
import { Layers, Send, Sparkles, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, List } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { cn } from '../lib/utils';
import { useStickyState } from '../lib/hooks';
import { AILoadingIndicator } from './AILoadingIndicator';
import { TopicSuggestions } from './TopicSuggestions';
import { TutorialButton } from './TutorialButton';

import confetti from 'canvas-confetti';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export function Flashcards() {
  const { profile, addXP, completeChallenge } = useUser();
  const [topic, setTopic] = useStickyState('', 'studygenie_flashcards_topic');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useStickyState<Flashcard[]>([], 'studygenie_flashcards_cards');
  const [currentIndex, setCurrentIndex] = useStickyState(0, 'studygenie_flashcards_index');
  const [isFlipped, setIsFlipped] = useStickyState(false, 'studygenie_flashcards_isflipped');
  const [flippedCards, setFlippedCards] = useStickyState<string[]>([], 'studygenie_flashcards_flippedcards'); // Now stores card IDs
  const [showList, setShowList] = useState(false);

  const customColor = localStorage.getItem('setting_flashcards_color');
  const headingColorClass = customColor ? `text-transparent bg-clip-text bg-gradient-to-r ${customColor}` : 'text-brand-gold';
  const iconClass = customColor ? `bg-gradient-to-br ${customColor} text-white p-1.5 rounded-lg` : 'text-brand-gold w-8 h-8';

  const generate = async () => {
    if (!topic || !profile || !profile.apiKey) return;
    setLoading(true);
    try {
      const maxCount = localStorage.getItem('setting_flashcards_count') || '6';
      const moduleContext = `Generate exactly ${maxCount} flashcards for the topic provided. Return ONLY a raw JSON array. Do not wrap in markdown blocks or backticks. Format: [{"front": "Question or Term", "back": "Answer or Definition"}]`;
      const systemPrompt = generateSystemPrompt(profile, moduleContext);
      const res = await askGemini(profile.apiKey, `Topic: ${topic}`, systemPrompt);
      const jsonMatch = res.match(/\[([\s\S]*?)\]/);
      const cleaned = jsonMatch ? jsonMatch[0] : res.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned).map((c: any) => ({ ...c, id: Math.random().toString(36).substring(7) }));
      setCards(parsed);
      setCurrentIndex(0);
      setIsFlipped(false);
      setFlippedCards([]);
    } catch (e) {
      alert("Failed to generate cards. The AI might not have returned valid JSON. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const markMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentId = cards[currentIndex].id;
    if (!flippedCards.includes(currentId)) {
      const cur = parseInt(localStorage.getItem('flashcardProgress') || '0', 10);
      const newCur = cur + 1;
      localStorage.setItem('flashcardProgress', newCur.toString());
      localStorage.setItem('lastFlashcardActivity', new Date().toISOString());
      setFlippedCards(prev => [...prev, currentId]);
      addXP(5);
      
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#F59E0B', '#10B981']
      });

      if (newCur % 5 === 0) {
        completeChallenge('flashcards');
      }
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, 150);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
      <div className="glass-card p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className={`text-3xl font-display font-bold flex items-center gap-3 ${headingColorClass}`}>
            <Layers className={`w-8 h-8 ${iconClass}`} />
            AI Flashcards
            <TutorialButton 
              title="Flashcards" 
              instructions={[
                "Enter a topic and generate a deck.",
                "Click on a card to flip it and reveal the answer.",
                "Use the arrows to navigate through the deck.",
                "Adjust the number of cards in the Dashboard settings."
              ]} 
              resources={[
                { label: "Brainscape: Flashcard Science", url: "https://www.brainscape.com/academy/how-to-study-effectively-with-flashcards/" }
              ]}
            />
          </h2>
        </div>
        
        <div className="flex flex-col mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter a topic to generate cards..."
              className="flex-1 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') generate(); } }
            />
            <button 
              className="glow-btn flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)' }}
              onClick={generate}
              disabled={loading || !topic}
            >
              <Layers className="w-5 h-5"/> Generate
            </button>
          </div>
          <TopicSuggestions onSelect={setTopic} />
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <AILoadingIndicator text="Extracting key concepts..." />
            </motion.div>
          )}

          {!loading && cards.length > 0 && (
            <motion.div key="cards" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center">
            <div className="flex justify-between items-center w-full max-w-md mb-4 text-[var(--color-text-secondary)] font-mono text-sm">
              <span>Card {currentIndex + 1} of {cards.length}</span>
              <button 
                onClick={() => setShowList(!showList)} 
                className="flex items-center gap-1 hover:text-white transition-colors border border-[rgba(255,255,255,0.1)] px-2 py-1 rounded"
              >
                <List className="w-4 h-4" /> {showList ? 'Deck View' : 'List View'}
              </button>
            </div>
            
            {showList ? (
              <div className="w-full max-w-md bg-[rgba(255,255,255,0.02)] p-4 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                <Reorder.Group axis="y" values={cards} onReorder={setCards} className="space-y-3">
                  {cards.map((item, idx) => (
                      <Reorder.Item 
                        key={item.id} 
                        value={item} 
                        className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] p-4 rounded-xl cursor-grab active:cursor-grabbing flex justify-between items-center"
                      >
                         <div>
                            <p className="font-bold text-sm mb-1">{item.front}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">{item.back}</p>
                         </div>
                         {flippedCards.includes(item.id) && (
                           <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                         )}
                      </Reorder.Item>
                  ))}
                </Reorder.Group>
                <p className="text-xs text-center mt-4 text-[var(--color-text-secondary)]">Drag to reorder</p>
              </div>
            ) : (
             <>
             <div 
              className="relative w-full max-w-md aspect-[4/3] perspective-[1000px] cursor-pointer group"
              onClick={flipCard}
             >
              <motion.div
                className="w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div 
                  className={cn(
                    "absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col items-center justify-center text-center",
                    "bg-[rgba(255,255,255,0.03)] border-2 border-brand-gold/30 shadow-glow-gold"
                  )}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <RefreshCw className="absolute top-4 right-4 w-5 h-5 text-brand-gold/50 cursor-pointer group-hover:text-brand-gold transition-colors" />
                  {flippedCards.includes(cards[currentIndex]?.id) && (
                     <CheckCircle2 className="absolute top-4 left-4 w-6 h-6 text-green-400" />
                  )}
                  <h3 className="text-2xl font-display font-bold text-white">{cards[currentIndex]?.front}</h3>
                </div>

                {/* Back */}
                <div 
                  className={cn(
                    "absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col items-center justify-center text-center",
                    "bg-[rgba(255,255,255,0.05)] border-2 border-brand-purple/50 shadow-glow-purple"
                  )}
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <RefreshCw className="absolute top-4 right-4 w-5 h-5 text-brand-purple/50 cursor-pointer group-hover:text-brand-purple transition-colors" />
                  {flippedCards.includes(cards[currentIndex]?.id) && (
                     <CheckCircle2 className="absolute top-4 left-4 w-6 h-6 text-green-400" />
                  )}
                  <p className="text-xl text-[var(--color-text-primary)] mb-6">{cards[currentIndex]?.back}</p>
                  
                  {!flippedCards.includes(cards[currentIndex]?.id) && (
                     <button
                       onClick={markMastered}
                       className="glow-btn px-6 py-2 rounded-full absolute bottom-6 font-bold text-sm flex items-center gap-2"
                       style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                     >
                       <CheckCircle2 className="w-4 h-4" /> Got it!
                     </button>
                  )}
                </div>
              </motion.div>
             </div>

             <div className="flex items-center gap-6 mt-8">
              <button 
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-30 transition-colors"
                style={{ zIndex: 50 }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextCard}
                disabled={currentIndex === cards.length - 1}
                className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-30 transition-colors"
                style={{ zIndex: 50 }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
             </div>
             </>
            )}
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
