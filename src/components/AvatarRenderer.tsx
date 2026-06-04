"use client";

import React from "react";

// Shared AvatarRenderer component used across student dashboard, parent view, shop, and profile
// Renders a full-body African child avatar with customization options and equipped items

interface AvatarRendererProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  skinHex?: string;
  hairColorHex?: string;
  hairStyle?: string;
  outfitHex?: string;
  shoeHex?: string;
  expression?: string;
  equippedItems?: {
    hat?: any;
    top?: any;
    bottom?: any;
    shoes?: any;
    glasses?: any;
    accessory?: any;
    tool?: any;
    pet?: any;
    background?: any;
  };
  className?: string;
}

const SIZE_MAP = {
  xs: { width: 48, height: 64, viewBox: "10 0 100 200" },
  sm: { width: 80, height: 120, viewBox: "10 0 100 200" },
  md: { width: 160, height: 240, viewBox: "10 0 100 200" },
  lg: { width: 220, height: 340, viewBox: "10 0 100 200" },
  xl: { width: 300, height: 460, viewBox: "10 0 100 200" },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || !hex.startsWith("#")) return null;
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
  } catch { return null; }
}

function darken(hex: string, amt: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.max(0, rgb.r - amt);
  const g = Math.max(0, rgb.g - amt);
  const b = Math.max(0, rgb.b - amt);
  return `rgb(${r},${g},${b})`;
}

function lighten(hex: string, amt: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, rgb.r + amt);
  const g = Math.min(255, rgb.g + amt);
  const b = Math.min(255, rgb.b + amt);
  return `rgb(${r},${g},${b})`;
}

