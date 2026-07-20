'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Hexagon, User } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { MockChatMessage } from '@/mock-data/ai-knowledge-base';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: MockChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex gap-4',
        isAssistant ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 h-8 w-8 rounded-full border flex items-center justify-center mt-1',
        isAssistant
          ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]'
          : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)]'
      )}>
        {isAssistant
          ? <Hexagon size={14} />
          : <User size={14} />
        }
      </div>

      {/* Bubble */}
      <div className={cn(
        'flex-1 min-w-0',
        isAssistant ? 'max-w-none' : 'max-w-[75%]'
      )}>
        <div className={cn(
          'text-xs font-semibold mb-2 uppercase tracking-wider',
          isAssistant ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
        )}>
          {isAssistant ? 'Engineering Memory' : 'You'}
        </div>

        {isAssistant ? (
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl rounded-tl-sm px-5 py-4">
            <MarkdownRenderer content={message.content} />
          </div>
        ) : (
          <div className="bg-[var(--accent)] rounded-xl rounded-tr-sm px-4 py-3 inline-block max-w-full">
            <p className="text-sm text-white leading-relaxed">{message.content}</p>
          </div>
        )}

        <div className="mt-1.5 text-xs text-[var(--text-secondary)]/60 px-1">
          {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

interface StreamingMessageProps {
  state: 'thinking' | 'generating' | 'streaming';
  text: string;
}

export function StreamingMessage({ state, text }: StreamingMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 h-8 w-8 rounded-full border bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center mt-1">
        <Hexagon size={14} className={state === 'streaming' ? '' : 'animate-pulse'} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold mb-2 uppercase tracking-wider text-[var(--accent)]">
          Engineering Memory
        </div>

        <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl rounded-tl-sm px-5 py-4">
          {state === 'thinking' && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-sm text-[var(--text-secondary)] animate-pulse">Thinking...</span>
            </div>
          )}

          {state === 'generating' && (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
              <span className="text-sm text-[var(--text-secondary)] animate-pulse">Generating answer from repository data...</span>
            </div>
          )}

          {state === 'streaming' && text && (
            <>
              <MarkdownRenderer content={text} />
              <span className="inline-block h-4 w-0.5 bg-[var(--accent)] animate-pulse ml-0.5 align-text-bottom" />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
