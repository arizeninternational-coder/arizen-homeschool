"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users, Flame, Star, BookOpen, GraduationCap, LogOut, Link2,
  CalendarCheck, ChevronRight, Award
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PageHeader, SectionHeader, GradientButton, StatCard, EmptyStateCard } from "@/components/ui/Pill";
import { CoinIcon, StreakIcon, BookIcon } from "@/components/ui/Illustrations";

export default function ParentDashboard() {
  const pathname = usePathname();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    try {
      const [childrenRes, progressRes] = await Promise.all([
        fetch("/api/parent/children", { credentials: "include" }),
        fetch("/api/parent/progress", { credentials: "include" }),
      ]);
      const cData = await childrenRes.json();
      const pData = await progressRes.json();
      const childList = cData.children || cData || [];
      const progressData = pData?.progress || [];
      const merged = childList.map((child: any) => ({
        ...child,
        progress: progressData.find((p: any) => p.childId === child.id || p.learnerProfileId === child.learnerProfileId) || {},
      }));
      setChildren(merged);
    } catch (e) {
      console.error("[PARENT_DASHBOARD] Error:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const totalXp = children.reduce((sum, c) => sum + (c.progress?.totalXp || 0), 0);
  const totalStreaks = children.reduce((sum, c) => sum + (c.progress?.currentStreak || 0), 0);
  const totalLessons = children.reduce((sum, c) => sum + (c.progress?.completedLessons || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full spinner" />
          <p className="text-sm font-bold text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border-soft">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base text-text tracking-tight">Arizen</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted ml-2">Parent</span>
            </div>
          </div>
          <button
            onClick={() => fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/")}
            className="p-2 rounded-xl hover:bg-red-50 text-text-muted hover:text-danger transition-colors"
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
                "px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
                pathname === tab.href
                  ? "border-secondary text-secondary-dark"
                  : "border-transparent text-text-muted hover:text-text"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 space-y-8 fade-in">
        {error ? (
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Failed to load data</h3>
            <GradientButton variant="primary" onClick={loadChildren}>Try Again</GradientButton>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Children"
                value={children.length}
                icon={<Users className="w-5 h-5 text-secondary" />}
                gradient="bg-card-gradient-green"
                borderColor="border-secondary/15"
                textColor="text-secondary-dark"
              />
              <StatCard
                label="Active Streaks"
                value={`${totalStreaks}d`}
                icon={<Flame className="w-5 h-5 text-pink" />}
                gradient="bg-card-gradient-pink"
                borderColor="border-pink/15"
                textColor="text-pink"
              />
              <StatCard
                label="Total XP"
                value={totalXp.toLocaleString()}
                icon={<Star className="w-5 h-5 text-gold" />}
                gradient="bg-card-gradient-gold"
                borderColor="border-gold/15"
                textColor="text-amber-700"
              />
              <StatCard
                label="Lessons Done"
                value={totalLessons}
                icon={<BookIcon size={20} className="text-accent-blue" />}
                gradient="bg-card-gradient-blue"
                borderColor="border-accent-blue/15"
                textColor="text-accent-blue"
              />
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
              <div className="rounded-[1.75rem] border-2 border-dashed border-secondary/30 bg-white p-12 text-center">
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
                {children.map((child) => {
                  const p = child.progress || {};
                  return (
                    <div
                      key={child.id || child.email}
                      className="rounded-[1.5rem] border border-border-soft bg-white p-5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all duration-200"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white text-lg font-extrabold shadow-md flex-shrink-0">
                          {(child.name || child.displayName || "C").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-text truncate">{child.name || child.displayName || "Student"}</h3>
                          <p className="text-xs text-text-muted">Grade {child.grade || "—"}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-accent-purple-soft text-accent-purple text-[10px] font-extrabold uppercase tracking-wider">
                          Level {Math.floor((p.totalXp || 0) / 100) + 1}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-soft/50 border border-gold/15">
                          <CoinIcon size={12} />
                          <span className="text-[11px] font-extrabold text-amber-800">{p.coins || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-soft/50 border border-pink/15">
                          <StreakIcon size={12} />
                          <span className="text-[11px] font-extrabold text-pink-700">{p.currentStreak || 0}d</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-blue-soft/50 border border-accent-blue/15">
                          <BookOpen className="w-3 h-3 text-accent-blue" />
                          <span className="text-[11px] font-extrabold text-accent-blue">{p.completedLessons || 0} lessons</span>
                        </div>
                      </div>
                      <Link href="/dashboard/parent/progress" className="block">
                        <GradientButton variant="outline" size="sm" className="w-full" icon={<Award className="w-4 h-4" />}>
                          View Progress
                        </GradientButton>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recent Activity */}
            <SectionHeader title="Recent Activity" subtitle="Latest progress across your children" />
            <div className="rounded-[1.75rem] border border-border-soft bg-white p-8 text-center">
              <CalendarCheck className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <h3 className="text-sm font-bold text-text mb-1">Activity feed coming soon</h3>
              <p className="text-xs text-text-muted">You&apos;ll see your children&apos;s latest learning activity here.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
