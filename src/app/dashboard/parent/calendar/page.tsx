"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, ChevronLeft, ChevronRight, Clock, BookOpen,
  CheckCircle2, Flame, Star, Target, Award, Sparkles,
  Loader2, AlertCircle
} from "lucide-react";
import { GradientButton } from "@/components/ui/Pill";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "lesson" | "checkin" | "achievement" | "homework";
  completed?: boolean;
  xp?: number;
  childName?: string;
}

export default function ParentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadEvents();
  }, [year, month]);

  async function loadEvents() {
    setLoading(true);
    setError(false);
    try {
      // Fetch children's progress data for calendar
      const [progressRes, checkinsRes] = await Promise.all([
        fetch("/api/parent/progress", { credentials: "include" }).catch(() => null),
        fetch("/api/parent/child-checkins", { credentials: "include" }).catch(() => null),
      ]);

      const newEvents: CalendarEvent[] = [];

      if (progressRes?.ok) {
        const pData = await progressRes.json();
        const children = pData?.children || [];
        for (const child of children) {
          // Add completed lessons as events
          if (child.recentActivity) {
            for (const activity of child.recentActivity) {
              if (activity.completedAt) {
                newEvents.push({
                  id: `lesson-${child.id}-${activity.completedAt}`,
                  title: activity.lessonTitle || "Lesson completed",
                  date: activity.completedAt.split("T")[0],
                  type: "lesson",
                  completed: true,
                  xp: activity.xpEarned || 0,
                  childName: child.name || child.displayName,
                });
              }
            }
          }
          // Note: streak days are no longer fabricated from a counter.
          // The streak is shown as a single summary metric on the dashboard.
          // Real activity events (lessons, check-ins) are what matter on the calendar.
        }
      }

      if (checkinsRes?.ok) {
        const cData = await checkinsRes.json();
        for (const c of (cData.checkins || [])) {
          if (c.createdAt) {
            newEvents.push({
              id: `checkin-${c.id}`,
              title: `Check-in: ${c.emotionLabel || c.emotion || "Good"}`,
              date: c.createdAt.split("T")[0],
              type: "checkin",
              completed: true,
              childName: c.childName || "Child",
            });
          }
        }
      }

      setEvents(newEvents);
    } catch (e) {
      console.error("[CALENDAR] Error:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // Calendar grid calculation
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedDateEvents = selectedDate
    ? events.filter(e => {
        const d = selectedDate;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return e.date === dateStr;
      })
    : [];

  const typeIcons: Record<string, any> = {
    lesson: BookOpen,
    checkin: Flame,
    achievement: Star,
    homework: Target,
  };
  const typeColors: Record<string, string> = {
    lesson: "bg-indigo-100 text-indigo-700",
    checkin: "bg-pink-100 text-pink-700",
    achievement: "bg-amber-100 text-amber-700",
    homework: "bg-emerald-100 text-emerald-700",
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-bold text-slate-500">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Family Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track your children's learning journey</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">Failed to load calendar data</p>
            <button onClick={loadEvents} className="text-xs font-bold text-red-600 hover:text-red-700 mt-1">Try again</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar grid */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-extrabold text-slate-900">{monthName}</h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">{d}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Previous month padding */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`prev-${i}`} className="aspect-square flex items-center justify-center">
                <span className="text-xs text-slate-300">{daysInPrevMonth - firstDay + i + 1}</span>
              </div>
            ))}
            {/* Current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDate(day);
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative ${
                    isToday(day) ? "bg-indigo-500 text-white shadow-md" :
                    isSelected ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300" :
                    hasEvents ? "bg-slate-50 hover:bg-slate-100" :
                    "hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-xs font-bold ${isToday(day) ? "text-white" : "text-slate-700"}`}>{day}</span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((e, ei) => {
                        const Icon = typeIcons[e.type] || BookOpen;
                        return (
                          <div key={ei} className={`w-1.5 h-1.5 rounded-full ${e.type === "lesson" ? "bg-indigo-400" : e.type === "checkin" ? "bg-pink-400" : "bg-amber-400"}`} />
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date events */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-3">
            {selectedDate ? selectedDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" }) : "Select a date"}
          </h3>

          {!selectedDate ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-400">Click a date to see events</p>
            </div>
          ) : selectedDateEvents.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-400">No events on this day</p>
              <p className="text-[10px] text-slate-300 mt-1">Activity will appear as your children learn</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map(event => {
                const Icon = typeIcons[event.type] || BookOpen;
                return (
                  <div key={event.id} className={`rounded-xl p-3 border ${typeColors[event.type] || "bg-slate-50 text-slate-700"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{event.title}</span>
                    </div>
                    {event.childName && (
                      <p className="text-[10px] opacity-75 ml-5">{event.childName}</p>
                    )}
                    {event.xp && event.xp > 0 && (
                      <p className="text-[10px] opacity-75 ml-5">+{event.xp} XP</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick stats */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">This Month</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-center">
                <p className="text-lg font-black text-indigo-700">{events.filter(e => e.type === "lesson" && e.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length}</p>
                <p className="text-[10px] font-bold text-indigo-600">Lessons</p>
              </div>
              <div className="rounded-xl bg-pink-50 p-2.5 text-center">
                <p className="text-lg font-black text-pink-700">{events.filter(e => e.type === "checkin" && e.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length}</p>
                <p className="text-[10px] font-bold text-pink-600">Check-ins</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming / Recent */}
      <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 mb-3">Recent Activity</h3>
        {events.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No activity recorded yet</p>
            <p className="text-[10px] text-slate-300 mt-1">Activity will appear here as your children complete lessons and check in</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 10).map(event => {
              const Icon = typeIcons[event.type] || BookOpen;
              return (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[event.type] || "bg-slate-100 text-slate-600"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{event.title}</p>
                    <p className="text-[10px] text-slate-500">{event.childName} · {new Date(event.date).toLocaleDateString("default", { month: "short", day: "numeric" })}</p>
                  </div>
                  {event.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
