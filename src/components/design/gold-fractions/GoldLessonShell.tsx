"use client";

import React from "react";

/**
 * Gold Fractions — Gold Lesson Shell Mock
 *
 * The outer layout wrapper for the design target.
 * Warm cream background, clean card structure, generous spacing.
 */

interface GoldLessonShellProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  children: React.ReactNode;
  accentColor?: "orange" | "violet" | "amber" | "indigo" | "teal" | "sky" | "emerald" | "rose";
}

const ACCENT_STYLES = {
  orange: {
    bg: "from-orange-500 to-amber-500",
    light: "bg-orange-50 border-orange-100",
    text: "text-orange-700",
  },
  violet: {
    bg: "from-violet-500 to-purple-500",
    light: "bg-violet-50 border-violet-100",
    text: "text-violet-700",
  },
  amber: {
    bg: "from-amber-500 to-yellow-500",
    light: "bg-amber-50 border-amber-100",
    text: "text-amber-700",
  },
  indigo: {
    bg: "from-indigo-500 to-blue-500",
    light: "bg-indigo-50 border-indigo-100",
    text: "text-indigo-700",
  },
  teal: {
    bg: "from-teal-500 to-emerald-500",
    light: "bg-teal-50 border-teal-100",
    text: "text-teal-700",
  },
  sky: {
    bg: "from-sky-500 to-blue-500",
    light: "bg-sky-50 border-sky-100",
    text: "text-sky-700",
  },
  emerald: {
    bg: "from-emerald-500 to-green-500",
    light: "bg-emerald-50 border-emerald-100",
    text: "text-emerald-700",
  },
  rose: {
    bg: "from-rose-500 to-pink-500",
    light: "bg-rose-50 border-rose-100",
    text: "text-rose-700",
  },
};

export function GoldLessonShell({
  stepNumber,
  totalSteps,
  title,
  children,
  accentColor = "orange",
}: GoldLessonShellProps) {
  const accent = ACCENT_STYLES[accentColor];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Step header bar */}
      <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 px-5 py-3 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accent.bg} flex items-center justify-center text-white text-sm font-extrabold shadow-sm`}>
          {stepNumber}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-extrabold text-slate-800 truncate">{title}</h3>
          <span className="text-[11px] font-semibold text-slate-400">Step {stepNumber} of {totalSteps}</span>
        </div>
      </div>

      {/* Content area */}
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
}
