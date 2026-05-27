import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";
  
  return NextResponse.json({
    secretLength: secret.length,
    secretPrefix: secret.substring(0, 8),
    secretSuffix: secret.substring(secret.length - 4),
    isDefault: secret === "arizen-dev-secret-change-in-production",
    nextauthUrl: process.env.NEXTAUTH_URL,
  });
}
