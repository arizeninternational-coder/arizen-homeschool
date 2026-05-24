// @ts-nocheck
// Content generation data types and structures
// These define the syllabus → lesson mapping for automated content creation

export interface SyllabusTopic {
  id: string;
  subject: string;
  strand: string;
  subStrand: string;
  grade: number;
  sloCode: string;
  sloDescription: string;
  competencies: string[];
  values: string[];
  pcis: string[];
  difficulty: number; // 1-5
  cognitiveLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
  estimatedMinutes: number;
}

export interface LessonTemplate {
  topic: SyllabusTheme;
  title: string;
  slug: string;
  description: string;
  contentBlocks: GeneratedContentBlock[];
  xpReward: { base: number };
  difficulty: {
    complexityScore: number;
    cognitiveLevel: string;
    prerequisiteLoad: number;
    abstractness: number;
  };
  cbcMapping: {
    subjects: string[];
    strands: Record<string, string[]>;
    subStrands: Record<string, string[]>;
    specificLearningOutcomes: string[];
    coreCompetencies: string[];
    coreValues: string[];
    pertinentContemporaryIssues: string[];
    difficultyLevel: number;
    cognitiveLevel: string;
  };
}

export interface GeneratedContentBlock {
  id: string;
  type: "text" | "image" | "quiz" | "experiment" | "journal" | "interactive" | "audio" | "video" | "diagram";
  data: Record<string, unknown>;
}

export interface QuestGroup {
  id: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
  questType: "MAIN" | "SIDE" | "CHALLENGE";
  theme: string;
  grade: number;
  subjects: string[];
  xpReward: { base: number };
  lessons: LessonTemplate[];
  cbcMapping: {
    subjects: string[];
    strands: string[];
    subStrands: string[];
    specificLearningOutcomes: string[];
    coreCompetencies: string[];
    coreValues: string[];
    pertinentContemporaryIssues: string[];
  };
}

export interface ThemeGroup {
  id: string;
  title: string;
  slug: string;
  description: string;
  drivingQuestion: string;
  durationWeeks: number;
  grade: number;
  subjects: string[];
  quests: QuestGroup[];
}

// Grade-specific UI configuration
export const gradeConfig: Record<number, {
  uiMode: "playful" | "transitional" | "rpg" | "advanced";
  lessonDurationRange: [number, number]; // min, max minutes
  contentBlocksPerLesson: [number, number];
  xpMultiplier: number;
  tone: string;
  quizStyle: "picture" | "text" | "mixed" | "challenge";
  hasExperiments: boolean;
  hasJournaling: boolean;
}> = {
  2: {
    uiMode: "playful",
    lessonDurationRange: [20, 35],
    contentBlocksPerLesson: [3, 4],
    xpMultiplier: 0.8,
    tone: "warm, encouraging, story-driven",
    quizStyle: "picture",
    hasExperiments: true,
    hasJournaling: true,
  },
  5: {
    uiMode: "rpg",
    lessonDurationRange: [30, 50],
    contentBlocksPerLesson: [4, 6],
    xpMultiplier: 1.0,
    tone: "adventurous, quest-driven, analytical",
    quizStyle: "mixed",
    hasExperiments: true,
    hasJournaling: true,
  },
};

export const subjectLabels: Record<string, string> = {
  mathematics: "Mathematics",
  english: "English",
  kiswahili: "Kiswahili",
  environmental: "Environmental Activities",
  hygiene_nutrition: "Hygiene and Nutrition",
  movement: "Movement Activities",
  science_technology: "Science and Technology",
  agriculture_nutrition: "Agriculture and Nutrition",
  social_studies: "Social Studies",
  creative_arts: "Creative Arts",
};

export const subjectThemes: Record<string, string[]> = {
  mathematics: ["Numbers Everyday", "Measuring Our World", "Shape Detectives", "Math in the Market"],
  english: ["Story Time", "Word Explorers", "Reading Adventures", "Writing Workshop"],
  kiswahili: ["Hadisi za Kiswahili", "Sarufi Safari", "Kuandika kwa Furaha", "Maneno Mapya"],
  environmental: ["Weather Watchers", "Our Natural World", "Caring for Our Environment"],
  hygiene_nutrition: ["My Healthy Body", "Safe and Clean", "Food Heroes"],
  movement: ["Moving and Grooving", "Game Time", "Fitness Fun"],
  science_technology: ["Living Things Lab", "Matter and Energy", "Digital Explorers"],
  agriculture_nutrition: ["Growing Food", "Farm to Table", "Water Wise"],
  social_studies: ["Our Community", "Our Country Kenya", "Maps and Places"],
  creative_arts: ["Art Studio", "Music Makers", "Sports and Games"],
};
