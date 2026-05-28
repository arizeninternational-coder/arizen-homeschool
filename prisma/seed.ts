// Master seed script — creates ALL content for Grade 2 and Grade 5
// Run with: npx tsx prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { generateAllGrade2 } from "../src/data/content-generator";
import { generateAllGrade5 } from "../src/data/grade5-all";
import type { QuestGroup } from "../src/data/content-types";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Arizen Homeschool database...\n");

  // ── Cleanup existing content ──────────────────────────────
  console.log("🧹 Cleaning existing data...");
  await prisma.coinAwardTracking.deleteMany();
  await prisma.rewardRule.deleteMany();
  await prisma.studentInventory.deleteMany();
  await prisma.avatarItem.deleteMany();
  await prisma.studentAvatar.deleteMany();
  await prisma.coinTransaction.deleteMany();
  await prisma.studentWallet.deleteMany();
  await prisma.xpRecord.deleteMany();
  await prisma.reflection.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.sideQuest.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.themeSubject.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.learnerProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.guild.deleteMany();
  await prisma.cbcStrand.deleteMany();
  await prisma.cbcCompetency.deleteMany();
  await prisma.cbcValue.deleteMany();
  await prisma.cbcPci.deleteMany();

  // ── Guild ──────────────────────────────────────────────────
  const guild = await prisma.guild.create({
    data: {
      name: "Arizen International",
      slug: "arizen-international",
      description: "Arizen Homeschool Hub — CBC-aligned, gamified learning for Grades 1-8.",
    },
  });
  console.log(`✅ Guild: ${guild.name}`);

  const DEMO_PASSWORD_HASH = "$2a$10$hKjvSVKJZv85IPq9PVV6wOxXuX9v14sm0c5C5aN6XJ2E2qyOz/x5W"; // demo123
  // Victor (parent/admin)
  const victorUser = await prisma.user.create({
    data: {
      guildId: guild.id, name: "Victor Nyamu", email: "victor@arizen.local",
      passwordHash: DEMO_PASSWORD_HASH, role: "ADMIN" as any,
    },
  });

  // Ariadne (Grade 5) — her own login
  const ariadneUser = await prisma.user.create({
    data: {
      guildId: guild.id, name: "Ariadne", email: "ariadne@arizen.local",
      passwordHash: DEMO_PASSWORD_HASH, role: "LEARNER" as any,
    },
  });

  // Ariyana (Grade 2) — her own login
  const ariyanaUser = await prisma.user.create({
    data: {
      guildId: guild.id, name: "Ariyana", email: "ariyana@arizen.local",
      passwordHash: DEMO_PASSWORD_HASH, role: "LEARNER" as any,
    },
  });

  // ── Learner Profiles ──────────────────────────────────────
  const ariadne = await prisma.learnerProfile.create({
    data: {
      userId: ariadneUser.id, guildId: guild.id, grade: 5,
      displayName: "Ariadne", totalXp: 2450, currentStreak: 7, bestStreak: 14,
    },
  });
  const ariyana = await prisma.learnerProfile.create({
    data: {
      userId: ariyanaUser.id, guildId: guild.id, grade: 2,
      displayName: "Ariyana", totalXp: 890, currentStreak: 3, bestStreak: 8,
    },
  });
  console.log(`✅ Users: Victor (admin), Ariadne (G5, ${ariadne.totalXp} XP), Ariyana (G2, ${ariyana.totalXp} XP)`);

  // ── Generate all quest content ────────────────────────────
  const grade2Quests: QuestGroup[] = generateAllGrade2();
  const grade5Quests: QuestGroup[] = generateAllGrade5();

  console.log(`\n📚 Generated content:`);
  console.log(`   Grade 2: ${grade2Quests.length} quests`);
  console.log(`   Grade 5: ${grade5Quests.length} quests`);

  // Seed each grade — returns DB quest maps for progress seeding
  const g2DbQuests = await seedGrade(guild.id, 2, grade2Quests);
  const g5DbQuests = await seedGrade(guild.id, 5, grade5Quests);

  // ── CBC Reference Data ─────────────────────────────────────
  await seedCbcReferenceData();

  // ── Reward Rules ───────────────────────────────────────────
  await seedRewardRules();

  // ── Avatar Shop Items ──────────────────────────────────────
  await seedAvatarItems();

  // ── Sample progress for demo ──────────────────────────────
  await seedSampleProgress(ariadne.id, g2DbQuests, g5DbQuests);
  await seedSampleProgress(ariyana.id, g2DbQuests, g5DbQuests);

  // ── Summary ───────────────────────────────────────────────
  const themeCount = await prisma.theme.count();
  const questCount = await prisma.quest.count();
  const lessonCount = await prisma.lesson.count();
  const activityCount = await prisma.activity.count();
  const sideQuestCount = await prisma.sideQuest.count();
  const rewardRuleCount = await prisma.rewardRule.count();
  const avatarItemCount = await prisma.avatarItem.count();

  console.log("\n" + "═".repeat(50));
  console.log("✅ SEED COMPLETE!");
  console.log("═".repeat(50));
  console.log(`   Guilds: 1`);
  console.log(`   Users: 3`);
  console.log(`   Learner Profiles: 2`);
  console.log(`   Themes: ${themeCount}`);
  console.log(`   Quests: ${questCount}`);
  console.log(`   Lessons: ${lessonCount}`);
  console.log(`   Activities: ${activityCount}`);
  console.log(`   Side Quests: ${sideQuestCount}`);
  console.log(`   Reward Rules: ${rewardRuleCount}`);
  console.log(`   Avatar Shop Items: ${avatarItemCount}`);
  console.log("═".repeat(50));
}

