import {
  getRepository,
  parseGitHubRepositoryUrl,
} from "@/lib/github/client";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/github";
import type {
  ImportRepositoryRequest,
  ImportRepositoryResponse,
} from "@/types/api";

const DEMO_USER_EMAIL = "demo@engineering-memory.local";

export async function POST(request: Request) {
  const body = await readRequestBody(request);
  if (!body) {
    return Response.json(
      { message: "Request body must contain a repositoryUrl." },
      { status: 400 },
    );
  }

  let reference;
  try {
    reference = parseGitHubRepositoryUrl(body.repositoryUrl);
  } catch (error) {
    return Response.json(
      { message: getErrorMessage(error) },
      { status: 400 },
    );
  }

  let session: Awaited<ReturnType<typeof getSession>> = null;
  try {
    session = await getSession(request);
  } catch {
    // Public URL imports do not require an authenticated session.
  }
  let githubRepository;
  try {
    githubRepository = await getRepository(reference, session?.githubAccessToken ?? undefined);
  } catch (error) {
    return Response.json(
      { message: getErrorMessage(error) },
      { status: 502 },
    );
  }

  let prisma;
  try {
    prisma = getPrisma();
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Repository imports are not configured." },
      { status: 503 },
    );
  }

  const user = session?.user ?? await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL }, update: {}, create: { email: DEMO_USER_EMAIL },
  });

  const repository = await prisma.repository.upsert({
    where: {
      userId_owner_name: {
        userId: user.id,
        owner: githubRepository.owner,
        name: githubRepository.name,
      },
    },
    update: {
      url: githubRepository.url,
      defaultBranch: githubRepository.defaultBranch,
    },
    create: {
      userId: user.id,
      owner: githubRepository.owner,
      name: githubRepository.name,
      url: githubRepository.url,
      defaultBranch: githubRepository.defaultBranch,
    },
  });

  const importJob = await prisma.importJob.create({
    data: { repositoryId: repository.id },
  });

  const response: ImportRepositoryResponse = {
    repositoryId: repository.id,
    importJobId: importJob.id,
    status: importJob.status,
    message: "Repository import queued.",
  };

  return Response.json(response, { status: 201 });
}

async function readRequestBody(
  request: Request,
): Promise<ImportRepositoryRequest | null> {
  try {
    const body: unknown = await request.json();
    const payload = body as Record<string, unknown>;

    if (
      typeof body !== "object" ||
      body === null ||
      typeof payload.repositoryUrl !== "string"
    ) {
      return null;
    }

    const repositoryUrl = payload.repositoryUrl.trim();
    return repositoryUrl ? { repositoryUrl } : null;
  } catch {
    return null;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Repository import could not be started.";
}
