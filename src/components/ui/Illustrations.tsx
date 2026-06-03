"use client";

import React from "react";

/* ═══════════════════════════════════════════════════════════
   ARIZEN SVG ILLUSTRATIONS v6
   Child-friendly • African/Kenyan • Vector-based
   ═══════════════════════════════════════════════════════════ */

// ── Coin Icon (3D style) ──
export function CoinIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="coinShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.15" />
        </filter>
      </defs>
      <circle cx="16" cy="16" r="13" fill="url(#coinGrad)" filter="url(#coinShadow)" />
      <circle cx="16" cy="16" r="13" stroke="#D97706" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="16" r="9" stroke="#D97706" strokeWidth="0.75" fill="none" opacity="0.4" />
      <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="900" fill="#92400E" fontFamily="Nunito,sans-serif">$</text>
    </svg>
  );
}

// ── Streak / Fire Icon ──
export function StreakIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="fireGrad" x1="16" y1="2" x2="16" y2="30">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="50%" stopColor="#FF5C8A" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <path d="M16 2C16 2 8 10 8 17C8 22.523 11.582 26 16 26C20.418 26 24 22.523 24 17C24 10 16 2 16 2Z" fill="url(#fireGrad)" opacity="0.2" />
      <path d="M16 2C16 2 8 10 8 17C8 22.523 11.582 26 16 26C20.418 26 24 22.523 24 17C24 10 16 2 16 2Z" stroke="url(#fireGrad)" strokeWidth="1.5" fill="none" />
      <path d="M16 12C16 12 13 16 13 19C13 21.209 14.343 23 16 23C17.657 23 19 21.209 19 19C19 16 16 12 16 12Z" fill="#FF5C8A" opacity="0.6" />
    </svg>
  );
}

// ── Book / Lesson Icon ──
export function BookIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="6" y="4" width="20" height="24" rx="3" fill="#3BA7FF" opacity="0.15" />
      <rect x="6" y="4" width="20" height="24" rx="3" stroke="#3BA7FF" strokeWidth="1.5" fill="none" />
      <line x1="16" y1="4" x2="16" y2="28" stroke="#3BA7FF" strokeWidth="1" opacity="0.4" />
      <rect x="9" y="8" width="5" height="1.5" rx="0.75" fill="#3BA7FF" opacity="0.6" />
      <rect x="9" y="11" width="4" height="1.5" rx="0.75" fill="#3BA7FF" opacity="0.4" />
      <rect x="18" y="8" width="5" height="1.5" rx="0.75" fill="#3BA7FF" opacity="0.6" />
      <rect x="18" y="11" width="3" height="1.5" rx="0.75" fill="#3BA7FF" opacity="0.4" />
      <rect x="9" y="16" width="5" height="1.5" rx="0.75" fill="#3BA7FF" opacity="0.6" />
      <rect x="9" y="19" width="4" height="1.5" rx="0.75" fill="#3BA7FF" opacity="0.4" />
      <rect x="18" y="16" width="5" height="1.5" rx="0.75" fill="#3BA7FF" opacity="0.6" />
    </svg>
  );
}

// ── Trophy / Achievement Icon ──
export function TrophyIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="trophyGrad" x1="8" y1="4" x2="24" y2="28">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path d="M10 6H22V16C22 20.418 18.418 24 14 24H18C13.582 24 10 20.418 10 16V6Z" fill="url(#trophyGrad)" opacity="0.3" />
      <path d="M10 6H22V16C22 20.418 18.418 24 14 24H18C13.582 24 10 20.418 10 16V6Z" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
      <path d="M8 6H24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 24V28" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 28H20" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 10H26C26 14.418 24 16 20 16" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4" />
      <path d="M10 10H6C6 14.418 8 16 12 16" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

// ── Star / Badge Icon ──
export function StarIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="starGrad" x1="16" y1="2" x2="16" y2="30">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <polygon
        points="16,3 19.5,11.5 28.5,12.5 21.5,19 23.5,28 16,23.5 8.5,28 10.5,19 3.5,12.5 12.5,11.5"
        fill="url(#starGrad)" opacity="0.15"
      />
      <polygon
        points="16,3 19.5,11.5 28.5,12.5 21.5,19 23.5,28 16,23.5 8.5,28 10.5,19 3.5,12.5 12.5,11.5"
        stroke="url(#starGrad)" strokeWidth="1.5" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

// ── Quest Scroll Icon ──
export function QuestIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="7" y="3" width="18" height="26" rx="3" fill="#8B5CF6" opacity="0.12" />
      <rect x="7" y="3" width="18" height="26" rx="3" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
      <path d="M7 8H25" stroke="#8B5CF6" strokeWidth="1" opacity="0.3" />
      <path d="M7 23H25" stroke="#8B5CF6" strokeWidth="1" opacity="0.3" />
      <circle cx="16" cy="15" r="4" fill="#8B5CF6" opacity="0.2" />
      <circle cx="16" cy="15" r="4" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
      <path d="M14 15L15.5 16.5L18 13.5" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Heart / EQ Icon ──
