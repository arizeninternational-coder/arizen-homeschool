// GET /api/learner/xp — Get XP history
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";

export const GET = withAuth(async (req, user) => {
  try {
    if (!user.learnerProfileId) {
      return NextResponse.json({ xpRecords: [] });
    }
    const { data, error } = await supabase.from("XpRecord").select("*").eq("learnerId", user.learnerProfileId).order("awardedAt", { ascending: false }).limit(50);
    if (error) throw error;
    return NextResponse.json({ xpRecords: data || [] });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch XP records" }, { status: 500 });
  }
});
