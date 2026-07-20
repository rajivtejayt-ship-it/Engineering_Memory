export type TimelineNodeType = 'commit' | 'pr' | 'issue' | 'release' | 'decision';

export interface TimelineNode {
  id: string;
  type: TimelineNodeType;
  title: string;
  author: string;
  timestamp: string;
  description: string;
  branch?: string;
  filesChanged: string[];
}

export interface FileTreeItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeItem[];
}

export interface ContextData {
  id: string;
  markdown: string;
  relatedPrs: string[];
  relatedIssues: string[];
  confidence: number;
}
