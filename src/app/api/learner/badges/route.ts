// GET /api/learner/badges — Get learner badges
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req, user) => {
  try {
    if (!user.learnerProfileId) {
      return NextResponse.json({ badges: [] });
    }
    const { data, error } = await supabase.from("Badge").select("*").eq("learnerId", user.learnerProfileId).order("awardedAt", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ badges: data || [] });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
});
