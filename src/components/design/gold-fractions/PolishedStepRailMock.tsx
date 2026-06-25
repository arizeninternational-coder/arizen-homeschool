"use client";

import React from "react";

interface PolishedStepRailMockProps {
  currentStep: number;
}

const STEP_LABELS = [
  "Welcome",
  "Mission",
  "Think",
  "Learn",
  "Connect",
  "Example",
  "Practice",
  "Check",
  "Reflect",
  "Done",
];

const STEP_COLORS = [
  "from-indigo-400 to-indigo-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
  "from-emerald-400 to-green-600",
  "from-teal-400 to-teal-600",
  "from-cyan-400 to-blue-600",
  "from-sky-400 to-blue-600",
  "from-lime-400 to-green-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-500",
];

export function PolishedStepRailMock({ currentStep }: PolishedStepRailMockProps) {
  const progressPercent = ((currentStep + 1) / STEP_LABELS.length) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-slate-100 shadow-sm">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-sm text-slate-600 font-semibold mb-3">
        <span>Step {currentStep + 1} of {STEP_LABELS.length}</span>
        <span>{Math.round(progressPercent)}% complete</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step circles */}
      <div className="flex items-center justify-between gap-1">
        {STEP_LABELS.map((label, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isUpcoming = i > currentStep;

          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
              {/* Step circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${isCompleted
                    ? `bg-gradient-to-br ${STEP_COLORS[i]} shadow-md`
                    : isCurrent
                      ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg scale-110 ring-4 ring-amber-200"
                      : "bg-slate-100 border-2 border-slate-200"
                  }
                `}
              >
                {isCompleted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className={`font-bold text-sm ${isCurrent ? "text-white" : "text-slate-400"}`}>
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-semibold text-center leading-tight
                  ${isCompleted ? "text-slate-600" : isCurrent ? "text-amber-700" : "text-slate-400"}
                `}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
