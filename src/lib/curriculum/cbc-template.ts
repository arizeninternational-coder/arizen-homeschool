// Shared constants and helpers for CBC curriculum CSV import.
// Used by:
//   - src/app/api/admin/curriculum/upload/route.ts
//   - src/app/dashboard/admin/grades/[gradeId]/[subjectSlug]/page.tsx
//   - src/app/api/admin/curriculum/lessons/route.ts
//   - src/app/api/admin/lessons/[id]/route.ts

// ── Subject name map (slug → display name) ──
export const SUBJECT_NAME_MAP: Record<string, string> = {
  mathematics: "Mathematics",
  "mathematical-activities": "Mathematical Activities",
  english: "English",
  "english-language": "English Language",
  "english-language-activities": "English Language Activities",
  kiswahili: "Kiswahili",
  "kiswahili-language": "Kiswahili Language",
  "kiswahili-language-activities": "Kiswahili Language Activities",
  science: "Science",
  "science-technology": "Science & Technology",
  "social-studies": "Social Studies",
  environmental: "Environmental",
  "environmental-activities": "Environmental Activities",
  movement: "Movement",
  "movement-activities": "Movement Activities",
  hygiene: "Hygiene & Nutrition",
  "hygiene-nutrition": "Hygiene & Nutrition",
  agriculture: "Agriculture",
  "agriculture-nutrition": "Agriculture & Nutrition",
  "creative-arts": "Creative Arts",
  "religious-education": "IRE / CRE",
  ire: "IRE",
  cre: "CRE",
  hpe: "HPE",
  business: "Business Studies",
  computing: "Computing",
  literacy: "Literacy",
  "movement-creative": "Movement & Creative",
  "pre-technical": "Pre-Technical Studies",
};

