"use client";

import React from "react";

/**
 * Gold Fractions — Completion / Celebration Panel
 *
 * Badge reveal with confetti, XP gain counter, and recap checklist.
 */

interface CompletionProps {
  badgeName?: string;
  xpEarned?: number;
  recapItems?: string[];
  showCelebration?: boolean;
}

export function CelebrationPanel({
  badgeName = "Fraction Explorer",
  xpEarned = 50,
  recapItems = [
    "Show one half of a circle",
    "Tell when two parts are equal",
    "Explain why unequal pieces are not halves",
  ],
  showCelebration = true,
}: CompletionProps) {
  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/40 p-6 shadow-md overflow-hidden relative">
      {/* Confetti particles (decorative) */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Generated confetti shapes */}
          <div className="absolute top-2 left-[10%] w-2 h-3 rounded-sm bg-orange-400 opacity-60 rotate-12" />
          <div className="absolute top-4 left-[25%] w-1.5 h-2.5 rounded-full bg-amber-400 opacity-50 -rotate-6" />
          <div className="absolute top-3 right-[15%] w-2 h-3 rounded-sm bg-rose-400 opacity-50 rotate-45" />
          <div className="absolute top-6 right-[30%] w-1.5 h-2 rounded-full bg-sky-400 opacity-40 -rotate-12" />
          <div className="absolute bottom-12 left-[20%] w-2 h-3 rounded-sm bg-emerald-400 opacity-50 rotate-30" />
          <div className="absolute bottom-16 right-[25%] w-1.5 h-2.5 rounded-full bg-violet-400 opacity-50 rotate-[15deg]" />
          <div className="absolute top-8 left-[40%] w-1 h-2 rounded-full bg-orange-500 opacity-40 -rotate-[20deg]" />
          <div className="absolute top-5 right-[45%] w-2 h-2.5 rounded-sm bg-amber-500 opacity-50 rotate-[35deg]" />
          {/* Glowing ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-radial from-amber-200/20 to-transparent" />
        </div>
      )}

      {/* Badge card */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Badge */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 flex items-center justify-center shadow-xl shadow-amber-200/50 ring-4 ring-white/60">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                {/* Fraction visual */}
                <circle cx="32" cy="28" r="16" fill="white" opacity="0.9" />
                <path d="M32 12 A16 16 0 0 1 32 44 Z" fill="#FF6B35" opacity="0.8" />
                <line x1="32" y1="12" x2="32" y2="44" stroke="#D4A574" strokeWidth="2" />
                {/* Half label */}
                <text x="32" y="56" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">½</text>
              </svg>
            </div>
          </div>
          {/* Sparkle decorations */}
          <div className="absolute -top-1 -right-1 w-5 h-5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L11.5 7L16.5 8.5L11.5 10L10 15L8.5 10L3.5 8.5L8.5 7L10 2Z" fill="#FFB347" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -left-2 w-4 h-4">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L11.5 7L16.5 8.5L11.5 10L10 15L8.5 10L3.5 8.5L8.5 7L10 2Z" fill="#FFB347" opacity="0.8" />
            </svg>
          </div>
        </div>

        {/* Badge name */}
        <div className="text-center">
          <p className="text-xs font-bold text-amber-600 tracking-wide uppercase mb-1">Badge Earned</p>
          <h3 className="text-xl font-extrabold text-amber-800">{badgeName}</h3>
        </div>

        {/* XP earned */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-amber-200 shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="#FFB347" />
          </svg>
          <span className="text-sm font-extrabold text-amber-700">+{xpEarned} XP</span>
        </div>

        {/* Recap section */}
        <div className="w-full mt-2">
          <p className="text-xs font-bold text-slate-600 mb-3 text-center uppercase tracking-wide">You can now:</p>
          <div className="space-y-2">
            {recapItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/70 border border-amber-100"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Finish button */}
        <button className="w-full max-w-[240px] px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          Finish lesson
        </button>
      </div>
    </div>
  );
}
