"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Star, Trophy, Flame, BookOpen, Palette } from "lucide-react";
import { PageHeader, SectionHeader, StatCard, GradientButton, ProgressBar, EmptyStateCard } from "@/components/ui/Pill";
import { CoinIcon, StreakIcon } from "@/components/ui/Illustrations";

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

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary spinner" /></div>;

  const totalXp = profile?.totalXp || 0;
  const currentStreak = profile?.currentStreak || 0;
  const coins = profile?.wallet?.balance || 0;
  const badges = profile?.badges || 0;
  const level = Math.floor(totalXp / 100) + 1;
  const xpProgress = totalXp % 100;

  return (
    <div className="space-y-8 fade-in">
      <PageHeader title="My Profile" subtitle="Your learning journey at a glance" />

      {/* Profile Card */}
      <div className="rounded-[20px] border border-primary/10 bg-white p-6 lg:p-8" style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #FDF4FF 100%)" }}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
            {(profile?.name || "S").charAt(0).toUpperCase()}
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
          <GradientButton variant="primary" size="sm" icon={<Palette className="w-4 h-4" />}>
            Edit Profile
          </GradientButton>
        </div>
      </div>

      <SectionHeader title="Stats" subtitle="Your achievements" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total XP" value={totalXp.toLocaleString()} icon={<Star className="w-5 h-5 text-primary" />} gradient="bg-white" borderColor="border-primary/15" textColor="text-primary" />
        <StatCard label="Current Streak" value={`${currentStreak} days`} icon={<Flame className="w-5 h-5 text-pink" />} gradient="bg-white" borderColor="border-pink/15" textColor="text-pink" />
        <StatCard label="Coins" value={coins.toLocaleString()} icon={<CoinIcon size={20} />} gradient="bg-white" borderColor="border-gold/15" textColor="text-gold" />
        <StatCard label="Badges" value={badges} icon={<Trophy className="w-5 h-5 text-accent-purple" />} gradient="bg-white" borderColor="border-accent-purple/15" textColor="text-accent-purple" />
      </div>

      <SectionHeader title="Level Progress" />
      <div className="rounded-[20px] border border-border-soft bg-white p-6">
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
