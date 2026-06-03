"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

/* ═══════════════════════════════════════════════════════════
   ARIZEN SHARED UI COMPONENTS v6
   Premium • Colorful • Child-friendly
   ═══════════════════════════════════════════════════════════ */

// ── Gradient Button ──
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function GradientButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  className,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";

  const variants: Record<string, string> = {
    primary: "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_8px_25px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_35px_rgba(79,70,229,0.35)] hover:brightness-110",
    secondary: "bg-white border border-border-soft text-text hover:bg-bg-main hover:border-primary/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
    success: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_8px_25px_rgba(0,168,132,0.25)] hover:shadow-[0_12px_35px_rgba(0,168,132,0.35)] hover:brightness-110",
    ghost: "bg-transparent text-text-muted hover:bg-bg-main hover:text-text",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary-soft",
  };

  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-sm gap-1.5 rounded-xl",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base rounded-[1.25rem]",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// ── Coin Pill ──
export function CoinPill({ coins, size = "md" }: { coins: number; size?: "sm" | "md" }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-bold",
      "bg-gradient-to-r from-gold-soft to-gold-light/60 text-amber-800",
      "border border-gold/20 shadow-[0_2px_10px_rgba(245,165,36,0.15)]",
      size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
    )}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.3" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="900" fill="currentColor">$</text>
      </svg>
      <span>{coins.toLocaleString()}</span>
    </div>
  );
}

// ── Streak Pill ──
export function StreakPill({ count, size = "md" }: { count: number; size?: "sm" | "md" }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-bold",
      "bg-gradient-to-r from-pink-soft to-pink-light/60 text-pink-700",
      "border border-pink/20 shadow-[0_2px_10px_rgba(255,92,138,0.12)]",
      size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
    )}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink">
        <path d="M12 2C12 2 7 8 7 13C7 16.866 9.239 19 12 19C14.761 19 17 16.866 17 13C17 8 12 2 12 2Z" fill="currentColor" opacity="0.3" />
        <path d="M12 2C12 2 7 8 7 13C7 16.866 9.239 19 12 19C14.761 19 17 16.866 17 13C17 8 12 2 12 2Z" />
      </svg>
      <span>{count}d</span>
    </div>
  );
}

// ── XP Pill ──
export function XpPill({ amount, size = "md" }: { amount: number; size?: "sm" | "md" }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-bold",
      "bg-gradient-to-r from-primary-soft to-primary-light/30 text-primary-dark",
      "border border-primary/15 shadow-[0_2px_10px_rgba(79,70,229,0.10)]",
      size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
    )}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
        <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" fill="currentColor" opacity="0.25" />
        <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
      </svg>
      <span>{amount.toLocaleString()} XP</span>
    </div>
  );
}

// ── Stat Card ──
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  gradient?: string;
  borderColor?: string;
  textColor?: string;
  sublabel?: string;
}

export function StatCard({
  label,
  value,
  icon,
  gradient = "bg-card-gradient-purple",
  borderColor = "border-accent-purple/20",
  textColor = "text-primary-dark",
  sublabel,
}: StatCardProps) {
  return (
    <div className={cn(
      "rounded-[1.75rem] border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]",
      gradient, borderColor
    )}>
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">{label}</p>
      <p className={cn("text-2xl font-extrabold", textColor)}>{value}</p>
      {sublabel && <p className="text-xs text-text-muted mt-1">{sublabel}</p>}
    </div>
  );
}

// ── Section Header ──
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-xl font-extrabold text-text tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Page Header ──
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-extrabold text-text tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
      {children}
    </div>
  );
}

// ── Empty State Card ──
export function EmptyStateCard({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="rounded-[1.75rem] border border-border-soft bg-white p-12 text-center">
      {icon && <div className="w-16 h-16 rounded-3xl bg-bg-main flex items-center justify-center mx-auto mb-4 text-text-muted">{icon}</div>}
      <h3 className="text-lg font-bold text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted">{description}</p>}
    </div>
  );
}

// ── Progress Bar ──
export function ProgressBar({
  value,
  max = 100,
  color = "bg-primary",
  height = "h-2.5",
  animated = false,
  showLabel = false,
}: {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  animated?: boolean;
  showLabel?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs font-bold text-text-muted mb-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-bg-main overflow-hidden", height)}>
        <div
          className={cn("rounded-full transition-all", height, color, animated && "progress-fill")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
