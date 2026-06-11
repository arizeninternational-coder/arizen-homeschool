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
        const checkinRes = await fetch("/api/learner/checkin", { credentials: "include" });
        if (checkinRes.ok) {
          const cData = await checkinRes.json();
          setCheckins(cData.checkin ? [cData.checkin] : []);
        }
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

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.progress?.completedAt).length;
  const checkinCount = checkinDays.size;

  // Distribute lessons across the week (Mon-Fri), 4-6 lessons per day
  const lessonsByDay: Record<number, any[]> = {};
  const weekdayIndices = [0, 1, 2, 3, 4]; // Mon-Fri
  
  lessons.forEach((lesson: any, i: number) => {
    const dayIndex = weekdayIndices[i % weekdayIndices.length];
    if (!lessonsByDay[dayIndex]) lessonsByDay[dayIndex] = [];
    lessonsByDay[dayIndex].push(lesson);
  });

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
    <div className="space-y-6 fade-in">
      <PageHeader title="Calendar" subtitle="Your learning schedule this week" />

      {/* Weekly Grid */}
      <div className="rounded-[1.75rem] border border-white/60 bg-white overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-white/30">
          {weekDays.map((day, i) => {
            const today = isToday(day);
            const hasCheckin = checkinDays.has(day.toDateString());
            const dayLessons = lessonsByDay[i] || [];
            const isWeekend = i >= 5;
            
            return (
              <div
                key={i}
                className={cn(
                  "p-2 lg:p-3 text-center min-h-[120px] lg:min-h-[160px] transition-colors",
                  today ? "bg-primary-soft/30" : "hover:bg-bg-main/50",
                  isWeekend && "bg-bg-main/30"
                )}
              >
                <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", today ? "text-primary-dark" : "text-text-muted")}>
                  {DAY_NAMES[i]}
                </p>
                <p className={cn(
                  "text-sm font-extrabold mb-2 w-7 h-7 rounded-full flex items-center justify-center mx-auto",
                  today ? "bg-primary text-white" : "text-text"
                )}>
                  {day.getDate()}
                </p>
                <div className="space-y-1">
                  {hasCheckin && (
                    <div className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-secondary-soft">
                      <Heart className="w-2 h-2 text-secondary" />
                      <span className="text-[8px] font-bold text-secondary-dark">Checked in</span>
                    </div>
                  )}
                  {!hasCheckin && today && (
                    <div className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-bg-main">
                      <Circle className="w-2 h-2 text-border-soft" />
                      <span className="text-[8px] font-bold text-text-muted">Not yet</span>
                    </div>
                  )}
                  {dayLessons.length > 0 && (
                    <div className="space-y-0.5">
                      {dayLessons.slice(0, 3).map((lesson: any, li: number) => {
                        const completed = !!lesson.progress?.completedAt;
                        return (
                          <div key={li} className={cn(
                            "text-[8px] font-bold truncate px-1 py-0.5 rounded",
                            completed ? "bg-secondary-soft text-secondary-dark" : "bg-accent-blue-soft/50 text-accent-blue"
                          )}>
                            {completed ? "✓ " : ""}{lesson.title.substring(0, 20)}
                          </div>
                        );
                      })}
                      {dayLessons.length > 3 && (
                        <p className="text-[8px] text-text-muted font-semibold">+{dayLessons.length - 3} more</p>
                      )}
                    </div>
                  )}
                  {isWeekend && dayLessons.length === 0 && (
                    <p className="text-[8px] text-text-muted italic">Rest day</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* This Week's Goals */}
      <div className="rounded-[1.75rem] border border-white/60 bg-white p-5 lg:p-6">
        <h3 className="font-extrabold text-text mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          This Week's Goals
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

      {/* Weekly Lesson Summary */}
      <div className="rounded-[1.75rem] border border-white/60 bg-white p-5 lg:p-6">
        <h3 className="font-extrabold text-text mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-purple" />
          This Week's Lessons
        </h3>
        {lessons.length === 0 ? (
          <div className="text-center py-6">
            <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm text-text-muted italic">No published lessons available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weekdayIndices.map((dayIdx) => {
              const dayLessons = lessonsByDay[dayIdx] || [];
              if (dayLessons.length === 0) return null;
              const dayDate = weekDays[dayIdx];
              return (
                <div key={dayIdx}>
                  <p className="text-xs font-extrabold text-text-muted mb-1.5">
                    {DAY_NAMES[dayIdx]}, {formatDate(dayDate)} {isToday(dayDate) && <span className="text-primary">(Today)</span>}
                  </p>
                  <div className="space-y-1.5 ml-2">
                    {dayLessons.map((lesson: any, li: number) => {
                      const completed = !!lesson.progress?.completedAt;
                      return (
                        <div key={li} className="flex items-center gap-2 p-2 rounded-lg bg-bg-main/50">
                          {completed ? (
                            <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-border-soft flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-text truncate">{lesson.title}</p>
                            <p className="text-[10px] text-text-muted">{lesson.subject || "Lesson"}</p>
                          </div>
                          {completed && (
                            <span className="px-1.5 py-0.5 rounded-full bg-secondary-soft text-secondary-dark text-[9px] font-extrabold">Done</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
