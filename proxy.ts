import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic admin guard (Next.js 16 proxy). The authoritative check runs in
 * the /admin layout via supabase.auth.getUser().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.includes("auth-token") && c.value.length > 0);

  if (!hasAuthCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
