// ============================================================
// Engineering Memory — TypeScript Interfaces
// All interfaces are backend-ready. Replace mock data with
// the corresponding API endpoints noted in each section.
// ============================================================

export interface Repository {
  id: string;
  name: string;
  fullName: string; // e.g. "owner/repo"
  description: string;
  url: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  languages: LanguageStat[];
  branches: number;
  commitCount: number;
  contributorCount: number;
  createdAt: string;
  updatedAt: string;
  defaultBranch: string;
  healthScore: number; // 0-100
  isPrivate: boolean;
  topics: string[];
  license: string | null;
  size: number; // KB
}

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}

export interface Contributor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  commits: number;
  additions: number;
  deletions: number;
  prsOpened: number;
  issuesClosed: number;
}

export interface Commit {
  sha: string;
  shortSha: string;
  message: string;
  description?: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
    email: string;
  };
  timestamp: string;
  branch: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  parentSha?: string;
  tags: string[];
  linkedPRs: string[];
  linkedIssues: string[];
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  state: 'open' | 'closed' | 'merged';
  author: {
    username: string;
    avatarUrl: string;
    displayName: string;
  };
  reviewers: {
    username: string;
    avatarUrl: string;
    state: 'approved' | 'requested_changes' | 'commented' | 'pending';
  }[];
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
  closedAt?: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  commits: number;
  comments: number;
  labels: Label[];
  linkedIssues: string[];
  branch: string;
  targetBranch: string;
  isDraft: boolean;
  aiSummary?: string;
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  author: {
    username: string;
    avatarUrl: string;
    displayName: string;
  };
  assignees: {
    username: string;
    avatarUrl: string;
  }[];
  labels: Label[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  comments: number;
  reactions: number;
  linkedPRs: string[];
  milestone?: string;
  aiSummary?: string;
}

export interface Discussion {
  id: string;
  number: number;
  title: string;
  body: string;
  category: string;
  author: {
    username: string;
    avatarUrl: string;
    displayName: string;
  };
  createdAt: string;
  updatedAt: string;
  comments: number;
  upvotes: number;
  isAnswered: boolean;
  answeredBy?: {
    username: string;
    avatarUrl: string;
  };
  linkedIssues: string[];
  linkedPRs: string[];
  aiSummary?: string;
}

export type TimelineEventType =
  | 'issue_opened'
  | 'issue_closed'
  | 'discussion_started'
  | 'pr_opened'
  | 'pr_merged'
  | 'pr_closed'
  | 'commit'
  | 'release'
  | 'deployment'
  | 'bug_report'
  | 'hotfix';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  author: {
    username: string;
    avatarUrl: string;
    displayName: string;
  };
  metadata: Record<string, string | number | boolean>;
  linkedEvents: string[]; // IDs of related timeline events
  aiInsight?: string;
  references: {
    type: 'issue' | 'pr' | 'commit' | 'discussion';
    id: string;
    number?: number;
    title: string;
  }[];
}

export interface AIInsight {
  id: string;
  type: 'why' | 'risk' | 'evolution' | 'contributor' | 'decision';
  title: string;
  content: string;
  confidence: number; // 0-1
  references: {
    type: 'issue' | 'pr' | 'commit' | 'discussion';
    id: string;
    number?: number;
    title: string;
    url?: string;
  }[];
  generatedAt: string;
  repositoryId: string;
  fileContext?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  references?: {
    type: 'issue' | 'pr' | 'commit' | 'discussion';
    id: string;
    number?: number;
    title: string;
  }[];
  isStreaming?: boolean;
}

export interface GraphNode {
  id: string;
  type: 'file' | 'directory' | 'module' | 'service' | 'dependency';
  label: string;
  path?: string;
  metadata: {
    commitCount?: number;
    lastModified?: string;
    contributors?: number;
    riskLevel?: 'low' | 'medium' | 'high';
    language?: string;
    size?: number;
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'imports' | 'depends_on' | 'modified_together' | 'related';
  weight: number; // 0-1
  label?: string;
}

export interface RepositoryGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    generatedAt: string;
    algorithm: string;
  };
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface FileHistory {
  path: string;
  commits: {
    sha: string;
    message: string;
    author: string;
    timestamp: string;
    additions: number;
    deletions: number;
    aiNote?: string;
  }[];
  contributors: Contributor[];
  aiSummary?: string;
}

export interface RepositoryHealth {
  score: number;
  categories: {
    name: string;
    score: number;
    description: string;
  }[];
  trends: {
    date: string;
    score: number;
  }[];
}

export type SuggestedPrompt = {
  id: string;
  text: string;
  category: 'why' | 'risk' | 'who' | 'history';
};
