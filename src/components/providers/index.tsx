'use client';

import * as React from 'react';
import { ThemeProvider } from './theme-provider';
import { TooltipProvider } from './tooltip-provider';
import { MotionProvider } from './motion-provider';
import { RepositoryProvider } from './repository-provider';
import { AppProvider } from './app-provider';
import { ToastProvider } from '@/components/feedback/toast';

/**
 * Root Providers Wrapper
 * Composes all global foundational providers into a single wrapper for layout.tsx.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MotionProvider>
        <TooltipProvider>
          <AppProvider>
            <RepositoryProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </RepositoryProvider>
          </AppProvider>
        </TooltipProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}
