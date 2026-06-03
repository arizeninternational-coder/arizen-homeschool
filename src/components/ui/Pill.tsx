"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

/* ═══════════════════════════════════════════════════════════
   ARIZEN SHARED UI COMPONENTS v7
   Soft • Floating • Premium • Compact
   ═══════════════════════════════════════════════════════════ */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function GradientButton({
  children, variant = "primary", size = "md", icon, className, ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";
  const variants: Record<string, string> = {
    primary: "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_4px_16px_rgba(79,70,229,0.2)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.3)] hover:brightness-110",
    secondary: "bg-white text-text hover:bg-bg-main shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
    success: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_4px_16px_rgba(0,168,132,0.2)] hover:shadow-[0_8px_24px_rgba(0,168,132,0.3)] hover:brightness-110",
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

export function CoinPill({ coins, size = "md" }: { coins: number; size?: "sm" | "md" }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-bold",
      "bg-gradient-to-r from-gold-soft to-gold-light/60 text-amber-800",
      "shadow-[0_2px_8px_rgba(245,165,36,0.1)]",
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

export function StreakPill({ count, size = "md" }: { count: number; size?: "sm" | "md" }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-bold",
      "bg-gradient-to-r from-pink-soft to-pink-light/60 text-pink-700",
      "shadow-[0_2px_8px_rgba(255,92,138,0.1)]",
      size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
    )}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink">
        <path d="M12 2C12 2 7 8 7 13C7 16.866 9.239 19 12 19C14.761 19 17 16.866 17 13C17 8 12 2 12 2Z" fill="currentColor" opacity="0.3" />
      </svg>
      <span>{count}d</span>
    </div>
  );
}

export function XpPill({ amount, size = "md" }: { amount: number; size?: "sm" | "md" }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-bold",
      "bg-gradient-to-r from-primary-soft to-primary-light/30 text-primary-dark",
      "shadow-[0_2px_8px_rgba(79,70,229,0.08)]",
      size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
    )}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
        <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" fill="currentColor" opacity="0.25" />
      </svg>
      <span>{amount.toLocaleString()} XP</span>
    </div>
  );
}

/* ── Stat Card (compact, shadow-based, no harsh borders) ────── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  gradient?: string;
  textColor?: string;
  sublabel?: string;
}

export function StatCard({ label, value, icon, gradient = "bg-card-gradient-purple", textColor = "text-primary-dark", sublabel }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-[1.25rem] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]",
      "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-border-soft/40",
      gradient
    )}>
      <div className="flex items-start justify-between mb-2">
        {icon && <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center shadow-sm">{icon}</div>}
      </div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-text-muted/60 mb-0.5">{label}</p>
      <p className={cn("text-xl font-extrabold tracking-tight", textColor)}>{value}</p>
      {sublabel && <p className="text-[10px] text-text-muted mt-0.5 font-medium">{sublabel}</p>}
    </div>
  );
}

/* ── Section Header (compact) ────────────────────────────────── */
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
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

/* ── Page Header (compact) ───────────────────────────────────── */
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl lg:text-2xl font-extrabold text-text tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-text-muted mt-1 leading-relaxed">{subtitle}</p>}
      {children}
    </div>
  );
}

/* ── Empty State Card ────────────────────────────────────────── */
export function EmptyStateCard({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[1.25rem] bg-white p-8 lg:p-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-border-soft/30">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-soft/50 to-accent-purple-soft/30 flex items-center justify-center mx-auto mb-4 text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-extrabold text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── Progress Bar ────────────────────────────────────────────── */
export function ProgressBar({
  value, max = 100, color = "bg-primary", height = "h-2", showLabel = false,
}: { value: number; max?: number; color?: string; height?: string; showLabel?: boolean }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-[10px] font-bold text-text-muted mb-1">
          <span>{value}</span><span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-bg-main/60 overflow-hidden", height)}>
        <div className={cn("rounded-full transition-all duration-700 ease-out", height, color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
