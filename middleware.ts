import { type NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/chat", "/profile"];
// Routes that should redirect authenticated users
const authRoutes = ["/login"];

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Skip RSC requests to avoid redirect loops
  const isRSC = request.headers.get("rsc") === "1";
  if (isRSC) {
    return response;
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // TEMP: Edge Runtime auth detection is unreliable.
  // Let pages handle their own auth redirects for now.
  // Phase 7 will add proper permission gating.

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|static|.*\\..*).*)"],
};
