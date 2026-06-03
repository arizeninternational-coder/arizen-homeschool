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
  xs: { width: 48, height: 64, viewBox: "15 0 90 190" },
  sm: { width: 80, height: 120, viewBox: "15 0 90 190" },
  md: { width: 160, height: 240, viewBox: "15 0 90 190" },
  lg: { width: 220, height: 340, viewBox: "15 0 90 190" },
  xl: { width: 300, height: 460, viewBox: "15 0 90 190" },
};

function darken(hex: string, amt: number): string {
  if (!hex || !hex.startsWith("#")) return hex;
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - amt);
    const g = Math.max(0, ((num >> 8) & 0xff) - amt);
    const b = Math.max(0, (num & 0xff) - amt);
    return `rgb(${r},${g},${b})`;
  } catch { return hex; }
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
  const sD = darken(skinHex, 25);
  const sOut = darken(skinHex, 50);
  const hcDark = darken(hairColorHex, 30);

  const renderHair = () => {
    switch (hairStyle) {
      case "afro":
        return (
          <g>
            <ellipse cx="60" cy="28" rx="33" ry="27" fill={hairColorHex} />
            <ellipse cx="60" cy="28" rx="33" ry="27" fill="none" stroke={hcDark} strokeWidth="1" opacity="0.4" />
            {[38,48,58,68,78].map((x,i) => (
              <circle key={i} cx={x} cy={16 + (i%2)*4} r={4+ (i%3)} fill={hairColorHex} opacity="0.85" />
            ))}
            <circle cx="32" cy="28" r="4" fill={hairColorHex} opacity="0.7" />
            <circle cx="88" cy="28" r="4" fill={hairColorHex} opacity="0.7" />
          </g>
        );
      case "puff-buns":
        return (
          <g>
            <ellipse cx="60" cy="32" rx="27" ry="17" fill={hairColorHex} />
            <circle cx="32" cy="18" r="14" fill={hairColorHex} />
            <circle cx="32" cy="18" r="14" fill="none" stroke={hcDark} strokeWidth="0.8" opacity="0.5" />
            <circle cx="88" cy="18" r="14" fill={hairColorHex} />
            <circle cx="88" cy="18" r="14" fill="none" stroke={hcDark} strokeWidth="0.8" opacity="0.5" />
            <circle cx="32" cy="11" r="3.5" fill="#FF5C8A" opacity="0.85" />
            <circle cx="88" cy="11" r="3.5" fill="#FF5C8A" opacity="0.85" />
          </g>
        );
      case "braids":
        return (
          <g>
            <ellipse cx="60" cy="32" rx="27" ry="17" fill={hairColorHex} />
            <rect x="28" y="28" width="8" height="40" rx="4" fill={hairColorHex} />
            <rect x="29" y="28" width="2.5" height="40" rx="1.25" fill={hcDark} opacity="0.35" />
            <rect x="84" y="28" width="8" height="40" rx="4" fill={hairColorHex} />
            <rect x="86.5" y="28" width="2.5" height="40" rx="1.25" fill={hcDark} opacity="0.35" />
            <circle cx="32" cy="70" r="4.5" fill={hairColorHex} />
            <circle cx="88" cy="70" r="4.5" fill={hairColorHex} />
            <rect x="28" y="67" width="8" height="3" rx="1.5" fill="#FF5C8A" opacity="0.8" />
            <rect x="84" y="67" width="8" height="3" rx="1.5" fill="#FF5C8A" opacity="0.8" />
          </g>
        );
      case "hightop-fade":
        return (
          <g>
            <ellipse cx="60" cy="33" rx="22" ry="14" fill={hairColorHex} opacity="0.45" />
            <rect x="38" y="10" width="44" height="28" rx="12" fill={hairColorHex} />
            <rect x="42" y="6" width="36" height="20" rx="8" fill={hairColorHex} />
            <rect x="33" y="26" width="6" height="13" rx="3" fill={hairColorHex} opacity="0.35" />
            <rect x="81" y="26" width="6" height="13" rx="3" fill={hairColorHex} opacity="0.35" />
          </g>
        );
      case "twists":
        return (
          <g>
            <ellipse cx="60" cy="31" rx="27" ry="17" fill={hairColorHex} />
            <rect x="30" y="27" width="7" height="32" rx="3.5" fill={hairColorHex} />
            <rect x="31" y="27" width="2" height="32" rx="1" fill={hcDark} opacity="0.35" />
            <rect x="83" y="27" width="7" height="32" rx="3.5" fill={hairColorHex} />
            <rect x="85" y="27" width="2" height="32" rx="1" fill={hcDark} opacity="0.35" />
            <ellipse cx="48" cy="20" rx="5.5" ry="8" fill={hairColorHex} />
            <ellipse cx="72" cy="20" rx="5.5" ry="8" fill={hairColorHex} />
          </g>
        );
      default: // short-curls
        return (
          <g>
            <ellipse cx="60" cy="31" rx="27" ry="18" fill={hairColorHex} />
            {[42,50,58,66,74].map((x,i) => (
              <circle key={i} cx={x} cy={18 + (i%2)*3} r={4} fill={hairColorHex} opacity="0.9" />
            ))}
            <circle cx="35" cy="30" r="3" fill={hairColorHex} opacity="0.7" />
            <circle cx="85" cy="30" r="3" fill={hairColorHex} opacity="0.7" />
          </g>
        );
    }
  };

  const renderFace = () => {
    let eyes: React.ReactNode;
    let mouth: React.ReactNode;

    switch (expression) {
      case "excited":
        eyes = (
          <>
            <ellipse cx="48.5" cy="45" rx="6" ry="6.5" fill="white" />
            <ellipse cx="71.5" cy="45" rx="6" ry="6.5" fill="white" />
            <circle cx="50" cy="44.5" r="3.5" fill="#2D1B0E" />
            <circle cx="73" cy="44.5" r="3.5" fill="#2D1B0E" />
            <circle cx="51.5" cy="42.5" r="1.5" fill="white" />
            <circle cx="74.5" cy="42.5" r="1.5" fill="white" />
            <path d="M42 38 Q48.5 35.5 55 38" stroke={hairColorHex} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M65 38 Q71.5 35.5 78 38" stroke={hairColorHex} strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
        mouth = (
          <>
            <ellipse cx="60" cy="60" rx="8" ry="6" fill="#E57373" />
            <ellipse cx="60" cy="56.5" rx="6.5" ry="3" fill={skinHex} />
            <ellipse cx="60" cy="63.5" rx="4.5" ry="2" fill="#FF8A80" opacity="0.5" />
          </>
        );
        break;
      case "cool":
        eyes = (
          <>
            <rect x="42" y="41" width="13" height="8.5" rx="4.25" fill="#37474F" opacity="0.88" />
            <rect x="65" y="41" width="13" height="8.5" rx="4.25" fill="#37474F" opacity="0.88" />
            <line x1="55" y1="45" x2="65" y2="45" stroke="#37474F" strokeWidth="2" />
            <line x1="42" y1="44" x2="37" y2="42" stroke="#37474F" strokeWidth="2" />
            <line x1="78" y1="44" x2="83" y2="42" stroke="#37474F" strokeWidth="2" />
          </>
        );
        mouth = <path d="M50 58 Q57 62 60 58 Q63 62 70 58" stroke="#C68642" strokeWidth="2" fill="none" strokeLinecap="round" />;
        break;
      case "proud":
        eyes = (
          <>
            <ellipse cx="48.5" cy="45" rx="5.5" ry="6" fill="white" />
            <ellipse cx="71.5" cy="45" rx="5.5" ry="6" fill="white" />
            <circle cx="49.5" cy="44.5" r="3.2" fill="#2D1B0E" />
            <circle cx="72.5" cy="44.5" r="3.2" fill="#2D1B0E" />
            <circle cx="50.8" cy="43" r="1.2" fill="white" />
            <circle cx="73.8" cy="43" r="1.2" fill="white" />
            <path d="M42 38 L55 40" stroke={hairColorHex} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M78 40 L65 38" stroke={hairColorHex} strokeWidth="2" fill="none" strokeLinecap="round" />
            <text x="60" y="33" textAnchor="middle" fontSize="9" fontWeight="900" fill="#F5A524" opacity="0.8">★</text>
          </>
        );
        mouth = (
          <>
            <path d="M48 56 Q60 67 72 56" fill="#E57373" opacity="0.9" />
            <path d="M50 56 Q60 64 70 56" stroke="#C68642" strokeWidth="1" fill="none" />
          </>
        );
        break;
      default: // happy
        eyes = (
          <>
            <ellipse cx="48.5" cy="45" rx="5" ry="5.5" fill="white" />
            <ellipse cx="71.5" cy="45" rx="5" ry="5.5" fill="white" />
            <circle cx="49.5" cy="44.5" r="3" fill="#2D1B0E" />
            <circle cx="72.5" cy="44.5" r="3" fill="#2D1B0E" />
            <circle cx="50.8" cy="43" r="1.1" fill="white" />
            <circle cx="73.8" cy="43" r="1.1" fill="white" />
            <path d="M42 39 Q48.5 36.5 55 39" stroke={hairColorHex} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M65 39 Q71.5 36.5 78 39" stroke={hairColorHex} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </>
        );
        mouth = (
          <>
            <path d="M49 55 Q60 66 71 55" stroke="#C68642" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M51 56 Q60 63 69 56" fill="#E57373" opacity="0.7" />
          </>
        );
        break;
    }

    return (
      <>
        {eyes}
        <ellipse cx="60" cy="53" rx="3.5" ry="2.5" fill={sD} opacity="0.4" />
        {mouth}
        <circle cx="41" cy="53" r="5" fill="#FFCDD2" opacity="0.3" />
        <circle cx="79" cy="53" r="5" fill="#FFCDD2" opacity="0.3" />
      </>
    );
  };

  const renderEquippedHat = () => {
    if (!equippedItems?.hat) return null;
    const hat = equippedItems.hat;
    // Render different hat types based on name
    if (hat.name?.toLowerCase().includes("safari") || hat.name?.toLowerCase().includes("explorer")) {
      return (
        <g>
          <ellipse cx="60" cy="18" rx="30" ry="8" fill="#C4956A" />
          <rect x="38" y="4" width="44" height="16" rx="6" fill="#D4A574" />
          <rect x="38" y="16" width="44" height="4" rx="2" fill="#8B6914" />
        </g>
      );
    }
    if (hat.name?.toLowerCase().includes("wizard") || hat.name?.toLowerCase().includes("math")) {
      return (
        <g>
          <polygon points="60,0 38,28 82,28" fill="#4F46E5" />
          <polygon points="60,0 44,22 76,22" fill="#6366F1" opacity="0.5" />
          <circle cx="60" cy="8" r="3" fill="#F5A524" />
          <rect x="38" y="26" width="44" height="4" rx="2" fill="#37474F" />
        </g>
      );
    }
    if (hat.name?.toLowerCase().includes("crown") || hat.name?.toLowerCase().includes("creative")) {
      return (
        <g>
          <polygon points="40,22 44,6 50,14 56,2 60,10 64,2 70,14 76,6 80,22" fill="#F5A524" />
          <rect x="40" y="20" width="40" height="5" rx="2" fill="#E5A520" />
          <circle cx="50" cy="12" r="2" fill="#EF4444" />
          <circle cx="60" cy="6" r="2.5" fill="#3B82F6" />
          <circle cx="70" cy="12" r="2" fill="#10B981" />
        </g>
      );
    }
    // Default hat
    return (
      <g>
        <rect x="36" y="8" width="48" height="14" rx="7" fill="#4F46E5" />
        <rect x="36" y="18" width="48" height="4" rx="2" fill="#37474F" />
      </g>
    );
  };

  const renderEquippedGlasses = () => {
    if (!equippedItems?.glasses) return null;
    const g = equippedItems.glasses;
    if (g.name?.toLowerCase().includes("scientist") || g.name?.toLowerCase().includes("goggles")) {
      return (
        <g>
          <circle cx="48" cy="45" r="9" fill="none" stroke="#37474F" strokeWidth="2.5" />
          <circle cx="72" cy="45" r="9" fill="none" stroke="#37474F" strokeWidth="2.5" />
          <line x1="57" y1="45" x2="63" y2="45" stroke="#37474F" strokeWidth="2" />
          <line x1="39" y1="43" x2="33" y2="41" stroke="#37474F" strokeWidth="2" />
          <line x1="81" y1="43" x2="87" y2="41" stroke="#37474F" strokeWidth="2" />
          <circle cx="48" cy="45" r="7" fill="#81D4FA" opacity="0.2" />
          <circle cx="72" cy="45" r="7" fill="#81D4FA" opacity="0.2" />
        </g>
      );
    }
    // Reading glasses
    return (
      <g>
        <rect x="41" y="40" width="14" height="10" rx="5" fill="none" stroke="#37474F" strokeWidth="1.8" />
        <rect x="65" y="40" width="14" height="10" rx="5" fill="none" stroke="#37474F" strokeWidth="1.8" />
        <line x1="55" y1="45" x2="65" y2="45" stroke="#37474F" strokeWidth="1.5" />
        <line x1="41" y1="44" x2="36" y2="42" stroke="#37474F" strokeWidth="1.5" />
        <line x1="79" y1="44" x2="84" y2="42" stroke="#37474F" strokeWidth="1.5" />
      </g>
    );
  };

  const renderEquippedPet = () => {
    if (!equippedItems?.pet) return null;
    const pet = equippedItems.pet;
    if (pet.name?.toLowerCase().includes("rabbit")) {
      return (
        <g>
          <ellipse cx="90" cy="160" rx="12" ry="10" fill="#F5F5F5" />
          <ellipse cx="90" cy="148" rx="7" ry="8" fill="#F5F5F5" />
          <ellipse cx="86" cy="140" rx="2.5" ry="6" fill="#F5F5F5" />
          <ellipse cx="94" cy="140" rx="2.5" ry="6" fill="#F5F5F5" />
          <ellipse cx="86" cy="140" rx="1.5" ry="4" fill="#FFB6C1" />
          <ellipse cx="94" cy="140" rx="1.5" ry="4" fill="#FFB6C1" />
          <circle cx="87" cy="147" r="1.5" fill="#333" />
          <circle cx="93" cy="147" r="1.5" fill="#333" />
          <ellipse cx="90" cy="151" rx="2" ry="1.2" fill="#FFB6C1" />
        </g>
      );
    }
    if (pet.name?.toLowerCase().includes("robot")) {
      return (
        <g>
          <rect x="82" y="148" width="16" height="18" rx="3" fill="#94A3B8" />
          <rect x="85" y="144" width="10" height="6" rx="2" fill="#64748B" />
          <circle cx="87" cy="151" r="2" fill="#22D3EE" />
          <circle cx="93" cy="151" r="2" fill="#22D3EE" />
          <rect x="84" y="156" width="12" height="2" rx="1" fill="#64748B" />
          <rect x="84" y="160" width="12" height="2" rx="1" fill="#64748B" />
          <circle cx="87" cy="144" r="2" fill="#EF4444" />
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
      {/* Ground shadow */}
      <ellipse cx="60" cy="186" rx="32" ry="4.5" fill="#CBD5E1" opacity="0.35" />

      {/* Pet (behind body) */}
      {renderEquippedPet()}

      {/* LEGS */}
      <rect x="42" y="132" width="14" height="38" rx="6" fill="#37474F" />
      <rect x="64" y="132" width="14" height="38" rx="6" fill="#37474F" />
      <rect x="44" y="134" width="4" height="34" rx="2" fill="rgba(0,0,0,0.12)" />
      <rect x="66" y="134" width="4" height="34" rx="2" fill="rgba(0,0,0,0.12)" />

      {/* SHOES */}
      <ellipse cx="49" cy="175" rx="14" ry="7.5" fill={shoeHex} />
      <ellipse cx="71" cy="175" rx="14" ry="7.5" fill={shoeHex} />
      <ellipse cx="49" cy="178.5" rx="12" ry="4.5" fill={darken(shoeHex, 35)} opacity="0.5" />
      <ellipse cx="71" cy="178.5" rx="12" ry="4.5" fill={darken(shoeHex, 35)} opacity="0.5" />
      <ellipse cx="49" cy="171.5" rx="5.5" ry="2.8" fill="white" opacity="0.12" />
      <ellipse cx="71" cy="171.5" rx="5.5" ry="2.8" fill="white" opacity="0.12" />

      {/* BODY / TORSO */}
      <rect x="34" y="85" width="52" height="52" rx="14" fill={outfitHex} />
      <path d="M49 85 Q60 94 71 85" stroke={darken(outfitHex, 30)} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <line x1="60" y1="93" x2="60" y2="133" stroke={darken(outfitHex, 20)} strokeWidth="1" opacity="0.25" />
      <rect x="37" y="88" width="9" height="22" rx="4.5" fill="white" opacity="0.08" />

      {/* LEFT ARM */}
      <rect x="20" y="89" width="15" height="38" rx="7.5" fill={outfitHex} />
      <rect x="22" y="91" width="4" height="34" rx="2" fill={darken(outfitHex, 15)} opacity="0.3" />
      <circle cx="27.5" cy="129" r="7" fill={skinHex} />
      <circle cx="27.5" cy="129" r="7" fill="none" stroke={sOut} strokeWidth="0.8" opacity="0.45" />

      {/* RIGHT ARM */}
      <rect x="85" y="89" width="15" height="38" rx="7.5" fill={outfitHex} />
      <rect x="87" y="91" width="4" height="34" rx="2" fill={darken(outfitHex, 15)} opacity="0.3" />
      <circle cx="92.5" cy="129" r="7" fill={skinHex} />
      <circle cx="92.5" cy="129" r="7" fill="none" stroke={sOut} strokeWidth="0.8" opacity="0.45" />

      {/* NECK */}
      <rect x="52" y="72" width="16" height="15" rx="5" fill={skinHex} />

      {/* HEAD */}
      <ellipse cx="60" cy="43" rx="26" ry="29" fill={skinHex} />
      <ellipse cx="60" cy="43" rx="26" ry="29" fill="none" stroke={sOut} strokeWidth="0.6" opacity="0.35" />

      {/* LEFT EAR */}
      <ellipse cx="34" cy="46" rx="5.5" ry="7.5" fill={skinHex} />
      <ellipse cx="34" cy="46" rx="5.5" ry="7.5" fill="none" stroke={sOut} strokeWidth="0.5" opacity="0.4" />
      <ellipse cx="34" cy="46" rx="2.8" ry="4.5" fill={sD} opacity="0.25" />

      {/* RIGHT EAR */}
      <ellipse cx="86" cy="46" rx="5.5" ry="7.5" fill={skinHex} />
      <ellipse cx="86" cy="46" rx="5.5" ry="7.5" fill="none" stroke={sOut} strokeWidth="0.5" opacity="0.4" />
      <ellipse cx="86" cy="46" rx="2.8" ry="4.5" fill={sD} opacity="0.25" />

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
