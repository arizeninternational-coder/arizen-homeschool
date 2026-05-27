import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch stats using Supabase REST API
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
}
