"use client";

import { createContext, useContext, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// ── Grade UI Configuration ──────────────────────────────────

export type GradeMode = "playful" | "transitional" | "rpg" | "advanced";

export interface GradeUIConfig {
  mode: GradeMode;
  grade: number;
  // Colors
  primaryGradient: string;
  accentColor: string;
  headerPattern: string;
  // Typography
  headingClass: string;
  bodyClass: string;
  // Card styles
  cardClass: string;
  cardHoverClass: string;
  // Quest display
  questCardStyle: string;
  questIconStyle: string;
  // Language
  welcomeMessage: string;
  questLabel: string;
  lessonLabel: string;
  completeLabel: string;
  xpLabel: string;
  streakLabel: string;
  // Animations
  entranceAnimation: string;
  completionAnimation: string;
  // Sounds (CSS class triggers)
  soundEnabled: boolean;
  // Layout
  sidebarStyle: string;
  dashboardLayout: string;
}

const gradeConfigs: Record<number, GradeUIConfig> = {
  // Grade 1-2: Playful & story-driven
  1: getPlayfulConfig(1),
  2: getPlayfulConfig(2),
  // Grade 3-4: Transitional
  3: getTransitionalConfig(3),
  4: getTransitionalConfig(4),
  // Grade 5-6: RPG quest board
  5: getRpgConfig(5),
  6: getRpgConfig(6),
  // Grade 7-8: Advanced explorer
  7: getAdvancedConfig(7),
  8: getAdvancedConfig(8),
};

function getPlayfulConfig(grade: number): GradeUIConfig {
  return {
    mode: "playful",
    grade,
    primaryGradient: "from-pink-400 via-purple-400 to-indigo-400",
    accentColor: "text-pink-500",
    headerPattern: "bg-gradient-to-r from-pink-100 via-purple-50 to-indigo-100",
    headingClass: "text-xl font-bold tracking-tight",
    bodyClass: "text-sm leading-relaxed",
    cardClass: "bg-white rounded-3xl border-2 border-pink-100 shadow-sm",
    cardHoverClass: "hover:shadow-lg hover:border-pink-200 hover:-translate-y-1 transition-all duration-300",
    questCardStyle: "rounded-3xl border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50",
    questIconStyle: "w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-2xl",
    welcomeMessage: "Hello, little star! ✨ Ready for today's adventure?",
    questLabel: "Adventure",
    lessonLabel: "Story",
    completeLabel: "I did it! 🎉",
    xpLabel: "Stars",
    streakLabel: "Days in a row",
    entranceAnimation: "animate-bounce-in",
    completionAnimation: "animate-celebration",
    soundEnabled: true,
    sidebarStyle: "bg-gradient-to-b from-pink-50 to-purple-50",
    dashboardLayout: "grid-cols-1 md:grid-cols-2 gap-4",
  };
}

function getTransitionalConfig(grade: number): GradeUIConfig {
  return {
    mode: "transitional",
    grade,
    primaryGradient: "from-teal-400 via-cyan-400 to-blue-400",
    accentColor: "text-teal-500",
    headerPattern: "bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50",
    headingClass: "text-xl font-bold tracking-tight",
    bodyClass: "text-sm leading-relaxed",
    cardClass: "bg-white rounded-2xl border border-teal-100 shadow-sm",
    cardHoverClass: "hover:shadow-md hover:border-teal-200 hover:-translate-y-0.5 transition-all duration-200",
    questCardStyle: "rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50",
    questIconStyle: "w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-xl",
    welcomeMessage: "Welcome back, explorer! 🌟 Let's discover something new today.",
    questLabel: "Mission",
    lessonLabel: "Activity",
    completeLabel: "Mission Complete! 🎯",
    xpLabel: "Points",
    streakLabel: "Streak",
    entranceAnimation: "animate-slide-up",
    completionAnimation: "animate-success-pop",
    soundEnabled: false,
    sidebarStyle: "bg-gradient-to-b from-teal-50 to-cyan-50",
    dashboardLayout: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  };
}

function getRpgConfig(grade: number): GradeUIConfig {
  return {
    mode: "rpg",
    grade,
    primaryGradient: "from-amber-500 via-orange-500 to-red-500",
    accentColor: "text-amber-500",
    headerPattern: "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800",
    headingClass: "text-xl font-bold tracking-wide uppercase",
    bodyClass: "text-sm leading-relaxed font-medium",
    cardClass: "bg-slate-800/50 rounded-xl border border-slate-600/50 shadow-lg backdrop-blur-sm",
    cardHoverClass: "hover:shadow-amber-500/20 hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-200",
    questCardStyle: "rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-800 to-slate-700",
    questIconStyle: "w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-lg shadow-lg shadow-amber-500/30",
    welcomeMessage: "Greetings, adventurer! ⚔️ Your quest awaits.",
    questLabel: "Quest",
    lessonLabel: "Challenge",
    completeLabel: "Quest Complete! 🏆",
    xpLabel: "XP",
    streakLabel: "Streak",
    entranceAnimation: "animate-fade-in",
    completionAnimation: "animate-xp-burst",
    soundEnabled: false,
    sidebarStyle: "bg-slate-900 border-r border-slate-700",
    dashboardLayout: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  };
}

function getAdvancedConfig(grade: number): GradeUIConfig {
  return {
    mode: "advanced",
    grade,
    primaryGradient: "from-indigo-500 via-purple-500 to-pink-500",
    accentColor: "text-indigo-500",
    headerPattern: "bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50",
    headingClass: "text-xl font-bold tracking-tight",
    bodyClass: "text-sm leading-relaxed",
    cardClass: "bg-white rounded-2xl border border-indigo-100 shadow-sm",
    cardHoverClass: "hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200",
    questCardStyle: "rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50",
    questIconStyle: "w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl",
    welcomeMessage: "Welcome, scholar! 📚 Ready to expand your knowledge?",
    questLabel: "Project",
    lessonLabel: "Module",
    completeLabel: "Module Complete! 🎓",
    xpLabel: "Points",
    streakLabel: "Streak",
    entranceAnimation: "animate-slide-up",
    completionAnimation: "animate-success-pop",
    soundEnabled: false,
    sidebarStyle: "bg-gradient-to-b from-indigo-50 to-purple-50",
    dashboardLayout: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
  };
}

// ── Context ──────────────────────────────────────────────────

interface GradeContextValue {
  config: GradeUIConfig;
  isPlayful: boolean;
  isRpg: boolean;
  isTransitional: boolean;
  isAdvanced: boolean;
}

const GradeContext = createContext<GradeContextValue>({
  config: gradeConfigs[5],
  isPlayful: false,
  isRpg: true,
  isTransitional: false,
  isAdvanced: false,
});

export function GradeProvider({ grade, children }: { grade: number; children: ReactNode }) {
  const config = gradeConfigs[grade] || gradeConfigs[5];
  return (
    <GradeContext.Provider value={{
      config,
      isPlayful: config.mode === "playful",
      isRpg: config.mode === "rpg",
      isTransitional: config.mode === "transitional",
      isAdvanced: config.mode === "advanced",
    }}>
      {children}
    </GradeContext.Provider>
  );
}

export function useGrade() {
  return useContext(GradeContext);
}

// ── Grade-aware components ──────────────────────────────────

export function GradeCard({ children, className, hover = true, ...props }: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  [key: string]: any;
}) {
  const { config } = useGrade();
  return (
    <div className={cn(config.cardClass, hover && config.cardHoverClass, className)} {...props}>
      {children}
    </div>
  );
}

export function GradeHeading({ children, className }: { children: ReactNode; className?: string }) {
  const { config } = useGrade();
  return <h2 className={cn(config.headingClass, config.accentColor, className)}>{children}</h2>;
}

export function GradeWelcome({ name }: { name: string }) {
  const { config } = useGrade();
  return (
    <div className={cn("rounded-2xl p-4 mb-6", config.headerPattern)}>
      <p className={cn("font-semibold", config.accentColor)}>
        {config.welcomeMessage.replace("little star", name).replace("explorer", name).replace("adventurer", name).replace("scholar", name)}
      </p>
    </div>
  );
}
