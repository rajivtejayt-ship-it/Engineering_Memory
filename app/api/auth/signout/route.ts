import { NextResponse } from "next/server";
import { cookieOptions, getSession, SESSION_COOKIE } from "@/lib/auth/github";

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (session) await (await import("@/lib/prisma")).getPrisma().session.delete({ where: { id: session.id } });
  } catch {
    // Clearing the browser session is still the correct sign-out outcome.
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  return response;
}
