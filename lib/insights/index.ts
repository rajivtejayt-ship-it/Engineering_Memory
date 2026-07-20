import { analyzeRepositoryHealth, type FileHealth } from "@/lib/health";
import type { RepositoryEvidenceData } from "@/lib/retriever";
import type { RepositoryContext } from "@/lib/types";

/** A file insight with first and most-recent observed activity. */
export interface InsightFile extends FileHealth {
  /** First observed commit timestamp for the file, when available. */
  firstModifiedAt?: string;
}

/** A repository folder with no recent observed changes in the supplied history. */
export interface DeadArea {
  /** Repository-relative folder path, or `repository root`. */
  path: string;
  /** Number of stale files observed in the folder. */
  fileCount: number;
  /** Latest observed modification among the stale files, when available. */
  lastModifiedAt?: string;
  /** Commit source IDs supporting the staleness finding. */
  sourceIds: string[];
}

/** A concentrated maintenance area identified from churn and risk signals. */
export interface EngineeringHotspot extends InsightFile {
  /** Deterministic explanation of the hotspot signal. */
  summary: string;
}

/** Deterministic, dashboard-ready observations about repository history. */
export interface Insights {
  /** Repository context used for this analysis. */
  repositoryContext: RepositoryContext;
  /** Files with the highest observed modification count. */
  mostModifiedFiles: InsightFile[];
  /** Folders containing files with no recent observed modifications. */
  deadAreas: DeadArea[];
  /** Files where change churn and/or risk signals are concentrated. */
  engineeringHotspots: EngineeringHotspot[];
  /** Long-lived files that remain active in the observed history. */
  oldestActiveModules: InsightFile[];
  /** Files linked to bug, regression, failure, or security history. */
  highRiskFiles: InsightFile[];
  /** Files repeatedly changed in the observed history. */
  frequentlyChangingFiles: InsightFile[];
}

const MAX_RESULTS = 5;
const ACTIVE_HISTORY_DAYS = 180;

/**
 * Generates repository insights from normalized API evidence. It is fully
 * deterministic and treats absent history as an empty, valid result.
 */
export function generateRepositoryInsights(
  repositoryContext: RepositoryContext,
  repositoryData: RepositoryEvidenceData,
): Insights {
  const health = analyzeRepositoryHealth(repositoryContext, repositoryData);
  const fileTiming = collectFileTiming(repositoryData);
  const healthByPath = new Map<string, FileHealth>();
  for (const file of [
    ...health.hotspotFiles,
    ...health.riskyFiles,
    ...health.frequentlyModifiedFiles,
    ...health.staleFiles,
  ]) {
    healthByPath.set(file.path, file);
  }

  const mostModifiedFiles = health.hotspotFiles.map((file) =>
    toInsightFile(file, fileTiming),
  );
  const highRiskFiles = health.riskyFiles.map((file) =>
    toInsightFile(file, fileTiming),
  );
  const frequentlyChangingFiles = health.frequentlyModifiedFiles.map((file) =>
    toInsightFile(file, fileTiming),
  );
  const deadAreas = buildDeadAreas(
    health.staleFiles.map((file) => toInsightFile(file, fileTiming)),
  );
  const oldestActiveModules = getOldestActiveModules(
    collectObservedFiles(repositoryData, healthByPath, fileTiming),
    repositoryData,
  );

  return {
    repositoryContext,
    mostModifiedFiles,
    deadAreas,
    engineeringHotspots: buildHotspots(mostModifiedFiles, highRiskFiles),
    oldestActiveModules,
    highRiskFiles,
    frequentlyChangingFiles,
  };
}

interface FileTiming {
  firstModifiedAt?: string;
}

function collectFileTiming(
  repositoryData: RepositoryEvidenceData,
): Map<string, FileTiming> {
  const timing = new Map<string, FileTiming>();
  for (const commit of repositoryData.commits ?? []) {
    const timestamp = Date.parse(commit.authoredAt);
    if (!Number.isFinite(timestamp)) continue;

    for (const path of commit.files) {
      const existing = timing.get(path);
      if (
        existing?.firstModifiedAt === undefined ||
        timestamp < Date.parse(existing.firstModifiedAt)
      ) {
        timing.set(path, { firstModifiedAt: commit.authoredAt });
      }
    }
  }
  return timing;
}