export function HeartIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="heartGrad" x1="16" y1="4" x2="16" y2="28">
          <stop offset="0%" stopColor="#FF5C8A" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <path d="M16 28C16 28 3 20 3 12C3 7.029 7.029 4 11 4C13.5 4 15.5 5.5 16 7C16.5 5.5 18.5 4 21 4C25.971 4 30 7.029 30 12C30 20 16 28 16 28Z" fill="url(#heartGrad)" opacity="0.15" />
      <path d="M16 28C16 28 3 20 3 12C3 7.029 7.029 4 11 4C13.5 4 15.5 5.5 16 7C16.5 5.5 18.5 4 21 4C25.971 4 30 7.029 30 12C30 20 16 28 16 28Z" stroke="url(#heartGrad)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// ── Avatar Silhouette (simple child figure placeholder) ──
export function AvatarIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="10" r="6" fill="#8B5CF6" opacity="0.15" />
      <circle cx="16" cy="10" r="6" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="9" r="2" fill="#8B5CF6" opacity="0.5" />
      <path d="M6 28C6 22 10 18 16 18C22 18 26 22 26 28" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M6 28C6 22 10 18 16 18C22 18 26 22 26 28" fill="#8B5CF6" opacity="0.1" />
    </svg>
  );
}

// ── Shop Bag Icon ──
export function ShopIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M8 12H24L26 28H6L8 12Z" fill="#F5A524" opacity="0.15" />
      <path d="M8 12H24L26 28H6L8 12Z" stroke="#F5A524" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M12 12V8C12 5.791 13.791 4 16 4C18.209 4 20 5.791 20 8V12" stroke="#F5A524" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── Settings Gear Icon ──
export function SettingsIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="6" fill="#64748B" opacity="0.1" />
      <circle cx="16" cy="16" r="6" stroke="#64748B" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="16" r="2.5" fill="#64748B" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1={16 + 8 * Math.cos((angle * Math.PI) / 180)}
          y1={16 + 8 * Math.sin((angle * Math.PI) / 180)}
          x2={16 + 10 * Math.cos((angle * Math.PI) / 180)}
          y2={16 + 10 * Math.sin((angle * Math.PI) / 180)}
          stroke="#64748B"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// ── Lesson Illustration: Fractions ──
export function FractionIllustration({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="fracBg" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#EEF2FF" />
          <stop offset="100%" stopColor="#F0FDFA" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="100" height="100" rx="20" fill="url(#fracBg)" stroke="#4F46E5" strokeWidth="1.5" opacity="0.3" />
      {/* Fraction circle 1 */}
      <circle cx="42" cy="48" r="18" fill="#4F46E5" opacity="0.1" stroke="#4F46E5" strokeWidth="1.5" />
      <path d="M42 30 L42 66" stroke="#4F46E5" strokeWidth="1.5" />
      <text x="34" y="44" fontSize="10" fontWeight="800" fill="#4F46E5" fontFamily="Nunito,sans-serif">1</text>
      <text x="34" y="58" fontSize="10" fontWeight="800" fill="#4F46E5" fontFamily="Nunito,sans-serif">2</text>
      {/* Plus sign */}
      <text x="60" y="52" fontSize="18" fontWeight="800" fill="#64748B" fontFamily="Nunito,sans-serif">+</text>
      {/* Fraction circle 2 */}
      <circle cx="88" cy="48" r="18" fill="#00A884" opacity="0.1" stroke="#00A884" strokeWidth="1.5" />
      <path d="M79 48 L97 48" stroke="#00A884" strokeWidth="1.5" />
      <text x="80" y="44" fontSize="10" fontWeight="800" fill="#00A884" fontFamily="Nunito,sans-serif">1</text>
      <text x="80" y="58" fontSize="10" fontWeight="800" fill="#00A884" fontFamily="Nunito,sans-serif">4</text>
      {/* Question mark */}
      <text x="52" y="100" fontSize="16" fontWeight="900" fill="#8B5CF6" opacity="0.5" fontFamily="Nunito,sans-serif">?</text>
      {/* Sparkles */}
      <circle cx="25" cy="20" r="2" fill="#F5A524" opacity="0.6" />
      <circle cx="95" cy="22" r="1.5" fill="#8B5CF6" opacity="0.5" />
      <circle cx="100" cy="85" r="2" fill="#FF5C8A" opacity="0.4" />
      <circle cx="18" cy="90" r="1.5" fill="#3BA7FF" opacity="0.5" />
    </svg>
  );
}

// ── Sparkle decoration ──
export function SparkleDecoration({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 2L11.5 8L18 10L11.5 12L10 18L8.5 12L2 10L8.5 4Z" fill="#F5A524" opacity="0.6" />
    </svg>
  );
}
