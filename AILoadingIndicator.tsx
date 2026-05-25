import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function AILoadingIndicator({ text = "AI is thinking..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 glass-card border border-brand-purple/20">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-t-2 border-r-2 border-brand-purple opacity-50"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-b-2 border-l-2 border-brand-blue absolute top-0 left-0 pt-2 opacity-50"
        />
        <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-brand-gold w-6 h-6 animate-pulse" />
      </div>
      
      <div className="flex flex-col items-center space-y-3">
        <span className="vibrant-text font-bold font-display tracking-widest uppercase text-sm animate-pulse">
          {text}
        </span>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1/2 h-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
