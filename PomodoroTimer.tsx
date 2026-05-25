import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useUser } from '../store/UserContext';
import confetti from 'canvas-confetti';

export function PomodoroTimer() {
  const { addXP, completeChallenge } = useUser();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Play sound
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);

      if (mode === 'work') {
        addXP(50);
        completeChallenge('pomodoro');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, addXP, completeChallenge]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const setTimerMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'work' ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden group">
      {/* Background glow based on mode */}
      <div className={cn(
        "absolute inset-0 opacity-10 transition-colors duration-1000",
        mode === 'work' ? "bg-brand-pink" : "bg-brand-green"
      )} />
      
      <div className="flex items-center gap-2 mb-4 relative z-10 w-full justify-between">
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-heading uppercase tracking-widest text-xs font-bold">
          <Timer className="w-4 h-4" />
          Focus Session
        </div>
        <div className="flex bg-[rgba(255,255,255,0.05)] rounded-full p-1 border border-[rgba(255,255,255,0.1)]">
          <button 
            onClick={() => setTimerMode('work')}
            className={cn("px-3 py-1 text-xs rounded-full transition-colors", mode === 'work' ? "bg-brand-pink text-white" : "text-white/50 hover:text-white")}
          >
            Work (25m)
          </button>
          <button 
            onClick={() => setTimerMode('break')}
            className={cn("px-3 py-1 text-xs rounded-full transition-colors", mode === 'break' ? "bg-brand-green text-white" : "text-white/50 hover:text-white")}
          >
            Break (5m)
          </button>
        </div>
      </div>
      
      <div className="relative w-48 h-48 flex items-center justify-center my-4 z-10">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
          <motion.circle 
             cx="96" cy="96" r="88" 
             stroke={mode === 'work' ? "#EC4899" : "#10B981"} 
             strokeWidth="4" 
             fill="none" 
             strokeDasharray="553" 
             strokeDashoffset={553 - (553 * progress) / 100}
             className="transition-all duration-1000 ease-linear"
             strokeLinecap="round"
          />
        </svg>
        <div className="text-5xl font-mono font-bold tracking-tighter">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-4 relative z-10">
        <button 
          onClick={toggleTimer}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            isActive ? "bg-white/10 hover:bg-white/20 text-white border border-white/20" : "glow-btn"
          )}
        >
          {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
