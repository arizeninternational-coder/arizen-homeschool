import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  guildId: string;
  role?: string;
  grade?: number;
  displayName?: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  const role = (data.role as any) || "LEARNER";

  return prisma.user.create({
    data: {
      guildId: data.guildId,
      email: data.email,
      name: data.name,
      passwordHash,
      role,
      learnerProfile: role === "LEARNER"
        ? {
            create: {
              guildId: data.guildId,
              displayName: data.displayName || data.name,
              grade: data.grade || 5,
            },
          }
        : undefined,
    },
    include: { learnerProfile: true },
  });
}

export async function validateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { guild: true, learnerProfile: true },
  });

  if (!user || !user.passwordHash) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

export async function updateStreak(learnerId: string) {
  const profile = await prisma.learnerProfile.findUnique({
    where: { id: learnerId },
  });

  if (!profile) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = profile.lastActivityDate
    ? new Date(profile.lastActivityDate)
    : null;

  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Consecutive day — increment streak
      const newStreak = profile.currentStreak + 1;
      await prisma.learnerProfile.update({
        where: { id: learnerId },
        data: {
          currentStreak: newStreak,
          bestStreak: Math.max(newStreak, profile.bestStreak),
          lastActivityDate: new Date(),
        },
      });
    } else if (diffDays > 1) {
      // Streak broken
      await prisma.learnerProfile.update({
        where: { id: learnerId },
        data: {
          currentStreak: 1,
          lastActivityDate: new Date(),
        },
      });
    }
    // If diffDays === 0, same day — no change
  } else {
    // First activity
    await prisma.learnerProfile.update({
      where: { id: learnerId },
      data: {
        currentStreak: 1,
        bestStreak: Math.max(1, profile.bestStreak),
        lastActivityDate: new Date(),
      },
    });
  }
}

export async function awardXp(
  learnerId: string,
  amount: number,
  sourceType: string,
  sourceId: string,
  description?: string
) {
  const [record] = await prisma.$transaction([
    prisma.xpRecord.create({
      data: {
        learnerId,
        sourceType: sourceType as any,
        sourceId,
        amount,
        description,
      },
    }),
    prisma.learnerProfile.update({
      where: { id: learnerId },
      data: {
        totalXp: { increment: amount },
      },
    }),
  ]);

  return record;
}
