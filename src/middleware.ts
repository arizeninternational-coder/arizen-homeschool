import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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

  // Allow API auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check auth for all other routes
  try {
    const token = await getToken({ req, secret });
    if (!token) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;

    // Check role-based access
    for (const [role, paths] of Object.entries(rolePaths)) {
      if (paths.some((p) => pathname.startsWith(p))) {
        if (userRole !== role) {
          // User is trying to access a role-specific page they don't have
          // Redirect to their correct dashboard
          if (userRole === "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard/admin", req.url));
          } else if (userRole === "PARENT") {
            return NextResponse.redirect(new URL("/dashboard/parent", req.url));
          } else {
            return NextResponse.redirect(new URL("/dashboard/student", req.url));
          }
        }
        break;
      }
    }
  } catch {
    // If auth check fails, allow request through
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
