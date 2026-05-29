import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const [usersRes, parentsRes, learnersRes, lessonsRes, questsRes, badgesRes, shopItemsRes] = await Promise.all([
      supabase.from("User").select("id", { count: "exact", head: true }),
      supabase.from("User").select("id", { count: "exact", head: true }).ilike("role", "parent"),
      supabase.from("LearnerProfile").select("id", { count: "exact", head: true }),
      supabase.from("Lesson").select("id", { count: "exact", head: true }),
      supabase.from("Quest").select("id", { count: "exact", head: true }),
      supabase.from("Badge").select("id", { count: "exact", head: true }),
      supabase.from("AvatarItem").select("id", { count: "exact", head: true }).eq("isActive", true),
    ]);

    return NextResponse.json({
      users: usersRes.count ?? 0,
      parents: parentsRes.count ?? 0,
      learners: learnersRes.count ?? 0,
      lessons: lessonsRes.count ?? 0,
      quests: questsRes.count ?? 0,
      badges: badgesRes.count ?? 0,
      shopItems: shopItemsRes.count ?? 0,
    });
  } catch (e: any) {
    console.error("Admin stats error:", e);
    return NextResponse.json(
      { error: e.message || "Unable to load stats" },
      { status: 500 }
    );
  }
}
