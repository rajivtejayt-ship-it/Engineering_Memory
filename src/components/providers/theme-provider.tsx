'use client';

import * as React from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = React.createContext<ThemeProviderContext | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>('dark');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Avoid synchronous setState during initial mount effect to satisfy ESLint
    const timer = setTimeout(() => {
      setMounted(true);
      const stored = localStorage.getItem('theme-preference') as Theme;
      if (stored) {
        setTheme(stored);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem('theme-preference', theme);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
