'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { transitions } from '@/design-system/motion';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

export interface NavItemProps extends HTMLMotionProps<'a'> {
  href: string;
  icon?: LucideIcon;
  active?: boolean;
}

const MotionLink = motion.create(Link) as React.ElementType;

export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ className, href, icon: Icon, active, children, ...props }, ref) => {
    return (
      <MotionLink
        href={href}
        ref={ref}
        className={cn(
          'flex items-center gap-3 rounded-[var(--radius-btn)] px-3 py-2 text-[var(--text-meta)] font-medium transition-colors',
          active
            ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-panel)] hover:text-[var(--text)]',
          className
        )}
        whileTap={{ scale: 0.98 }}
        transition={transitions.interaction}
        {...props}
      >
        {Icon && <Icon size={18} {...defaultIconProps} className={cn(active ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]')} />}
        {children as React.ReactNode}
      </MotionLink>
    );
  }
);
NavItem.displayName = 'NavItem';
