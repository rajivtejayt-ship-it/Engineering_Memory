import {
  LayoutDashboard,
  GitBranch,
  GitCommit,
  GitPullRequest,
  CircleDot,
  MessageSquare,
  Sparkles,
  BarChart3,
  Settings,
  Clock,
} from 'lucide-react';

export const SIDEBAR_NAV = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'repositories', label: 'Repositories', href: '/repositories', icon: GitBranch },
  { id: 'timeline', label: 'Timeline', href: '/dashboard/timeline', icon: Clock },
  { id: 'commits', label: 'Commits', href: '/dashboard/commits', icon: GitCommit },
  { id: 'pull-requests', label: 'Pull Requests', href: '/dashboard/pulls', icon: GitPullRequest },
  { id: 'issues', label: 'Issues', href: '/dashboard/issues', icon: CircleDot },
  { id: 'discussions', label: 'Discussions', href: '/dashboard/discussions', icon: MessageSquare },
  { id: 'ai', label: 'AI Historian', href: '/dashboard/ai', icon: Sparkles },
  { id: 'analytics', label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const LANDING_NAV = [
  { label: 'Features', href: '#features' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Graph', href: '#graph' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs' },
];
