'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface WorkspaceContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function WorkspaceContainer({ className, children, ...props }: WorkspaceContainerProps) {
  return (
    <div 
      className={cn(
        'flex-1 flex flex-col min-w-0 bg-[var(--bg-base)]',
        className
      )}
      {...props}
    >
      <ScrollArea className="flex-1">
        <main className="mx-auto w-full max-w-7xl p-6 md:p-8 lg:p-10 min-h-full">
          {children}
        </main>
      </ScrollArea>
    </div>
  );
}
