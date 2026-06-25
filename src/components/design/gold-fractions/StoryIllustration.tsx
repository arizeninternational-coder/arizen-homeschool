"use client";

import React from "react";

/**
 * Gold Fractions — Story Illustration Card
 * 
 * Intentional gradient-based illustration placeholders
 * that feel warm and designed, not like broken images.
 */

interface StoryIllustrationProps {
  title: string;
  description: string;
  icon?: "amina" | "chapati" | "kittens" | "paper-fold" | "badge" | "celebration";
  aspectRatio?: "16:9" | "4:3" | "square";
  variant?: "warm" | "cool" | "celebration" | "earth";
  size?: "sm" | "md" | "lg";
}

const VARIANT_STYLES = {
  warm: {
    bg: "from-orange-50 via-amber-50 to-rose-50",
    border: "border-orange-100",
    accent: "text-orange-600",
    shape1: "bg-orange-200/40",
    shape2: "bg-amber-200/40",
    shape3: "bg-rose-200/30",
    iconColor: "text-orange-500",
  },
  cool: {
    bg: "from-blue-50 via-indigo-50 to-sky-50",
    border: "border-blue-100",
    accent: "text-blue-600",
    shape1: "bg-blue-200/40",
    shape2: "bg-indigo-200/40",
    shape3: "bg-sky-200/30",
    iconColor: "text-blue-500",
  },
  celebration: {
    bg: "from-amber-50 via-yellow-50 to-orange-50",
    border: "border-amber-200",
    accent: "text-amber-600",
    shape1: "bg-amber-200/40",
    shape2: "bg-yellow-200/40",
    shape3: "bg-orange-200/30",
    iconColor: "text-amber-500",
  },
  earth: {
    bg: "from-emerald-50 via-teal-50 to-green-50",
    border: "border-emerald-100",
    accent: "text-emerald-600",
    shape1: "bg-emerald-200/40",
    shape2: "bg-teal-200/40",
    shape3: "bg-green-200/30",
    iconColor: "text-emerald-500",
  },
};

const SIZE_MAP = {
  sm: { height: "h-28", title: "text-xs", desc: "text-[10px]" },
  md: { height: "h-40", title: "text-sm", desc: "text-xs" },
  lg: { height: "h-52", title: "text-base", desc: "text-sm" },
};

const ASPECT_CLASS = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  square: "aspect-square",
};

/**
 * SVG icon overlays for illustration placeholders
 */
