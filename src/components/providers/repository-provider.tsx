'use client';

import * as React from 'react';
import { TimelineNode, ContextData } from '@/types/repository';
import { MOCK_TIMELINE, MOCK_CONTEXT } from '@/mock-data/repository';

interface RepositoryContextType {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectedFilePath: string | null;
  setSelectedFilePath: (path: string | null) => void;
  activeContextTab: 'ai' | 'history' | 'docs';
  setActiveContextTab: (tab: 'ai' | 'history' | 'docs') => void;
  activeNode: TimelineNode | null;
  activeContext: ContextData | null;
}

const RepositoryContext = React.createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>('commit-a8f92bd');
  const [selectedFilePath, setSelectedFilePath] = React.useState<string | null>('src/middleware/auth.ts');
  const [activeContextTab, setActiveContextTab] = React.useState<'ai' | 'history' | 'docs'>('ai');

  const activeNode = React.useMemo(() => {
    return MOCK_TIMELINE.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId]);

  const activeContext = React.useMemo(() => {
    if (!selectedNodeId) return null;
    return MOCK_CONTEXT[selectedNodeId] || null;
  }, [selectedNodeId]);

  return (
    <RepositoryContext.Provider
      value={{
        selectedNodeId,
        setSelectedNodeId,
        selectedFilePath,
        setSelectedFilePath,
        activeContextTab,
        setActiveContextTab,
        activeNode,
        activeContext,
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const context = React.useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return context;
}
