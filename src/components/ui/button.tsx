'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { transitions } from '@/design-system/motion';

import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

const MotionSlot = motion.create(Slot) as React.ElementType;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-[var(--radius-btn)] text-[var(--text-meta)] font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 transition-colors';

    const variants = {
      primary: 'bg-[var(--accent)] text-white hover:opacity-90',
      secondary: 'bg-[var(--bg-panel)] text-[var(--text)] hover:bg-[var(--bg-card)] border border-[var(--border)]',
      ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-panel)] hover:text-[var(--text)]',
      outline: 'bg-transparent border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-panel)]',
      destructive: 'bg-[var(--danger)] text-white hover:opacity-90',
      icon: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-panel)]',
    };

    const sizes = {
      sm: 'h-8 px-3',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8',
      icon: 'h-10 w-10',
    };

    const Comp = asChild ? MotionSlot : motion.button;

    return (
      <Comp
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        whileTap={{ scale: 0.98 }}
        transition={transitions.interaction}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
