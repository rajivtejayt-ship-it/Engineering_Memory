'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Moon, Sun, Keyboard, EyeOff, LayoutGrid } from 'lucide-react';

import { useTheme } from '@/components/providers/theme-provider';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex-1 p-8 bg-[var(--bg-base)] overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        
        <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight mb-8">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Settings Nav */}
          <div className="md:col-span-1 space-y-1">
            <Button variant="ghost" className="w-full justify-start font-medium bg-[var(--bg-card)]">
              <Monitor size={16} className="mr-3 text-[var(--text-secondary)]" /> Appearance
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-[var(--text-secondary)]">
              <Keyboard size={16} className="mr-3" /> Shortcuts
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-[var(--text-secondary)]">
              <EyeOff size={16} className="mr-3" /> Accessibility
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-[var(--text-secondary)]">
              <LayoutGrid size={16} className="mr-3" /> Integrations
            </Button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3 space-y-8">
            
            {/* Appearance Section */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Theme Preferences</h2>
              <Card variant="basic" className="p-6 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-[var(--text)] font-medium">Interface Theme</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Select or customize your UI theme.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border ${theme === 'light' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--border-hover)]'} transition-colors`}
                  >
                    <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-900 shadow-sm">
                      <Sun size={20} />
                    </div>
                    <span className="text-sm font-medium text-[var(--text)]">Light</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border ${theme === 'dark' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--border-hover)]'} transition-colors`}
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-white shadow-sm">
                      <Moon size={20} />
                    </div>
                    <span className="text-sm font-medium text-[var(--text)]">Dark</span>
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border ${theme === 'system' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--border-hover)]'} transition-colors`}
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-800 border border-[var(--border)] flex items-center justify-center text-white shadow-sm">
                      <Monitor size={20} />
                    </div>
                    <span className="text-sm font-medium text-[var(--text)]">System</span>
                  </button>
                </div>
              </Card>
            </section>

            {/* Accessibility Mock Section */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Accessibility</h2>
              <Card variant="basic" className="p-6 border border-[var(--border)] space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[var(--text)] font-medium">Reduced Motion</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Disable decorative animations and transitions.</p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-[var(--border)] relative cursor-not-allowed">
                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-[var(--text-secondary)]" />
                  </div>
                </div>
                <div className="h-px w-full bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[var(--text)] font-medium">High Contrast</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Increase contrast of text and borders.</p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-[var(--border)] relative cursor-not-allowed">
                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-[var(--text-secondary)]" />
                  </div>
                </div>
              </Card>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
