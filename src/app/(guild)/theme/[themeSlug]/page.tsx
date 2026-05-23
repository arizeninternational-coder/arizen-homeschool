"use client";

import { GuildLayout } from "@/components/layout";
import { useTheme } from "@/hooks/useApi";
import { useAuth } from "@/hooks";
import { Swords, Lock, CheckCircle2, Clock, Trophy, ChevronRight } from "lucide-react";
import { SkeletonListItem, Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const questTypeColors: Record<string, string> = {
  MAIN: "bg-primary/10 text-primary",
  SIDE: "bg-purple-100 text-purple-700",
  CHALLENGE: "bg-amber-100 text-amber-700",
};

export default function ThemeDetailPage({ params }: { params: Promise<{ themeSlug: string }> }) {
  const { user } = useAuth();
  const [slug, setSlug] = useState<string | null>(null);
  const { data, loading } = useTheme(slug);
  const theme = data?.theme;

  // Unwrap params
  useEffect(() => { params.then(p => setSlug(p.themeSlug)); }, [params]);

  if (loading) {
    return (
      <GuildLayout title="Loading..." guildName="Arizen Homeschool" grade={user?.grade || 5}>
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <SkeletonListItem key={i} />)}</div>
      </GuildLayout>
    );
  }

  if (!theme) {
    return (
      <GuildLayout title="Theme Not Found" guildName="Arizen Homeschool" grade={user?.grade || 5}>
        <div className="text-center py-12">
          <p className="text-text-muted">This theme doesn't exist or hasn't been published yet.</p>
        </div>
      </GuildLayout>
    );
  }

  const quests = theme.quests || [];
  const completedQuests = quests.filter((q: any) => q.isCompleted).length;
  const overallProgress = quests.length > 0
    ? Math.round((completedQuests / quests.length) * 100)
    : 0;

  return (
    <GuildLayout
      title={theme.title}
      guildName="Arizen Homeschool"
      grade={theme.grade}
    >
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Theme header */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Badge size="sm" variant="default" className="bg-white/20 text-white">Grade {theme.grade}</Badge>
            <Badge size="sm" variant="default" className="bg-white/20 text-white">
              <Clock className="w-3 h-3 mr-1" />{theme.durationWeeks} weeks
            </Badge>
          </div>
          <h2 className="text-2xl font-bold mb-2">{theme.title}</h2>
          {theme.drivingQuestion && (
            <p className="text-white/80 text-lg">{theme.drivingQuestion}</p>
          )}
          {theme.description && (
            <p className="text-white/70 mt-3">{theme.description}</p>
          )}
          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/70 mb-1">
              <span>{completedQuests}/{quests.length} quests completed</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Subjects */}
        {theme.subjects?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {theme.subjects.map((s: string) => (
              <Badge key={s} variant="primary">{s.replace(/_/g, " ")}</Badge>
            ))}
          </div>
        )}

        {/* Quests */}
        <div>
          <h3 className="heading-md mb-4">Quests</h3>
          <div className="space-y-3">
            {quests.map((quest: any) => (
              <a
                key={quest.id}
                href={`/theme/${slug}/quest/${quest.slug}`}
                className={cn(
                  "block bg-surface-raised rounded-2xl border p-4 transition-all duration-200",
                  "border-border hover:shadow-card-hover hover:border-border-strong hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {quest.isCompleted ? (
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    ) : (
                      <Swords className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5", questTypeColors[quest.questType] || "bg-surface-sunken text-text-muted")}>
                        {quest.questType}
                      </span>
                      <span className="text-xs text-text-muted">Quest {quest.orderIndex}</span>
                    </div>
                    <h3 className="font-bold text-text mb-1">{quest.title}</h3>
                    {quest.description && (
                      <p className="text-sm text-text-muted line-clamp-1">{quest.description}</p>
                    )}
                    {/* Progress bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-muted">{quest.lessonsCount || 0} lessons</span>
                        <span className="font-semibold text-text">{quest.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", quest.isCompleted ? "bg-success" : "bg-primary")}
                          style={{ width: `${quest.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      +{quest.xpReward?.base || 100} XP
                    </span>
                    <ChevronRight className="w-5 h-5 text-text-muted mt-2 ml-auto" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </GuildLayout>
  );
}

import { useState, useEffect } from "react";
