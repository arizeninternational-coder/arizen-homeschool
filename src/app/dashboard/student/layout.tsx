"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, NotebookText, Target, Swords,
  Heart, Trophy, ShoppingBag, UserRound, BarChart3, Library,
  CalendarDays, MessageCircle, Settings, LogOut, Sparkles, Menu, X
} from "lucide-react";

interface StudentLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/dashboard/student" },
  { icon: BookOpen,       label: "My Subjects",  href: "/dashboard/student/subjects" },
  { icon: NotebookText,   label: "Lessons",      href: "/dashboard/student/lessons" },
  { icon: Swords,         label: "Quests",       href: "/dashboard/student/quests" },
  { icon: Heart,          label: "Reflections",  href: "/dashboard/student/reflections" },
  { icon: Trophy,         label: "Badges",       href: "/dashboard/student/badges" },
  { icon: ShoppingBag,    label: "Shop",         href: "/dashboard/student/shop" },
  { icon: UserRound,      label: "Avatar",       href: "/dashboard/student/avatar" },
  { icon: BarChart3,      label: "Leaderboard",  href: "/dashboard/student/leaderboard" },
  { icon: Library,        label: "Library",      href: "/dashboard/student/library" },
  { icon: CalendarDays,   label: "Calendar",     href: "/dashboard/student/calendar" },
  { icon: MessageCircle,  label: "Messages",     href: "/dashboard/student/messages" },
  { icon: UserRound,      label: "Profile",      href: "/dashboard/student/profile" },
  { icon: Settings,       label: "Settings",     href: "/dashboard/student/settings" },
];

export default function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Load minimal stats for top bar
  useEffect(() => {
    fetch("/api/learner/profile", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const p = d.profile || {};
        setStreak(p.currentStreak || 0);
        setXp(p.totalXp || 0);
      }).catch(() => {});
    fetch("/api/coins/wallet", { credentials: "include" })
      .then(r => r.json())
      .then(d => setCoins(d.wallet?.balance || d.balance || 0))
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F7FBF7" }}>
      {/* Mobile overlay */}
      {mobileMenuOpen && !isDesktop && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Top Nav — visible on all sizes */}
      <header style={{
        background: "rgba(253,253,251,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E2E8F0", padding: "0.5rem 0.75rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 30, gap: "0.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
            display: isDesktop ? "none" : "flex", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, borderRadius: 8, border: "1px solid #E2E8F0",
            background: "#fff", color: "#374151", cursor: "pointer", flexShrink: 0,
          }}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link href="/dashboard/student" style={{ display: "flex", alignItems: "center", gap: "0.375rem", textDecoration: "none", minWidth: 0 }}>
            <Sparkles size={20} style={{ color: "#047A70", flexShrink: 0 }} />
            <span style={{ fontWeight: 800, fontSize: "0.875rem", color: "#047A70", whiteSpace: "nowrap" }}>Arizen School</span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.625rem", borderRadius: 16, background: "#FFFBEB", color: "#92400E", fontWeight: 700, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: "0.625rem" }}>$</span> {coins}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.625rem", borderRadius: 16, background: "#FEF3C7", color: "#D97706", fontWeight: 700, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
            ! {streak}d
          </div>
          <button onClick={() => { fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/"); }} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 8, border: "1px solid #E2E8F0",
            background: "rgba(239,68,68,0.04)", color: "#EF4444", cursor: "pointer", flexShrink: 0,
          }} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div style={{ display: "flex", position: "relative" }}>
        {/* Sidebar */}
        <nav style={{
          position: "fixed", top: 52, left: 0, bottom: 0, width: 240,
          padding: "0.75rem 0", borderRight: "1px solid #E2E8F0",
          background: "rgba(253,253,251,0.97)", backdropFilter: "blur(8px)",
          zIndex: 50, overflowY: "auto",
          transform: isDesktop ? "translateX(0)" : (mobileMenuOpen ? "translateX(0)" : "translateX(-100%)"),
          transition: "transform 0.25s ease",
        }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== "/dashboard/student" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} style={{
                display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 1rem",
                textDecoration: "none", margin: "1px 0.5rem", borderRadius: 10,
                background: isActive ? "#E6F5F1" : "transparent",
                color: isActive ? "#047A70" : "#374151",
                fontWeight: isActive ? 700 : 500, fontSize: "0.812rem",
              }}>
                <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
                {item.label}
              </Link>
            );
          })}
          <div style={{ borderTop: "1px solid #E2E8F0", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
            <button onClick={() => { setMobileMenuOpen(false); fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "/"); }} style={{
              display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 1rem",
              width: "100%", background: "none", border: "none", color: "#EF4444",
              fontWeight: 700, fontSize: "0.812rem", cursor: "pointer", textAlign: "left",
              margin: "1px 0.5rem", borderRadius: 10,
            }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, padding: "1.5rem", maxWidth: "100%", minWidth: 0, marginLeft: isDesktop ? 240 : 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
