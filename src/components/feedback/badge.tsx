import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2';
    
    const variants = {
      default: 'border-transparent bg-[var(--accent)] text-white',
      secondary: 'border-transparent bg-[var(--bg-panel)] text-[var(--text)]',
      outline: 'text-[var(--text)] border-[var(--border)]',
      success: 'border-transparent bg-[var(--success)] text-white',
      warning: 'border-transparent bg-[var(--warning)] text-white',
      danger: 'border-transparent bg-[var(--danger)] text-white',
    };

    return (
      <div ref={ref} className={cn(baseStyles, variants[variant], className)} {...props} />
    );
  }
);
Badge.displayName = 'Badge';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'online' | 'offline' | 'busy' | 'away';
  icon?: LucideIcon;
  label?: string;
}

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, icon: Icon, label, ...props }, ref) => {
    const statusColors = {
      online: 'bg-[var(--success)]',
      offline: 'bg-[var(--text-secondary)]',
      busy: 'bg-[var(--danger)]',
      away: 'bg-[var(--warning)]',
    };

    return (
      <div ref={ref} className={cn('inline-flex items-center space-x-2', className)} {...props}>
        <span className="relative flex h-2.5 w-2.5">
          {status === 'online' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
          )}
          <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', statusColors[status])}></span>
        </span>
        {(label || Icon) && (
          <span className="flex items-center space-x-1 text-[var(--text-meta)] text-[var(--text-secondary)] font-medium">
            {Icon && <Icon size={14} {...defaultIconProps} />}
            {label && <span>{label}</span>}
          </span>
        )}
      </div>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';
