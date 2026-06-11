"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Swords, Heart, Trophy, Star, ArrowRight, Flame,
  Target, Clock, GraduationCap, Sparkles, ChevronRight,
  Smile, Leaf, Sparkles as SparklesIcon, Meh, CloudRain, Flame as FlameIcon, AlertTriangle, Zap,
  CheckCircle2, Circle, CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CoinPill, StreakPill, XpPill, ProgressBar } from "@/components/ui/Pill";
import { StarIcon, TrophyIcon, HeartIcon, BookIcon, FractionIllustration } from "@/components/ui/Illustrations";
import { GradientButton } from "@/components/ui/Pill";
import { FloatingCard, SectionTitle, StatPill, BrowseGrid, CARD_COLORS } from "@/components/ui/FloatingCard";
import AvatarRenderer from "@/components/AvatarRenderer";

export const dynamic = "force-dynamic";

const EQ_EMOTIONS = [
  { key: "HAPPY", label: "Happy", icon: Smile, bg: "bg-amber-100 hover:bg-amber-200", text: "text-amber-700", emoji: "😀" },
  { key: "CALM", label: "Calm", icon: Leaf, bg: "bg-teal-100 hover:bg-teal-200", text: "text-teal-700", emoji: "😌" },
  { key: "CURIOUS", label: "Curious", icon: SparklesIcon, bg: "bg-blue-100 hover:bg-blue-200", text: "text-blue-700", emoji: "🤔" },
  { key: "OKAY", label: "Okay", icon: Meh, bg: "bg-slate-100 hover:bg-slate-200", text: "text-slate-600", emoji: "😐" },
  { key: "SAD", label: "Sad", icon: CloudRain, bg: "bg-pink-100 hover:bg-pink-200", text: "text-pink-700", emoji: "😢" },
  { key: "WORRIED", label: "Worried", icon: AlertTriangle, bg: "bg-purple-100 hover:bg-purple-200", text: "text-purple-700", emoji: "😟" },
  { key: "FRUSTRATED", label: "Frustrated", icon: FlameIcon, bg: "bg-orange-100 hover:bg-orange-200", text: "text-orange-700", emoji: "😡" },
  { key: "TIRED", label: "Tired", icon: Zap, bg: "bg-yellow-100 hover:bg-yellow-200", text: "text-yellow-700", emoji: "😴" },
];

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
  const avatarLevel = Math.floor(totalXp / 100) + 1;
  const xpProgress = totalXp % 100;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Get today's lessons (up to 6)
  const allLessons = data.lessons?.lessons || [];
  const todayLessons = allLessons.slice(0, 6);
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
    <div className="space-y-5">
      {/* ── Greeting + Stat Pills ── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-text tracking-tight">
            {greeting}, {studentName}! <span className="inline-block wiggle">👋</span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {grade ? `Grade ${grade} • ` : ""}Let's make today an amazing learning adventure.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CoinPill coins={coins} size="sm" />
          <StreakPill count={currentStreak} size="sm" />
          <XpPill amount={totalXp} size="sm" />
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
          <div className="rounded-[1.5rem] border border-dashed border-primary/20 p-8 text-center">
            <BookOpen className="w-10 h-10 text-primary/30 mx-auto mb-3" />
            <p className="text-sm font-bold text-text-muted">No lessons scheduled for today</p>
            <p className="text-xs text-text-muted mt-1">Check back soon or ask your teacher to add lessons.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayLessons.map((lesson: any, i: number) => {
              const isCompleted = lesson.progress?.completedAt != null;
              const themeSlug = lesson.quest?.theme?.slug || "";
              const questSlug = lesson.quest?.slug || "";
              const lessonSlug = lesson.slug || "";
              const lessonHref = (themeSlug && questSlug && lessonSlug)
                ? `/dashboard/student/lessons/${themeSlug}/${questSlug}/${lessonSlug}`
                : "/dashboard/student/lessons";
              const subjectName = lesson.subject || "Lesson";
              const color = CARD_COLORS[i % CARD_COLORS.length];

              return (
                <Link
                  key={lesson.id || i}
                  href={lessonHref}
                  className={cn(
                    "group rounded-[1.25rem] border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                    isCompleted ? "border-secondary/20 bg-secondary/5" : "border-primary/10 bg-white hover:border-primary/20"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color.iconBg)}>
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-secondary" />
                      ) : (
                        <BookIcon size={16} className={color.textColor} />
                      )}
                    </div>
                    {isCompleted && (
                      <span className="text-[9px] font-extrabold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">Done</span>
                    )}
                  </div>
                  <h3 className="text-xs font-extrabold text-text leading-tight mb-1 line-clamp-2">{lesson.title}</h3>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", color.pillBg || "bg-primary/10 text-primary")}>
                    {subjectName}
                  </span>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                      {isCompleted ? "Review" : "Start"} <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Compact Modules Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* EQ Check-in */}
        <FloatingCard className="!p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-pink-soft flex items-center justify-center"><Heart size={16} className="text-pink" /></div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">How are you feeling?</span>
          </div>
          {checkinLoading ? (
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full border-2 border-pink/20 border-t-pink spinner" /><span className="text-[10px] text-text-muted">Loading...</span></div>
          ) : checkin ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{EQ_EMOTIONS.find(e => e.key === checkin.emotion)?.emoji || "😊"}</span>
              <p className="text-sm font-extrabold text-pink">{checkin.emotionLabel || checkin.emotion}</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {EQ_EMOTIONS.map(({ key, label, emoji }) => (
                <button key={key} onClick={() => submitCheckin(key)} disabled={checkinSaving}
                  className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50 bg-pink-50 hover:bg-pink-100 text-pink-700">
                  {emoji} {label}
                </button>
              ))}
            </div>
          )}
        </FloatingCard>

        {/* Badges */}
        <Link href="/dashboard/student/badges">
          <FloatingCard className="!p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-accent-purple-soft flex items-center justify-center"><StarIcon size={16} className="text-accent-purple" /></div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Badges</span>
            </div>
            <p className="text-lg font-extrabold text-accent-purple">{badgeCount}</p>
            <p className="text-[10px] text-text-muted font-semibold">Achievements earned</p>
          </FloatingCard>
        </Link>

        {/* Quest Progress */}
        <Link href="/dashboard/student/quests">
          <FloatingCard className="!p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-pink-soft/50 flex items-center justify-center"><TrophyIcon size={16} className="text-pink" /></div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Quests</span>
            </div>
            <p className="text-lg font-extrabold text-pink">{s.questsCompleted || 0}/{s.totalQuests || 0}</p>
            <p className="text-[10px] text-text-muted font-semibold">Quests completed</p>
          </FloatingCard>
        </Link>

        {/* Today's Goal */}
        <FloatingCard className="!p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-accent-blue-soft/50 flex items-center justify-center"><Target size={16} className="text-accent-blue" /></div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Today's Goal</span>
          </div>
          <p className="text-lg font-extrabold text-accent-blue">{todayCompleted}/{todayLessons.length}</p>
          <p className="text-[10px] text-text-muted font-semibold">Lessons to complete</p>
        </FloatingCard>
      </div>

      {/* ── Subjects Quick Access ── */}
      <div>
        <SectionTitle
          title="My Subjects"
          subtitle="Jump back into your learning"
          action={<Link href="/dashboard/student/subjects" className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1">View All <ChevronRight size={14} /></Link>}
        />
        {subjects.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-primary/20 p-6 text-center">
            <BookOpen className="w-8 h-8 text-primary/30 mx-auto mb-2" />
            <p className="text-sm font-bold text-text-muted">No subjects available yet</p>
            <p className="text-xs text-text-muted mt-1">Your subjects will appear here once your teacher publishes lessons.</p>
          </div>
        ) : (
          <BrowseGrid cols={4}>
            {(subjects || []).slice(0, 8).map((subject: string, i: number) => {
              const color = CARD_COLORS[i % CARD_COLORS.length];
              const icons = [BookOpen, Swords, Star, Heart, Trophy, Sparkles, Target, GraduationCap];
              const Icon = icons[i % icons.length];
              return (
                <Link key={subject} href="/dashboard/student/subjects">
                  <FloatingCard className={cn("flex flex-col items-center gap-2 !p-4", color.border)}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color.iconBg)}>
                      <Icon size={20} className={color.textColor} />
                    </div>
                    <span className="text-xs font-bold text-text text-center leading-tight">{subject}</span>
                  </FloatingCard>
                </Link>
              );
            })}
          </BrowseGrid>
        )}
      </div>

      {/* ── Streak + Lessons Completed ── */}
      {currentStreak > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
            <Flame size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-extrabold text-orange-700">{currentStreak}-day streak</p>
            <p className="text-xs font-semibold text-orange-600/70">Keep it going! You're on fire! 🔥</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-primary">{completedLessons}</p>
            <p className="text-[10px] font-semibold text-text-muted">lessons done</p>
          </div>
        </div>
      )}

      {/* ── Avatar + XP (hidden until polished) --}
      {false && (
        <FloatingCard className="!p-5">
          ...
        </FloatingCard>
      ) */}
    </div>
  );
}