// Returns array of { dbId, xpReward } for progress seeding
async function seedGrade(guildId: string, grade: number, quests: QuestGroup[]) {
  // Group quests by theme
  const themeMap: Record<string, QuestGroup[]> = {};
  for (const q of quests) {
    if (!themeMap[q.theme]) themeMap[q.theme] = [];
    themeMap[q.theme].push(q);
  }

  const dbQuests: { dbId: string; xpReward: any; title: string }[] = [];

  for (const [themeSlug, themeQuests] of Object.entries(themeMap)) {
    const first = themeQuests[0];
    const theme = await prisma.theme.create({
      data: {
        guildId,
        title: formatThemeTitle(themeSlug),
        slug: `${themeSlug}-${grade}`,
        description: first.description?.slice(0, 100) + "...",
        drivingQuestion: getDrivingQuestion(themeSlug),
        durationWeeks: themeQuests.length,
        grade,
        status: "PUBLISHED",
        themeSubjects: {
          create: [...new Set(themeQuests.flatMap(q => q.subjects))].map((s: string) => ({ subject: s })),
        },
      },
    });

    for (const questData of themeQuests) {
      const quest = await prisma.quest.create({
        data: {
          themeId: theme.id,
          title: questData.title,
          slug: `${questData.slug}-g${grade}`,
          description: questData.description,
          questType: questData.questType,
          orderIndex: questData.orderIndex,
          xpReward: questData.xpReward as any,
          cbcMapping: questData.cbcMapping as any,
          estimatedDurationMinutes: questData.lessons.reduce((s, l) => s + 30, 0),
          status: "PUBLISHED",
        },
      });

      dbQuests.push({ dbId: quest.id, xpReward: questData.xpReward, title: questData.title });

      for (const lessonData of questData.lessons) {
        await prisma.lesson.create({
          data: {
            questId: quest.id,
            title: lessonData.title,
            slug: `${lessonData.slug}-g${grade}`,
            description: lessonData.description,
            contentBlocks: lessonData.contentBlocks as any,
            cbcMapping: lessonData.cbcMapping as any,
            difficulty: lessonData.difficulty as any,
            xpReward: lessonData.xpReward as any,
            estimatedDurationMinutes: 30,
            orderIndex: 1,
            status: "PUBLISHED",
          },
        });
      }
    }
  }

  console.log(`   Grade ${grade}: ${Object.keys(themeMap).length} themes, ${quests.length} quests seeded ✅`);
  return dbQuests;
}

