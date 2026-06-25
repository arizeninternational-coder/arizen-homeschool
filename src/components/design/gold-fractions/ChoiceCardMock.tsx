"use client";

import React from "react";

interface ChoiceCardMockProps {
  label: string;
  title: string;
  visual: React.ReactNode;
  selected?: boolean;
  correct?: boolean;
}

export function ChoiceCardMock({
  label,
  title,
  visual,
  selected = false,
  correct = false,
}: ChoiceCardMockProps) {
  const borderColor = selected
    ? correct
      ? "border-green-400 ring-4 ring-green-100"
      : "border-orange-400 ring-4 ring-orange-100"
    : "border-slate-200 hover:border-slate-300";

  return (
    <div
      className={`bg-white rounded-2xl p-4 border-2 ${borderColor} transition-all cursor-pointer hover:shadow-lg`}
    >
      {/* Label badge */}
      <div className="flex justify-center mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
          <span className="text-lg font-bold text-slate-700">{label}</span>
        </div>
      </div>

      {/* Visual */}
      <div className="flex justify-center mb-3 min-h-[120px] items-center">
        {visual}
      </div>

      {/* Title */}
      <p className="text-sm text-slate-700 text-center font-medium leading-snug">
        {title}
      </p>

      {/* Feedback overlay */}
      {selected && correct && (
        <div className="mt-3 pt-3 border-t-2 border-green-200">
          <p className="text-center text-sm font-bold text-green-700">✓ Correct!</p>
        </div>
      )}
    </div>
  );
}
