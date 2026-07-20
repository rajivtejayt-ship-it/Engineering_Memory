export const EVENT_TYPE_CONFIG = {
  issue_opened: { label: 'Issue', color: '#FF6B7B', bgColor: 'rgba(255, 107, 123, 0.15)' },
  issue_closed: { label: 'Issue Closed', color: '#6BF178', bgColor: 'rgba(107, 241, 120, 0.15)' },
  discussion_started: { label: 'Discussion', color: '#FFB84D', bgColor: 'rgba(255, 184, 77, 0.15)' },
  pr_opened: { label: 'Pull Request', color: '#12F7C1', bgColor: 'rgba(18, 247, 193, 0.15)' },
  pr_merged: { label: 'PR Merged', color: '#22FFD7', bgColor: 'rgba(34, 255, 215, 0.15)' },
  pr_closed: { label: 'PR Closed', color: '#6E7684', bgColor: 'rgba(110, 118, 132, 0.15)' },
  commit: { label: 'Commit', color: '#B8C4D1', bgColor: 'rgba(184, 196, 209, 0.15)' },
  release: { label: 'Release', color: '#6BF178', bgColor: 'rgba(107, 241, 120, 0.15)' },
  deployment: { label: 'Deployment', color: '#12F7C1', bgColor: 'rgba(18, 247, 193, 0.15)' },
  bug_report: { label: 'Bug Report', color: '#FF6B7B', bgColor: 'rgba(255, 107, 123, 0.15)' },
  hotfix: { label: 'Hotfix', color: '#FFB84D', bgColor: 'rgba(255, 184, 77, 0.15)' },
} as const;

export const TIMELINE_EVENTS_PREVIEW = [
  { type: 'issue', label: 'Issue #41 opened', color: '#FF6B7B', desc: 'Payment timeouts' },
  { type: 'discussion', label: 'Architecture discussion', color: '#FFB84D', desc: 'Retry strategy options' },
  { type: 'pr', label: 'PR #96 opened', color: '#12F7C1', desc: 'Retry mechanism' },
  { type: 'commit', label: 'Implementation commit', color: '#22FFD7', desc: '248 additions' },
  { type: 'deployment', label: 'Deployed to production', color: '#6BF178', desc: 'v2.3.1 shipped' },
  { type: 'bug', label: 'Issue #38: JWT race', color: '#FF6B7B', desc: 'Security audit' },
  { type: 'hotfix', label: 'Hotfix merged', color: '#FFB84D', desc: 'PR #94 — 2h fix' },
];