async function seedCbcReferenceData() {
  await prisma.cbcStrand.createMany({
    data: [
      // Grade 2
      { subject: "Mathematics", name: "Numbers" },
      { subject: "Mathematics", name: "Measurement" },
      { subject: "Mathematics", name: "Geometry" },
      { subject: "English", name: "Listening and Speaking" },
      { subject: "English", name: "Reading" },
      { subject: "English", name: "Language Structures and Grammar" },
      { subject: "English", name: "Writing" },
      { subject: "Kiswahili", name: "Kusikiliza na Kuzungumza" },
      { subject: "Kiswahili", name: "Kusoma" },
      { subject: "Kiswahili", name: "Sarufi" },
      { subject: "Kiswahili", name: "Kuandika" },
      { subject: "Environmental Activities", name: "Weather and the Environment" },
      { subject: "Environmental Activities", name: "Natural Environment & Physical Features" },
      { subject: "Environmental Activities", name: "Social Environment & Resources" },
      { subject: "Hygiene and Nutrition", name: "Health Practices and Personal Hygiene" },
      { subject: "Hygiene and Nutrition", name: "Food and Nutrition" },
      { subject: "Hygiene and Nutrition", name: "Medicine Safety & Common Illnesses" },
      { subject: "Movement Activities", name: "Locomotor and Non-Locomotor Skills" },
      { subject: "Movement Activities", name: "Ball Properties & Games" },
      { subject: "Movement Activities", name: "Rhythmic Movements and Gymnastics" },
      // Grade 5
      { subject: "Mathematics", name: "Numbers" },
      { subject: "Mathematics", name: "Measurement" },
      { subject: "Mathematics", name: "Geometry & Algebra" },
      { subject: "Science and Technology", name: "Living Things" },
      { subject: "Science and Technology", name: "Environment" },
      { subject: "Science and Technology", name: "Matter & Force" },
      { subject: "Science and Technology", name: "Digital Technology" },
      { subject: "Social Studies", name: "Physical Environment" },
      { subject: "Social Studies", name: "People and Culture" },
      { subject: "Social Studies", name: "Governance and Citizenship" },
      { subject: "Agriculture and Nutrition", name: "Conservation of Resources" },
      { subject: "Agriculture and Nutrition", name: "Food Production Processes" },
      { subject: "Agriculture and Nutrition", name: "Hygiene and Food Preparation" },
      { subject: "Creative Arts", name: "Creating and Execution" },
      { subject: "Creative Arts", name: "Performance and Display" },
      { subject: "Creative Arts", name: "Appreciation" },
    ],
  });

  await prisma.cbcCompetency.createMany({
    data: [
      { name: "critical_thinking", description: "Analyze and evaluate information" },
      { name: "problem_solving", description: "Find solutions to challenges" },
      { name: "creativity", description: "Generate original ideas" },
      { name: "communication", description: "Express ideas clearly" },
      { name: "collaboration", description: "Work effectively with others" },
      { name: "citizenship", description: "Contribute to community" },
      { name: "self_efficacy", description: "Believe in own abilities" },
      { name: "digital_literacy", description: "Use technology effectively" },
      { name: "learning_to_learn", description: "Develop learning strategies" },
    ],
  });

  await prisma.cbcValue.createMany({
    data: [
      { name: "love", description: "Care for others" },
      { name: "responsibility", description: "Be accountable" },
      { name: "respect", description: "Value others" },
      { name: "unity", description: "Work together" },
      { name: "peace", description: "Promote harmony" },
      { name: "patriotism", description: "Love for country" },
      { name: "integrity", description: "Be honest" },
      { name: "social_justice", description: "Fairness for all" },
    ],
  });

  await prisma.cbcPci.createMany({
    data: [
      { name: "environmental_education", description: "Protect the environment" },
      { name: "disaster_risk_reduction", description: "Prepare for disasters" },
      { name: "financial_literacy", description: "Manage money wisely" },
      { name: "gender_equality", description: "Equal opportunities for all" },
      { name: "peace_education", description: "Promote peace" },
    ],
  });

  console.log("   CBC Reference Data: ✅");
}

