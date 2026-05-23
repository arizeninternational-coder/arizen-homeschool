"use client";

import { useState } from "react";
import { GuildLayout } from "@/components/layout";
import { useQuest } from "@/hooks/useApi";
import { useAuth } from "@/hooks";
import { CheckCircle2, Play, Clock, Trophy, BookOpen, ArrowLeft } from "lucide-react";
import { SkeletonListItem, Badge, Progress } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export default function QuestDetailPage({ params }: { params: Promise<{ themeSlug: string; questSlug: string }> }) {
  const { user } = useAuth();
  const [slugs, setSlugs] = useState<{ themeSlug: string; questSlug: string } | null>(null);
  const { data, loading } = useQuest(slugs?.questSlug || null);
  const quest = data?.quest;

  useEffect(() => { params.then(setSlugs); }, [params]);

  if (loading) {
    return (
      <GuildLayout title="Loading..." guildName="Arizen Homeschool" grade={user?.grade || 5}>
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonListItem key={i} />)}</div>
      </GuildLayout>
    );
  }

  if (!quest) {
    return (
      <GuildLayout title="Quest Not Found" guildName="Arizen Homeschool" grade={user?.grade || 5}>
        <div className="text-center py-12"><p className="text-text-muted">This quest doesn't exist yet.</p></div>
      </GuildLayout>
    );
  }

  const lessons = quest.lessons || [];
  const completedLessons = lessons.filter((l: any) => l.isCompleted).length;

  return (
    <GuildLayout title={quest.title} guildName="Arizen Homeschool" grade={quest.theme?.grade || user?.grade || 5}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Quest header */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
          <a href={`/theme/${slugs?.themeSlug}`} className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to {quest.theme?.title || "Theme"}
          </a>
          <div className="flex items-center gap-2 mb-2">
            <Badge size="sm" className="bg-white/20 text-white">{quest.questType}</Badge>
            <Badge size="sm" className="bg-white/20 text-white">
              <Trophy className="w-3 h-3 mr-1" />+{quest.xpReward?.base || 100} XP
            </Badge>
          </div>
          <h2 className="text-2xl font-bold mb-2">{quest.title}</h2>
          {quest.description && <p className="text-white/80">{quest.description}</p>}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/70 mb-1">
              <span>{completedLessons}/{lessons.length} lessons</span>
              <span>{quest.progress || 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${quest.progress || 0}%` }} />
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div>
          <h3 className="heading-md mb-4">Lessons</h3>
          <div className="space-y-3">
            {lessons.map((lesson: any, idx: number) => (
              <a
                key={lesson.id}
                href={`/theme/${slugs?.themeSlug}/quest/${slugs?.questSlug}/lesson/${lesson.slug}`}
                className="block bg-surface-raised rounded-2xl border border-border p-4 hover:shadow-card-hover hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {lesson.isCompleted ? (
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{idx + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text">{lesson.title}</h4>
                    {lesson.description && (
                      <p className="text-sm text-text-muted line-clamp-1 mt-0.5">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {lesson.contentBlocks?.length || 0} blocks
                      </span>
                      {lesson.estimatedDurationMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.estimatedDurationMinutes} min
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-600">+{lesson.xpReward?.base || 50} XP</span>
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Side Quests */}
        {quest.sideQuests?.length > 0 && (
          <div>
            <h3 className="heading-md mb-4">Side Quests</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {quest.sideQuests.map((sq: any) => (
                <div key={sq.id} className="bg-surface-raised rounded-2xl border border-border p-4">
                  <Badge size="sm" variant="purple" className="mb-2">{sq.sideQuestType}</Badge>
                  <h4 className="font-semibold text-text">{sq.title}</h4>
                  <span className="text-xs font-bold text-amber-600 mt-1 block">+{sq.xpReward?.base || 75} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GuildLayout>
  );
}
