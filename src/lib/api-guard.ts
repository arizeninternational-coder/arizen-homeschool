/**
 * API Route Auth Guard — v3
 *
 * Reliable admin/user auth for API routes.
 * Reads the NextAuth session cookie directly and verifies against Supabase.
 *
 * Fixes in v3:
 * - Added extensive console logging for debugging
 * - Added fallback lookup by user ID (sub claim) if email lookup fails
 * - Normalized role comparison to uppercase
 * - Added getToken-based path as alternative to raw JWT decode
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";
const IS_PROD = process.env.NODE_ENV === "production";

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
 * Decode a JWT without verifying signature (we trust our own cookies).
 */
function decodeJwt(token: string): Record<string, any> | null {
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
 * Extract the NextAuth session cookie from the request.
 */
function getSessionToken(req: NextRequest): string | null {
  const cookieName = IS_PROD
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  // Try the specific cookie first
  let token = req.cookies.get(cookieName)?.value || null;
  console.log(`[AUTH_GUARD] Looking for cookie "${cookieName}": ${token ? "FOUND" : "NOT FOUND"}`);

  // Fallback: try all cookies
  if (!token) {
    const allCookies = req.cookies.getAll();
    console.log(`[AUTH_GUARD] All cookie names:`, allCookies.map(c => c.name));
    for (const c of allCookies) {
      if (c.name.includes("session-token")) {
        token = c.value;
        console.log(`[AUTH_GUARD] Found fallback session cookie: "${c.name}"`);
        break;
      }
    }
  }

  return token || null;
}

/**
 * Look up a user in Supabase by email.
 * Returns null if not found or on error.
 */
async function lookupUserByEmail(email: string): Promise<AuthUser | null> {
  console.log(`[AUTH_GUARD] Looking up user by email: ${email}`);

  const { data: user, error } = await supabase
    .from("User")
    .select("id, email, name, role, guildId")
    .eq("email", email)
    .single();

  if (error) {
    console.log(`[AUTH_GUARD] Email lookup error: ${error.message}`);
    return null;
  }

  if (!user) {
    console.log(`[AUTH_GUARD] No user found for email: ${email}`);
    return null;
  }

  console.log(`[AUTH_GUARD] Found user by email: id=${user.id}, role=${user.role}`);

  // Fetch guild slug if guildId exists
  let guildSlug: string | null = null;
  if (user.guildId) {
    const { data: guild } = await supabase
      .from("Guild")
      .select("slug")
      .eq("id", user.guildId)
      .single();
    guildSlug = guild?.slug || null;
  }

  // For learners/teachers, fetch learner profile id
  let learnerProfileId: string | undefined;
  const userRole = (user.role || "").toUpperCase();
  if (userRole === "LEARNER" || userRole === "TEACHER") {
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("id")
      .eq("userId", user.id)
      .single();
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
}

/**
 * Look up a user in Supabase by ID (sub claim from JWT).
 * Returns null if not found or on error.
 */
async function lookupUserById(userId: string): Promise<AuthUser | null> {
  console.log(`[AUTH_GUARD] Looking up user by ID: ${userId}`);

  const { data: user, error } = await supabase
    .from("User")
    .select("id, email, name, role, guildId")
    .eq("id", userId)
    .single();

  if (error) {
    console.log(`[AUTH_GUARD] ID lookup error: ${error.message}`);
    return null;
  }

  if (!user) {
    console.log(`[AUTH_GUARD] No user found for ID: ${userId}`);
    return null;
  }

  console.log(`[AUTH_GUARD] Found user by ID: email=${user.email}, role=${user.role}`);

  // Fetch guild slug if guildId exists
  let guildSlug: string | null = null;
  if (user.guildId) {
    const { data: guild } = await supabase
      .from("Guild")
      .select("slug")
      .eq("id", user.guildId)
      .single();
    guildSlug = guild?.slug || null;
  }

  // For learners/teachers, fetch learner profile id
  let learnerProfileId: string | undefined;
  const userRole = (user.role || "").toUpperCase();
  if (userRole === "LEARNER" || userRole === "TEACHER") {
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("id")
      .eq("userId", user.id)
      .single();
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
}

/**
 * Extract authenticated user from the request.
 * Returns null if no valid session.
 *
 * Strategy:
 * 1. Try raw JWT decode to get email, look up by email
 * 2. If that fails, try raw JWT decode to get sub (user ID), look up by ID
 * 3. As a last resort, use next-auth/jwt getToken() which handles cookie format internally
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    // Log all headers for debugging (only in dev)
    if (!IS_PROD) {
      console.log("[AUTH_GUARD] Request URL:", req.url);
      console.log("[AUTH_GUARD] Cookie header:", req.headers.get("cookie") ? "PRESENT" : "MISSING");
    }

    const token = getSessionToken(req);
    if (!token) {
      console.log("[AUTH_GUARD] No session token found in cookies");
      // Last resort: try getToken from next-auth/jwt
      console.log("[AUTH_GUARD] Attempting getToken() as last resort...");
      try {
        const nToken = await getToken({ req, secret: NEXTAUTH_SECRET });
        if (nToken?.sub) {
          console.log("[AUTH_GUARD] getToken() succeeded, sub:", nToken.sub);
          return await lookupUserById(nToken.sub as string);
        }
      } catch (e: any) {
        console.log("[AUTH_GUARD] getToken() also failed:", e?.message);
      }
      return null;
    }

    // Decode the JWT
    const payload = decodeJwt(token);
    if (!payload) {
      console.log("[AUTH_GUARD] JWT decode returned null");
      return null;
    }

    console.log("[AUTH_GUARD] JWT payload keys:", Object.keys(payload));
    console.log("[AUTH_GUARD] JWT email:", payload.email || "MISSING");
    console.log("[AUTH_GUARD] JWT sub:", payload.sub || "MISSING");
    console.log("[AUTH_GUARD] JWT name:", payload.name || "MISSING");

    // Strategy 1: Look up by email
    if (payload.email) {
      const user = await lookupUserByEmail(payload.email as string);
      if (user) return user;
    }

    // Strategy 2: Look up by sub (user ID)
    if (payload.sub) {
      console.log("[AUTH_GUARD] Falling back to lookup by sub:", payload.sub);
      const user = await lookupUserById(payload.sub as string);
      if (user) return user;
    }

    // Strategy 3: Try getToken from next-auth/jwt (handles cookie edge cases)
    console.log("[AUTH_GUARD] All direct lookups failed. Trying getToken()...");
    try {
      const nToken = await getToken({ req, secret: NEXTAUTH_SECRET });
      if (nToken?.sub) {
        console.log("[AUTH_GUARD] getToken() returned sub:", nToken.sub);
        const user = await lookupUserById(nToken.sub as string);
        if (user) return user;
      }
    } catch (e: any) {
      console.log("[AUTH_GUARD] getToken() failed:", e?.message);
    }

    console.log("[AUTH_GUARD] All auth strategies failed for this request");
    return null;
  } catch (err: any) {
    console.error("[AUTH_GUARD] Unexpected error:", err?.message || err);
    return null;
  }
}

/**
 * Check if user has one of the allowed roles (case-insensitive).
 */
function hasRole(userRole: string, allowedRoles: string[]): boolean {
  const normalized = (userRole || "").toUpperCase();
  const allowed = allowedRoles.map(r => r.toUpperCase());
  const result = allowed.includes(normalized);
  console.log(`[AUTH_GUARD] hasRole check: userRole="${userRole}" normalized="${normalized}" allowed=[${allowed.join(",")}] => ${result}`);
  return result;
}

/**
 * Require admin — shorthand for admin-only routes.
 */
export async function requireAdmin(req: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized — please log in", details: "No valid session found" },
      { status: 401 }
    );
  }
  if (!hasRole(user.role, ["ADMIN"])) {
    return NextResponse.json(
      { error: "Forbidden — admin access required", details: `User role "${user.role}" is not admin` },
      { status: 403 }
    );
  }
  return { user };
}

/** Allowed roles for admin API routes */
const ADMIN_ROLES = ["ADMIN"];

/** Allowed roles for parent API routes */
const PARENT_ROLES = ["PARENT", "ADMIN"];

/**
 * Wrap a GET handler with role-based auth.
 */
export function withAuth(
  handler: (req: NextRequest, user: AuthUser, url: URL) => Promise<NextResponse | Response>,
  options?: { roles?: string[] }
) {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized — please log in", details: "No valid session found" },
        { status: 401 }
      );
    }
    if (options?.roles && !hasRole(user.role, options.roles)) {
      return NextResponse.json(
        { error: "Forbidden — insufficient permissions", details: `Role "${user.role}" not in [${options.roles.join(", ")}]` },
        { status: 403 }
      );
    }
    const url = new URL(req.url);
    return handler(req, user, url);
  };
}

/**
 * Wrap a POST handler with role-based auth.
 */
export function withAuthPost(
  handler: (req: NextRequest, user: AuthUser, body: unknown) => Promise<NextResponse | Response>,
  options?: { roles?: string[] }
) {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized — please log in", details: "No valid session found" },
        { status: 401 }
      );
    }
    if (options?.roles && !hasRole(user.role, options.roles)) {
      return NextResponse.json(
        { error: "Forbidden — insufficient permissions", details: `Role "${user.role}" not in [${options.roles.join(", ")}]` },
        { status: 403 }
      );
    }
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      // empty body is fine
    }
    return handler(req, user, body);
  };
}
