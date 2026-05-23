"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { Trophy, Flame, Star, Sparkles, X } from "lucide-react";

// ── XP Popup ─────────────────────────────────────────────────

interface XpPopupProps {
  amount: number;
  show: boolean;
  onDismiss: () => void;
  position?: { x: number; y: number };
}

export function XpPopup({ amount, show, onDismiss }: XpPopupProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-6 z-[100] animate-xp-pop">
      <div className="bg-amber-500 text-white rounded-2xl px-5 py-3 shadow-lg shadow-amber-500/30 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        <span className="font-bold text-lg">+{amount} XP</span>
        <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Floating XP particles ────────────────────────────────────

interface XpParticle {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export function XpParticles({ particles, onDone }: { particles: XpParticle[]; onDone: () => void }) {
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(onDone, 2000);
      return () => clearTimeout(timer);
    }
  }, [particles, onDone]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-xp-pop"
          style={{ left: p.x, top: p.y }}
        >
          <span className="text-amber-500 font-bold text-xl">+{p.amount} ⚡</span>
        </div>
      ))}
    </div>,
    document.body
  );
}

// ── Badge Unlock Celebration ─────────────────────────────────

interface BadgeUnlockProps {
  badge: {
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    badgeType: string;
  } | null;
  show: boolean;
  onClose: () => void;
}

const badgeColors: Record<string, string> = {
  water_explorer: "from-cyan-400 to-blue-500",
  young_scientist: "from-amber-400 to-orange-500",
  streak_starter: "from-orange-400 to-red-500",
  first_quest: "from-green-400 to-emerald-500",
};

export function BadgeUnlock({ badge, show, onClose }: BadgeUnlockProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show || !badge) return null;

  const gradient = badgeColors[badge.badgeType] || "from-purple-400 to-violet-500";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-raised rounded-3xl border border-border p-8 max-w-sm w-full text-center animate-slide-up shadow-2xl">
        {/* Sparkle decorations */}
        <div className="absolute -top-4 -left-4 text-amber-400 animate-pulse-soft">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute -top-4 -right-4 text-amber-400 animate-pulse-soft" style={{ animationDelay: "0.5s" }}>
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute -bottom-4 -left-4 text-purple-400 animate-pulse-soft" style={{ animationDelay: "0.3s" }}>
          <Star className="w-6 h-6" />
        </div>

        {/* Badge icon */}
        <div className={cn("w-24 h-24 rounded-full bg-gradient-to-br mx-auto mb-4 flex items-center justify-center shadow-lg", gradient)}>
          <Trophy className="w-12 h-12 text-white" />
        </div>

        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
          Badge Unlocked!
        </p>
        <h3 className="text-2xl font-bold text-text mb-2">{badge.name}</h3>
        {badge.description && (
          <p className="text-sm text-text-muted mb-4">{badge.description}</p>
        )}

        <button
          onClick={onClose}
          className="bg-primary text-white rounded-xl px-6 py-2.5 font-semibold text-sm hover:bg-primary-dark transition-colors"
        >
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
}

// ── Streak Celebration ───────────────────────────────────────

interface StreakCelebrationProps {
  streak: number;
  show: boolean;
  onClose: () => void;
}

export function StreakCelebration({ streak, show, onClose }: StreakCelebrationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getMessage = () => {
    if (streak >= 30) return "Incredible! 30+ days!";
    if (streak >= 14) return "Two weeks strong!";
    if (streak >= 7) return "One whole week!";
    if (streak >= 3) return "Great momentum!";
    return "Keep it up!";
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-5 py-3 shadow-lg shadow-orange-500/30 flex items-center gap-3">
        <Flame className="w-6 h-6" />
        <div>
          <p className="font-bold">{streak}-Day Streak!</p>
          <p className="text-xs text-white/80">{getMessage()}</p>
        </div>
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Level Up ─────────────────────────────────────────────────

interface LevelUpProps {
  newLevel: number;
  show: boolean;
  onClose: () => void;
}

export function LevelUp({ newLevel, show, onClose }: LevelUpProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 max-w-sm w-full text-center animate-slide-up shadow-2xl text-white">
        <Star className="w-16 h-16 mx-auto mb-4 animate-pulse-soft" />
        <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-2">
          Level Up!
        </p>
        <h3 className="text-4xl font-bold mb-2">Level {newLevel}</h3>
        <p className="text-white/80 mb-6">
          You've earned enough XP to reach a new level. Keep learning!
        </p>
        <button
          onClick={onClose}
          className="bg-white text-orange-600 rounded-xl px-6 py-2.5 font-bold text-sm hover:bg-orange-50 transition-colors"
        >
          Let's Go! 🚀
        </button>
      </div>
    </div>
  );
}

// ── Confetti (simple CSS-based) ──────────────────────────────

export function Confetti({ show }: { show: boolean }) {
  if (!show || typeof window === "undefined") return null;

  const colors = ["#f59e0b", "#14b8a6", "#8b5cf6", "#ef4444", "#3b82f6", "#22c55e"];

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[99] overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const color = colors[i % colors.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2 + Math.random() * 2;
        const size = 6 + Math.random() * 8;

        return (
          <div
            key={i}
            className="absolute animate-confetti-fall"
            style={{
              left: `${left}%`,
              top: "-20px",
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>,
    document.body
  );
}
