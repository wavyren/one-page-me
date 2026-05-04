import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // OAuth callback fallback: if Supabase redirects to root with code,
  // forward to the proper callback handler
  if (pathname === "/" && searchParams.has("code")) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    return NextResponse.redirect(callbackUrl);
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoutes = ["/chat", "/profile"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isLoginPage = pathname === "/login";

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|static|.*\\..*).*)"],
};
