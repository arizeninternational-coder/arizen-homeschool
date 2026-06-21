// Shared streak computation helper
// Used by lesson completion and check-in APIs to keep streak logic consistent

import { supabase } from "@/lib/supabase";

const NAIROBI_TZ = "Africa/Nairobi";

export function getNairobiDateKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIROBI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function nairobiDaysBetween(earlier: Date, later: Date): number {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIROBI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const earlierKey = fmt.format(earlier);
  const laterKey = fmt.format(later);
  const earlierMs = new Date(earlierKey + "T12:00:00Z").getTime();
  const laterMs = new Date(laterKey + "T12:00:00Z").getTime();
  return Math.round((laterMs - earlierMs) / (1000 * 60 * 60 * 24));
}

/**
 * Updates the daily_learning streak for a learner.
 * Returns the new streak count.
 * Idempotent: calling multiple times on the same Nairobi day returns the same count.
 */
export async function updateStreak(learnerId: string): Promise<number> {
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

  // Also update the denormalized fields on LearnerProfile for quick reads
  const bestStreak = streakRecord
    ? Math.max(streakRecord.bestCount || 0, newStreak)
    : newStreak;
  await supabase
    .from("LearnerProfile")
    .update({
      currentStreak: newStreak,
      bestStreak,
      lastActivityDate: nowDate.toISOString(),
    })
    .eq("id", learnerId);

  return newStreak;
}
