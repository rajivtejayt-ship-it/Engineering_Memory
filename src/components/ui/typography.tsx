import * as React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export function Heading({
  children,
  className,
  as: Component = 'h1',
  level = 1,
  ...props
}: TypographyProps & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const sizeClass = {
    1: 'text-[var(--text-display-lg)] font-semibold tracking-tight',
    2: 'text-[var(--text-display-md)] font-semibold tracking-tight',
    3: 'text-[var(--text-title-lg)] font-medium tracking-tight',
    4: 'text-[var(--text-body)] font-medium',
    5: 'text-[var(--text-body)] font-medium uppercase tracking-wider',
    6: 'text-[var(--text-meta)] font-medium uppercase tracking-wider',
  }[level];

  return (
    <Component className={cn('text-[var(--text)]', sizeClass, className)} {...props}>
      {children}
    </Component>
  );
}

export function Body({
  children,
  className,
  as: Component = 'p',
  variant = 'primary',
  ...props
}: TypographyProps & { variant?: 'primary' | 'secondary' }) {
  const colorClass = variant === 'secondary' ? 'text-[var(--text-secondary)]' : 'text-[var(--text)]';

  return (
    <Component className={cn('text-[var(--text-body)] leading-relaxed', colorClass, className)} {...props}>
      {children}
    </Component>
  );
}

export function Caption({
  children,
  className,
  as: Component = 'span',
  ...props
}: TypographyProps) {
  return (
    <Component className={cn('text-[var(--text-meta)] text-[var(--text-secondary)]', className)} {...props}>
      {children}
    </Component>
  );
}

export function MonoText({
  children,
  className,
  as: Component = 'span',
  ...props
}: TypographyProps) {
  return (
    <Component className={cn('font-mono text-[var(--text-code)]', className)} {...props}>
      {children}
    </Component>
  );
}

export function CodeBlock({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      className={cn(
        'font-mono text-[var(--text-code)] bg-[var(--bg-panel)] border border-[var(--border)] rounded-[var(--radius-card)] p-4 overflow-x-auto',
        className
      )}
      {...props}
    >
      <code>{children}</code>
    </pre>
  );
}

export function Label({
  children,
  className,
  as: Component = 'label',
  ...props
}: TypographyProps) {
  return (
    <Component className={cn('text-[var(--text-meta)] font-medium text-[var(--text)]', className)} {...props}>
      {children}
    </Component>
  );
}
