"use client";

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from "react";

// ── XP Configuration ────────────────────────────────────────

export const XP_CONFIG = {
  // Base XP values
  lessonComplete: 50,
  questComplete: 150,
  quizCorrect: 25,
  quizAttempt: 5,
  experimentComplete: 75,
  journalEntry: 30,
  sideQuestComplete: 100,

  // Level thresholds (cumulative XP)
  levelThresholds: [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    800,    // Level 5
    1200,   // Level 6
    1700,   // Level 7
    2300,   // Level 8
    3000,   // Level 9
    4000,   // Level 10
    5500,   // Level 11
    7500,   // Level 12
    10000,  // Level 13
    13000,  // Level 14
    17000,  // Level 15
    22000,  // Level 16
    28000,  // Level 17
    35000,  // Level 18
    45000,  // Level 19
    60000,  // Level 20
  ],

  // Streak bonuses
  streakBonuses: {
    3: 25,   // 3-day streak
    7: 75,   // 7-day streak
    14: 200, // 14-day streak
    30: 500, // 30-day streak
  },

  // Badge thresholds
  badgeThresholds: {
    first_lesson: { type: "first_lesson", name: "First Step", description: "Completed your first lesson", condition: (stats: any) => stats.lessonsCompleted >= 1 },
    ten_lessons: { type: "ten_lessons", name: "Quick Learner", description: "Completed 10 lessons", condition: (stats: any) => stats.lessonsCompleted >= 10 },
    fifty_lessons: { type: "fifty_lessons", name: "Scholar", description: "Completed 50 lessons", condition: (stats: any) => stats.lessonsCompleted >= 50 },
    first_quest: { type: "first_quest", name: "Quest Complete!", description: "Completed your first quest", condition: (stats: any) => stats.questsCompleted >= 1 },
    five_quests: { type: "five_quests", name: "Quest Master", description: "Completed 5 quests", condition: (stats: any) => stats.questsCompleted >= 5 },
    streak_3: { type: "streak_3", name: "Streak Starter", description: "3-day learning streak", condition: (stats: any) => stats.currentStreak >= 3 },
    streak_7: { type: "streak_7", name: "Week Warrior", description: "7-day learning streak", condition: (stats: any) => stats.currentStreak >= 7 },
    streak_30: { type: "streak_30", name: "Monthly Master", description: "30-day learning streak", condition: (stats: any) => stats.currentStreak >= 30 },
    xp_1000: { type: "xp_1000", name: "XP Champion", description: "Earned 1,000 XP", condition: (stats: any) => stats.totalXp >= 1000 },
    xp_5000: { type: "xp_5000", name: "XP Legend", description: "Earned 5,000 XP", condition: (stats: any) => stats.totalXp >= 5000 },
    level_5: { type: "level_5", name: "Rising Star", description: "Reached Level 5", condition: (stats: any) => stats.level >= 5 },
    level_10: { type: "level_10", name: "Mastermind", description: "Reached Level 10", condition: (stats: any) => stats.level >= 10 },
    all_subjects: { type: "all_subjects", name: "Renaissance", description: "Studied all subjects", condition: (stats: any) => stats.subjectsStudied >= 5 },
  },
};

// ── Types ────────────────────────────────────────────────────

interface XpEvent {
  amount: number;
  sourceType: string;
  sourceId: string;
  description: string;
  timestamp: number;
}

interface XpState {
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  levelProgress: number;
  currentStreak: number;
  bestStreak: number;
  recentXp: XpEvent[];
  lessonsCompleted: number;
  questsCompleted: number;
  subjectsStudied: number;
}

interface XpContextValue {
  state: XpState;
  addXp: (amount: number, sourceType: string, sourceId: string, description: string) => Promise<{ xpAwarded: number; newLevel: number; leveledUp: boolean; badges: any[] }>;
  checkBadges: () => any[];
}

// ── Helpers ──────────────────────────────────────────────────

