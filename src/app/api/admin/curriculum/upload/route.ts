// POST /api/admin/curriculum/upload — Parse CSV, preview, and confirm import
// Actions: "preview" = parse & validate only, "confirm" = save to DB
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

// ── CSV Parser ──────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { row.push(current.trim()); current = ""; }
      else if (ch === "\n" || ch === "\r") {
        row.push(current.trim());
        if (row.some(c => c.length > 0)) rows.push(row);
        row = []; current = "";
        if (text[i + 1] === "\n") i++;
      } else { current += ch; }
    }
  }
  if (current || row.length > 0) { row.push(current.trim()); rows.push(row); }
  return rows.filter(r => r.some(c => c.length > 0));
}

import { normalizeHeader, COLUMN_MAP, REQUIRED_FIELDS, VALID_DIFFICULTIES, buildContentBlocks } from "@/lib/curriculum/cbc-template";

// ── Row validation ──────────────────────────────────────────────
interface ParsedRow {
  grade: string;
  subject: string;
  strand: string;
  subStrand: string;
  learningOutcome: string;
  specificLearningOutcome: string;
  keyInquiryQuestion: string;
  suggestedLearningExperience: string;
  lessonTitle: string;
  lessonOrder: string;
  term: string;
  week: string;
  activityTitle: string;
  activityInstructions: string;
  assessmentMethod: string;
  assessmentCriteria: string;
  questTitle: string;
  questInstructions: string;
  reflectionPrompt: string;
  learningResources: string;
  coreCompetencies: string;
  values: string;
  parentalEngagement: string;
  rewardCoins: string;
  rewardStars: string;
  rewardXp: string;
  estimatedDuration: string;
  difficulty: string;
  videoSearchKeywords: string;
  illustrationNotes: string;
  sourceReference: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  completenessScore: number;
}

function mapRow(raw: string[], headers: string[]): ParsedRow {
  const row: ParsedRow = {
    grade: "", subject: "", strand: "", subStrand: "",
    learningOutcome: "", specificLearningOutcome: "", keyInquiryQuestion: "",
    suggestedLearningExperience: "",
    lessonTitle: "", lessonOrder: "",
    term: "", week: "",
    activityTitle: "", activityInstructions: "",
    assessmentMethod: "", assessmentCriteria: "",
    questTitle: "", questInstructions: "",
    reflectionPrompt: "",
    learningResources: "", coreCompetencies: "", values: "",
    parentalEngagement: "",
    rewardCoins: "10", rewardStars: "0", rewardXp: "0",
    estimatedDuration: "", difficulty: "medium",
    videoSearchKeywords: "", illustrationNotes: "", sourceReference: "",
    valid: true, errors: [], warnings: [], isDuplicate: false,
    completenessScore: 0,
  };

  headers.forEach((h, i) => {
    const key = h.toLowerCase().trim().replace(/[^a-z0-9 _-]/g, "").replace(/\s+/g, " ").trim();
    const field = COLUMN_MAP[key] || COLUMN_MAP[key.replace(/\s/g, "")];
    if (field && raw[i] !== undefined) {
      (row as any)[field] = raw[i].trim();
    }
  });

  // Required field checks
  if (!row.lessonTitle) { row.errors.push("Missing lesson_title"); row.valid = false; }
  if (!row.grade) { row.errors.push("Missing grade"); row.valid = false; }
  if (!row.subject) { row.warnings.push("Missing subject (will use page subject)"); }

  // Default difficulty
  // Default difficulty using shared VALID_DIFFICULTIES
  if (row.difficulty) {
    const d = row.difficulty.toLowerCase();
    if (!VALID_DIFFICULTIES.includes(d)) {
      row.warnings.push(`Invalid difficulty "${row.difficulty}", using "medium"`);
      row.difficulty = "medium";
    }
  }

  // Validate numbers
  if (row.rewardCoins && isNaN(Number(row.rewardCoins))) {
    row.warnings.push("reward_coins is not a number, using 10");
    row.rewardCoins = "10";
  }
  if (row.rewardStars && isNaN(Number(row.rewardStars))) {
    row.warnings.push("reward_stars is not a number, using 0");
    row.rewardStars = "0";
  }
  if (row.rewardXp && isNaN(Number(row.rewardXp))) {
    row.warnings.push("reward_xp is not a number, using 0");
    row.rewardXp = "0";
  }
  if (row.estimatedDuration && isNaN(Number(row.estimatedDuration))) {
    row.warnings.push("estimated_duration is not a number, ignoring");
    row.estimatedDuration = "";
  }
  if (row.lessonOrder && isNaN(Number(row.lessonOrder))) {
    row.warnings.push("lesson_order is not a number, ignoring");
    row.lessonOrder = "";
  }

  // ── Completeness scoring for AI generation quality ──
  // Hard required: lesson_title, grade (already validated above)
  // Recommended for strong AI generation:
  const recommendedFields: { key: string; label: string; weight: number }[] = [
    { key: "strand", label: "strand", weight: 10 },
    { key: "subStrand", label: "sub-strand", weight: 10 },
    { key: "specificLearningOutcome", label: "specific_learning_outcome", weight: 15 },
    { key: "learningOutcome", label: "learning_outcome (fallback)", weight: 10 },
    { key: "keyInquiryQuestion", label: "key_inquiry_question", weight: 10 },
    { key: "suggestedLearningExperience", label: "suggested_learning_experience", weight: 10 },
    { key: "activityInstructions", label: "activity_instructions", weight: 10 },
    { key: "assessmentCriteria", label: "assessment_criteria", weight: 10 },
    { key: "assessmentMethod", label: "assessment_method", weight: 5 },
    { key: "reflectionPrompt", label: "reflection_prompt", weight: 10 },
  ];

  let score = 0;
  let maxScore = 0;
  const missingRecommended: string[] = [];

  for (const field of recommendedFields) {
    maxScore += field.weight;
    const val = (row as any)[field.key];
    if (val && String(val).trim().length > 0) {
      score += field.weight;
    } else {
      missingRecommended.push(field.label);
    }
  }

  row.completenessScore = Math.round((score / maxScore) * 100);

  // Warn if weak shell
  if (row.completenessScore < 50 && row.valid) {
    row.warnings.push(
      `Low completeness (${row.completenessScore}%). AI generation may be weaker because key CBC fields are missing: ${missingRecommended.slice(0, 4).join(", ")}`
    );
  } else if (missingRecommended.length > 0 && row.valid) {
    row.warnings.push(
      `Missing recommended fields: ${missingRecommended.slice(0, 3).join(", ")}${missingRecommended.length > 3 ? ` +${missingRecommended.length - 3} more` : ""}`
    );
  }

  return row;
}

