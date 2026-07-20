'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRepository } from '@/components/providers/repository-provider';
import { FileTreeItem } from '@/types/repository';
import { MOCK_FILE_TREE } from '@/mock-data/repository';
import { ChevronRight, ChevronDown, FolderGit2, FileCode } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';

function TreeItem({ item, level = 0 }: { item: FileTreeItem; level?: number }) {
  const { selectedFilePath, setSelectedFilePath } = useRepository();
  const [isOpen, setIsOpen] = React.useState(true);
  
  const isSelected = selectedFilePath === item.id;
  const isFolder = item.type === 'folder';

  return (
    <div className="flex flex-col w-full">
      <button
        onClick={() => {
          if (isFolder) setIsOpen(!isOpen);
          else setSelectedFilePath(item.id);
        }}
        className={cn(
          'flex items-center w-full py-1.5 px-2 text-sm transition-colors text-left group',
          isSelected ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text)]'
        )}
        style={{ paddingLeft: `${(level * 16) + 8}px` }}
      >
        <span className="w-4 shrink-0 flex items-center justify-center mr-1">
          {isFolder ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : null}
        </span>
        <span className={cn('mr-2', isFolder ? 'text-[var(--text-secondary)]' : (isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] opacity-80'))}>
          {isFolder ? <FolderGit2 size={14} {...defaultIconProps} /> : <FileCode size={14} {...defaultIconProps} />}
        </span>
        <span className={cn('truncate font-medium', isSelected && !isFolder ? 'font-semibold' : '')}>
          {item.name}
        </span>
      </button>
      
      {isFolder && isOpen && item.children && (
        <div className="flex flex-col">
          {item.children.map(child => (
            <TreeItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer() {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-base)]">
      <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-panel)] flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Files</span>
      </div>
      <ScrollArea className="flex-1 py-2">
        {MOCK_FILE_TREE.map(node => (
          <TreeItem key={node.id} item={node} />
        ))}
      </ScrollArea>
    </div>
  );
}
