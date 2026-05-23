"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Home, BookOpen, Swords, Trophy, User, Settings,
  ChevronLeft, ChevronRight, GraduationCap, Menu, LogOut,
} from "lucide-react";
import { useUIStore } from "@/stores";
import { XpBadge, StreakBadge, Avatar } from "@/components/ui";
import { LearnerSwitcher } from "@/components/profile/LearnerSwitcher";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Themes", href: "/themes", icon: BookOpen },
  { label: "Quests", href: "/quests", icon: Swords },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [user, setUser] = useState<any>(null);
  const [learners, setLearners] = useState<any[]>([]);

  useEffect(() => {
    // Get user from session
    fetch("/api/auth/session").then(r => r.json()).then(data => {
      if (data?.user) {
        setUser(data.user);
        // Get all learners for this guild
        fetch("/api/learners").then(r => r.json()).then(d => {
          setLearners(d.learners || []);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-surface-raised border-r border-border transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-0 lg:w-20",
        !sidebarOpen && "overflow-hidden lg:overflow-visible"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "lg:justify-center lg:w-full")}>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-sm text-text truncate">Arizen</span>}
          </div>
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-surface-sunken text-text-muted transition-colors hidden lg:block">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Learner switcher / XP bar */}
        {sidebarOpen ? (
          <div className="px-3 py-3 border-b border-border flex-shrink-0">
            {user && learners.length > 1 ? (
              <LearnerSwitcher currentLearnerId={user.learnerProfileId} learners={learners} />
            ) : user ? (
              <div className="flex items-center gap-3 px-2">
                <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate">{user.displayName}</p>
                  <p className="text-xs text-text-muted">Grade {user.grade}</p>
                </div>
              </div>
            ) : null}
            {sidebarOpen && user && (
              <div className="flex items-center gap-2 mt-2 px-2">
                <XpBadge amount={user.totalXp || 0} />
                <StreakBadge count={user.currentStreak || 0} />
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 border-b border-border flex justify-center flex-shrink-0">
            <Avatar src={user?.avatarUrl} name={user?.displayName} size="sm" />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                "text-text-muted hover:bg-surface-sunken hover:text-text",
                !sidebarOpen && "lg:justify-center lg:px-0"
              )}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Logout */}
        {sidebarOpen && (
          <div className="p-3 border-t border-border flex-shrink-0">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-sunken hover:text-text w-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export function TopBar({ title }: { title?: string }) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  return (
    <header className={cn(
      "sticky top-0 z-30 h-14 bg-surface-raised/80 backdrop-blur-md border-b border-border flex items-center px-4 gap-3 transition-all",
      sidebarOpen ? "lg:ml-64" : "lg:ml-20"
    )}>
      <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-surface-sunken text-text-muted lg:hidden">
        <Menu className="w-5 h-5" />
      </button>
      {title && <h1 className="heading-sm">{title}</h1>}
    </header>
  );
}
