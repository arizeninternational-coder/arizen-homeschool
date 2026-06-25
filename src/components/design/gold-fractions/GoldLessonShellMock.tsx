"use client";

import React from "react";

interface GoldLessonShellMockProps {
  stepNumber: number;
  title: string;
  children: React.ReactNode;
  accent?: "warm" | "cool" | "celebration" | "earth";
}

export function GoldLessonShellMock({
  stepNumber,
  title,
  children,
  accent = "warm",
}: GoldLessonShellMockProps) {
  const accentMap = {
    warm: "from-orange-400 to-orange-500",
    cool: "from-blue-400 to-blue-600",
    celebration: "from-amber-400 to-orange-500",
    earth: "from-emerald-400 to-green-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 overflow-hidden">
      {/* Header bar */}
      <div className="bg-gradient-to-br from-slate-50 to-white border-b-2 border-slate-100 p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accentMap[accent]} flex items-center justify-center shadow-sm flex-shrink-0`}>
          <span className="text-white font-bold text-xl">{stepNumber}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">Step {stepNumber} of 10</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  );
}
