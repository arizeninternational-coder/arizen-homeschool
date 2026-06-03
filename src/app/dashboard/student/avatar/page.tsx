"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  UserRound, Shuffle, RotateCcw, Save, Check,
  Sparkles, Palette, Scissors, Smile, Footprints,
  Loader2, Star,
} from "lucide-react";
import { PageHeader, GradientButton } from "@/components/ui/Pill";

/* ═══════════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════════ */

const SKIN_TONES = [
  { id: "light", hex: "#FDDCB5" },
  { id: "fair", hex: "#F5C6A0" },
  { id: "medium", hex: "#C68642" },
  { id: "olive", hex: "#A0724A" },
  { id: "brown", hex: "#6B3A2A" },
  { id: "deep", hex: "#4A2C17" },
];

const HAIR_COLORS = [
  { id: "black", hex: "#1a1a1a" },
  { id: "dark-brown", hex: "#3B2314" },
  { id: "medium-brown", hex: "#6B3A2A" },
  { id: "warm-brown", hex: "#8B5E3C" },
  { id: "auburn", hex: "#92400E" },
  { id: "teal", hex: "#047A70" },
  { id: "purple", hex: "#7C3AED" },
  { id: "pink", hex: "#EC4899" },
];

const HAIRSTYLES = [
  { id: "short-curls", name: "Short Curls" },
  { id: "afro", name: "Rounded Afro" },
  { id: "puff-buns", name: "Puff Buns" },
  { id: "braids", name: "Braids" },
  { id: "hightop-fade", name: "High-Top Fade" },
  { id: "twists", name: "Twists" },
];

const OUTFIT_COLORS = [
  { id: "blue", hex: "#4FC3F7" },
  { id: "teal", hex: "#00A884" },
  { id: "red", hex: "#EF5350" },
  { id: "purple", hex: "#8B5CF6" },
  { id: "orange", hex: "#FFA726" },
  { id: "pink", hex: "#FF5C8A" },
  { id: "indigo", hex: "#4F46E5" },
  { id: "yellow", hex: "#FFD54F" },
];

const SHOE_COLORS = [
  { id: "black", hex: "#37474F" },
  { id: "white", hex: "#ECEFF1" },
  { id: "red", hex: "#C62828" },
  { id: "blue", hex: "#1565C0" },
  { id: "brown", hex: "#6D4C41" },
  { id: "pink", hex: "#E91E63" },
];

const EXPRESSIONS = [
  { id: "happy", name: "Happy" },
  { id: "excited", name: "Excited" },
  { id: "cool", name: "Cool" },
  { id: "proud", name: "Proud" },
];

const TABS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: "skin", label: "Skin Tone", icon: <Palette size={16} /> },
  { id: "hair-style", label: "Hair Style", icon: <Scissors size={16} /> },
  { id: "hair-color", label: "Hair Color", icon: <Palette size={16} /> },
  { id: "top", label: "Clothing", icon: <Sparkles size={16} /> },
  { id: "expression", label: "Expression", icon: <Smile size={16} /> },
  { id: "shoes", label: "Shoes", icon: <Footprints size={16} /> },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

function darken(hex: string, amt: number): string {
  if (!hex || !hex.startsWith("#")) return hex;
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - amt);
    const g = Math.max(0, ((num >> 8) & 0xff) - amt);
    const b = Math.max(0, (num & 0xff) - amt);
    return `rgb(${r},${g},${b})`;
  } catch {
    return hex;
  }
}

function getHex(arr: { id: string; hex: string }[], id: string, fallback: string): string {
  return arr.find((x) => x.id === id)?.hex || fallback;
}

/* ═══════════════════════════════════════════════════════════
   FULL BODY AVATAR SVG
   ═══════════════════════════════════════════════════════════ */

