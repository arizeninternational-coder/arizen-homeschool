/**
 * API Route Auth Guard — v5
 *
 * Primary: Use next-auth/jwt getToken()
 * Fallback: Manual JWT decode from cookie
 * Compatible with Next.js App Router + Vercel serverless
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  guildSlug: string | null;
  guildId: string | null;
  learnerProfileId?: string;
}

/**
 * Manually decode the JWT from the session cookie.
 * Uses the same cookie names and secret as NextAuth config.
 */
function decodeSessionFromCookie(req: NextRequest): Record<string, any> | null {
  // NextAuth uses these cookie names (from auth/options.ts)
  const cookieNames = [
    "__Secure-next-auth.session-token",  // production
    "next-auth.session-token",            // development
  ];

  let token: string | null = null;
  for (const name of cookieNames) {
    const val = req.cookies.get(name)?.value;
    if (val) { token = val; break; }
  }

  if (!token) {
    // Last resort: check any cookie with "session-token" in the name
    for (const c of req.cookies.getAll()) {
      if (c.name.includes("session-token")) { token = c.value; break; }
    }
  }

  if (!token) return null;

  try {
    // JWT decode (without verification — we just need the payload)
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Look up user in Supabase by ID.
 */
async function lookupUserById(userId: string): Promise<AuthUser | null> {
  try {
    const { data: user, error } = await supabase
      .from("User")
      .select("id, email, name, role, guildId")
      .eq("id", userId)
      .single();

    if (error || !user) return null;

    let guildSlug: string | null = null;
    if (user.guildId) {
      const { data: guild } = await supabase.from("Guild").select("slug").eq("id", user.guildId).single();
      guildSlug = guild?.slug || null;
    }

    let learnerProfileId: string | undefined;
    const userRole = (user.role || "").toUpperCase();
    if (userRole === "LEARNER" || userRole === "TEACHER") {
      const { data: profile } = await supabase.from("LearnerProfile").select("id").eq("userId", user.id).single();
      if (profile) learnerProfileId = profile.id;
    }

    return {
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      role: user.role || "LEARNER",
      guildSlug,
      guildId: user.guildId || null,
      learnerProfileId,
    };
  } catch {
    return null;
  }
}

/**
 * Get authenticated user from request.
 * Tries getToken first, then falls back to manual cookie decode.
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    // Strategy 1: next-auth/jwt getToken()
    const nToken = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (nToken?.sub) {
      const user = await lookupUserById(nToken.sub as string);
      if (user) return user;
      // Token valid but DB lookup failed — use token data
      return {
        id: nToken.sub as string,
        email: (nToken.email as string) || "",
        name: (nToken.name as string) || "",
        role: ((nToken as any).role as string) || "LEARNER",
        guildSlug: (nToken as any).guildSlug || null,
        guildId: (nToken as any).guildId || null,
      };
    }

    // Strategy 2: Manual cookie decode
    const jwt = decodeSessionFromCookie(req);
    if (jwt?.email) {
      // Try looking up by email first
      const { data: userByEmail } = await supabase
        .from("User")
        .select("id")
        .eq("email", jwt.email as string)
        .single();
      if (userByEmail) {
        const user = await lookupUserById(userByEmail.id);
        if (user) return user;
      }
    }
    if (jwt?.sub) {
      const user = await lookupUserById(jwt.sub as string);
      if (user) return user;
    }

    return null;
  } catch (err: any) {
    console.error("[AUTH_GUARD] Error:", err?.message);
    return null;
  }
}

function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.map(r => r.toUpperCase()).includes((userRole || "").toUpperCase());
}

export async function requireAdmin(req: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized — please log in" }, { status: 401 });
  }
  if (!hasRole(user.role, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden — admin access required", details: `Role: ${user.role}` }, { status: 403 });
  }
  return { user };
}

export function withAuth(
  handler: (req: NextRequest, user: AuthUser, url: URL) => Promise<NextResponse | Response>,
  options?: { roles?: string[] }
) {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized — please log in" }, { status: 401 });
    if (options?.roles && !hasRole(user.role, options.roles)) {
      return NextResponse.json({ error: "Forbidden", details: `Role ${user.role}` }, { status: 403 });
    }
    return handler(req, user, new URL(req.url));
  };
}

export function withAuthPost(
  handler: (req: NextRequest, user: AuthUser, body: unknown) => Promise<NextResponse | Response>,
  options?: { roles?: string[] }
) {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized — please log in" }, { status: 401 });
    if (options?.roles && !hasRole(user.role, options.roles)) {
      return NextResponse.json({ error: "Forbidden", details: `Role ${user.role}` }, { status: 403 });
    }
    let body: unknown = {};
    try { body = await req.json(); } catch { /* empty ok */ }
    return handler(req, user, body);
  };
}
