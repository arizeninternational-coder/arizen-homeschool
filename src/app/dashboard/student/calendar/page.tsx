"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Loader2, Heart, BookOpen, CheckCircle2, Circle, Sparkles, Target } from "lucide-react";
import { PageHeader, EmptyStateCard, ProgressBar } from "@/components/ui/Pill";
import { cn } from "@/lib/utils/cn";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekDays(): Date[] {
  const monday = getMonday(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CalendarPage() {
  const [checkins, setCheckins] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDays = getWeekDays();

  useEffect(() => {
    async function load() {
      try {
        // Fetch recent check-ins (last 7 days)
        const checkinRes = await fetch("/api/learner/checkin", { credentials: "include" });
        if (checkinRes.ok) {
          const cData = await checkinRes.json();
          setCheckins(cData.checkin ? [cData.checkin] : []);
        }
        // Fetch lessons for the week
        const lessonsRes = await fetch("/api/learner/lessons", { credentials: "include" });
        if (lessonsRes.ok) {
          const lData = await lessonsRes.json();
          setLessons(lData.lessons || []);
        }
      } catch (e) {
        console.error("[CALENDAR] Error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const checkinDays = new Set(
    checkins.map((c) => new Date(c.createdAt).toDateString())
  );

  // Simple goal: lessons available this week
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.progress?.completedAt).length;
  const checkinCount = checkinDays.size;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-text-muted font-bold text-sm">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      <PageHeader title="Calendar" subtitle="Your learning schedule this week" />

      {/* Weekly Grid */}
      <div className="rounded-[1.75rem] border border-border-soft bg-white overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-border-soft/50">
          {weekDays.map((day, i) => {
            const today = isToday(day);
            const hasCheckin = checkinDays.has(day.toDateString());
            return (
              <div
                key={i}
                className={cn(
                  "p-3 lg:p-4 text-center min-h-[100px] lg:min-h-[120px] transition-colors",
                  today ? "bg-primary-soft/30" : "hover:bg-bg-main/50"
                )}
              >
                <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", today ? "text-primary-dark" : "text-text-muted")}>
                  {DAY_NAMES[i]}
                </p>
                <p className={cn(
                  "text-sm font-extrabold mb-2 w-8 h-8 rounded-full flex items-center justify-center mx-auto",
                  today ? "bg-primary text-white" : "text-text"
                )}>
                  {day.getDate()}
                </p>
                <div className="space-y-1">
                  {hasCheckin && (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary-soft">
                      <Heart className="w-2.5 h-2.5 text-secondary" />
                      <span className="text-[9px] font-bold text-secondary-dark">Checked in</span>
                    </div>
                  )}
                  {!hasCheckin && today && (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-bg-main">
                      <Circle className="w-2.5 h-2.5 text-border-soft" />
                      <span className="text-[9px] font-bold text-text-muted">Not yet</span>
                    </div>
                  )}
                  {today && totalLessons > 0 && (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent-blue-soft">
                      <BookOpen className="w-2.5 h-2.5 text-accent-blue" />
                      <span className="text-[9px] font-bold text-accent-blue">{totalLessons} lessons</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* This Week's Goals */}
      <div className="rounded-[1.75rem] border border-border-soft bg-white p-5 lg:p-6">
        <h3 className="font-extrabold text-text mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          This Week&apos;s Goals
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-text flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-secondary" /> Daily Check-ins
              </span>
              <span className="text-xs font-bold text-text-muted">{checkinCount}/7</span>
            </div>
            <ProgressBar value={checkinCount} max={7} color="bg-gradient-to-r from-secondary to-secondary-light" height="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-text flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-accent-blue" /> Complete Lessons
              </span>
              <span className="text-xs font-bold text-text-muted">{completedLessons}/{totalLessons}</span>
            </div>
            <ProgressBar
              value={completedLessons}
              max={Math.max(totalLessons, 1)}
              color="bg-gradient-to-r from-accent-blue to-primary"
              height="h-2"
            />
          </div>
        </div>
      </div>

      {/* Upcoming Lessons */}
      <div className="rounded-[1.75rem] border border-border-soft bg-white p-5 lg:p-6">
        <h3 className="font-extrabold text-text mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-purple" />
          Available Lessons
        </h3>
        {lessons.length === 0 ? (
          <div className="text-center py-6">
            <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm text-text-muted italic">No published lessons available yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.slice(0, 8).map((lesson: any) => {
              const completed = !!lesson.progress?.completedAt;
              return (
                <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg-main/50 border border-border-soft/50">
                  {completed ? (
                    <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-border-soft flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text truncate">{lesson.title}</p>
                    <p className="text-xs text-text-muted">{lesson.quest?.theme?.title || "Lesson"}</p>
                  </div>
                  {completed && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary-soft text-secondary-dark text-[10px] font-extrabold">Done</span>
                  )}
                </div>
              );
            })}
            {lessons.length > 8 && (
              <p className="text-xs text-text-muted text-center pt-1">+{lessons.length - 8} more lessons</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
