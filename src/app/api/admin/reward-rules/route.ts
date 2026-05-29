// GET /api/admin/reward-rules — List all reward rules (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { data: rules, error } = await supabase
      .from("RewardRule")
      .select("id, action, coins, xp, dailyLimit, isActive")
      .order("action");

    if (error) {
      console.error("[ADMIN_REWARD_RULES] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rules: rules || [] });
  } catch (err: any) {
    console.error("[ADMIN_REWARD_RULES] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch reward rules" }, { status: 500 });
  }
}
