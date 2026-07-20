'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard, FolderGit2, Clock, MessageSquare, Search,
  Settings2, User, ChevronLeft, ChevronRight, Hexagon, Home,
  BookOpen, LifeBuoy
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn as classnames } from '@/lib/utils';

export type SidebarProps = {
  className?: string;
};

interface NavEntry {
  href: string;
  icon: React.ElementType;
  label: string;
  match?: (pathname: string) => boolean;
}

const PRIMARY_NAV: NavEntry[] = [
  { href: '/welcome', icon: Home, label: 'Home' },
  { href: '/dashboard', icon: MessageSquare, label: 'AI Chat' },
  { href: '/repositories', icon: FolderGit2, label: 'Repositories' },
  { href: '/import', icon: Clock, label: 'Timeline' },
];

const SECONDARY_NAV: NavEntry[] = [
  { href: '/settings', icon: Settings2, label: 'Settings' },
];

function NavItem({
  entry,
  expanded,
  active,
}: {
  entry: NavEntry;
  expanded: boolean;
  active: boolean;
}) {
  const Icon = entry.icon;
  return (
    <Link
      href={entry.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
        active
          ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]',
        !expanded && 'justify-center px-2'
      )}
      aria-current={active ? 'page' : undefined}
      title={!expanded ? entry.label : undefined}
    >
      {/* Active indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-[var(--accent)] rounded-r-full" />
      )}

      <Icon size={18} className="flex-shrink-0 transition-transform group-hover:scale-105" />

      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            className="text-sm font-medium overflow-hidden whitespace-nowrap"
          >
            {entry.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = React.useState(true);

  const isActive = (entry: NavEntry) => {
    if (entry.match) return entry.match(pathname ?? '');
    return pathname === entry.href || pathname?.startsWith(entry.href + '/');
  };

  return (
    <motion.div
      animate={{ width: expanded ? 220 : 60 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex h-full flex-col border-r border-[var(--border)] bg-[var(--bg-panel)] overflow-hidden flex-shrink-0',
        className
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-[var(--border)] h-[57px] flex-shrink-0',
        expanded ? 'px-4 gap-3' : 'justify-center'
      )}>
        <div className="h-7 w-7 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
          <Hexagon size={15} className="text-[var(--accent)]" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-bold text-[var(--text)] tracking-tight whitespace-nowrap overflow-hidden"
            >
              Eng Memory
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Navigation */}
      <ScrollArea className="flex-1">
        <div className={cn('py-3 flex flex-col gap-1', expanded ? 'px-3' : 'px-2')}>
          {PRIMARY_NAV.map((entry) => (
            <NavItem
              key={entry.href}
              entry={entry}
              expanded={expanded}
              active={isActive(entry)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className={cn('border-t border-[var(--border)] py-3 flex flex-col gap-1', expanded ? 'px-3' : 'px-2')}>
        {SECONDARY_NAV.map((entry) => (
          <NavItem
            key={entry.href}
            entry={entry}
            expanded={expanded}
            active={isActive(entry)}
          />
        ))}

        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
            !expanded && 'justify-center px-2'
          )}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded
            ? <ChevronLeft size={16} />
            : <ChevronRight size={16} />
          }
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="text-sm font-medium overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
