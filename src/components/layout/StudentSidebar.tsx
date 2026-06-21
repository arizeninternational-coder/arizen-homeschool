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

export function StudentSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [streakData, setStreakData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/learner/profile", { credentials: "include" })
      .then(r => r.json()).then(d => setProfile(d.profile || null)).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/learner/progress/summary", { credentials: "include" })
      .then(r => r.json()).then(d => setSummary(d)).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/learner/streak-history", { credentials: "include" })
      .then(r => r.json()).then(d => setStreakData(d)).catch(() => {});
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const studentName = profile?.displayName || profile?.name || "Student";
  const grade = profile?.grade || "";
  const currentStreak = streakData?.currentStreak || summary?.streak || profile?.currentStreak || 0;
  const initials = studentName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  // Use real active days from streak-history API, fallback to empty
  const streakDays = streakData?.activeDays || [];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white shadow-[2px_0_16px_rgba(0,0,0,0.04)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-extrabold text-xl text-gray-900 tracking-tight">Arizen</span>
      </div>

      {/* Streak Card */}
      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 p-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-bold text-orange-700">Streak</span>
            </div>
            <span className="text-lg font-black text-orange-600 leading-none">{currentStreak}<span className="text-xs font-bold">d</span></span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {streakDays.map((day: any, i: number) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className={cn(
                  "text-[8px] font-bold",
                  day.isToday ? "text-indigo-600" : day.isWeekend ? "text-gray-300" : "text-gray-400"
                )}>
                  {day.dayLabel}
                </span>
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all",
                  day.isToday ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" :
                  day.isActive ? "bg-emerald-500 text-white border-emerald-500" :
                  day.isWeekend ? "bg-gray-50 text-gray-300 border-gray-100" :
                  "bg-white text-gray-300 border-gray-100"
                )}>
                  {day.isToday ? "★" : day.isActive ? "✓" : day.isWeekend ? "·" : "·"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard/student" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.active ? item.href : "#"}
              onClick={(e) => { if (!item.active) e.preventDefault(); setMobileOpen(false); }}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                !item.active && "opacity-40 cursor-not-allowed",
                isActive && item.active
                  ? "bg-indigo-50 text-indigo-700"
                  : item.active && "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {!item.active && (
                <span className="text-[6px] font-bold uppercase tracking-wider bg-pink-100 text-pink-500 px-1.5 py-0.5 rounded-full leading-none">Soon</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Student Profile */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{studentName}</p>
            <p className="text-[10px] text-gray-500">Grade {grade || "—"}</p>
          </div>
        </div>
        <button
          onClick={() => { fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/"); }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F7F8FF]">
      <aside className="hidden lg:flex lg:w-[290px] lg:flex-col lg:fixed lg:inset-y-0 z-40">
        {sidebarContent}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden fade-in" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[290px] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden shadow-xl",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>
      <div className="flex-1 lg:ml-[290px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard/student" className="flex items-center gap-2 lg:hidden">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="font-extrabold text-sm text-indigo-600">Arizen</span>
            </Link>
          </div>
          <button
            onClick={() => fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/")}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>
        <main className="flex-1 p-5 lg:p-7 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
