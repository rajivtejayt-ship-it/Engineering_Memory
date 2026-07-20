'use client';

import * as React from 'react';
import { useInView, animate } from 'framer-motion';

function Counter({ value, label }: { value: number; label: string }) {
  const ref = React.useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  React.useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          if (ref.current) {
            // Formatting with K or M logic
            if (value > 1000000) {
              ref.current.textContent = (value / 1000000).toFixed(1) + 'M';
            } else if (value > 1000) {
              ref.current.textContent = (value / 1000).toFixed(1) + 'K';
            } else {
              ref.current.textContent = Math.round(value).toString();
            }
          }
        },
      });
      return () => controls.stop();
    }
  }, [inView, value]);

  return (
    <div className="flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-[var(--border)] last:border-0">
      <h3 ref={ref} className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-2 font-mono">0</h3>
      <p className="text-[var(--text-meta)] uppercase tracking-wider font-semibold text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="py-16 bg-[var(--bg-panel)] border-y border-[var(--border)]">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border border-[var(--border)] rounded-[var(--radius-panel)] bg-[var(--bg-base)]">
          <Counter value={42} label="Repositories" />
          <Counter value={1200000} label="Lines Indexed" />
          <Counter value={14500} label="Commits" />
          <Counter value={3200} label="Pull Requests" />
          <Counter value={890} label="Discussions" />
          <Counter value={450} label="Decisions" />
        </div>
      </div>
    </section>
  );
}
