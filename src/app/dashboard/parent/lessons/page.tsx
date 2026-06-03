"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, ChevronRight, ArrowLeft, Users, Loader2, GraduationCap,
  Star, CheckCircle2, Circle, Flame, Award
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PageHeader, SectionHeader, EmptyStateCard, ProgressBar } from "@/components/ui/Pill";
import { CoinIcon, StreakIcon } from "@/components/ui/Illustrations";

interface ChildSummary {
  id: string;
  name: string;
  grade: number | null;
  xp: number;
  streak: number;
  coins: number;
  lessonsCompleted: number;
}

interface LessonData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  xpReward: any;
  quest?: { id: string; title: string; theme?: { id: string; title: string; slug: string; grade: number } };
  progress?: { completedAt: string | null } | null;
}

function getRewardValue(xpReward: any): number {
  if (!xpReward) return 0;
  if (typeof xpReward === "number") return xpReward;
  if (typeof xpReward === "object") return xpReward?.base || xpReward?.amount || 0;
  try { const p = JSON.parse(xpReward); return p?.base || p?.amount || 0; } catch { return 0; }
  return 0;
}

export default function ParentLessonsPage() {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch linked children
        const childrenRes = await fetch("/api/parent/link-child", { credentials: "include" });
        let childList: ChildSummary[] = [];
        if (childrenRes.ok) {
          const cData = await childrenRes.json();
          const raw = cData.children || cData || [];
          // Fetch progress for each child
          const progressRes = await fetch("/api/parent/progress", { credentials: "include" });
          let progressData: any[] = [];
          if (progressRes.ok) {
            const pData = await progressRes.json();
            progressData = pData?.children || [];
          }
          childList = raw.map((child: any) => {
            const prog = progressData.find(
              (p: any) => p.id === child.id || p.learnerProfileId === child.learnerProfileId
            ) || {};
            return {
              id: child.id || child.childUserId,
              name: child.name || child.displayName || "Student",
              grade: child.grade || prog.grade || null,
              xp: prog.xp || prog.totalXp || 0,
              streak: prog.streak || prog.currentStreak || 0,
              coins: prog.coins || 0,
              lessonsCompleted: prog.lessonsCompleted || 0,
            };
          });
          // Also include children from progress API
          for (const p of progressData) {
            if (!childList.find(c => c.id === p.id)) {
              childList.push({
                id: p.id,
                name: p.name || "Student",
                grade: p.grade || null,
                xp: p.xp || p.totalXp || 0,
                streak: p.streak || p.currentStreak || 0,
                coins: p.coins || 0,
                lessonsCompleted: p.lessonsCompleted || 0,
              });
            }
          }
        }

        // Fetch published themes with quests and lessons
        const themesRes = await fetch("/api/themes", { credentials: "include" });
        let allLessons: LessonData[] = [];
        if (themesRes.ok) {
          const tData = await themesRes.json();
          const themes = tData.themes || [];
          for (const theme of themes) {
            for (const quest of (theme.quests || [])) {
              for (const lesson of (quest.lessons || [])) {
                allLessons.push({
                  ...lesson,
                  quest: { id: quest.id, title: quest.title, theme: { id: theme.id, title: theme.title, slug: theme.slug, grade: theme.grade } },
                });
              }
            }
          }
        }

        setChildren(childList);
        setLessons(allLessons);
      } catch (e: any) {
        console.error("[PARENT_LESSONS] Error:", e);
        setError(e.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group lessons by subject (from theme/quest theme)
  const lessonsBySubject = new Map<string, { subject: string; grade: number; lessons: LessonData[] }>();
  for (const lesson of lessons) {
    const subjectName = lesson.quest?.theme?.title || "General";
    const grade = lesson.quest?.theme?.grade || 0;
    const key = `${grade}-${subjectName}`;
    if (!lessonsBySubject.has(key)) {
      lessonsBySubject.set(key, { subject: subjectName, grade, lessons: [] });
    }
    lessonsBySubject.get(key)!.lessons.push(lesson);
  }

  const subjects = Array.from(lessonsBySubject.values()).sort((a, b) => a.grade - b.grade || a.subject.localeCompare(b.subject));

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <p className="text-sm font-bold text-text-muted">Loading lessons...</p>
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
            <Link href="/dashboard/parent" className="p-2 rounded-xl hover:bg-bg-main text-text-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-extrabold text-base text-text">Lessons</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 space-y-8 fade-in">
        {error ? (
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        ) : children.length === 0 ? (
          <EmptyStateCard
            icon={<Users className="w-8 h-8" />}
            title="No children linked"
            description="Link a child account to see their lessons and progress."
          />
        ) : (
          <>
            {/* Children summary cards */}
            <SectionHeader title="Your Children" subtitle="Tap a child to see their subjects" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => {
                const childSubjects = subjects.filter(s => !s.grade || s.grade === child.grade);
                return (
                  <div key={child.id} className="rounded-[1.5rem] border border-border-soft bg-white p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white font-extrabold text-base">
                        {(child.name || "S").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text text-sm truncate">{child.name}</h3>
                        <p className="text-xs text-text-muted">Grade {child.grade || "—"}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-soft/50 border border-gold/15">
                        <CoinIcon size={10} />
                        <span className="text-[10px] font-extrabold text-amber-800">{child.coins}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-soft/50 border border-pink/15">
                        <StreakIcon size={10} />
                        <span className="text-[10px] font-extrabold text-pink-700">{child.streak}d</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-blue-soft/50 border border-accent-blue/15">
                        <BookOpen className="w-2.5 h-2.5 text-accent-blue" />
                        <span className="text-[10px] font-extrabold text-accent-blue">{child.lessonsCompleted}</span>
                      </div>
                    </div>
                    {childSubjects.length > 0 ? (
                      <div className="space-y-1.5">
                        {childSubjects.map((subj, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-bg-main/80 border border-border-soft/50">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-text truncate">{subj.subject}</p>
                              <p className="text-[10px] text-text-muted">{subj.lessons.length} lesson{subj.lessons.length !== 1 ? "s" : ""}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0 ml-2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-text-muted italic">No subjects with published lessons yet</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Subjects with published lessons */}
            <SectionHeader title="Published Lessons" subtitle={`${lessons.length} lesson${lessons.length !== 1 ? "s" : ""} across ${subjects.length} subject${subjects.length !== 1 ? "s" : ""}`} />

            {subjects.length === 0 ? (
              <EmptyStateCard
                icon={<BookOpen className="w-8 h-8" />}
                title="No published lessons yet"
                description="Lessons will appear here once the teacher publishes them."
              />
            ) : (
              <div className="space-y-6">
                {subjects.map((subj, si) => (
                  <div key={si} className="rounded-[1.75rem] border border-border-soft bg-white overflow-hidden">
                    <div className="px-5 py-4 border-b border-border-soft flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-text">{subj.subject}</h3>
                        <p className="text-xs text-text-muted">Grade {subj.grade || "—"} • {subj.lessons.length} lesson{subj.lessons.length !== 1 ? "s" : ""}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-extrabold">
                        {subj.lessons.filter(l => l.progress?.completedAt).length}/{subj.lessons.length} done
                      </span>
                    </div>
                    <div className="divide-y divide-border-soft/50">
                      {subj.lessons.map((lesson) => {
                        const isCompleted = !!lesson.progress?.completedAt;
                        const xp = getRewardValue(lesson.xpReward);
                        const lessonUrl = lesson.quest?.theme?.slug && lesson.quest?.slug && lesson.slug
                          ? `/dashboard/student/lessons/${lesson.quest.theme.slug}/${lesson.quest.slug}/${lesson.slug}`
                          : null;
                        return (
                          <div key={lesson.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-bg-main/50 transition-colors">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-border-soft flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-text truncate">{lesson.title}</p>
                              <p className="text-xs text-text-muted truncate">{lesson.quest?.title || ""}</p>
                            </div>
                            {xp > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-gold-soft/50 border border-gold/15 text-[10px] font-extrabold text-amber-800 flex-shrink-0">
                                +{xp} XP
                              </span>
                            )}
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-extrabold flex-shrink-0",
                              isCompleted
                                ? "bg-secondary-soft text-secondary-dark"
                                : "bg-bg-main text-text-muted"
                            )}>
                              {isCompleted ? "Done" : "Not started"}
                            </span>
                            {!lessonUrl && (
                              <span className="text-[10px] text-text-muted italic flex-shrink-0">Preview only</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
