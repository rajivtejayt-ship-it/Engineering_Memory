'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { transitions } from '@/design-system/motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'basic' | 'elevated' | 'interactive' | 'repository';
  asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'basic', ...props }, ref) => {
    const baseStyles = 'rounded-[var(--radius-card)] bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden';
    
    const variants = {
      basic: '',
      elevated: 'shadow-[var(--shadow-md)] bg-[var(--bg-panel)]',
      interactive: 'cursor-pointer hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-md)] transition-all',
      repository: 'p-6 hover:border-[var(--border-hover)] transition-colors',
    };

    if (variant === 'interactive' || variant === 'repository') {
      return (
        <motion.div
          ref={ref}
          className={cn(baseStyles, variants[variant], className)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          transition={transitions.interaction}
          {...(props as HTMLMotionProps<'div'>)}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-[var(--text-title-lg)] font-semibold leading-none tracking-tight text-[var(--text)]', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-[var(--text-meta)] text-[var(--text-secondary)]', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
