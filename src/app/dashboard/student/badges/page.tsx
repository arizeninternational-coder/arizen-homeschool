"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Award, Lock, Zap, Sparkles, Flame
} from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";
const shadows = { sm: "0 1px 3px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.02)" };

interface Badge {
  id: string;
  badgeType: string;
  name: string;
  description: string;
  awardedAt: string;
  progress?: number;      // 0-100 for locked badges
  progressLabel?: string;  // e.g. "3/10 lessons"
}

const badgeIcons: Record<string, string> = {
  first_lesson: "🎯", ten_lessons: "📚", first_quest: "⚔️", five_quests: "🏆",
  streak_3: "🔥", streak_7: "🌟", xp_1000: "💎", xp_5000: "👑",
  level_5: "⭐", level_10: "🏅",
};

// Badge type category for coloring
const badgeCategory: Record<string, "lesson" | "quest" | "streak" | "xp" | "level"> = {
  first_lesson: "lesson",
  ten_lessons: "lesson",
  first_quest: "quest",
  five_quests: "quest",
  streak_3: "streak",
  streak_7: "streak",
  xp_1000: "xp",
  xp_5000: "xp",
  level_5: "level",
  level_10: "level",
};

// Color scheme per category
const categoryColors: Record<string, { bg: string; border: string; text: string; accent: string; gradient: string; iconBg: string }> = {
  lesson: {
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.2)",
    text: "rgb(29,78,216)",
    accent: "rgb(59,130,246)",
    gradient: `linear-gradient(135deg, rgba(59,130,246,0.12), rgba(13,148,136,0.08))`,
    iconBg: "rgba(59,130,246,0.1)",
  },
  quest: {
    bg: "rgba(147,51,234,0.06)",
    border: "rgba(147,51,234,0.2)",
    text: "rgb(107,33,168)",
    accent: "rgb(147,51,234)",
    gradient: `linear-gradient(135deg, rgba(147,51,234,0.12), rgba(13,148,136,0.08))`,
    iconBg: "rgba(147,51,234,0.1)",
  },
  streak: {
    bg: "rgba(249,115,22,0.06)",
    border: "rgba(249,115,22,0.2)",
    text: "rgb(194,65,12)",
    accent: "rgb(249,115,22)",
    gradient: `linear-gradient(135deg, rgba(249,115,22,0.12), rgba(245,158,11,0.08))`,
    iconBg: "rgba(249,115,22,0.1)",
  },
  xp: {
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.2)",
    text: "rgb(180,83,9)",
    accent: "rgb(217,119,6)",
    gradient: `linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.08))`,
    iconBg: "rgba(245,158,11,0.1)",
  },
  level: {
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.2)",
    text: "rgb(21,128,61)",
    accent: "rgb(34,197,94)",
    gradient: `linear-gradient(135deg, rgba(34,197,94,0.12), rgba(13,148,136,0.08))`,
    iconBg: "rgba(34,197,94,0.1)",
  },
};

const allBadgeTypes = [
  { type: "first_lesson", name: "First Step", description: "Complete your first lesson", unlockHint: "Finish any lesson to earn this badge!", category: "lesson" },
  { type: "ten_lessons", name: "Quick Learner", description: "Complete 10 lessons", unlockHint: "Keep completing lessons — you're on your way!", category: "lesson" },
  { type: "first_quest", name: "Quest Complete!", description: "Complete your first quest", unlockHint: "Finish a quest challenge to unlock!", category: "quest" },
  { type: "five_quests", name: "Quest Master", description: "Complete 5 quests", unlockHint: "Complete more quests to become a master!", category: "quest" },
  { type: "streak_3", name: "Streak Starter", description: "3-day learning streak", unlockHint: "Learn for 3 days in a row!", category: "streak" },
  { type: "streak_7", name: "Week Warrior", description: "7-day learning streak", unlockHint: "Keep your streak going for a full week!", category: "streak" },
  { type: "xp_1000", name: "XP Champion", description: "Earn 1,000 XP", unlockHint: "Learn and complete activities to earn XP!", category: "xp" },
  { type: "xp_5000", name: "XP Legend", description: "Earn 5,000 XP", unlockHint: "You need 5,000 total XP — keep learning!", category: "xp" },
  { type: "level_5", name: "Rising Star", description: "Reach level 5", unlockHint: "Earn XP to level up — level 5 awaits!", category: "level" },
  { type: "level_10", name: "Mastermind", description: "Reach level 10", unlockHint: "Reach level 10 to claim this badge!", category: "level" },
];

