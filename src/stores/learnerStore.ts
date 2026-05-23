import { create } from "zustand";
import type { LearnerProfile, XpRecord, Badge, Streak, Progress } from "@/types/models";

interface LearnerState {
  profile: LearnerProfile | null;
  xpRecords: XpRecord[];
  badges: Badge[];
  streaks: Streak[];
  progress: Progress[];
  recentXp: number[];
  setProfile: (profile: LearnerProfile | null) => void;
  addXp: (amount: number, record: XpRecord) => void;
  addBadge: (badge: Badge) => void;
  setStreaks: (streaks: Streak[]) => void;
  setProgress: (progress: Progress[]) => void;
  dismissRecentXp: () => void;
}

export const useLearnerStore = create<LearnerState>((set) => ({
  profile: null,
  xpRecords: [],
  badges: [],
  streaks: [],
  progress: [],
  recentXp: [],
  setProfile: (profile) => set({ profile }),
  addXp: (amount, record) =>
    set((s) => ({
      profile: s.profile
        ? { ...s.profile, totalXp: s.profile.totalXp + amount }
        : s.profile,
      xpRecords: [record, ...s.xpRecords],
      recentXp: [...s.recentXp, amount],
    })),
  addBadge: (badge) => set((s) => ({ badges: [badge, ...s.badges] })),
  setStreaks: (streaks) => set({ streaks }),
  setProgress: (progress) => set({ progress }),
  dismissRecentXp: () => set({ recentXp: [] }),
}));
