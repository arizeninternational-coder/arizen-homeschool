// GET /api/admin/stats — Admin dashboard stats (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    // Fetch all stats in parallel
    const results = await Promise.allSettled([
      supabase.from("User").select("id", { count: "exact", head: true }),
      supabase.from("User").select("id", { count: "exact", head: true }).eq("role", "PARENT"),
      supabase.from("LearnerProfile").select("id", { count: "exact", head: true }),
      supabase.from("Lesson").select("id", { count: "exact", head: true }),
      supabase.from("Quest").select("id", { count: "exact", head: true }),
    ]);

    const [usersRes, parentsRes, learnersRes, lessonsRes, questsRes] = results;

    // Log any failures for debugging
    const errors: string[] = [];
    if (usersRes.status === "rejected") errors.push(`users: ${usersRes.reason?.message}`);
    if (parentsRes.status === "rejected") errors.push(`parents: ${parentsRes.reason?.message}`);
    if (learnersRes.status === "rejected") errors.push(`learners: ${learnersRes.reason?.message}`);
    if (lessonsRes.status === "rejected") errors.push(`lessons: ${lessonsRes.reason?.message}`);
    if (questsRes.status === "rejected") errors.push(`quests: ${questsRes.reason?.message}`);

    if (errors.length > 0) {
      console.error("[ADMIN_STATS] Partial failures:", errors.join("; "));
    }

    return NextResponse.json({
      users: usersRes.status === "fulfilled" ? (usersRes.value.count ?? 0) : 0,
      parents: parentsRes.status === "fulfilled" ? (parentsRes.value.count ?? 0) : 0,
      learners: learnersRes.status === "fulfilled" ? (learnersRes.value.count ?? 0) : 0,
      lessons: lessonsRes.status === "fulfilled" ? (lessonsRes.value.count ?? 0) : 0,
      quests: questsRes.status === "fulfilled" ? (questsRes.value.count ?? 0) : 0,
      ...(errors.length > 0 ? { _errors: errors } : {}),
    });
  } catch (error: any) {
    console.error("[ADMIN_STATS] Critical error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
