'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const PLACEHOLDERS = [
  'Explain this project...',
  'Summarize the repository architecture...',
  'Why did we choose this approach?',
  'Which files are highest risk?',
  'What changed in the last sprint?',
  'Explain authentication flow...',
  'Show engineering decisions...',
];

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = React.useState('');
  const [placeholderIndex, setPlaceholderIndex] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Cycle through placeholder examples
  React.useEffect(() => {
    if (placeholder) return;
    const interval = setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholder]);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className={cn(
      'relative flex items-end gap-3 rounded-xl border bg-[var(--bg-panel)] p-3 transition-all duration-200',
      'border-[var(--border)]',
      'focus-within:border-[var(--accent)]/40 focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.2)]',
    )}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 resize-none bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)]/50',
          'focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed',
          'leading-relaxed py-1 min-h-[28px] max-h-[200px]',
        )}
        placeholder={placeholder ?? PLACEHOLDERS[placeholderIndex]}
        aria-label="Chat message input"
      />

      {/* Send button */}
      <AnimatePresence mode="wait">
        <motion.button
          key={disabled ? 'loading' : canSend ? 'active' : 'idle'}
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
            canSend
              ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 cursor-pointer'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] cursor-not-allowed',
          )}
          aria-label="Send message"
        >
          {disabled
            ? <Loader2 size={14} className="animate-spin" />
            : <ArrowUp size={14} />
          }
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
