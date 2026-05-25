import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

export function Splash({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Wait bit before completing
          return 100;
        }
        return p + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-primary">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-brand-blue/20 blur-xl"
            />
            <Sparkles className="w-20 h-20 text-brand-blue animate-pulse relative z-10" />
          </div>

          <motion.h1 
            className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-4 vibrant-text"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            StudyGenie
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-brand-secondary font-heading mb-12 text-[var(--color-text-secondary)]"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Powered by Google Gemini AI
          </motion.p>

          <motion.div 
            className="w-64 h-2 bg-white/10 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-brand-blue to-brand-purple"
              style={{ width: `${progress}%` }}
              layout
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
