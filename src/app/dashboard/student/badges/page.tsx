"use client";

import { useState, useEffect } from "react";
import {
  Trophy, Award, Star, Zap, Heart, Gift, Users, Target,
  Lock, Check, Loader2, Sparkles
} from "lucide-react";
import { PageHeader, ProgressBar } from "@/components/ui/Pill";
import { cn } from "@/lib/utils/cn";

const BADGES = [
  { name: "Math Whiz",        icon: Zap,       accent: "#6D28D9", ring: "#A78BFA", bg: "#EDE9FE", requirement: "Complete 5 math lessons",       category: "academic" },
  { name: "Reader",           icon: Star,      accent: "#D97706", ring: "#FDE68A", bg: "#FFF4D8", requirement: "Complete 5 reading lessons",     category: "academic" },
  { name: "Science Explorer", icon: Gift,      accent: "#059669", ring: "#6EE7B7", bg: "#ECFDF5", requirement: "Complete 5 science lessons",     category: "academic" },
  { name: "Quiz Master",      icon: Target,    accent: "#2563EB", ring: "#93C5FD", bg: "#EFF6FF", requirement: "Score 80%+ on 3 quizzes",        category: "academic" },
  { name: "Goal Getter",      icon: Trophy,    accent: "#D97706", ring: "#FCD34D", bg: "#FFFBEB", requirement: "Complete daily goal 3 days",    category: "streak" },
  { name: "Streak Keeper",    icon: Zap,       accent: "#B45309", ring: "#F59E0B", bg: "#FEF3C7", requirement: "Build a 7-day learning streak", category: "streak" },
  { name: "Kind Heart",       icon: Heart,     accent: "#E11D48", ring: "#FDA4AF", bg: "#FFF1F2", requirement: "Complete 3 EQ check-ins",       category: "eq" },
  { name: "Team Player",      icon: Users,     accent: "#2563EB", ring: "#60A5FA", bg: "#EFF6FF", requirement: "Complete 10 quests",             category: "quest" },
  { name: "Creative Spark",   icon: Sparkles,  accent: "#7C3AED", ring: "#C4B5FD", bg: "#F5F3FF", requirement: "Complete 3 creative arts lessons", category: "creative" },
  { name: "Explorer",         icon: Award,     accent: "#0891B2", ring: "#67E8F9", bg: "#ECFEFF", requirement: "Start lessons in 5 subjects",   category: "explorer" },
];

export default function BadgesPage() {
  const [earned, setEarned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learner/badges", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setEarned((d.badges || []).filter((b: any) => b.earned).map((b: any) => b.name));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const earnedSet = new Set(earned);
  const earnedCount = earned.length;
  const totalCount = BADGES.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm font-bold text-text-muted">Loading your badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <PageHeader title="My Badges" subtitle="Complete lessons, quests, and check-ins to unlock badges">
        <div className="mt-3 flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gold-soft text-amber-800 border border-gold/20">
            <Award size={14} className="text-gold" />
            <span>{earnedCount} / {totalCount} earned</span>
          </div>
        </div>
      </PageHeader>

      {/* Progress */}
      <div className="mb-6">
        <ProgressBar value={earnedCount} max={totalCount} color="bg-gradient-to-r from-gold to-secondary" height="h-2.5" />
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {BADGES.map(badge => {
          const Icon = badge.icon;
          const isEarned = earnedSet.has(badge.name);

          return (
            <div
              key={badge.name}
              className={cn(
                "relative rounded-[1.25rem] p-4 text-center transition-all duration-200 hover:-translate-y-1",
                isEarned
                  ? "bg-white border-2 border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]"
                  : "bg-white/80 border-2 border-border-soft/40 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
              )}
              style={isEarned ? {
                borderImage: `linear-gradient(135deg, ${badge.ring}, ${badge.accent}, ${badge.ring}) 1`,
              } : undefined}
            >
              {/* Earned glow border */}
              {isEarned && (
                <div
                  className="absolute inset-0 rounded-[1.25rem] pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${badge.ring}30, transparent 50%, ${badge.accent}20)`,
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    padding: "2px",
                  }}
                />
              )}

              {/* Status chip */}
              <div className="absolute top-2.5 right-2.5 z-10">
                {isEarned ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: badge.accent }}>
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/90 border border-border-soft/60 flex items-center justify-center shadow-sm">
                    <Lock size={10} className="text-text-muted/60" />
                  </div>
                )}
              </div>

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{
                  background: isEarned ? badge.accent + "18" : badge.bg,
                  boxShadow: isEarned ? `0 0 20px ${badge.accent}20` : "none",
                }}
              >
                <Icon size={26} style={{ color: isEarned ? badge.accent : badge.accent + "99" }} />
              </div>

              {/* Name */}
              <h4 className="text-sm font-extrabold mb-0.5" style={{ color: isEarned ? "#111827" : "#64748B" }}>
                {badge.name}
              </h4>

              {/* Requirement */}
              <p className="text-[10px] leading-relaxed mb-2.5" style={{ color: isEarned ? "#64748B" : "#94A3B8" }}>
                {badge.requirement}
              </p>

              {/* Status pill */}
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide"
                style={{
                  background: isEarned ? badge.accent : "#F1F5F9",
                  color: isEarned ? "#fff" : "#94A3B8",
                }}
              >
                {isEarned ? "✨ EARNED" : "🔒 LOCKED"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
