"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight, CheckCircle2, Zap, ArrowLeft, Target
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
  xpReward?: { base: number } | number;
  progress: number;
  isCompleted: boolean;
}

export default function QuestDetailPage({ params }: { params: Promise<{ themeSlug: string; questSlug: string }> }) {
  const [slugs, setSlugs] = useState<{ themeSlug: string; questSlug: string } | null>(null);
  const [quest, setQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => {
      setSlugs(p);
      fetch(`/api/quests/${p.questSlug}?slug=${p.questSlug}`)
        .then(r => r.json())
        .then(data => setQuest(data.quest))
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm font-bold text-text-muted">Loading quest...</p>
      </div>
    </div>
  );
  if (!quest) return (
    <div className="text-center py-12">
      <Target className="w-9 h-9 text-text-muted mx-auto mb-3 opacity-40" />
      <h3 className="text-lg font-extrabold text-text mb-1">Quest not found</h3>
      <p className="text-sm text-text-muted mb-4">This quest may not exist or isn't published yet.</p>
      <Link href="/dashboard/student/lessons" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition-colors">
        ← Back to Themes
      </Link>
    </div>
  );

  const lessons: Lesson[] = quest.lessons || [];
  const completedCount = lessons.filter((l: Lesson) => l.isCompleted).length;
  const xpReward = typeof quest.xpReward === "object" ? (quest.xpReward as any)?.base : quest.xpReward;

  return (
    <>
      <Link href={slugs ? `/dashboard/student/lessons/${slugs.themeSlug}` : "/dashboard/student/lessons"} className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text mb-3 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Theme
      </Link>

      <div className="rounded-2xl p-5 lg:p-6 mb-6 bg-gradient-to-br from-primary to-accent-purple text-white shadow-[0_12px_35px_rgba(79,70,229,0.15)]">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {quest.questType && (
            <span className="text-[10px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">{quest.questType}</span>
          )}
          {quest.isCompleted && (
            <span className="text-[10px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">✓ COMPLETED</span>
          )}
        </div>
        <h1 className="text-xl lg:text-2xl font-extrabold mb-2">{quest.title}</h1>
        {quest.description && <p className="text-white/90 text-sm mb-3 leading-relaxed">{quest.description}</p>}
        <div className="flex gap-4 text-xs text-white/85 flex-wrap font-semibold">
          <span>{lessons.length} lessons</span>
          <span>{completedCount}/{lessons.length} completed</span>
          {xpReward > 0 && (
            <span className="inline-flex items-center gap-1">
              <Zap className="w-3 h-3" /> +{xpReward} XP
            </span>
          )}
        </div>
        {quest.progress !== undefined && (
          <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white/90 transition-all duration-500" style={{ width: `${quest.progress}%` }} />
          </div>
        )}
      </div>

      <h2 className="text-lg font-extrabold text-text mb-4">Lessons</h2>

      {lessons.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white text-center p-8">
          <p className="text-sm text-text-muted">No lessons available in this quest yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {lessons.map((lesson: Lesson, i: number) => (
            <LessonCard key={lesson.id} lesson={lesson} index={i} themeSlug={slugs?.themeSlug || ""} questSlug={slugs?.questSlug || ""} />
          ))}
        </div>
      )}
    </>
  );
}

function LessonCard({ lesson, index, themeSlug, questSlug }: { lesson: Lesson; index: number; themeSlug: string; questSlug: string }) {
  const xp = typeof lesson.xpReward === "object" ? (lesson.xpReward as any)?.base : lesson.xpReward;

  return (
    <Link href={`/dashboard/student/lessons/${themeSlug}/${questSlug}/${lesson.slug}`} className="rounded-2xl border border-white/60 bg-white p-4 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 no-underline group">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        lesson.isCompleted ? "bg-secondary-soft" : lesson.progress > 0 ? "bg-primary-soft" : "bg-bg-main"
      }`}>
        {lesson.isCompleted ? (
          <CheckCircle2 className="w-[18px] h-[18px] text-secondary" />
        ) : (
          <span className="text-xs font-extrabold text-text-muted">{index + 1}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-bold text-text text-sm group-hover:text-primary transition-colors">{lesson.title}</span>
        {lesson.description && <p className="text-xs text-text-muted mt-0.5 truncate">{lesson.description}</p>}
      </div>
      {lesson.progress > 0 && !lesson.isCompleted && (
        <span className="text-[10px] font-bold text-primary flex-shrink-0">{lesson.progress}%</span>
      )}
      {xp ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold bg-gold-soft/50 px-2 py-0.5 rounded-lg flex-shrink-0">
          <Zap className="w-2.5 h-2.5" /> +{xp}
        </span>
      ) : null}
      <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0 group-hover:text-primary transition-colors" />
    </Link>
  );
}
