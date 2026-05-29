// GET /api/learner/progress — Get all progress
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req, user) => {
  try {
    if (!user.learnerProfileId) {
      return NextResponse.json({ progress: [] });
    }
    const { data, error } = await supabase
      .from("Progress")
      .select("*")
      .eq("learnerId", user.learnerProfileId)
      .order("lastAccessed", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ progress: data || [] });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
});
