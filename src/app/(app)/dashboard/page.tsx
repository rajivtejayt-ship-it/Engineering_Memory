'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, StreamingMessage } from '@/components/ai/chat-message';
import { ChatInput } from '@/components/ai/chat-input';
import { SuggestedPrompts } from '@/components/ai/suggested-prompts';
import { useMockChat } from '@/hooks/use-mock-chat';
import { Hexagon, FolderGit2, Sparkles } from 'lucide-react';
import { MOCK_REPOSITORIES } from '@/components/providers/app-provider';

export default function DashboardPage() {
  const { messages, streamingState, streamingText, sendMessage, isStreaming } = useMockChat();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isEmptyState = messages.length === 0 && streamingState === 'idle';
  const selectedRepo = MOCK_REPOSITORIES[0];

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] overflow-hidden">

      {/* Repository context header */}
      <div className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--bg-panel)] px-6 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <FolderGit2 size={13} className="text-[var(--accent)]" />
          <span className="font-mono font-medium text-[var(--text)]">{selectedRepo.name}</span>
          <span className="text-[var(--border-hover)]">·</span>
          <span>{selectedRepo.language}</span>
          <span className="text-[var(--border-hover)]">·</span>
          <span>Last analyzed: Jan 15</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-full px-2.5 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          AI Ready
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-6 py-6">

          <AnimatePresence mode="wait">
            {isEmptyState ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center"
              >
                {/* Logo mark */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="h-16 w-16 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mb-6 shadow-[0_0_32px_rgba(59,130,246,0.15)]"
                >
                  <Hexagon size={28} className="text-[var(--accent)]" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-3 tracking-tight">
                    Ask anything about{' '}
                    <span className="text-[var(--accent)] font-mono">{selectedRepo.name}</span>
                  </h2>
                  <p className="text-[var(--text-secondary)] text-base leading-relaxed max-w-md mb-8">
                    I have analyzed this repository's full history — commits, decisions, PRs, and architecture. Ask me anything.
                  </p>
                </motion.div>

                {/* Suggested prompts on empty state */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-xl"
                >
                  <div className="flex items-center gap-2 mb-3 justify-center">
                    <Sparkles size={13} className="text-[var(--text-secondary)]" />
                    <span className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Try asking</span>
                  </div>
                  <SuggestedPrompts onSelect={sendMessage} disabled={isStreaming} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="conversation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}

                {/* Streaming state */}
                {(streamingState === 'thinking' || streamingState === 'generating' || streamingState === 'streaming') && (
                  <StreamingMessage
                    state={streamingState}
                    text={streamingText}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--bg-base)]">
        <div className="max-w-3xl mx-auto px-6 py-4 space-y-3">
          {/* Prompts when chatting */}
          {!isEmptyState && (
            <div>
              <SuggestedPrompts onSelect={sendMessage} disabled={isStreaming} />
            </div>
          )}
          <ChatInput
            onSend={sendMessage}
            disabled={isStreaming}
          />
          <p className="text-xs text-[var(--text-secondary)]/50 text-center">
            Demo Mode · Responses generated from mock repository data · Not connected to a real repository
          </p>
        </div>
      </div>
    </div>
  );
}
