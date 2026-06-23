"use client";

import React from "react";

interface ChoiceOption {
  id: string;
  label: string;
  visual?: React.ReactNode;
  description?: string;
}

interface ChoiceGridProps {
  options: ChoiceOption[];
  onSelect: (choiceId: string) => void;
  selectedId?: string;
  disabled?: boolean;
  columns?: number;
}

export function ChoiceGrid({
  options,
  onSelect,
  selectedId,
  disabled = false,
  columns = 2,
}: ChoiceGridProps) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => !disabled && onSelect(opt.id)}
            disabled={disabled}
            className={`relative rounded-2xl border-2 p-4 text-center transition-all ${
              isSelected
                ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100"
                : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md"
            } ${disabled ? "cursor-default" : "cursor-pointer"}`}
          >
            <div
              className={`absolute -top-2.5 -left-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white ${
                isSelected ? "bg-indigo-500" : "bg-slate-400"
              }`}
            >
              {opt.label}
            </div>

            {opt.visual && (
              <div className="flex justify-center mb-2">{opt.visual}</div>
            )}

            {opt.description && (
              <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
                {opt.description}
              </p>
            )}

            {isSelected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
