import type {
  RepositoryDocumentation,
  RepositoryEvidenceData,
} from "@/lib/retriever";
import type { RepositoryContext as CollectedRepositoryContext } from "@/types/context";

/**
 * Canonical internal conversion from backend collector output to the
 * provider-neutral evidence shapes consumed by the retriever.
 */
export function adaptCollectorRepositoryContext(
  context: CollectedRepositoryContext,
): RepositoryEvidenceData {
  return {
    commits: context.commits.map((commit) => ({
      id: commit.sha,
      message: commit.message,
      authoredAt: commit.authoredAt,
      author: commit.author?.displayName ?? commit.author?.login ?? "Unknown author",
      files: commit.files.map((file) => file.path),
    })),
    pullRequests: context.pullRequests.map((pullRequest) => ({
      number: pullRequest.number,
      title: pullRequest.title,
      author:
        pullRequest.author?.displayName ??
        pullRequest.author?.login ??
        "Unknown author",
      status: toPullRequestStatus(pullRequest.state),
      ...(pullRequest.createdAt ? { createdAt: pullRequest.createdAt } : {}),
      ...(pullRequest.mergedAt ? { mergedAt: pullRequest.mergedAt } : {}),
      commitIds: [],
      summary: pullRequest.body ?? pullRequest.title,
      files: pullRequest.files.map((file) => file.path),
    })),
    issues: context.issues.map((issue) => ({
      number: issue.number,
      title: issue.title,
      status: issue.state === "OPEN" ? "open" : "closed",
      ...(issue.createdAt ? { createdAt: issue.createdAt } : {}),
      labels: [],
      summary: issue.body ?? issue.title,
    })),
    documentation: collectDocumentation(context),
  };
}

function toPullRequestStatus(
  state: "OPEN" | "CLOSED" | "MERGED",
): "open" | "closed" | "merged" {
  return state === "OPEN" ? "open" : state === "MERGED" ? "merged" : "closed";
}

function collectDocumentation(
  context: CollectedRepositoryContext,
): RepositoryDocumentation[] {
  return context.relatedFiles
    .filter(({ change }) => isDocumentationPath(change.path))
    .map(({ change, relevance }) => ({
      path: change.path,
      title: change.path,
      summary: relevance,
    }));
}

function isDocumentationPath(path: string): boolean {
  return /(?:^|\/)(?:readme|contributing|architecture|adr|docs?)(?:\.|\/)|\.(?:md|mdx|rst|txt)$/i.test(
    path,
  );
}
