// GET /api/auth/session — Custom session endpoint
// Reads the session cookie directly without relying on NextAuth's getToken()
// which fails on Vercel serverless.
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getSessionToken(req: NextRequest): string | null {
  // Try standard cookie names
  const names = [
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  for (const name of names) {
    const val = req.cookies.get(name)?.value;
    if (val) return val;
  }
  // Fallback: parse Cookie header
  const cookieHeader = req.headers.get("cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawVal] = part.split("=");
    const name = rawName.trim();
    if (name.includes("session-token")) {
      return rawVal.join("=").trim() || null;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req);
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return NextResponse.json({ user: null });
    }

    // Build session response matching next-auth format
    return NextResponse.json({
      user: {
        id: payload.sub || null,
        name: payload.name || null,
        email: payload.email || null,
        image: payload.image || null,
        role: payload.role || "LEARNER",
        guildId: payload.guildId || null,
        guildSlug: payload.guildSlug || null,
        learnerProfileId: payload.learnerProfileId || null,
        grade: payload.grade || null,
        displayName: payload.displayName || null,
        totalXp: payload.totalXp || 0,
        currentStreak: payload.currentStreak || 0,
        avatarUrl: payload.avatarUrl || null,
      },
      expires: payload.exp
        ? new Date(payload.exp * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err: any) {
    console.error("[SESSION] Error:", err);
    return NextResponse.json({ user: null });
  }
}
