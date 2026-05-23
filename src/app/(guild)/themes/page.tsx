"use client";

import { useState } from "react";
import { GuildLayout } from "@/components/layout";
import { useThemes } from "@/hooks/useApi";
import { useAuth } from "@/hooks";
import { BookOpen, Clock, ChevronRight, Filter } from "lucide-react";
import { SkeletonCard, Badge, Tabs, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const gradeColors = [
  "from-cyan-500 to-blue-600",
  "from-green-500 to-emerald-600",
  "from-amber-500 to-orange-600",
  "from-purple-500 to-violet-600",
  "from-rose-500 to-pink-600",
  "from-teal-500 to-cyan-600",
  "from-indigo-500 to-blue-600",
  "from-red-500 to-orange-600",
];

export default function ThemesPage() {
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(user?.grade || null);
  const { data, loading } = useThemes(selectedGrade || undefined);
  const themes = data?.themes || [];

  const uniqueGrades = [...new Set(themes.map((t: any) => t.grade))].sort();

  return (
    <GuildLayout
      title="Themes"
      guildName="Arizen Homeschool"
      totalXp={user?.totalXp || 0}
      streak={user?.currentStreak || 0}
      grade={user?.grade || 5}
    >
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="heading-lg mb-1">Explore Themes</h2>
          <p className="text-body">Each theme connects multiple subjects around a big question.</p>
        </div>

        {/* Grade filter */}
        {uniqueGrades.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-text-muted" />
            <button
              onClick={() => setSelectedGrade(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                !selectedGrade ? "bg-primary text-white" : "bg-surface-sunken text-text-muted hover:text-text"
              )}
            >
              All Grades
            </button>
            {uniqueGrades.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                  selectedGrade === g ? "bg-primary text-white" : "bg-surface-sunken text-text-muted hover:text-text"
                )}
              >
                Grade {g}
              </button>
            ))}
          </div>
        )}

        {/* Themes grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : themes.length === 0 ? (
          <EmptyState
            icon="book"
            title="No themes yet"
            description="Content is being prepared. Check back soon!"
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {themes.map((theme: any, idx: number) => {
              const color = gradeColors[idx % gradeColors.length];
              return (
                <a
                  key={theme.id}
                  href={`/theme/${theme.slug}`}
                  className="group bg-surface-raised rounded-2xl border border-border overflow-hidden hover:shadow-card-hover hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`h-36 bg-gradient-to-br ${color} p-6 flex flex-col justify-end`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge size="sm">{`Grade ${theme.grade}`}</Badge>
                      <Badge size="sm" variant="default">
                        <Clock className="w-3 h-3 mr-1" />
                        {theme.durationWeeks}w
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{theme.title}</h3>
                    {theme.drivingQuestion && (
                      <p className="text-sm text-white/80 line-clamp-1">{theme.drivingQuestion}</p>
                    )}
                  </div>
                  <div className="p-5 space-y-4">
                    {theme.description && (
                      <p className="text-sm text-text-muted line-clamp-2">{theme.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {theme.subjects?.slice(0, 4).map((s: string) => (
                        <span key={s} className="text-xs font-medium bg-surface-sunken text-text-muted rounded-full px-2.5 py-0.5">
                          {s.replace(/_/g, " ")}
                        </span>
                      ))}
                      {theme.subjects?.length > 4 && (
                        <span className="text-xs font-medium text-text-muted">+{theme.subjects.length - 4}</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-muted">{theme.questsCount || 0} quests</span>
                        <span className="font-semibold text-text">{theme.progress || 0}% complete</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${theme.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-primary group-hover:text-primary-dark transition-colors">
                      Explore Theme <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </GuildLayout>
  );
}