// ── Validate row against route context ──────────────────────────
function validateRowAgainstContext(
  row: ParsedRow,
  routeGradeId: number,
  routeSubjectSlug: string,
  subjectNameMap: Record<string, string>,
): void {
  // Validate grade — extract the first number from the grade string
  // Supports: "2", "Grade 2", "grade 2", "G2", "Grade-2", etc.
  if (row.grade) {
    const match = row.grade.match(/\d+/);
    const rowGrade = match ? Number(match[0]) : NaN;
    if (!isNaN(rowGrade) && rowGrade !== routeGradeId) {
      row.errors.push(`Grade mismatch: file has grade ${row.grade} (parsed as ${rowGrade}), but this page is for grade ${routeGradeId}`);
      row.valid = false;
    }
  }

  // Validate subject (case-insensitive slug comparison)
  if (row.subject) {
    const rowSubjectSlug = row.subject.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    // Check if the row subject matches the route subject slug
    // Support: "Mathematics" → "mathematics", "Grade 2 Mathematics" → "mathematics", etc.
    const normalizedInput = row.subject.toLowerCase().trim();
    const routeSlugLower = routeSubjectSlug.toLowerCase();
    // Direct match by slug or by display name
    const matches = rowSubjectSlug === routeSlugLower
      || normalizedInput === routeSlugLower
      || normalizedInput === subjectNameMap[routeSlugLower]
      || Object.entries(subjectNameMap).some(
        ([slug, name]) => slug === routeSlugLower && (name.toLowerCase() === normalizedInput || rowSubjectSlug === slug)
      );
    if (!matches) {
      row.errors.push(`Subject mismatch: file has subject "${row.subject}", but this page is for ${subjectNameMap[routeSlugLower] || routeSubjectSlug}`);
      row.valid = false;
    }
  }
}

