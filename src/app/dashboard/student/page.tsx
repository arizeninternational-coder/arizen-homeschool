"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen, Heart, Trophy, ArrowRight, Sparkles,
  CheckCircle2, Circle, CalendarDays, Star, Swords, Target, Flame, Zap
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const EQ_EMOTIONS = [
  { key: "HAPPY", label: "Happy", emoji: "😀", msg: "Wonderful! Let's make today sparkle.", anim: "eq-confetti" },
  { key: "CALM", label: "Calm", emoji: "😌", msg: "Peaceful. A great way to begin.", anim: "eq-breathe" },
  { key: "CURIOUS", label: "Curious", emoji: "🤔", msg: "Love that curiosity! Let's explore.", anim: "eq-sparkle" },
  { key: "OKAY", label: "Okay", emoji: "😐", msg: "That's fine. We'll take it step by step.", anim: "eq-bounce" },
  { key: "SAD", label: "Sad", emoji: "😢", msg: "Thanks for sharing. We can take today gently.", anim: "eq-heart" },
  { key: "WORRIED", label: "Worried", emoji: "😟", msg: "Feeling worried is okay. Let's start gently.", anim: "eq-pulse" },
  { key: "FRUSTRATED", label: "Frustrated", emoji: "😡", msg: "Let's take a breath. You've got this.", anim: "eq-cool" },
  { key: "TIRED", label: "Tired", emoji: "😴", msg: "Rest is important. Let's go at your pace.", anim: "eq-moon" },
];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  Mathematics: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", gradient: "from-indigo-500 to-blue-500" },
  English: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", gradient: "from-emerald-500 to-teal-500" },
  Kiswahili: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", gradient: "from-amber-500 to-orange-500" },
  "Environmental Activities": { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", gradient: "from-green-500 to-emerald-500" },
  "Hygiene and Nutrition": { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", gradient: "from-teal-500 to-cyan-500" },
  "Movement and Creative Activities": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", gradient: "from-rose-500 to-pink-500" },
  "English Language Activities": { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", gradient: "from-violet-500 to-purple-500" },
};

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", gradient: "from-slate-500 to-gray-500" };
}

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
  const [animatingEmotion, setAnimatingEmotion] = useState<string | null>(null);

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

  const submitCheckin = useCallback(async (emotion: string) => {
    setCheckinSaving(true);
    setAnimatingEmotion(emotion);
    try {
      const res = await fetch("/api/learner/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ emotion }),
      });
      if (res.ok) { const json = await res.json(); setCheckin(json.checkin || { emotion, emotionLabel: emotion.charAt(0) + emotion.slice(1).toLowerCase() }); }
    } catch { }
    finally {
      setCheckinSaving(false);
      setTimeout(() => setAnimatingEmotion(null), 1200);
    }
  }, []);

  const s = data.summary || {};
  const studentName = s.displayName || "Learner";
  const grade = s.grade || "";
  const totalXp = s.xp || 0;
  const coins = s.coins || 0;
  const completedLessonsCount = s.lessonsCompleted || 0;
  const badgeCount = s.badges || 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const motivational = hour < 12 ? "Ready to learn something new?" : hour < 17 ? "Keep up the great work!" : "Let's finish the day strong!";

  const allLessons = data.lessons?.lessons || [];
  const todayLessons = deduplicateBySubject(allLessons, 5);
  const todayCompleted = todayLessons.filter((l: any) => l.progress?.completedAt).length;
  const subjects = data.lessons?.subjects || [];
  const initials = studentName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

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

  const selectedEmotion = EQ_EMOTIONS.find(e => e.key === checkin?.emotion);
  const isAnimating = animatingEmotion !== null;
  const animClass = isAnimating ? `eq-anim-${animatingEmotion?.toLowerCase()}` : "";

  return (
    <div className="space-y-3">
      {/* ── Header: Greeting + Learner Card ── */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-4 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <span className="text-sm font-extrabold">{initials}</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">{greeting}, {studentName}! 👋</h1>
              <p className="text-white/80 text-xs font-semibold">{grade ? `Grade ${grade} • ` : ""}{motivational}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Zap size={12} className="text-amber-300" />
              <span className="text-xs font-extrabold">{coins}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Star size={12} className="text-amber-300" />
              <span className="text-xs font-extrabold">{totalXp}</span>
            </div>
          </div>
        </div>
        {/* Mini progress */}
        <div className="relative flex items-center gap-4 mt-3 pt-3 border-t border-white/15">
          <div className="flex items-center gap-1.5">
            <Trophy size={12} className="text-amber-300" />
            <span className="text-[10px] font-bold text-white/90">{badgeCount} badges</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-300" />
            <span className="text-[10px] font-bold text-white/90">{completedLessonsCount} lessons done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target size={12} className="text-blue-300" />
            <span className="text-[10px] font-bold text-white/90">{todayCompleted}/{todayLessons.length} today</span>
          </div>
        </div>
      </div>

      {/* ── EQ Check-in (compact, warm) ── */}
      <div className={cn(
        "rounded-2xl bg-gradient-to-r from-pink-50/80 to-rose-50/60 border border-pink-200/50 p-3 transition-all duration-300 relative overflow-hidden",
        isAnimating && "eq-anim-active"
      )}>
        {/* Animation overlay */}
        {isAnimating && (
          <div className={cn("absolute inset-0 pointer-events-none z-10", animClass)} />
        )}
        <div className="relative z-20">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={14} className="text-pink" />
            <h2 className="text-xs font-extrabold text-text">How are you feeling today?</h2>
          </div>
          {checkinLoading ? (
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full border-2 border-pink/20 border-t-pink spinner" /><span className="text-[10px] text-text-muted">Loading...</span></div>
          ) : checkin && selectedEmotion ? (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg eq-emoji-bounce">{selectedEmotion.emoji}</span>
              <div>
                <span className="text-xs font-extrabold text-pink">{selectedEmotion.label}</span>
                <p className="text-[10px] text-pink-600/80">{selectedEmotion.msg}</p>
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-1">
            {EQ_EMOTIONS.map(({ key, label, emoji }) => (
              <button key={key} onClick={() => submitCheckin(key)} disabled={checkinSaving}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer active:scale-95 disabled:opacity-50",
                  checkin?.emotion === key
                    ? "bg-pink-200 border-pink-300 text-pink-800 ring-1 ring-pink-400"
                    : "bg-white border-pink-100 text-pink-700 hover:bg-pink-50"
                )}>
                <span className="text-xs">{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
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
          <div className={cn(
            "grid gap-2",
            todayLessons.length <= 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          )}>
            {todayLessons.map((lesson: any, i: number) => {
              const isCompleted = lesson.progress?.completedAt != null;
              const themeSlug = lesson.quest?.theme?.slug || "";
              const questSlug = lesson.quest?.slug || "";
              const lessonSlug = lesson.slug || "";
              const lessonHref = (themeSlug && questSlug && lessonSlug)
                ? `/dashboard/student/lessons/${themeSlug}/${questSlug}/${lessonSlug}`
                : "/dashboard/student/lessons";
              const subjectName = lesson.subject || "Lesson";
              const colors = getSubjectColor(subjectName);

              return (
                <Link
                  key={lesson.id || i}
                  href={lessonHref}
                  className={cn(
                    "group relative rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
                    isCompleted ? "border-secondary/20 bg-secondary/5" : "border-white bg-white"
                  )}
                >
                  {/* Subject color accent bar */}
                  <div className={cn("h-1.5 w-full bg-gradient-to-r", colors.gradient)} />
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        colors.bg, colors.text
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
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── My Subjects ── */}
      {subjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-extrabold text-text">My Subjects</h2>
            <Link href="/dashboard/student/subjects" className="text-[10px] font-bold text-primary">View All →</Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {subjects.slice(0, 7).map((subject: string) => {
              const colors = getSubjectColor(subject);
              return (
                <Link key={subject} href="/dashboard/student/subjects">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors",
                    colors.bg, colors.text, colors.border, "hover:opacity-80"
                  )}>
                    {subject}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
