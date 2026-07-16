import {
  getRepository,
  parseGitHubRepositoryUrl,
} from "@/lib/github/client";
import { prisma } from "@/lib/prisma";
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

  let githubRepository;
  try {
    githubRepository = await getRepository(reference);
  } catch (error) {
    return Response.json(
      { message: getErrorMessage(error) },
      { status: 502 },
    );
  }

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: { email: DEMO_USER_EMAIL },
  });

  const repository = await prisma.repository.upsert({
    where: {
      userId_owner_name: {
        userId: demoUser.id,
        owner: githubRepository.owner,
        name: githubRepository.name,
      },
    },
    update: {
      url: githubRepository.url,
      defaultBranch: githubRepository.defaultBranch,
    },
    create: {
      userId: demoUser.id,
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