// ── Subject slug→name reverse map ───────────────────────────────
const SUBJECT_NAME_MAP: Record<string, string> = {
  mathematics: "Mathematics",
  english: "English",
  kiswahili: "Kiswahili",
  science: "Science",
  "social-studies": "Social Studies",
  environmental: "Environmental",
  movement: "Movement",
  hygiene: "Hygiene & Nutrition",
  "hygiene-nutrition": "Hygiene & Nutrition",
  agriculture: "Agriculture",
  "creative-arts": "Creative Arts",
  "religious-education": "IRE / CRE",
  business: "Business Studies",
  computing: "Computing",
  literacy: "Literacy",
  "movement-creative": "Movement & Creative",
  ire: "IRE",
  hpe: "HPE",
  "pre-technical": "Pre-Technical Studies",
  "science-tech": "Science & Technology",
};

// ── Helpers ─────────────────────────────────────────────────────
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60).replace(/-+$/, "");
}

function buildThemeSlug(gradeNum: number, subjectName: string): string {
  return `g${gradeNum}-${slugify(subjectName)}`;
}

async function getOrCreateGuild(): Promise<string | null> {
  const { data: existing } = await supabase.from("Guild").select("id").eq("slug", "arizen-international").single();
  if (existing) return existing.id;
  const { data: created } = await supabase.from("Guild").insert({
    name: "Arizen International", slug: "arizen-international", description: "CBC-aligned learning.",
  }).select("id").single();
  return created?.id || null;
}

async function getOrCreateTheme(guildId: string, gradeNum: number, subjectName: string): Promise<string | null> {
  const themeSlug = buildThemeSlug(gradeNum, subjectName);
  // Fix: scope lookup by guildId + slug (exact match, no loose ilike)
  const { data: existing } = await supabase
    .from("Theme")
    .select("id")
    .eq("guildId", guildId)
    .eq("slug", themeSlug)
    .eq("grade", gradeNum)
    .single();
  if (existing) return existing.id;
  const { data: created } = await supabase.from("Theme").insert({
    guildId, title: `Grade ${gradeNum} ${subjectName}`, slug: themeSlug,
    description: `Grade ${gradeNum} ${subjectName} curriculum`,
    grade: gradeNum, status: "DRAFT", durationWeeks: 4,
  }).select("id").single();
  return created?.id || null;
}

async function getOrCreateQuest(themeId: string, questTitle: string, index: number): Promise<string | null> {
  const slug = `${slugify(questTitle)}-q${index}`;
  // Fix: scope lookup by themeId + slug (not global slug)
  const { data: existing } = await supabase
    .from("Quest")
    .select("id")
    .eq("themeId", themeId)
    .eq("slug", slug)
    .single();
  if (existing) return existing.id;
  const { data: created } = await supabase.from("Quest").insert({
    themeId, title: questTitle, slug,
    description: questTitle, questType: "MAIN", orderIndex: index,
    xpReward: JSON.stringify({ base: 30 }), status: "DRAFT",
  }).select("id").single();
  return created?.id || null;
}

