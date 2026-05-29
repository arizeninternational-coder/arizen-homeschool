import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guard";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export const POST = withAuth(async (req: NextRequest, user: any, body: any) => {
  try {
    const { learnerId, amount, source, sourceId, description } = body || {};
    if (!learnerId || !amount || amount <= 0) {
      return NextResponse.json({ error: "learnerId and positive amount required" }, { status: 400 });
    }

    // Check for duplicate award
    const { data: existing } = await supabase
      .from("CoinAwardTracking")
      .select("id")
      .eq("learnerId", String(learnerId))
      .eq("sourceType", source || "BONUS")
      .eq("sourceId", String(sourceId || ""))
      .single();

    if (existing) {
      return NextResponse.json({ success: true, alreadyAwarded: true, message: "Coins already awarded for this action" });
    }

    // Get or create wallet
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

    const newBalance = (wallet?.balance || 0) + amount;
    const newLifetimeEarned = (wallet?.lifetimeEarned || 0) + amount;

    // Update wallet
    await supabase
      .from("StudentWallet")
      .update({ balance: newBalance, lifetimeEarned: newLifetimeEarned })
      .eq("learnerId", learnerId);

    // Create transaction record
    await supabase.from("CoinTransaction").insert({
      learnerId,
      amount,
      type: "EARNED",
      source: source || "BONUS",
      sourceId: String(sourceId || ""),
      description: description || `${source || "Bonus"} coins`,
      balanceAfter: newBalance,
    });

    // Mark as awarded
    await supabase.from("CoinAwardTracking").insert({
      learnerId: String(learnerId),
      sourceType: source || "BONUS",
      sourceId: String(sourceId || ""),
    });

    console.log(`[COIN_AWARD] Learner ${learnerId}: +${amount} coins (${source}). Balance: ${newBalance}`);

    return NextResponse.json({ success: true, amount, newBalance, alreadyAwarded: false });
  } catch (err: any) {
    console.error("[COIN_AWARD] Error:", err);
    return NextResponse.json({ error: err?.message || "Failed to award coins" }, { status: 500 });
  }
});
