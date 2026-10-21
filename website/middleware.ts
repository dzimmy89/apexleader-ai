import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSession, COOKIE_NAME } from "@/lib/auth/admin-session-cookie";
import { safeAdminNextPath } from "@/lib/auth/admin-next-path";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/admin/login") ||
    pathname === "/api/admin/login/google"
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/internal")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/lead") || pathname.startsWith("/api/health")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/unsubscribe")) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi =
    pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifyAdminSession(token);

  if (!session.valid) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", safeAdminNextPath(pathname));
    return NextResponse.redirect(login);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin", "/api/admin/:path*"],
};
