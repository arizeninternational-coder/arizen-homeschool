import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authUser.learnerProfileId) return NextResponse.json({ error: "Learner profile required" }, { status: 403 });

  try {
    const { avatarItemId } = await req.json();
    if (!avatarItemId) return NextResponse.json({ error: "avatarItemId required" }, { status: 400 });
    const learnerId = authUser.learnerProfileId;

    // Check ownership
    const { data: existing } = await supabase.from("StudentInventory").select("id").eq("learnerId", learnerId).eq("avatarItemId", avatarItemId).single();
    if (existing) return NextResponse.json({ error: "Already owned" }, { status: 400 });

    // Get item
    const { data: item } = await supabase.from("AvatarItem").select("*").eq("id", avatarItemId).eq("isActive", true).single();
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Get wallet
    const { data: wallet } = await supabase.from("StudentWallet").select("*").eq("learnerId", learnerId).single();
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 400 });
    if (wallet.balance < item.price) return NextResponse.json({ error: `Need ${item.price - wallet.balance} more coins`, currentBalance: wallet.balance, itemPrice: item.price }, { status: 400 });

    // Check unlock
    if (item.unlockType && item.unlockType !== "ALWAYS_AVAILABLE" && item.unlockType !== "COINS_ONLY") {
      let progress = 0;
      const req = item.unlockRequirement || 0;
      if (item.unlockType === "LESSON_COUNT") { const c = await supabase.from("Progress").select("id", { count: "exact", head: true }).eq("learnerId", learnerId).not("lessonId", "is", null).not("completedAt", "is", null); progress = c.count || 0; }
      else if (item.unlockType === "QUEST_COUNT") { const c = await supabase.from("Progress").select("id", { count: "exact", head: true }).eq("learnerId", learnerId).not("questId", "is", null).not("completedAt", "is", null); progress = c.count || 0; }
      else if (item.unlockType === "STREAK_DAYS") { const p = await supabase.from("LearnerProfile").select("currentStreak").eq("id", learnerId).single(); progress = p.data?.currentStreak || 0; }
      else if (item.unlockType === "XP_THRESHOLD") { const p = await supabase.from("LearnerProfile").select("totalXp").eq("id", learnerId).single(); progress = p.data?.totalXp || 0; }
      if (progress < req) return NextResponse.json({ error: `Locked: ${item.unlockDescription || "Requirement not met"} (${progress}/${req})` }, { status: 403 });
    }

    const newBal = wallet.balance - item.price;
    await supabase.from("StudentWallet").update({ balance: newBal, lifetimeSpent: (wallet.lifetimeSpent || 0) + item.price }).eq("learnerId", learnerId);
    await supabase.from("StudentInventory").insert({ learnerId, avatarItemId });
    await supabase.from("CoinTransaction").insert({ learnerId, amount: -item.price, type: "SPENT", source: "SHOP_PURCHASE", sourceId: avatarItemId, description: `Purchased: ${item.name}`, balanceAfter: newBal });

    return NextResponse.json({ success: true, message: `You bought "${item.name}"!`, newBalance: newBal, item: { id: item.id, name: item.name, emoji: item.emoji, category: item.category } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Purchase failed" }, { status: 500 });
  }
}
