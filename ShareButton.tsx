import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function ShareButton({ content }: { content: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors text-sm font-heading"
        >
            {copied ? <Check className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4 text-[var(--color-text-secondary)]" />}
            {copied ? 'Copied!' : 'Share / Copy'}
        </button>
    );
}
