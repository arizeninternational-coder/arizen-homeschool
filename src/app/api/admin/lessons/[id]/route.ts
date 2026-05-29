// GET /api/admin/lessons/[id] — Get single lesson detail (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { data: lesson, error } = await supabase
      .from("Lesson")
      .select(`
        id,
        title,
        slug,
        description,
        status,
        orderIndex,
        xpReward,
        activityInstructions,
        question1,
        answer1,
        question2,
        answer2,
        question3,
        answer3,
        createdAt,
        updatedAt,
        quest:Quest(
          id,
          title,
          theme:Theme(
            id,
            title,
            grade
          )
        )
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }
      console.error("[ADMIN_LESSON_DETAIL] Error:", error.message);
      // If column doesn't exist, try with minimal columns
      if (error.message?.includes("does not exist")) {
        const { data: minimal, error: err2 } = await supabase
          .from("Lesson")
          .select("id, title, slug, description, status, orderIndex, xpReward, createdAt, updatedAt")
          .eq("id", params.id)
          .single();
        if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
        return NextResponse.json({ lesson: minimal });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lesson });
  } catch (err: any) {
    console.error("[ADMIN_LESSON_DETAIL] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch lesson" }, { status: 500 });
  }
}