function IllustrationIcon({ icon, size = 48, color = "#FF6B35" }: { icon: string; size?: number; color?: string }) {
  switch (icon) {
    case "amina":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          {/* Head */}
          <circle cx="32" cy="20" r="10" fill={color} opacity="0.6" />
          {/* Body */}
          <path d="M22 32c0-5.5 4.5-10 10-10s10 4.5 10 10v14c0 3.3-2.7 6-6 6H28c-3.3 0-6-2.7-6-6V32z" fill={color} opacity="0.4" />
          {/* Chapati in hand */}
          <circle cx="44" cy="36" r="8" fill={color} opacity="0.7" />
          <circle cx="44" cy="36" r="6" fill="white" opacity="0.3" />
          {/* Smile */}
          <path d="M28 23c2 2 6 2 8 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          {/* Eyes */}
          <circle cx="28" cy="18" r="1.5" fill={color} opacity="0.8" />
          <circle cx="36" cy="18" r="1.5" fill={color} opacity="0.8" />
        </svg>
      );
    case "chapati":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="24" fill={color} opacity="0.3" />
          <circle cx="32" cy="32" r="20" fill={color} opacity="0.5" />
          <circle cx="32" cy="32" r="16" fill={color} opacity="0.2" />
          {/* Texture dots */}
          <circle cx="24" cy="28" r="2" fill={color} opacity="0.3" />
          <circle cx="36" cy="30" r="1.5" fill={color} opacity="0.25" />
          <circle cx="30" cy="38" r="2" fill={color} opacity="0.2" />
        </svg>
      );
    case "kittens":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          {/* Cat 1 */}
          <ellipse cx="20" cy="30" rx="10" ry="12" fill={color} opacity="0.4" />
          <polygon points="14,20 12,14 18,18" fill={color} opacity="0.4" />
          <polygon points="26,20 28,14 22,18" fill={color} opacity="0.4" />
          <circle cx="17" cy="28" r="1.5" fill={color} opacity="0.7" />
          <circle cx="23" cy="28" r="1.5" fill={color} opacity="0.7" />
          {/* Cat 2 */}
          <ellipse cx="44" cy="30" rx="10" ry="12" fill={color} opacity="0.35" />
          <polygon points="38,20 36,14 42,18" fill={color} opacity="0.35" />
          <polygon points="50,20 52,14 46,18" fill={color} opacity="0.35" />
          <circle cx="41" cy="28" r="1.5" fill={color} opacity="0.7" />
          <circle cx="47" cy="28" r="1.5" fill={color} opacity="0.7" />
          {/* Biscuit between them */}
          <circle cx="32" cy="44" r="8" fill={color} opacity="0.5" />
          <circle cx="32" cy="44" r="6" fill="white" opacity="0.3" />
          <line x1="32" y1="36" x2="32" y2="52" stroke="white" strokeWidth="1.5" opacity="0.5" />
        </svg>
      );
    case "paper-fold":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="22" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" opacity="0.4" />
          <line x1="32" y1="10" x2="32" y2="54" stroke={color} strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
          {/* Fold arrow */}
          <path d="M40 20c-6 0-12 4-12 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <polygon points="28,30 28,34 32,32" fill={color} opacity="0.5" />
        </svg>
      );
    case "badge":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          {/* Star badge */}
          <polygon
            points="32,8 37,24 54,24 40,34 45,50 32,40 19,50 24,34 10,24 27,24"
            fill={color}
            opacity="0.5"
          />
          <circle cx="32" cy="32" r="10" fill="white" opacity="0.4" />
          <text x="32" y="36" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color} opacity="0.8">½</text>
        </svg>
      );
    case "celebration":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          {/* Confetti pieces */}
          <rect x="12" y="16" width="4" height="8" rx="2" fill="#FF6B35" opacity="0.6" transform="rotate(-20 14 20)" />
          <rect x="48" y="12" width="4" height="8" rx="2" fill="#FFB347" opacity="0.6" transform="rotate(15 50 16)" />
          <rect x="8" y="40" width="4" height="8" rx="2" fill="#4FC3F7" opacity="0.5" transform="rotate(-10 10 44)" />
          <rect x="52" y="36" width="4" height="8" rx="2" fill="#2ECC71" opacity="0.5" transform="rotate(25 54 40)" />
          <circle cx="20" cy="12" r="3" fill="#FF6B35" opacity="0.5" />
          <circle cx="44" cy="8" r="2" fill="#FFB347" opacity="0.5" />
          <circle cx="56" cy="28" r="3" fill="#4FC3F7" opacity="0.4" />
          {/* Trophy */}
          <path d="M24 28h16v4c0 6-3.6 11-8 12-4.4-1-8-6-8-12v-4z" fill={color} opacity="0.5" />
          <rect x="30" y="44" width="4" height="6" rx="1" fill={color} opacity="0.4" />
          <rect x="26" y="50" width="12" height="3" rx="1.5" fill={color} opacity="0.4" />
        </svg>
      );
    default:
      return null;
  }
}

export function StoryIllustration({
  title,
  description,
  icon = "amina",
  aspectRatio = "16:9",
  variant = "warm",
  size = "md",
}: StoryIllustrationProps) {
  const style = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_MAP[size];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} ${ASPECT_CLASS[aspectRatio]} flex items-center justify-center`}
    >
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${style.shape1} blur-sm`} />
        <div className={`absolute -bottom-8 -left-8 w-32 h-32 rounded-full ${style.shape2} blur-md`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full ${style.shape3} blur-lg`} />
      </div>

      {/* Icon/content area */}
      <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
        <IllustrationIcon icon={icon} size={56} />
        <p className={`${sizeStyle.title} font-bold ${style.accent}`}>{title}</p>
        <p className={`${sizeStyle.desc} ${style.accent} opacity-70 max-w-[280px] leading-snug`}>
          {description}
        </p>
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.3),transparent_60%)]" />
    </div>
  );
}
