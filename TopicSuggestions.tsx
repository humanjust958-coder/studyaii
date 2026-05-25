import React from 'react';
import { useUser } from '../store/UserContext';

const getSuggestions = (examType: string) => {
    switch (examType) {
        case 'jee': return ['Kinematics', 'Thermodynamics', 'Organic Chemistry', 'Calculus', 'Electromagnetism'];
        case 'neet': return ['Human Physiology', 'Genetics', 'Plant Diversity', 'Optical Physics', 'Chemical Bonding'];
        case 'boards': return ['Matrices', 'Electrostatics', 'P-Block Elements', 'Optics', 'Integration'];
        default: return ['Algebra', 'Mechanics', 'Cell Biology', 'Atomic Structure'];
    }
};

export function TopicSuggestions({ onSelect }: { onSelect: (topic: string) => void }) {
    const { profile } = useUser();
    if (!profile) return null;

    const suggestions = getSuggestions(profile.examType || '');

    return (
        <div className="flex flex-wrap gap-2 mt-3">
            {suggestions.map((topic, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(topic)}
                    className="text-xs px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] hover:border-brand-blue text-[var(--color-text-secondary)] hover:text-white transition-colors"
                >
                    {topic}
                </button>
            ))}
        </div>
    );
}
