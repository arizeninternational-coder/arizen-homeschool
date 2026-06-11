"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Heart, Trophy, Flame, ArrowRight,
  CheckCircle2, Circle, CalendarDays, Star, Swords, Target
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CoinPill, StreakPill, XpPill, ProgressBar } from "@/components/ui/Pill";

export const dynamic = "force-dynamic";

const EQ_EMOTIONS = [
  { key: "HAPPY", label: "Happy", emoji: "😀", bg: "bg-amber-100 hover:bg-amber-200 border-amber-200" },
  { key: "CALM", label: "Calm", emoji: "😌", bg: "bg-teal-100 hover:bg-teal-200 border-teal-200" },
  { key: "CURIOUS", label: "Curious", emoji: "🤔", bg: "bg-blue-100 hover:bg-blue-200 border-blue-200" },
  { key: "OKAY", label: "Okay", emoji: "😐", bg: "bg-slate-100 hover:bg-slate-200 border-slate-200" },
  { key: "SAD", label: "Sad", emoji: "😢", bg: "bg-pink-100 hover:bg-pink-200 border-pink-200" },
  { key: "WORRIED", label: "Worried", emoji: "😟", bg: "bg-purple-100 hover:bg-purple-200 border-purple-200" },
  { key: "FRUSTRATED", label: "Frustrated", emoji: "😡", bg: "bg-orange-100 hover:bg-orange-200 border-orange-200" },
  { key: "TIRED", label: "Tired", emoji: "😴", bg: "bg-yellow-100 hover:bg-yellow-200 border-yellow-200" },
];

// Deduplicate lessons by subject for daily plan
function deduplicateBySubject(lessons: any[], maxPerDay: number): any[] {
  const seen = new Set<string>();
  const result: any[] = [];
  for (const lesson of lessons) {
    const subject = lesson.subject || "General";
    if (!seen.has(subject)) {
      seen.add(subject);
      result.push(lesson);
      if (result.length >= maxPerDay) break;
    }
  }
  return result;
}

// Build weekly schedule from lessons
function buildWeeklySchedule(allLessons: any[]): Record<number, any[]> {
  const schedule: Record<number, any[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] }; // Mon-Fri
  const subjectTracker: Record<number, Set<string>> = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() };
  
  for (const lesson of allLessons) {
    const subject = lesson.subject || "General";
    // Find the first day that doesn't have this subject yet
    for (let day = 0; day < 5; day++) {
      if (!subjectTracker[day].has(subject) && schedule[day].length < 6) {
        schedule[day].push(lesson);
        subjectTracker[day].add(subject);
        break;
      }
    }
  }
  return schedule;
}

