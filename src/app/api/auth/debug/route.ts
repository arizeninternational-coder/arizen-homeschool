// GET /api/auth/debug — Debug endpoint to check what getToken returns
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const allCookies = req.cookies.getAll().map(c => c.name);

  const token = await getToken({ req, secret });

  return NextResponse.json({
    hasCookie: cookieHeader.length > 0,
    cookieNames: allCookies,
    hasSessionToken: allCookies.some(n => n.includes("session-token")),
    tokenSub: token?.sub || null,
    tokenEmail: token?.email || null,
    tokenRole: (token as any)?.role || null,
    tokenName: token?.name || null,
    fullToken: token ? Object.keys(token) : null,
  });
}
