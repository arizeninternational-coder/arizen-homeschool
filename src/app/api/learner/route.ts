// GET /api/learner — Redirect to profile

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/api/learner/profile", req.url));
}