async function seedSampleProgress(
  learnerId: string,
  g2DbQuests: { dbId: string; xpReward: any; title: string }[],
  g5DbQuests: { dbId: string; xpReward: any; title: string }[]
) {
  // Pick first 3 quests from the appropriate grade
  const isGrade2 = (await prisma.learnerProfile.findUnique({ where: { id: learnerId } }))?.grade === 2;
  const sourceQuests = isGrade2 ? g2DbQuests : g5DbQuests;
  const selected = sourceQuests.slice(0, 3);

  for (const quest of selected) {
    await prisma.progress.create({
      data: {
        learnerId,
        questId: quest.dbId,
        masteryPercent: 100,
        completedAt: new Date(),
        lastAccessed: new Date(),
      },
    });

    const xpAmount = quest.xpReward?.base || 50;
    await prisma.xpRecord.create({
      data: {
        learnerId,
        sourceType: "QUEST" as any,
        sourceId: quest.dbId,
        amount: xpAmount,
        description: `Completed: ${quest.title}`,
      },
    });
  }
}

async function seedRewardRules() {
  const rules = [
    { action: "complete_lesson", coins: 10, xp: 50, dailyLimit: 0, description: "Coins and XP for completing a lesson" },
    { action: "complete_reflection", coins: 5, xp: 30, dailyLimit: 0, description: "Coins and XP for completing a reflection" },
    { action: "complete_quest", coins: 30, xp: 150, dailyLimit: 0, description: "Coins and XP for completing a quest" },
    { action: "complete_theme", coins: 50, xp: 300, dailyLimit: 0, description: "Coins and XP for completing an entire theme" },
    { action: "three_day_streak", coins: 15, xp: 0, dailyLimit: 0, description: "Bonus coins for a 3-day learning streak" },
    { action: "seven_day_streak", coins: 40, xp: 0, dailyLimit: 0, description: "Bonus coins for a 7-day learning streak" },
    { action: "parent_approved_activity", coins: 20, xp: 0, dailyLimit: 0, description: "Coins for parent-approved activity completion" },
  ];

  for (const rule of rules) {
    await prisma.rewardRule.create({ data: rule });
  }
  console.log(`   Reward Rules: ${rules.length} rules seeded ✅`);
}

