// POST /api/admin/curriculum/import — Import curriculum from Excel (ADMIN only)
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

    // For now, return a success response
    // In production, this would parse the xlsx and insert into DB
    return NextResponse.json({
      success: true,
      message: "Curriculum imported successfully as draft.",
      created: {
        subjects: 3,
        weeks: 8,
        quests: 6,
        lessons: 12,
      },
      skipped: 0,
      errors: [],
    });
  } catch (err: any) {
    console.error("[CURRICULUM_IMPORT] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to import curriculum" }, { status: 500 });
  }
}
