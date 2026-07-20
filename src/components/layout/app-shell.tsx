'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TopNav } from './top-nav';
import { Sidebar } from './sidebar';
import { ContextPanel } from './context-panel';
import { WorkspaceContainer } from './workspace-container';
import { Button } from '@/components/ui/button';
import { Menu, PanelRightClose, PanelRightOpen } from 'lucide-react';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [contextOpen, setContextOpen] = React.useState(true);

  // Close overlays on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setContextOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--bg-base)] text-[var(--text)]">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Layout Area */}
      <div className="relative flex flex-1 overflow-hidden">
        
        {/* Mobile Sidebar Overlay Trigger & Background */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Pane (Left) */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex transform transition-transform duration-300 lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar />
        </aside>

        {/* Primary Workspace Pane (Center) */}
        <div className="flex flex-1 flex-col min-w-0 relative">
          
          {/* Mobile Headers / Toggles */}
          <div className="flex items-center justify-between lg:hidden border-b border-[var(--border)] bg-[var(--bg-panel)] p-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setContextOpen(!contextOpen)}>
              {contextOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
            </Button>
          </div>

          <WorkspaceContainer>
            {/* 
              Global Workspace Context Toggle for Desktop 
              (Placed inside workspace top right to toggle context panel)
            */}
            <div className="absolute right-4 top-4 hidden lg:block z-10">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setContextOpen(!contextOpen)}
                className="text-[var(--text-secondary)] hover:text-[var(--text)] bg-[var(--bg-panel)]/50 backdrop-blur-sm border border-[var(--border)] shadow-sm"
              >
                {contextOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </Button>
            </div>

            {children}
          </WorkspaceContainer>
        </div>

        {/* Context Pane (Right) */}
        {contextOpen && (
          <>
            {/* Mobile Context Overlay Trigger & Background */}
            <div 
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
              onClick={() => setContextOpen(false)}
            />
            <aside className="fixed inset-y-0 right-0 z-40 lg:static transition-all duration-300 animate-in slide-in-from-right-1/2 lg:slide-in-from-right-0 shadow-2xl lg:shadow-none">
              <ContextPanel onClose={() => setContextOpen(false)} />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
