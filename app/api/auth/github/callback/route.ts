import { NextRequest, NextResponse } from "next/server";
import { cookieOptions, createSession, exchangeGitHubCode, OAUTH_STATE_COOKIE, SESSION_COOKIE } from "@/lib/auth/github";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state || state !== request.cookies.get(OAUTH_STATE_COOKIE)?.value) return NextResponse.redirect(new URL("/import?error=GitHub+sign-in+could+not+be+verified.", request.url));
  try {
    const token = await createSession(await exchangeGitHubCode(code, request.nextUrl.origin));
    const response = NextResponse.redirect(new URL("/repositories/pick", request.url));
    response.cookies.set(SESSION_COOKIE, token, cookieOptions(30 * 24 * 60 * 60));
    response.cookies.set(OAUTH_STATE_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub sign-in could not be completed.";
    return NextResponse.redirect(new URL(`/import?error=${encodeURIComponent(message)}`, request.url));
  }
}
