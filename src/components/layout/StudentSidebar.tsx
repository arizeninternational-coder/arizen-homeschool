"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, Swords, Heart, Trophy, ShoppingBag,
  UserRound, BarChart3, Star, LogOut, Sparkles, Menu, X,
  Library, CalendarDays, MessageCircle, Settings, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CoinIcon, StreakIcon } from "@/components/ui/Illustrations";

const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", href: "/dashboard/student" },
  { icon: BookOpen, label: "My Subjects", href: "/dashboard/student/subjects" },
  { icon: BookOpen, label: "Lessons", href: "/dashboard/student/lessons" },
  { icon: Swords, label: "Quests", href: "/dashboard/student/quests" },
  { icon: Heart, label: "Reflections", href: "/dashboard/student/reflections" },
  { icon: Trophy, label: "Badges", href: "/dashboard/student/badges" },
  { icon: ShoppingBag, label: "Shop", href: "/dashboard/student/shop" },
  { icon: UserRound, label: "Avatar", href: "/dashboard/student/avatar" },
  { icon: BarChart3, label: "Leaderboard", href: "/dashboard/student/leaderboard" },
  { icon: Star, label: "Achievements", href: "/dashboard/student/achievements" },
  { icon: Library, label: "Library", href: "/dashboard/student/library" },
  { icon: CalendarDays, label: "Calendar", href: "/dashboard/student/calendar" },
  { icon: MessageCircle, label: "Messages", href: "/dashboard/student/messages" },
  { icon: Settings, label: "Settings", href: "/dashboard/student/settings" },
];

export function StudentSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/learner/profile", { credentials: "include" })
      .then(r => r.json())
      .then(d => setProfile(d.profile || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const studentName = profile?.name || profile?.displayName || "Student";
  const grade = profile?.grade || "";
  const totalXp = profile?.totalXp || 0;
  const currentStreak = profile?.currentStreak || 0;
  const coins = profile?.wallet?.balance || 0;
  const avatarLevel = Math.floor(totalXp / 100) + 1;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-border-soft">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-soft">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_4px_15px_rgba(79,70,229,0.25)]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-extrabold text-lg text-text tracking-tight">Arizen</span>
      </div>

      {/* Stats pills */}
      <div className="px-4 py-3 border-b border-border-soft flex gap-2">
        <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-soft/50 border border-gold/15">
          <CoinIcon size={16} />
          <span className="text-xs font-extrabold text-amber-800">{coins}</span>
        </div>
        <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-soft/50 border border-pink/15">
          <StreakIcon size={16} />
          <span className="text-xs font-extrabold text-pink-700">{currentStreak}d</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard/student" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-primary-soft to-secondary-soft/40 text-primary-dark shadow-[0_2px_8px_rgba(79,70,229,0.08)]"
                  : "text-text-muted hover:bg-bg-main hover:text-text"
              )}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Student Profile Card */}
      <div className="px-3 py-3 border-t border-border-soft">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-gradient-to-r from-primary-soft/50 to-accent-purple-soft/40 border border-primary/10 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md flex-shrink-0">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text truncate">{studentName}</p>
            <p className="text-xs text-text-muted">Grade {grade} • Level {avatarLevel}</p>
          </div>
        </div>
        <button
          onClick={() => {
            fetch("/api/auth/logout", { method: "POST", credentials: "include" })
              .then(() => window.location.href = "/");
          }}
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
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-250 lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-border-soft flex items-center justify-between px-4 lg:px-8 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-bg-main text-text-muted">
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard/student" className="flex items-center gap-2 lg:hidden">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-extrabold text-sm text-primary">Arizen</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-soft/50 border border-gold/15">
              <CoinIcon size={14} />
              <span className="text-xs font-extrabold text-amber-800">{coins}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-soft/50 border border-pink/15">
              <StreakIcon size={14} />
              <span className="text-xs font-extrabold text-pink-700">{currentStreak}d</span>
            </div>
            <button
              onClick={() => fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/")}
              className="p-2 rounded-xl hover:bg-red-50 text-text-muted hover:text-danger transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
