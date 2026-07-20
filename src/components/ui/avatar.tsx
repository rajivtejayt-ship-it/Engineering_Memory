import * as React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-14 w-14 text-base',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full bg-[var(--bg-panel)] border border-[var(--border)]',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          /* 
           * INTENTIONAL USE OF <img> OVER next/image:
           * Engineering Memory is designed to pull avatars dynamically from external Git providers
           * (GitHub, GitLab, Bitbucket) that cannot be pre-configured in next.config.js remotePatterns.
           * Using next/image here would cause Next.js build errors for dynamic external URLs.
           */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--bg-panel)] text-[var(--text-secondary)] font-medium">
            {fallback ? fallback.substring(0, 2).toUpperCase() : <User size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} {...defaultIconProps} />}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
