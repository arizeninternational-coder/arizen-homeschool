"use client";

import React from "react";
import { FractionCircle } from "./FractionDiagram";

/**
 * Gold Fractions — Teaching Panel
 * 
 * Beautiful horizontal teaching strip showing the learning progression.
 * Used for "Learn" and "Worked Example" steps.
 */

interface TeachStep {
  title: string;
  description?: string;
  fractionParts: number;
  shadedParts: number;
  theme?: "chapati" | "paper" | "plain";
  showLabel?: boolean;
  label?: string;
}

interface TeachingPanelProps {
  steps: TeachStep[];
  variant?: "learn" | "example";
  conceptNote?: string;
}

export function TeachingPanel({
  steps,
  variant = "learn",
  conceptNote,
}: TeachingPanelProps) {
  const isLearn = variant === "learn";
  const accentColor = isLearn ? "indigo" : "cyan";

  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-6 shadow-sm">
      {/* Header */}
      {isLearn && (
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 6.5L2 12l10 5.5 10-5.5L12 6.5z" fill="white" opacity="0.9" />
              <path d="M12 4L2 9.5l10 5.5 10-5.5L12 4z" fill="white" opacity="0.6" />
            </svg>
          </div>
          <span className="text-sm font-bold text-indigo-700">Learn the concept</span>
        </div>
      )}

      {!isLearn && (
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="white" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-bold text-cyan-700">Watch how it&apos;s done</span>
        </div>
      )}

      {/* Step progression */}
      <div className="flex items-start justify-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
        {steps.map((step, i) => {
          const stepTheme = step.theme || (isLearn ? "chapati" : "paper");
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2 flex-shrink-0 w-[130px] sm:w-[150px]">
                {/* Step number */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                    isLearn
                      ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                      : "bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
                  }`}
                >
                  {i + 1}
                </div>

                {/* Title */}
                <h4 className="text-xs sm:text-sm font-bold text-slate-700 text-center leading-tight">
                  {step.title}
                </h4>

                {/* Fraction visual */}
                <div className="flex items-center justify-center my-1">
                  <FractionCircle
                    parts={step.fractionParts}
                    shadedParts={step.shadedParts}
                    size={110}
                    theme={stepTheme}
                    showLabels={step.showLabel}
                    label={step.label}
                  />
                </div>

                {/* Description */}
                {step.description && (
                  <p className="text-[10px] sm:text-xs text-slate-500 text-center leading-snug max-w-[130px]">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Arrow between steps */}
              {i < steps.length - 1 && (
                <div className={`flex flex-col items-center justify-center flex-shrink-0 pt-8 sm:pt-10 ${
                  isLearn ? "text-indigo-300" : "text-cyan-300"
                }`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14m-4-4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Concept note */}
      {conceptNote && (
        <div
          className={`mt-5 rounded-xl px-4 py-3 text-center border ${
            isLearn
              ? "bg-indigo-50/60 border-indigo-100 text-indigo-700"
              : "bg-cyan-50/60 border-cyan-100 text-cyan-700"
          }`}
        >
          <p className="text-xs sm:text-sm font-semibold">{conceptNote}</p>
        </div>
      )}
    </div>
  );
}