// ── Main handler ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const action = (formData.get("action") as string) || "preview";
    const previewDataRaw = formData.get("previewData") as string | null;

    // Extract page context from FormData (sent by the page on both preview and confirm)
    const routeGradeId = Number(formData.get("gradeId")) || 0;
    const routeSubjectSlug = (formData.get("subjectSlug") as string) || "";
    const routeSubjectName = SUBJECT_NAME_MAP[routeSubjectSlug.toLowerCase()] || routeSubjectSlug;

    // ── PREVIEW ──
    if (action === "preview") {
      if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

      const filename = file.name.toLowerCase();
      if (!filename.endsWith(".csv")) {
        return NextResponse.json({
          error: "Excel files are not supported yet. Please upload CSV.",
        }, { status: 400 });
      }

      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) {
        return NextResponse.json({ error: "File must have a header row and at least one data row" }, { status: 400 });
      }

      const headers = rows[0];

      // Normalize headers: remove BOM, trim, lowercase, replace spaces/hyphens with underscores
      const normalizedHeaders = headers.map(normalizeHeader);

      // Check for required columns using shared REQUIRED_FIELDS
      const headerFields = normalizedHeaders.flatMap(h => COLUMN_MAP[h] || COLUMN_MAP[h.replace(/\s/g, "")]).filter(Boolean);
      const missingRequired: string[] = [];
      // Handle both string and object required field definitions
      REQUIRED_FIELDS.forEach(req => {
        if (typeof req === 'string') {
          const found = headerFields.includes(req as string);
          if (!found) missingRequired.push(req as string);
        } else {
          const { new: newKey, old: oldKey } = req as { new: string; old?: string };
          const foundNew = headerFields.includes(newKey as string);
          const foundOld = oldKey ? headerFields.includes(oldKey as string) : false;
          if (!foundNew && !foundOld) missingRequired.push(newKey as string);
        }
      });
      if (missingRequired.length > 0) {
        return NextResponse.json({
          error: `Missing required column(s): ${missingRequired.join(", ")}`,
        }, { status: 400 });
      }


      const dataRows = rows.slice(1);
      const parsed: ParsedRow[] = dataRows.map(r => mapRow(r, headers));

      // Validate each row against the route context (grade + subject)
      for (const row of parsed) {
        validateRowAgainstContext(row, routeGradeId, routeSubjectSlug, SUBJECT_NAME_MAP);
      }

      // Check for duplicates: query existing lessons for this grade+subject
      // Build the theme slug to find existing lessons
      const themeSlug = buildThemeSlug(routeGradeId, routeSubjectName);
      const guildId = await getOrCreateGuild();
      let duplicateCount = 0;

      if (guildId) {
        const { data: existingTheme } = await supabase
          .from("Theme")
          .select("id")
          .eq("guildId", guildId)
          .eq("slug", themeSlug)
          .eq("grade", routeGradeId)
          .single();

        if (existingTheme) {
          const { data: existingQuests } = await supabase
            .from("Quest")
            .select("id")
            .eq("themeId", existingTheme.id);

          if (existingQuests && existingQuests.length > 0) {
            const questIds = existingQuests.map(q => q.id);
            const { data: existingLessons } = await supabase
              .from("Lesson")
              .select("slug")
              .in("questId", questIds);

            if (existingLessons) {
              const existingSlugs = new Set(existingLessons.map(l => l.slug));
              for (const row of parsed) {
                if (row.valid) {
                  const lessonSlug = `g${routeGradeId}-${slugify(routeSubjectName)}-${slugify(row.lessonTitle)}`;
                  if (existingSlugs.has(lessonSlug)) {
                    row.isDuplicate = true;
                    row.warnings.push("This lesson already exists (duplicate)");
                    duplicateCount++;
                  }
                }
              }
            }
          }
        }
      }

      const validCount = parsed.filter(r => r.valid && !r.isDuplicate).length;
      const invalidCount = parsed.filter(r => !r.valid).length;
      const warningCount = parsed.filter(r => r.warnings.length > 0 && r.valid).length;

      return NextResponse.json({
        success: true,
        action: "preview",
        totalRows: parsed.length,
        validRows: validCount,
        invalidRows: invalidCount,
        duplicateRows: duplicateCount,
        warningRows: warningCount,
        headers,
        rows: parsed,
      });
    }

    // ── CONFIRM ──
    if (action === "confirm") {
      if (!previewDataRaw) {
        return NextResponse.json({ error: "No preview data provided" }, { status: 400 });
      }

      const rows: ParsedRow[] = JSON.parse(previewDataRaw);
      // Only import valid, non-duplicate rows
      const toImport = rows.filter(r => r.valid && !r.isDuplicate);
      if (toImport.length === 0) {
        return NextResponse.json({ error: "No valid rows to import" }, { status: 400 });
      }

      const errors: string[] = [];
      let themesCreated = 0, themesSkipped = 0;
      let questsCreated = 0, questsSkipped = 0;
      let lessonsCreated = 0, lessonsSkipped = 0;

      // Get or create guild
      const guildId = await getOrCreateGuild();
      if (!guildId) return NextResponse.json({ error: "Could not find or create guild" }, { status: 500 });

      // Use the route context for theme creation (not CSV row data)
      const themeId = await getOrCreateTheme(guildId, routeGradeId, routeSubjectName);
      if (!themeId) {
        return NextResponse.json({ error: `Could not create theme for Grade ${routeGradeId} ${routeSubjectName}` }, { status: 500 });
      }
      themesCreated++;

      // Group by quest within this theme
      const questGroups = new Map<string, ParsedRow[]>();
      for (const row of toImport) {
        const qTitle = row.questTitle || "Default Quest";
        if (!questGroups.has(qTitle)) questGroups.set(qTitle, []);
        questGroups.get(qTitle)!.push(row);
      }

      let questIndex = 0;
      for (const [questTitle, questRows] of questGroups) {
        questIndex++;
        const questId = await getOrCreateQuest(themeId, questTitle, questIndex);
        if (!questId) { errors.push(`Could not create quest: ${questTitle}`); continue; }
        questsCreated++;

        for (const row of questRows) {
          const lessonSlug = `g${routeGradeId}-${slugify(routeSubjectName)}-${slugify(row.lessonTitle)}`;

          // Fix: scope duplicate check to questId + slug (not global)
          const { data: existingLesson } = await supabase
            .from("Lesson")
            .select("id")
            .eq("questId", questId)
            .eq("slug", lessonSlug)
            .single();

          if (existingLesson) {
            lessonsSkipped++;
            continue;
          }

          const structuredBlocks = buildContentBlocks(row);
          const contentBlocksObj = {
                      ...structuredBlocks,
                      // backward-compatible flat aliases (using route context for grade/subject)
                      grade: String(routeGradeId),
                      subject: routeSubjectName,
                      strand: row.strand,
                      subStrand: row.subStrand,
                      term: row.term,
                      week: row.week,
                      lessonOrder: row.lessonOrder,
                      learningOutcome: row.specificLearningOutcome || row.learningOutcome,
                      specificLearningOutcome: row.specificLearningOutcome,
                      keyInquiryQuestion: row.keyInquiryQuestion,
                      suggestedLearningExperience: row.suggestedLearningExperience,
                      assessmentMethod: row.assessmentMethod,
                      assessmentCriteria: row.assessmentCriteria,
                      learningResources: row.learningResources,
                      coreCompetencies: row.coreCompetencies,
                      values: row.values,
                      parentalEngagement: row.parentalEngagement,
                      activityTitle: row.activityTitle,
                      activityInstructions: row.activityInstructions,
                      questTitle: row.questTitle,
                      questInstructions: row.questInstructions,
                      reflectionPrompt: row.reflectionPrompt,
                      rewardCoins: row.rewardCoins,
                      rewardStars: row.rewardStars,
                      rewardXp: row.rewardXp,
                      estimatedDuration: row.estimatedDuration,
                      difficulty: row.difficulty,
                      videoSearchKeywords: row.videoSearchKeywords,
                      illustrationNotes: row.illustrationNotes,
                      sourceReference: row.sourceReference,
                      completenessScore: row.completenessScore,
                    };
                    const contentBlocks = JSON.stringify(contentBlocksObj);

          const { error: lessonErr } = await supabase.from("Lesson").insert({
            questId,
            title: row.lessonTitle,
            slug: lessonSlug,
            description: row.specificLearningOutcome || row.learningOutcome || row.lessonTitle,
            contentBlocks,
            xpReward: JSON.stringify({ base: parseInt(row.rewardXp) || parseInt(row.rewardCoins) || 10 }),
            difficulty: JSON.stringify({ level: row.difficulty || "medium", complexityScore: row.difficulty === "hard" ? 3 : row.difficulty === "easy" ? 1 : 2 }),
            estimatedDurationMinutes: parseInt(row.estimatedDuration) || null,
            orderIndex: parseInt(row.lessonOrder) || (lessonsCreated + 1),
            status: "DRAFT",
          });

          if (lessonErr) {
            errors.push(`Lesson "${row.lessonTitle}": ${lessonErr.message}`);
          } else {
            lessonsCreated++;
          }
        }
      }

      const summary = { themesCreated, themesSkipped, questsCreated, questsSkipped, lessonsCreated, lessonsSkipped };
      console.log("[CURRICULUM_UPLOAD]", JSON.stringify(summary));

      return NextResponse.json({
        success: true,
        action: "confirm",
        message: `Import complete. Created: ${themesCreated} modules, ${questsCreated} quests, ${lessonsCreated} lessons. Skipped (duplicates): ${lessonsSkipped} lessons.`,
        summary,
        ...(errors.length > 0 ? { errors } : {}),
      });
    }

    return NextResponse.json({ error: "Invalid action. Use 'preview' or 'confirm'." }, { status: 400 });
  } catch (err: any) {
    console.error("[CURRICULUM_UPLOAD] Error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
