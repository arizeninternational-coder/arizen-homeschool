// Seed script for Grade 4 Mathematics — Sub-strand 1.1 Whole Numbers
// Non-destructive: uses upsert to avoid duplicates
// Run with: npx tsx scripts/seed-grade4-math.ts

import { PrismaClient } from "@prisma/client";
import { generateGrade4Math } from "../src/data/grade4-math";
import type { QuestGroup } from "../src/data/content-types";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Grade 4 Mathematics...");

  // Get the guild
  const guild = await prisma.guild.findUnique({
    where: { slug: "arizen-international" },
    select: { id: true },
  });

  if (!guild) {
    console.error("❌ Guild 'arizen-international' not found");
    process.exit(1);
  }

  const questsData = generateGrade4Math();
  console.log(`   Generated ${questsData.length} quest groups`);

  // The Admin API looks for theme slug = `g${gradeId}-${slugify(subjectName)}`
  // For Grade 4 Mathematics: g4-mathematics
  const targetThemeSlug = "g4-mathematics";

  // Find or create the theme with the EXACT slug the Admin API expects
  const theme = await prisma.theme.upsert({
    where: { slug: targetThemeSlug },
    update: {},
    create: {
      guildId: guild.id,
      title: "Mathematics",
      slug: targetThemeSlug,
      description: "Grade 4 Mathematics — Whole Numbers (Sub-strand 1.1)",
      grade: 4,
      status: "PUBLISHED",
      themeSubjects: {
        create: [{ subject: "Mathematics" }],
      },
    },
  });

  console.log(`   Theme: ${theme.slug} (${theme.title})`);

  let totalQuests = 0;
  let totalLessons = 0;

  for (const questData of questsData) {
    // Create or update the quest
    const questSlug = `${questData.slug}-g4`;

    const quest = await prisma.quest.upsert({
      where: { slug: questSlug },
      update: {},
      create: {
        themeId: theme.id,
        title: questData.title,
        slug: questSlug,
        description: questData.description,
        questType: questData.questType,
        orderIndex: questData.orderIndex,
        xpReward: questData.xpReward,
        cbcMapping: questData.cbcMapping,
        status: "PUBLISHED",
      },
    });

    totalQuests++;

    for (const lessonData of questData.lessons) {
      // Create or update the lesson
      // Lesson unique constraint: [questId, slug]
      const lessonSlug = `${lessonData.slug}-g4`;

      await prisma.lesson.upsert({
        where: {
          questId_slug: {
            questId: quest.id,
            slug: lessonSlug,
          },
        },
        update: {},
        create: {
          questId: quest.id,
          title: lessonData.title,
          slug: lessonSlug,
          description: lessonData.description,
          contentBlocks: lessonData.contentBlocks as any,
          cbcMapping: lessonData.cbcMapping as any,
          difficulty: lessonData.difficulty as any,
          xpReward: lessonData.xpReward as any,
          status: "PUBLISHED",
          orderIndex: 1,
          estimatedDurationMinutes: 30,
        },
      });

      totalLessons++;
    }
  }

  console.log(`✅ Seeded: ${totalQuests} quests, ${totalLessons} lessons`);
  console.log(`   Theme: ${theme.slug}`);
  console.log(`   Subject: Mathematics (via ThemeSubject)`);
  console.log(`   Grade: 4`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
