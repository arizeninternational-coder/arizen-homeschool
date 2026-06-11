"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen, Heart, Trophy, ArrowRight, Sparkles,
  CheckCircle2, Circle, CalendarDays, Star, Target, Zap, Clock
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const EQ_EMOTIONS = [
  { key: "HAPPY", label: "Happy", emoji: "😀", msg: "Wonderful! Let's make today sparkle.", glow: "rgba(251,191,36,0.25)" },
  { key: "CALM", label: "Calm", emoji: "😌", msg: "Peaceful. A great way to begin.", glow: "rgba(20,184,166,0.2)" },
  { key: "CURIOUS", label: "Curious", emoji: "🤔", msg: "Love that curiosity! Let's explore.", glow: "rgba(59,130,246,0.2)" },
  { key: "OKAY", label: "Okay", emoji: "😐", msg: "That's fine. We'll take it step by step.", glow: "rgba(148,163,184,0.2)" },
  { key: "SAD", label: "Sad", emoji: "😢", msg: "Thanks for sharing. We can take today gently.", glow: "rgba(244,114,182,0.2)" },
  { key: "WORRIED", label: "Worried", emoji: "😟", msg: "Feeling worried is okay. Let's start gently.", glow: "rgba(168,85,247,0.2)" },
  { key: "FRUSTRATED", label: "Frustrated", emoji: "😡", msg: "Let's take a breath. You've got this.", glow: "rgba(96,165,250,0.2)" },
  { key: "TIRED", label: "Tired", emoji: "😴", msg: "Rest is important. Let's go at your pace.", glow: "rgba(250,204,21,0.15)" },
];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; bar: string; shadow: string }> = {
  Mathematics: { bg: "bg-indigo-50", text: "text-indigo-700", bar: "from-indigo-500 to-blue-500", shadow: "shadow-indigo-100" },
  English: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-100" },
  Kiswahili: { bg: "bg-amber-50", text: "text-amber-700", bar: "from-amber-500 to-orange-500", shadow: "shadow-amber-100" },
  "Environmental Activities": { bg: "bg-green-50", text: "text-green-700", bar: "from-green-500 to-emerald-500", shadow: "shadow-green-100" },
  "Hygiene and Nutrition": { bg: "bg-teal-50", text: "text-teal-700", bar: "from-teal-500 to-cyan-500", shadow: "shadow-teal-100" },
  "Movement and Creative Activities": { bg: "bg-rose-50", text: "text-rose-700", bar: "from-rose-500 to-pink-500", shadow: "shadow-rose-100" },
  "English Language Activities": { bg: "bg-violet-50", text: "text-violet-700", bar: "from-violet-500 to-purple-500", shadow: "shadow-violet-100" },
};

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || { bg: "bg-gray-50", text: "text-gray-700", bar: "from-gray-400 to-gray-500", shadow: "shadow-gray-100" };
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
  const [animPulse, setAnimPulse] = useState<string | null>(null);

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
    setAnimPulse(emotion);
    try {
      const res = await fetch("/api/learner/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ emotion }),
      });
      if (res.ok) { const json = await res.json(); setCheckin(json.checkin || { emotion, emotionLabel: emotion.charAt(0) + emotion.slice(1).toLowerCase() }); }
    } catch { }
    finally {
      setCheckinSaving(false);
      setTimeout(() => setAnimPulse(null), 1500);
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

  const selectedEmotion = EQ_EMOTIONS.find(e => e.key === checkin?.emotion);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-sm font-bold text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1200px]">
      {/* ── Hero Greeting Card ── */}
      <div className="rounded-[22px] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 text-white relative overflow-hidden shadow-xl shadow-indigo-200/40">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg">
              <span className="text-base font-black">{initials}</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{greeting}, {studentName}! 👋</h1>
              <p className="text-white/70 text-sm font-semibold mt-0.5">{grade ? `Grade ${grade} • ` : ""}{motivational}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Zap size={13} className="text-amber-300" />
              <span className="text-sm font-bold">{coins}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Star size={13} className="text-amber-300" />
              <span className="text-sm font-bold">{totalXp}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative flex items-center gap-3 mt-4 pt-3 border-t border-white/15">
          <div className="flex items-center gap-1.5">
            <Trophy size={12} className="text-amber-300" />
            <span className="text-xs font-bold text-white/90">{badgeCount} badges</span>
          </div>
          <div className="w-px h-3.5 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-300" />
            <span className="text-xs font-bold text-white/90">{completedLessonsCount} lessons done</span>
          </div>
          <div className="w-px h-3.5 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <Target size={12} className="text-blue-300" />
            <span className="text-xs font-bold text-white/90">{todayCompleted}/{todayLessons.length} today</span>
          </div>
        </div>
      </div>

      {/* ── EQ Check-in (compact, warm) ── */}
      <div
        className={cn(
          "rounded-[20px] border p-4 transition-all duration-500 relative overflow-hidden",
          animPulse ? "eq-anim-pulse" : "",
          checkin?.emotion ? "" : ""
        )}
        style={{
          background: animPulse
            ? `radial-gradient(ellipse at 50% 50%, ${EQ_EMOTIONS.find(e => e.key === animPulse)?.glow || "rgba(244,114,182,0.15)"} 0%, transparent 70%)`
            : "linear-gradient(135deg, #FFF5F7 0%, #FFF0F5 100%)",
          borderColor: animPulse ? (EQ_EMOTIONS.find(e => e.key === animPulse)?.glow || "rgba(244,114,182,0.3)") : "rgba(244,114,182,0.15)"
        }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <Heart size={15} className="text-pink-500" />
          <h2 className="text-sm font-bold text-gray-800">How are you feeling today?</h2>
        </div>

        {checkinLoading ? (
          <div className="flex items-center gap-1.5 h-8"><div className="w-4 h-4 rounded-full border-2 border-pink-200 border-t-pink-500 spinner" /><span className="text-xs text-gray-400">Loading...</span></div>
        ) : checkin && selectedEmotion ? (
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-2xl leading-none">{selectedEmotion.emoji}</span>
            <div>
              <span className="text-sm font-bold text-pink-600">{selectedEmotion.label}</span>
              <p className="text-[11px] text-pink-500/80 leading-tight">{selectedEmotion.msg}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {EQ_EMOTIONS.map(({ key, label, emoji }) => (
            <button key={key} onClick={() => submitCheckin(key)} disabled={checkinSaving}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 disabled:opacity-50",
                checkin?.emotion === key
                  ? "bg-pink-100 border-pink-300 text-pink-700 shadow-sm"
                  : "bg-white border-pink-100 text-pink-600 hover:bg-pink-50 hover:border-pink-200"
              )}>
              <span className="text-base leading-none">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Today's Learning Plan ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">Today's Learning Plan</h2>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            {todayCompleted}/{todayLessons.length} done
          </span>
        </div>

        {todayLessons.length === 0 ? (
          <div className="rounded-[20px] border-2 border-dashed border-indigo-100 p-8 text-center bg-indigo-50/30">
            <BookOpen className="w-10 h-10 text-indigo-200 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-400">No lessons scheduled for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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
                    "group relative rounded-[18px] overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
                    isCompleted ? "bg-emerald-50/50" : "bg-white",
                    "border border-gray-100 hover:border-gray-200",
                    colors.shadow
                  )}
                >
                  {/* Subject color accent bar */}
                  <div className={cn("h-1.5 w-full bg-gradient-to-r", colors.bar)} />
                  <div className="p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                        {subjectName}
                      </span>
                      {isCompleted && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-3 min-h-[2.5rem]">{lesson.title}</p>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[11px] font-bold flex items-center gap-1",
                        isCompleted ? "text-emerald-600" : "text-indigo-600"
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

      {/* ── Lower Widgets ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Progress */}
        <div className="rounded-[20px] bg-white border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={15} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-800">This Week</h3>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-gray-400">{d}</span>
                <div className={cn(
                  "w-full h-2 rounded-full",
                  i < 3 ? "bg-emerald-400" : i === 3 ? "bg-indigo-400" : "bg-gray-100"
                )} />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 font-semibold">{completedLessonsCount} lessons completed this week</p>
        </div>

        {/* Quick Stats */}
        <div className="rounded-[20px] bg-white border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-amber-500" />
            <h3 className="text-sm font-bold text-gray-800">My Progress</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-center">
              <p className="text-xl font-black text-indigo-600">{completedLessonsCount}</p>
              <p className="text-[10px] font-bold text-indigo-400">Lessons Done</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <p className="text-xl font-black text-amber-600">{totalXp}</p>
              <p className="text-[10px] font-bold text-amber-400">XP Earned</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-xl font-black text-emerald-600">{badgeCount}</p>
              <p className="text-[10px] font-bold text-emerald-400">Badges</p>
            </div>
            <div className="rounded-xl bg-pink-50 p-3 text-center">
              <p className="text-xl font-black text-pink-600">{coins}</p>
              <p className="text-[10px] font-bold text-pink-400">Coins</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── My Subjects ── */}
      {subjects.length > 0 && (
        <div className="rounded-[20px] bg-white border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">My Subjects</h3>
            <Link href="/dashboard/student/subjects" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700">View All →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject: string) => {
              const colors = getSubjectColor(subject);
              return (
                <Link key={subject} href="/dashboard/student/subjects">
                  <span className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border transition-all hover:shadow-sm",
                    colors.bg, colors.text, "border-transparent"
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
