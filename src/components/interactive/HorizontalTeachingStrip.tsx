"use client";

import React from "react";
import type { CircleTheme } from "./FractionVisuals";

// -- Horizontal Teaching Strip -----------------------------------------------
// Compact 2-row layout: Row 1 = Whole → Split, Row 2 = Half → Symbol

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
  const arrowColor = theme === "chapati" ? "text-amber-400" : "text-violet-400";

  // Split into two rows: first half and second half
  const mid = Math.ceil(steps.length / 2);
  const row1 = steps.slice(0, mid);
  const row2 = steps.slice(mid);

  const renderRow = (rowSteps: TeachingStripStep[], startIndex: number) => (
    <div className="flex flex-row items-start justify-center gap-0">
      {rowSteps.map((s, i) => {
        const globalIdx = startIndex + i;
        return (
          <React.Fragment key={globalIdx}>
            {/* Card */}
            <div className={`flex flex-col items-center flex-shrink-0 w-[110px] lg:w-[130px] ${
              s.highlight ? "scale-[1.06]" : ""
            }`}>
              {/* Step number badge */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black mb-1 ${
                s.highlight
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md"
                  : theme === "chapati"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-indigo-100 text-indigo-600"
              }`}>
                {globalIdx + 1}
              </div>

              {/* Title */}
              <h4 className={`font-bold text-center leading-tight mb-1.5 ${
                s.highlight
                  ? "text-violet-800 text-xs"
                  : "text-slate-700 text-[11px]"
              }`}>
                {s.title}
              </h4>

              {/* Visual or symbol */}
              {s.symbol ? (
                <div className={`flex items-center justify-center rounded-lg bg-white border-2 ${
                  s.highlight ? "border-violet-300 shadow-lg shadow-violet-100" : "border-slate-200"
                } px-2 py-1.5 mb-1.5 w-full`}>
                  <span className={`font-black ${
                    s.highlight ? "text-violet-600 text-xl lg:text-2xl" : "text-slate-700 text-lg"
                  }`}>
                    {s.symbol}
                  </span>
                </div>
              ) : (
                <div className="flex justify-center mb-1.5 scale-75 origin-top">
                  {s.visual}
                </div>
              )}

              {/* Description */}
              {s.description && (
                <p className={`text-center leading-snug ${
                  s.highlight ? "text-violet-600 text-[10px] font-semibold" : "text-slate-500 text-[9px]"
                }`}>
                  {s.description}
                </p>
              )}
            </div>

            {/* Arrow connector (only between cards in same row) */}
            {i < rowSteps.length - 1 && (
              <div className="flex items-center justify-center flex-shrink-0 w-5 lg:w-6 pt-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={arrowColor}>
                  <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="mt-2">
      {/* Optional intro sentence */}
      {intro && (
        <p className="text-sm text-slate-600 font-medium text-center mb-3 leading-relaxed">
          {intro}
        </p>
      )}

      <div className={`rounded-2xl border border-slate-200/60 bg-gradient-to-br ${accentBg} p-3 lg:p-4`}>
        {/* Row 1 */}
        {renderRow(row1, 0)}

        {/* Divider between rows (if 2 rows) */}
        {row2.length > 0 && (
          <div className="flex items-center justify-center my-2">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-slate-200"></div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-300">
                <path d="M12 5v14m-4-4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="h-px w-8 bg-slate-200"></div>
            </div>
          </div>
        )}

        {/* Row 2 */}
        {row2.length > 0 && renderRow(row2, row1.length)}
      </div>
    </div>
  );
}