// ── CSV column normalization map ──
// Maps normalized header strings to canonical field keys.
// Normalization: lowercase, trim, replace spaces/hyphens/underscores with single underscore,
// strip non-alphanumeric except underscore.
export const COLUMN_MAP: Record<string, string> = {
  // Curriculum metadata
  curriculum_version: "curriculumVersion",
  curriculumversion: "curriculumVersion",
  version: "curriculumVersion",
  country: "country",
  system: "system",

  // Core identification
  grade: "grade",
  term: "term",
  week: "week",
  subject: "subject",
  strand: "strand",
  sub_strand: "subStrand",
  "sub-strand": "subStrand",

  // Learning outcomes
  specific_learning_outcome: "specificLearningOutcome",
  specificlearningoutcome: "specificLearningOutcome",
  "specific-learning-outcome": "specificLearningOutcome",
  specific_outcome: "specificLearningOutcome",
  learning_outcome: "learningOutcome",
  learningoutcome: "learningOutcome",
  "learning-outcome": "learningOutcome",
  outcome: "learningOutcome",
  key_inquiry_question: "keyInquiryQuestion",
  keyinquiryquestion: "keyInquiryQuestion",
  "key-inquiry-question": "keyInquiryQuestion",
  inquiry_question: "keyInquiryQuestion",

  // Pedagogy
  suggested_learning_experience: "suggestedLearningExperience",
  suggestedlearningexperience: "suggestedLearningExperience",
  "suggested-learning-experience": "suggestedLearningExperience",
  learning_experience: "suggestedLearningExperience",
  suggested_activities: "suggestedLearningExperience",

  // Activity
  activity_title: "activityTitle",
  activitytitle: "activityTitle",
  "activity-title": "activityTitle",
  activity_instructions: "activityInstructions",
  activityinstructions: "activityInstructions",
  "activity-instructions": "activityInstructions",

  // Assessment
  assessment_method: "assessmentMethod",
  assessmentmethod: "assessmentMethod",
  "assessment-method": "assessmentMethod",
  assessment_criteria: "assessmentCriteria",
  assessmentcriteria: "assessmentCriteria",
  "assessment-criteria": "assessmentCriteria",

  // CBC cross-cutting
  core_competencies: "coreCompetencies",
  corecompetencies: "coreCompetencies",
  "core-competencies": "coreCompetencies",
  competencies: "coreCompetencies",
  values: "values",
  pertinent_and_contemporary_issues: "pertinentAndContemporaryIssues",
  pertinentandcontemporaryissues: "pertinentAndContemporaryIssues",
  "pertinent-and-contemporary-issues": "pertinentAndContemporaryIssues",
  pcis: "pertinentAndContemporaryIssues",
  learning_resources: "learningResources",
  learningresources: "learningResources",
  "learning-resources": "learningResources",
  resources: "learningResources",
  parental_engagement: "parentalEngagement",
  parentalengagement: "parentalEngagement",
  "parental-engagement": "parentalEngagement",
  parent_guide: "parentalEngagement",

  // Lesson
  lesson_title: "lessonTitle",
  lessontitle: "lessonTitle",
  "lesson-title": "lessonTitle",
  lesson: "lessonTitle",

  // Quest
  quest_title: "questTitle",
  questtitle: "questTitle",
  "quest-title": "questTitle",
  quest_instructions: "questInstructions",
  questinstructions: "questInstructions",
  "quest-instructions": "questInstructions",

  // Reflection
  reflection_prompt: "reflectionPrompt",
  reflectionprompt: "reflectionPrompt",
  "reflection-prompt": "reflectionPrompt",

  // Difficulty & duration
  difficulty: "difficulty",
  estimated_duration: "estimatedDuration",
  estimatedduration: "estimatedDuration",
  "estimated-duration": "estimatedDuration",
  duration: "estimatedDuration",

  // Rewards
  reward_xp: "rewardXp",
  rewardxp: "rewardXp",
  "reward-xp": "rewardXp",
  xp: "rewardXp",
  reward_coins: "rewardCoins",
  rewardcoins: "rewardCoins",
  "reward-coins": "rewardCoins",
  coins: "rewardCoins",
  reward_stars: "rewardStars",
  rewardstars: "rewardStars",
  "reward-stars": "rewardStars",
  stars: "rewardStars",

  // Source & review
  source_reference: "sourceReference",
  sourcereference: "sourceReference",
  "source-reference": "sourceReference",
  reference: "sourceReference",
  review_status: "reviewStatus",
  reviewstatus: "reviewStatus",
  "review-status": "reviewStatus",

  // Video
  video_search_keywords: "videoSearchKeywords",
  videosearchkeywords: "videoSearchKeywords",
  "video-search-keywords": "videoSearchKeywords",
  video_keywords: "videoSearchKeywords",
  video_required: "videoRequired",
  videorequired: "videoRequired",
  "video-required": "videoRequired",

  // Offline
  offline_activity: "offlineActivity",
  offlineactivity: "offlineActivity",
  "offline-activity": "offlineActivity",
};

// ── Required columns (normalized) ──
// These must be present in the CSV (after normalization) for the file to be accepted.
export const REQUIRED_COLUMNS = [
  "grade",
  "subject",
  "strand",
  "sub_strand",
  "specific_learning_outcome",
  "lesson_title",
  "term",
  "week",
  "quest_title",
  "difficulty",
  "estimated_duration",
];

// ── Required fields on ParsedRow (after mapping) ──
// These are checked after column mapping. If missing, the row is invalid.
export const REQUIRED_FIELDS: Array<{ new: string; old?: string }> = [
  { new: "grade" },
  { new: "subject" },
  { new: "strand" },
  { new: "subStrand" },
  { new: "specificLearningOutcome", old: "learningOutcome" },
  { new: "lessonTitle" },
  { new: "term" },
  { new: "week" },
  { new: "questTitle" },
  { new: "difficulty" },
  { new: "estimatedDuration" },
];

// ── Accepted difficulty values ──
export const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

// ── Normalize a CSV header string ──
export function normalizeHeader(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "") // strip BOM
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_") // spaces and hyphens → underscore
    .replace(/[^a-z0-9_]/g, ""); // strip non-alphanumeric
}

