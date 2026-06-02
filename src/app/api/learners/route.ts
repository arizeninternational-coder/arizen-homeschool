// GET /api/learners — List learners for leaderboard (authenticated users only)
// Returns ONLY safe display fields — no emails, no internal IDs, no private data
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Require authentication — any logged-in user can view the leaderboard
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized — please log in" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("LearnerProfile")
      .select("id, displayName, totalXp, currentStreak")
      .order("totalXp", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[LEARNERS] Error:", error.message);
      return NextResponse.json({ learners: [] });
    }

    // Return ONLY safe fields — no emails, no internal IDs, no private data
    const safeLearners = (data || []).map((learner: any) => ({
      displayName: learner.displayName || "Learner",
      totalXp: learner.totalXp || 0,
      currentStreak: learner.currentStreak || 0,
    }));

    return NextResponse.json({ learners: safeLearners });
  } catch (err: any) {
    console.error("[LEARNERS] Critical error:", err);
    return NextResponse.json({ learners: [] });
  }
}
