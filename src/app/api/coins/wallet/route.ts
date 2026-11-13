import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guard";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req: NextRequest, user: any, url: URL) => {
  const supabase = getSupabaseAdmin();
  try {
    const learnerId = user.learnerProfileId;
    if (!learnerId) return NextResponse.json({ wallet: null });

    let { data: wallet } = await supabase
      .from("StudentWallet")
      .select("*")
      .eq("learnerId", learnerId)
      .single();

    if (!wallet) {
      const { data: newWallet } = await supabase
        .from("StudentWallet")
        .insert({ learnerId, balance: 0, lifetimeEarned: 0, lifetimeSpent: 0 })
        .select("*")
        .single();
      wallet = newWallet;
    }

    return NextResponse.json({ wallet });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch wallet" }, { status: 500 });
  }
});