function AvatarSVG({
  skinHex,
  hairColorHex,
  hairStyle,
  outfitHex,
  shoeHex,
  expression,
}: {
  skinHex: string;
  hairColorHex: string;
  hairStyle: string;
  outfitHex: string;
  shoeHex: string;
  expression: string;
}) {
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

  const renderEyesAndMouth = () => {
    // Eyes
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
            <rect x="44" y="43" width="4" height="1.5" rx="0.75" fill="white" opacity="0.25" />
            <rect x="67" y="43" width="4" height="1.5" rx="0.75" fill="white" opacity="0.25" />
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

  return (
    <svg viewBox="15 0 90 190" width="200" height="340" xmlns="http://www.w3.org/2000/svg">
      {/* Ground shadow */}
      <ellipse cx="60" cy="186" rx="32" ry="4.5" fill="#CBD5E1" opacity="0.35" />

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

      {/* FACE */}
      {renderEyesAndMouth()}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   HAIR STYLE MINI PREVIEW
   ═══════════════════════════════════════════════════════════ */

function HairStylePreview({
  styleId,
  colorHex,
  styleName,
  selected,
  onClick,
}: {
  styleId: string;
  colorHex: string;
  styleName: string;
  selected: boolean;
  onClick: () => void;
}) {
  const renderMiniHair = () => {
    switch (styleId) {
      case "afro":
        return <ellipse cx="25" cy="13" rx="18" ry="14" fill={colorHex} />;
      case "puff-buns":
        return (
          <>
            <ellipse cx="25" cy="16" rx="15" ry="9" fill={colorHex} />
            <circle cx="11" cy="8" r="8" fill={colorHex} />
            <circle cx="39" cy="8" r="8" fill={colorHex} />
          </>
        );
      case "braids":
        return (
          <>
            <ellipse cx="25" cy="16" rx="15" ry="9" fill={colorHex} />
            <rect x="9" y="14" width="5" height="18" rx="2.5" fill={colorHex} />
            <rect x="41" y="14" width="5" height="18" rx="2.5" fill={colorHex} />
          </>
        );
      case "hightop-fade":
        return (
          <>
            <rect x="15" y="4" width="20" height="14" rx="6" fill={colorHex} />
            <rect x="17" y="1" width="16" height="10" rx="5" fill={colorHex} />
          </>
        );
      case "twists":
        return (
          <>
            <ellipse cx="25" cy="15" rx="15" ry="9" fill={colorHex} />
            <rect x="10" y="13" width="5" height="16" rx="2.5" fill={colorHex} />
            <rect x="40" y="13" width="5" height="16" rx="2.5" fill={colorHex} />
            <ellipse cx="20" cy="8" rx="4" ry="6" fill={colorHex} />
            <ellipse cx="30" cy="8" rx="4" ry="6" fill={colorHex} />
          </>
        );
      default: // short-curls
        return (
          <>
            <ellipse cx="25" cy="15" rx="15" ry="10" fill={colorHex} />
            <circle cx="16" cy="10" r="3" fill={colorHex} />
            <circle cx="34" cy="10" r="3" fill={colorHex} />
          </>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 ${
        selected
          ? "border-primary bg-primary/5 shadow-[0_4px_15px_rgba(79,70,229,0.12)]"
          : "border-white/60 bg-white hover:border-primary/30"
      }`}
    >
      <svg viewBox="0 6 50 40" width={48} height={40}>
        <circle cx="25" cy="26" r="16" fill="#C68642" />
        <circle cx="9" cy="26" r="4.5" fill="#C68642" />
        <circle cx="41" cy="26" r="4.5" fill="#C68642" />
        <ellipse cx="19" cy="24" rx="3" ry="3" fill="white" />
        <ellipse cx="31" cy="24" rx="3" ry="3" fill="white" />
        <circle cx="19.5" cy="24" r="1.8" fill="#2D1B0E" />
        <circle cx="31.5" cy="24" r="1.8" fill="#2D1B0E" />
        <path d="M18 32 Q25 36 32 32" stroke="#A0724A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="14" cy="28" r="3" fill="#FFCDD2" opacity="0.25" />
        <circle cx="36" cy="28" r="3" fill="#FFCDD2" opacity="0.25" />
        {renderMiniHair()}
      </svg>
      <span className={`text-xs font-bold leading-tight text-center ${selected ? "text-primary" : "text-text-muted"}`}>
        {styleName}
      </span>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check size={11} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXPRESSION PREVIEW
   ═══════════════════════════════════════════════════════════ */

function ExpressionPreview({
  exprId,
  exprName,
  skinHex,
  hairColorHex,
  selected,
  onClick,
}: {
  exprId: string;
  exprName: string;
  skinHex: string;
  hairColorHex: string;
  selected: boolean;
  onClick: () => void;
}) {
  const renderFace = () => {
    switch (exprId) {
      case "excited":
        return (
          <>
            <ellipse cx="26" cy="22" rx="6" ry="6.5" fill="white" />
            <ellipse cx="42" cy="22" rx="6" ry="6.5" fill="white" />
            <circle cx="27" cy="21" r="3.5" fill="#2D1B0E" />
            <circle cx="43" cy="21" r="3.5" fill="#2D1B0E" />
            <circle cx="28.5" cy="19.5" r="1.5" fill="white" />
            <circle cx="44.5" cy="19.5" r="1.5" fill="white" />
            <ellipse cx="34" cy="34" rx="6.5" ry="4.5" fill="#E57373" />
            <ellipse cx="34" cy="31.5" rx="5" ry="2.5" fill={skinHex} />
          </>
        );
      case "cool":
        return (
          <>
            <rect x="19" y="18" width="14" height="8" rx="4" fill="#37474F" opacity="0.88" />
            <rect x="35" y="18" width="14" height="8" rx="4" fill="#37474F" opacity="0.88" />
            <line x1="33" y1="22" x2="35" y2="22" stroke="#37474F" strokeWidth="2" />
            <path d="M24 33 Q29 37 31 33 Q33 37 40 33" stroke="#C68642" strokeWidth="1.8" fill="none" />
          </>
        );
      case "proud":
        return (
          <>
            <ellipse cx="26" cy="22" rx="5.5" ry="6" fill="white" />
            <ellipse cx="42" cy="22" rx="5.5" ry="6" fill="white" />
            <circle cx="26.5" cy="21" r="3.2" fill="#2D1B0E" />
            <circle cx="42.5" cy="21" r="3.2" fill="#2D1B0E" />
            <circle cx="27.5" cy="19.5" r="1.1" fill="white" />
            <circle cx="43.5" cy="19.5" r="1.1" fill="white" />
            <path d="M19 17 L32 19" stroke={hairColorHex} strokeWidth="1.8" fill="none" />
            <path d="M49 19 L36 17" stroke={hairColorHex} strokeWidth="1.8" fill="none" />
            <path d="M23 32 Q34 41 45 32" fill="#E57373" opacity="0.9" />
            <text x="34" y="13" textAnchor="middle" fontSize="7" fontWeight="900" fill="#F5A524" opacity="0.8">★</text>
          </>
        );
      default: // happy
        return (
          <>
            <ellipse cx="26" cy="22" rx="5" ry="5.5" fill="white" />
            <ellipse cx="42" cy="22" rx="5" ry="5.5" fill="white" />
            <circle cx="26.5" cy="21" r="3" fill="#2D1B0E" />
            <circle cx="42.5" cy="21" r="3" fill="#2D1B0E" />
            <circle cx="27.5" cy="19.5" r="1.1" fill="white" />
            <circle cx="43.5" cy="19.5" r="1.1" fill="white" />
            <path d="M19 17 Q26 14 33 17" stroke={hairColorHex} strokeWidth="1.5" fill="none" />
            <path d="M35 17 Q42 14 49 17" stroke={hairColorHex} strokeWidth="1.5" fill="none" />
            <path d="M22 31 Q34 41 46 31" stroke="#C68642" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M24 32 Q34 39 44 32" fill="#E57373" opacity="0.7" />
          </>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 ${
        selected
          ? "border-primary bg-primary/5 shadow-[0_4px_15px_rgba(79,70,229,0.12)]"
          : "border-white/60 bg-white hover:border-primary/30"
      }`}
    >
      <svg viewBox="14 6 48 42" width={52} height={44}>
        <circle cx="34" cy="28" r="20" fill={skinHex} />
        <circle cx="16" cy="28" r="5" fill={skinHex} />
        <circle cx="52" cy="28" r="5" fill={skinHex} />
        {renderFace()}
      </svg>
      <span className={`text-xs font-bold leading-tight ${selected ? "text-primary" : "text-text-muted"}`}>
        {exprName}
      </span>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check size={11} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   COLOR SWATCH REUSABLE
   ═══════════════════════════════════════════════════════════ */

function ColorSwatch({
  hex,
  selected,
  onClick,
  size = 32,
}: {
  hex: string;
  selected: boolean;
  onClick: () => void;
  size?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border-2 border-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
      style={{
        width: size,
        height: size,
        background: hex,
        boxShadow: selected
          ? "0 0 0 2px #4F46E5, 0 0 14px rgba(79,70,229,0.3)"
          : "0 0 0 2px #E5EAF3, 0 2px 8px rgba(0,0,0,0.08)",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   SPARKLE DECORATIONS
   ═══════════════════════════════════════════════════════════ */

function SparkleDecorations() {
  return (
    <>
      <div className="absolute top-4 left-6 animate-float-slow" style={{ opacity: 0.5 }}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M10 1L11.8 8L19 10L11.8 12L10 19L8.2 12L1 10L8.2 3Z" fill="#F5A524" />
        </svg>
      </div>
      <div className="absolute top-10 right-8 animate-float-medium" style={{ opacity: 0.4 }}>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L11.5 8L18.5 10L11.5 12L10 18L8.5 12L1.5 10L8.5 4Z" fill="#8B5CF6" />
        </svg>
      </div>
      <div className="absolute bottom-16 left-8 animate-float-fast" style={{ opacity: 0.35 }}>
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
          <path d="M10 3L11.2 7.5L16.5 10L11.2 12.5L10 17L8.8 12.5L3.5 10L8.8 5.5Z" fill="#3BA7FF" />
        </svg>
      </div>
      <div className="absolute bottom-20 right-6 animate-float-slow" style={{ opacity: 0.4 }}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L11.5 8L18.5 10L11.5 12L10 18L8.5 12L1.5 10L8.5 4Z" fill="#FF5C8A" />
        </svg>
      </div>
      <div className="absolute top-20 left-[45%] animate-float-medium" style={{ opacity: 0.25 }}>
        <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
          <path d="M10 4L11 8L15.5 10L11 12L10 16L9 12L4.5 10L9 6Z" fill="#00A884" />
        </svg>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADING SPINNER
   ═══════════════════════════════════════════════════════════ */

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary" strokeWidth={2.5} />
        <p className="text-text font-bold text-sm">Loading your avatar...</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUCCESS TOAST
   ═══════════════════════════════════════════════════════════ */

function SuccessToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="fixed bottom-8 right-8 z-50 animate-slide-up flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-[0_8px_30px_rgba(0,168,132,0.25)]"
      style={{ background: "linear-gradient(135deg, #00A884 0%, #047A70 100%)" }}
    >
      <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center">
        <Check size={16} className="text-white" strokeWidth={3} />
      </div>
      <span className="text-white font-bold text-sm">Avatar saved successfully!</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function AvatarPage() {
  const [activeTab, setActiveTab] = useState("skin");
  const [hairStyle, setHairStyle] = useState("short-curls");
  const [hairColor, setHairColor] = useState("black");
  const [skin, setSkin] = useState("medium");
  const [outfitColor, setOutfitColor] = useState("blue");
  const [shoeColor, setShoeColor] = useState("black");
  const [expression, setExpression] = useState("happy");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarLevel, setAvatarLevel] = useState(5);

  useEffect(() => {
    async function loadAvatar() {
      try {
        const res = await fetch("/api/avatar", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.avatar) {
            setHairStyle(data.avatar.hairStyle || "short-curls");
            setHairColor(data.avatar.hairColor || "black");
            setSkin(data.avatar.skinTone || "medium");
            if ((data.avatar as Record<string, unknown>).outfitColor) {
              setOutfitColor((data.avatar as Record<string, unknown>).outfitColor as string);
            }
            if ((data.avatar as Record<string, unknown>).shoeColor) {
              setShoeColor((data.avatar as Record<string, unknown>).shoeColor as string);
            }
            if ((data.avatar as Record<string, unknown>).expression) {
              setExpression((data.avatar as Record<string, unknown>).expression as string);
            }
          }
          if (data.level) setAvatarLevel(data.level);
          else if ((data.avatar as Record<string, unknown>)?.level) {
            setAvatarLevel((data.avatar as Record<string, unknown>).level as number);
          }
        }
      } catch (e) {
        console.error("[AVATAR] Load error:", e);
      }
      setLoading(false);
    }
    loadAvatar();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hairStyle,
          hairColor,
          skinTone: skin,
          outfitColor,
          shoeColor,
          expression,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error("[AVATAR] Save error:", e);
    }
    setSaving(false);
  };

  const handleRandomize = () => {
    setHairStyle(HAIRSTYLES[Math.floor(Math.random() * HAIRSTYLES.length)].id);
    setHairColor(HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id);
    setSkin(SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id);
    setOutfitColor(OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)].id);
    setShoeColor(SHOE_COLORS[Math.floor(Math.random() * SHOE_COLORS.length)].id);
    setExpression(EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)].id);
  };

  const handleReset = () => {
    setHairStyle("short-curls");
    setHairColor("black");
    setSkin("medium");
    setOutfitColor("blue");
    setShoeColor("black");
    setExpression("happy");
  };

  const currentSkinHex = getHex(SKIN_TONES, skin, "#C68642");
  const currentHairColorHex = getHex(HAIR_COLORS, hairColor, "#1a1a1a");
  const currentOutfitHex = getHex(OUTFIT_COLORS, outfitColor, "#4FC3F7");
  const currentShoeHex = getHex(SHOE_COLORS, shoeColor, "#37474F");

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <PageHeader title="My Avatar">
        <p className="text-sm text-text-muted mt-1">Personalize your learning identity</p>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        {/* ═══ AVATAR STAGE ═══ */}
        <div className="relative">
          <div
            className="rounded-3xl border border-white/60 overflow-hidden relative"
            style={{
              background: "linear-gradient(180deg, #F0FDF4 0%, #EEF2FF 100%)",
              minHeight: "480px",
            }}
          >
            <SparkleDecorations />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center" style={{ padding: "32px 24px" }}>
              {/* Level Badge - top right */}
              <div
                className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full font-extrabold text-xs flex items-center gap-1"
                style={{
                  background: "linear-gradient(135deg, #FCD34D 0%, #F5A524 100%)",
                  boxShadow: "0 4px 15px rgba(245,165,36,0.25)",
                  color: "#78350F",
                }}
              >
                <Star size={12} fill="#78350F" />
                Level {avatarLevel}
              </div>

              {/* Avatar SVG */}
              <div className="flex items-center justify-center" style={{ marginTop: "16px", marginBottom: "24px" }}>
                <AvatarSVG
                  skinHex={currentSkinHex}
                  hairColorHex={currentHairColorHex}
                  hairStyle={hairStyle}
                  outfitHex={currentOutfitHex}
                  shoeHex={currentShoeHex}
                  expression={expression}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleRandomize}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/60 bg-white text-text font-bold text-xs cursor-pointer transition-all hover:bg-bg-main hover:border-primary/30 active:scale-[0.97]"
                >
                  <Shuffle size={14} />
                  Randomize
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/60 bg-white text-text font-bold text-xs cursor-pointer transition-all hover:bg-bg-main hover:border-primary/30 active:scale-[0.97]"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>

              {/* Save Button */}
              <div className="w-full mt-3">
                <GradientButton
                  onClick={handleSave}
                  disabled={saving}
                  variant={saved ? "success" : "primary"}
                  size="lg"
                  icon={
                    saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : saved ? (
                      <Check size={16} />
                    ) : (
                      <Save size={16} />
                    )
                  }
                  className="w-full"
                >
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Avatar"}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ CUSTOMIZATION PANELS ═══ */}
        <div className="bg-white rounded-3xl border border-white/60" style={{ padding: "28px" }}>
          {/* Tabs */}
          <div
            className="flex gap-1.5 mb-8 border-b border-white/60 pb-4 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary-soft text-primary shadow-[0_2px_8px_rgba(79,70,229,0.1)]"
                    : "bg-transparent text-text-muted hover:bg-bg-main hover:text-text"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Skin Tone Tab ── */}
          {activeTab === "skin" && (
            <div className="animate-fade-in">
              <h3 className="text-base font-extrabold text-text mb-1">Choose Skin Tone</h3>
              <p className="text-xs text-text-muted mb-5">Select a tone that represents you</p>
              <div className="flex gap-4 flex-wrap">
                {SKIN_TONES.map((t) => (
                  <div key={t.id} className="flex flex-col items-center gap-2">
                    <ColorSwatch
                      hex={t.hex}
                      selected={skin === t.id}
                      onClick={() => setSkin(t.id)}
                      size={44}
                    />
                    <span className={`text-[0.65rem] font-bold capitalize ${skin === t.id ? "text-primary" : "text-text-muted"}`}>
                      {t.id.replace("-", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Hair Style Tab ── */}
          {activeTab === "hair-style" && (
            <div className="animate-fade-in">
              <h3 className="text-base font-extrabold text-text mb-1">Choose Hairstyle</h3>
              <p className="text-xs text-text-muted mb-5">Pick your favorite look</p>
              <div className="grid grid-cols-3 gap-3">
                {HAIRSTYLES.map((h) => (
                  <HairStylePreview
                    key={h.id}
                    styleId={h.id}
                    colorHex={currentHairColorHex}
                    styleName={h.name}
                    selected={hairStyle === h.id}
                    onClick={() => setHairStyle(h.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Hair Color Tab ── */}
          {activeTab === "hair-color" && (
            <div className="animate-fade-in">
              <h3 className="text-base font-extrabold text-text mb-1">Hair Color</h3>
              <p className="text-xs text-text-muted mb-5">Choose your hair color</p>
              <div className="flex gap-4 flex-wrap">
                {HAIR_COLORS.map((c) => (
                  <div key={c.id} className="flex flex-col items-center gap-2">
                    <ColorSwatch
                      hex={c.hex}
                      selected={hairColor === c.id}
                      onClick={() => setHairColor(c.id)}
                      size={40}
                    />
                    <span className={`text-[0.65rem] font-bold capitalize ${hairColor === c.id ? "text-primary" : "text-text-muted"}`}>
                      {c.id.replace("-", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Clothing Tab ── */}
          {activeTab === "top" && (
            <div className="animate-fade-in">
              <h3 className="text-base font-extrabold text-text mb-1">Clothing Color</h3>
              <p className="text-xs text-text-muted mb-5">Pick a color for your avatar&apos;s top</p>
              <div className="flex gap-4 flex-wrap">
                {OUTFIT_COLORS.map((c) => (
                  <div key={c.id} className="flex flex-col items-center gap-2">
                    <ColorSwatch
                      hex={c.hex}
                      selected={outfitColor === c.id}
                      onClick={() => setOutfitColor(c.id)}
                      size={40}
                    />
                    <span className={`text-[0.65rem] font-bold capitalize ${outfitColor === c.id ? "text-primary" : "text-text-muted"}`}>
                      {c.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Expression Tab ── */}
          {activeTab === "expression" && (
            <div className="animate-fade-in">
              <h3 className="text-base font-extrabold text-text mb-1">Expression</h3>
              <p className="text-xs text-text-muted mb-5">How is your avatar feeling today?</p>
              <div className="grid grid-cols-2 gap-3">
                {EXPRESSIONS.map((e) => (
                  <ExpressionPreview
                    key={e.id}
                    exprId={e.id}
                    exprName={e.name}
                    skinHex={currentSkinHex}
                    hairColorHex={currentHairColorHex}
                    selected={expression === e.id}
                    onClick={() => setExpression(e.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Shoes Tab ── */}
          {activeTab === "shoes" && (
            <div className="animate-fade-in">
              <h3 className="text-base font-extrabold text-text mb-1">Shoe Color</h3>
              <p className="text-xs text-text-muted mb-5">Choose your shoe color</p>
              <div className="flex gap-4 flex-wrap">
                {SHOE_COLORS.map((c) => (
                  <div key={c.id} className="flex flex-col items-center gap-2">
                    <ColorSwatch
                      hex={c.hex}
                      selected={shoeColor === c.id}
                      onClick={() => setShoeColor(c.id)}
                      size={40}
                    />
                    <span className={`text-[0.65rem] font-bold capitalize ${shoeColor === c.id ? "text-primary" : "text-text-muted"}`}>
                      {c.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      <SuccessToast show={saved} />
    </div>
  );
}
