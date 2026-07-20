'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useApp, MOCK_REPOSITORIES } from '@/components/providers/app-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Hexagon, ArrowRight, FolderGit2, Clock, Sparkles,
  MessageSquare, GitBranch, Search, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { icon: Sparkles, label: 'Explain this project', prompt: 'Give me a complete overview of this repository, its architecture, and engineering decisions.' },
  { icon: GitBranch, label: 'Summarize architecture', prompt: 'Summarize the high-level architecture and technology stack.' },
  { icon: Search, label: 'Find risky files', prompt: 'Which files have the highest change frequency and highest risk?' },
  { icon: MessageSquare, label: 'Show decisions', prompt: 'Show me all major engineering decisions and ADRs.' },
];

const RECENT_CONVERSATIONS = [
  { id: 'c1', title: 'Why did we switch from REST to GraphQL?', repo: 'acme/platform', time: '2h ago' },
  { id: 'c2', title: 'Explain the payment service architecture', repo: 'acme/platform', time: '1d ago' },
  { id: 'c3', title: 'What changed in the last release?', repo: 'acme/mobile', time: '2d ago' },
];

export default function WelcomePage() {
  const router = useRouter();
  const { currentUser, setIsAuthenticated, setCurrentUser } = useApp();
  const [selectedRepo, setSelectedRepo] = React.useState(MOCK_REPOSITORIES[0]);

  // If no user (direct navigation), still work
  const displayName = currentUser?.name ?? 'Engineer';
  const greeting = getGreeting();

  const handleEnterWorkspace = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] overflow-y-auto">
      {/* Top Navigation Strip */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center">
            <Hexagon size={16} className="text-[var(--accent)]" />
          </div>
          <span className="text-sm font-semibold text-[var(--text)]">Engineering Memory</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-3 py-1">
            <div className="h-1.5 w-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
            Demo Mode
          </div>
          {currentUser && (
            <div className="h-8 w-8 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center text-xs font-bold text-[var(--accent)]">
              {displayName.charAt(0)}
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-1 font-mono">{greeting}</p>
          <h1 className="text-4xl font-bold text-[var(--text)] tracking-tight mb-3">
            Welcome back, <span className="text-[var(--accent)]">{displayName.split(' ')[0]}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Your engineering intelligence is ready. Where would you like to start?
          </p>
        </motion.div>

        {/* Main entry card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <Card
            variant="basic"
            className="p-6 border-[var(--border)] bg-[var(--bg-panel)] relative overflow-hidden"
          >
            {/* Accent glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-[var(--accent)]" />
                  <span className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">AI Workspace</span>
                </div>
                <h2 className="text-xl font-bold text-[var(--text)] mb-2">Engineering Memory AI Chat</h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-md">
                  Explore your codebase through conversation. Ask why decisions were made, understand architecture, and surface hidden risks — all from Git history.
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleEnterWorkspace}
                className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-semibold px-8 flex-shrink-0 h-12"
              >
                Enter Workspace
                <ArrowRight size={18} />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Repositories (2/3 width) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider">
                Recent Repositories
              </h3>
              <span className="text-xs text-[var(--text-secondary)]">Demo Mode</span>
            </div>
            <div className="space-y-2">
              {MOCK_REPOSITORIES.map((repo, i) => (
                <motion.button
                  key={repo.id}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  onClick={() => setSelectedRepo(repo)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center gap-4 group',
                    selectedRepo.id === repo.id
                      ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5'
                      : 'border-[var(--border)] bg-[var(--bg-panel)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]'
                  )}
                >
                  <div className={cn(
                    'h-10 w-10 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors',
                    selectedRepo.id === repo.id
                      ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
                  )}>
                    <FolderGit2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">{repo.name}</p>
                      {repo.language && (
                        <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] rounded px-1.5 py-0.5 flex-shrink-0">
                          {repo.language}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{repo.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] flex-shrink-0">
                    <Clock size={11} />
                    <span>
                      {new Date(repo.lastAnalyzed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-3">
                Quick Start
              </h3>
              <div className="space-y-1.5">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={handleEnterWorkspace}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)] transition-all duration-150 group"
                  >
                    <action.icon size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
                    <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text)] transition-colors">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent conversations */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-3">
                Recent Chats
              </h3>
              <div className="space-y-1.5">
                {RECENT_CONVERSATIONS.map((convo) => (
                  <button
                    key={convo.id}
                    type="button"
                    onClick={handleEnterWorkspace}
                    className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)] transition-all duration-150 group"
                  >
                    <MessageSquare size={13} className="text-[var(--text-secondary)] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">{convo.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--text-secondary)] font-mono truncate">{convo.repo}</span>
                        <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">{convo.time}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return '🌅 Good morning';
  if (h < 17) return '☀️ Good afternoon';
  return '🌙 Good evening';
}
