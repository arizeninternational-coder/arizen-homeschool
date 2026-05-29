// GET /api/admin/curriculum/preview — Preview Excel import (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // For now, return a mock preview since we'd need xlsx parsing library
    // In production, use the 'xlsx' or 'exceljs' npm package to parse
    const preview = {
      levels: 2,
      subjects: 3,
      weeks: 8,
      quests: 6,
      lessons: 12,
      questLessonLinks: 12,
      errors: [] as string[],
      duplicates: 0,
      toCreate: 12,
      fileName: file.name,
      fileSize: file.size,
    };

    return NextResponse.json(preview);
  } catch (err: any) {
    console.error("[CURRICULUM_PREVIEW] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to parse file" }, { status: 500 });
  }
}
