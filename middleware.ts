import { NextRequest, NextResponse } from "next/server";

/**
 * Root URL ("/") serves two different things depending on auth, like github.com/ does:
 * the public landing page when logged out, the learner dashboard home when logged in —
 * same URL, no /dashboard redirect dance, no client-side flash while auth resolves.
 *
 * `refreshToken` is the httpOnly session cookie set by app/api/internal/auth/login and
 * refresh (see auth.service.ts). Its presence is only an optimistic "likely signed in"
 * signal, not a validated session — ProtectedLayout still runs initializeSession() on
 * the rewritten page and bounces to /sign if it turns out to be stale, exactly as it
 * already does for every other authenticated route on a hard refresh.
 */
export function middleware(request: NextRequest) {
  const isPublicOverride = request.nextUrl.searchParams.get("public") === "true";
  const hasSession = request.cookies.has("refreshToken");

  if (hasSession && !isPublicOverride) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
