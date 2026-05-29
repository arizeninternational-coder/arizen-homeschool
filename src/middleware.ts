import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
];

// Role-based path prefixes
const rolePaths: Record<string, string[]> = {
  ADMIN: ["/dashboard/admin"],
  PARENT: ["/dashboard/parent"],
  LEARNER: ["/dashboard/student"],
  TEACHER: ["/dashboard/student"],
};

/**
 * Read the session JWT directly from the cookie header.
 * This bypasses NextAuth's getToken() which fails on Vercel serverless.
 */
async function getUserFromCookie(req: NextRequest): Promise<{
  id: string;
  email: string;
  role: string;
  name: string;
} | null> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const isProduction = process.env.NODE_ENV === "production";

    // Try production cookie name first, then dev
    const cookieName = isProduction
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...rest] = c.trim().split("=");
        return [key.trim(), rest.join("=")];
      })
    );

    const token = cookies[cookieName] || cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];

    if (!token) return null;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );

    if (!payload.sub || !payload.role) return null;

    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: (payload.role as string).toUpperCase(),
      name: (payload.name as string) || "",
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/media") ||
    pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Allow API auth routes (login, register, session, logout, signout)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow health check, diagnostic, and dev endpoints
  if (pathname.startsWith("/api/health") || pathname.startsWith("/api/diagnostic") || pathname.startsWith("/api/dev")) {
    return NextResponse.next();
  }

  // Check auth for all other routes
  const user = await getUserFromCookie(req);

  if (!user) {
    // For API routes, return 401 JSON instead of redirect
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized — please log in" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    // For page routes, redirect to login
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users from /auth/* to their dashboard
  if (pathname.startsWith("/auth/")) {
    if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    } else if (user.role === "PARENT") {
      return NextResponse.redirect(new URL("/dashboard/parent", req.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard/student", req.url));
    }
  }

  // Check role-based access
  for (const [role, paths] of Object.entries(rolePaths)) {
    if (paths.some((p) => pathname.startsWith(p))) {
      if (user.role !== role) {
        if (user.role === "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        } else if (user.role === "PARENT") {
          return NextResponse.redirect(new URL("/dashboard/parent", req.url));
        } else {
          return NextResponse.redirect(new URL("/dashboard/student", req.url));
        }
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
