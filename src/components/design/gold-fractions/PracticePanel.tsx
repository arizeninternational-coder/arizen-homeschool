"use client";

import React, { useState } from "react";
import { FractionCircle } from "./FractionDiagram";

/**
 * Gold Fractions — Practice Panel (Shading Interaction)
 * 
 * Paint-like shading MVP with visual feedback.
 * Shows crayon/brush tool, tap-to-shade, feedback states.
 */

interface PracticePanelProps {
  variant?: "shade" | "tap-and-shade" | "multi";
  parts?: number;
  requiredShaded?: number;
  theme?: "chapati" | "paper" | "plain";
  showChecked?: boolean;
  isCorrect?: boolean;
}

export function PracticePanel({
  variant = "shade",
  parts = 2,
  requiredShaded = 1,
  theme = "chapati",
  showChecked = false,
  isCorrect = false,
}: PracticePanelProps) {
  const [shadedCount, setShadedCount] = useState(variant === "shade" ? 0 : 1);

  const handlePartClick = (index: number) => {
    if (showChecked) return;
    if (index < shadedCount) {
      setShadedCount(index);
    } else {
      setShadedCount(index + 1);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 19l-7-7 3-3 4 4 8-8 3 3-11 11z" fill="white" opacity="0.9" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-sky-800 text-sm">Your Turn</h4>
          <p className="text-[11px] text-sky-500">
            {showChecked
              ? isCorrect
                ? "Beautiful shading!"
                : "Try again — shade exactly one part"
              : "Tap parts of the circle to shade them"}
          </p>
        </div>
      </div>

      {/* Main interaction area */}
      <div className="flex flex-col items-center gap-4">
        {/* Fraction circle */}
        <div className="relative">
          <FractionCircle
            parts={parts}
            shadedParts={shadedCount}
            size={200}
            theme={theme}
            interactive={!showChecked}
            onSelectPart={handlePartClick}
          />
          {/* Shading indicator */}
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-sky-200 flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-bold text-sky-600">{shadedCount}</span>
          </div>
        </div>

        {/* Helper text */}
        {!showChecked && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50/80 border border-sky-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#0284C7" strokeWidth="2" />
              <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0284C7">?</text>
            </svg>
            <p className="text-xs text-sky-700 font-medium">
              {shadedCount === 0
                ? "Tap a section of the circle to shade it."
                : `You shaded ${shadedCount} part${shadedCount > 1 ? "s" : ""}. Tap to adjust.`}
            </p>
          </div>
        )}

        {/* Check button */}
        {!showChecked && shadedCount > 0 && (
          <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all">
            Check my shading
          </button>
        )}

        {/* Feedback */}
        {showChecked && (
          <div
            className={`w-full rounded-xl px-4 py-3 text-center text-sm font-semibold border ${
              isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            {isCorrect
              ? "✓ Yes! You shaded exactly one half."
              : `↻ Not quite. You shaded ${shadedCount} of ${parts} parts. Shade exactly ${requiredShaded} part.`}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Tap-to-halves panel for Step 5 (Connect)
 */
interface TapRegionProps {
  parts?: number;
  theme?: "chapati" | "paper" | "plain";
  showChecked?: boolean;
  isCorrect?: boolean;
}

export function TapRegionMock({
  parts = 2,
  theme = "chapati",
  showChecked = false,
  isCorrect = false,
}: TapRegionProps) {
  const [selectedPart, setSelectedPart] = useState<number | null>(null);

  const handleTap = (index: number) => {
    if (showChecked) return;
    setSelectedPart(index);
  };

  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="white" opacity="0.8" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-teal-800 text-sm">Tap one half</h4>
          <p className="text-[11px] text-teal-500">
            {showChecked
              ? isCorrect
                ? "That's one half!"
                : "Try tapping the other part"
              : "Tap one of the equal parts"}
          </p>
        </div>
      </div>

      {/* Interactive fraction */}
      <div className="flex flex-col items-center gap-3">
        <FractionCircle
          parts={parts}
          shadedParts={0}
          size={200}
          theme={theme}
          interactive={!showChecked}
          selectedPart={selectedPart}
          onSelectPart={handleTap}
          showLabels={selectedPart !== null}
          label={selectedPart !== null ? "½" : undefined}
        />

        {!showChecked && selectedPart === null && (
          <p className="text-xs text-slate-400 font-medium">Tap a section to select it</p>
        )}

        {!showChecked && selectedPart !== null && (
          <button
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            Check my answer
          </button>
        )}

        {showChecked && (
          <div
            className={`w-full rounded-xl px-4 py-3 text-center text-sm font-semibold border ${
              isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            {isCorrect
              ? "✓ Yes. That is one half because it is one of two equal parts."
              : "↻ Look at the two parts. Are they the same size?"}
          </div>
        )}
      </div>
    </div>
  );
}
