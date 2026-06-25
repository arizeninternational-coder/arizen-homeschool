"use client";

import React from "react";

/**
 * Gold Fractions — Polished Step Rail
 *
 * Journey navigation component showing step progression.
 * No emoji placeholders, clean icon badges, child-friendly but modern.
 */

interface StepRailProps {
  totalSteps: number;
  currentStep: number;
  labels: string[];
}

interface StepMeta {
  label: string;
  iconPath: string;
  color: string;
  bgColor: string;
}

const STEP_ICONS: StepMeta[] = [
  {
    label: "Welcome",
    iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    label: "Mission",
    iconPath: "M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  {
    label: "Think",
    iconPath: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    label: "Learn",
    iconPath: "M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    label: "Connect",
    iconPath: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    label: "Example",
    iconPath: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  {
    label: "Practice",
    iconPath: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    color: "text-sky-600",
    bgColor: "bg-sky-100",
  },
  {
    label: "Check",
    iconPath: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",
    color: "text-lime-600",
    bgColor: "bg-lime-100",
  },
  {
    label: "Reflect",
    iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
  {
    label: "Done",
    iconPath: "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
];

export function StepRail({ totalSteps, currentStep, labels }: StepRailProps) {
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-xs font-bold text-slate-400">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step pills */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const meta = STEP_ICONS[i] || STEP_ICONS[0];
          const isPast = i < currentStep;
          const isCurrent = i === currentStep;
          const isFuture = i > currentStep;

          let containerClass = "bg-slate-100 border-slate-200";
          let iconColor = "text-slate-400";
          let scale = "scale-100";

          if (isPast) {
            containerClass = `${meta.bgColor} border-transparent`;
            iconColor = meta.color;
          }
          if (isCurrent) {
            containerClass = `bg-gradient-to-br from-indigo-500 to-purple-500 border-indigo-600 shadow-md`;
            iconColor = "text-white";
            scale = "scale-110";
          }

          return (
            <div
              key={i}
              className={`group relative flex items-center justify-center w-8 h-8 rounded-xl border ${containerClass} ${scale} transition-all duration-200 cursor-pointer`}
              title={labels[i] || meta.label}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={iconColor}
              >
                {isPast ? (
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                ) : (
                  <path d={meta.iconPath} />
                )}
              </svg>

              {/* Tooltip */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="px-2 py-1 rounded bg-slate-800 text-white text-[10px] font-medium whitespace-nowrap">
                  {labels[i] || meta.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
