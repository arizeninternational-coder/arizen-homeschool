"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, GraduationCap, Users, ShoppingBag,
  Settings, LogOut, Sparkles, Menu, X, BarChart3, Target, Award
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
  { icon: GraduationCap, label: "Grades", href: "/dashboard/admin/grades" },
  { icon: BookOpen, label: "Lessons", href: "/dashboard/admin/lessons" },
  { icon: Target, label: "Quests", href: "/dashboard/admin/quests" },
  { icon: GraduationCap, label: "Curriculum", href: "/dashboard/admin/curriculum/import" },
  { icon: Award, label: "Badges", href: "/dashboard/admin/badges" },
  { icon: ShoppingBag, label: "Shop", href: "/dashboard/admin/shop" },
  { icon: Users, label: "Learners", href: "/dashboard/admin/learners" },
  { icon: Users, label: "Users", href: "/dashboard/admin/users" },
  { icon: BarChart3, label: "Reports", href: "/dashboard/admin/reports" },
  { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
];

export function TeacherSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center shadow-[0_4px_15px_rgba(79,70,229,0.2)]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-[#0F172A] tracking-tight block leading-tight">Arizen</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#64748B]">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-indigo-50/80 to-violet-50/60 text-[#4F46E5] shadow-[0_2px_8px_rgba(79,70,229,0.06)]"
                  : "text-[#64748B] hover:bg-[#F8F7FF] hover:text-[#0F172A]"
              )}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3">
        <button
          onClick={() => fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/")}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#64748B] hover:bg-red-50/80 hover:text-[#DC2626] w-full transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
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
        <header className="sticky top-0 z-30 h-14 bg-white/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-[#F8F7FF] text-[#64748B]">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <Sparkles className="w-5 h-5 text-[#4F46E5]" />
            <span className="font-extrabold text-sm">Arizen Admin</span>
          </div>
          <div className="hidden lg:block" />
          <button
            onClick={() => fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/")}
            className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-[#DC2626] transition-colors"
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
