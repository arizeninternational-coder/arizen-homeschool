"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Flame, Star, BookOpen, GraduationCap, LogOut, Link2,
  CalendarCheck, ChevronRight, Award, Heart, Trophy, Target, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PageHeader, SectionHeader, GradientButton, StatCard, EmptyStateCard } from "@/components/ui/Pill";
import { CoinIcon, StreakIcon, BookIcon } from "@/components/ui/Illustrations";
import AvatarRenderer from "@/components/AvatarRenderer";

export default function ParentDashboard() {
  const [children, setChildren] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    try {
      // GET /api/parent/link-child lists children linked to this parent
      const childrenRes = await fetch("/api/parent/link-child", { credentials: "include" });
      let childList: any[] = [];
      if (childrenRes.ok) {
        const cData = await childrenRes.json();
        childList = cData.children || cData || [];
      }

      // GET /api/parent/progress gets progress summaries
      const progressRes = await fetch("/api/parent/progress", { credentials: "include" });
      let progressData: any[] = [];
      if (progressRes.ok) {
        const pData = await progressRes.json();
        progressData = pData?.children || [];
      }

      // Merge progress into children by matching child id
      const merged = childList.map((child: any) => {
        const progress = progressData.find(
          (p: any) => p.id === child.id || p.learnerProfileId === child.learnerProfileId
        ) || {};
        return { ...child, ...progress, learnerProfileId: progress.learnerProfileId || child.learnerProfileId || child.id };
      });

      // Also include children from progress API
      for (const p of progressData) {
        if (!merged.find((m: any) => m.id === p.id || m.learnerProfileId === p.learnerProfileId)) {
          merged.push(p);
        }
      }

      setChildren(merged);

      // Fetch today's emotional check-ins for all linked children
      try {
        const checkinRes = await fetch("/api/parent/child-checkins", { credentials: "include" });
        if (checkinRes.ok) {
          const cData = await checkinRes.json();
          const checkinMap: Record<string, any> = {};
          for (const c of (cData.checkins || [])) {
            const learnerId = c.learnerProfileId || c.learner?.id || c.learnerId;
            if (learnerId) checkinMap[learnerId] = c;
          }
          setCheckins(checkinMap);
        }
      } catch {}
    } catch (e) {
      console.error("[PARENT_DASHBOARD] Error:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const totalXp = children.reduce((sum, c) => sum + (c.xp || c.totalXp || 0), 0);
  const totalStreaks = children.reduce((sum, c) => sum + (c.streak || c.currentStreak || 0), 0);
  const totalLessons = children.reduce((sum, c) => sum + (c.lessonsCompleted || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-secondary/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-secondary animate-spin" />
          </div>
          <p className="text-sm font-bold text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Header — floating glass, no hard border */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl shadow-[0_1px_0_rgb(var(--color-border-soft),0.6)]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center shadow-[0_0_16px_rgba(0,168,132,0.2)]">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base text-text tracking-tight">Arizen</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted ml-2">Parent</span>
            </div>
          </div>
          <button
            onClick={() => fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/")}
            className="p-2 rounded-xl hover:bg-red-50/80 text-text-muted hover:text-danger transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex gap-0 overflow-x-auto">
          {[
            { label: "Dashboard", href: "/dashboard/parent" },
            { label: "Children", href: "/dashboard/parent/children" },
            { label: "Progress", href: "/dashboard/parent/progress" },
            { label: "Lessons", href: "/dashboard/parent/lessons" },
            { label: "Reports", href: "/dashboard/parent/reports" },
            { label: "Settings", href: "/dashboard/parent/settings" },
          ].map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
                tab.href === "/dashboard/parent"
                  ? "border-secondary text-secondary-dark"
                  : "border-transparent text-text-muted hover:text-text"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-5 fade-in">
        {error ? (
          <div className="rounded-[1.75rem] border border-red-200/60 bg-red-50/80 backdrop-blur-sm p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Failed to load data</h3>
            <GradientButton variant="primary" onClick={() => { setError(false); setLoading(true); loadChildren(); }}>Try Again</GradientButton>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Children" value={children.length} icon={<Users className="w-5 h-5 text-secondary" />} gradient="bg-card-gradient-green" borderColor="border-secondary/15" textColor="text-secondary-dark" />
              <StatCard label="Active Streaks" value={`${totalStreaks}d`} icon={<Flame className="w-5 h-5 text-pink" />} gradient="bg-card-gradient-pink" borderColor="border-pink/15" textColor="text-pink" />
              <StatCard label="Total XP" value={totalXp.toLocaleString()} icon={<Star className="w-5 h-5 text-gold" />} gradient="bg-card-gradient-gold" borderColor="border-gold/15" textColor="text-amber-700" />
              <StatCard label="Lessons Done" value={totalLessons} icon={<BookIcon size={20} className="text-accent-blue" />} gradient="bg-card-gradient-blue" borderColor="border-accent-blue/15" textColor="text-accent-blue" />
            </div>

            {/* My Children */}
            <SectionHeader
              title="My Children"
              subtitle={`${children.length} linked account${children.length !== 1 ? "s" : ""}`}
              action={
                <Link href="/dashboard/parent/children" className="text-sm font-bold text-secondary hover:text-secondary-dark flex items-center gap-1 transition-colors">
                  Manage <ChevronRight className="w-4 h-4" />
                </Link>
              }
            />

            {children.length === 0 ? (
              <div className="rounded-[1.75rem] border-2 border-dashed border-secondary/20 bg-white/60 backdrop-blur-sm p-12 text-center">
                <div className="w-16 h-16 rounded-3xl bg-secondary-soft/50 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-text mb-1">No children linked yet</h3>
                <p className="text-sm text-text-muted max-w-sm mx-auto mb-6">
                  Link your child&apos;s student account to start tracking their progress, streaks, and achievements.
                </p>
                <Link href="/dashboard/parent/children">
                  <GradientButton variant="primary" icon={<Link2 className="w-4 h-4" />}>
                    Link Your First Child
                  </GradientButton>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((child) => (
                  <div
                    key={child.id || child.learnerProfileId}
                    className="rounded-[1.5rem] bg-white/90 backdrop-blur-sm p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-white/60 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all duration-200"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent-purple/10 flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
                        <AvatarRenderer size="xs" skinHex="#C68642" hairColorHex="#1a1a1a" hairStyle="short-curls" outfitHex="#4F46E5" shoeHex="#37474F" expression="happy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-text truncate">{child.name || child.displayName || "Student"}</h3>
                        <p className="text-xs text-text-muted">Grade {child.grade || "—"}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-accent-purple-soft text-accent-purple text-[10px] font-extrabold uppercase tracking-wider">
                        Level {Math.floor((child.xp || child.totalXp || 0) / 100) + 1}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-soft/50 border border-gold/15">
                        <CoinIcon size={12} />
                        <span className="text-[11px] font-extrabold text-amber-800">{child.coins || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-soft/50 border border-pink/15">
                        <StreakIcon size={12} />
                        <span className="text-[11px] font-extrabold text-pink-700">{child.streak || child.currentStreak || 0}d</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-blue-soft/50 border border-accent-blue/15">
                        <BookOpen className="w-3 h-3 text-accent-blue" />
                        <span className="text-[11px] font-extrabold text-accent-blue">{child.lessonsCompleted || 0} lessons</span>
                      </div>
                    </div>
                    {/* Emotional check-in */}
                    <div className="px-3 py-2 rounded-xl bg-bg-main/60 border border-white/40">
                      {checkins[child.learnerProfileId || child.id] ? (
                        <div className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                          <span className="text-[11px] font-bold text-text">
                            Feeling <span className="text-secondary-dark">{checkins[child.learnerProfileId || child.id].emotionLabel || "good"}</span> today
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                          <span className="text-[11px] text-text-muted italic">No check-in yet today</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href="/dashboard/parent/progress" className="flex-1">
                        <GradientButton variant="outline" size="sm" className="w-full" icon={<Award className="w-4 h-4" />}>
                          View Progress
                        </GradientButton>
                      </Link>
                      <Link href="/dashboard/parent/lessons" className="flex-1">
                        <GradientButton variant="secondary" size="sm" className="w-full" icon={<BookOpen className="w-4 h-4" />}>
                          Lessons
                        </GradientButton>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Activity */}
            <SectionHeader title="Recent Activity" subtitle="Latest progress across your children" />
            {children.some(c => c.recentActivity && c.recentActivity.length > 0) ? (
              <div className="space-y-3">
                {children.map((child) => (
                  (child.recentActivity || []).slice(0, 3).map((activity: any, i: number) => (
                    <div key={`${child.id}-${i}`} className="rounded-[1.25rem] bg-white/90 backdrop-blur-sm p-4 flex items-center gap-4 shadow-[0_1px_8px_rgba(0,0,0,0.02)] border border-white/60">
                      <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text truncate">{child.name || child.displayName}</p>
                        <p className="text-xs text-text-muted">
                          {activity.completedAt ? "Completed" : "Worked on"} a lesson
                          {activity.lastAccessed && ` • ${new Date(activity.lastAccessed).toLocaleDateString()}`}
                        </p>
                      </div>
                      {activity.completedAt && (
                        <span className="px-2.5 py-1 rounded-full bg-secondary-soft text-secondary-dark text-[10px] font-extrabold">Done</span>
                      )}
                    </div>
                  ))
                ))}
              </div>
            ) : (
              <div className="rounded-[1.75rem] bg-white/60 backdrop-blur-sm p-8 text-center border border-white/60">
                <CalendarCheck className="w-8 h-8 text-text-muted mx-auto mb-3" />
                <h3 className="text-sm font-bold text-text mb-1">No recent activity yet</h3>
                <p className="text-xs text-text-muted">Activity will appear here as your children complete lessons.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
