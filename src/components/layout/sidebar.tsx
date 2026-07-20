'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { NavItem } from '@/components/navigation/nav-item';
import { NavSection } from '@/components/navigation/nav-section';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderGit2, LayoutDashboard, Settings2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { HistoricalSpine } from '@/components/timeline/historical-spine';

export type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();

  // Switch to Historical Spine when viewing a specific repository workspace
  if (pathname?.startsWith('/repositories/') && pathname.length > '/repositories/'.length) {
    return (
      <div className={cn('flex h-full w-64 md:w-72 flex-col border-r border-[var(--border)] bg-[var(--bg-base)] transition-all duration-300', className)} {...props}>
        <HistoricalSpine />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'flex h-full w-64 md:w-72 flex-col border-r border-[var(--border)] bg-[var(--bg-base)] transition-all duration-300',
        className
      )}
      {...props}
    >
      <ScrollArea className="flex-1 py-4">
        <div className="flex flex-col gap-6 px-3">
          
          <NavSection>
            <NavItem href="/dashboard" icon={LayoutDashboard} active={pathname === '/dashboard'}>
              Dashboard
            </NavItem>
            <NavItem href="/import" icon={FolderGit2} active={pathname === '/import' || pathname.startsWith('/import/')}>
              Import Repository
            </NavItem>
            <NavItem href="/settings" icon={Settings2} active={pathname === '/settings'}>
              Settings
            </NavItem>
          </NavSection>

        </div>
      </ScrollArea>

      <div className="border-t border-[var(--border)] p-3">
        <NavSection>
          <NavItem href="/settings" icon={Settings2} active={pathname === '/settings'}>
            Settings
          </NavItem>
        </NavSection>
      </div>
    </div>
  );
}
