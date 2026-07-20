import { NextRequest, NextResponse } from "next/server";
import { cookieOptions, getGitHubAuthorizationUrl, OAUTH_STATE_COOKIE } from "@/lib/auth/github";

export function GET(request: NextRequest) {
  try {
    const { url, state } = getGitHubAuthorizationUrl(request.nextUrl.origin);
    const response = NextResponse.redirect(url);
    response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions(10 * 60));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub sign-in is unavailable.";
    return NextResponse.redirect(new URL(`/import?error=${encodeURIComponent(message)}`, request.url));
  }
}
