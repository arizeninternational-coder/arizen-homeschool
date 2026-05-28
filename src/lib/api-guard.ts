/**
 * API Route Auth Guard — v6
 *
 * Reads the NextAuth session by directly parsing the cookie header.
 * Works reliably on Vercel serverless where getToken() can fail.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
 * Decode a JWT payload without verification.
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
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
 * Extract session from cookie header directly.
 * Works on Vercel serverless where req.cookies may not work.
 */
function getSessionFromCookie(req: NextRequest): Record<string, any> | null {
  // Try req.cookies first (works in most environments)
  const cookieNames = [
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];

  for (const name of cookieNames) {
    const val = req.cookies.get(name)?.value;
    if (val) {
      const payload = decodeJwtPayload(val);
      if (payload) return payload;
    }
  }

  // Fallback: parse from Cookie header directly (Vercel serverless)
  const cookieHeader = req.headers.get("cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawVal] = part.split("=");
    const name = rawName.trim();
    if (name.includes("session-token")) {
      const val = rawVal.join("=").trim();
      if (val) {
        const payload = decodeJwtPayload(val);
        if (payload) return payload;
      }
    }
  }

  return null;
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
 * Look up user in Supabase by email.
 */
async function lookupUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    const { data: user, error } = await supabase
      .from("User")
      .select("id, email, name, role, guildId")
      .eq("email", email)
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
      email: user.email || email,
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
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    const jwt = getSessionFromCookie(req);
    if (!jwt) {
      console.log("[AUTH_GUARD] No session found in cookies");
      return null;
    }

    console.log("[AUTH_GUARD] JWT payload:", { sub: jwt.sub, email: jwt.email, name: jwt.name });

    // Strategy 1: Look up by user ID (sub)
    if (jwt.sub) {
      const user = await lookupUserById(jwt.sub as string);
      if (user) {
        console.log("[AUTH_GUARD] Found user by ID:", user.email, "role:", user.role);
        return user;
      }
    }

    // Strategy 2: Look up by email
    if (jwt.email) {
      const user = await lookupUserByEmail(jwt.email as string);
      if (user) {
        console.log("[AUTH_GUARD] Found user by email:", user.email, "role:", user.role);
        return user;
      }
    }

    // Strategy 3: Construct from JWT claims (last resort)
    return {
      id: (jwt.sub as string) || "",
      email: (jwt.email as string) || "",
      name: (jwt.name as string) || "",
      role: ((jwt as any).role as string) || "LEARNER",
      guildSlug: null,
      guildId: null,
    };
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
    return NextResponse.json({ error: "Forbidden", details: "Role: " + user.role }, { status: 403 });
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
      return NextResponse.json({ error: "Forbidden", details: "Role: " + user.role }, { status: 403 });
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
      return NextResponse.json({ error: "Forbidden", details: "Role: " + user.role }, { status: 403 });
    }
    let body: unknown = {};
    try { body = await req.json(); } catch { /* ok */ }
    return handler(req, user, body);
  };
}
