"use client";

import React from "react";

interface CompletionCelebrationMockProps {
  badgeName: string;
  xpEarned: number;
  recapItems: string[];
}

export function CompletionCelebrationMock({
  badgeName,
  xpEarned,
  recapItems,
}: CompletionCelebrationMockProps) {
  return (
    <div className="relative">
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => {
          const colors = ["#FF6B35", "#FFB347", "#4FC3F7", "#2ECC71", "#E74C3C", "#9B59B6"];
          const color = colors[i % colors.length];
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const rotation = Math.random() * 360;
          const size = 6 + Math.random() * 6;
          return (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size * 1.5}px`,
                backgroundColor: color,
                transform: `rotate(${rotation}deg)`,
                opacity: 0.7,
              }}
            />
          );
        })}
      </div>

      {/* Main celebration card */}
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl shadow-xl border-2 border-amber-200 p-8 relative z-10">
        <div className="text-center space-y-6">
          {/* Badge */}
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-200/60 border-4 border-white flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl">🏆</span>
              </div>
            </div>
            {/* Sparkle decorations */}
            <div className="absolute -top-2 -right-2 w-8 h-8 text-2xl">✨</div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 text-2xl">✨</div>
          </div>

          {/* Badge name */}
          <div>
            <p className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-1">
              Badge Earned
            </p>
            <h3 className="text-2xl font-bold text-slate-900">{badgeName}</h3>
          </div>

          {/* XP earned */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full px-6 py-3 border-2 border-amber-200">
            <span className="text-2xl">💫</span>
            <span className="text-xl font-bold text-amber-800">+{xpEarned} XP</span>
          </div>

          {/* Recap */}
          <div className="bg-white rounded-xl p-6 border-2 border-slate-100 shadow-sm">
            <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>🎉</span>
              <span>You can now:</span>
            </h4>
            <ul className="space-y-3">
              {recapItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-base text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Finish button */}
          <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
            Finish lesson
          </button>
        </div>
      </div>
    </div>
  );
}
