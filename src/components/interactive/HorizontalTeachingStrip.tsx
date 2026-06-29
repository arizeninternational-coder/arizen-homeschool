"use client";

import React from "react";
import type { CircleTheme } from "./FractionVisuals";

// -- Horizontal Teaching Strip -----------------------------------------------
// 2x2 grid layout for Learn steps: larger visuals, clear process flow

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

  const accentBg = theme === "chapati" ? "from-amber-50/50 to-orange-50/30" : "from-slate-50 to-white";

  return (
    <div className="mt-2">
      {/* Optional intro sentence */}
      {intro && (
        <p className="text-sm text-slate-600 font-medium text-center mb-3 leading-relaxed">
          {intro}
        </p>
      )}

      <div className={`rounded-2xl border border-slate-200/60 bg-gradient-to-br ${accentBg} p-4 lg:p-5`}>
        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4 lg:gap-5">
          {steps.map((s, i) => (
            <div key={i} className={`flex flex-col items-center ${
              s.highlight ? "scale-[1.03]" : ""
            }`}>
              {/* Step number badge */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-2 ${
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
                } px-4 py-3 mb-2 w-full max-w-[140px]`}>
                  <span className={`font-black ${
                    s.highlight ? "text-violet-600 text-3xl lg:text-4xl" : "text-slate-700 text-2xl"
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
                  s.highlight ? "text-violet-600 text-xs font-semibold" : "text-slate-500 text-[11px]"
                }`}>
                  {s.description}
                </p>
              )}

              {/* Arrow connector (between cards 1→2 and 3→4) */}
              {i === 0 && steps.length > 1 && (
                <div className="absolute top-1/2 -right-3 hidden lg:block">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                    <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
