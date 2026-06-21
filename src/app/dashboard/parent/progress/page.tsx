"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, TrendingUp, BookOpen, Flame, Star, Award,
  CheckCircle2, Circle, Clock, Loader2, Users
} from "lucide-react";
import { PageHeader, SectionHeader, ProgressBar, StatCard, EmptyStateCard } from "@/components/ui/Pill";
import { cn } from "@/lib/utils/cn";

interface ChildProgress {
  id: string;
  learnerProfileId: string;
  name: string;
  grade: number | null;
  xp: number;
  streak: number;
  bestStreak: number;
  coins: number;
  lessonsCompleted: number;
  recentActivity: { lessonId: string; completedAt: string | null; lastAccessed: string | null }[];
}

export default function ParentProgressPage() {
  const [children, setChildren] = useState<ChildProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    try {
      const res = await fetch("/api/parent/progress", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) { setError("Please log in to view progress."); setLoading(false); return; }
        setError("Unable to load progress data.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setChildren(data.children || []);
    } catch {
      setError("Unable to load progress. Please try again.");
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-bold text-text-muted">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-8">
        <EmptyStateCard
          icon={<TrendingUp className="w-8 h-8" />}
          title={error}
          description="Go back to your dashboard and try again."
          action={
            <button onClick={() => { setError(null); setLoading(true); loadProgress(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors">
              Try Again
            </button>
          }
        />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-8">
        <Link href="/dashboard/parent" className="inline-flex items-center gap-2 text-text-muted text-sm font-semibold mb-6 hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <EmptyStateCard
          icon={<Users className="w-8 h-8" />}
          title="No children linked"
          description="Link your child's student account to start tracking their progress."
          action={
            <Link href="/dashboard/parent/children"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors">
              Link a Child
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <Link href="/dashboard/parent" className="inline-flex items-center gap-2 text-text-muted text-sm font-semibold hover:text-text transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <PageHeader
        title="Progress"
        subtitle={`Detailed learning progress for ${children.length} child${children.length !== 1 ? "ren" : ""}.`}
      />

      {children.map((child) => {
        const level = Math.floor(child.xp / 100) + 1;
        const xpInLevel = child.xp % 100;

        return (
          <div key={child.id || child.learnerProfileId} className="rounded-[1.5rem] bg-white border border-gray-100 p-5 lg:p-6 shadow-sm">
            {/* Child header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-lg font-black text-white">
                  {(child.name || "S").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-extrabold text-text">{child.name}</h2>
                <p className="text-xs text-text-muted">Grade {child.grade || "—"} · Level {level}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <StatCard
                label="Lessons Done"
                value={child.lessonsCompleted}
                icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
                gradient="bg-white"
                textColor="text-indigo-700"
              />
              <StatCard
                label="Total XP"
                value={child.xp.toLocaleString()}
                icon={<Star className="w-5 h-5 text-amber-500" />}
                gradient="bg-white"
                textColor="text-amber-700"
              />
              <StatCard
                label="Streak"
                value={`${child.streak}d`}
                icon={<Flame className="w-5 h-5 text-pink-500" />}
                gradient="bg-white"
                textColor="text-pink-600"
                sublabel={child.bestStreak > 0 ? `Best: ${child.bestStreak}d` : undefined}
              />
              <StatCard
                label="Coins"
                value={child.coins}
                icon={<Award className="w-5 h-5 text-emerald-500" />}
                gradient="bg-white"
                textColor="text-emerald-700"
              />
            </div>

            {/* Level progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-text-muted">Level {level} Progress</span>
                <span className="text-xs font-bold text-text-muted">{xpInLevel}/100 XP</span>
              </div>
              <ProgressBar value={xpInLevel} max={100} color="bg-gradient-to-r from-indigo-500 to-violet-500" height="h-2.5" />
            </div>

            {/* Recent activity */}
            <div>
              <h3 className="text-sm font-extrabold text-text mb-3">Recent Activity</h3>
              {child.recentActivity && child.recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {child.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/80">
                      {activity.completedAt ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text truncate">
                          {activity.completedAt ? "Completed" : "Worked on"} a lesson
                        </p>
                        {activity.lastAccessed && (
                          <p className="text-[10px] text-text-muted">
                            {new Date(activity.lastAccessed).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                      {activity.completedAt && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-extrabold">Done</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">No recent activity yet.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