export default function StudentBadgesPage() {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learner/badges")
      .then(r => r.json())
      .then(data => setEarnedBadges(data.badges || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const earnedMap = new Map(earnedBadges.map(b => [b.badgeType, b]));
  const earnedCount = earnedBadges.length;
  const totalCount = allBadgeTypes.length;

  // Find the next locked badge with closest progress
  const nextBadge = allBadgeTypes.find(b => !earnedMap.has(b.type));
  const nextHint = nextBadge ? nextBadge.unlockHint : "All badges earned — amazing!";

  const overallProgress = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ height: 28, width: 220, borderRadius: 8, background: colors.borderLight, marginBottom: "0.5rem" }} />
          <div style={{ height: 16, width: 320, borderRadius: 8, background: colors.borderLight, marginBottom: "0.75rem" }} />
          <div style={{ height: 14, width: 180, borderRadius: 8, background: colors.borderLight }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} style={{ borderRadius: "1.25rem", height: 180, background: colors.borderLight, border: `1px solid ${colors.border}` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Motivational Header ── */}
      <div style={{
        background: gradients.sky,
        borderRadius: "1.5rem",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        border: `1px solid ${colors.border}`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative sparkle */}
        <Sparkles style={{ position: "absolute", top: 16, right: 20, width: 28, height: 28, color: colors.primary, opacity: 0.3 }} />

        <h1 style={{
          fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
          fontWeight: 900,
          color: colors.textHeading,
          marginBottom: "0.5rem",
          letterSpacing: "-0.02em",
        }}>
          🏆 Unlock Your Learning Badges
        </h1>

        <p style={{
          color: colors.textMuted,
          fontSize: "0.9rem",
          lineHeight: 1.6,
          marginBottom: "1.125rem",
          maxWidth: 540,
        }}>
          Complete lessons, finish quests, earn XP, and keep your streak alive to collect badges.
          Every badge tells a story of your learning journey!
        </p>

        {/* Progress summary row */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: 14,
            background: "white",
            border: `1.5px solid ${colors.primary}`,
            boxShadow: shadows.sm,
          }}>
            <Award style={{ width: 18, height: 18, color: colors.primary }} />
            <span style={{ fontWeight: 800, fontSize: "0.875rem", color: colors.primary }}>
              {earnedCount}/{totalCount} badges earned
            </span>
          </div>

          {/* Overall progress bar */}
          <div style={{ flex: 1, minWidth: 120, maxWidth: 260 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.textMuted }}>Progress</span>
              <span style={{ fontSize: "0.6875rem", fontWeight: 800, color: colors.primary }}>{overallProgress}%</span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.6)", border: `1px solid ${colors.border}` }}>
              <div style={{
                height: "100%",
                borderRadius: 5,
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                width: `${overallProgress}%`,
                transition: "width 0.5s ease",
                minWidth: earnedCount > 0 ? 16 : 0,
              }} />
            </div>
          </div>
        </div>

        {/* Next badge hint */}
        <div style={{
          marginTop: "0.875rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.375rem 0.875rem",
          borderRadius: 10,
          background: "rgba(255,255,255,0.5)",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: colors.textMuted,
        }}>
          <Zap style={{ width: 14, height: 14, color: colors.warning }} />
          Next up: {nextHint}
        </div>
      </div>

      {/* ── Badge Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "1rem" }}>
        {allBadgeTypes.map((badgeDef) => {
          const earned = earnedMap.get(badgeDef.type);
          const isEarned = !!earned;
          const cat = badgeCategory[badgeDef.type] || "lesson";
          const catColor = categoryColors[cat];
          // Simulate progress for locked badges (would come from API in real app)
          const progress = earned ? 100 : 0;

          if (isEarned) {
            // ── Earned Badge Card ──
            return (
              <div
                key={badgeDef.type}
                style={{
                  borderRadius: "1.25rem",
                  padding: "1.25rem 1rem",
                  textAlign: "center",
                  background: catColor.gradient,
                  border: `2px solid ${catColor.border}`,
                  boxShadow: `0 2px 12px ${catColor.accent}15`,
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Shine effect */}
                <div style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${catColor.accent}20, transparent)`,
                }} />

                {/* Emoji icon */}
                <div style={{
                  fontSize: "2.75rem",
                  marginBottom: "0.5rem",
                  lineHeight: 1,
                }}>
                  {badgeIcons[badgeDef.type] || "🏅"}
                </div>

                {/* Badge name */}
                <div style={{
                  fontWeight: 800,
                  color: colors.textHeading,
                  fontSize: "0.9rem",
                  marginBottom: "0.25rem",
                  lineHeight: 1.2,
                }}>
                  {badgeDef.name}
                </div>

                {/* Description */}
                <div style={{
                  fontSize: "0.75rem",
                  color: colors.textMuted,
                  lineHeight: 1.4,
                  marginBottom: "0.5rem",
                }}>
                  {badgeDef.description}
                </div>

                {/* Earned stamp */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.25rem 0.625rem",
                  borderRadius: 8,
                  background: "rgba(34,197,94,0.1)",
                  color: colors.success,
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                }}>
                  ✓ Earned!
                  {earned.awardedAt && (
                    <span style={{ fontWeight: 500, opacity: 0.7 }}>
                      {" "}{new Date(earned.awardedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          }

          // ── Locked Badge Card ──
          return (
            <div
              key={badgeDef.type}
              style={{
                borderRadius: "1.25rem",
                padding: "1.25rem 1rem",
                textAlign: "center",
                background: `linear-gradient(135deg, ${catColor.bg}, rgba(241,245,249,0.8))`,
                border: `1.5px dashed ${catColor.border}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Muted but still colorful emoji */}
              <div style={{
                fontSize: "2.75rem",
                marginBottom: "0.5rem",
                lineHeight: 1,
                opacity: 0.7,
                filter: "grayscale(0.3)",
              }}>
                {badgeIcons[badgeDef.type] || "🏅"}
              </div>

              {/* Badge name */}
              <div style={{
                fontWeight: 800,
                color: "#475569",
                fontSize: "0.875rem",
                marginBottom: "0.25rem",
                lineHeight: 1.2,
              }}>
                {badgeDef.name}
              </div>

              {/* Description */}
              <div style={{
                fontSize: "0.75rem",
                color: "#64748B",
                lineHeight: 1.4,
                marginBottom: "0.625rem",
              }}>
                {badgeDef.description}
              </div>

              {/* Unlock hint */}
              <div style={{
                fontSize: "0.6875rem",
                color: catColor.accent,
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: "0.625rem",
                padding: "0.25rem 0.5rem",
                borderRadius: 6,
                background: catColor.iconBg,
              }}>
                {badgeDef.unlockHint}
              </div>

              {/* Progress bar toward unlock */}
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.125rem" }}>
                  <span style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.textMuted }}>Progress</span>
                  <span style={{ fontSize: "0.625rem", fontWeight: 800, color: catColor.accent }}>{progress}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(226,232,240,0.8)" }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${catColor.accent}, ${catColor.accent}aa)`,
                    width: `${progress}%`,
                    transition: "width 0.5s ease",
                    minWidth: progress > 0 ? 8 : 0,
                  }} />
                </div>
              </div>

              {/* Colorful padlock */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.25rem 0.625rem",
                borderRadius: 8,
                background: catColor.iconBg,
                color: catColor.accent,
                fontSize: "0.6875rem",
                fontWeight: 700,
              }}>
                <Lock style={{ width: 12, height: 12 }} />
                Locked
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
