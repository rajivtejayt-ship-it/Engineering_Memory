'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Search, Bell, Hexagon } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';
import { Avatar } from '@/components/ui/avatar';
import { CommandPalette } from '@/components/shared/command-palette';
import { SearchOverlay } from '@/components/shared/search-overlay';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown';
import { Badge } from '@/components/feedback/badge';

export function TopNav() {
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-panel)]/80 backdrop-blur-md px-4">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 text-[var(--text)] font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">
            <Hexagon size={20} {...defaultIconProps} />
          </div>
          <span className="hidden md:inline-block">Engineering Memory</span>
        </div>

        <Badge variant="outline" className="hidden sm:inline-flex bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20 ml-2">
          Demo Mode
        </Badge>

        <div className="h-4 w-px bg-[var(--border)] mx-2 hidden md:block" />

        {/* Repository Selector */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="font-mono text-[var(--text-meta)]">
                core-backend-api
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Repositories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>core-backend-api</DropdownMenuItem>
              <DropdownMenuItem>frontend-web-app</DropdownMenuItem>
              <DropdownMenuItem>infrastructure-as-code</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search Trigger */}
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden md:flex w-64 justify-start text-[var(--text-secondary)] font-normal px-3"
          onClick={() => setSearchOpen(true)}
        >
          <Search size={14} className="mr-2" {...defaultIconProps} />
          <span>Search memory...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--border)] bg-[var(--bg-card)] px-1.5 font-mono text-[10px] font-medium text-[var(--text-secondary)] opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)}>
          <Search size={18} {...defaultIconProps} />
        </Button>

        {/* Notifications Placeholder */}
        <Button variant="ghost" size="icon" className="relative text-[var(--text-secondary)] hover:text-[var(--text)]">
          <Bell size={18} {...defaultIconProps} />
          <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        </Button>

        {/* User Menu Placeholder */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-panel)]">
              <Avatar size="sm" fallback="JD" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[var(--danger)]">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Global Overlays */}
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
