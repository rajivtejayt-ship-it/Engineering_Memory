import { TimelineNode, FileTreeItem, ContextData } from '@/types/repository';

export const MOCK_TIMELINE: TimelineNode[] = [
  {
    id: 'dec-1',
    type: 'decision',
    title: 'Migrate to JWT Auth',
    author: 'architecture-board',
    timestamp: '2023-11-15T10:00:00Z',
    description: 'Decision to move away from session cookies to support mobile client API requests.',
    filesChanged: [],
  },
  {
    id: 'pr-892',
    type: 'pr',
    title: 'Implement strict JWT validation',
    author: 'johndoe',
    timestamp: '2023-11-18T14:22:00Z',
    description: 'Replaces legacy session strategy with JWT Bearer token extraction.',
    branch: 'feature/jwt-auth',
    filesChanged: ['src/core/auth/strategy.ts', 'src/middleware/auth.ts'],
  },
  {
    id: 'issue-402',
    type: 'issue',
    title: 'Bug: Invalid token crashes server',
    author: 'tester',
    timestamp: '2023-11-20T09:15:00Z',
    description: 'Sending a malformed Authorization header causes an uncaught exception instead of 401.',
    filesChanged: [],
  },
  {
    id: 'commit-a8f92bd',
    type: 'commit',
    title: 'Fix: handle malformed auth headers',
    author: 'johndoe',
    timestamp: '2023-11-20T11:45:00Z',
    description: 'Added try-catch and safe string splitting for Bearer token.',
    branch: 'fix/auth-crash',
    filesChanged: ['src/middleware/auth.ts'],
  },
  {
    id: 'release-2.4.0',
    type: 'release',
    title: 'v2.4.0 - Mobile API Ready',
    author: 'release-bot',
    timestamp: '2023-11-22T00:00:00Z',
    description: 'Includes JWT auth, performance improvements, and bug fixes.',
    filesChanged: ['package.json'],
  }
];

export const MOCK_FILE_TREE: FileTreeItem[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'src/core',
        name: 'core',
        type: 'folder',
        children: [
          {
            id: 'src/core/auth',
            name: 'auth',
            type: 'folder',
            children: [
              { id: 'src/core/auth/strategy.ts', name: 'strategy.ts', type: 'file' },
              { id: 'src/core/auth/utils.ts', name: 'utils.ts', type: 'file' },
            ]
          }
        ]
      },
      {
        id: 'src/middleware',
        name: 'middleware',
        type: 'folder',
        children: [
          { id: 'src/middleware/auth.ts', name: 'auth.ts', type: 'file' }
        ]
      },
      { id: 'package.json', name: 'package.json', type: 'file' }
    ]
  }
];

export const MOCK_CODE_CONTENT: Record<string, string> = {
  'src/middleware/auth.ts': `import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../core/auth/strategy';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract Bearer token safely
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token extraction failed' });
    }

    const payload = await verifyToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token signature' });
  }
};`,
  'src/core/auth/strategy.ts': `import * as jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export async function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}`
};

export const MOCK_CONTEXT: Record<string, ContextData> = {
  'commit-a8f92bd': {
    id: 'commit-a8f92bd',
    markdown: `
## AI Context: Architectural Shift
This commit directly resolves **Issue #402** where malformed headers caused uncaught server exceptions.

### Risk Analysis
The change replaces the raw string manipulation \`req.headers.authorization\` with a safe-check \`startsWith('Bearer ')\`.

| Previous State | New State | Impact |
| --- | --- | --- |
| Throws 500 error | Returns 401 JSON | High |
| Vulnerable to missing headers | Safe optional chaining | Medium |

### Documentation Ref
Always use standard OAuth 2.0 Bearer format for mobile clients. Do not revert to legacy session cookies.
`,
    relatedPrs: ['#892'],
    relatedIssues: ['#402'],
    confidence: 94,
  },
  'dec-1': {
    id: 'dec-1',
    markdown: `
## Architecture Decision Record
**Title**: Migrate to JWT Auth
**Status**: Accepted

### Context
Our legacy system relied on Express Session cookies. This worked for the web application but strictly failed CORS and native storage mechanics required by the incoming React Native iOS application.

### Decision
We are deprecating \`express-session\` in favor of stateless JWTs.
- Secrets will be managed via AWS KMS.
- Expiration set to 15m with refresh token rotation.
`,
    relatedPrs: ['#892'],
    relatedIssues: [],
    confidence: 98,
  }
};
