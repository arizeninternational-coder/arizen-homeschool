"use client";
import { useEffect, useState } from "react";
import { GuildLayout } from "@/components/layout";
import { useAuth } from "@/hooks";
import { useThemes } from "@/hooks/useApi";
import { Trophy, TrendingUp, Target, Clock, BookOpen, Star } from "lucide-react";
import { SkeletonCard, Badge, XpBadge, StreakBadge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const gradeGradients = [
  "from-pink-400 to-purple-500",     // G1-2 playful
  "from-pink-400 to-purple-500",
  "from-teal-400 to-cyan-500",       // G3-4 transitional
  "from-teal-400 to-cyan-500",
  "from-amber-500 to-red-500",       // G5-6 RPG
  "from-amber-500 to-red-500",
  "from-indigo-500 to-purple-500",   // G7-8 advanced
  "from-indigo-500 to-purple-500",
];

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const { data, loading } = useThemes(selectedGrade || undefined);
  const themes = data?.themes || [];
  const grade = user?.grade || 5;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  const greeting = getGreeting(grade, user?.displayName || "Learner");
  const uniqueGrades = [...new Set(themes.map((t: any) => t.grade))].sort();

  return (
    <GuildLayout title="Dashboard" guildName="Arizen Homeschool" grade={grade} totalXp={user?.totalXp || 0} streak={user?.currentStreak || 0}>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Welcome — grade-aware */}
        <div className={cn("rounded-2xl p-6", getGradeHeaderBg(grade))}>
          <h2 className={cn("heading-lg mb-1", grade <= 2 && "text-purple-800", grade >= 5 && "text-amber-900")}>
            {greeting}
          </h2>
          <p className="text-body">
            {grade <= 2 ? "What shall we explore today? 🌟" : grade <= 4 ? "Ready to discover something new? 🔍" : "Your quest awaits, adventurer! ⚔️"}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <XpBadge amount={user?.totalXp || 0} />
            <StreakBadge count={user?.currentStreak || 0} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: grade <= 2 ? "Stars" : "Total XP", value: (user?.totalXp || 0).toLocaleString(), icon: Trophy, color: "text-amber-600" },
            { label: "Streak", value: `${user?.currentStreak || 0} days`, icon: TrendingUp, color: "text-orange-600" },
            { label: grade <= 2 ? "Badges" : "Badges", value: "0", icon: Target, color: "text-purple-600" },
            { label: "Level", value: String(Math.floor((user?.totalXp || 0) / 500) + 1), icon: Star, color: "text-primary" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-surface-raised rounded-2xl border border-border p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-sunken flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                  <p className="text-lg font-bold text-text">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grade filter */}
        {uniqueGrades.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setSelectedGrade(null)} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold transition-colors", !selectedGrade ? "bg-primary text-white" : "bg-surface-sunken text-text-muted")}>
              All Grades
            </button>
            {uniqueGrades.map((g) => (
              <button key={g} onClick={() => setSelectedGrade(g)} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold transition-colors", selectedGrade === g ? "bg-primary text-white" : "bg-surface-sunken text-text-muted")}>
                Grade {g}
              </button>
            ))}
          </div>
        )}

        {/* Themes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-md">{grade <= 2 ? "🎒 Learning Adventures" : grade <= 4 ? "📋 Missions" : "⚔️ Active Quests"}</h3>
            <a href="/themes" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">View All →</a>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : themes.length === 0 ? (
            <div className="bg-surface-raised rounded-2xl border border-border p-8 text-center">
              <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">No themes available yet for this grade.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.slice(0, 6).map((theme: any, idx: number) => {
                const color = gradeGradients[(theme.grade - 1) % gradeGradients.length];
                return (
                  <a key={theme.id} href={`/theme/${theme.slug}`} className="group bg-surface-raised rounded-2xl border border-border overflow-hidden hover:shadow-card-hover hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200">
                    <div className={`h-28 bg-gradient-to-br ${color} p-4 flex flex-col justify-end`}>
                      <span className="text-xs font-semibold text-white/80">Grade {theme.grade}</span>
                      <h4 className="text-lg font-bold text-white">{theme.title}</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>{theme.questsCount || 0} {grade <= 2 ? "adventures" : grade <= 4 ? "missions" : "quests"}</span>
                        <span>{theme.durationWeeks}w</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${theme.progress || 0}%` }} />
                      </div>
                    </div>
                  </a>
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

function getGradeHeaderBg(grade: number): string {
  if (grade <= 2) return "bg-gradient-to-r from-pink-100 via-purple-50 to-indigo-100";
  if (grade <= 4) return "bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50";
  if (grade <= 6) return "bg-gradient-to-r from-amber-50 via-orange-50 to-red-50";
  return "bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50";
}
