"use client";

import React from "react";
import { Check } from "lucide-react";

/**
 * Gold Fractions — Mission Card
 * 
 * Shows the learning mission with empty circular bullets.
 * Distinguishes between pre-accept and post-accept states.
 */

interface MissionCardProps {
  items: string[];
  accepted?: boolean;
  title?: string;
}

export function MissionCard({
  items,
  accepted = false,
  title = "Your mission checklist",
}: MissionCardProps) {
  return (
    <div className="rounded-2xl border-2 border-violet-100 bg-gradient-to-br from-violet-50/80 via-purple-50/50 to-indigo-50/40 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" opacity="0.9" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-violet-800 text-sm">{title}</h4>
          <p className="text-[11px] text-violet-500">
            {accepted ? "Mission accepted!" : "Tap Accept to begin"}
          </p>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              accepted
                ? "bg-white/80 border border-violet-100 shadow-sm"
                : "bg-white/50 border border-violet-100/50"
            }`}
          >
            {/* Bullet / check */}
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                accepted
                  ? "bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm"
                  : "border-2 border-violet-200 bg-white"
              }`}
            >
              {accepted && (
                <Check size={12} className="text-white" strokeWidth={3} />
              )}
            </div>
            <span
              className={`text-sm font-medium transition-colors duration-300 ${
                accepted ? "text-violet-700" : "text-slate-600"
              }`}
            >
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* Accept confirmation */}
      {accepted && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={10} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-xs font-bold text-emerald-700">
            Mission accepted. Let&apos;s begin!
          </span>
        </div>
      )}
    </div>
  );
}
