'use client';

import * as React from 'react';

export interface RepositoryMetadata {
  id: string;
  name: string;
  url: string;
  lastAnalyzed: string;
  description?: string;
  language?: string;
  stars?: number;
}

export interface MockUser {
  id: string;
  name: string;
  login: string;
  avatar?: string;
  provider: 'github' | 'google' | 'guest';
}

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  currentUser: MockUser | null;
  setCurrentUser: (user: MockUser | null) => void;
  importedRepositories: RepositoryMetadata[];
  importRepository: (url: string, name: string) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const MOCK_USERS: Record<string, MockUser> = {
  github: {
    id: 'u-github-1',
    name: 'Alex Rivera',
    login: 'arivera-dev',
    provider: 'github',
  },
  google: {
    id: 'u-google-1',
    name: 'Priya Sharma',
    login: 'priya.sharma',
    provider: 'google',
  },
  guest: {
    id: 'u-guest-1',
    name: 'Guest User',
    login: 'guest',
    provider: 'guest',
  },
};

export const MOCK_REPOSITORIES: RepositoryMetadata[] = [
  {
    id: 'acme-platform',
    name: 'acme/platform',
    url: 'https://github.com/acme/platform',
    lastAnalyzed: '2024-01-15T10:00:00Z',
    description: 'Core platform monorepo — API, auth, payments, and data pipeline.',
    language: 'TypeScript',
    stars: 1240,
  },
  {
    id: 'acme-mobile',
    name: 'acme/mobile',
    url: 'https://github.com/acme/mobile',
    lastAnalyzed: '2024-01-14T08:30:00Z',
    description: 'React Native iOS & Android application.',
    language: 'TypeScript',
    stars: 430,
  },
  {
    id: 'acme-infra',
    name: 'acme/infra',
    url: 'https://github.com/acme/infra',
    lastAnalyzed: '2024-01-13T12:00:00Z',
    description: 'Terraform infrastructure — AWS, EKS, RDS.',
    language: 'HCL',
    stars: 89,
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<MockUser | null>(null);
  const [demoMode, setDemoMode] = React.useState(true);
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
        currentUser,
        setCurrentUser,
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
