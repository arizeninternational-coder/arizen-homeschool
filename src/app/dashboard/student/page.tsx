"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Swords, Heart, Trophy, Star, ArrowRight, Flame,
  Target, Clock, GraduationCap, Sparkles, ChevronRight
} from "lucide-react";
import { CoinPill, StreakPill, XpPill, StatCard, SectionHeader, ProgressBar } from "@/components/ui/Pill";
import { StarIcon, TrophyIcon, HeartIcon, BookIcon, FractionIllustration, SparkleDecoration } from "@/components/ui/Illustrations";
import { GradientButton } from "@/components/ui/Pill";

export default function StudentDashboard() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

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
      } catch (e) {
        console.error("[DASHBOARD] Error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const s = data.summary || {};
  const studentName = s?.profile?.name || s?.profile?.displayName || "Learner";
  const grade = s?.profile?.grade || "";
  const totalXp = s.totalXp || s?.profile?.totalXp || 0;
  const coins = s.coins || s?.wallet?.balance || 0;
  const currentStreak = s.currentStreak || s?.profile?.currentStreak || 0;
  const completedLessons = s.completedLessons || 0;
  const avatarLevel = Math.floor(totalXp / 100) + 1;
  const xpForNextLevel = (avatarLevel) * 100;
  const xpProgress = totalXp % 100;

  const titles = ["Explorer", "Adventurer", "Scholar", "Champion", "Master", "Legend"];
  const currentTitle = titles[Math.min(avatarLevel - 1, titles.length - 1)];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* ── Greeting ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-text tracking-tight">
            {greeting}, {studentName}! <span className="inline-block wiggle">👋</span>
          </h1>
          <p className="text-text-muted mt-1 text-sm lg:text-base">Let's make today an amazing learning adventure.</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <CoinPill coins={coins} />
          <StreakPill count={currentStreak} />
          <XpPill amount={totalXp} />
        </div>
      </div>

      {/* ── Today's Lesson Hero ── */}
      <div className="relative rounded-[28px] border border-primary/15 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #F3F0FF 0%, #EEF6FF 100%)", boxShadow: "0 18px 45px rgba(79,70,229,0.10)" }}>
        <div className="absolute top-4 right-4 opacity-10">
          <SparkleDecoration className="w-8 h-8" />
        </div>
        <div className="p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary bg-primary-soft px-3 py-1 rounded-full">
                Today's Lesson
              </span>
              <span className="text-[10px] font-semibold text-text-muted bg-white/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> 12 min
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-text mb-2">Adding Fractions</h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-accent-blue bg-accent-blue-soft px-3 py-1 rounded-full flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Mathematics
              </span>
            </div>
            <p className="text-sm text-text-muted mb-5 max-w-md">
              Add fractions with like and unlike denominators using step-by-step examples.
            </p>
            <Link href="/dashboard/student/lessons">
              <GradientButton icon={<ArrowRight className="w-4 h-4" />} size="md">
                Continue Lesson
              </GradientButton>
            </Link>
          </div>
          <div className="hidden lg:flex flex-shrink-0 items-center justify-center">
            <div className="w-48 h-48 rounded-3xl bg-white/60 border border-primary/10 flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.08)]">
              <FractionIllustration size={120} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="EQ Check-in"
          value={s.checkIns || 0}
          sublabel="Mood checks this week"
          icon={<div className="text-secondary"><HeartIcon size={20} /></div>}
          gradient="bg-card-gradient-green"
          borderColor="border-secondary/20"
          textColor="text-secondary-dark"
        />
        <StatCard
          label="Badges"
          value={s.badges || 0}
          sublabel="Achievements earned"
          icon={<div className="text-accent-purple"><StarIcon size={20} /></div>}
          gradient="bg-white"
          borderColor="border-accent-purple/20"
          textColor="text-accent-purple"
        />
        <StatCard
          label="Quest Progress"
          value={`${s.questsCompleted || 0}/${s.totalQuests || 0}`}
          sublabel="Quests completed"
          icon={<div className="text-pink"><TrophyIcon size={20} /></div>}
          gradient="bg-card-gradient-pink"
          borderColor="border-pink/20"
          textColor="text-pink"
        />
        <StatCard
          label="Today's Goal"
          value={`${s.lessonsToday || 0}/3`}
          sublabel="Lessons to complete"
          icon={<div className="text-accent-blue"><Target className="w-5 h-5" /></div>}
          gradient="bg-card-gradient-blue"
          borderColor="border-accent-blue/20"
          textColor="text-accent-blue"
        />
      </div>

      {/* ── Subjects Quick Access ── */}
      <SectionHeader
        title="My Subjects"
        subtitle="Jump back into your learning"
        action={
          <Link href="/dashboard/student/subjects" className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(data.lessons?.subjects || ["Mathematics", "English", "Science", "Kiswahili", "Social Studies", "CRE", "Art", "Music"]).slice(0, 8).map((subject: string, i: number) => {
          const colors = [
            { bg: "bg-accent-blue-soft", text: "text-accent-blue", border: "border-accent-blue/20" },
            { bg: "bg-primary-soft", text: "text-primary", border: "border-primary/20" },
            { bg: "bg-secondary-soft", text: "text-secondary", border: "border-secondary/20" },
            { bg: "bg-accent-purple-soft", text: "text-accent-purple", border: "border-accent-purple/20" },
            { bg: "bg-gold-soft", text: "text-gold", border: "border-gold/20" },
            { bg: "bg-pink-soft", text: "text-pink", border: "border-pink/20" },
            { bg: "bg-accent-blue-soft", text: "text-accent-blue", border: "border-accent-blue/15" },
            { bg: "bg-primary-soft", text: "text-primary", border: "border-primary/15" },
          ];
          const c = colors[i % colors.length];
          const icons = [BookOpen, Swords, Star, Heart, Trophy, Sparkles, Target, GraduationCap];
          const Icon = icons[i % icons.length];
          return (
            <Link
              key={subject}
              href={`/dashboard/student/subjects`}
              className={cn(
                "flex flex-col items-center gap-3 p-5 rounded-[1.5rem] border transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] bg-white",
                c.border
              )}
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", c.bg, c.text)}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-text text-center">{subject}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Avatar Progress Card ── */}
      <div className="rounded-[28px] border border-primary/10 p-6 lg:p-8"
        style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #FDF4FF 100%)", boxShadow: "0 18px 45px rgba(79,70,229,0.10)" }}>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-40 rounded-3xl bg-white border-2 border-primary/20 flex flex-col items-center justify-center shadow-[0_8px_25px_rgba(79,70,229,0.12)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary-soft/40 to-accent-purple-soft/30" />
              {/* Simple avatar figure */}
              <svg width="80" height="100" viewBox="0 0 80 100" className="relative z-10">
                {/* Head */}
                <circle cx="40" cy="22" r="14" fill="#D4A574" stroke="#C4956A" strokeWidth="1.5" />
                {/* Hair */}
                <path d="M26 22C26 12 32 6 40 6C48 6 54 12 54 22" fill="#2D1B00" />
                {/* Eyes */}
                <circle cx="35" cy="22" r="2" fill="#2D1B00" />
                <circle cx="45" cy="22" r="2" fill="#2D1B00" />
                {/* Smile */}
                <path d="M35 28C37 31 43 31 45 28" stroke="#2D1B00" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                {/* Body */}
                <rect x="28" y="37" width="24" height="30" rx="6" fill="#4F46E5" />
                {/* Arms */}
                <rect x="18" y="40" width="10" height="20" rx="5" fill="#D4A574" />
                <rect x="52" y="40" width="10" height="20" rx="5" fill="#D4A574" />
                {/* Legs */}
                <rect x="30" y="68" width="8" height="22" rx="4" fill="#1E293B" />
                <rect x="42" y="68" width="8" height="22" rx="4" fill="#1E293B" />
                {/* Shoes */}
                <rect x="27" y="88" width="14" height="6" rx="3" fill="#F5A524" />
                <rect x="39" y="88" width="14" height="6" rx="3" fill="#F5A524" />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-1">
              <h3 className="text-xl font-extrabold text-text">Your Avatar</h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-gold text-white px-2.5 py-0.5 rounded-full">
                Level {avatarLevel}
              </span>
            </div>
            <p className="text-sm text-text-muted mb-1">{currentTitle}</p>
            <p className="text-sm font-bold text-text-muted mb-4">
              {totalXp.toLocaleString()} XP total • {xpProgress}/100 to next level
            </p>
            <div className="max-w-sm mx-auto lg:mx-0 mb-5">
              <ProgressBar value={xpProgress} max={100} color="bg-gradient-to-r from-primary to-accent-purple" height="h-3" showLabel />
            </div>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <Link href="/dashboard/student/avatar">
                <GradientButton variant="primary" size="sm">Customize Avatar</GradientButton>
              </Link>
              <Link href="/dashboard/student/shop">
                <GradientButton variant="secondary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
                  Visit Shop
                </GradientButton>
              </Link>
            </div>
          </div>

          {/* Rewards preview */}
          <div className="hidden xl:flex flex-col gap-3 p-4 rounded-2xl bg-white/60 border border-primary/10">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Latest Rewards</p>
            <div className="flex gap-2">
              {["Hat", "Cape", "Boots", "Shield"].map((item, i) => (
                <div key={item} className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-soft to-accent-purple-soft border border-primary/10 flex items-center justify-center">
                  <GiftEmoji index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tiny gift emoji helper for reward preview
function GiftEmoji({ index }: { index: number }) {
  const emojis = ["🧢", "🦸", "👟", "🛡️"];
  return <span className="text-lg">{emojis[index]}</span>;
}
