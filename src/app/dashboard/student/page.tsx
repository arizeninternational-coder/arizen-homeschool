"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Star, Zap, Award, BookOpen, Compass, User, LogOut,
  Flame, ChevronRight, Sparkles, Heart, Target
} from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";

interface LearnerProfile {
  id: string;
  displayName: string;
  grade: number;
  totalXp: number;
  currentStreak: number;
  bestStreak: number;
  completedItems: number;
  badgesCount: number;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace("/auth/login");
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/learner/profile")
      .then(r => r.json())
      .then(data => {
        if (data.profile) setProfile(data.profile);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <div style={{ textAlign: "center" }}>
          <Sparkles style={{ width: 48, height: 48, color: colors.primary, margin: "0 auto 1rem" }} />
          <p style={{ color: colors.textMuted, fontWeight: 600 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user as any;
  const displayName = profile?.displayName || user.name?.split(" ")[0] || "Learner";
  const totalXp = profile?.totalXp || 0;
  const streak = profile?.currentStreak || 0;
  const badgesCount = profile?.badgesCount || 0;
  const completedItems = profile?.completedItems || 0;
  const level = Math.floor(totalXp / 500) + 1;
  const xpInLevel = totalXp % 500;
  const xpProgress = Math.min((xpInLevel / 500) * 100, 100);

  const navItems = [
    { icon: Compass, label: "Dashboard", id: "dashboard", href: "/dashboard/student" },
    { icon: BookOpen, label: "My Lessons", id: "lessons", href: "/dashboard/student/lessons" },
    { icon: Target, label: "Quests", id: "quests", href: "/dashboard/student/quests" },
    { icon: Award, label: "Badges", id: "badges", href: "/dashboard/student/badges" },
    { icon: Heart, label: "Reflections", id: "reflections", href: "/dashboard/student/reflections" },
    { icon: User, label: "Profile", id: "profile", href: "/dashboard/student/profile" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      {/* Top Nav */}
      <header style={{ background: 'rgba(253,253,251,0.85)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${colors.border}`, padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/dashboard/student" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <Sparkles style={{ width: 28, height: 28, color: colors.primary }} />
          <span style={{ fontWeight: 800, fontSize: "1.125rem", ...ds.textGradient }}>Arizen School</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 20, background: colors.primarySoft, color: colors.primary, fontWeight: 700, fontSize: "0.8125rem" }}>
            <Zap style={{ width: 14, height: 14 }} /> {totalXp.toLocaleString()} XP
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 20, background: colors.warmSoft, color: colors.warmDark, fontWeight: 700, fontSize: "0.8125rem" }}>
            <Flame style={{ width: 14, height: 14 }} /> {streak} day streak
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            <LogOut style={{ width: 14, height: 14 }} /> Exit
          </button>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <nav style={{ width: 200, padding: "1.5rem 0", borderRight: `1px solid ${colors.border}`, minHeight: "calc(100vh - 60px)", flexShrink: 0 }}>
          {navItems.map((item) => (
            <Link key={item.id} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 1.25rem", textDecoration: "none", background: item.id === "dashboard" ? colors.primarySoft : "transparent", color: item.id === "dashboard" ? colors.primary : colors.textMuted, fontWeight: item.id === "dashboard" ? 700 : 500, fontSize: "0.875rem", borderLeft: item.id === "dashboard" ? `3px solid ${colors.primary}` : "3px solid transparent" }}>
              <item.icon style={{ width: 18, height: 18 }} />
              {item.label}
            </Link>
          ))}
          <div style={{ padding: "1rem 1.25rem", marginTop: "1rem" }}>
            <div style={{ padding: "1rem", borderRadius: 12, background: gradients.primary, color: "white", textAlign: "center" }}>
              <div style={{ fontSize: "0.6875rem", opacity: 0.8, marginBottom: "0.25rem" }}>Current Level</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>Level {level}</div>
              <div style={{ marginTop: "0.5rem", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }}>
                <div style={{ height: "100%", borderRadius: 3, background: "white", width: `${xpProgress}%`, transition: "width 0.3s" }} />
              </div>
              <div style={{ fontSize: "0.6875rem", opacity: 0.7, marginTop: "0.25rem" }}>{xpInLevel}/500 XP</div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "2rem" }}>
          {/* Welcome */}
          <div style={{ padding: "1.5rem", borderRadius: 16, background: gradients.primary, color: "white", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 800, marginBottom: "0.25rem" }}>Hey, {displayName}! 👋</h1>
            <p style={{ opacity: 0.9, fontSize: "0.9375rem" }}>Welcome back to your learning dashboard.</p>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total XP", value: totalXp.toLocaleString(), icon: Zap, color: colors.xp || colors.primary },
              { label: "Streak", value: `${streak} days`, icon: Flame, color: colors.streak || colors.warm },
              { label: "Badges", value: String(badgesCount), icon: Award, color: colors.info || colors.accent },
              { label: "Completed", value: String(completedItems), icon: Target, color: colors.primary },
            ].map((stat) => (
              <div key={stat.label} style={{ ...ds.card, padding: "1rem", textAlign: "center" }}>
                <stat.icon style={{ width: 24, height: 24, color: stat.color, margin: "0 auto 0.5rem" }} />
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.text }}>{stat.value}</div>
                <div style={{ fontSize: "0.75rem", color: colors.textMuted, fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <Link href="/dashboard/student/lessons" style={{ ...ds.card, padding: "1.25rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BookOpen style={{ width: 20, height: 20, color: colors.primary }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>My Lessons</div>
                <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Continue learning</div>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted, marginLeft: "auto" }} />
            </Link>
            <Link href="/dashboard/student/quests" style={{ ...ds.card, padding: "1.25rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.warmSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Target style={{ width: 20, height: 20, color: colors.warm }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>Quests</div>
                <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Explore challenges</div>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted, marginLeft: "auto" }} />
            </Link>
            <Link href="/dashboard/student/badges" style={{ ...ds.card, padding: "1.25rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${colors.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award style={{ width: 20, height: 20, color: colors.accent }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>Badges</div>
                <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>{badgesCount} earned</div>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted, marginLeft: "auto" }} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
