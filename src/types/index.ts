export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Grade = (typeof GRADES)[number];

export const QUEST_TYPES = ["MAIN", "SIDE", "CHALLENGE"] as const;
export type QuestType = (typeof QUEST_TYPES)[number];

export const ACTIVITY_TYPES = [
  "EXPERIMENT", "PROJECT", "BUILD", "MODEL", "COOKING", "FIELDSTUDY", "SURVEY",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const SIDE_QUEST_TYPES = [
  "EXPERIMENT", "JOURNALING", "REALWORLDTASK", "DRAWING",
  "BUILDING", "INTERVIEW", "FIELDTRIP", "GAME", "PUZZLE",
] as const;
export type SideQuestType = (typeof SIDE_QUEST_TYPES)[number];

export const XP_SOURCE_TYPES = [
  "LESSON", "QUEST", "SIDEQUEST", "ACTIVITY", "REFLECTION", "STREAK", "BONUS",
] as const;
export type XpSourceType = (typeof XP_SOURCE_TYPES)[number];

export const CONTENT_BLOCK_TYPES = [
  "text", "video", "image", "quiz", "interactive", "journal",
  "experiment", "audio", "diagram", "embed",
] as const;
export type ContentBlockType = (typeof CONTENT_BLOCK_TYPES)[number];

export const SUBJECTS = [
  "language_arts", "math_logic", "stem", "life_skills",
  "kiswahili", "world_cultures",
] as const;
export type Subject = (typeof SUBJECTS)[number];

export const subjectLabels: Record<Subject, string> = {
  language_arts: "Language Arts",
  math_logic: "Math & Logic",
  stem: "STEM",
  life_skills: "Life Skills",
  kiswahili: "Kiswahili",
  world_cultures: "World Cultures",
};

export const questTypeColors: Record<QuestType, string> = {
  MAIN: "bg-primary text-white",
  SIDE: "bg-purple-100 text-purple-700",
  CHALLENGE: "bg-accent text-white",
};

export const gradeUIConfig: Record<Grade, { mode: string; description: string }> = {
  1: { mode: "playful", description: "Playful & story-driven" },
  2: { mode: "playful", description: "Playful & narrative" },
  3: { mode: "transitional", description: "Transitional" },
  4: { mode: "transitional", description: "Transitional" },
  5: { mode: "rpg", description: "RPG quest board" },
  6: { mode: "rpg", description: "RPG quest board" },
  7: { mode: "advanced", description: "Advanced explorer" },
  8: { mode: "advanced", description: "Advanced explorer" },
};
