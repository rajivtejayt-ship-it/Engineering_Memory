import {
  Clock,
  GitMerge,
  CircleDot,
  Network,
  Brain,
  GitCommit,
  Users,
  Sparkles,
  AlertTriangle,
  Shield,
  FileSearch,
  Zap,
} from 'lucide-react';

export const FEATURES = [
  {
    id: 'timeline',
    title: 'Repository Timeline',
    description: 'Connect commits, PRs, issues, and discussions into one chronological engineering story.',
    icon: Clock,
    color: '#12F7C1',
  },
  {
    id: 'pr-intelligence',
    title: 'PR Intelligence',
    description: 'Understand why every pull request was opened, what it solved, and what it changed.',
    icon: GitMerge,
    color: '#22FFD7',
  },
  {
    id: 'issue-linking',
    title: 'Issue Linking',
    description: 'Trace every line of code back to the issue that required it — automatically.',
    icon: CircleDot,
    color: '#12F7C1',
  },
  {
    id: 'repository-graph',
    title: 'Repository Graph',
    description: 'Visualize code dependencies, module relationships, and risk areas interactively.',
    icon: Network,
    color: '#22FFD7',
  },
  {
    id: 'engineering-decisions',
    title: 'Engineering Decisions',
    description: 'Surface architecture decisions from discussions, ADRs, and team conversations.',
    icon: Brain,
    color: '#12F7C1',
  },
  {
    id: 'code-evolution',
    title: 'Code Evolution',
    description: 'See how any file or function has changed across its entire history.',
    icon: GitCommit,
    color: '#22FFD7',
  },
  {
    id: 'contributor-insights',
    title: 'Developer Contributions',
    description: 'Know exactly who built what, why, and what they were solving.',
    icon: Users,
    color: '#12F7C1',
  },
  {
    id: 'ai-historian',
    title: 'AI Repository Historian',
    description: 'Ask anything about your codebase. Get evidence-backed answers, not hallucinations.',
    icon: Sparkles,
    color: '#22FFD7',
  },
  {
    id: 'risk-analysis',
    title: 'Risk Analysis',
    description: 'Understand what will break before refactoring or deleting any code.',
    icon: AlertTriangle,
    color: '#12F7C1',
  },
  {
    id: 'dependency-tracking',
    title: 'Dependency Tracking',
    description: 'Map external dependencies, their introduction history, and current security status.',
    icon: Shield,
    color: '#22FFD7',
  },
  {
    id: 'file-history',
    title: 'File History',
    description: 'Deep dive into the complete history of any file — from creation to today.',
    icon: FileSearch,
    color: '#12F7C1',
  },
  {
    id: 'instant-answers',
    title: 'Instant Engineering Answers',
    description: 'Stop searching through commits. Get instant answers powered by repository context.',
    icon: Zap,
    color: '#22FFD7',
  },
];

export const COMPARISON_DATA = [
  { question: 'Why was this code written?', traditional: false, engineeringMemory: true },
  { question: 'Which bug introduced this change?', traditional: false, engineeringMemory: true },
  { question: 'Which issue required this?', traditional: false, engineeringMemory: true },
  { question: 'Which PR implemented it?', traditional: true, engineeringMemory: true },
  { question: 'Who worked on it?', traditional: true, engineeringMemory: true },
  { question: 'What will break if removed?', traditional: false, engineeringMemory: true },
  { question: 'What was the architecture decision?', traditional: false, engineeringMemory: true },
  { question: 'Is this implementation still relevant?', traditional: false, engineeringMemory: true },
  { question: 'How has this evolved over time?', traditional: false, engineeringMemory: true },
];

export const TESTIMONIALS = [
  {
    id: 't-1',
    quote: 'Engineering Memory saved us 3 hours in every code review. We finally understand the "why" behind decisions made 2 years ago.',
    author: 'Priya Krishnamurthy',
    role: 'Staff Engineer',
    company: 'Stripe',
    avatarSeed: 'priya-k',
  },
  {
    id: 't-2',
    quote: "Onboarding new engineers went from weeks to days. They can now ask why any piece of code exists and get a real, evidence-backed answer.",
    author: 'Marcus Webb',
    role: 'Engineering Manager',
    company: 'Vercel',
    avatarSeed: 'marcus-w',
  },
  {
    id: 't-3',
    quote: "Before removing any code, we ask Engineering Memory what will break. We've prevented 4 production incidents this quarter alone.",
    author: 'Anya Kowalski',
    role: 'Principal Engineer',
    company: 'Linear',
    avatarSeed: 'anya-k',
  },
];

export const IMPORT_STEPS = [
  { id: 1, label: 'Authenticate with GitHub', description: 'Connect your GitHub account securely' },
  { id: 2, label: 'Select Repository', description: 'Choose the repository to import and analyze' },
  { id: 3, label: 'Analyze Repository', description: 'AI analyzes commits, PRs, issues, and discussions' },
  { id: 4, label: 'Build Timeline', description: 'Chronological engineering history is constructed' },
  { id: 5, label: 'Generate Graph', description: 'Repository dependency graph is created' },
  { id: 6, label: 'Ready', description: 'Engineering Memory is ready to explore' },
];
