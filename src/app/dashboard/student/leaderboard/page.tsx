"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Trophy, Flame, Star, Medal, TrendingUp, Zap, Coins } from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B",
  white: "#FFFFFF", border: "#E2E8F0", cream: "#FFFBEB", mint: "#ECFDF5",
  lavender: "#EDE9FE", rose: "#FFF1F2", blue: "#EFF6FF",
};

const SORT_OPTIONS = [
  { key: "xp", label: "XP", icon: Star },
  { key: "streak", label: "Streak", icon: Flame },
  { key: "badges", label: "Badges", icon: Medal },
  { key: "lessons", label: "Lessons", icon: TrendingUp },
  { key: "coins", label: "Coins", icon: Coins },
];

const RANK_STYLES = [
  { bg: "linear-gradient(135deg, #FEF3C7, #FDE68A)", border: "#FDE68A", color: "#92400E", size: 48 },
  { bg: "linear-gradient(135deg, #E5E7EB, #D1D5DB)", border: "#D1D5DB", color: "#374151", size: 42 },
  { bg: "linear-gradient(135deg, #FED7AA, #FDBA74)", border: "#FDBA74", color: "#9A3412", size: 40 },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("xp");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/learner/leaderboard?sort=${sortBy}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch (e) { console.error("[LEADERBOARD] Load error:", e); }
      setLoading(false);
    };
    load();
  }, [sortBy]);

  if (loading) return null;

  return (
    <div style={{ padding: "28px 32px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 4px" }}>Leaderboard</h1>
        <p style={{ color: C.body, fontSize: "0.9375rem", margin: 0 }}>See how you rank among your peers.</p>
      </div>

      {/* Sort tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {SORT_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const isActive = sortBy === opt.key;
          return (
            <button key={opt.key} onClick={() => setSortBy(opt.key)} style={{
              padding: "8px 16px", borderRadius: 12, border: isActive ? "2px solid " + C.teal : "1px solid " + C.border,
              background: isActive ? C.teal : C.white, color: isActive ? "#fff" : C.dark,
              fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Icon size={14} /> {opt.label}
            </button>
          );
        })}
      </div>

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, marginBottom: 32 }}>
          {[1, 0, 2].map(idx => {
            const e = entries[idx];
            if (!e) return null;
            const style = RANK_STYLES[idx];
            const heights = [140, 120, 100];
            return (
              <div key={e.id || idx} style={{ textAlign: "center", width: 140 }}>
                <div style={{
                  width: style.size, height: style.size, borderRadius: "50%", margin: "0 auto 8px",
                  background: style.bg, border: `3px solid ${style.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: style.size * 0.4, fontWeight: 900, color: style.color,
                }}>
                  {e.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <p style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 2px" }}>{e.name}</p>
                <p style={{ fontSize: "0.6875rem", color: C.body, margin: "0 0 8px" }}>
                  {sortBy === "xp" ? `${e.xp} XP` : sortBy === "streak" ? `${e.streak} days` : sortBy === "badges" ? `${e.badges} badges` : sortBy === "coins" ? `${e.coins} coins` : `${e.lessonsCompleted} lessons`}
                </p>
                <div style={{
                  height: heights[idx], borderRadius: "12px 12px 0 0",
                  background: style.bg, border: `2px solid ${style.border}`,
                  borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.25rem", fontWeight: 900, color: style.color,
                }}>
                  #{e.rank}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: C.white, borderRadius: 20, border: "1px solid " + C.border }}>
          <Trophy size={48} style={{ color: C.body, margin: "0 auto 16px", opacity: 0.3 }} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: C.dark, marginBottom: "0.5rem" }}>No rankings yet</h3>
          <p style={{ color: C.body, fontSize: "0.875rem" }}>Complete lessons and earn XP to appear on the leaderboard.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {entries.map((e, i) => {
            const style = i < 3 ? RANK_STYLES[i] : null;
            return (
              <div key={e.id || i} style={{
                padding: "14px 20px", borderRadius: 16,
                background: e.isCurrentUser ? "linear-gradient(135deg, #ECFDF5, #D1FAE5)" : (style ? style.bg : C.white),
                border: `1.5px solid ${e.isCurrentUser ? "#6EE7B7" : (style?.border || C.border)}`,
                display: "flex", alignItems: "center", gap: 16,
                boxShadow: e.isCurrentUser ? "0 4px 12px rgba(5,150,105,0.1)" : "none",
              }}>
                <span style={{
                  fontSize: "1rem", fontWeight: 900, color: style?.color || C.muted,
                  width: 36, textAlign: "center", flexShrink: 0,
                }}>#{e.rank}</span>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: style?.bg || "#F1F5F9",
                  border: `2px solid ${style?.border || C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", fontWeight: 900, color: style?.color || C.dark,
                }}>{e.name?.charAt(0)?.toUpperCase() || "?"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: C.dark }}>
                    {e.name} {e.isCurrentUser && <span style={{ color: C.teal, fontSize: "0.75rem" }}>(You)</span>}
                  </span>
                  {e.grade && <span style={{ fontSize: "0.6875rem", color: C.body, marginLeft: 8 }}>Grade {e.grade}</span>}
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: "0.6875rem", color: C.body }}>
                  <span style={{ fontWeight: 700, color: C.dark }}>{e.xp} XP</span>
                  <span>🔥 {e.streak}</span>
                  <span>🏆 {e.badges}</span>
                  <span>📝 {e.lessonsCompleted}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
