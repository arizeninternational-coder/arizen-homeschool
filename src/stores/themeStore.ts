import { create } from "zustand";
import type { Theme, Quest, Lesson } from "@/types/models";

interface ThemeState {
  currentTheme: Theme | null;
  themes: Theme[];
  quests: Quest[];
  currentQuest: Quest | null;
  lessons: Lesson[];
  currentLesson: Lesson | null;
  setThemes: (themes: Theme[]) => void;
  setCurrentTheme: (theme: Theme | null) => void;
  setQuests: (quests: Quest[]) => void;
  setCurrentQuest: (quest: Quest | null) => void;
  setLessons: (lessons: Lesson[]) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: null,
  themes: [],
  quests: [],
  currentQuest: null,
  lessons: [],
  currentLesson: null,
  setThemes: (themes) => set({ themes }),
  setCurrentTheme: (theme) => set({ currentTheme: theme }),
  setQuests: (quests) => set({ quests }),
  setCurrentQuest: (quest) => set({ currentQuest: quest }),
  setLessons: (lessons) => set({ lessons }),
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
}));
