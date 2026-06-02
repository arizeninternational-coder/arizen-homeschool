"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Trophy, Star, Flame } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

interface LeaderboardEntry {
  displayName: string;
  totalXp: number;
  currentStreak: number;
  score: number;
  rank: number;
  isMe?: boolean;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Get current user's profile to identify "me"
        const profileRes = await fetch("/api/learner/profile", { credentials: "include" });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCurrentUserName(profileData?.profile?.displayName || null);
        }

        const res = await fetch("/api/learners", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const learners = data.learners || [];

          // Calculate score from real data only (XP + streak bonus)
          const scored: LeaderboardEntry[] = learners
            .filter((l: any) => (l.totalXp || 0) > 0 || (l.currentStreak || 0) > 0) // Only show learners with some activity
            .map((l: any) => {
              const xp = l.totalXp || 0;
              const streak = l.currentStreak || 0;
              return {
                displayName: l.displayName || "Learner",
                totalXp: xp,
                currentStreak: streak,
                score: xp + (streak * 5),
                rank: 0,
                isMe: false,
              };
            });

          scored.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score);
          scored.forEach((e: LeaderboardEntry, i: number) => {
            e.rank = i + 1;
            if (currentUserName && e.displayName === currentUserName) {
              e.isMe = true;
            }
          });

          setEntries(scored);
        }
      } catch (e) {
        console.error("[LEADERBOARD] Load error:", e);
      }
      setLoading(false);
    }
    load();
  }, [currentUserName]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 12 }}>
        <Trophy size={32} style={{ color: C.teal }} />
        <p style={{ color: C.body, fontWeight: 600 }}>Loading leaderboard...</p>
      </div>
    );
  }

  const meEntry = entries.find(e => e.isMe);
  const topEntries = entries.slice(0, 10);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Trophy size={24} style={{ color: "#D97706" }} />
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: C.dark, margin: 0 }}>Leaderboard</h1>
          <p style={{ color: C.body, fontSize: "0.8125rem", margin: 0 }}>Real rankings from learner activity</p>
        </div>
      </div>

      {/* My position card */}
      {meEntry && (
        <div style={{
          background: "linear-gradient(135deg, #E6F5F1, #D1FAE5)", borderRadius: 14, padding: "12px 16px",
          marginBottom: 16, border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: 12,
        }}>
          <Star size={18} style={{ color: C.teal }} />
          <span style={{ fontWeight: 700, color: C.dark, fontSize: "0.875rem" }}>
            You are <span style={{ color: C.teal }}>#{meEntry.rank}</span> of {entries.length}
          </span>
        </div>
      )}

      {topEntries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🏆</div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, marginBottom: "0.5rem" }}>No rankings yet</h3>
          <p style={{ color: C.body, fontSize: "0.875rem", maxWidth: 360, margin: "0 auto" }}>
            Complete lessons and earn XP to appear on the leaderboard.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {topEntries.map((entry) => {
            const rankColor = entry.rank === 1 ? "#D97706" : entry.rank === 2 ? "#6B7280" : entry.rank === 3 ? "#B45309" : C.body;
            const bg = entry.rank === 1
              ? "linear-gradient(135deg, #FEF3C7, #FDE68A)"
              : entry.rank === 2
              ? "linear-gradient(135deg, #F1F5F9, #E2E8F0)"
              : entry.rank === 3
              ? "linear-gradient(135deg, #FFEDD5, #FED7AA)"
              : entry.isMe
              ? "linear-gradient(135deg, #E6F5F1, #D1FAE5)"
              : C.white;
            const border = entry.isMe ? "2px solid #6EE7B7" : `1px solid ${C.border}`;

            return (
              <div key={`${entry.displayName}-${entry.rank}`} style={{
                background: bg, borderRadius: 14, padding: "14px 12px", border,
                textAlign: "center", position: "relative",
              }}>
                {/* Rank badge */}
                <div style={{
                  position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                  width: 24, height: 24, borderRadius: "50%", background: rankColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6875rem", fontWeight: 800, color: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                }}>
                  {entry.rank}
                </div>

                {/* Avatar circle */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", margin: "12px auto 8px",
                  background: entry.rank <= 3 ? "rgba(255,255,255,0.8)" : "#E2E8F0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.125rem", fontWeight: 700, color: C.dark,
                }}>
                  {entry.displayName.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <div style={{ fontWeight: 700, color: C.dark, fontSize: "0.8125rem", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entry.displayName}
                  {entry.isMe && <span style={{ color: C.teal, fontSize: "0.6875rem", marginLeft: 4 }}>(me)</span>}
                </div>

                {/* Stats */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, fontSize: "0.6875rem", color: C.body }}>
                  <span>{entry.totalXp} XP</span>
                  {entry.currentStreak > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Flame size={10} style={{ color: "#D97706" }} /> {entry.currentStreak}d
                    </span>
                  )}
                </div>

                {/* Score */}
                <div style={{ marginTop: 6, fontSize: "0.625rem", fontWeight: 700, color: rankColor }}>
                  {entry.score} pts
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
