// POST /api/admin/seed-grade4 — Seed Grade 4 Mathematics content (ADMIN only)
// Creates themes, quests, and lessons with PUBLISHED status and flat
// contentBlocks arrays that the student journey renderer can transform.
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

const GRADE = 4;
const SUBJECT_NAME = "Mathematics";
const THEME_SLUG = "g4-mathematics";

// CBC-mapped Grade 4 Mathematics Sub-strand 1.1 content
const GRADE_4_MATH = {
  strand: "Numbers",
  subStrand: "1.1 Whole Numbers",
  lessons: [
    {
      title: "Place Value and Number Reading",
      slug: "place-value",
      description: "Read and write multi-digit whole numbers using base-ten numerals, number names, and expanded form.",
      xpReward: 50,
      contentBlocks: [
        { type: "text", data: { content: "Place value is the value of each digit in a number. In 4,729: 4 = 4,000 (thousands), 7 = 700 (hundreds), 2 = 20 (tens), 9 = 9 (ones). Expanded form: 4,000 + 700 + 20 + 9 = 4,729." } },
        { type: "quiz", data: { question: "What does the digit 7 represent in the number 4,729?", options: ["7 ones", "7 tens", "7 hundreds", "7 thousands"], correctIndex: 2, explanation: "The 7 is in the hundreds place, so it represents 700." } },
        { type: "quiz", data: { question: "Which number is read as 'three thousand, forty-two'?", options: ["3,402", "3,042", "3,024", "3,240"], correctIndex: 1, explanation: "Three thousand = 3,000, forty-two = 42. So the number is 3,042." } },
        { type: "experiment", data: { title: "Build a Number", materials: ["paper", "pencil", "ruler"], steps: ["Draw 5 place value columns: Ten Thousands, Thousands, Hundreds, Tens, Ones", "Write the number 52,347 in the columns", "Read the number aloud to a partner", "Write it in expanded form: 50,000 + 2,000 + 300 + 40 + 7"] } },
        { type: "journal", data: { prompt: "Choose a 4-digit number from your daily life — a page number, a year, a bus number, a price. Break it down using place value and explain what each digit means.", placeholder: "My number is..." } },
      ],
    },
    {
      title: "Ordering and Rounding",
      slug: "ordering-rounding",
      description: "Compare two multi-digit numbers and round to the nearest ten, hundred, or thousand.",
      xpReward: 50,
      contentBlocks: [
        { type: "text", data: { content: "To compare numbers, start from the left. The number with the larger digit in the highest place value is greater. To rounding: look at the digit to the right of the place you're rounding to. If it's 5 or more, round up. If less than 5, round down." } },
        { type: "quiz", data: { question: "Which is larger: 5,621 or 5,261?", options: ["5,621 because 6 hundreds > 2 hundreds", "5,261 because 2 hundreds > 6 hundreds", "They are equal"], correctIndex: 0, explanation: "Compare from left to right. Both have 5 thousands. 6 hundreds > 2 hundreds." } },
        { type: "experiment", data: { title: "Number Line Rounding", materials: ["number line", "marker"], steps: ["Draw a number line from 0 to 1000", "Mark where 347 falls", "Determine: is 347 closer to 300 or 400?", "Round 347 to the nearest hundred: 300"] } },
        { type: "journal", data: { prompt: "A town has 3,456 people. Round this number to the nearest hundred. Then round it to the nearest thousand. Which rounding gives a better estimate for planning a community event? Why?", placeholder: "My reflection..." } },
      ],
    },
    {
      title: "Factors, Multiples and Even/Odd Numbers",
      slug: "factors-multiples",
      description: "Find factor pairs, generate multiples, and identify even/odd numbers.",
      xpReward: 60,
      contentBlocks: [
        { type: "text", data: { content: "Factors are numbers that divide evenly into another number. For 24: 1×24, 2×12, 3×8, 4×6. So the factors are 1, 2, 3, 4, 6, 8, 12, 24. Multiples of 3: 3, 6, 9, 12, 15, 18... Even numbers end in 0, 2, 4, 6, 8. Odd numbers end in 1, 3, 5, 7, 9." } },
        { type: "text", data: { content: "A prime number has exactly two factors: 1 and itself. 2, 3, 5, 7, 11 are prime. A composite number has more than two factors. 4, 6, 8, 9, 10 are composite." } },
        { type: "quiz", data: { question: "Which is a factor of 24?", options: ["5", "7", "8", "9"], correctIndex: 2, explanation: "8 × 3 = 24, so 8 is a factor." } },
        { type: "journal", data: { prompt: "List all the factors of 36. Which of these factors are even? Which are odd? Circle the prime factors.", placeholder: "Factors of 36..." } },
      ],
    },
    {
      title: "Number Patterns",
      slug: "number-patterns",
      description: "Identify, continue, and create number patterns using rules.",
      xpReward: 50,
      contentBlocks: [
        { type: "text", data: { content: "A number pattern follows a rule. To find the rule, look at how the numbers change. 2, 4, 6, 8, 10... rule: add 2. 3, 6, 9, 12, 15... rule: add 3. 100, 90, 80, 70, 60... rule: subtract 10." } },
        { type: "quiz", data: { question: "What comes next: 6, 12, 18, 24, ___?", options: ["25", "30", "32", "36"], correctIndex: 1, explanation: "The pattern adds 6 each time. 24 + 6 = 30." } },
        { type: "experiment", data: { title: "Create Your Own Pattern", materials: ["paper", "colored pencils"], steps: ["Create a pattern that adds 7 each time, starting from 7", "Write the first 10 numbers", "Write the rule in words", "Ask a partner to continue your pattern"] } },
        { type: "journal", data: { prompt: "Find a number pattern in your kitchen (e.g., tiles, items on a shelf). Describe the rule. Write the next 3 numbers in the pattern.", placeholder: "I noticed a pattern..." } },
      ],
    },
    {
      title: "Roman Numerals",
      slug: "roman-numerals",
      description: "Read, write, and convert Roman numerals (I, V, X) up to 100.",
      xpReward: 55,
      contentBlocks: [
        { type: "text", data: { content: "Roman numerals use letters: I = 1, V = 5, X = 10. When a smaller numeral is before a larger one, subtract: IV = 4 (5-1). When after, add: VI = 6 (5+1). Other combinations: IX = 9, XI = 11, XV = 15, XX = 20." } },
        { type: "text", data: { content: "To convert Roman numerals to Hindu-Arabic, work left to right. If a numeral is smaller than the next one, subtract it. Otherwise, add it. Example: XIV = 10 + (5-1) = 14. Example: XXI = 10 + 10 + 1 = 21." } },
        { type: "quiz", data: { question: "What is IV in Hindu-Arabic numerals?", options: ["6", "4", "9", "105"], correctIndex: 1, explanation: "I before V means 5 - 1 = 4." } },
        { type: "journal", data: { prompt: "Write your age in Roman numerals. Write the current year in Roman numerals. Write your birth year in Roman numerals.", placeholder: "My age..." } },
      ],
    },
  ],
};

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const logs: string[] = [];
  const errors: string[] = [];

  try {
    // 1. Get or create guild
    let guildId: string | null = null;
    const { data: guild } = await supabase
      .from("Guild")
      .select("id")
      .eq("slug", "arizen-international")
      .maybeSingle();

    if (guild) {
      guildId = guild.id;
    } else {
      const { data: newGuild } = await supabase
        .from("Guild")
        .insert({ name: "Arizen International", slug: "arizen-international", description: "CBC-aligned learning." })
        .select("id")
        .single();
      guildId = newGuild?.id || null;
    }

    if (!guildId) {
      return NextResponse.json({ error: "Could not find or create guild" }, { status: 500 });
    }
    logs.push(`Guild: ${guildId}`);

    // 2. Upsert theme with correct slug format
    let themeId: string | null = null;
    const { data: existingTheme } = await supabase
      .from("Theme")
      .select("id, slug")
      .eq("slug", THEME_SLUG)
      .maybeSingle();

    if (existingTheme) {
      themeId = existingTheme.id;
      logs.push(`Theme exists: ${THEME_SLUG}`);
    } else {
      const { data: newTheme, error: themeErr } = await supabase
        .from("Theme")
        .insert({
          guildId,
          title: `${SUBJECT_NAME} (Grade ${GRADE})`,
          slug: THEME_SLUG,
          description: `Grade ${GRADE} ${SUBJECT_NAME} CBC curriculum`,
          grade: GRADE,
          status: "PUBLISHED",
        })
        .select("id")
        .single();

      if (themeErr) {
        errors.push(`Theme: ${themeErr.message}`);
        return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
      }
      themeId = newTheme?.id || null;
      logs.push(`Theme created: ${THEME_SLUG}`);
    }

    if (!themeId) {
      return NextResponse.json({ error: "Could not create theme" }, { status: 500 });
    }

    // 3. Create ThemeSubject mapping
    const { data: existingTS } = await supabase
      .from("ThemeSubject")
      .select("id")
      .eq("themeId", themeId)
      .eq("subject", SUBJECT_NAME)
      .maybeSingle();

    if (!existingTS) {
      await supabase
        .from("ThemeSubject")
        .insert({ themeId, subject: SUBJECT_NAME });
      logs.push(`ThemeSubject: ${SUBJECT_NAME}`);
    }

    // 4. Upsert quest
    let questId: string | null = null;
    const questSlug = "quest-g4-mathematics-whole-numbers";
    const { data: existingQuest } = await supabase
      .from("Quest")
      .select("id")
      .eq("slug", questSlug)
      .maybeSingle();

    if (existingQuest) {
      questId = existingQuest.id;
      logs.push(`Quest exists: ${questSlug}`);
    } else {
      const { data: newQuest, error: questErr } = await supabase
        .from("Quest")
        .insert({
          themeId,
          title: `${GRADE_4_MATH.subStrand} Quest`,
          slug: questSlug,
          description: `Grade ${GRADE} ${SUBJECT_NAME}: ${GRADE_4_MATH.subStrand}`,
          questType: "MAIN",
          orderIndex: 1,
          xpReward: JSON.stringify({ base: 50 }),
          status: "PUBLISHED",
        })
        .select("id")
        .single();

      if (questErr) {
        errors.push(`Quest: ${questErr.message}`);
        return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
      }
      questId = newQuest?.id || null;
      logs.push(`Quest created: ${questSlug}`);
    }

    if (!questId) {
      return NextResponse.json({ error: "Could not create quest" }, { status: 500 });
    }

    // 5. Upsert lessons
    let created = 0, skipped = 0;
    for (const lessonData of GRADE_4_MATH.lessons) {
      const { data: existingLesson } = await supabase
        .from("Lesson")
        .select("id")
        .eq("slug", lessonData.slug)
        .maybeSingle();

      if (existingLesson) {
        skipped++;
        continue;
      }

      const contentBlocksJson = JSON.stringify(lessonData.contentBlocks);
      const lessonErr = await supabase
        .from("Lesson")
        .insert({
          questId,
          title: lessonData.title,
          slug: lessonData.slug,
          description: lessonData.description,
          contentBlocks: contentBlocksJson,
          xpReward: JSON.stringify({ base: lessonData.xpReward }),
          orderIndex: created + 1,
          status: "PUBLISHED",
        });

      if (lessonErr.error) {
        errors.push(`Lesson "${lessonData.title}": ${lessonErr.error.message}`);
      } else {
        created++;
      }
    }

    const summary = {
      theme: THEME_SLUG,
      quest: questSlug,
      lessonsCreated: created,
      lessonsSkipped: skipped,
      totalLessons: GRADE_4_MATH.lessons.length,
    };

    return NextResponse.json({
      success: true,
      message: `Grade 4 ${SUBJECT_NAME} seeded. Created ${created} lessons, skipped ${skipped} (already exist).`,
      summary,
      logs,
      ...(errors.length > 0 ? { errors } : {}),
    });
  } catch (err: any) {
    console.error("[SEED_GRADE4] Critical error:", err);
    return NextResponse.json({
      error: err.message || "Failed to seed Grade 4",
      logs,
      ...(errors.length > 0 ? { errors } : {}),
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Allow GET to trigger the seed via query param (one-time setup)
  const { searchParams } = new URL(req.url);
  if (searchParams.get("setup") === "grade4") {
    return POST(req);
  }
  return NextResponse.json({
    message: "Use POST to seed Grade 4 Mathematics content, or visit ?setup=grade4",
    usage: "Visit this endpoint with ?setup=grade4 to trigger the seed (admin auth required).",
    note: "Idempotent — existing records are not overwritten.",
  });
}
