import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const category = url.searchParams.get("category");

  try {
    let query = supabase.from("AvatarItem").select("*").eq("isActive", true).order("price", { ascending: true });
    if (category && category !== "all") query = query.eq("category", category.toUpperCase());

    const { data: items, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let ownedItemIds = new Set<string>();
    let walletBalance = 0;
    let lessonCount = 0;
    let questCount = 0;
    let xpTotal = 0;
    let streakDays = 0;

    if (authUser.learnerProfileId) {
      const lid = authUser.learnerProfileId;
      const [inv, wallet, lessons, quests, profile] = await Promise.allSettled([
        supabase.from("StudentInventory").select("avatarItemId").eq("learnerId", lid),
        supabase.from("StudentWallet").select("balance").eq("learnerId", lid).single(),
        supabase.from("Progress").select("id", { count: "exact", head: true }).eq("learnerId", lid).not("lessonId", "is", null).not("completedAt", "is", null),
        supabase.from("Progress").select("id", { count: "exact", head: true }).eq("learnerId", lid).not("questId", "is", null).not("completedAt", "is", null),
        supabase.from("LearnerProfile").select("totalXp, currentStreak").eq("id", lid).single(),
      ]);
      if (inv.status === "fulfilled" && inv.value.data) ownedItemIds = new Set(inv.value.data.map((r: any) => r.avatarItemId));
      if (wallet.status === "fulfilled" && wallet.value.data) walletBalance = (wallet.value.data as any).balance || 0;
      if (lessons.status === "fulfilled") lessonCount = (lessons.value as any).count || 0;
      if (quests.status === "fulfilled") questCount = (quests.value as any).count || 0;
      if (profile.status === "fulfilled" && profile.value.data) {
        xpTotal = (profile.value.data as any).totalXp || 0;
        streakDays = (profile.value.data as any).currentStreak || 0;
      }
    }

    const enrichedItems = (items || []).map((item: any) => {
      const isOwned = ownedItemIds.has(item.id);
      const canAfford = walletBalance >= item.price;
      let reqProgress = 0, reqTotal = item.unlockRequirement || 0;
      const ut = item.unlockType || "ALWAYS_AVAILABLE";
      if (ut === "LESSON_COUNT") reqProgress = lessonCount;
      else if (ut === "QUEST_COUNT") reqProgress = questCount;
      else if (ut === "STREAK_DAYS") reqProgress = streakDays;
      else if (ut === "XP_THRESHOLD") reqProgress = xpTotal;
      else if (ut === "ALWAYS_AVAILABLE") reqProgress = reqTotal;
      const reqMet = reqProgress >= reqTotal;
      return { ...item, isOwned, canAfford, requirementProgress: reqProgress, requirementTotal: reqTotal, requirementMet: reqMet, canBuy: !isOwned && canAfford && reqMet };
    });

    return NextResponse.json({ items: enrichedItems, walletBalance, lessonCount, questCount, xpTotal, streakDays });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
