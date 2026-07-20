'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-[var(--radius-btn)] border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-body)] text-[var(--text)] placeholder:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error && 'border-[var(--danger)] focus-visible:border-[var(--danger)] focus-visible:ring-[var(--danger)]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
