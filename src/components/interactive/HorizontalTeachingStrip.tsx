"use client";

import React from "react";
import { FractionCircle } from "./FractionVisuals";
import type { CircleTheme } from "./FractionVisuals";

// -- Horizontal Teaching Strip -----------------------------------------------
// Used for Steps 4 (Learn) and 6 (Example) to show the fraction process
// horizontally: whole → split → shaded

interface TeachingStripStep {
  title: string;
  description?: string;
  visual?: React.ReactNode;
}

interface HorizontalTeachingStripProps {
  steps: TeachingStripStep[];
  theme?: CircleTheme;
}

export function HorizontalTeachingStrip({ steps, theme = "plain" }: HorizontalTeachingStripProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5">
      <div className="flex items-start justify-center gap-2 sm:gap-4 overflow-x-auto">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-2 flex-shrink-0 w-[110px] sm:w-[130px]">
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                {i + 1}
              </div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm text-center leading-tight">{s.title}</h4>
              {s.visual && (
                <div className="flex justify-center my-1">{s.visual}</div>
              )}
              {s.description && (
                <p className="text-[10px] sm:text-xs text-slate-500 text-center leading-snug">{s.description}</p>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="flex flex-col items-center justify-center flex-shrink-0 pt-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-300">
                  <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
