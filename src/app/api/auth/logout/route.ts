// POST /api/auth/logout — Custom logout that clears the session cookie
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieName = isProduction
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const response = NextResponse.json({ ok: true, redirectUrl: "/" });
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProduction,
    maxAge: 0,
  });
  // Also clear any callbackUrl cookies
  response.cookies.set("__Secure-next-auth.callback-url", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProduction,
    maxAge: 0,
  });
  return response;
}

export function GET(req: NextRequest) {
  // Support GET for compatibility
  return POST(req);
}