// ── Parse a comma-separated string into a clean array ──
export function parseArrayField(value: string | undefined): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Parse video_required boolean ──
export function parseBooleanField(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === "yes" || v === "true" || v === "1" || v === "y";
}

// ── Build the structured contentBlocks object from parsed row data ──
export interface CbcContentBlocks {
  importSource: string;
  curriculum: {
    version: string;
    country: string;
    system: string;
    grade: string;
    term: string;
    week: string;
    subject: string;
    strand: string;
    subStrand: string;
    specificLearningOutcome: string;
    keyInquiryQuestion: string;
    suggestedLearningExperience: string;
    coreCompetencies: string[];
    values: string[];
    pertinentAndContemporaryIssues: string[];
    learningResources: string[];
    parentalEngagement: string;
  };
  lessonShell: {
    activityTitle: string;
    activityInstructions: string;
    assessmentMethod: string;
    assessmentCriteria: string;
    questTitle: string;
    questInstructions: string;
    reflectionPrompt: string;
    offlineActivity: string;
  };
  rewards: {
    xp: number;
    coins: number;
  };
  video: {
    searchKeywords: string;
    required: boolean;
  };
  source: {
    reference: string;
    reviewStatus: string;
  };
}

export function buildContentBlocks(row: {
  curriculumVersion?: string;
  country?: string;
  system?: string;
  grade: string;
  term: string;
  week: string;
  subject: string;
  strand: string;
  subStrand: string;
  specificLearningOutcome: string;
  keyInquiryQuestion?: string;
  suggestedLearningExperience?: string;
  coreCompetencies?: string;
  values?: string;
  pertinentAndContemporaryIssues?: string;
  learningResources?: string;
  parentalEngagement?: string;
  activityTitle?: string;
  activityInstructions?: string;
  assessmentMethod?: string;
  assessmentCriteria?: string;
  questTitle: string;
  questInstructions?: string;
  reflectionPrompt?: string;
  offlineActivity?: string;
  rewardXp?: string;
  rewardCoins?: string;
  videoSearchKeywords?: string;
  videoRequired?: string;
  sourceReference?: string;
  reviewStatus?: string;
}): CbcContentBlocks {
  return {
    importSource: "csv",
    curriculum: {
      version: row.curriculumVersion || "",
      country: row.country || "Kenya",
      system: row.system || "CBC",
      grade: row.grade,
      term: row.term,
      week: row.week,
      subject: row.subject,
      strand: row.strand,
      subStrand: row.subStrand,
      specificLearningOutcome: row.specificLearningOutcome,
      keyInquiryQuestion: row.keyInquiryQuestion || "",
      suggestedLearningExperience: row.suggestedLearningExperience || "",
      coreCompetencies: parseArrayField(row.coreCompetencies),
      values: parseArrayField(row.values),
      pertinentAndContemporaryIssues: parseArrayField(row.pertinentAndContemporaryIssues),
      learningResources: parseArrayField(row.learningResources),
      parentalEngagement: row.parentalEngagement || "",
    },
    lessonShell: {
      activityTitle: row.activityTitle || "",
      activityInstructions: row.activityInstructions || "",
      assessmentMethod: row.assessmentMethod || "",
      assessmentCriteria: row.assessmentCriteria || "",
      questTitle: row.questTitle,
      questInstructions: row.questInstructions || "",
      reflectionPrompt: row.reflectionPrompt || "",
      offlineActivity: row.offlineActivity || "",
    },
    rewards: {
      xp: parseInt(row.rewardXp || "0", 10) || 0,
      coins: parseInt(row.rewardCoins || "0", 10) || 0,
    },
    video: {
      searchKeywords: row.videoSearchKeywords || "",
      required: parseBooleanField(row.videoRequired),
    },
    source: {
      reference: row.sourceReference || "",
      reviewStatus: row.reviewStatus || "DRAFT",
    },
  };
}

