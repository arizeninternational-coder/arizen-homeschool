"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, ChevronRight, CheckCircle2, Zap, ArrowLeft, Sparkles
} from "lucide-react";
import { PageHeader, SectionHeader, ProgressBar } from "@/components/ui/Pill";
import { BookIcon } from "@/components/ui/Illustrations";
import { cn } from "@/lib/utils/cn";

interface Quest {
  id: string;
  title: string;
  slug: string;
  description: string;
  questType?: string;
  xpReward?: { base: number } | number;
  progress: number;
  isCompleted: boolean;
  lessons?: Lesson[];
}

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

function getRewardValue(xpReward: any): number {
  if (!xpReward) return 0;
  if (typeof xpReward === "number") return xpReward;
  if (typeof xpReward === "object") return xpReward?.base || xpReward?.amount || 0;
  if (typeof xpReward === "string") {
    try { const parsed = JSON.parse(xpReward); return parsed?.base || parsed?.amount || 0; } catch { return 0; }
  }
  return 0;
}

export default function ThemeDetailPage({ params }: { params: Promise<{ themeSlug: string }> }) {
  const [themeSlug, setThemeSlug] = useState<string | null>(null);
  const [theme, setTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => {
      setThemeSlug(p.themeSlug);
      fetch(`/api/themes?slug=${encodeURIComponent(p.themeSlug)}`, { credentials: "include" })
        .then(r => {
          if (r.status === 401) { setError("Please log in to view lessons."); setLoading(false); return null; }
          if (r.status === 404) { setError("Theme not found."); setLoading(false); return null; }
          return r.json();
        })
        .then(data => {
          if (!data) return;
          if (data.error) { setError(data.error); }
          else if (data.theme) { setTheme(data.theme); }
          else { setError("Theme not found or not yet published."); }
        })
        .catch(() => setError("Unable to load lessons. Please try again."))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-4 border-accent-purple/20 border-t-accent-purple spinner" />
    </div>
  );

  if (error || !theme) return (
    <div className="text-center fade-in">
      <div className="w-16 h-16 rounded-3xl bg-bg-main flex items-center justify-center mx-auto mb-4 text-text-muted">
        <BookOpen className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-extrabold text-text mb-1">
        {error || "Theme not found"}
      </h3>
      <p className="text-sm text-text-muted mb-4">
        {error === "Please log in to view lessons."
          ? "Log in and try again."
          : "This theme may not exist or isn't published yet. Ask your admin to publish lessons."}
      </p>
      <Link
        href="/dashboard/student/subjects"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>
    </div>
  );

  const quests: Quest[] = (theme.quests || []).filter((q: any) => q.lessons && q.lessons.length > 0);
  const totalLessons = quests.reduce((sum, q) => sum + (q.lessons?.length || 0), 0);
  const completedLessons = quests.reduce((sum, q) => sum + (q.lessons?.filter((l: any) => l.isCompleted).length || 0), 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="fade-in">
      {/* ── Back link ── */}
      <Link
        href="/dashboard/student/subjects"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>

      {/* ── Decorative gradient header ── */}
      <div
        className="relative rounded-[1.75rem] p-6 lg:p-8 mb-6 overflow-hidden border border-accent-purple/20"
        style={{ background: "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 50%, #6D28D9 100%)" }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute top-4 right-20 opacity-30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="absolute bottom-6 right-8 opacity-20">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <BookIcon size={18} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 bg-white/15 px-3 py-1 rounded-full">
                {quests.length} quests
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 bg-white/15 px-3 py-1 rounded-full">
                {totalLessons} lessons
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 bg-white/15 px-3 py-1 rounded-full">
                {completedLessons}/{totalLessons} done
              </span>
            </div>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-2 tracking-tight">{theme.title}</h1>
          {theme.description && (
            <p className="text-white/85 text-sm lg:text-base leading-relaxed mb-4 max-w-2xl">{theme.description}</p>
          )}

          {/* Progress bar */}
          <div className="max-w-md">
            <div className="flex items-center justify-between text-xs font-bold text-white/70 mb-1.5">
              <span>Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/90 transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {theme.drivingQuestion && (
            <p className="mt-4 text-sm text-white/70 italic font-medium">
              ❝ {theme.drivingQuestion} ❞
            </p>
          )}
        </div>
      </div>

      {/* ── Quests Section ── */}
      <SectionHeader
        title="Quests"
        subtitle={`${quests.length} quest${quests.length !== 1 ? "s" : ""} in this theme`}
      />

      {quests.length === 0 ? (
        <div className="rounded-[1.75rem] border border-border-soft bg-white p-12 text-center">
          <p className="text-sm text-text-muted">No quests with published lessons in this theme yet. Ask your admin to publish more content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quests.map((quest, i) => (
            <QuestCard key={quest.id} quest={quest} index={i} themeSlug={theme.slug} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestCard({ quest, index, themeSlug }: { quest: Quest; index: number; themeSlug: string }) {
  const lessonCount = quest.lessons?.length || 0;
  const xpReward = getRewardValue(quest.xpReward);
  const progress = quest.progress || 0;
  const completedLessons = quest.lessons?.filter((l: any) => l.isCompleted).length || 0;

  return (
    <Link
      href={`/dashboard/student/lessons/${themeSlug}/${quest.slug}`}
      className={cn(
        "group rounded-[1.5rem] border overflow-hidden transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]",
        quest.isCompleted
          ? "border-secondary/20 bg-gradient-to-br from-secondary-soft/50 to-emerald-50"
          : "border-border-soft bg-white"
      )}
    >
      {/* Card top accent bar */}
      <div className={cn(
        "h-1 w-full",
        quest.isCompleted
          ? "bg-gradient-to-r from-secondary to-emerald-400"
          : "bg-gradient-to-r from-primary to-accent-purple"
      )} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            quest.isCompleted ? "bg-secondary-soft text-secondary" : "bg-primary-soft text-primary"
          )}>
            {quest.isCompleted
              ? <CheckCircle2 className="w-5 h-5" />
              : <span className="text-sm font-extrabold">{index + 1}</span>}
          </div>
          {quest.questType && (
            <span className={cn(
              "text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full",
              quest.questType === "MAIN" ? "bg-primary-soft text-primary" :
              quest.questType === "SIDE" ? "bg-gold-soft text-gold" :
              "bg-accent-purple-soft text-accent-purple"
            )}>
              {quest.questType}
            </span>
          )}
        </div>

        <h3 className="text-base font-extrabold text-text mb-1 group-hover:text-primary transition-colors">
          {quest.title}
        </h3>
        {quest.description && (
          <p className="text-sm text-text-muted leading-relaxed mb-3 line-clamp-2">{quest.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs font-semibold text-text-muted mb-3">
          <span>{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</span>
          {xpReward > 0 && <span className="flex items-center gap-1">🪙 {xpReward} XP</span>}
        </div>

        {/* Progress */}
        <ProgressBar
          value={completedLessons}
          max={lessonCount}
          color={quest.isCompleted ? "bg-secondary" : "bg-gradient-to-r from-primary to-accent-purple"}
          height="h-2"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] font-bold text-text-muted">
            {completedLessons}/{lessonCount} lessons
          </span>
          <span className={cn(
            "text-xs font-bold flex items-center gap-1 transition-all group-hover:gap-2",
            quest.isCompleted ? "text-secondary" : "text-primary"
          )}>
            {quest.isCompleted ? "Review" : "Start"} <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
