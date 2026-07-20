import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  title?: string;
}

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, children, ...props }, ref) => {
    const Icon = icons[variant];
    
    const variants = {
      default: 'bg-[var(--bg-panel)] border-[var(--border)] text-[var(--text)]',
      info: 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]',
      success: 'bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]',
      warning: 'bg-[var(--warning)]/10 border-[var(--warning)]/20 text-[var(--warning)]',
      error: 'bg-[var(--danger)]/10 border-[var(--danger)]/20 text-[var(--danger)]',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn('relative w-full rounded-[var(--radius-card)] border p-4 flex items-start space-x-3', variants[variant], className)}
        {...props}
      >
        <Icon className="mt-0.5 shrink-0" size={18} {...defaultIconProps} />
        <div className="flex flex-col space-y-1">
          {title && <h5 className="font-medium leading-none tracking-tight">{title}</h5>}
          <div className="text-[var(--text-meta)] opacity-90 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';
