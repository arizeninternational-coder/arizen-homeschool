"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   ARIZEN SHARED FLOATING UI SYSTEM
   Premium • Compact • Child-friendly • Gamified
   ═══════════════════════════════════════════════════════════════════ */

// ── Floating Card ──────────────────────────────────────────────
interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function FloatingCard({ children, className = "", hover = true, onClick }: FloatingCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[1.25rem] border border-border-soft/60 bg-white p-4",
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Stat Pill (compact floating stat display) ───────────────────
interface StatPillProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  gradient?: string;
  iconBg?: string;
  textColor?: string;
}

export function StatPill({ icon, value, label, gradient = "from-primary-soft to-accent-purple-soft/40", iconBg = "bg-primary/10", textColor = "text-primary-dark" }: StatPillProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 rounded-2xl py-2 px-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]", `bg-gradient-to-r ${gradient}`)}>
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", iconBg)}>
        {icon}
      </div>
      <div>
        <div className={cn("font-extrabold text-sm leading-tight", textColor)}>{value}</div>
        <div className="text-[10px] font-semibold text-text-muted leading-tight">{label}</div>
      </div>
    </div>
  );
}

// ── Section Title (compact, no wasted space) ────────────────────
export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-text tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Browse Grid (compact responsive grid) ──────────────────────
export function BrowseGrid({ children, cols = 4 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };
  return (
    <div className={cn("grid gap-3", colClass[cols])}>
      {children}
    </div>
  );
}

// ── Empty State (compact, friendly) ────────────────────────────
export function CompactEmpty({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-border-soft bg-white p-8 text-center">
      {icon && <div className="w-12 h-12 rounded-2xl bg-bg-main flex items-center justify-center mx-auto mb-3 text-text-muted">{icon}</div>}
      <h3 className="text-sm font-extrabold text-text mb-1">{title}</h3>
      {description && <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">{description}</p>}
    </div>
  );
}

// ── Reward Value Normalizer ────────────────────────────────────
export function getRewardValue(reward: any): number {
  if (reward === null || reward === undefined) return 0;
  if (typeof reward === "number") return reward;
  if (typeof reward === "object") {
    if (reward.base !== undefined) return Number(reward.base) || 0;
    if (reward.amount !== undefined) return Number(reward.amount) || 0;
    return 0;
  }
  if (typeof reward === "string") {
    try {
      const parsed = JSON.parse(reward);
      if (typeof parsed === "number") return parsed;
      if (parsed?.base !== undefined) return Number(parsed.base) || 0;
      if (parsed?.amount !== undefined) return Number(parsed.amount) || 0;
    } catch { return 0; }
  }
  return 0;
}

// ── Reward Badge (compact XP display) ──────────────────────────
export function RewardBadge({ xp }: { xp: number }) {
  if (xp <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-soft/50 border border-gold/15 text-amber-800">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-gold opacity-70">
        <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" fill="currentColor" opacity="0.3"/>
        <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9"/>
      </svg>
      {xp} XP
    </span>
  );
}

// ── Color Palette for Cards ────────────────────────────────────
export const CARD_COLORS = [
  { bg: "bg-accent-blue/8", border: "border-accent-blue/20", iconBg: "bg-accent-blue/15", textColor: "text-accent-blue", gradient: "from-accent-blue to-accent-blue/80" },
  { bg: "bg-primary/8", border: "border-primary/20", iconBg: "bg-primary/15", textColor: "text-primary", gradient: "from-primary to-primary/80" },
  { bg: "bg-secondary/8", border: "border-secondary/20", iconBg: "bg-secondary/15", textColor: "text-secondary", gradient: "from-secondary to-secondary/80" },
  { bg: "bg-accent-purple/8", border: "border-accent-purple/20", iconBg: "bg-accent-purple/15", textColor: "text-accent-purple", gradient: "from-accent-purple to-accent-purple/80" },
  { bg: "bg-gold/8", border: "border-gold/20", iconBg: "bg-gold/15", textColor: "text-gold", gradient: "from-gold to-gold/80" },
  { bg: "bg-pink/8", border: "border-pink/20", iconBg: "bg-pink/15", textColor: "text-pink", gradient: "from-pink to-pink/80" },
];