export function calculateLevel(totalXp: number): { level: number; xpInLevel: number; xpToNextLevel: number; progress: number } {
  const thresholds = XP_CONFIG.levelThresholds;
  let level = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalXp >= thresholds[i]) {
      level = i + 1;
      break;
    }
  }
  const xpInLevel = totalXp - thresholds[level - 1];
  const xpToNextLevel = thresholds[level] ? thresholds[level] - thresholds[level - 1] : 1000;
  const progress = Math.round((xpInLevel / xpToNextLevel) * 100);
  return { level, xpInLevel, xpToNextLevel, progress };
}

// ── Context ──────────────────────────────────────────────────

export const XpContext = createContext<XpContextValue>({
  state: { totalXp: 0, level: 1, xpInLevel: 0, xpToNextLevel: 100, levelProgress: 0, currentStreak: 0, bestStreak: 0, recentXp: [], lessonsCompleted: 0, questsCompleted: 0, subjectsStudied: 0 },
  addXp: async () => ({ xpAwarded: 0, newLevel: 1, leveledUp: false, badges: [] }),
  checkBadges: () => [],
});

export function XpProvider({ learnerId, initialXp, initialStreak, children }: {
  learnerId: string;
  initialXp: number;
  initialStreak: number;
  children: ReactNode;
}) {
  const [state, setState] = useState<XpState>(() => {
    const levelInfo = calculateLevel(initialXp);
    return {
      totalXp: initialXp,
      level: levelInfo.level,
      xpInLevel: levelInfo.xpInLevel,
      xpToNextLevel: levelInfo.xpToNextLevel,
      levelProgress: levelInfo.progress,
      currentStreak: initialStreak,
      bestStreak: initialStreak,
      recentXp: [],
      lessonsCompleted: 0,
      questsCompleted: 0,
      subjectsStudied: 0,
    };
  });

  const addXp = useCallback(async (amount: number, sourceType: string, sourceId: string, description: string) => {
    const event: XpEvent = { amount, sourceType, sourceId, description, timestamp: Date.now() };

    // Award XP via API
    const res = await fetch("/api/xp/award", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ learnerId, amount, sourceType, sourceId, description }),
    });

    const data = await res.json();
    const xpAwarded = data.xpAwarded || amount;
    const newTotal = state.totalXp + xpAwarded;
    const levelInfo = calculateLevel(newTotal);
    const leveledUp = levelInfo.level > state.level;

    setState(prev => ({
      ...prev,
      totalXp: newTotal,
      level: levelInfo.level,
      xpInLevel: levelInfo.xpInLevel,
      xpToNextLevel: levelInfo.xpToNextLevel,
      levelProgress: levelInfo.progress,
      recentXp: [event, ...prev.recentXp].slice(0, 10),
      lessonsCompleted: sourceType === "LESSON" ? prev.lessonsCompleted + 1 : prev.lessonsCompleted,
      questsCompleted: sourceType === "QUEST" ? prev.questsCompleted + 1 : prev.questsCompleted,
    }));

    // Check for new badges
    const newBadges = checkBadgeMilestones({ ...state, totalXp: newTotal, level: levelInfo.level });

    return { xpAwarded, newLevel: levelInfo.level, leveledUp, badges: newBadges };
  }, [learnerId, state]);

  const checkBadges = useCallback(() => {
    return checkBadgeMilestones(state);
  }, [state]);

  return (
    <XpContext.Provider value={{ state, addXp, checkBadges }}>
      {children}
    </XpContext.Provider>
  );
}

export function useXp() {
  return useContext(XpContext);
}

// ── Badge checking ───────────────────────────────────────────

function checkBadgeMilestones(stats: XpState): any[] {
  const badges: any[] = [];
  for (const [key, badge] of Object.entries(XP_CONFIG.badgeThresholds)) {
    if (badge.condition(stats)) {
      badges.push({ badgeType: badge.type, name: badge.name, description: badge.description });
    }
  }
  return badges;
}