// ── Generate CSV template string ──
export function generateCsvTemplate(
  gradeNum: number,
  subjectName: string,
): string {
  const escapeCsv = (v:string)=>{
    if(v==""||v==null)return "";
    const s=v.toString();
    if(/[",\n]/.test(s)){
      return "\""+s.replace(/"/g,"\"\"")+"\"";
    }
    return s;
  };
  const headers = [
    "curriculum_version",
    "country",
    "system",
    "grade",
    "term",
    "week",
    "subject",
    "strand",
    "sub_strand",
    "specific_learning_outcome",
    "key_inquiry_question",
    "suggested_learning_experience",
    "activity_title",
    "activity_instructions",
    "assessment_method",
    "assessment_criteria",
    "core_competencies",
    "values",
    "pertinent_and_contemporary_issues",
    "learning_resources",
    "parental_engagement",
    "lesson_title",
    "quest_title",
    "quest_instructions",
    "reflection_prompt",
    "difficulty",
    "estimated_duration",
    "reward_xp",
    "reward_coins",
    "source_reference",
    "review_status",
    "video_search_keywords",
    "video_required",
    "offline_activity",
  ];

  const example = [
    escapeCsv("1"),
    escapeCsv("Kenya"),
    escapeCsv("CBC"),
    escapeCsv(String(gradeNum)),
    escapeCsv("Term 1"),
    escapeCsv("Week 1"),
    escapeCsv(subjectName),
    escapeCsv("Number Concept"),
    escapeCsv("Counting"),
    escapeCsv("Learners should be able to count objects up to 100"),
    escapeCsv("How do we count things around us?"),
    escapeCsv("Use physical objects like beads and stones for counting"),
    escapeCsv("Counting with Beads"),
    escapeCsv("Provide beads in groups of 10. Learners count aloud."),
    escapeCsv("Observation and oral questioning"),
    escapeCsv("Learner counts accurately up to 100"),
    escapeCsv("Communication and Collaboration, Critical Thinking"),
    escapeCsv("Responsibility, Respect"),
    escapeCsv("Environmental awareness"),
    escapeCsv("Beads, number charts, exercise books"),
    escapeCsv("Parents help children count household items"),
    escapeCsv("Counting to 100"),
    escapeCsv("Numbers Quest"),
    escapeCsv("Explore numbers in daily life"),
    escapeCsv("What numbers did you see today?"),
    escapeCsv("easy"),
    escapeCsv("30"),
    escapeCsv("50"),
    escapeCsv("10"),
    escapeCsv("CBC Grade " + gradeNum + " " + subjectName),
    escapeCsv("DRAFT"),
    escapeCsv("counting numbers kindergarten"),
    escapeCsv("no"),
    escapeCsv("Count items at home and write the total"),
  ];

  return [headers.join(","), example.join(",")].join("\n");
}

// ── Safely read a field from contentBlocks (handles both old flat and new structured shapes) ──
export function getContentBlockField(
  contentBlocks: any,
  section: "curriculum" | "lessonShell" | "rewards" | "video" | "source" | "flat",
  field: string,
): any {
  if (!contentBlocks) return undefined;

  // Try new structured shape first
  if (section !== "flat" && contentBlocks[section]) {
    const val = contentBlocks[section][field];
    if (val !== undefined && val !== null && val !== "") return val;
  }

  // Try flat keys (backward compat)
  const flatKey = section === "curriculum"
    ? field
    : section === "lessonShell"
    ? field
    : section === "rewards"
    ? field
    : section === "video"
    ? field
    : field;

  if (contentBlocks[flatKey] !== undefined) return contentBlocks[flatKey];

  // Legacy key mappings
  const legacyMap: Record<string, string> = {
    specificLearningOutcome: "learningOutcome",
    learningOutcome: "specificLearningOutcome",
    rewardXp: "xpReward",
    rewardCoins: "coins",
    videoSearchKeywords: "videoKeywords",
  };

  const legacyKey = legacyMap[flatKey];
  if (legacyKey && contentBlocks[legacyKey] !== undefined) {
    return contentBlocks[legacyKey];
  }

  return undefined;
}
