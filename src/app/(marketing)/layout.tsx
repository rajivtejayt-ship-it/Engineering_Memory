import * as React from 'react';
import { LandingNav } from '@/components/landing/landing-nav';
import { Footer } from '@/components/landing/footer';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)] text-[var(--text)]">
      <LandingNav />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
