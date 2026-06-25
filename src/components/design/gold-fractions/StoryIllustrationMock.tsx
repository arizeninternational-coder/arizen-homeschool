"use client";

import React from "react";

/**
 * Story illustration mocks for the Gold Fractions lesson.
 * These are beautiful gradient-based placeholders with SVG icons
 * that feel intentionally designed, not like broken images.
 */

interface StoryIllustrationMockProps {
  illustration: React.ReactNode;
  caption: string;
}

export function StoryIllustrationMock({
  illustration,
  caption,
}: StoryIllustrationMockProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 border-2 border-orange-100 shadow-sm">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-orange-100/40 blur-sm" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-amber-100/30 blur-md" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-rose-100/20 blur-lg" />
      </div>

      {/* Illustration content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-8 px-6 gap-4">
        <div className="flex justify-center">{illustration}</div>
        <p className="text-sm text-slate-600 text-center font-medium italic">
          {caption}
        </p>
      </div>

      {/* Subtle radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.3),transparent_60%)] pointer-events-none" />
    </div>
  );
}

/**
 * Amina illustration mock — girl holding a chapati
 */
export function AminaIllustration() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      {/* Warm background circle */}
      <circle cx="80" cy="80" r="70" fill="#FFE5D9" opacity="0.5" />

      {/* Head */}
      <circle cx="80" cy="50" r="24" fill="#D4A574" />
      {/* Hair */}
      <path d="M56 50c0-14 11-24 24-24s24 10 24 24c0-12-8-20-24-20S56 38 56 50z" fill="#2D1810" />
      {/* Face details */}
      <circle cx="72" cy="48" r="2" fill="#1a1a1a" />
      <circle cx="88" cy="48" r="2" fill="#1a1a1a" />
      {/* Smile */}
      <path d="M72 58c2 3 6 4 10 4s8-1 10-4" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Body / dress */}
      <path d="M56 74c0-8 10-14 24-14s24 6 24 14v36c0 6-6 10-24 10s-24-4-24-10V74z" fill="#FF6B35" />

      {/* Arms */}
      <path d="M56 82c-8 4-12 12-8 20l4 2" stroke="#D4A574" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M104 82c8 4 12 12 8 20l-4 2" stroke="#D4A574" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* Chapati in hand */}
      <circle cx="116" cy="104" r="16" fill="#FFE5D9" stroke="#D4A574" strokeWidth="2" />
      <circle cx="116" cy="104" r="12" fill="#FFD4B8" opacity="0.6" />
    </svg>
  );
}

/**
 * Chapati whole illustration — just the chapati
 */
export function ChapatiWholeIllustration() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r="60" fill="#FFE5D9" stroke="#D4A574" strokeWidth="4" />
      <circle cx="80" cy="80" r="50" fill="#FFD4B8" opacity="0.4" />
      {/* Texture spots */}
      <circle cx="60" cy="60" r="4" fill="#D4A574" opacity="0.3" />
      <circle cx="90" cy="70" r="3" fill="#D4A574" opacity="0.25" />
      <circle cx="70" cy="100" r="4" fill="#D4A574" opacity="0.2" />
      <circle cx="100" cy="90" r="3" fill="#D4A574" opacity="0.3" />
    </svg>
  );
}

/**
 * Kittens sharing biscuit illustration
 */
export function KittensBiscuitIllustration() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
      {/* Background warm blob */}
      <ellipse cx="100" cy="120" rx="80" ry="30" fill="#FFE5D9" opacity="0.4" />

      {/* Kitten 1 (left) */}
      <ellipse cx="50" cy="90" rx="24" ry="30" fill="#D4A574" opacity="0.7" />
      {/* Ears */}
      <polygon points="36,64 30,50 44,60" fill="#D4A574" opacity="0.7" />
      <polygon points="64,64 70,50 56,60" fill="#D4A574" opacity="0.7" />
      {/* Eyes */}
      <circle cx="42" cy="80" r="3" fill="#1a1a1a" opacity="0.8" />
      <circle cx="58" cy="80" r="3" fill="#1a1a1a" opacity="0.8" />
      {/* Nose */}
      <circle cx="50" cy="88" r="2" fill="#FF6B35" opacity="0.6" />

      {/* Kitten 2 (right) */}
      <ellipse cx="150" cy="90" rx="24" ry="30" fill="#D4A574" opacity="0.6" />
      {/* Ears */}
      <polygon points="136,64 130,50 144,60" fill="#D4A574" opacity="0.6" />
      <polygon points="164,64 170,50 156,60" fill="#D4A574" opacity="0.6" />
      {/* Eyes */}
      <circle cx="142" cy="80" r="3" fill="#1a1a1a" opacity="0.8" />
      <circle cx="158" cy="80" r="3" fill="#1a1a1a" opacity="0.8" />
      {/* Nose */}
      <circle cx="150" cy="88" r="2" fill="#FF6B35" opacity="0.6" />

      {/* Biscuit (split in half between them) */}
      <circle cx="100" cy="110" r="20" fill="#FFE5D9" stroke="#D4A574" strokeWidth="3" />
      <line x1="100" y1="90" x2="100" y2="130" stroke="#D4A574" strokeWidth="3" />
      <text x="80" y="116" fontSize="12" fontWeight="bold" fill="#D4A574">½</text>
      <text x="112" y="116" fontSize="12" fontWeight="bold" fill="#D4A574">½</text>
    </svg>
  );
}

/**
 * Paper fold illustration
 */
export function PaperFoldIllustration() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      {/* Paper circle */}
      <circle cx="80" cy="80" r="50" fill="#F0F4FF" stroke="#90A4AE" strokeWidth="3" />
      {/* Fold line */}
      <line x1="80" y1="30" x2="80" y2="130" stroke="#4FC3F7" strokeWidth="3" strokeDasharray="6 4" />
      {/* Fold arrow */}
      <path d="M100 60c-10 0-18 8-18 18" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" fill="none" />
      <polygon points="80,78 80,82 84,80" fill="#4FC3F7" />
      {/* Result fraction circle */}
      <path d="M 80 30 A 50 50 0 0 1 80 130 L 80 80 Z" fill="#4FC3F7" opacity="0.4" />
      <text x="55" y="86" fontSize="16" fontWeight="bold" fill="#004E89">½</text>
    </svg>
  );
}

/**
 * Badge illustration
 */
export function BadgeIllustration() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      {/* Gold badge background */}
      <circle cx="80" cy="80" r="60" fill="url(#badgeGradient)" />
      <defs>
        <radialGradient id="badgeGradient" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF6B35" />
        </radialGradient>
      </defs>

      {/* Inner circle */}
      <circle cx="80" cy="80" r="40" fill="white" opacity="0.3" />

      {/* Fraction half */}
      <path d="M 80 40 A 40 40 0 0 1 80 120 L 80 80 Z" fill="white" opacity="0.8" />

      {/* Star sparkle top */}
      <polygon points="80,10 84,20 94,20 86,26 89,36 80,30 71,36 74,26 66,20 76,20" fill="#FFD700" opacity="0.8" />

      {/* Text */}
      <text x="80" y="108" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">½</text>
    </svg>
  );
}
