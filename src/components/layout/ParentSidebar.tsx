"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, BarChart3, BookOpen, CalendarDays, MessageCircle,
  Settings, HelpCircle, LogOut, Sparkles, Menu, Award,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", href: "/dashboard/parent" },
  { icon: Users, label: "My Children", href: "/dashboard/parent/children" },
  { icon: BarChart3, label: "Progress", href: "/dashboard/parent/progress" },
  { icon: BookOpen, label: "Lessons", href: "/dashboard/parent/lessons" },
  { icon: Award, label: "Reports", href: "/dashboard/parent/reports" },
  { icon: MessageCircle, label: "Messages", href: "/dashboard/parent/messages" },
  { icon: CalendarDays, label: "Calendar", href: "/dashboard/parent/calendar" },
  { icon: Settings, label: "Settings", href: "/dashboard/parent/settings" },
  { icon: HelpCircle, label: "Support", href: "/dashboard/parent/support" },
];

export function ParentSidebar({ children }: { children: React.ReactNode }) {
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00A884] to-[#047A70] flex items-center justify-center shadow-[0_4px_15px_rgba(0,168,132,0.2)]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-text tracking-tight">Arizen</span>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#64748B]">Parent</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard/parent" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-[#00A884]/10 to-[#047A70]/5 text-[#00A884] shadow-[0_2px_8px_rgba(0,168,132,0.06)]"
                  : "text-[#64748B] hover:bg-[#F8F7FF] hover:text-[#0F172A]"
              )}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="px-3 py-3">
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
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.03)]">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden fade-in" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden shadow-xl",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-white/70 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-bg-main text-text-muted">
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard/parent" className="flex items-center gap-2 lg:hidden">
              <Sparkles className="w-5 h-5 text-[#00A884]" />
              <span className="font-extrabold text-sm text-[#00A884]">Arizen</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/")}
              className="p-2 rounded-xl hover:bg-red-50 text-text-muted hover:text-danger transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 max-w-[1200px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}