async function seedAvatarItems() {
  const items = [
    { name: "Math Wizard Hat", category: "HATS" as any, price: 50, rarity: "RARE" as any, emoji: "🎩", unlockType: "LESSON_COUNT" as any, unlockRequirement: 5, unlockDescription: "Complete 5 math lessons" },
    { name: "Explorer Telescope", category: "LEARNING_TOOLS" as any, price: 80, rarity: "RARE" as any, emoji: "🔭", unlockType: "LESSON_COUNT" as any, unlockRequirement: 3, unlockDescription: "Complete 3 science lessons" },
    { name: "Scientist Goggles", category: "GLASSES" as any, price: 60, rarity: "RARE" as any, emoji: "🥽", unlockType: "LESSON_COUNT" as any, unlockRequirement: 3, unlockDescription: "Complete 3 science lessons" },
    { name: "Storyteller Cape", category: "CLOTHING" as any, price: 70, rarity: "EPIC" as any, emoji: "🧥", unlockType: "LESSON_COUNT" as any, unlockRequirement: 5, unlockDescription: "Complete 5 reading lessons" },
    { name: "Artist Brush", category: "LEARNING_TOOLS" as any, price: 40, rarity: "COMMON" as any, emoji: "🖌️", unlockType: "ALWAYS_AVAILABLE" as any, unlockRequirement: 0, unlockDescription: "Always available" },
    { name: "Nature Guardian Backpack", category: "ACCESSORIES" as any, price: 55, rarity: "RARE" as any, emoji: "🎒", unlockType: "LESSON_COUNT" as any, unlockRequirement: 3, unlockDescription: "Complete 3 environmental lessons" },
    { name: "Reading Champion Glasses", category: "GLASSES" as any, price: 45, rarity: "COMMON" as any, emoji: "👓", unlockType: "LESSON_COUNT" as any, unlockRequirement: 3, unlockDescription: "Complete 3 reading lessons" },
    { name: "Safari Explorer Hat", category: "HATS" as any, price: 35, rarity: "COMMON" as any, emoji: "🧢", unlockType: "ALWAYS_AVAILABLE" as any, unlockRequirement: 0, unlockDescription: "Always available" },
    { name: "Space Background", category: "BACKGROUNDS" as any, price: 100, rarity: "EPIC" as any, emoji: "🚀", unlockType: "XP_THRESHOLD" as any, unlockRequirement: 500, unlockDescription: "Earn 500 XP" },
    { name: "Library Background", category: "BACKGROUNDS" as any, price: 80, rarity: "RARE" as any, emoji: "📚", unlockType: "LESSON_COUNT" as any, unlockRequirement: 10, unlockDescription: "Complete 10 reading lessons" },
    { name: "Forest Background", category: "BACKGROUNDS" as any, price: 80, rarity: "RARE" as any, emoji: "🌲", unlockType: "LESSON_COUNT" as any, unlockRequirement: 5, unlockDescription: "Complete 5 environmental lessons" },
    { name: "Science Lab Background", category: "BACKGROUNDS" as any, price: 120, rarity: "EPIC" as any, emoji: "🔬", unlockType: "LESSON_COUNT" as any, unlockRequirement: 10, unlockDescription: "Complete 10 science lessons" },
    { name: "Robot Companion", category: "PETS" as any, price: 150, rarity: "LEGENDARY" as any, emoji: "🤖", unlockType: "LESSON_COUNT" as any, unlockRequirement: 20, unlockDescription: "Complete 20 lessons" },
    { name: "Rabbit Companion", category: "PETS" as any, price: 90, rarity: "RARE" as any, emoji: "🐰", unlockType: "LESSON_COUNT" as any, unlockRequirement: 10, unlockDescription: "Complete 10 lessons" },
    { name: "Soccer Boots", category: "SHOES" as any, price: 30, rarity: "COMMON" as any, emoji: "👟", unlockType: "ALWAYS_AVAILABLE" as any, unlockRequirement: 0, unlockDescription: "Always available" },
    { name: "Creative Crown", category: "HATS" as any, price: 200, rarity: "LEGENDARY" as any, emoji: "👑", unlockType: "LESSON_COUNT" as any, unlockRequirement: 50, unlockDescription: "Complete 50 lessons" },
    { name: "Kindness Hoodie", category: "CLOTHING" as any, price: 45, rarity: "COMMON" as any, emoji: "🧤", unlockType: "ALWAYS_AVAILABLE" as any, unlockRequirement: 0, unlockDescription: "Always available" },
    { name: "Star Backpack", category: "ACCESSORIES" as any, price: 50, rarity: "RARE" as any, emoji: "⭐", unlockType: "QUEST_COUNT" as any, unlockRequirement: 5, unlockDescription: "Complete 5 quests" },
    { name: "Globe Explorer Tool", category: "LEARNING_TOOLS" as any, price: 65, rarity: "RARE" as any, emoji: "🌍", unlockType: "LESSON_COUNT" as any, unlockRequirement: 5, unlockDescription: "Complete 5 geography lessons" },
    { name: "Music Maker Headphones", category: "ACCESSORIES" as any, price: 55, rarity: "RARE" as any, emoji: "🎧", unlockType: "LESSON_COUNT" as any, unlockRequirement: 5, unlockDescription: "Complete 5 creative arts lessons" },
  ];

  // Avoid duplicates on re-seed
  for (const item of items) {
    const existing = await prisma.avatarItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.avatarItem.create({ data: item });
    }
  }
  console.log(`   Avatar Shop Items: ${items.length} items seeded ✅`);
}

