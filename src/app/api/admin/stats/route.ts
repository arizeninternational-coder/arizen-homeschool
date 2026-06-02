import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    // Fetch all users to count roles properly (Supabase REST case-insensitive or varies)
    const { data: allUsers, error: usersErr } = await supabase
      .from("User")
      .select("id, role");

    if (usersErr) throw usersErr;

    const users = allUsers || [];
    const totalUsers = users.length;
    const parents = users.filter(u => (u.role || "").toUpperCase() === "PARENT").length;
    const learners = users.filter(u => (u.role || "").toUpperCase() === "LEARNER").length;
    const teachers = users.filter(u => (u.role || "").toUpperCase() === "TEACHER").length;
    const admins = users.filter(u => (u.role || "").toUpperCase() === "ADMIN").length;

    // Count lessons by status
    const [lessonsRes, publishedLessonsRes, draftLessonsRes, questsRes, badgesRes, shopItemsRes] = await Promise.all([
      supabase.from("Lesson").select("id", { count: "exact", head: true }),
      supabase.from("Lesson").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
      supabase.from("Lesson").select("id", { count: "exact", head: true }).eq("status", "DRAFT"),
      supabase.from("Quest").select("id", { count: "exact", head: true }),
      supabase.from("Badge").select("id", { count: "exact", head: true }),
      supabase.from("AvatarItem").select("id", { count: "exact", head: true }).eq("isActive", true),
    ]);

    return NextResponse.json({
      users: totalUsers,
      parents,
      learners,
      teachers,
      admins,
      lessons: lessonsRes.count ?? 0,
      publishedLessons: publishedLessonsRes.count ?? 0,
      draftLessons: draftLessonsRes.count ?? 0,
      quests: questsRes.count ?? 0,
      badges: badgesRes.count ?? 0,
      shopItems: shopItemsRes.count ?? 0,
    });
  } catch (e: any) {
    console.error("[ADMIN_STATS] Error:", e);
    return NextResponse.json(
      { error: e.message || "Unable to load stats" },
      { status: 500 }
    );
  }
}
