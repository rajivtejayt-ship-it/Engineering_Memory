import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/github";

interface GitHubTreeItem { path: string; type: "blob" | "tree"; }

export async function GET(request: Request) {
  const repository = new URL(request.url).searchParams.get("repository");
  if (!repository || !/^[^/]+\/[^/]+$/.test(repository)) return NextResponse.json({ message: "Choose a GitHub repository first." }, { status: 400 });
  try {
    const session = await getSession(request);
    const response = await fetch(`https://api.github.com/repos/${repository}/git/trees/HEAD?recursive=1`, { headers: { Accept: "application/vnd.github+json", ...(session?.githubAccessToken ? { Authorization: `Bearer ${session.githubAccessToken}` } : {}) } });
    const payload = await response.json() as { tree?: unknown };
    if (response.status === 404) return NextResponse.json({ message: "Repository was not found, or it is private. Connect GitHub to access private repositories." }, { status: 404 });
    if (!response.ok || !Array.isArray(payload.tree)) return NextResponse.json({ message: "Repository files could not be loaded." }, { status: 502 });
    const files = payload.tree.filter(isTreeItem).filter((item) => item.type === "blob").slice(0, 300).map((item) => item.path);
    return NextResponse.json({ files });
  } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Repository files could not be loaded." }, { status: 500 }); }
}

function isTreeItem(value: unknown): value is GitHubTreeItem { return Boolean(value) && typeof value === "object" && typeof (value as Record<string, unknown>).path === "string" && ((value as Record<string, unknown>).type === "blob" || (value as Record<string, unknown>).type === "tree"); }
