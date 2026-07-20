'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useApp, MOCK_USERS } from '@/components/providers/app-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hexagon, ArrowRight, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

type LoginMethod = 'github' | 'google' | 'guest';

export default function LoginPage() {
  const router = useRouter();
  const { setIsAuthenticated, setCurrentUser } = useApp();
  const [loadingMethod, setLoadingMethod] = React.useState<LoginMethod | null>(null);

  const handleLogin = (method: LoginMethod) => {
    if (loadingMethod) return;
    setLoadingMethod(method);

    setTimeout(() => {
      setIsAuthenticated(true);
      setCurrentUser(MOCK_USERS[method]);
      router.push('/welcome');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] p-4 relative overflow-hidden">

      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--success)]/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="h-16 w-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_0_4px_rgba(59,130,246,0.1),0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <Hexagon size={32} className="text-[var(--accent)]" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight mb-1">
            Engineering Memory
          </h1>
          <p className="text-sm text-[var(--text-secondary)] text-center max-w-[260px] leading-relaxed">
            Reconstruct intent, map decisions, and index human reasoning.
          </p>
        </div>

        <Card variant="basic" className="p-6 border border-[var(--border)] bg-[var(--bg-panel)]/90 backdrop-blur-xl shadow-2xl">

          {/* Demo Mode Notice */}
          <div className="flex items-center gap-2 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg px-3 py-2.5 mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse flex-shrink-0" />
            <p className="text-xs text-[var(--accent)] font-medium">
              Demo Mode — Authentication is simulated. No real credentials required.
            </p>
          </div>

          <div className="space-y-3">
            {/* GitHub Login */}
            <LoginButton
              onClick={() => handleLogin('github')}
              loading={loadingMethod === 'github'}
              disabled={!!loadingMethod}
              className="bg-[var(--text)] text-[var(--bg-base)] hover:bg-[var(--text)]/90 border-transparent"
              icon={<GitHubIcon className="h-4 w-4 flex-shrink-0" />}
              label="Continue with GitHub"
            />

            {/* Google Login */}
            <LoginButton
              onClick={() => handleLogin('google')}
              loading={loadingMethod === 'google'}
              disabled={!!loadingMethod}
              className="bg-[var(--bg-card)] text-[var(--text)] hover:bg-[var(--border-hover)] border-[var(--border)]"
              icon={<Globe size={16} className="flex-shrink-0" />}
              label="Continue with Google"
            />

            {/* Divider */}
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--text-secondary)] font-medium">or</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {/* Guest Login */}
            <LoginButton
              onClick={() => handleLogin('guest')}
              loading={loadingMethod === 'guest'}
              disabled={!!loadingMethod}
              className="bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] border-[var(--border)]"
              icon={null}
              label="Continue as Guest"
              trailingIcon={<ArrowRight size={14} />}
            />
          </div>

          {/* Description */}
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed text-center">
              Engineering Memory uses AI to reconstruct why your codebase was built the way it was — surfacing decisions, intent, and risk from Git history.
            </p>
          </div>
        </Card>

        <p className="mt-4 text-xs text-[var(--text-secondary)]/60 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

interface LoginButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  className?: string;
  icon: React.ReactNode;
  label: string;
  trailingIcon?: React.ReactNode;
}

function LoginButton({ onClick, loading, disabled, className, icon, label, trailingIcon }: LoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full h-11 rounded-[var(--radius-btn)] border flex items-center justify-center gap-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-panel)] disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader2 size={16} className="animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5"
          >
            {icon}
            <span>{label}</span>
            {trailingIcon && <span className="ml-1 opacity-60">{trailingIcon}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
