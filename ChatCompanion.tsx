import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../store/UserContext';
import { askGeminiChat, generateSystemPrompt } from '../lib/gemini';
import { useStickyState } from '../lib/hooks';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatCompanion() {
  const { profile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useStickyState<{role: string, text: string}[]>([
    { role: 'model', text: "Ready to study? Let me know if you need help or have any doubts!" }
  ], 'studygenie_companion_chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || !profile?.apiKey || isLoading) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = generateSystemPrompt(profile, "You are StudyGenie Companion. Help the student clarify doubts, explain concepts clearly, and give actionable study tips. Be concise and friendly.");
      const chatHistory = [...messages, userMessage];
      const res = await askGeminiChat(profile.apiKey, chatHistory, systemPrompt);
      setMessages(prev => [...prev, { role: 'model', text: res as string }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Oops, I encountered an error. Please try again or check your API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile?.apiKey) return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-brand-blue to-brand-purple rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:shadow-glow-blue transition-shadow pulse-magical"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${isMinimized ? 'bottom-0' : 'bottom-6'} right-6 w-[350px] bg-[var(--color-bg-secondary)] border border-[rgba(255,255,255,0.1)] rounded-t-2xl ${isMinimized ? 'rounded-b-none' : 'rounded-b-2xl'} shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px] max-h-[80vh]'}`}
          >
            {/* Header */}
            <div 
              className="bg-[rgba(255,255,255,0.05)] p-4 flex justify-between items-center border-b border-[rgba(255,255,255,0.1)] cursor-pointer"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white font-bold text-sm">
                  AI
                </div>
                <h3 className="font-display font-bold text-sm">Study Companion</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="text-[var(--color-text-secondary)] hover:text-white transition-colors p-1"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
                  className="text-[var(--color-text-secondary)] hover:text-white transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                      <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-blue text-white rounded-tr-sm' : 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-primary)] border border-[rgba(255,255,255,0.05)] rounded-tl-sm'} text-sm leading-relaxed max-w-full overflow-hidden markdown-body prose prose-invert prose-brand prose-p:my-1 prose-a:text-brand-blue`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="self-start bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] p-3 rounded-2xl rounded-tl-sm flex gap-1">
                      <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-[rgba(0,0,0,0.2)] border-t border-[rgba(255,255,255,0.05)] flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--color-text-primary)] px-2"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-brand-blue"
                  >
                    <Send className="w-4 h-4 -ml-0.5" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
