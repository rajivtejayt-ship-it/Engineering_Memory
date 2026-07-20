import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/github";

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session?.githubAccessToken) return NextResponse.json({ message: "Connect GitHub to browse private repositories." }, { status: 401 });
    const response = await fetch("https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&per_page=100&sort=updated", { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${session.githubAccessToken}`, "X-GitHub-Api-Version": "2022-11-28" } });
    const payload = await response.json() as unknown;
    if (!response.ok || !Array.isArray(payload)) return NextResponse.json({ message: "GitHub repositories could not be loaded." }, { status: 502 });
    return NextResponse.json({ repositories: payload.filter(isRepository).map((repository) => ({ id: repository.id, fullName: repository.full_name, url: repository.html_url, description: repository.description, private: repository.private, updatedAt: repository.updated_at, owner: repository.owner.login })) });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "GitHub repositories could not be loaded." }, { status: 500 });
  }
}

function isRepository(value: unknown): value is { id: number; full_name: string; html_url: string; description: string | null; private: boolean; updated_at: string; owner: { login: string } } {
  if (!value || typeof value !== "object") return false;
  const repository = value as Record<string, unknown>;
  return typeof repository.id === "number" && typeof repository.full_name === "string" && typeof repository.html_url === "string" && (typeof repository.description === "string" || repository.description === null) && typeof repository.private === "boolean" && typeof repository.updated_at === "string" && typeof repository.owner === "object" && repository.owner !== null && typeof (repository.owner as Record<string, unknown>).login === "string";
}
