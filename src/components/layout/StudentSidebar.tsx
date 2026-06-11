"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, Swords, Heart, Trophy, CalendarDays,
  Star, LogOut, Sparkles, Menu, X, Settings,
  ShoppingBag, UserRound, MessageCircle, Flame
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", href: "/dashboard/student", active: true },
  { icon: BookOpen, label: "My Subjects", href: "/dashboard/student/subjects", active: true },
  { icon: Swords, label: "Quests", href: "/dashboard/student/quests", active: true },
  { icon: Heart, label: "Reflections", href: "/dashboard/student/reflections", active: true },
  { icon: Trophy, label: "Badges", href: "/dashboard/student/badges", active: true },
  { icon: CalendarDays, label: "Calendar", href: "/dashboard/student/calendar", active: true },
  { icon: MessageCircle, label: "Messages", href: "/dashboard/student/messages", active: false },
  { icon: Star, label: "Shop", href: "/dashboard/student/shop", active: false },
  { icon: UserRound, label: "Avatar", href: "/dashboard/student/avatar", active: false },
  { icon: Settings, label: "Settings", href: "/dashboard/student/settings", active: true },
];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function StudentSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch("/api/learner/profile", { credentials: "include" })
      .then(r => r.json()).then(d => setProfile(d.profile || null)).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/learner/progress/summary", { credentials: "include" })
      .then(r => r.json()).then(d => setSummary(d)).catch(() => {});
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const studentName = profile?.displayName || profile?.name || "Student";
  const grade = profile?.grade || "";
  const currentStreak = summary?.streak || profile?.currentStreak || 0;
  const initials = studentName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  // Build 7-day streak data
  const today = new Date();
  const monday = getMonday(today);
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
    const isPast = d < new Date(today.setHours(0, 0, 0, 0));
    const isWeekend = i >= 5;
    // For now, mark past weekdays as active if streak > 0
    const isActive = currentStreak > 0 && isPast && !isWeekend;
    return { isToday, isPast, isWeekend, isActive, dayLabel: DAY_LABELS[i] };
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_4px_15px_rgba(79,70,229,0.25)]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-extrabold text-lg text-text tracking-tight">Arizen</span>
      </div>

      {/* ── Streak Card ── */}
      <div className="px-4 pb-3">
        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-extrabold text-orange-700">Streak</span>
            </div>
            <span className="text-sm font-black text-orange-600">{currentStreak}d 🔥</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {streakDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className={cn(
                  "text-[8px] font-bold mb-0.5",
                  day.isToday ? "text-primary" : day.isWeekend ? "text-text-muted/40" : "text-text-muted"
                )}>
                  {day.dayLabel}
                </span>
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold border transition-all",
                  day.isToday ? "bg-primary text-white border-primary shadow-sm" :
                  day.isActive ? "bg-secondary text-white border-secondary" :
                  day.isPast && !day.isWeekend ? "bg-red-50 text-red-300 border-red-100" :
                  day.isWeekend ? "bg-slate-50 text-slate-300 border-slate-100" :
                  "bg-white text-slate-300 border-slate-100"
                )}>
                  {day.isToday ? "★" : day.isActive ? "✓" : day.isWeekend ? "·" : day.isPast ? "○" : "·"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard/student" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.active ? item.href : "#"}
              onClick={(e) => { if (!item.active) e.preventDefault(); setMobileOpen(false); }}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150",
                !item.active && "opacity-50 cursor-not-allowed",
                isActive && item.active
                  ? "bg-gradient-to-r from-indigo-50/80 to-violet-50/60 text-[#4F46E5] shadow-[0_2px_8px_rgba(79,70,229,0.06)]"
                  : item.active && "text-[#64748B] hover:bg-[#F8F7FF] hover:text-[#0F172A]"
              )}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {!item.active && (
                <span className="text-[7px] font-extrabold uppercase tracking-wider bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Soon</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Student Profile */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-gradient-to-r from-primary-soft/40 to-accent-purple-soft/30 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-extrabold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text truncate">{studentName}</p>
            <p className="text-xs text-text-muted">Grade {grade}</p>
          </div>
        </div>
        <button
          onClick={() => { fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/"); }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-text-muted hover:bg-red-50 hover:text-danger w-full transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg-main">
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.03)]">
        {sidebarContent}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden fade-in" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden shadow-xl",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-14 bg-white/70 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-bg-main text-text-muted">
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard/student" className="flex items-center gap-2 lg:hidden">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-extrabold text-sm text-primary">Arizen</span>
            </Link>
          </div>
          <button
            onClick={() => fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/")}
            className="p-2 rounded-xl hover:bg-red-50 text-text-muted hover:text-danger transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-6 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
