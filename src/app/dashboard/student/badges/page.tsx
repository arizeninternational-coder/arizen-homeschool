"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Trophy, Lock, Star, Zap, Heart } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

const BADGES = [
  { name: "Math Whiz",        icon: Zap,       color: "#EDE9FE", accent: "#6D28D9", requirement: "Complete 5 math lessons",     category: "academic" },
  { name: "Reader",           icon: Star,      color: "#FFF4D8", accent: "#D97706", requirement: "Complete 5 reading lessons",   category: "academic" },
  { name: "Science Explorer", icon: Zap,       color: "#ECFDF5", accent: "#059669", requirement: "Complete 5 science lessons",   category: "academic" },
  { name: "Quiz Master",      icon: Trophy,    color: "#EFF6FF", accent: "#2563EB", requirement: "Score 80%+ on 3 quizzes",      category: "academic" },
  { name: "Goal Getter",      icon: Trophy,    color: "#FFFBEB", accent: "#D97706", requirement: "Complete daily goal 3 days",  category: "streak" },
  { name: "Streak Keeper",    icon: Zap,       color: "#FEF3C7", accent: "#D97706", requirement: "Build a 7-day learning streak", category: "streak" },
  { name: "Kind Heart",       icon: Heart,     color: "#FFF1F2", accent: "#E11D48", requirement: "Complete 3 EQ check-ins",     category: "eq" },
  { name: "Team Player",      icon: Star,      color: "#EFF6FF", accent: "#2563EB", requirement: "Complete 10 quests",           category: "quest" },
];

export default function BadgesPage() {
  const [earned, setEarned] = useState([]);

  useEffect(() => {
    fetch("/api/learner/badges", { credentials: "include" })
      .then(r => r.json())
      .then(d => setEarned((d.badges || []).filter(b => b.earned).map(b => b.name)))
      .catch(() => {});
  }, []);

  const earnedSet = new Set(earned);
  const earnedCount = earned.length;
  const totalCount = BADGES.length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>
            <Trophy size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#D97706" }} /> Badges
          </h1>
          <p style={{ color: C.body, fontSize: "0.875rem", margin: 0 }}>Complete lessons, quests, and check-ins to unlock badges.</p>
        </div>
        <div style={{ padding: "8px 16px", borderRadius: 12, background: "#FFFBEB", border: "1px solid #FDE68A", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Trophy size={16} style={{ color: "#D97706" }} />
          <span style={{ fontWeight: 800, color: "#92400E" }}>{earnedCount} / {totalCount}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 10, borderRadius: 5, background: "#F1F5F9", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${(earnedCount / totalCount) * 100}%`, borderRadius: 5, background: "linear-gradient(90deg, #D97706, #F59E0B)", transition: "width 0.5s" }} />
      </div>

      {/* Badge grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {BADGES.map(badge => {
          const Icon = badge.icon;
          const isEarned = earnedSet.has(badge.name);
          return (
            <div key={badge.name} style={{
              padding: "20px", borderRadius: 16, border: `1px solid ${isEarned ? "#A7F3D0" : C.border}`,
              background: isEarned ? "#ECFDF5" : C.white, textAlign: "center", position: "relative",
            }}>
              {isEarned && (
                <span style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem", fontWeight: 800 }}>✓</span>
              )}
              {!isEarned && (
                <span style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: "#F1F5F9", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock size={10} style={{ color: C.muted }} />
                </span>
              )}
              <div style={{
                width: 56, height: 56, borderRadius: "50%", background: isEarned ? "#A7F3D0" : "#F8FAFC",
                border: `2px solid ${isEarned ? "#6EE7B7" : "#E2E8F0"}`, margin: "0 auto 12px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={24} style={{ color: isEarned ? "#065F46" : "#9CA3AF" }} />
              </div>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>{badge.name}</h4>
              <p style={{ fontSize: "0.6875rem", color: C.body, margin: 0 }}>{badge.requirement}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
