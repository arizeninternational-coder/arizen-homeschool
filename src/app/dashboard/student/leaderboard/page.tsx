"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Trophy, Star, Flame, Eye } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui/Pill";

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
            .filter((l: any) => (l.totalXp || 0) > 0 || (l.currentStreak || 0) > 0)
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
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-text-muted">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const meEntry = entries.find(e => e.isMe);
  const topEntries = entries.slice(0, 10);

  const getRankBadgeClasses = (rank: number, isMe: boolean) => {
    if (rank === 1) return "bg-gradient-to-br from-gold to-amber-500 text-white shadow-[0_4px_15px_rgba(245,165,36,0.35)]";
    if (rank === 2) return "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-[0_4px_12px_rgba(100,116,139,0.25)]";
    if (rank === 3) return "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-[0_4px_12px_rgba(180,83,9,0.25)]";
    if (isMe) return "bg-gradient-to-br from-primary to-accent-purple text-white shadow-[0_4px_15px_rgba(79,70,229,0.25)]";
    return "bg-bg-card text-text-muted";
  };

  const getCardClasses = (rank: number, isMe: boolean) => {
    if (rank === 1) return "bg-[linear-gradient(135deg,rgb(var(--color-gold-soft))_0%,rgb(var(--color-peach-soft))_100%)] border-gold/30";
    if (rank === 2) return "bg-[linear-gradient(135deg,rgb(var(--color-surface-soft))_0%,rgb(var(--color-green-soft))_100%)] border-border-soft";
    if (rank === 3) return "bg-[linear-gradient(135deg,rgb(var(--color-peach-soft))_0%,rgb(var(--color-gold-soft))_100%)] border-peach/20";
    if (isMe) return "bg-[linear-gradient(135deg,rgb(var(--color-primary-soft))_0%,rgb(var(--color-accent-purple-soft))_100%)] border-primary/30 ring-2 ring-primary/10";
    return "bg-white border-border-soft hover:shadow-card-hover";
  };

  const getAvatarInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leaderboard"
        subtitle="Real rankings from learner activity"
      />

      {/* Top stats cards */}
      {topEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard
            label={topEntries[0] ? topEntries[0].displayName : "—"}
            value={`${topEntries[0]?.score || 0} pts`}
            icon={<Trophy size={18} className="text-gold" />}
            gradient="bg-card-gradient-gold"
            borderColor="border-gold/20"
            textColor="text-amber-800"
          />
          <StatCard
            label={topEntries[1] ? topEntries[1].displayName : "—"}
            value={`${topEntries[1]?.score || 0} pts`}
            icon={<Trophy size={18} className="text-slate-500" />}
            gradient="bg-[linear-gradient(135deg,rgb(var(--color-surface-soft))_0%,rgb(var(--color-green-soft))_100%)]"
            borderColor="border-slate-200"
            textColor="text-slate-700"
          />
          <StatCard
            label={topEntries[2] ? topEntries[2].displayName : "—"}
            value={`${topEntries[2]?.score || 0} pts`}
            icon={<Trophy size={18} className="text-amber-700" />}
            gradient="bg-[linear-gradient(135deg,rgb(var(--color-peach-soft))_0%,rgb(var(--color-gold-soft))_100%)]"
            borderColor="border-gold/20"
            textColor="text-amber-800"
          />
        </div>
      )}

      {/* My position card */}
      {meEntry && (
        <div className="bg-[linear-gradient(135deg,rgb(var(--color-primary-soft))_0%,rgb(var(--color-secondary-soft))_100%)] rounded-2xl p-4 mb-5 border border-primary/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-pill">
            <Star size={18} className="text-white" />
          </div>
          <span className="font-bold text-text text-sm">
            You are <span className="text-primary">#{meEntry.rank}</span> of {entries.length}
            <span className="text-text-muted ml-1">({meEntry.totalXp} XP)</span>
          </span>
        </div>
      )}

      {topEntries.length === 0 ? (
        <div className="rounded-[1.75rem] border border-border-soft bg-white p-12 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gold-soft/50 flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-gold" />
          </div>
          <h3 className="text-lg font-bold text-text mb-2">No rankings yet</h3>
          <p className="text-sm text-text-muted max-w-[360px] mx-auto">
            Complete lessons and earn XP to appear on the leaderboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {topEntries.map((entry) => (
            <div
              key={`${entry.displayName}-${entry.rank}`}
              className={`rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${getCardClasses(entry.rank, !!entry.isMe)}`}
            >
              <div className="flex items-center gap-4">
                {/* Rank badge */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${getRankBadgeClasses(entry.rank, !!entry.isMe)}`}>
                  {entry.rank <= 3 ? (
                    <Trophy size={18} />
                  ) : (
                    entry.rank
                  )}
                </div>

                {/* Avatar circle */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                  entry.rank === 1
                    ? "bg-gold-soft text-amber-800 border-2 border-gold/30"
                    : entry.rank === 2
                    ? "bg-slate-100 text-slate-600 border-2 border-slate-200"
                    : entry.rank === 3
                    ? "bg-peach-soft text-amber-800 border-2 border-peach/30"
                    : entry.isMe
                    ? "bg-primary-soft text-primary-dark border-2 border-primary/30"
                    : "bg-bg-main text-text-muted border border-border-soft"
                }`}>
                  {getAvatarInitials(entry.displayName)}
                </div>

                {/* Name + stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text text-sm truncate">{entry.displayName}</span>
                    {entry.isMe && (
                      <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary-dark text-[10px] font-extrabold uppercase tracking-wider">
                        (me)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-text-muted">{entry.totalXp} XP</span>
                    {entry.currentStreak > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-pink">
                        <Flame size={12} /> {entry.currentStreak}d
                      </span>
                    )}
                  </div>
                </div>

                {/* Score pill */}
                <div className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex-shrink-0 ${
                  entry.rank === 1
                    ? "bg-gold-soft text-amber-800 border border-gold/20"
                    : entry.rank === 2
                    ? "bg-slate-100 text-slate-600 border border-slate-200"
                    : entry.rank === 3
                    ? "bg-peach-soft text-amber-800 border border-peach/20"
                    : entry.isMe
                    ? "bg-primary-soft text-primary-dark border border-primary/20"
                    : "bg-bg-main text-text-muted border border-border-soft"
                }`}>
                  {entry.score} pts
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