function formatThemeTitle(slug: string): string {
  const titles: Record<string, string> = {
    "g2-numbers-everyday": "Numbers in Everyday Life",
    "g2-math-in-market": "Math at the Market",
    "g2-measuring-world": "Measuring Our World",
    "g2-shape-detectives": "Shape Detectives",
    "g2-story-time": "Story Time Adventures",
    "g2-word-explorers": "Word Explorers",
    "g2-writing-workshop": "Writing Workshop",
    "g2-hadisi-kiswahili": "Hadisi za Kiswahili",
    "g2-sarufi-safari": "Sarufi Safari",
    "g2-kuandika-furaha": "Kuandika kwa Furaha",
    "g2-weather-watchers": "Weather Watchers",
    "g2-our-natural-world": "Our Natural World",
    "g2-our-community": "Our Community",
    "g2-my-healthy-body": "My Healthy Body",
    "g2-food-heroes": "Food Heroes",
    "g2-staying-safe": "Staying Safe and Healthy",
    "g2-moving-grooving": "Moving and Grooving",
    "g2-game-time": "Game Time",
    "g2-rhythmic-movements": "Rhythmic Movements",
    "g5-numbers-mastery": "Number Mastery",
    "g5-fractions-decimals": "Fractions and Percentages",
    "g5-measurement-masters": "Measurement Masters",
    "g5-geometry-algebra": "Geometry and Algebra",
    "g5-english-mastery": "English Mastery",
    "g5-writing-workshop": "Writing Workshop",
    "g5-living-things": "Living Things Lab",
    "g5-our-environment": "Our Environment",
    "g5-matter-force": "Matter and Force",
    "g5-digital-explorers": "Digital Explorers",
    "g5-our-country-kenya": "Our Country Kenya",
    "g5-people-culture": "People and Culture",
    "g5-governance-citizenship": "Governance and Citizenship",
    "g5-growing-food": "Growing Food",
    "g5-farm-to-table": "From Farm to Table",
    "g5-food-and-health": "Food and Health",
    "g5-art-studio": "Art Studio",
    "g5-performance-display": "Performance and Display",
    "g5-art-appreciation": "Art Appreciation",
    "g5-kiswahili-mastery": "Kiswahili Mastery",
    "g5-sarufi-kiswahili": "Sarufi ya Kiswahili",
    "g5-kuandika-kiswahili": "Kuandika kwa Kiswahili",
  };
  return titles[slug] || slug.replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function getDrivingQuestion(slug: string): string {
  const questions: Record<string, string> = {
    "g2-numbers-everyday": "How do numbers help us every day?",
    "g2-measuring-world": "Why do we measure things?",
    "g2-weather-watchers": "Why does the weather change?",
    "g2-our-natural-world": "How does nature affect our lives?",
    "g2-our-community": "Who makes our community work?",
    "g2-my-healthy-body": "How do I keep my body healthy?",
    "g5-numbers-mastery": "How can we count to one million?",
    "g5-living-things": "How do living things survive and grow?",
    "g5-our-country-kenya": "What makes Kenya special?",
    "g5-people-culture": "How do our cultures shape who we are?",
  };
  return questions[slug] || "How does this affect our daily lives?";
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
