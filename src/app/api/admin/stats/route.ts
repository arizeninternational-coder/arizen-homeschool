// GET /api/admin/stats — Admin dashboard stats (ADMIN only)
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";

export const GET = withAuth(async (req, user) => {
  try {
    const [
      { count: usersCount },
      { count: parentsCount },
      { count: learnersCount },
      { count: lessonsCount },
      { count: questsCount },
    ] = await Promise.all([
      supabase.from("User").select("*", { count: "exact", head: true }),
      supabase.from("User").select("*", { count: "exact", head: true }).eq("role", "PARENT"),
      supabase.from("User").select("*", { count: "exact", head: true }).eq("role", "LEARNER"),
      supabase.from("Lesson").select("*", { count: "exact", head: true }),
      supabase.from("Quest").select("*", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      users: usersCount || 0,
      parents: parentsCount || 0,
      learners: learnersCount || 0,
      lessons: lessonsCount || 0,
      quests: questsCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { roles: ["ADMIN"] });
