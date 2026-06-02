"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Trophy, Lock, Star, Zap, Heart, Gift, Users, Target } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>
            <Trophy size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#D97706" }} /> My Badges
          </h1>
          <p style={{ color: C.body, fontSize: "0.875rem", margin: 0 }}>Complete lessons, quests, and check-ins to unlock badges.</p>
        </div>
        <div style={{ padding: "8px 16px", borderRadius: 12, background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", border: "1px solid #F59E0B", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Star size={16} style={{ color: "#D97706" }} />
          <span style={{ fontWeight: 800, color: "#92400E" }}>{earnedCount} / {totalCount}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 10, borderRadius: 5, background: "#F1F5F9", overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`, borderRadius: 5, background: "linear-gradient(90deg, #F59E0B, #22C55E)", transition: "width 0.5s" }} />
      </div>
      <p style={{ fontSize: "0.75rem", color: C.body, marginBottom: 24 }}>
        {earnedCount === 0 ? "Complete your first lesson to start earning badges!" : `${earnedCount} badge${earnedCount !== 1 ? "s" : ""} earned. Keep going!`}
      </p>

      {/* Badge grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {BADGES.map(badge => {
          const Icon = badge.icon;
          const isEarned = earnedSet.has(badge.name);
          return (
            <div key={badge.name} style={{
              padding: "24px 20px", borderRadius: 18,
              border: `2px solid ${isEarned ? badge.ring : C.border}`,
              background: isEarned
                ? `linear-gradient(135deg, ${badge.color}, white)`
                : C.white,
              textAlign: "center", position: "relative",
              boxShadow: isEarned ? `0 4px 20px ${badge.accent}22` : "none",
            }}>
              {isEarned && (
                <span style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%", background: badge.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800 }}>✓</span>
              )}
              {!isEarned && (
                <span style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%", background: "#F1F5F9", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
                  <Lock size={10} style={{ color: "#94A3B8" }} />
                </span>
              )}
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: isEarned ? `linear-gradient(135deg, ${badge.accent}30, ${badge.accent}10)` : "#F8FAFC",
                border: `3px solid ${isEarned ? badge.ring : "#E2E8F0"}`,
                margin: "0 auto 14px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={28} style={{ color: isEarned ? badge.accent : "#CBD5E1" }} />
              </div>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: 800, color: isEarned ? C.dark : "#94A3B8", margin: "0 0 4px 0" }}>{badge.name}</h4>
              <p style={{ fontSize: "0.6875rem", color: isEarned ? C.body : "#B0B8C4", margin: 0 }}>{badge.requirement}</p>
              {isEarned && (
                <span style={{ display: "inline-block", marginTop: 8, padding: "2px 10px", borderRadius: 999, background: badge.accent, color: "#fff", fontSize: "0.625rem", fontWeight: 700 }}>
                  ✨ Earned
                </span>
              )}
              {!isEarned && (
                <span style={{ display: "inline-block", marginTop: 8, padding: "2px 10px", borderRadius: 999, background: "#F1F5F9", color: "#94A3B8", fontSize: "0.625rem", fontWeight: 600 }}>
                  🔒 Locked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
