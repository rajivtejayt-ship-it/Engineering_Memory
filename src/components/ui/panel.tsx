'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';


export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'floating' | 'glass';
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = 'surface', ...props }, ref) => {
    const baseStyles = 'rounded-[var(--radius-panel)] border border-[var(--border)] p-6';
    
    const variants = {
      surface: 'bg-[var(--bg-panel)]',
      floating: 'bg-[var(--bg-panel)] shadow-[var(--shadow-lg)] z-[var(--z-elevated)]',
      glass: 'bg-[var(--bg-panel)]/80 backdrop-blur-md',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);
Panel.displayName = 'Panel';
