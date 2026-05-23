import { Subject, QuestType, Grade } from "@/types";

// ── Core Entities ──────────────────────────────────────────────

export interface Guild {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: string | null;
  image: string | null;
}

export interface LearnerProfile {
  id: string;
  userId: string;
  guildId: string;
  grade: Grade;
  dateOfBirth: string | null;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export interface Theme {
  id: string;
  guildId: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  durationWeeks: number;
  drivingQuestion: string | null;
  grade: Grade;
  subjects: Subject[];
  createdAt: string;
  updatedAt: string;
}

export interface Quest {
  id: string;
  themeId: string;
  title: string;
  slug: string;
  description: string | null;
  questType: QuestType;
  orderIndex: number;
  xpReward: number;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  questId: string;
  title: string;
  slug: string;
  description: string | null;
  contentBlocks: ContentBlock[];
  cbcMapping: CbcMapping | null;
  difficulty: number;
  xpReward: number;
  estimatedDurationMinutes: number | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  lessonId: string | null;
  questId: string | null;
  sideQuestId: string | null;
  themeId: string;
  title: string;
  description: string | null;
  activityType: string;
  materialsList: unknown[];
  toolsList: unknown[];
  procedureSteps: unknown[];
  estimatedDurationMinutes: number | null;
  difficulty: number;
  cbcMapping: CbcMapping | null;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface SideQuest {
  id: string;
  questId: string | null;
  themeId: string;
  title: string;
  description: string | null;
  sideQuestType: string;
  activityBlocks: unknown[];
  cbcMapping: CbcMapping | null;
  difficulty: number;
  estimatedDurationMinutes: number | null;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

// ── Progress & Gamification ───────────────────────────────────

export interface Progress {
  id: string;
  learnerId: string;
  lessonId: string | null;
  questId: string | null;
  sideQuestId: string | null;
  activityId: string | null;
  masteryPercent: number;
  lastAccessed: string;
  completedAt: string | null;
}

export interface XpRecord {
  id: string;
  learnerId: string;
  sourceType: string;
  sourceId: string;
  amount: number;
  awardedAt: string;
}

export interface Badge {
  id: string;
  learnerId: string;
  badgeType: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  awardedAt: string;
}

export interface Streak {
  id: string;
  learnerId: string;
  streakType: string;
  currentCount: number;
  lastDate: string;
  bestCount: number;
}

// ── Content Engine ────────────────────────────────────────────

export interface ContentBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface CbcMapping {
  grade: number;
  subjects: Subject[];
  strands: Record<string, string[]>;
  subStrands: Record<string, string[]>;
  specificLearningOutcomes: string[];
  coreCompetencies: string[];
  coreValues: string[];
  pertinentContemporaryIssues: string[];
  difficultyLevel: number;
  cognitiveLevel: string;
}

// ── UI State ──────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
}

export interface ThemeCardData {
  id: string;
  title: string;
  coverImage: string | null;
  durationWeeks: number;
  drivingQuestion: string | null;
  grade: Grade;
  progress: number;
  questsTotal: number;
  questsCompleted: number;
}

export interface QuestCardData {
  id: string;
  title: string;
  description: string | null;
  questType: QuestType;
  orderIndex: number;
  xpReward: number;
  coverImage: string | null;
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
}
