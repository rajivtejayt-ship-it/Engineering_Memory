'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Hexagon, GitGraph, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { defaultIconProps } from '@/design-system/icons';
import Link from 'next/link';

export function LandingNav() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-[var(--z-sticky)] transition-all duration-300 border-b',
        scrolled
          ? 'bg-[var(--bg-base)]/80 backdrop-blur-md border-[var(--border)] shadow-sm py-3'
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 md:px-12">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-[var(--text)] font-semibold transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
            <Hexagon size={22} {...defaultIconProps} />
          </div>
          <span className="text-[var(--text-body)] tracking-tight">Engineering Memory</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-[var(--text-meta)] font-medium text-[var(--text-secondary)]">
          <Link href="#features" className="hover:text-[var(--text)] transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-[var(--text)] transition-colors">How it Works</Link>
          <Link href="#demo" className="hover:text-[var(--text)] transition-colors">Demo</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hidden md:flex text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors p-2">
            <GitGraph size={20} {...defaultIconProps} />
          </Link>
          <div className="h-4 w-px bg-[var(--border)] mx-2 hidden md:block" />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Get Started <ArrowRight size={16} className="ml-2" /></Link>
          </Button>
        </div>

      </div>
    </header>
  );
}
