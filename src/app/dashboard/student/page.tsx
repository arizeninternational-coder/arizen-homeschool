"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Heart, Trophy, ArrowRight,
  CheckCircle2, Circle, CalendarDays, Star, Swords, Target, Flame
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CoinPill, XpPill } from "@/components/ui/Pill";

export const dynamic = "force-dynamic";

const EQ_EMOTIONS = [
  { key: "HAPPY", label: "Happy", emoji: "😀" },
  { key: "CALM", label: "Calm", emoji: "😌" },
  { key: "CURIOUS", label: "Curious", emoji: "🤔" },
  { key: "OKAY", label: "Okay", emoji: "😐" },
  { key: "SAD", label: "Sad", emoji: "😢" },
  { key: "WORRIED", label: "Worried", emoji: "😟" },
  { key: "FRUSTRATED", label: "Frustrated", emoji: "😡" },
  { key: "TIRED", label: "Tired", emoji: "😴" },
];

function deduplicateBySubject(lessons: any[], max: number): any[] {
  const seen = new Set<string>();
  const result: any[] = [];
  for (const lesson of lessons) {
    const subject = lesson.subject || "General";
    if (!seen.has(subject)) {
      seen.add(subject);
      result.push(lesson);
      if (result.length >= max) break;
    }
  }
  return result;
}

export default function StudentDashboard() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [checkin, setCheckin] = useState<{ emotion: string; emotionLabel: string } | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(true);
  const [checkinSaving, setCheckinSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, lessonRes] = await Promise.all([
          fetch("/api/learner/progress/summary", { credentials: "include" }),
          fetch("/api/learner/lessons", { credentials: "include" }),
        ]);
        const summary = await summaryRes.json();
        const lessons = await lessonRes.json();
        setData({ summary, lessons: lessons || {} });
      } catch (e) { console.error("[DASHBOARD] Error:", e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadCheckin() {
      try {
        const res = await fetch("/api/learner/checkin", { credentials: "include" });
        if (res.ok) { const json = await res.json(); setCheckin(json.checkin || null); }
      } catch { } finally { setCheckinLoading(false); }
    }
    loadCheckin();
  }, []);

  async function submitCheckin(emotion: string) {
    setCheckinSaving(true);
    try {
      const res = await fetch("/api/learner/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ emotion }),
      });
      if (res.ok) { const json = await res.json(); setCheckin(json.checkin || { emotion, emotionLabel: emotion.charAt(0) + emotion.slice(1).toLowerCase() }); }
    } catch { } finally { setCheckinSaving(false); }
  }

  const s = data.summary || {};
  const studentName = s.displayName || "Learner";
  const grade = s.grade || "";
  const totalXp = s.xp || 0;
  const coins = s.coins || 0;
  const completedLessonsCount = s.lessonsCompleted || 0;
  const badgeCount = s.badges || 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const allLessons = data.lessons?.lessons || [];
  const todayLessons = deduplicateBySubject(allLessons, 5);
  const todayCompleted = todayLessons.filter((l: any) => l.progress?.completedAt).length;
  const subjects = data.lessons?.subjects || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm font-bold text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Greeting ── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-text tracking-tight">
            {greeting}, {studentName}! <span className="inline-block wiggle">👋</span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {grade ? `Grade ${grade}` : ""} • Let's make today amazing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CoinPill coins={coins} size="sm" />
          <XpPill amount={totalXp} size="sm" />
        </div>
      </div>

      {/* ── EQ Check-in (compact, warm, before learning plan) ── */}
      <div className="rounded-2xl bg-gradient-to-r from-pink-50/80 to-rose-50/60 border border-pink-200/50 p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={16} className="text-pink" />
              <h2 className="text-sm font-extrabold text-text">How are you feeling today?</h2>
            </div>
            {checkinLoading ? (
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full border-2 border-pink/20 border-t-pink spinner" /><span className="text-[10px] text-text-muted">Loading...</span></div>
            ) : checkin ? (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{EQ_EMOTIONS.find(e => e.key === checkin.emotion)?.emoji || "😊"}</span>
                <span className="text-sm font-extrabold text-pink">{checkin.emotionLabel || checkin.emotion}</span>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              {EQ_EMOTIONS.map(({ key, label, emoji }) => (
                <button key={key} onClick={() => submitCheckin(key)} disabled={checkinSaving}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer active:scale-95 disabled:opacity-50",
                    checkin?.emotion === key
                      ? "bg-pink-200 border-pink-300 text-pink-800 ring-1 ring-pink-400"
                      : "bg-white border-pink-100 text-pink-700 hover:bg-pink-50"
                  )}>
                  <span className="text-sm">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-pink-100/50 flex-shrink-0">
            <Heart size={24} className="text-pink/40" />
          </div>
        </div>
      </div>

      {/* ── Today's Learning Plan ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-primary" />
            <h2 className="text-sm font-extrabold text-text">Today's Learning Plan</h2>
          </div>
          <span className="text-[10px] font-bold text-text-muted bg-primary/10 px-2 py-0.5 rounded-full">
            {todayCompleted}/{todayLessons.length}
          </span>
        </div>

        {todayLessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 p-6 text-center">
            <BookOpen className="w-8 h-8 text-primary/30 mx-auto mb-2" />
            <p className="text-sm font-bold text-text-muted">No lessons scheduled for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            {todayLessons.map((lesson: any, i: number) => {
              const isCompleted = lesson.progress?.completedAt != null;
              const themeSlug = lesson.quest?.theme?.slug || "";
              const questSlug = lesson.quest?.slug || "";
              const lessonSlug = lesson.slug || "";
              const lessonHref = (themeSlug && questSlug && lessonSlug)
                ? `/dashboard/student/lessons/${themeSlug}/${questSlug}/${lessonSlug}`
                : "/dashboard/student/lessons";
              const subjectName = lesson.subject || "Lesson";

              return (
                <Link
                  key={lesson.id || i}
                  href={lessonHref}
                  className={cn(
                    "group relative rounded-xl border p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                    isCompleted ? "border-secondary/20 bg-secondary/5" : "border-primary/10 bg-white hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                      isCompleted ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                    )}>
                      {subjectName}
                    </span>
                    {isCompleted && <CheckCircle2 size={14} className="text-secondary" />}
                  </div>
                  <p className="text-xs font-extrabold text-text leading-tight line-clamp-2 mb-2">{lesson.title}</p>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[10px] font-bold flex items-center gap-0.5",
                      isCompleted ? "text-secondary" : "text-primary"
                    )}>
                      {isCompleted ? "✓ Done" : "Start →"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Compact Progress Strip ── */}
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
        <div className="flex items-center gap-1.5 flex-1">
          <Trophy size={14} className="text-accent-purple" />
          <span className="text-xs font-bold text-text">{badgeCount} badges</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 flex-1">
          <Swords size={14} className="text-pink" />
          <span className="text-xs font-bold text-text">{completedLessonsCount} done</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 flex-1">
          <Star size={14} className="text-amber-500" />
          <span className="text-xs font-bold text-text">{totalXp} XP</span>
        </div>
      </div>

      {/* ── My Subjects ── */}
      {subjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-extrabold text-text">My Subjects</h2>
            <Link href="/dashboard/student/subjects" className="text-[10px] font-bold text-primary">View All →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.slice(0, 7).map((subject: string) => (
              <Link key={subject} href="/dashboard/student/subjects">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                  {subject}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
