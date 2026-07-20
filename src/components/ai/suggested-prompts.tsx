'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { SUGGESTED_PROMPTS } from '@/mock-data/ai-knowledge-base';
import { cn } from '@/lib/utils';
import { Sparkles, GitBranch, Search, MessageSquare, AlertTriangle, Clock, FolderOpen, Zap } from 'lucide-react';

const CATEGORY_ICONS = {
  overview: Sparkles,
  architecture: GitBranch,
  decisions: MessageSquare,
  risk: AlertTriangle,
  history: Clock,
};

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTED_PROMPTS.map((p, i) => {
        const Icon = CATEGORY_ICONS[p.category] ?? Sparkles;
        return (
          <motion.button
            key={p.id}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            onClick={() => onSelect(p.prompt)}
            disabled={disabled}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150',
              'border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-secondary)]',
              'hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <Icon size={11} className="flex-shrink-0" />
            {p.label}
          </motion.button>
        );
      })}
    </div>
  );
}
