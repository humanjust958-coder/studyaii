import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Wind, Droplets, Waves } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStickyState } from '../lib/hooks';

export function Relaxation() {
  const [activeTab, setActiveTab] = useStickyState<'breathe' | 'sounds'>('breathe', 'studygenie_relax_tab');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex gap-4 mb-6">
        <button 
          className={cn("px-6 py-2 rounded-full font-bold transition-all", activeTab === 'breathe' ? 'bg-brand-blue text-[#000]' : 'bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)]')}
          onClick={() => setActiveTab('breathe')}
        >
          Breathing
        </button>
        <button 
          className={cn("px-6 py-2 rounded-full font-bold transition-all", activeTab === 'sounds' ? 'bg-brand-purple text-[#000]' : 'bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)]')}
          onClick={() => setActiveTab('sounds')}
        >
          Focus Sounds
        </button>
      </div>

      <div className="glass-card p-6 md:p-10 min-h-[500px] flex items-center justify-center relative overflow-hidden">
        {activeTab === 'breathe' ? <BreathingExercise /> : <FocusSounds />}
      </div>
    </div>
  );
}

function BreathingExercise() {
  const [phase, setPhase] = useState<'breathe in' | 'hold' | 'breathe out'>('breathe in');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    let timeout1: any, timeout2: any, timeout3: any;

    const cycle = () => {
      setPhase('breathe in');
      timeout1 = setTimeout(() => {
        setPhase('hold');
        timeout2 = setTimeout(() => {
          setPhase('breathe out');
          timeout3 = setTimeout(cycle, 8000); // Exhale for 8s
        }, 7000); // Hold for 7s
      }, 4000); // Inhale for 4s
    };

    cycle();

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [isActive]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center">
      <h2 className="text-3xl font-display font-bold mb-2">4-7-8 Breathing</h2>
      <p className="text-[var(--color-text-secondary)] mb-12">Calm your exam anxiety instantly</p>

      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        <motion.div
          className="absolute inset-0 rounded-full bg-brand-blue/20 blur-2xl"
          animate={{
            scale: !isActive ? 1 : (phase === 'breathe in' ? 1.5 : phase === 'breathe out' ? 1 : 1.5),
            opacity: phase === 'hold' ? 0.8 : 0.4
          }}
          transition={{ duration: phase === 'breathe in' ? 4 : phase === 'breathe out' ? 8 : 7, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-brand-blue to-brand-green flex items-center justify-center shadow-glow-blue z-10"
          animate={{
            scale: !isActive ? 1 : (phase === 'breathe in' ? 1.8 : phase === 'breathe out' ? 1 : 1.8),
          }}
          transition={{ duration: phase === 'breathe in' ? 4 : phase === 'breathe out' ? 8 : 7, ease: "easeInOut" }}
        >
          <span className="text-2xl font-bold text-[#000]">{isActive ? phase.toUpperCase() : 'READY'}</span>
        </motion.div>
      </div>

      <button
        className="px-8 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-all font-bold"
        onClick={() => setIsActive(!isActive)}
      >
        {isActive ? 'Stop' : 'Start Exercise'}
      </button>
    </div>
  );
}

function FocusSounds() {
  const [playingState, setPlayingState] = useState<Record<string, boolean>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Record<string, { src?: AudioBufferSourceNode, osc?: OscillatorNode, gain: GainNode }>>({});

  useEffect(() => {
    return () => {
      // Cleanup Web Audio nodes when unmounting
      Object.keys(nodesRef.current).forEach(key => stopSound(key));
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const createBrownNoise = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    return noiseSource;
  };

  const toggleSound = (type: 'brown' | 'binaural' | 'rain') => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    if (playingState[type]) {
      stopSound(type);
      setPlayingState(prev => ({ ...prev, [type]: false }));
    } else {
      playSound(type, ctx);
      setPlayingState(prev => ({ ...prev, [type]: true }));
    }
  };

  const playSound = (type: string, ctx: AudioContext) => {
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2); // Fade in

    if (type === 'brown') {
      const src = createBrownNoise(ctx);
      src.connect(gainNode);
      src.start();
      nodesRef.current[type] = { src, gain: gainNode };
    } 
    else if (type === 'binaural') {
      // Alpha waves (10Hz difference)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      
      const merger = ctx.createChannelMerger(2);
      osc1.connect(merger, 0, 0); // Left channel
      osc2.connect(merger, 0, 1); // Right channel
      merger.connect(gainNode);

      osc1.frequency.value = 200;
      osc2.frequency.value = 210;

      osc1.start();
      osc2.start();
      
      nodesRef.current[type] = { 
        osc: osc1, 
        src: osc2 as unknown as AudioBufferSourceNode, // hack to store second osc
        gain: gainNode 
      };
    }
  };

  const stopSound = (type: string) => {
    const node = nodesRef.current[type];
    if (!node) return;

    const { src, osc, gain } = node;
    const ctx = audioCtxRef.current;
    
    if (ctx) {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); // Fade out
      setTimeout(() => {
        if (src) src.stop();
        if (osc) osc.stop();
        gain.disconnect();
      }, 1000);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-display font-bold mb-2 text-center">Focus & Ambient Sounds</h2>
      <p className="text-[var(--color-text-secondary)] mb-12 text-center">Mathematically generated audio directly in your browser.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <SoundCard 
          title="Deep Focus (Brown Noise)" 
          icon={<Wind />} 
          isActive={playingState['brown']}
          onClick={() => toggleSound('brown')}
        />
        <SoundCard 
          title="Alpha Binaural Beats (10Hz)" 
          icon={<Waves />} 
          isActive={playingState['binaural']}
          onClick={() => toggleSound('binaural')}
        />
        {/* We can add rain synth later as it requires more complex filters, but let's stick to these for now */}
      </div>
      <p className="text-sm text-center mt-8 opacity-50">Note: Binaural beats require headphones for the 10Hz brainwave effect.</p>
    </div>
  );
}

function SoundCard({ title, icon, isActive, onClick }: { title: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) {
  return (
    <div 
      className={cn("flex items-center justify-between p-6 cursor-pointer transition-all border rounded-2xl", isActive ? 'bg-brand-purple/10 border-brand-purple shadow-glow-purple' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.05)]')}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", isActive ? 'bg-brand-purple text-white' : 'bg-[rgba(255,255,255,0.1)] text-white/50')}>
          {icon}
        </div>
        <span className="font-bold">{title}</span>
      </div>
      <div>
        {isActive ? <Volume2 className="text-brand-purple" /> : <VolumeX className="text-white/30" />}
      </div>
    </div>
  );
}
