"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Trophy, Medal } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

interface LeaderboardEntry {
  displayName: string;
  totalXp: number;
  currentStreak: number;
  score: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/learners", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const learners = data.learners || [];

          // Calculate score from safe fields only (XP + streak bonus)
          const scored = learners.map((l: any) => {
            const xp = l.totalXp || 0;
            const streak = l.currentStreak || 0;
            const score = xp + (streak * 5);
            return {
              displayName: l.displayName || "Learner",
              totalXp: xp,
              currentStreak: streak,
              score,
              rank: 0,
            };
          });

          scored.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score);
          scored.forEach((e: LeaderboardEntry, i: number) => { e.rank = i + 1; });

          setEntries(scored);
        }
      } catch (e) {
        console.error("[LEADERBOARD] Load error:", e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span style={{ fontSize: "1.5rem" }}>🥇</span>;
    if (rank === 2) return <span style={{ fontSize: "1.5rem" }}>🥈</span>;
    if (rank === 3) return <span style={{ fontSize: "1.5rem" }}>🥉</span>;
    return <span style={{ fontSize: "1.125rem", fontWeight: 800, color: C.body }}>#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "linear-gradient(135deg, #FEF3C7, #FDE68A)";
    if (rank === 2) return "linear-gradient(135deg, #F1F5F9, #E2E8F0)";
    if (rank === 3) return "linear-gradient(135deg, #FFEDD5, #FED7AA)";
    return C.white;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <Trophy size={32} style={{ color: C.teal, margin: "0 auto 1rem" }} />
          <p style={{ color: C.body, fontWeight: 600 }}>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.25rem 0" }}>
          <Trophy size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#D97706" }} />
          Leaderboard
        </h1>
        <p style={{ color: C.body, fontSize: "0.875rem" }}>Ranked by XP and learning streaks.</p>
      </div>

      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, marginBottom: "0.5rem" }}>No rankings yet</h3>
          <p style={{ color: C.body, fontSize: "0.875rem", maxWidth: 400, margin: "0 auto" }}>
            Complete lessons and earn XP to appear on the leaderboard!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((entry, index) => (
            <div key={`${entry.displayName}-${index}`} style={{
              background: getRankBg(entry.rank),
              borderRadius: 14, padding: "14px 18px",
              border: `1px solid ${entry.rank <= 3 ? "transparent" : C.border}`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ width: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {getRankIcon(entry.rank)}
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: entry.rank <= 3 ? "rgba(255,255,255,0.8)" : "#E2E8F0",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.875rem", fontWeight: 700, color: C.dark,
              }}>
                {entry.displayName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: C.dark, fontSize: "0.875rem" }}>{entry.displayName}</div>
                <div style={{ fontSize: "0.6875rem", color: C.body, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span>{entry.totalXp} XP</span>
                  <span>{entry.currentStreak}d streak</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 800, color: C.dark, fontSize: "1rem" }}>{entry.score}</div>
                <div style={{ fontSize: "0.625rem", color: C.body, fontWeight: 600 }}>points</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
