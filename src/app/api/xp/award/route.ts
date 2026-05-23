import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { amount, sourceType, sourceId, description } = body;
    const learnerId = token.learnerProfileId as string;

    if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid XP amount" }, { status: 400 });

    // Create XP record and update profile in transaction
    const [record, profile] = await prisma.$transaction([
      prisma.xpRecord.create({
        data: {
          learnerId,
          sourceType: sourceType || "BONUS",
          sourceId: sourceId || "manual",
          amount,
          description: description || `${sourceType} XP`,
        },
      }),
      prisma.learnerProfile.update({
        where: { id: learnerId },
        data: { totalXp: { increment: amount } },
      }),
    ]);

    // Check for streak bonus
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivity = profile.lastActivityDate ? new Date(profile.lastActivityDate) : null;
    let streakBonus = 0;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day — check for streak bonus
        const newStreak = profile.currentStreak + 1;
        const streakBonuses: Record<number, number> = { 3: 25, 7: 75, 14: 200, 30: 500 };
        streakBonus = streakBonuses[newStreak] || 0;

        await prisma.learnerProfile.update({
          where: { id: learnerId },
          data: {
            currentStreak: newStreak,
            bestStreak: Math.max(newStreak, profile.bestStreak),
            lastActivityDate: new Date(),
          },
        });

        if (streakBonus > 0) {
          await prisma.xpRecord.create({
            data: {
              learnerId,
              sourceType: "STREAK",
              sourceId: `streak_${newStreak}`,
              amount: streakBonus,
              description: `${newStreak}-day streak bonus!`,
            },
          });
        }
      } else if (diffDays > 1) {
        // Streak broken — reset to 1
        await prisma.learnerProfile.update({
          where: { id: learnerId },
          data: { currentStreak: 1, lastActivityDate: new Date() },
        });
      }
      // If diffDays === 0, same day — no streak change
    } else {
      // First activity ever
      await prisma.learnerProfile.update({
        where: { id: learnerId },
        data: { currentStreak: 1, bestStreak: Math.max(1, profile.bestStreak), lastActivityDate: new Date() },
      });
    }

    // Check for new badges
    const newBadges = await checkAndAwardBadges(learnerId);

    return NextResponse.json({
      success: true,
      xpAwarded: amount,
      streakBonus,
      totalXp: profile.totalXp + amount + streakBonus,
      newBadges,
    });
  } catch (err) {
    console.error("XP award error:", err);
    return NextResponse.json({ error: "Failed to award XP" }, { status: 500 });
  }
}

async function checkAndAwardBadges(learnerId: string): Promise<any[]> {
  const profile = await prisma.learnerProfile.findUnique({ where: { id: learnerId } });
  if (!profile) return [];

  const lessonCount = await prisma.progress.count({ where: { learnerId, lessonId: { not: null }, completedAt: { not: null } } });
  const questCount = await prisma.progress.count({ where: { learnerId, questId: { not: null }, completedAt: { not: null } } });
  const existingBadges = await prisma.badge.findMany({ where: { learnerId } });
  const existingTypes = new Set(existingBadges.map(b => b.badgeType));

  const newBadges: any[] = [];
  const stats = { totalXp: profile.totalXp, currentStreak: profile.currentStreak, lessonsCompleted: lessonCount, questsCompleted: questCount, level: Math.floor(profile.totalXp / 500) + 1, subjectsStudied: 5 };

  const thresholds: Record<string, { name: string; description: string; check: () => boolean }> = {
    first_lesson: { name: "First Step", description: "Completed your first lesson", check: () => lessonCount >= 1 },
    ten_lessons: { name: "Quick Learner", description: "Completed 10 lessons", check: () => lessonCount >= 10 },
    first_quest: { name: "Quest Complete!", description: "Completed your first quest", check: () => questCount >= 1 },
    five_quests: { name: "Quest Master", description: "Completed 5 quests", check: () => questCount >= 5 },
    streak_3: { name: "Streak Starter", description: "3-day learning streak", check: () => profile.currentStreak >= 3 },
    streak_7: { name: "Week Warrior", description: "7-day learning streak", check: () => profile.currentStreak >= 7 },
    xp_1000: { name: "XP Champion", description: "Earned 1,000 XP", check: () => profile.totalXp >= 1000 },
    xp_5000: { name: "XP Legend", description: "Earned 5,000 XP", check: () => profile.totalXp >= 5000 },
    level_5: { name: "Rising Star", description: "Reached Level 5", check: () => stats.level >= 5 },
    level_10: { name: "Mastermind", description: "Reached Level 10", check: () => stats.level >= 10 },
  };

  for (const [type, badge] of Object.entries(thresholds)) {
    if (!existingTypes.has(type) && badge.check()) {
      const created = await prisma.badge.create({
        data: { learnerId, badgeType: type, name: badge.name, description: badge.description },
      });
      newBadges.push(created);
    }
  }

  return newBadges;
}
