"use client";

import React from "react";
import type { CircleTheme } from "./FractionVisuals";

// -- Horizontal Teaching Strip -----------------------------------------------
// Used for Steps 4 (Learn) and 6 (Example) to show the fraction process
// horizontally: whole → split → shaded → symbol

interface TeachingStripStep {
  title: string;
  description?: string;
  visual?: React.ReactNode;
  symbol?: string;
  highlight?: boolean;
}

interface HorizontalTeachingStripProps {
  steps: TeachingStripStep[];
  theme?: CircleTheme;
  intro?: string;
}

export function HorizontalTeachingStrip({ steps, theme = "plain", intro }: HorizontalTeachingStripProps) {
  if (!steps || steps.length === 0) return null;

  const accentBg = theme === "chapati" ? "from-amber-50/60 to-orange-50/40" : "from-slate-50 to-white";
  const arrowColor = theme === "chapati" ? "text-amber-400" : "text-violet-400";

  return (
    <div className="mt-3">
      {/* Optional intro sentence */}
      {intro && (
        <p className="text-sm text-slate-600 font-medium text-center mb-4 leading-relaxed">
          {intro}
        </p>
      )}

      <div className={`rounded-2xl border border-slate-200/60 bg-gradient-to-br ${accentBg} p-4 lg:p-5`}>
        {/* Horizontal scrollable strip */}
        <div className="flex flex-row items-start justify-center gap-1 lg:gap-0 overflow-x-auto pb-1">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              {/* Card */}
              <div className={`flex flex-col items-center flex-shrink-0 w-[140px] lg:w-[160px] ${
                s.highlight ? "scale-105" : ""
              }`}>
                {/* Step number badge */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1.5 ${
                  s.highlight
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md"
                    : theme === "chapati"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-indigo-100 text-indigo-600"
                }`}>
                  {i + 1}
                </div>

                {/* Title */}
                <h4 className={`font-bold text-center leading-tight mb-2 ${
                  s.highlight
                    ? "text-violet-800 text-sm"
                    : "text-slate-700 text-xs"
                }`}>
                  {s.title}
                </h4>

                {/* Visual or symbol */}
                {s.symbol ? (
                  <div className={`flex items-center justify-center rounded-xl bg-white border-2 ${
                    s.highlight ? "border-violet-300 shadow-lg shadow-violet-100" : "border-slate-200"
                  } px-3 py-2 mb-2 w-full`}>
                    <span className={`font-black ${
                      s.highlight ? "text-violet-600 text-2xl lg:text-3xl" : "text-slate-700 text-xl"
                    }`}>
                      {s.symbol}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-center mb-2">
                    {s.visual}
                  </div>
                )}

                {/* Description */}
                {s.description && (
                  <p className={`text-center leading-snug ${
                    s.highlight ? "text-violet-600 text-[11px] font-semibold" : "text-slate-500 text-[10px]"
                  }`}>
                    {s.description}
                  </p>
                )}
              </div>

              {/* Arrow connector */}
              {i < steps.length - 1 && (
                <div className="flex items-center justify-center flex-shrink-0 w-6 lg:w-8 pt-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={arrowColor}>
                    <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
