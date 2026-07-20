'use client';

import * as React from 'react';

export interface RepositoryMetadata {
  id: string;
  name: string;
  url: string;
  lastAnalyzed: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  importedRepositories: RepositoryMetadata[];
  importRepository: (url: string, name: string) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [demoMode, setDemoMode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [importedRepositories, setImportedRepositories] = React.useState<RepositoryMetadata[]>([]);

  const importRepository = React.useCallback((url: string, name: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setImportedRepositories((prev) => [
      ...prev,
      { id, name, url, lastAnalyzed: new Date().toISOString() }
    ]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        importedRepositories,
        importRepository,
        demoMode,
        setDemoMode,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