function toInsightFile(file: FileHealth, timing: Map<string, FileTiming>): InsightFile {
  return { ...file, firstModifiedAt: timing.get(file.path)?.firstModifiedAt };
}

function collectObservedFiles(
  repositoryData: RepositoryEvidenceData,
  healthByPath: Map<string, FileHealth>,
  timing: Map<string, FileTiming>,
): InsightFile[] {
  const observed = new Map<string, FileHealth>();
  for (const commit of repositoryData.commits ?? []) {
    for (const path of commit.files) {
      const existing = observed.get(path) ?? {
        path,
        modificationCount: 0,
        riskScore: healthByPath.get(path)?.riskScore ?? 0,
        sourceIds: [],
      };
      existing.modificationCount += 1;
      existing.sourceIds = [...new Set([...existing.sourceIds, `commit:${commit.id}`])].sort();
      if (
        !existing.lastModifiedAt ||
        Date.parse(commit.authoredAt) > Date.parse(existing.lastModifiedAt)
      ) {
        existing.lastModifiedAt = commit.authoredAt;
      }
      observed.set(path, existing);
    }
  }

  return [...observed.values()].map((file) => toInsightFile(file, timing));
}

function buildDeadAreas(files: InsightFile[]): DeadArea[] {
  const areas = new Map<string, DeadArea>();
  for (const file of files) {
    const path = getDirectory(file.path);
    const current = areas.get(path) ?? {
      path,
      fileCount: 0,
      sourceIds: [],
    };
    current.fileCount += 1;
    current.sourceIds = [...new Set([...current.sourceIds, ...file.sourceIds])].sort();
    if (
      file.lastModifiedAt &&
      (!current.lastModifiedAt ||
        Date.parse(file.lastModifiedAt) > Date.parse(current.lastModifiedAt))
    ) {
      current.lastModifiedAt = file.lastModifiedAt;
    }
    areas.set(path, current);
  }

  return [...areas.values()]
    .sort(
      (left, right) =>
        right.fileCount - left.fileCount || left.path.localeCompare(right.path),
    )
    .slice(0, MAX_RESULTS);
}

function getOldestActiveModules(
  files: InsightFile[],
  repositoryData: RepositoryEvidenceData,
): InsightFile[] {
  const latestTimestamp = Math.max(
    ...(repositoryData.commits ?? [])
      .map((commit) => Date.parse(commit.authoredAt))
      .filter(Number.isFinite),
  );
  if (!Number.isFinite(latestTimestamp)) return [];

  const cutoff = latestTimestamp - ACTIVE_HISTORY_DAYS * 24 * 60 * 60 * 1_000;
  return files
    .filter((file) => {
      const lastModified = file.lastModifiedAt
        ? Date.parse(file.lastModifiedAt)
        : Number.NaN;
      return Number.isFinite(lastModified) && lastModified >= cutoff;
    })
    .sort(
      (left, right) =>
        Date.parse(left.firstModifiedAt ?? "") -
          Date.parse(right.firstModifiedAt ?? "") ||
        left.path.localeCompare(right.path),
    )
    .slice(0, MAX_RESULTS);
}

function buildHotspots(
  mostModifiedFiles: InsightFile[],
  highRiskFiles: InsightFile[],
): EngineeringHotspot[] {
  const riskPaths = new Set(highRiskFiles.map((file) => file.path));
  return mostModifiedFiles.map((file) => ({
    ...file,
    summary: riskPaths.has(file.path)
      ? "High change frequency combined with risk-related history."
      : "High change frequency in the observed repository history.",
  }));
}

function getDirectory(path: string): string {
  const lastSlash = path.lastIndexOf("/");
  return lastSlash === -1 ? "repository root" : path.slice(0, lastSlash) || "repository root";
}
