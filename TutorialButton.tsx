import React, { useState } from 'react';
import { CircleHelp, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function TutorialButton({ title, instructions, resources }: { title: string, instructions: string[], resources?: {label: string, url: string}[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-text-secondary)] hover:text-white transition-colors"
                title="How to use this module"
            >
                <CircleHelp className="w-4 h-4" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--color-bg-secondary)] border border-[rgba(255,255,255,0.1)] p-6 rounded-2xl max-w-sm w-full shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                                    <CircleHelp className="w-5 h-5 text-brand-blue" /> How to use {title}
                                </h3>
                                <button onClick={() => setIsOpen(false)} className="text-[var(--color-text-secondary)] hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <ul className="space-y-4 mb-6">
                                {instructions.map((inst, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-[var(--color-text-secondary)]">
                                        <div className="w-6 h-6 shrink-0 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        <div className="pt-0.5">{inst}</div>
                                    </li>
                                ))}
                            </ul>

                            {resources && resources.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-heading font-bold text-sm text-brand-purple mb-3">Learn More</h4>
                                    <div className="flex flex-col gap-2">
                                        {resources.map((res, i) => (
                                            <a 
                                                key={i} 
                                                href={res.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex justify-between items-center bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] p-3 rounded-xl transition-colors group"
                                            >
                                                <span className="text-sm text-[var(--color-text-primary)]">{res.label}</span>
                                                <ExternalLink className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:text-white" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-white font-heading font-medium px-6 py-2 rounded-xl transition-colors"
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
