"use client";
import { useState, useEffect } from "react";
import { GuildLayout } from "@/components/layout";
import { useLesson } from "@/hooks/useApi";
import { useAuth } from "@/hooks";
import { LessonViewer } from "@/components/lesson";
import { SkeletonCard } from "@/components/ui";

export default function LessonPlayerPage({ params }: { params: Promise<{ themeSlug: string; questSlug: string; lessonSlug: string }> }) {
  const { user } = useAuth();
  const [slugs, setSlugs] = useState<{ themeSlug: string; questSlug: string; lessonSlug: string } | null>(null);
  const { data, loading, refetch } = useLesson(slugs?.lessonSlug || null);
  const lesson = data?.lesson;
  const [showViewer, setShowViewer] = useState(false);
  useEffect(() => { params.then(setSlugs); }, [params]);

  if (loading) return (
    <GuildLayout title="Loading..." guildName="Arizen Homeschool" grade={user?.grade || 5}>
      <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
    </GuildLayout>
  );

  if (!lesson) return (
    <GuildLayout title="Not Found" guildName="Arizen Homeschool" grade={user?.grade || 5}>
      <div className="text-center py-12"><p className="text-text-muted">Lesson not found.</p></div>
    </GuildLayout>
  );

  if (showViewer) return (
    <LessonViewer
      lesson={{ id: lesson.id, title: lesson.title, description: lesson.description, contentBlocks: lesson.contentBlocks || [], xpReward: lesson.xpReward || { base: 50 }, estimatedDurationMinutes: lesson.estimatedDurationMinutes, progress: lesson.progress || 0, isCompleted: lesson.isCompleted || false }}
      questTitle={lesson.quest?.title || ""} themeSlug={slugs?.themeSlug || ""} questSlug={slugs?.questSlug || ""}
      onClose={() => setShowViewer(false)} onComplete={() => refetch()}
    />
  );

  return (
    <GuildLayout title={lesson.title} guildName="Arizen Homeschool" grade={user?.grade || 5}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-surface-raised rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold bg-primary/10 text-primary rounded-full px-2.5 py-0.5">{lesson.quest?.theme?.title || "Lesson"}</span>
            {lesson.isCompleted && <span className="text-xs font-semibold bg-success/10 text-success rounded-full px-2.5 py-0.5">Completed</span>}
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">{lesson.title}</h2>
          {lesson.description && <p className="text-text-muted">{lesson.description}</p>}
          <button onClick={() => setShowViewer(true)} className="mt-6 w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm hover:bg-primary-dark transition-colors">
            {lesson.progress > 0 ? "Continue Lesson" : "Start Lesson"}
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-amber-800">Complete to earn +{(lesson.xpReward as any)?.base || 50} XP</p>
          <span className="text-2xl">⚡</span>
        </div>
      </div>
    </GuildLayout>
  );
}
