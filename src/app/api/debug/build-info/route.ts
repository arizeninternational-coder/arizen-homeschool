// GET /api/debug/build-info — Returns deployment metadata for verification
// Safe: does not expose secrets, only commit/branch/timestamp
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || "local",
    branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || "local",
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    buildTime: process.env.VERCEL_BUILD_TIME || new Date().toISOString(),
    deploymentUrl: process.env.VERCEL_URL || "local",
    app: "arizen-homeschool",
    marker: "eb0c9eb-gold-polish",
  });
}
