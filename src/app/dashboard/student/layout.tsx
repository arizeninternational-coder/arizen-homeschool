"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, type ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles, LogOut, Zap, Flame, Menu, X, ShoppingBag,
  Compass, BookOpen, Target, Award, Heart, User
} from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

interface StudentLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Compass, label: "Dashboard", href: "/dashboard/student" },
  { icon: BookOpen, label: "My Lessons", href: "/dashboard/student/lessons" },
  { icon: Target, label: "Quests", href: "/dashboard/student/quests" },
  { icon: Award, label: "Badges", href: "/dashboard/student/badges" },
  { icon: ShoppingBag, label: "Shop", href: "/dashboard/student/shop" },
  { icon: User, label: "Profile", href: "/dashboard/student/profile" },
];

function getActiveId(pathname: string): string {
  const parts = pathname.replace("/dashboard/student", "").split("/").filter(Boolean);
  return parts[0] || "dashboard";
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeId = getActiveId(pathname);

  useEffect(() => {
    if (status === "unauthenticated") window.location.replace("/auth/login");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/learner/profile")
        .then(r => r.json())
        .then(data => { if (data.profile) setProfile(data.profile); })
        .catch(() => {});
    }
  }, [status]);

  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop viewport
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <div style={{ textAlign: "center" }}>
          <Sparkles style={{ width: 48, height: 48, color: colors.primary, margin: "0 auto 1rem" }} />
          <p style={{ color: colors.textMuted, fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user as any;
  const totalXp = profile?.totalXp || user?.totalXp || 0;
  const streak = profile?.currentStreak || user?.currentStreak || 0;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      {/* Mobile overlay */}
      {mobileMenuOpen && !isDesktop && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Top Nav */}
      <header
        style={{
          background: "rgba(253,253,251,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${colors.border}`,
          padding: "0.5rem 0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 30,
          gap: "0.5rem",
          flexWrap: "nowrap",
          overflow: "hidden",
        }}
      >
        {/* Left side: menu button + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0, flex: "0 1 auto", overflow: "hidden" }}>
          {/* Menu toggle — mobile only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: isDesktop ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              minWidth: 44,
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: "white",
              color: colors.text,
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
          </button>

          <Link href="/dashboard/student" style={{ display: "flex", alignItems: "center", gap: "0.375rem", textDecoration: "none", minWidth: 0, overflow: "hidden" }}>
            <Sparkles style={{ width: 24, height: 24, minWidth: 24, color: colors.primary, flexShrink: 0 }} />
            {/* Hide text on very small screens (<380px) */}
            <span
              style={{
                fontWeight: 800,
                fontSize: "0.9375rem",
                ...ds.textGradient,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              className="brand-text"
            >
              Arizen School
            </span>
          </Link>
        </div>

        {/* Right side: XP, streak, logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0, flexWrap: "nowrap" }}>
          {/* XP pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.375rem 0.625rem",
              borderRadius: 16,
              background: colors.primarySoft,
              color: colors.primary,
              fontWeight: 700,
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              flexShrink: 0,
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <Zap style={{ width: 12, height: 12, minWidth: 12, flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{totalXp.toLocaleString()}</span>
          </div>

          {/* Streak pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.375rem 0.625rem",
              borderRadius: 16,
              background: colors.warmSoft,
              color: colors.warmDark,
              fontWeight: 700,
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <Flame style={{ width: 12, height: 12, minWidth: 12, flexShrink: 0 }} />
            {streak}d
          </div>

          {/* Logout button — minimum 44x44px tap target */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: "rgba(239,68,68,0.04)",
              color: colors.danger || "#EF4444",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Sign out"
          >
            <LogOut style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </header>

      <style>{`
        @media (max-width: 379px) {
          .brand-text { display: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", position: "relative" }}>
        {/* Sidebar — slide-out on mobile, always visible on desktop */}
        <nav style={{
          position: "fixed",
          top: 52,
          left: 0,
          bottom: 0,
          width: 220,
          padding: "1rem 0",
          borderRight: `1px solid ${colors.border}`,
          background: "rgba(253,253,251,0.97)",
          backdropFilter: "blur(8px)",
          zIndex: 50,
          overflowY: "auto",
          transform: isDesktop ? "translateX(0)" : (mobileMenuOpen ? "translateX(0)" : "translateX(-100%)"),
          transition: "transform 0.25s ease",
          WebkitOverflowScrolling: "touch",
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeId
              ? item.href === `/dashboard/student/${activeId}`
              : item.href === "/dashboard/student";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.75rem 1rem",
                  textDecoration: "none",
                  background: isActive ? colors.primarySoft : "transparent",
                  color: isActive ? colors.primary : colors.textMuted,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.875rem",
                  borderLeft: isActive ? `3px solid ${colors.primary}` : "3px solid transparent",
                }}
              >
                <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                {item.label}
              </Link>
            );
          })}
          {/* Logout in mobile menu */}
          <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: "0.5rem", paddingTop: "0.5rem" }}>
            <button
              onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: "/" }); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.625rem",
                padding: "0.75rem 1rem", width: "100%",
                background: "none", border: "none",
                color: colors.danger || "#EF4444",
                fontWeight: 700, fontSize: "0.875rem",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <LogOut style={{ width: 18, height: 18 }} />
              Sign Out
            </button>
          </div>
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, padding: "1.5rem", maxWidth: "100%", minWidth: 0, marginLeft: isDesktop ? 220 : 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
