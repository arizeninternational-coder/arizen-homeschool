// GET /api/auth/me — Return the current session user info for debugging
// This endpoint is used by the frontend to verify auth state and role
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(request: NextRequest) {
  try {
    console.log("[AUTH_ME] Request URL:", request.url);
    console.log("[AUTH_ME] Cookie header:", request.headers.get("cookie") ? "PRESENT" : "MISSING");

    // Use getToken which handles all cookie name variations automatically
    const token = await getToken({ req: request, secret });
    
    console.log("[AUTH_ME] getToken result:", token ? `sub=${token.sub}, email=${token.email}, role=${(token as any).role}` : "null");

    if (!token?.sub) {
      console.log("[AUTH_ME] No valid token, returning 401");
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Look up full user info from Supabase by ID
    const { data: user, error } = await supabase
      .from("User")
      .select("id, name, email, role, guildId")
      .eq("id", token.sub)
      .single();

    if (error || !user) {
      console.log("[AUTH_ME] User lookup failed:", error?.message || "no user");
      // Return partial info from token at least
      return NextResponse.json({
        authenticated: true,
        user: {
          id: token.sub,
          name: token.name || null,
          email: token.email || null,
          role: (token as any).role || null,
          guildId: (token as any).guildId || null,
          guildSlug: (token as any).guildSlug || null,
          _source: "token_only_db_lookup_failed",
        },
      });
    }

    // Fetch guild slug
    let guildSlug: string | null = null;
    if (user.guildId) {
      const { data: guild } = await supabase
        .from("Guild")
        .select("slug")
        .eq("id", user.guildId)
        .single();
      guildSlug = guild?.slug || null;
    }

    // Check for learner profile
    let learnerProfileId: string | null = null;
    let grade: number | null = null;
    const userRole = (user.role || "").toUpperCase();
    if (userRole === "LEARNER" || userRole === "TEACHER") {
      const { data: profile } = await supabase
        .from("LearnerProfile")
        .select("id, grade")
        .eq("userId", user.id)
        .single();
      if (profile) {
        learnerProfileId = profile.id;
        grade = profile.grade;
      }
    }

    console.log("[AUTH_ME] Returning full user info:", { id: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        guildId: user.guildId,
        guildSlug,
        learnerProfileId,
        grade,
        // Also include token-level data for debugging
        _tokenRole: (token as any).role || null,
      },
    });
  } catch (err: any) {
    console.error("[AUTH_ME] Error:", err?.message || err);
    return NextResponse.json({ authenticated: false, error: "Internal error" }, { status: 500 });
  }
}