export default function AvatarRenderer({
  size = "md",
  skinHex = "#C68642",
  hairColorHex = "#1a1a1a",
  hairStyle = "short-curls",
  outfitHex = "#4F46E5",
  shoeHex = "#37474F",
  expression = "happy",
  equippedItems,
  className = "",
}: AvatarRendererProps) {
  const s = SIZE_MAP[size];
  const sDark = darken(skinHex, 25);
  const sDarker = darken(skinHex, 50);
  const sLight = lighten(skinHex, 20);
  const hcDark = darken(hairColorHex, 30);
  const hcLight = lighten(hairColorHex, 25);
  const oDark = darken(outfitHex, 25);
  const oDarker = darken(outfitHex, 40);
  const oLight = lighten(outfitHex, 15);
  const shDark = darken(shoeHex, 30);

  // ── HAIR ──
  const renderHair = () => {
    switch (hairStyle) {
      case "afro":
        return (
          <g>
            {/* Afro base - large rounded shape */}
            <ellipse cx="55" cy="30" rx="38" ry="32" fill={hairColorHex} />
            {/* Texture bumps */}
            {[30,38,46,54,62,70].map((x, i) => (
              <circle key={`afro-top-${i}`} cx={x} cy={14 + (i % 2) * 5} r={5 + (i % 3)} fill={hairColorHex} />
            ))}
            {[26,34,42,50,58,66,74].map((x, i) => (
              <circle key={`afro-mid-${i}`} cx={x} cy={22 + (i % 2) * 4} r={4 + (i % 2) * 2} fill={hcLight} opacity="0.5" />
            ))}
            {/* Side volume */}
            <circle cx="20" cy="32" r="6" fill={hairColorHex} opacity="0.8" />
            <circle cx="90" cy="32" r="6" fill={hairColorHex} opacity="0.8" />
            {/* Subtle highlight */}
            <ellipse cx="48" cy="20" rx="12" ry="8" fill={hcLight} opacity="0.15" />
          </g>
        );
      case "puff-buns":
        return (
          <g>
            {/* Top puff */}
            <ellipse cx="55" cy="28" rx="30" ry="18" fill={hairColorHex} />
            {/* Left bun */}
            <circle cx="22" cy="14" r="16" fill={hairColorHex} />
            <circle cx="22" cy="14" r="12" fill={hcLight} opacity="0.2" />
            <circle cx="22" cy="8" r="4" fill="#FF5C8A" opacity="0.9" />
            {/* Right bun */}
            <circle cx="88" cy="14" r="16" fill={hairColorHex} />
            <circle cx="88" cy="14" r="12" fill={hcLight} opacity="0.2" />
            <circle cx="88" cy="8" r="4" fill="#FF5C8A" opacity="0.9" />
            {/* Highlight */}
            <ellipse cx="50" cy="22" rx="10" ry="6" fill={hcLight} opacity="0.15" />
          </g>
        );
      case "braids":
        return (
          <g>
            {/* Top */}
            <ellipse cx="55" cy="28" rx="30" ry="18" fill={hairColorHex} />
            {/* Left braid */}
            <path d="M26 28 Q24 40 26 52 Q28 64 24 74" stroke={hairColorHex} strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M26 28 Q24 40 26 52 Q28 64 24 74" stroke={hcDark} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.3" />
            <circle cx="24" cy="76" r="5" fill={hairColorHex} />
            <rect x="20" y="73" width="8" height="3" rx="1.5" fill="#FF5C8A" opacity="0.8" />
            {/* Right braid */}
            <path d="M84 28 Q86 40 84 52 Q82 64 86 74" stroke={hairColorHex} strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M84 28 Q86 40 84 52 Q82 64 86 74" stroke={hcDark} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.3" />
            <circle cx="86" cy="76" r="5" fill={hairColorHex} />
            <rect x="82" y="73" width="8" height="3" rx="1.5" fill="#FF5C8A" opacity="0.8" />
          </g>
        );
      case "hightop-fade":
        return (
          <g>
            {/* Fade sides */}
            <ellipse cx="55" cy="34" rx="24" ry="14" fill={hairColorHex} opacity="0.35" />
            {/* High top */}
            <rect x="32" y="6" width="46" height="32" rx="14" fill={hairColorHex} />
            <rect x="36" y="3" width="38" height="22" rx="10" fill={hairColorHex} />
            {/* Highlight */}
            <ellipse cx="50" cy="12" rx="10" ry="6" fill={hcLight} opacity="0.15" />
            {/* Texture lines */}
            <line x1="40" y1="18" x2="40" y2="30" stroke={hcDark} strokeWidth="0.5" opacity="0.3" />
            <line x1="50" y1="16" x2="50" y2="30" stroke={hcDark} strokeWidth="0.5" opacity="0.3" />
            <line x1="60" y1="18" x2="60" y2="30" stroke={hcDark} strokeWidth="0.5" opacity="0.3" />
          </g>
        );
      case "twists":
        return (
          <g>
            {/* Top */}
            <ellipse cx="55" cy="28" rx="30" ry="18" fill={hairColorHex} />
            {/* Left twist */}
            <path d="M28 26 Q26 38 28 50 Q30 62 28 72" stroke={hairColorHex} strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M28 26 Q26 38 28 50 Q30 62 28 72" stroke={hcDark} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
            {/* Right twist */}
            <path d="M82 26 Q84 38 82 50 Q80 62 82 72" stroke={hairColorHex} strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M82 26 Q84 38 82 50 Q80 62 82 72" stroke={hcDark} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
            {/* Top puffs */}
            <ellipse cx="46" cy="20" rx="7" ry="9" fill={hairColorHex} />
            <ellipse cx="64" cy="20" rx="7" ry="9" fill={hairColorHex} />
            <ellipse cx="46" cy="18" rx="3" ry="4" fill={hcLight} opacity="0.2" />
            <ellipse cx="64" cy="18" rx="3" ry="4" fill={hcLight} opacity="0.2" />
          </g>
        );
      default: // short-curls
        return (
          <g>
            <ellipse cx="55" cy="28" rx="30" ry="20" fill={hairColorHex} />
            {/* Curl texture */}
            {[36,44,52,60,68].map((x, i) => (
              <circle key={`curl-${i}`} cx={x} cy={14 + (i % 2) * 4} r={4.5} fill={hairColorHex} />
            ))}
            {[32,40,48,56,64,72].map((x, i) => (
              <circle key={`curl2-${i}`} cx={x} cy={20 + (i % 2) * 3} r={3.5} fill={hcLight} opacity="0.4" />
            ))}
            {/* Side shadows */}
            <circle cx="26" cy="28" r="4" fill={hcDark} opacity="0.3" />
            <circle cx="84" cy="28" r="4" fill={hcDark} opacity="0.3" />
            {/* Highlight */}
            <ellipse cx="50" cy="18" rx="10" ry="5" fill={hcLight} opacity="0.12" />
          </g>
        );
    }
  };

  // ── FACE ──
  const renderFace = () => {
    let eyes: React.ReactNode;
    let mouth: React.ReactNode;
    let eyebrows: React.ReactNode;

    switch (expression) {
      case "excited":
        eyebrows = (
          <>
            <path d="M38 38 Q44 34 50 37" stroke={hairColorHex} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M60 37 Q66 34 72 38" stroke={hairColorHex} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        );
        eyes = (
          <>
            {/* Eye whites */}
            <ellipse cx="44" cy="44" rx="7" ry="7.5" fill="white" />
            <ellipse cx="66" cy="44" rx="7" ry="7.5" fill="white" />
            {/* Iris */}
            <circle cx="45" cy="43" r="4.5" fill="#3B2F1E" />
            <circle cx="67" cy="43" r="4.5" fill="#3B2F1E" />
            {/* Pupil */}
            <circle cx="45.5" cy="42.5" r="2.2" fill="#1a1a1a" />
            <circle cx="67.5" cy="42.5" r="2.2" fill="#1a1a1a" />
            {/* Highlights */}
            <circle cx="47" cy="40.5" r="1.8" fill="white" />
            <circle cx="69" cy="40.5" r="1.8" fill="white" />
            <circle cx="44" cy="44.5" r="0.8" fill="white" opacity="0.5" />
            <circle cx="66" cy="44.5" r="0.8" fill="white" opacity="0.5" />
          </>
        );
        mouth = (
          <>
            <ellipse cx="55" cy="59" rx="9" ry="7" fill="#C6374A" />
            <ellipse cx="55" cy="55" rx="7" ry="3.5" fill={skinHex} />
            <ellipse cx="55" cy="62.5" rx="5" ry="2.5" fill="#E57373" opacity="0.5" />
            {/* Teeth hint */}
            <rect x="50" y="55.5" width="10" height="2.5" rx="1" fill="white" opacity="0.6" />
          </>
        );
        break;
      case "cool":
        eyebrows = (
          <>
            <line x1="38" y1="40" x2="50" y2="39" stroke={hairColorHex} strokeWidth="2" strokeLinecap="round" />
            <line x1="60" y1="39" x2="72" y2="40" stroke={hairColorHex} strokeWidth="2" strokeLinecap="round" />
          </>
        );
        eyes = (
          <>
            {/* Sunglasses */}
            <rect x="35" y="39" width="16" height="10" rx="5" fill="#1E293B" opacity="0.9" />
            <rect x="59" y="39" width="16" height="10" rx="5" fill="#1E293B" opacity="0.9" />
            <line x1="51" y1="44" x2="59" y2="44" stroke="#37474F" strokeWidth="2.5" />
            <line x1="35" y1="43" x2="28" y2="40" stroke="#37474F" strokeWidth="2.5" />
            <line x1="75" y1="43" x2="82" y2="40" stroke="#37474F" strokeWidth="2.5" />
            {/* Lens reflection */}
            <rect x="37" y="41" width="4" height="2" rx="1" fill="white" opacity="0.15" />
            <rect x="61" y="41" width="4" height="2" rx="1" fill="white" opacity="0.15" />
          </>
        );
        mouth = (
          <path d="M46 57 Q52 61 55 57 Q58 61 64 57" stroke={sDarker} strokeWidth="2" fill="none" strokeLinecap="round" />
        );
        break;
      case "proud":
        eyebrows = (
          <>
            <path d="M38 37 L50 39" stroke={hairColorHex} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M72 37 L60 39" stroke={hairColorHex} strokeWidth="2" fill="none" strokeLinecap="round" />
            <text x="55" y="32" textAnchor="middle" fontSize="10" fontWeight="900" fill="#F5A524" opacity="0.8">★</text>
          </>
        );
        eyes = (
          <>
            <ellipse cx="44" cy="44" rx="6.5" ry="7" fill="white" />
            <ellipse cx="66" cy="44" rx="6.5" ry="7" fill="white" />
            <circle cx="45" cy="43" r="4" fill="#3B2F1E" />
            <circle cx="67" cy="43" r="4" fill="#3B2F1E" />
            <circle cx="45.5" cy="42" r="2" fill="#1a1a1a" />
            <circle cx="67.5" cy="42" r="2" fill="#1a1a1a" />
            <circle cx="47" cy="41" r="1.5" fill="white" />
            <circle cx="69" cy="41" r="1.5" fill="white" />
          </>
        );
        mouth = (
          <>
            <path d="M44 55 Q55 68 66 55" fill="#C6374A" opacity="0.85" />
            <path d="M46 55 Q55 64 64 55" stroke={sDarker} strokeWidth="1" fill="none" />
            <rect x="49" y="55" width="12" height="2" rx="1" fill="white" opacity="0.4" />
          </>
        );
        break;
      default: // happy
        eyebrows = (
          <>
            <path d="M38 39 Q44 36 50 39" stroke={hairColorHex} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M60 39 Q66 36 72 39" stroke={hairColorHex} strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
        eyes = (
          <>
            <ellipse cx="44" cy="44" rx="6" ry="6.5" fill="white" />
            <ellipse cx="66" cy="44" rx="6" ry="6.5" fill="white" />
            <circle cx="45" cy="43.5" r="3.5" fill="#3B2F1E" />
            <circle cx="67" cy="43.5" r="3.5" fill="#3B2F1E" />
            <circle cx="45.5" cy="42.5" r="1.8" fill="#1a1a1a" />
            <circle cx="67.5" cy="42.5" r="1.8" fill="#1a1a1a" />
            {/* Eye highlights */}
            <circle cx="47" cy="41" r="1.3" fill="white" />
            <circle cx="69" cy="41" r="1.3" fill="white" />
            <circle cx="44" cy="45" r="0.6" fill="white" opacity="0.4" />
            <circle cx="66" cy="45" r="0.6" fill="white" opacity="0.4" />
          </>
        );
        mouth = (
          <>
            <path d="M45 56 Q55 67 65 56" stroke={sDarker} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M47 56.5 Q55 64 63 56.5" fill="#C6374A" opacity="0.6" />
          </>
        );
        break;
    }

    return (
      <g>
        {eyebrows}
        {eyes}
        {/* Nose */}
        <ellipse cx="55" cy="52" rx="3.5" ry="2.5" fill={sDark} opacity="0.35" />
        <ellipse cx="53" cy="51.5" rx="1.5" ry="1" fill={sLight} opacity="0.2" />
        {mouth}
        {/* Cheek blush */}
        <ellipse cx="36" cy="52" rx="6" ry="4" fill="#FFCDD2" opacity="0.25" />
        <ellipse cx="74" cy="52" rx="6" ry="4" fill="#FFCDD2" opacity="0.25" />
      </g>
    );
  };

  // ── EQUIPPED ITEMS ──
  const renderEquippedHat = () => {
    if (!equippedItems?.hat) return null;
    const hat = equippedItems.hat;
    if (hat.name?.toLowerCase().includes("safari") || hat.name?.toLowerCase().includes("explorer")) {
      return (
        <g>
          <ellipse cx="55" cy="16" rx="34" ry="9" fill="#C4956A" />
          <path d="M28 16 Q28 -2 55 -6 Q82 -2 82 16" fill="#D4A574" />
          <rect x="26" y="12" width="58" height="5" rx="2.5" fill="#8B6914" />
          <ellipse cx="55" cy="4" rx="18" ry="6" fill="#D4A574" opacity="0.3" />
        </g>
      );
    }
    if (hat.name?.toLowerCase().includes("wizard") || hat.name?.toLowerCase().includes("math")) {
      return (
        <g>
          <polygon points="55,-2 30 28 80 28" fill="#4F46E5" />
          <polygon points="55,-2 38 20 72 20" fill="#6366F1" opacity="0.4" />
          <circle cx="55" cy="6" r="3.5" fill="#F5A524" />
          <rect x="28" y="26" width="54" height="5" rx="2.5" fill="#37474F" />
          <polygon points="55,-1 56.5,5 62,5 58,9 59.5,15 55,11 50.5,15 52,9 48,5 53.5,5" fill="#FBBF24" opacity="0.8" />
        </g>
      );
    }
    if (hat.name?.toLowerCase().includes("crown") || hat.name?.toLowerCase().includes("creative")) {
      return (
        <g>
          <polygon points="32,20 36,4 42,12 48,0 55,8 62,0 68,12 74,4 78,20" fill="#F5A524" />
          <rect x="32" y="18" width="52" height="6" rx="3" fill="#E5A520" />
          <circle cx="42" cy="10" r="2.5" fill="#EF4444" />
          <circle cx="55" cy="4" r="3" fill="#3B82F6" />
          <circle cx="68" cy="10" r="2.5" fill="#10B981" />
        </g>
      );
    }
    return (
      <g>
        <rect x="30" y="6" width="50" height="16" rx="8" fill="#4F46E5" />
        <rect x="30" y="18" width="50" height="4" rx="2" fill="#37474F" />
      </g>
    );
  };

  const renderEquippedGlasses = () => {
    if (!equippedItems?.glasses) return null;
    const g = equippedItems.glasses;
    if (g.name?.toLowerCase().includes("scientist") || g.name?.toLowerCase().includes("goggles")) {
      return (
        <g>
          <circle cx="44" cy="44" r="10" fill="none" stroke="#37474F" strokeWidth="2.5" />
          <circle cx="66" cy="44" r="10" fill="none" stroke="#37474F" strokeWidth="2.5" />
          <line x1="54" y1="44" x2="56" y2="44" stroke="#37474F" strokeWidth="2" />
          <line x1="34" y1="42" x2="27" y2="39" stroke="#37474F" strokeWidth="2" />
          <line x1="76" y1="42" x2="83" y2="39" stroke="#37474F" strokeWidth="2" />
          <circle cx="44" cy="44" r="8" fill="#81D4FA" opacity="0.15" />
          <circle cx="66" cy="44" r="8" fill="#81D4FA" opacity="0.15" />
        </g>
      );
    }
    return (
      <g>
        <rect x="37" y="39" width="14" height="10" rx="5" fill="none" stroke="#37474F" strokeWidth="2" />
        <rect x="59" y="39" width="14" height="10" rx="5" fill="none" stroke="#37474F" strokeWidth="2" />
        <line x1="51" y1="44" x2="59" y2="44" stroke="#37474F" strokeWidth="2" />
        <line x1="37" y1="43" x2="31" y2="41" stroke="#37474F" strokeWidth="2" />
        <line x1="73" y1="43" x2="79" y2="41" stroke="#37474F" strokeWidth="2" />
      </g>
    );
  };

  const renderEquippedPet = () => {
    if (!equippedItems?.pet) return null;
    const pet = equippedItems.pet;
    if (pet.name?.toLowerCase().includes("rabbit")) {
      return (
        <g>
          <ellipse cx="92" cy="165" rx="13" ry="11" fill="#F5F5F5" />
          <ellipse cx="92" cy="152" rx="8" ry="9" fill="#F5F5F5" />
          <ellipse cx="87" cy="142" rx="3" ry="7" fill="#F5F5F5" />
          <ellipse cx="97" cy="142" rx="3" ry="7" fill="#F5F5F5" />
          <ellipse cx="87" cy="142" rx="1.5" ry="5" fill="#FFB6C1" opacity="0.6" />
          <ellipse cx="97" cy="142" rx="1.5" ry="5" fill="#FFB6C1" opacity="0.6" />
          <circle cx="88" cy="150" r="1.5" fill="#1F2937" />
          <circle cx="96" cy="150" r="1.5" fill="#1F2937" />
          <ellipse cx="92" cy="155" rx="2" ry="1.2" fill="#FFB6C1" />
        </g>
      );
    }
    if (pet.name?.toLowerCase().includes("robot")) {
      return (
        <g>
          <rect x="83" y="152" width="18" height="20" rx="4" fill="#94A3B8" />
          <rect x="86" y="148" width="12" height="7" rx="2" fill="#64748B" />
          <circle cx="89" cy="151" r="2.5" fill="#22D3EE" />
          <circle cx="95" cy="151" r="2.5" fill="#22D3EE" />
          <rect x="85" y="156" width="14" height="2" rx="1" fill="#64748B" />
          <rect x="85" y="160" width="14" height="2" rx="1" fill="#64748B" />
          <circle cx="89" cy="148" r="2.5" fill="#EF4444" />
        </g>
      );
    }
    return null;
  };

  return (
    <svg
      viewBox={s.viewBox}
      width={s.width}
      height={s.height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="skinShading" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={sLight} stopOpacity="0.15" />
          <stop offset="100%" stopColor={sDark} stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="outfitShading" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={oLight} stopOpacity="0.2" />
          <stop offset="100%" stopColor={oDark} stopOpacity="0.15" />
        </radialGradient>
        <radialGradient id="shoeShading" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stopColor={lighten(shoeHex, 30)} stopOpacity="0.2" />
          <stop offset="100%" stopColor={shDark} stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="55" cy="192" rx="35" ry="5" fill="#94A3B8" opacity="0.15" />
      <ellipse cx="55" cy="192" rx="25" ry="3" fill="#64748B" opacity="0.1" />

      {/* Pet (behind body) */}
      {renderEquippedPet()}

      {/* LEGS */}
      <rect x="40" y="138" width="15" height="40" rx="7" fill="#37474F" />
      <rect x="65" y="138" width="15" height="40" rx="7" fill="#37474F" />
      {/* Leg shading */}
      <rect x="42" y="140" width="5" height="36" rx="2.5" fill="rgba(0,0,0,0.1)" />
      <rect x="67" y="140" width="5" height="36" rx="2.5" fill="rgba(0,0,0,0.1)" />
      {/* Kneecap hint */}
      <ellipse cx="47" cy="150" rx="4" ry="3" fill="rgba(255,255,255,0.04)" />
      <ellipse cx="72" cy="150" rx="4" ry="3" fill="rgba(255,255,255,0.04)" />

      {/* SHOES */}
      <ellipse cx="47" cy="182" rx="15" ry="8" fill={shoeHex} />
      <ellipse cx="72" cy="182" rx="15" ry="8" fill={shoeHex} />
      {/* Sole */}
      <ellipse cx="47" cy="186" rx="13" ry="5" fill={shDark} opacity="0.5" />
      <ellipse cx="72" cy="186" rx="13" ry="5" fill={shDark} opacity="0.5" />
      {/* Shoe highlight */}
      <ellipse cx="47" cy="178" rx="6" ry="2.5" fill="white" opacity="0.1" />
      <ellipse cx="72" cy="178" rx="6" ry="2.5" fill="white" opacity="0.1" />
      {/* Shoe toe cap */}
      <ellipse cx="38" cy="181" rx="5" ry="6" fill={shoeHex} />
      <ellipse cx="81" cy="181" rx="5" ry="6" fill={shoeHex} />
      <ellipse cx="38" cy="179" rx="3" ry="2" fill="white" opacity="0.08" />
      <ellipse cx="81" cy="179" rx="3" ry="2" fill="white" opacity="0.08" />
      {/* Shoe shading overlay */}
      <ellipse cx="47" cy="182" rx="15" ry="8" fill="url(#shoeShading)" />

      {/* BODY / TORSO */}
      <path d="M32 88 Q32 82 38 80 L72 80 Q78 82 78 88 L78 140 Q78 148 70 148 L40 148 Q32 148 32 140 Z" fill={outfitHex} />
      {/* Collar / neckline */}
      <path d="M44 80 Q55 90 66 80" stroke={oDarker} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Center line */}
      <line x1="55" y1="88" x2="55" y2="144" stroke={oDark} strokeWidth="0.8" opacity="0.2" />
      {/* Fabric highlight */}
      <rect x="36" y="84" width="10" height="24" rx="5" fill="white" opacity="0.06" />
      {/* Fabric fold */}
      <path d="M60 90 Q62 110 58 130" stroke={oDark} strokeWidth="0.6" fill="none" opacity="0.15" />
      {/* Outfit shading overlay */}
      <path d="M32 88 Q32 82 38 80 L72 80 Q78 82 78 88 L78 140 Q78 148 70 148 L40 148 Q32 148 32 140 Z" fill="url(#outfitShading)" />

      {/* LEFT ARM */}
      <path d="M22 86 Q18 86 16 92 L16 120 Q16 126 22 126 L28 126 Q32 126 32 120 L30 92 Q28 86 22 86" fill={outfitHex} />
      <rect x="18" y="88" width="4" height="36" rx="2" fill={oDark} opacity="0.2" />
      {/* Left hand */}
      <ellipse cx="22" cy="130" rx="8" ry="7" fill={skinHex} />
      <ellipse cx="22" cy="130" rx="8" ry="7" fill="none" stroke={sDarker} strokeWidth="0.6" opacity="0.3" />
      {/* Fingers hint */}
      <ellipse cx="18" cy="134" rx="2.5" ry="3" fill={sLight} opacity="0.15" />

      {/* RIGHT ARM */}
      <path d="M88 86 Q92 86 94 92 L94 120 Q94 126 88 126 L82 126 Q78 126 78 120 L80 92 Q82 86 88 86" fill={outfitHex} />
      <rect x="86" y="88" width="4" height="36" rx="2" fill={oDark} opacity="0.2" />
      {/* Right hand */}
      <ellipse cx="88" cy="130" rx="8" ry="7" fill={skinHex} />
      <ellipse cx="88" cy="130" rx="8" ry="7" fill="none" stroke={sDarker} strokeWidth="0.6" opacity="0.3" />
      <ellipse cx="92" cy="134" rx="2.5" ry="3" fill={sLight} opacity="0.15" />

      {/* NECK */}
      <rect x="48" y="74" width="14" height="10" rx="5" fill={skinHex} />
      <rect x="50" y="76" width="4" height="6" rx="2" fill={sDark} opacity="0.1" />

      {/* HEAD */}
      <ellipse cx="55" cy="46" rx="28" ry="31" fill={skinHex} />
      {/* Face shading overlay */}
      <ellipse cx="55" cy="46" rx="28" ry="31" fill="url(#skinShading)" />
      {/* Jaw definition */}
      <ellipse cx="55" cy="55" rx="20" ry="12" fill={sDark} opacity="0.06" />

      {/* LEFT EAR */}
      <ellipse cx="27" cy="48" rx="6" ry="8" fill={skinHex} />
      <ellipse cx="27" cy="48" rx="6" ry="8" fill="none" stroke={sDarker} strokeWidth="0.5" opacity="0.3" />
      <ellipse cx="27" cy="48" rx="3" ry="5" fill={sDark} opacity="0.15" />

      {/* RIGHT EAR */}
      <ellipse cx="83" cy="48" rx="6" ry="8" fill={skinHex} />
      <ellipse cx="83" cy="48" rx="6" ry="8" fill="none" stroke={sDarker} strokeWidth="0.5" opacity="0.3" />
      <ellipse cx="83" cy="48" rx="3" ry="5" fill={sDark} opacity="0.15" />

      {/* HAIR */}
      {renderHair()}

      {/* EQUIPPED HAT (on top of hair) */}
      {renderEquippedHat()}

      {/* FACE */}
      {renderFace()}

      {/* EQUIPPED GLASSES (on top of face) */}
      {renderEquippedGlasses()}
    </svg>
  );
}
