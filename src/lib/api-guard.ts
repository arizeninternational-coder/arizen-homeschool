/**
 * API Route Auth Guard
 * 
 * Wraps API route handlers to verify NextAuth session tokens
 * and optionally enforce role-based access control.
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "PARENT" | "LEARNER";
  guildSlug: string | null;
  learnerProfileId?: string;
}

/**
 * Extract authenticated user from the request.
 * Returns null if no valid session.
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token?.email) return null;

    const { data: user, error } = await supabase
      .from("User")
      .select("id, email, name, role, guildSlug")
      .eq("email", token.email as string)
      .single();

    if (error || !user) return null;

    // For learners, also fetch their LearnerProfile id
    if (user.role === "LEARNER") {
      const { data: profile } = await supabase
        .from("LearnerProfile")
        .select("id")
        .eq("userId", user.id)
        .single();
      if (profile) {
        return { ...user, learnerProfileId: profile.id };
      }
    }

    return user as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Wrap a GET handler with auth + optional role check.
 */
export function withAuth(
  handler: (req: NextRequest, user: AuthUser, url: URL) => Promise<NextResponse | Response>,
  options?: { roles?: AuthUser["role"][] }
) {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized — please log in" },
        { status: 401 }
      );
    }

    if (options?.roles && !options.roles.includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden — insufficient permissions" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    return handler(req, user, url);
  };
}

/**
 * Wrap a POST handler with auth + optional role check.
 */
export function withAuthPost(
  handler: (req: NextRequest, user: AuthUser, body: unknown) => Promise<NextResponse | Response>,
  options?: { roles?: AuthUser["role"][] }
) {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized — please log in" },
        { status: 401 }
      );
    }

    if (options?.roles && !options.roles.includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden — insufficient permissions" },
        { status: 403 }
      );
    }

    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      // empty body is fine for some POSTs
    }

    return handler(req, user, body);
  };
}
