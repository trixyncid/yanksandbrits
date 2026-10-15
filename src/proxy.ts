import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Old /id/... and /en/... addresses are redirected in next.config.ts before reaching here.

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Optimistic check on the cookie only. Pages and actions verify the session against the database.
    const signedIn = Boolean(getSessionCookie(request));
    const onLogin = pathname === "/admin/login";
    if (!signedIn && !onLogin) {
      const url = new URL("/admin/login", request.url);
      if (pathname !== "/admin") url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return handleI18n(request);
}

export const config = {
  matcher: ["/((?!api|media/|_next/static|_next/image|.*\\..*).*)"],
};
