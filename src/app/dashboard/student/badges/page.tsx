"use client";

import { useState, useEffect } from "react";
import {
  Trophy, Award, Lock, Check, Loader2, Sparkles
} from "lucide-react";
import { PageHeader, ProgressBar } from "@/components/ui/Pill";
import { cn } from "@/lib/utils/cn";

interface BadgeDef {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  requirement: { type: string; count: number };
  earned: boolean;
  progress: number;
  total: number;
  awardedAt: string | null;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeDef[]>([]);
  const [earnedCount, setEarnedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learner/badges", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { badges: [], earnedCount: 0, totalCount: 0 }))
      .then((d) => {
        setBadges(d.badges || []);
        setEarnedCount(d.earnedCount || 0);
        setTotalCount(d.totalCount || (d.badges || []).length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
      <PageHeader title="My Badges" subtitle="Complete lessons, build streaks, and earn XP to unlock badges">
        <div className="mt-3 flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gold-soft text-amber-800 border border-gold/20">
            <Award size={14} className="text-gold" />
            <span>{earnedCount} / {totalCount} earned</span>
          </div>
        </div>
      </PageHeader>

      {/* Overall Progress */}
      <div className="mb-6">
        <ProgressBar
          value={earnedCount}
          max={totalCount}
          color="bg-gradient-to-r from-gold to-secondary"
          height="h-2.5"
        />
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {badges.map((badge) => {
          const isEarned = badge.earned;
          const progressPct = badge.total > 0 ? Math.round((badge.progress / badge.total) * 100) : 0;

          return (
            <div
              key={badge.type}
              className={cn(
                "relative rounded-[1.25rem] p-4 text-center transition-all duration-200 hover:-translate-y-1",
                isEarned
                  ? "bg-white border-2 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]"
                  : "bg-white border-2 border-border-soft/40 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
              )}
              style={isEarned ? { borderColor: badge.color } : undefined}
            >
              {/* Status chip */}
              <div className="absolute top-2.5 right-2.5 z-10">
                {isEarned ? (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: badge.color }}
                  >
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
                className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl"
                style={{
                  background: isEarned ? badge.color + "18" : badge.color + "10",
                  boxShadow: isEarned ? `0 0 20px ${badge.color}20` : "none",
                }}
              >
                {badge.icon}
              </div>

              {/* Name */}
              <h4
                className="text-sm font-extrabold mb-0.5"
                style={{ color: isEarned ? "#111827" : "#374151" }}
              >
                {badge.name}
              </h4>

              {/* Description */}
              <p
                className="text-[10px] leading-relaxed mb-2"
                style={{ color: isEarned ? "#64748B" : "#6B7280" }}
              >
                {badge.description}
              </p>

              {/* Progress bar (only for locked badges) */}
              {!isEarned && (
                <div className="mb-2">
                  <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPct}%`,
                        background: badge.color,
                        opacity: 0.6,
                      }}
                    />
                  </div>
                  <p className="text-[9px] font-semibold text-text-muted mt-1">
                    {badge.progress}/{badge.total}
                  </p>
                </div>
              )}

              {/* Status pill */}
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide"
                style={{
                  background: isEarned ? badge.color : "#F1F5F9",
                  color: isEarned ? "#fff" : "#6B7280",
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
