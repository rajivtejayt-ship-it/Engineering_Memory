import type {
  Repository,
  TimelineEvent,
  ChatMessage,
  AIInsight,
  Commit,
  Issue,
  PullRequest,
  Contributor,
  RepositoryHealth,
} from '@/types';

export const mockRepositories: Repository[] = [];
export const mockTimelineEvents: TimelineEvent[] = [];
export const mockChatMessages: ChatMessage[] = [];
export const mockAIInsights: AIInsight[] = [];
export const mockCommits: Commit[] = [];
export const mockIssues: Issue[] = [];
export const mockPullRequests: PullRequest[] = [];
export const mockContributors: Contributor[] = [];
export const mockHealth: RepositoryHealth | null = null;
