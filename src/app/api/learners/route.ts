// GET /api/learners — List learners in guild
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req, user) => {
  try {
    const guildId = user.guildId || user.guildSlug;
    if (!guildId) return NextResponse.json({ error: "No guild assigned" }, { status: 400 });

    const { data, error } = await supabase
      .from("LearnerProfile")
      .select("id, displayName, grade, totalXp, currentStreak, avatarUrl")
      .eq("guildId", guildId)
      .order("grade", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ learners: data || [] });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});
