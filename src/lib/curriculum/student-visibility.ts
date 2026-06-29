/**
 * Student Visibility Gate
 *
 * Determines whether a lesson should be visible to students.
 * A lesson is student-visible only if it passes ALL checks.
 */

const STUDENT_VISIBLE_QUALITY_STATUSES = [
  "STUDENT_READY",
  "GOLD_STANDARD_APPLIED",
  "REVIEW_READY",
];

const PLACEHOLDER_PATTERNS = [
  /\[content based on source pack\]/i,
  /\[detailed teaching content/i,
  /\[example to be added/i,
  /\[practice question/i,
  /\[detailed content/i,
  /\[content to be added/i,
  /\[topic\]/i,
  /\[title\]/i,
  /\[concept\]/i,
  /\[learning outcome\]/i,
  /\[strand\]/i,
  /\[sub-strand\]/i,
  /\[grade\]/i,
  /\[subject\]/i,
  /\[step \d+\]/i,
  /\[step type\]/i,
  /\[interaction type\]/i,
  /\[correct answer\]/i,
  /\[explanation\]/i,
  /\[hint\]/i,
  /\[prompt\]/i,
  /\[option \d+\]/i,
  /\[fill in the blank\]/i,
  /\[insert/i,
  /\[add .+ here\]/i,
  /\[write .+ here\]/i,
  /\[describe/i,
  /\[explain/i,
  /\[list/i,
  /\[provide/i,
  /\[include/i,
  /\[create/i,
  /\[design/i,
  /\[develop/i,
  /todo[: ]/i,
  /placeholder/i,
  /lorem ipsum/i,
  /xxx+/i,
  /yyy+/i,
  /zzz+/i,
  /tbd/i,
  /tba/i,
  /coming soon/i,
  /under construction/i,
  /work in progress/i,
  /wip/i,
];

export interface VisibilityResult {
  visible: boolean;
  reasons: string[];
}

/**
 * Check if a lesson is visible to students.
 * Returns { visible: false, reasons: [...] } if not visible.
 */
export function isLessonStudentVisible(lesson: any): VisibilityResult {
  const reasons: string[] = [];

  if (!lesson) {
    return { visible: false, reasons: ["Lesson not found"] };
  }

  // Parse contentBlocks
  let cb = lesson.contentBlocks;
  if (typeof cb === "string") {
    try { cb = JSON.parse(cb); } catch { return { visible: false, reasons: ["Invalid contentBlocks"] }; }
  }

  if (!cb || typeof cb !== "object") {
    return { visible: false, reasons: ["No contentBlocks"] };
  }

  // 1. Check aiMetadata.studentVisible flag
  const aiMeta = cb.aiMetadata || {};
  if (aiMeta.studentVisible !== true) {
    reasons.push("Not marked student-visible (aiMetadata.studentVisible !== true)");
  }

  // 2. Check qualityStatus
  if (!STUDENT_VISIBLE_QUALITY_STATUSES.includes(aiMeta.qualityStatus)) {
    reasons.push(`Quality status "${aiMeta.qualityStatus}" is not in allowed list: ${STUDENT_VISIBLE_QUALITY_STATUSES.join(", ")}`);
  }

  // 3. Check journey has exactly 10 steps
  const journey = cb.studentJourney || [];
  if (!Array.isArray(journey) || journey.length !== 10) {
    reasons.push(`studentJourney has ${journey.length || 0} steps (expected 10)`);
  }

  // 4. Check no placeholder text
  const allText = journey.map((s: any) =>
    `${s.studentText || ""} ${s.owlText || ""} ${s.content || ""}`
  ).join(" ");

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(allText)) {
      reasons.push(`Placeholder text found: "${allText.match(pattern)?.[0] || ""}"`);
      break;
    }
  }

  // 5. Check no reading comprehension contamination for non-English lessons
  const isEnglish = lesson.slug?.startsWith("g2-english") || cb.subject === "English";
  if (!isEnglish && allText.toLowerCase().includes("reading comprehension")) {
    reasons.push("Non-English lesson contains reading comprehension content (contamination)");
  }

  // 6. Check basic journey validation
  if (journey.length === 10) {
    const requiredSteps = ["welcome", "mission", "think_first", "learn", "connect", "example", "practice", "quick_check", "reflect", "complete"];
    const actualSteps = journey.map((s: any) => s.stepKey);
    for (let i = 0; i < requiredSteps.length; i++) {
      if (actualSteps[i] !== requiredSteps[i]) {
        reasons.push(`Step ${i + 1} is "${actualSteps[i]}" but expected "${requiredSteps[i]}"`);
      }
    }
  }

  return {
    visible: reasons.length === 0,
    reasons,
  };
}

/**
 * Get a human-readable status label for a lesson.
 */
export function getLessonStatusLabel(lesson: any): string {
  if (!lesson) return "Not Found";

  let cb = lesson.contentBlocks;
  if (typeof cb === "string") {
    try { cb = JSON.parse(cb); } catch { return "Invalid Data"; }
  }

  const aiMeta = cb?.aiMetadata || {};
  const journey = cb?.studentJourney || [];
  const draft = cb?.studentJourneyDraft || [];

  // Check if student-visible
  const visibility = isLessonStudentVisible(lesson);
  if (visibility.visible) {
    if (aiMeta.qualityStatus === "GOLD_STANDARD_APPLIED") return "Gold Standard";
    if (aiMeta.qualityStatus === "STUDENT_READY") return "Student Ready";
    return "Interactive Ready";
  }

  // Check specific issues
  if (journey.length === 0 && draft.length === 0) return "Shell Only";
  if (journey.length === 0 && draft.length > 0) return "Draft Only";
  if (journey.length > 0 && journey.length !== 10) return `Incomplete (${journey.length}/10)`;

  // Check contamination
  const allText = journey.map((s: any) => `${s.studentText || ""} ${s.owlText || ""}`).join(" ").toLowerCase();
  if (allText.includes("reading comprehension") && !lesson.slug?.startsWith("g2-english")) {
    return "Contaminated";
  }

  // Check placeholder
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(allText)) return "Has Placeholders";
  }

  if (aiMeta.reviewStatus === "NEEDS_REVISION") return "Needs Revision";
  if (aiMeta.qualityStatus === "GOLD_STANDARD_APPLIED") return "Gold Standard";

  return "Draft";
}
