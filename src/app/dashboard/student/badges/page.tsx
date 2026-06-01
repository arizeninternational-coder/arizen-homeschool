"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy, Lock, Star, Zap, Heart, Target, Flame, Shield, BookOpen, Beaker,
  UsersRound, GraduationCap, Sparkles, Gift, CheckCircle2
} from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", tealD: "#005B50",
  dark: "#0F172A", body: "#64748B", muted: "#94A3B8",
  white: "#FFFFFF", border: "#E2E8F0",
  lavender: "#EDE9FE", yellow: "#FFF4D8", blue: "#EFF6FF",
  rose: "#FFF1F2", mint: "#ECFDF5", cream: "#FFFBEB",
  gold: "#D97706", purple: "#6D28D9", coral: "#E11D48",
};

const BADGES = [
  {
    name: "Math Whiz", icon: Zap, color: "#EDE9FE", accent: "#6D28D9",
    glow: "rgba(109,40,217,0.15)", req: "Complete 5 math lessons",
    progressKey: "mathLessons", progressMax: 5, lockColor: "#6D28D9",
  },
  {
    name: "Reader", icon: BookOpen, color: "#DBEAFE", accent: "#2563EB",
    glow: "rgba(37,99,235,0.15)", req: "Complete 5 reading lessons",
    progressKey: "readingLessons", progressMax: 5, lockColor: "#2563EB",
  },
  {
    name: "Science Explorer", icon: Beaker, color: "#D1FAE5", accent: "#059669",
    glow: "rgba(5,150,105,0.15)", req: "Complete 5 science lessons",
    progressKey: "scienceLessons", progressMax: 5, lockColor: "#059669",
  },
  {
    name: "Quiz Master", icon: Trophy, color: "#FEF3C7", accent: "#D97706",
    glow: "rgba(217,119,6,0.15)", req: "Score 80%+ on 3 quizzes",
    progressKey: "highScoreQuizzes", progressMax: 3, lockColor: "#D97706",
  },
  {
    name: "Goal Getter", icon: Target, color: "#FFE4E6", accent: "#E11D48",
    glow: "rgba(225,29,72,0.15)", req: "Complete daily goal 3 days",
    progressKey: "dailyGoals", progressMax: 3, lockColor: "#F43F5E",
  },
  {
    name: "Streak Keeper", icon: Flame, color: "#CCFBF1", accent: "#047A70",
    glow: "rgba(4,122,112,0.15)", req: "Build a 7-day learning streak",
    progressKey: "streakDays", progressMax: 7, lockColor: "#047A70",
  },
  {
    name: "Kind Heart", icon: Heart, color: "#FCE7F3", accent: "#BE185D",
    glow: "rgba(190,24,93,0.15)", req: "Complete 3 EQ check-ins",
    progressKey: "eqCheckins", progressMax: 3, lockColor: "#6D28D9",
  },
  {
    name: "Team Player", icon: UsersRound, color: "#EFF6FF", accent: "#2563EB",
    glow: "rgba(37,99,235,0.15)", req: "Complete 10 quests",
    progressKey: "questsCompleted", progressMax: 10, lockColor: "#2563EB",
  },
];