// Get current week's Monday-Sunday
function getCurrentWeek(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function getDayName(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short" });
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
  const currentStreak = s.streak || 0;
  const completedLessons = s.lessonsCompleted || 0;
  const badgeCount = s.badges || 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // All published lessons
  const allLessons = data.lessons?.lessons || [];
  
  // Today's lessons: deduplicated by subject, max 5
  const todayLessons = deduplicateBySubject(allLessons, 5);
  const todayCompleted = todayLessons.filter((l: any) => l.progress?.completedAt).length;
  
  // Weekly schedule
  const weeklySchedule = buildWeeklySchedule(allLessons);
  const weekDays = getCurrentWeek();
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Mon=0
  
  // Weekly streak strip
  const streakDays = weekDays.map((d, i) => {
    const isTodayDay = isToday(d);
    const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
    const isWeekend = i >= 5;
    const dayLessons = weeklySchedule[i] || [];
    const dayCompleted = dayLessons.filter((l: any) => l.progress?.completedAt).length;
    const isActive = dayCompleted > 0;
    return { date: d, dayName: getDayName(d), isToday: isTodayDay, isPast, isWeekend, isActive, completed: dayCompleted, total: dayLessons.length };
  });

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
    <div className="space-y-5">
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
          <StreakPill count={currentStreak} size="sm" />
          <XpPill amount={totalXp} size="sm" />
        </div>
      </div>

      {/* ── Weekly Streak Strip ── */}
      <div className="rounded-2xl border border-orange-200/60 bg-gradient-to-r from-orange-50/80 to-amber-50/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-500" />
            <span className="text-xs font-extrabold text-orange-700">This Week</span>
          </div>
          <span className="text-[10px] font-bold text-orange-600">{currentStreak}-day streak 🔥</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {streakDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className={cn(
                "text-[9px] font-bold uppercase mb-1",
                day.isToday ? "text-primary" : day.isWeekend ? "text-text-muted/50" : "text-text-muted"
              )}>
                {day.dayName}
              </span>
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold border-2 transition-all",
                day.isToday ? "bg-primary text-white border-primary shadow-md" :
                day.isActive ? "bg-secondary text-white border-secondary" :
                day.isPast && !day.isWeekend ? "bg-red-50 text-red-400 border-red-200" :
                day.isWeekend ? "bg-slate-50 text-slate-300 border-slate-100" :
                "bg-white text-slate-400 border-slate-200"
              )}>
                {day.isToday ? "★" : day.isActive ? "✓" : day.isWeekend ? "—" : day.isPast ? "○" : String(i + 1)}
              </div>
              {day.isToday && <span className="text-[8px] font-bold text-primary mt-0.5">Today</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Today's Learning Plan ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-primary" />
            <h2 className="text-sm font-extrabold text-text">Today's Learning Plan</h2>
          </div>
          <span className="text-[10px] font-bold text-text-muted bg-primary/10 px-2 py-0.5 rounded-full">
            {todayCompleted}/{todayLessons.length} done
          </span>
        </div>

        {todayLessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 p-6 text-center">
            <BookOpen className="w-8 h-8 text-primary/30 mx-auto mb-2" />
            <p className="text-sm font-bold text-text-muted">No lessons scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-2">
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
                    "group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:shadow-md",
                    isCompleted ? "border-secondary/20 bg-secondary/5" : "border-primary/10 bg-white hover:border-primary/20"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    isCompleted ? "bg-secondary/20" : "bg-primary/10"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-secondary" />
                    ) : (
                      <BookOpen size={18} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-text truncate">{lesson.title}</p>
                    <p className="text-[10px] font-semibold text-text-muted">{subjectName}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isCompleted ? (
                      <span className="text-[9px] font-extrabold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Done</span>
                    ) : (
                      <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                        Start <ArrowRight size={10} />
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── EQ Check-in (Prominent) ── */}
      <div className="rounded-2xl border border-pink-200/60 bg-gradient-to-r from-pink-50/80 to-rose-50/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={18} className="text-pink" />
          <h2 className="text-sm font-extrabold text-text">How are you feeling today?</h2>
        </div>
        {checkinLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-pink/20 border-t-pink spinner" />
            <span className="text-xs text-text-muted">Loading...</span>
          </div>
        ) : checkin ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">{EQ_EMOTIONS.find(e => e.key === checkin.emotion)?.emoji || "😊"}</span>
            <div>
              <p className="text-base font-extrabold text-pink">{checkin.emotionLabel || checkin.emotion}</p>
              <p className="text-[10px] text-text-muted">Tap below to change</p>
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 mt-3">
          {EQ_EMOTIONS.map(({ key, label, emoji, bg }) => (
            <button
              key={key}
              onClick={() => submitCheckin(key)}
              disabled={checkinSaving}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50",
                bg,
                checkin?.emotion === key ? "ring-2 ring-pink ring-offset-1" : ""
              )}
            >
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Progress Today (compact) ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-accent-purple/10 bg-accent-purple/5 p-3 text-center">
          <Trophy size={14} className="text-accent-purple mx-auto mb-1" />
          <p className="text-base font-extrabold text-accent-purple">{badgeCount}</p>
          <p className="text-[9px] font-bold text-text-muted">Badges</p>
        </div>
        <div className="rounded-xl border border-pink/10 bg-pink/5 p-3 text-center">
          <Swords size={14} className="text-pink mx-auto mb-1" />
          <p className="text-base font-extrabold text-pink">{s.questsCompleted || 0}/{s.totalQuests || 0}</p>
          <p className="text-[9px] font-bold text-text-muted">Quests</p>
        </div>
        <div className="rounded-xl border border-accent-blue/10 bg-accent-blue/5 p-3 text-center">
          <Target size={14} className="text-accent-blue mx-auto mb-1" />
          <p className="text-base font-extrabold text-accent-blue">{completedLessons}</p>
          <p className="text-[9px] font-bold text-text-muted">Done</p>
        </div>
      </div>

      {/* ── My Subjects ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-text">My Subjects</h2>
          <Link href="/dashboard/student/subjects" className="text-[10px] font-bold text-primary">View All →</Link>
        </div>
        {(data.lessons?.subjects || []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary/20 p-4 text-center">
            <BookOpen className="w-6 h-6 text-primary/30 mx-auto mb-1" />
            <p className="text-xs text-text-muted">Loading subjects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {(data.lessons?.subjects || []).slice(0, 8).map((subject: string, i: number) => (
              <Link key={subject} href="/dashboard/student/subjects" className="block">
                <div className="rounded-xl border border-primary/10 bg-white p-3 text-center hover:border-primary/20 hover:shadow-sm transition-all">
                  <p className="text-xs font-extrabold text-text truncate">{subject}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
