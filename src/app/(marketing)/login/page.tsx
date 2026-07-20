'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/app-provider';
import { useToast } from '@/components/feedback/toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hexagon, ArrowRight, GitGraph } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { setIsAuthenticated } = useApp();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = (method: 'github' | 'guest') => {
    setIsLoggingIn(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsAuthenticated(true);
      toast({
        title: method === 'github' ? 'Authenticated via GitHub' : 'Signed in as Guest',
        type: 'success',
      });
      router.push('/import');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] p-4 relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent)]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <Card variant="basic" className="p-8 border border-[var(--border)] shadow-2xl flex flex-col items-center bg-[var(--bg-panel)]/80 backdrop-blur-xl">
          
          <div className="h-16 w-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-8 shadow-inner">
            <Hexagon size={32} className="text-[var(--text)]" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight mb-2 text-center">
            Sign in to Engineering Memory
          </h1>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-6 max-w-[280px]">
            Reconstruct intent, map decisions, and index human reasoning.
          </p>
          
          <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-md p-3 mb-8 w-full">
            <p className="text-xs text-[var(--accent)] text-center font-medium">
              Demo Mode is active. Authentication is simulated.
            </p>
          </div>

          <div className="w-full space-y-4">
            <Button 
              className="w-full h-12 flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--bg-base)] hover:bg-[var(--text)]/90"
              onClick={() => handleLogin('github')}
              disabled={isLoggingIn}
            >
              <GitGraph size={18} />
              Continue with GitHub
            </Button>
            
            <Button 
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2"
              onClick={() => handleLogin('guest')}
              disabled={isLoggingIn}
            >
              Continue as Guest
              <ArrowRight size={16} />
            </Button>
          </div>

          <p className="mt-8 text-xs text-[var(--text-secondary)] text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy. Secure access managed locally for this demo.
          </p>

        </Card>
      </motion.div>
    </div>
  );
}
