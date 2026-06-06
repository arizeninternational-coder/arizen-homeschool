// POST /api/learner/progress — Start or complete a lesson
// Body: { lessonId, action: "start" | "complete", questId? }
// Handles: progress creation/update, rewards on first completion, streak logic
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

function safeRewardValue(reward: any): number {
  if (!reward) return 0;
  if (typeof reward === "number") return reward;
  if (typeof reward === "object") return reward?.base || reward?.amount || 0;
  if (typeof reward === "string") {
    try { const p = JSON.parse(reward); return p?.base || p?.amount || 0; } catch { return 0; }
  }
  return 0;
}

// ── Nairobi timezone helpers ──
// Kenya uses Africa/Nairobi (UTC+3). All streak day boundaries must use
// Nairobi calendar dates, not UTC, so that a learner completing lessons
// late at night (e.g. 11 PM EAT = 8 PM UTC) is counted on the correct day.
const NAIROBI_TZ = "Africa/Nairobi";

/**
 * Returns a YYYY-MM-DD string representing the date in Africa/Nairobi
 * for the given Date object (defaults to now).
 */
function getNairobiDateKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIROBI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d); // en-CA gives YYYY-MM-DD
}

/**
 * Returns the number of calendar days (in Nairobi time) between two dates.
 * Positive when `later` is after `earlier`.
 */
