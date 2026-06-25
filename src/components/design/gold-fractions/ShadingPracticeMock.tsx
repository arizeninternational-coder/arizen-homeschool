"use client";

import React, { useState } from "react";

/**
 * Shading practice mock — paint-like crayon/brush tool visual.
 * Allows clicking to shade each half of a chapati circle.
 */
export function ShadingPracticeMock() {
  const [shadedHalves, setShadedHalves] = useState<boolean[]>([false, false]);

  const toggleHalf = (index: number) => {
    setShadedHalves((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const resetShading = () => {
    setShadedHalves([false, false]);
  };

  return (
    <div className="space-y-6">
      {/* Tool palette */}
      <div className="bg-white rounded-xl p-4 border-2 border-slate-100 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl text-white font-semibold shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 19l7-7 3 3-7 7-3-3z" fill="white"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" fill="white" opacity="0.6"/>
          </svg>
          <span className="text-sm">Crayon</span>
        </div>
        <button
          onClick={resetShading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-sm font-semibold transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Interactive fraction circle */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="280" height="280" viewBox="0 0 280 280" className="cursor-pointer">
            {/* Background circle */}
            <circle cx="140" cy="140" r="120" fill="#FFE5D9" stroke="#D4A574" strokeWidth="4" />

            {/* Left half */}
            <path
              d="M 140 20 A 120 120 0 0 0 140 260 L 140 140 Z"
              fill={shadedHalves[0] ? "#FF6B35" : "transparent"}
              onClick={() => toggleHalf(0)}
              className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              opacity={shadedHalves[0] ? 1 : 0}
            />

            {/* Right half */}
            <path
              d="M 140 20 A 120 120 0 0 1 140 260 L 140 140 Z"
              fill={shadedHalves[1] ? "#FF6B35" : "transparent"}
              onClick={() => toggleHalf(1)}
              className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              opacity={shadedHalves[1] ? 1 : 0}
            />

            {/* Divider line */}
            <line x1="140" y1="20" x2="140" y2="260" stroke="#D4A574" strokeWidth="4" />

            {/* Outer ring */}
            <circle cx="140" cy="140" r="120" fill="none" stroke="#D4A574" strokeWidth="4" />

            {/* Labels */}
            <text x="80" y="145" fontSize="28" fontWeight="bold" fill="#D4A574" textAnchor="middle">½</text>
            <text x="200" y="145" fontSize="28" fontWeight="bold" fill="#D4A574" textAnchor="middle">½</text>
          </svg>
        </div>
      </div>

      {/* Instruction text */}
      <p className="text-center text-sm text-slate-600">
        Tap each half to shade it. You need to shade exactly one half.
      </p>

      {/* Check button */}
      <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
        Check my shading
      </button>

      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
        <p className="text-sm text-slate-500 font-medium">
          {shadedHalves.filter(Boolean).length === 0
            ? "No parts shaded yet"
            : `${shadedHalves.filter(Boolean).length} of 2 parts shaded`}
        </p>
      </div>
    </div>
  );
}
