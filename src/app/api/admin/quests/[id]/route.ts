// GET /api/admin/quests/[id] — Get single quest detail with lessons (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { data: quest, error } = await supabase
      .from("Quest")
      .select(`
        id,
        title,
        slug,
        description,
        status,
        orderIndex,
        xpReward,
        badgeReward,
        createdAt,
        updatedAt,
        theme:Theme(
          id,
          title,
          grade
        ),
        lessons:Lesson(
          id,
          title,
          slug,
          status,
          orderIndex
        )
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Quest not found" }, { status: 404 });
      }
      console.error("[ADMIN_QUEST_DETAIL] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sort lessons by orderIndex
    if (quest?.lessons) {
      quest.lessons.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }

    return NextResponse.json({ quest });
  } catch (err: any) {
    console.error("[ADMIN_QUEST_DETAIL] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch quest" }, { status: 500 });
  }
}
