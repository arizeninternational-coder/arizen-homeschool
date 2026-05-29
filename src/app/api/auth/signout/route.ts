// POST /api/auth/signout — Handle next-auth/react signOut() requests
// Clears the session cookie and redirects to home
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === "production";
  
  const response = NextResponse.json({ ok: true, url: "/" });
  
  // Clear session cookies
  for (const name of ["__Secure-next-auth.session-token", "next-auth.session-token"]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isProduction,
      maxAge: 0,
    });
  }
  return response;
}

export async function GET(req: NextRequest) {
  return POST(req);
}
