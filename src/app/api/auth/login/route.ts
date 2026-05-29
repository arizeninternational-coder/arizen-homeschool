// POST /api/auth/login — Custom login endpoint
// Bypasses NextAuth CSRF issues by handling credentials directly
// Sets the NextAuth session cookie manually
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
export const dynamic = "force-dynamic";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

async function createSessionToken(user: any) {
  const secret = new TextEncoder().encode(NEXTAUTH_SECRET);
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    guildId: user.guildId || null,
    guildSlug: user.guildSlug || null,
    learnerProfileId: user.learnerProfileId || null,
    grade: user.grade || null,
    displayName: user.displayName || null,
    totalXp: user.totalXp || 0,
    currentStreak: user.currentStreak || 0,
    avatarUrl: user.avatarUrl || null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  return token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user from Supabase
    console.log("[LOGIN_API] Querying Supabase for:", normalizedEmail);
    const { data: users, error: dbError } = await supabase
      .from("User")
      .select("id, name, email, image, role, passwordHash, guildId")
      .eq("email", normalizedEmail)
      .limit(1);
    
    console.log("[LOGIN_API] Supabase result:", { 
      hasError: !!dbError, 
      errorMessage: dbError?.message,
      usersCount: users?.length ?? 0,
      userId: users?.[0]?.id,
      hasHash: !!users?.[0]?.passwordHash
    });

    if (dbError) {
      console.error("[LOGIN_API] Supabase error:", dbError.message);
      return NextResponse.json(
        { error: "Login failed. Please try again." },
        { status: 500 }
      );
    }

    const user = users?.[0];
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Fetch guild slug
    let guildSlug = null;
    if (user.guildId) {
      const { data: guild } = await supabase
        .from("Guild")
        .select("slug")
        .eq("id", user.guildId)
        .single();
      guildSlug = guild?.slug || null;
    }

    // Fetch learner profile
    let learnerProfile = null;
    const userRole = (user.role || "").toUpperCase();
    if (userRole === "LEARNER" || userRole === "TEACHER") {
      const { data: profile } = await supabase
        .from("LearnerProfile")
        .select("id, grade, displayName, totalXp, currentStreak, avatarUrl")
        .eq("userId", user.id)
        .single();
      learnerProfile = profile;
    }

    // Create session token
    const sessionToken = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      guildId: user.guildId,
      guildSlug,
      learnerProfileId: learnerProfile?.id || null,
      grade: learnerProfile?.grade || null,
      displayName: learnerProfile?.displayName || null,
      totalXp: learnerProfile?.totalXp || 0,
      currentStreak: learnerProfile?.currentStreak || 0,
      avatarUrl: learnerProfile?.avatarUrl || null,
    });

    // Determine redirect URL based on role
    let redirectUrl = "/";
    const role = (user.role || "").toUpperCase();
    if (role === "ADMIN") {
      redirectUrl = "/dashboard/admin";
    } else if (role === "PARENT") {
      redirectUrl = "/dashboard/parent";
    } else {
      redirectUrl = "/dashboard/student";
    }

    // Build the response with session cookie set
    const isProduction = process.env.NODE_ENV === "production";
    const cookieName = isProduction
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    const response = NextResponse.json({
      ok: true,
      redirectUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isProduction,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    console.log("[LOGIN_API] Success:", user.email, "role:", user.role);
    return response;
  } catch (err: any) {
    console.error("[LOGIN_API] Critical error:", err?.message, err?.stack);
    return NextResponse.json(
      { error: "Login failed. Please try again.", details: err?.message },
      { status: 500 }
    );
  }
}

// GET — return 405 (use POST)
export function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
