"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GuildLayout } from "@/components/layout";
import { useAuth } from "@/hooks";
import { useThemes } from "@/hooks/useApi";
import { Trophy, TrendingUp, Target, BookOpen, Star, Flame, Heart, Sparkles } from "lucide-react";
import { SkeletonCard } from "@/components/ui";
import Link from "next/link";

const gradeGradients = [
  "from-pink-400 to-purple-400",
  "from-pink-400 to-purple-400",
  "from-cyan-400 to-blue-400",
  "from-cyan-400 to-blue-400",
  "from-amber-400 to-orange-400",
  "from-amber-400 to-orange-400",
  "from-indigo-400 to-purple-400",
  "from-indigo-400 to-purple-400",
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const { data, loading } = useThemes(selectedGrade || undefined);
  const themes = data?.themes || [];
  const grade = user?.grade || 5;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-3xl bg-lavender-light flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm text-text-muted">Loading your world...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const greeting = getGreeting(grade, user?.displayName || user?.name || "Explorer");
  const uniqueGrades = [...new Set(themes.map((t: any) => t.grade))].sort();

  return (
    <GuildLayout
      title="Dashboard"
      guildName="Arizen School"
      grade={grade}
      totalXp={user?.totalXp || 0}
      streak={user?.currentStreak || 0}
    >
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

        {/* ── Welcome ── */}
        <div className={`rounded-3xl p-6 md:p-8 ${getGradeWelcomeBg(grade)}`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="heading-md mb-1 text-balance">{greeting}</h2>
              <p className="text-body mt-1">
                {grade <= 2
                  ? "What shall we explore today? ✨"
                  : grade <= 4
                  ? "Ready to discover something new? 🔍"
                  : "Your quest awaits, adventurer! ⚔️"}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <span className="xp-badge">
                  <Trophy className="w-3 h-3" /> {(user?.totalXp || 0).toLocaleString()} XP
                </span>
                <span className="streak-badge">
                  <Flame className="w-3 h-3" /> {user?.currentStreak || 0} day streak
                </span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center float-slow">
              <Heart className="w-8 h-8 text-primary/60" />
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: grade <= 2 ? "Stars" : "Total XP", value: (user?.totalXp || 0).toLocaleString(), icon: Trophy, color: "text-amber-500", bg: "bg-peach-light" },
            { label: "Streak", value: `${user?.currentStreak || 0} days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
            { label: "Badges", value: "0", icon: Target, color: "text-purple-500", bg: "bg-lavender-light" },
            { label: "Level", value: String(Math.floor((user?.totalXp || 0) / 500) + 1), icon: Star, color: "text-blue", bg: "bg-blue-light" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-muted">{stat.label}</p>
                    <p className="text-lg font-bold text-text">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Grade filter ── */}
        {uniqueGrades.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedGrade(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                !selectedGrade
                  ? "bg-primary text-white shadow-glow"
                  : "bg-white text-text-muted border border-border hover:border-lavender-soft"
              }`}
            >
              All Grades
            </button>
            {uniqueGrades.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedGrade === g
                    ? "bg-primary text-white shadow-glow"
                    : "bg-white text-text-muted border border-border hover:border-lavender-soft"
                }`}
              >
                Grade {g}
              </button>
            ))}
          </div>
        )}

        {/* ── Themes ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="heading-sm">
              {grade <= 2 ? "🎒 Learning Adventures" : grade <= 4 ? "📋 Missions" : "⚔️ Active Quests"}
            </h3>
            <Link href="/themes" className="btn-ghost text-sm">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : themes.length === 0 ? (
            <div className="card p-10 text-center">
              <BookOpen className="w-12 h-12 text-lavender mx-auto mb-4" />
              <h3 className="heading-sm mb-2">No themes yet</h3>
              <p className="text-body mb-4">Your learning adventures will appear here once they&apos;re ready.</p>
              <Link href="/" className="btn-primary text-sm">
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.slice(0, 6).map((theme: any, idx: number) => {
                const color = gradeGradients[(theme.grade - 1) % gradeGradients.length];
                return (
                  <Link
                    key={theme.id}
                    href={`/theme/${theme.slug}`}
                    className="group card overflow-hidden p-0 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`h-28 bg-gradient-to-br ${color} p-5 flex flex-col justify-end`}>
                      <span className="text-xs font-bold text-white/70">Grade {theme.grade}</span>
                      <h4 className="text-lg font-bold text-white">{theme.title}</h4>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>{theme.questsCount || 0} {grade <= 2 ? "adventures" : grade <= 4 ? "missions" : "quests"}</span>
                        <span>{theme.durationWeeks}w</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-soft overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-lavender transition-all duration-500"
                          style={{ width: `${theme.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </GuildLayout>
  );
}

function getGreeting(grade: number, name: string): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  if (grade <= 2) return `${timeGreeting}, ${name}! ✨`;
  if (grade <= 4) return `${timeGreeting}, ${name}! 🌟`;
  return `${timeGreeting}, ${name}! ⚔️`;
}

function getGradeWelcomeBg(grade: number): string {
  if (grade <= 2) return "bg-gradient-to-br from-pink-50 via-purple-50 to-lavender-light";
  if (grade <= 4) return "bg-gradient-to-br from-cyan-50 via-blue-50 to-blue-light";
  if (grade <= 6) return "bg-gradient-to-br from-amber-50 via-orange-50 to-peach-light";
  return "bg-gradient-to-br from-indigo-50 via-purple-50 to-lavender-light";
}
