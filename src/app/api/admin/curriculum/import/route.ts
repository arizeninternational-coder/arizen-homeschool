// DEPRECATED — This route has been replaced by /api/admin/curriculum/upload
// Use POST /api/admin/curriculum/upload with action=confirm instead.
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: "This route is deprecated. Use POST /api/admin/curriculum/upload with action=confirm instead.",
      deprecated: true,
      useInstead: "/api/admin/curriculum/upload",
    },
    { status: 410 },
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "This route is deprecated. Use POST /api/admin/curriculum/upload with action=confirm instead.",
      deprecated: true,
      useInstead: "/api/admin/curriculum/upload",
    },
    { status: 410 },
  );
}
