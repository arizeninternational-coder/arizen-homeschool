// NextAuth catch-all — disabled in favor of custom auth routes
// All auth is now handled by:
//   POST /api/auth/login — Custom login (sets session cookie)
//   GET  /api/auth/session — Custom session (reads session cookie)
//   POST /api/auth/logout — Custom logout (clears session cookie)
//
// This file remains only because NextAuth is still imported by the login page's
// `signIn` / `signOut` from `next-auth/react`. We handle those client-side now.
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Not implemented. Use /api/auth/session or /api/auth/login." }, { status: 404 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Not implemented. Use /api/auth/login." }, { status: 404 });
}