function nairobiDaysBetween(earlier: Date, later: Date): number {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIROBI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // Parse the YYYY-MM-DD back into a Date at midnight Nairobi
  // We compare using UTC representations of the Nairobi midnight
  const earlierKey = fmt.format(earlier);
  const laterKey = fmt.format(later);
  // Use noon UTC of each date key to avoid DST edge cases
  const earlierMs = new Date(earlierKey + "T12:00:00Z").getTime();
  const laterMs = new Date(laterKey + "T12:00:00Z").getTime();
  return Math.round((laterMs - earlierMs) / (1000 * 60 * 60 * 24));
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.learnerProfileId) {
      return NextResponse.json({ error: "Learner profile required" }, { status: 403 });
    }

    const body = await req.json();
    const { lessonId, action, questId } = body;
    if (!lessonId || !action) {
      return NextResponse.json({ error: "lessonId and action required" }, { status: 400 });
    }
    if (!["start", "complete"].includes(action)) {
      return NextResponse.json({ error: "action must be 'start' or 'complete'" }, { status: 400 });
    }

    const learnerId = user.learnerProfileId;
    const now = new Date().toISOString();

    // Check for existing progress
    const { data: existing } = await supabase
      .from("Progress")
      .select("id, completedAt, masteryPercent")
      .eq("learnerId", learnerId)
      .eq("lessonId", lessonId)
      .maybeSingle();

    let progressRecord = existing;
    let wasAlreadyCompleted = existing?.completedAt != null;

    if (action === "start") {
      if (existing) {
        // Update lastAccessed only
        const { data: updated } = await supabase
          .from("Progress")
          .update({ lastAccessed: now })
          .eq("id", existing.id)
          .select()
          .single();
        progressRecord = updated;
      } else {
        // Create new progress record
        const { data: created, error: createErr } = await supabase
          .from("Progress")
          .insert({
            learnerId,
            lessonId,
            questId: questId || null,
            masteryPercent: 0,
            lastAccessed: now,
          })
          .select()
          .single();
        if (createErr) {
          console.error("[PROGRESS_START] Error:", createErr.message);
          return NextResponse.json({ error: "Failed to start lesson" }, { status: 500 });
        }
        progressRecord = created;
      }
      return NextResponse.json({ progress: progressRecord, started: true });
    }

    // action === "complete"
    if (wasAlreadyCompleted) {
      // Already completed — do NOT award rewards again
      return NextResponse.json({
        progress: existing,
        alreadyCompleted: true,
        message: "Lesson already completed. No additional rewards.",
      });
    }

    // If no existing progress record, create one first (learner may have skipped "start")
    if (!existing) {
      const { data: created, error: createErr } = await supabase
        .from("Progress")
        .insert({
          learnerId,
          lessonId,
          questId: questId || null,
          masteryPercent: 0,
          lastAccessed: now,
        })
        .select()
        .single();
      if (createErr) {
        console.error("[PROGRESS_COMPLETE_CREATE] Error:", createErr.message);
        return NextResponse.json({ error: "Failed to create progress record" }, { status: 500 });
      }
      progressRecord = created;
    }

    // Mark as completed
    const { data: completed, error: completeErr } = await supabase
      .from("Progress")
      .update({
        completedAt: now,
        masteryPercent: 100,
        lastAccessed: now,
      })
      .eq("id", progressRecord?.id || existing?.id || "")
      .select()
      .single();

    if (completeErr) {
      console.error("[PROGRESS_COMPLETE] Error:", completeErr.message);
      return NextResponse.json({ error: "Failed to complete lesson" }, { status: 500 });
    }
    progressRecord = completed;

    // ── Award rewards (first completion only) ──
    const rewards = { coins: 0, xp: 0 };

    // Get lesson reward
    const { data: lesson } = await supabase
      .from("Lesson")
      .select("xpReward")
      .eq("id", lessonId)
      .maybeSingle();

    const lessonXp = safeRewardValue(lesson?.xpReward);
    rewards.xp = lessonXp;
    rewards.coins = Math.floor(lessonXp / 2); // Coins = half of XP, minimum 0

    // Get quest reward if available
    if (questId) {
      const { data: quest } = await supabase
        .from("Quest")
        .select("xpReward")
        .eq("id", questId)
        .maybeSingle();
      const questXp = safeRewardValue(quest?.xpReward);
      rewards.xp += questXp;
      rewards.coins += Math.floor(questXp / 2);
    }

    // Update wallet
    if (rewards.coins > 0) {
      // Get or create wallet
      const { data: wallet } = await supabase
        .from("StudentWallet")
        .select("id, balance, lifetimeEarned")
        .eq("learnerId", learnerId)
        .maybeSingle();

      let walletId: string;
      let newBalance: number;

      if (wallet) {
        newBalance = (wallet.balance || 0) + rewards.coins;
        walletId = wallet.id;
        await supabase
          .from("StudentWallet")
          .update({
            balance: newBalance,
            lifetimeEarned: (wallet.lifetimeEarned || 0) + rewards.coins,
          })
          .eq("id", wallet.id);
      } else {
        newBalance = rewards.coins;
        const { data: created, error: createErr } = await supabase
          .from("StudentWallet")
          .insert({
            learnerId,
            balance: rewards.coins,
            lifetimeEarned: rewards.coins,
            lifetimeSpent: 0,
          })
          .select("id")
          .single();
        if (createErr) {
          console.error("[PROGRESS_WALLET_CREATE] Error:", createErr.message);
          return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
        }
        walletId = created.id;
      }

      // Create coin transaction record (walletId is always valid here)
      await supabase.from("CoinTransaction").insert({
        walletId,
        amount: rewards.coins,
        type: "EARNED",
        source: "LESSON",
        sourceId: lessonId,
        description: `Completed lesson: ${lesson?.title || lessonId}`,
        balanceAfter: newBalance,
      });
    }

    // Update learner XP — fetch current value first, then atomic increment
    if (rewards.xp > 0) {
      // Read current totalXp
      const { data: profile } = await supabase
        .from("LearnerProfile")
        .select("totalXp")
        .eq("id", learnerId)
        .maybeSingle();

      const currentXp = profile?.totalXp || 0;
      const updatedXp = currentXp + rewards.xp;

      const { error: xpUpdateErr } = await supabase
        .from("LearnerProfile")
        .update({ totalXp: updatedXp })
        .eq("id", learnerId);

      if (xpUpdateErr) {
        console.error("[PROGRESS_XP_UPDATE] Error:", xpUpdateErr.message);
      }

      // Create XP record
      await supabase.from("XpRecord").insert({
        learnerId,
        sourceType: "LESSON",
        sourceId: lessonId,
        amount: rewards.xp,
        description: `Lesson completed: ${lesson?.title || lessonId}`,
      });
    }

    // ── Streak logic (Africa/Nairobi timezone) ──
    const nowDate = new Date();
    const todayKey = getNairobiDateKey(nowDate);

    const { data: streakRecord } = await supabase
      .from("Streak")
      .select("id, currentCount, lastDate, bestCount")
      .eq("learnerId", learnerId)
      .eq("streakType", "daily_learning")
      .maybeSingle();

    let newStreak = 1;
    if (streakRecord) {
      const lastDate = new Date(streakRecord.lastDate);
      const diffDays = nairobiDaysBetween(lastDate, nowDate);

      if (diffDays === 0) {
        // Same Nairobi calendar day — streak unchanged
        newStreak = streakRecord.currentCount;
      } else if (diffDays === 1) {
        // Consecutive Nairobi day — increment
        newStreak = streakRecord.currentCount + 1;
      } else {
        // Gap of 2+ Nairobi days — reset to 1
        newStreak = 1;
      }

      // Only write to DB if the streak count actually changes
      if (newStreak !== streakRecord.currentCount || diffDays > 0) {
        await supabase
          .from("Streak")
          .update({
            currentCount: newStreak,
            lastDate: nowDate.toISOString(),
            bestCount: Math.max(streakRecord.bestCount || 0, newStreak),
          })
          .eq("id", streakRecord.id);
      }
    } else {
      await supabase.from("Streak").insert({
        learnerId,
        streakType: "daily_learning",
        currentCount: 1,
        lastDate: nowDate.toISOString(),
        bestCount: 1,
      });
    }

    // Update learner profile lastActivityDate
    await supabase
      .from("LearnerProfile")
      .update({ lastActivityDate: nowDate.toISOString() })
      .eq("id", learnerId);

    return NextResponse.json({
      progress: progressRecord,
      completed: true,
      rewards,
      streak: newStreak,
    });
  } catch (err: any) {
    console.error("[PROGRESS] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to update progress" }, { status: 500 });
  }
}

// GET /api/learner/progress — Get progress for a specific lesson or all lessons
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.learnerProfileId) {
      return NextResponse.json({ progress: [] });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    let query = supabase
      .from("Progress")
      .select("id, lessonId, questId, masteryPercent, lastAccessed, completedAt, createdAt")
      .eq("learnerId", user.learnerProfileId)
      .order("lastAccessed", { ascending: false });

    if (lessonId) query = query.eq("lessonId", lessonId);

    const { data, error } = await query.limit(100);
    if (error) throw error;

    return NextResponse.json({ progress: data || [] });
  } catch (err: any) {
    console.error("[PROGRESS_GET] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch progress" }, { status: 500 });
  }
}
