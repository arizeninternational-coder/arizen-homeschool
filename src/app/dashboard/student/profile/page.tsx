"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Star, Trophy, Flame, BookOpen, Palette } from "lucide-react";
import { PageHeader, SectionHeader, StatCard, GradientButton, ProgressBar, EmptyStateCard } from "@/components/ui/Pill";
import { CoinIcon, StreakIcon } from "@/components/ui/Illustrations";
import AvatarRenderer from "@/components/AvatarRenderer";

export default function StudentProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learner/profile", { credentials: "include" })
      .then(r => r.json())
      .then(d => setProfile(d.profile || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-text-muted font-bold text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const totalXp = profile?.totalXp || 0;
  const currentStreak = profile?.currentStreak || 0;
  const coins = profile?.wallet?.balance || 0;
  const badges = profile?.badges || 0;
  const level = Math.floor(totalXp / 100) + 1;
  const xpProgress = totalXp % 100;

  return (
    <div className="space-y-5 fade-in">
      <PageHeader title="My Profile" subtitle="Your learning journey at a glance" />

      {/* Profile Card */}
      <div className="rounded-[1.5rem] bg-white/90 backdrop-blur-sm p-6 lg:p-8 shadow-[0_4px_20px_rgba(79,70,229,0.05)] border border-primary/8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent-purple/10 flex items-center justify-center shadow-lg overflow-hidden">
            <AvatarRenderer size="md" skinHex="#C68642" hairColorHex="#1a1a1a" hairStyle="short-curls" outfitHex="#4F46E5" shoeHex="#37474F" expression="happy" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-extrabold text-text">{profile?.name || profile?.displayName || "Student"}</h2>
            <p className="text-text-muted">Grade {profile?.grade || "—"} • Level {level}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-soft/50 border border-gold/15">
                <CoinIcon size={14} />
                <span className="text-xs font-extrabold text-amber-800">{coins}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-soft/50 border border-pink/15">
                <StreakIcon size={14} />
                <span className="text-xs font-extrabold text-pink-700">{currentStreak}d</span>
              </div>
            </div>
          </div>
          <Link href="/dashboard/student/settings">
            <GradientButton variant="secondary" size="sm" icon={<Palette className="w-4 h-4" />}>
              Settings
            </GradientButton>
          </Link>
        </div>
      </div>

      <SectionHeader title="Stats" subtitle="Your achievements" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total XP" value={totalXp.toLocaleString()} icon={<Star className="w-5 h-5 text-primary" />} gradient="bg-white" borderColor="border-primary/8" textColor="text-primary" />
        <StatCard label="Current Streak" value={`${currentStreak} days`} icon={<Flame className="w-5 h-5 text-pink" />} gradient="bg-white" borderColor="border-pink/8" textColor="text-pink" />
        <StatCard label="Coins" value={coins.toLocaleString()} icon={<CoinIcon size={20} />} gradient="bg-white" borderColor="border-gold/8" textColor="text-gold" />
        <StatCard label="Badges" value={badges} icon={<Trophy className="w-5 h-5 text-accent-purple" />} gradient="bg-white" borderColor="border-accent-purple/8" textColor="text-accent-purple" />
      </div>

      <SectionHeader title="Level Progress" />
      <div className="rounded-[1.5rem] bg-white/90 backdrop-blur-sm p-6 border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-text">Level {level}</span>
          <span className="text-sm font-bold text-text-muted">{xpProgress}/100 XP</span>
        </div>
        <ProgressBar value={xpProgress} max={100} color="bg-gradient-to-r from-primary to-accent-purple" height="h-3" />
        <p className="text-xs text-text-muted mt-2">{100 - xpProgress} XP to Level {level + 1}</p>
      </div>
    </div>
  );
}
