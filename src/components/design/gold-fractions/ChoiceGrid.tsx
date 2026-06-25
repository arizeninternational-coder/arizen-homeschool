"use client";

import React from "react";
import { FractionCircle } from "./FractionDiagram";

/**
 * Gold Fractions — Choice Grid
 * 
 * Large, readable choice cards with A/B/C badges.
 * No duplicate labels, clear selection/feedback states.
 */

interface ChoiceCard {
  id: string;
  label: string;
  description: string;
  fractionParts: number;
  shadedParts: number;
  equalParts: boolean;
}

interface ChoiceGridProps {
  choices: ChoiceCard[];
  correctId: string;
  selectedId?: string | null;
  showFeedback?: boolean;
  theme?: "chapati" | "paper" | "plain";
}

export function ChoiceGridMock({
  choices,
  correctId,
  selectedId = null,
  showFeedback = false,
  theme = "chapati",
}: ChoiceGridProps) {
  return (
    <div className="space-y-4">
      {/* Choice cards row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {choices.map((choice, i) => {
          const isSelected = selectedId === choice.id;
          const isCorrect = choice.id === correctId;
          const showCorrect = showFeedback && isSelected && isCorrect;
          const showWrong = showFeedback && isSelected && !isCorrect;

          let borderClass = "border-slate-200 bg-white";
          let badgeBg = "bg-slate-100 text-slate-600 border-slate-200";

          if (isSelected && !showFeedback) {
            borderClass = "border-orange-400 bg-orange-50/50 shadow-md ring-2 ring-orange-200";
            badgeBg = "bg-orange-500 text-white border-orange-500";
          }
          if (showCorrect) {
            borderClass = "border-emerald-400 bg-emerald-50/50 shadow-md ring-2 ring-emerald-200";
            badgeBg = "bg-emerald-500 text-white border-emerald-500";
          }
          if (showWrong) {
            borderClass = "border-red-300 bg-red-50/50 shadow-md ring-2 ring-red-200";
            badgeBg = "bg-red-400 text-white border-red-400";
          }

          return (
            <div
              key={choice.id}
              className={`flex-1 min-w-[140px] max-w-[180px] rounded-2xl border-2 ${borderClass} p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex flex-col items-center gap-2`}
            >
              {/* Badge */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold border ${badgeBg} transition-colors duration-200`}
              >
                {String.fromCharCode(65 + i)}
              </div>

              {/* Fraction visual */}
              <div className="flex items-center justify-center py-1">
                <FractionCircle
                  parts={choice.fractionParts}
                  shadedParts={choice.shadedParts}
                  size={100}
                  theme={theme}
                />
              </div>

              {/* Label */}
              <p className="text-xs font-bold text-slate-700 text-center leading-tight">
                {choice.label}
              </p>
              <p className="text-[10px] text-slate-500 text-center leading-snug">
                {choice.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Feedback area */}
      {showFeedback && selectedId && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-semibold text-center transition-all duration-300 ${
            selectedId === correctId
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-amber-50 border border-amber-200 text-amber-700"
          }`}
        >
          {selectedId === correctId ? (
            <span>✓ Yes. Fair sharing means both pieces are the same size.</span>
          ) : (
            <span>↻ Not yet. Fair sharing means each person gets the same size.</span>
          )}
        </div>
      )}
    </div>
  );
}