export default function BadgesPage() {
  const [earned, setEarned] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [badgesRes, progressRes] = await Promise.allSettled([
          fetch("/api/learner/badges", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/progress", { credentials: "include" }).then(r => r.json()),
        ]);

        if (badgesRes.status === "fulfilled") {
          const earnedBadges = (badgesRes.value?.badges || [])
            .filter((b: any) => b.earned)
            .map((b: any) => b.name || b.title);
          setEarned(earnedBadges);
        }

        if (progressRes.status === "fulfilled") {
          const p = progressRes.value?.progress || progressRes.value || {};
          setProgress({
            mathLessons: p.mathLessonsCompleted || p.mathCompleted || 0,
            readingLessons: p.readingLessonsCompleted || p.readingCompleted || 0,
            scienceLessons: p.scienceLessonsCompleted || p.scienceCompleted || 0,
            highScoreQuizzes: p.highScoreQuizzes || p.quizzes80Plus || 0,
            dailyGoals: p.dailyGoalsCompleted || p.streakGoalDays || 0,
            streakDays: p.currentStreak || p.streak || 0,
            eqCheckins: p.eqCheckinsCompleted || p.totalCheckins || 0,
            questsCompleted: p.questsCompleted || p.questCompleted || 0,
          });
        }
      } catch (e) { console.error("[BADGES] Load error:", e); }
      setLoading(false);
    };
    load();
  }, []);

  const earnedSet = new Set(earned);
  const earnedCount = earnedSet.size;
  const totalCount = BADGES.length;

  const getProgressPct = (badge: typeof BADGES[0]) => {
    const val = progress[badge.progressKey] || 0;
    return Math.min(100, Math.round((val / badge.progressMax) * 100));
  };

  if (loading) return null;

  return (
    <div style={{ background: "linear-gradient(180deg, #FAFBFF 0%, #F7FBF7 100%)", minHeight: "100vh", padding: "28px 32px 40px" }}>

      {/* ===== HEADER ===== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
            border: "2px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(217,119,6,0.15)",
          }}>
            <Trophy size={36} style={{ color: C.gold }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <h1 style={{ fontSize: 48, fontWeight: 900, color: C.dark, margin: 0, lineHeight: 1.1 }}>Badges</h1>
              <Sparkles size={20} style={{ color: C.gold }} />
            </div>
            <p style={{ fontSize: 18, color: "#8B8FA8", margin: "2px 0 0", fontWeight: 500 }}>
              Complete lessons, quests, and check-ins to unlock badges.
            </p>
          </div>
        </div>
        <div style={{
          width: 200, height: 86, borderRadius: 16,
          background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
          border: "1.5px solid #FDE68A", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 2,
          boxShadow: "0 4px 12px rgba(217,119,6,0.08)",
        }}>
          <Trophy size={20} style={{ color: C.gold }} />
          <span style={{ fontSize: 22, fontWeight: 900, color: "#92400E" }}>{earnedCount} / {totalCount}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: 0.5 }}>Badges Earned</span>
        </div>
      </div>

      {/* ===== TWO-COLUMN PROGRESS AREA ===== */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>

        {/* Overall Progress Card (70%) */}
        <div style={{
          flex: "1 1 70%", minWidth: 320, height: 135, borderRadius: 24,
          background: "linear-gradient(135deg, #FFFFFF, #F5F3FF)",
          border: "1.5px solid #E9D5FF", padding: "0 28px",
          boxShadow: "0 4px 16px rgba(109,40,217,0.06)",
          display: "flex", alignItems: "center", gap: 24, overflow: "hidden", position: "relative",
        }}>
          <div style={{
            width: 92, height: 92, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #EDE9FE, #C4B5FD)",
            border: "3px solid #A78BFA", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(109,40,217,0.15)",
          }}>
            <Shield size={40} style={{ color: C.purple }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: "0 0 2px" }}>Overall Progress</h3>
            <p style={{ fontSize: 13, color: C.body, margin: "0 0 10px" }}>Keep going! Your next achievement is waiting. ✨</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                flex: 1, maxWidth: 520, height: 28, borderRadius: 14,
                background: "rgba(109,40,217,0.08)", overflow: "hidden", position: "relative",
              }}>
                <div style={{
                  height: "100%",
                  width: `${(earnedCount / totalCount) * 100}%`,
                  borderRadius: 14,
                  background: "linear-gradient(90deg, #6D28D9, #A78BFA)",
                  transition: "width 0.6s ease",
                }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.purple, flexShrink: 0 }}>{earnedCount} / {totalCount}</span>
            </div>
          </div>
          <div style={{
            width: 105, height: 90, flexShrink: 0, borderRadius: 16,
            background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
            border: "1.5px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 48,
          }}>🎁</div>
        </div>

        {/* Encouragement Card (30%) */}
        <div style={{
          flex: "1 1 30%", minWidth: 200, height: 135, borderRadius: 24,
          background: "linear-gradient(135deg, #FFFFFF, #FFF1F2)",
          border: "1.5px solid #FECDD3", padding: "0 20px",
          boxShadow: "0 4px 16px rgba(225,29,72,0.06)",
          display: "flex", alignItems: "center", gap: 14, overflow: "hidden",
        }}>
          <div style={{
            width: 82, height: 82, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
            border: "2px solid #FDE68A",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42,
          }}>⭐</div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: C.dark, margin: "0 0 4px" }}>
              Keep learning to unlock your first badge!
            </h3>
            <p style={{ fontSize: 12, color: C.body, margin: 0 }}>Every step brings you closer. 💜</p>
          </div>
        </div>
      </div>

      {/* ===== BADGE GRID ===== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 24,
        marginBottom: 28,
      }} className="badge-grid">
        {BADGES.map(badge => {
          const Icon = badge.icon;
          const isEarned = earnedSet.has(badge.name);
          const pct = getProgressPct(badge);
          const val = progress[badge.progressKey] || 0;
          return (
            <div key={badge.name} style={{
              width: "100%", minHeight: 260, borderRadius: 22,
              background: `linear-gradient(135deg, ${C.white}, ${badge.color})`,
              border: `1.5px solid ${isEarned ? "#A7F3D0" : badge.color}`,
              padding: "24px 20px 18px", textAlign: "center",
              position: "relative", overflow: "hidden",
              boxShadow: isEarned
                ? "0 6px 20px rgba(5,150,105,0.1)"
                : `0 4px 16px ${badge.glow}`,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}>
              {/* Sparkle accents */}
              <span style={{ position: "absolute", top: 10, left: 12, fontSize: 10, opacity: 0.4 }}>✦</span>
              <span style={{ position: "absolute", bottom: 14, right: 14, fontSize: 8, opacity: 0.3 }}>✦</span>

              {/* Lock / Earned indicator */}
              {isEarned ? (
                <div style={{
                  position: "absolute", top: 10, right: 10, width: 26, height: 26,
                  borderRadius: "50%", background: "#059669", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800,
                  boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
                }}>✓</div>
              ) : (
                <div style={{
                  position: "absolute", top: 10, right: 10, width: 26, height: 26,
                  borderRadius: "50%", background: `${badge.accent}18`,
                  border: `1.5px solid ${badge.accent}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Lock size={12} style={{ color: badge.lockColor }} />
                </div>
              )}

              {/* Badge icon circle */}
              <div style={{
                width: 130, height: 130, borderRadius: "50%", margin: "4px auto 14px",
                background: isEarned
                  ? `linear-gradient(135deg, ${C.mint}, #A7F3D0)`
                  : `linear-gradient(135deg, ${C.white}, ${badge.color})`,
                border: `3px solid ${isEarned ? "#6EE7B7" : badge.accent}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isEarned
                  ? "0 4px 16px rgba(5,150,105,0.15)"
                  : `0 4px 16px ${badge.glow}`,
              }}>
                <Icon size={56} style={{ color: isEarned ? "#065F46" : badge.accent }} />
              </div>

              {/* Title */}
              <h4 style={{ fontSize: 21, fontWeight: 800, color: C.dark, margin: "0 0 4px" }}>
                {badge.name}
              </h4>

              {/* Condition */}
              <p style={{ fontSize: 15, color: "#8B8FA8", margin: "0 0 12px", lineHeight: 1.4 }}>
                {badge.req}
              </p>

              {/* Progress row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <Star size={12} style={{ color: pct > 0 ? C.gold : C.muted, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.body, flexShrink: 0 }}>
                  {val} / {badge.progressMax}
                </span>
                <div style={{
                  width: 145, height: 7, borderRadius: 4,
                  background: `${badge.accent}15`, overflow: "hidden", flexShrink: 0,
                }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, borderRadius: 4,
                    background: `linear-gradient(90deg, ${badge.accent}, ${badge.accent}AA)`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== BOTTOM MOTIVATION BANNER ===== */}
      <div style={{
        width: "100%", height: 90, borderRadius: 22,
        background: "linear-gradient(135deg, #FFFFFF, #F5F3FF)",
        border: "1.5px solid #E9D5FF",
        padding: "0 32px", display: "flex", alignItems: "center", gap: 20,
        boxShadow: "0 4px 16px rgba(109,40,217,0.06)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Owl mascot */}
        <div style={{
          width: 88, height: 88, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #EDE9FE, #C4B5FD)",
          border: "2px solid #C4B5FD",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44,
        }}>🦉</div>

        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 16, fontWeight: 800, color: C.dark, margin: "0 0 2px" }}>
            Earn badges by completing lessons, quests, streaks, and EQ check-ins.
          </h4>
          <p style={{ fontSize: 14, color: C.body, margin: 0 }}>
            Collect them all and become an Arizen superstar! ⭐
          </p>
        </div>

        {/* Faint trophy silhouettes */}
        <div style={{ display: "flex", gap: 8, opacity: 0.15, fontSize: 36 }}>
          <Trophy size={40} style={{ color: C.purple }} />
          <Star size={36} style={{ color: C.gold }} />
          <Gift size={38} style={{ color: "#E11D48" }} />
        </div>

        {/* Sparkle accents */}
        <span style={{ position: "absolute", top: 8, right: 24, fontSize: 14, opacity: 0.3 }}>✦</span>
        <span style={{ position: "absolute", bottom: 8, right: 60, fontSize: 10, opacity: 0.2 }}>✦</span>
      </div>

      {/* Responsive CSS via style tag */}
      <style>{`
        @media (max-width: 1200px) {
          .badge-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .badge-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .badge-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
