"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Swords, Heart, Trophy, Star, ArrowRight, Flame,
  Target, Clock, GraduationCap, Sparkles, ChevronRight,
  Smile, Leaf, Sparkles as SparklesIcon, Meh, CloudRain, Flame as FlameIcon, AlertTriangle, Zap
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CoinPill, StreakPill, XpPill, ProgressBar } from "@/components/ui/Pill";
import { StarIcon, TrophyIcon, HeartIcon, BookIcon, FractionIllustration } from "@/components/ui/Illustrations";
import { GradientButton } from "@/components/ui/Pill";
import { FloatingCard, SectionTitle, StatPill, BrowseGrid, CARD_COLORS } from "@/components/ui/FloatingCard";
import AvatarRenderer from "@/components/AvatarRenderer";

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
  const studentName = s?.profile?.name || s?.profile?.displayName || "Learner";
  const totalXp = s.totalXp || s?.profile?.totalXp || 0;
  const coins = s.coins || s?.wallet?.balance || 0;
  const currentStreak = s.currentStreak || s?.profile?.currentStreak || 0;
  const completedLessons = s.completedLessons || 0;
  const avatarLevel = Math.floor(totalXp / 100) + 1;
  const xpProgress = totalXp % 100;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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
          <p className="text-text-muted text-sm mt-0.5">Let's make today an amazing learning adventure.</p>
        </div>
        <div className="flex items-center gap-2">
          <CoinPill coins={coins} size="sm" />
          <StreakPill count={currentStreak} size="sm" />
          <XpPill amount={totalXp} size="sm" />
        </div>
      </div>

      {/* ── Today's Lesson Hero ── */}
      <Link
        href="/dashboard/student/lessons"
        className="block rounded-[1.5rem] border border-primary/10 p-5 bg-gradient-to-br from-primary/[0.04] to-accent-purple/[0.03] hover:shadow-[0_8px_25px_rgba(79,70,229,0.1)] hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">Today's Lesson</span>
          <span className="text-[9px] font-semibold text-text-muted bg-white/60 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock size={10} /> 12 min</span>
        </div>
        <h2 className="text-lg lg:text-xl font-extrabold text-text mb-1">Adding Fractions</h2>
        <span className="inline-block text-[10px] font-bold text-accent-blue bg-accent-blue-soft/50 px-2.5 py-0.5 rounded-full mb-3">Mathematics</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary flex items-center gap-1">Continue Lesson <ArrowRight size={14} /></span>
        </div>
      </Link>

      {/* ── Compact Modules Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* EQ Check-in */}
        <FloatingCard className="!p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-pink-soft flex items-center justify-center"><Heart size={16} className="text-pink" /></div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">EQ Check-in</span>
          </div>
          {checkinLoading ? (
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full border-2 border-pink/20 border-t-pink spinner" /><span className="text-[10px] text-text-muted">Loading...</span></div>
          ) : checkin ? (
            <p className="text-sm font-extrabold text-pink">{checkin.emotionLabel || checkin.emotion}</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {([
                { key: "HAPPY", label: "Happy", icon: Smile, bg: "bg-amber-100 hover:bg-amber-200", text: "text-amber-700" },
                { key: "CALM", label: "Calm", icon: Leaf, bg: "bg-teal-100 hover:bg-teal-200", text: "text-teal-700" },
                { key: "CURIOUS", label: "Curious", icon: SparklesIcon, bg: "bg-blue-100 hover:bg-blue-200", text: "text-blue-700" },
                { key: "OKAY", label: "Okay", icon: Meh, bg: "bg-slate-100 hover:bg-slate-200", text: "text-slate-600" },
                { key: "SAD", label: "Sad", icon: CloudRain, bg: "bg-pink-100 hover:bg-pink-200", text: "text-pink-700" },
                { key: "WORRIED", label: "Worried", icon: AlertTriangle, bg: "bg-purple-100 hover:bg-purple-200", text: "text-purple-700" },
                { key: "FRUSTRATED", label: "Angry", icon: FlameIcon, bg: "bg-orange-100 hover:bg-orange-200", text: "text-orange-700" },
                { key: "TIRED", label: "Excited", icon: Zap, bg: "bg-yellow-100 hover:bg-yellow-200", text: "text-yellow-700" },
              ] as const).map(({ key, label, icon: Icon, bg, text }) => (
                <button key={key} onClick={() => submitCheckin(key)} disabled={checkinSaving}
                  className={cn("inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50", bg, text)}>
                  <Icon size={10} />{label}
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
            <p className="text-lg font-extrabold text-accent-purple">{s.badges || 0}</p>
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
          <p className="text-lg font-extrabold text-accent-blue">{s.lessonsToday || 0}/3</p>
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
        <BrowseGrid cols={4}>
          {(data.lessons?.subjects || []).slice(0, 8).map((subject: string, i: number) => {
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
      </div>

      {/* ── Avatar + XP ── */}
      <FloatingCard className="!p-5">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-shrink-0">
            <div className="w-20 h-24 rounded-2xl bg-gradient-to-b from-primary-soft/40 to-accent-purple-soft/30 flex items-center justify-center shadow-[0_4px_15px_rgba(79,70,229,0.08)] relative overflow-hidden">
              <AvatarRenderer size="sm" skinHex="#C68642" hairColorHex="#1a1a1a" hairStyle="short-curls" outfitHex="#4F46E5" shoeHex="#37474F" expression="happy" className="relative z-10" />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-0.5">
              <h3 className="text-base font-extrabold text-text">Your Avatar</h3>
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-gold-soft text-amber-800 px-2 py-0.5 rounded-full">Level {avatarLevel}</span>
            </div>
            <p className="text-xs text-text-muted mb-2">{["Explorer", "Adventurer", "Scholar", "Champion", "Master", "Legend"][Math.min(avatarLevel - 1, 5)]}</p>
            <div className="max-w-xs mx-auto sm:mx-0 mb-2">
              <ProgressBar value={xpProgress} max={100} color="bg-gradient-to-r from-primary to-accent-purple" height="h-2" />
            </div>
            <p className="text-[10px] text-text-muted font-semibold">{totalXp.toLocaleString()} XP total • {xpProgress}/100 to next level</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href="/dashboard/student/avatar">
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 transition-all shadow-[0_4px_12px_rgba(79,70,229,0.2)]">Customize</button>
            </Link>
            <Link href="/dashboard/student/shop">
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-gold-soft text-amber-800 hover:brightness-105 transition-all flex items-center gap-1"><Sparkles size={12} /> Shop</button>
            </Link>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
}
