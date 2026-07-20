import { randomBytes } from "node:crypto";
import { getPrisma } from "@/lib/prisma";

const SESSION_COOKIE = "engineering_memory_session";
const OAUTH_STATE_COOKIE = "engineering_memory_oauth_state";
const GITHUB_API_URL = "https://api.github.com";

export interface GitHubAccount {
  login: string;
  email: string;
  accessToken: string;
}

export function getGitHubAuthorizationUrl(origin: string): { url: string; state: string } {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) throw new Error("GitHub sign-in is not configured.");
  const state = randomBytes(24).toString("hex");
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${origin}/api/auth/github/callback`);
  url.searchParams.set("scope", "read:user user:email repo");
  url.searchParams.set("state", state);
  return { url: url.toString(), state };
}

export async function exchangeGitHubCode(code: string, origin: string): Promise<GitHubAccount> {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("GitHub sign-in is not configured.");
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: `${origin}/api/auth/github/callback` }),
  });
  const token = await tokenResponse.json() as { access_token?: unknown };
  if (!tokenResponse.ok || typeof token.access_token !== "string") throw new Error("GitHub sign-in could not be completed.");
  const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${token.access_token}` };
  const profileResponse = await fetch(`${GITHUB_API_URL}/user`, { headers });
  const profile = await profileResponse.json() as { login?: unknown; email?: unknown };
  if (!profileResponse.ok || typeof profile.login !== "string") throw new Error("GitHub profile could not be read.");
  let email = typeof profile.email === "string" ? profile.email : "";
  if (!email) {
    const emailsResponse = await fetch(`${GITHUB_API_URL}/user/emails`, { headers });
    const emails = await emailsResponse.json() as Array<{ email?: unknown; primary?: unknown; verified?: unknown }>;
    const primary = Array.isArray(emails) ? emails.find((item) => item.primary === true && item.verified === true) : undefined;
    email = typeof primary?.email === "string" ? primary.email : `${profile.login}@users.noreply.github.com`;
  }
  return { login: profile.login, email, accessToken: token.access_token };
}

export async function createSession(account: GitHubAccount): Promise<string> {
  const prisma = getPrisma();
  const user = await prisma.user.upsert({
    where: { email: account.email },
    update: { githubLogin: account.login },
    create: { email: account.email, githubLogin: account.login },
  });
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({ data: { token, userId: user.id, githubAccessToken: account.accessToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
  return token;
}

export async function getSession(request: Request) {
  const token = getCookie(request.headers.get("cookie"), SESSION_COOKIE);
  if (!token) return null;
  const session = await getPrisma().session.findUnique({ where: { token }, include: { user: true } });
  return session && session.expiresAt > new Date() ? session : null;
}

export function cookieOptions(maxAge: number) { return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge }; }
export { OAUTH_STATE_COOKIE, SESSION_COOKIE };
export function getCookie(header: string | null, name: string) { return header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1); }
