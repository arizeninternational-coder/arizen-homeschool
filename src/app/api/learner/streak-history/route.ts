// GET /api/learner/streak-history — Returns which days in the past week had learning activity
// Used by the student sidebar streak calendar
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
import { getNairobiDateKey } from "@/lib/streak";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.learnerProfileId) {
      return NextResponse.json({ activeDays: [], currentStreak: 0, bestStreak: 0 });
    }

    const learnerId = user.learnerProfileId;

    // Get current streak from Streak table (source of truth)
    const { data: streakRecord } = await supabase
      .from("Streak")
      .select("currentCount, bestCount")
      .eq("learnerId", learnerId)
      .eq("streakType", "daily_learning")
      .maybeSingle();

    const currentStreak = streakRecord?.currentCount || 0;
    const bestStreak = streakRecord?.bestCount || 0;

    // Find which days in the past 7 days had activity
    // We check: lesson completions (Progress.completedAt) and check-ins (EmotionalCheckin.createdAt)
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [progressRes, checkinRes] = await Promise.all([
      supabase
        .from("Progress")
        .select("completedAt")
        .eq("learnerId", learnerId)
        .not("completedAt", "is", null)
        .gte("completedAt", sevenDaysAgo.toISOString()),
      supabase
        .from("EmotionalCheckin")
        .select("createdAt")
        .eq("learnerId", learnerId)
        .gte("createdAt", sevenDaysAgo.toISOString()),
    ]);

    // Build set of active Nairobi date keys
    const activeDaySet = new Set<string>();

    for (const row of progressRes.data || []) {
      if (row.completedAt) {
        activeDaySet.add(getNairobiDateKey(new Date(row.completedAt)));
      }
    }
    for (const row of checkinRes.data || []) {
      if (row.createdAt) {
        activeDaySet.add(getNairobiDateKey(new Date(row.createdAt)));
      }
    }

    // Build 7-day array (Mon-Sun of current week)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
    const activeDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateKey = getNairobiDateKey(d);
      const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
      const isWeekend = i >= 5;
      const isActive = activeDaySet.has(dateKey);
      return { dateKey, dayLabel: DAY_LABELS[i], isToday, isWeekend, isActive };
    });

    return NextResponse.json({ activeDays, currentStreak, bestStreak });
  } catch (err: any) {
    console.error("[STREAK_HISTORY] Error:", err);
    return NextResponse.json({ activeDays: [], currentStreak: 0, bestStreak: 0 });
  }
}
