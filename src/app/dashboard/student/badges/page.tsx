"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Trophy, Award, Star, Zap, Heart, Gift, Users, Target,
  Lock, Check, Loader2
} from "lucide-react";
import { PageHeader, ProgressBar, EmptyStateCard } from "@/components/ui/Pill";
import { TrophyIcon, StarIcon } from "@/components/ui/Illustrations";
import { cn } from "@/lib/utils/cn";

const BADGES = [
  { name: "Math Whiz",        icon: Zap,       color: "#EDE9FE", accent: "#6D28D9", ring: "#A78BFA", requirement: "Complete 5 math lessons",     category: "academic" },
  { name: "Reader",           icon: Star,      color: "#FFF4D8", accent: "#D97706", ring: "#FDE68A", requirement: "Complete 5 reading lessons",   category: "academic" },
  { name: "Science Explorer", icon: Gift,      color: "#ECFDF5", accent: "#059669", ring: "#6EE7B7", requirement: "Complete 5 science lessons",   category: "academic" },
  { name: "Quiz Master",      icon: Target,    color: "#EFF6FF", accent: "#2563EB", ring: "#93C5FD", requirement: "Score 80%+ on 3 quizzes",      category: "academic" },
  { name: "Goal Getter",      icon: Trophy,    color: "#FFFBEB", accent: "#D97706", ring: "#FCD34D", requirement: "Complete daily goal 3 days",  category: "streak" },
  { name: "Streak Keeper",    icon: Zap,       color: "#FEF3C7", accent: "#B45309", ring: "#F59E0B", requirement: "Build a 7-day learning streak", category: "streak" },
  { name: "Kind Heart",       icon: Heart,     color: "#FFF1F2", accent: "#E11D48", ring: "#FDA4AF", requirement: "Complete 3 EQ check-ins",     category: "eq" },
  { name: "Team Player",      icon: Users,     color: "#EFF6FF", accent: "#2563EB", ring: "#60A5FA", requirement: "Complete 10 quests",           category: "quest" },
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
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-muted font-bold text-lg">Loading your badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Badges"
        subtitle="Complete lessons, quests, and check-ins to unlock badges."
      >
        <div className="mt-3 flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-sm bg-gradient-to-r from-amber-50 to-gold-light/60 text-amber-800 border border-gold/20 shadow-[0_2px_10px_rgba(245,165,36,0.12)]">
            <Award size={16} className="text-gold" />
            <span>{earnedCount} / {totalCount}</span>
          </div>
        </div>
      </PageHeader>

      {/* Progress bar */}
      <div className="mb-8">
        <ProgressBar value={earnedCount} max={totalCount} color="bg-gradient-to-r from-gold to-secondary" height="h-3" />
        <p className="text-xs text-text-muted mt-2 font-semibold">
          {earnedCount === 0
            ? "Complete your first lesson to start earning badges!"
            : `${earnedCount} badge${earnedCount !== 1 ? "s" : ""} earned. Keep going! 🎉`}
        </p>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {BADGES.map(badge => {
          const Icon = badge.icon;
          const isEarned = earnedSet.has(badge.name);

          return (
            <div
              key={badge.name}
              className={cn(
                "relative rounded-[1.5rem] border-2 p-5 text-center transition-all duration-200 hover:-translate-y-1",
                isEarned
                  ? "border-transparent bg-white hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)]"
                  : "border-border-soft bg-white opacity-70 hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
              )}
              style={isEarned ? {
                borderImage: `linear-gradient(135deg, ${badge.ring}, ${badge.accent}, ${badge.ring}) 1`,
                boxShadow: `0 4px 20px ${badge.accent}18`,
              } : undefined}
            >
              {/* Gradient border overlay for earned badges */}
              {isEarned && (
                <div
                  className="absolute inset-0 rounded-[1.5rem] pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${badge.ring}40, transparent 50%, ${badge.accent}30)`,
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    padding: "2px",
                  }}
                />
              )}

              {/* Status indicator */}
              <div className="absolute top-3 right-3 z-10">
                {isEarned ? (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: badge.accent }}
                  >
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 border border-border-soft flex items-center justify-center">
                    <Lock size={12} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Icon circle */}
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-[3px] transition-all"
                style={{
                  background: isEarned
                    ? `linear-gradient(135deg, ${badge.accent}25, ${badge.accent}08)`
                    : "#F8FAFC",
                  borderColor: isEarned ? badge.ring : "#E5EAF3",
                  boxShadow: isEarned ? `0 0 25px ${badge.accent}15` : "none",
                }}
              >
                <Icon size={28} style={{ color: isEarned ? badge.accent : "#CBD5E1" }} />
              </div>

              {/* Badge name */}
              <h4
                className="text-sm font-extrabold mb-1"
                style={{ color: isEarned ? "#111827" : "#94A3B8" }}
              >
                {badge.name}
              </h4>

              {/* Requirement */}
              <p className="text-[11px] leading-relaxed mb-3" style={{ color: isEarned ? "#64748B" : "#B0B8C4" }}>
                {badge.requirement}
              </p>

              {/* Status pill */}
              <span
                className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide"
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

      {totalCount === 0 && (
        <EmptyStateCard
          icon={<Trophy size={36} />}
          title="No badges available"
          description="Badges will appear here as they become available."
        />
      )}
    </div>
  );
}
