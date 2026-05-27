"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Star, Zap, Award, BookOpen, Compass, User, LogOut,
  Flame, ChevronRight, Sparkles, TrendingUp, Heart, Target
} from "lucide-react";
import { ds, colors, gradients, shadows } from "@/lib/design-system";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace("/auth/login");
    }
  }, [status]);

  if (status === "loading") {
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
  const displayName = user.displayName || user.name?.split(" ")[0] || "Learner";

  const navItems = [
    { icon: Compass, label: "Dashboard", id: "dashboard" },
    { icon: BookOpen, label: "My Lessons", id: "lessons" },
    { icon: Target, label: "Quests", id: "quests" },
    { icon: Award, label: "Badges", id: "badges" },
    { icon: Heart, label: "Reflections", id: "reflections" },
    { icon: User, label: "Profile", id: "profile" },
  ];

  const quests = [
    { title: "The Water Cycle", progress: 75, xp: 150, difficulty: "Easy", lessons: "3/4" },
    { title: "Plant Life", progress: 40, xp: 200, difficulty: "Medium", lessons: "2/5" },
    { title: "Weather Patterns", progress: 10, xp: 300, difficulty: "Hard", lessons: "1/6" },
  ];

  const badges = [
    { name: "First Steps", icon: "🌟", earned: true },
    { name: "Quick Learner", icon: "⚡", earned: true },
    { name: "Explorer", icon: "🧭", earned: true },
    { name: "Scholar", icon: "📚", earned: false },
    { name: "Champion", icon: "🏆", earned: false },
    { name: "Creator", icon: "🎨", earned: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      {/* Top Nav */}
      <header style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}`, padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Sparkles style={{ width: 28, height: 28, color: colors.primary }} />
          <span style={{ fontWeight: 800, fontSize: "1.125rem", ...ds.textGradient }}>Arizen School</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 20, background: colors.xpSoft, color: colors.xp, fontWeight: 700, fontSize: "0.8125rem" }}>
            <Zap style={{ width: 14, height: 14 }} /> {user.totalXp || 0} XP
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 20, background: colors.streakSoft, color: colors.streak, fontWeight: 700, fontSize: "0.8125rem" }}>
            <Flame style={{ width: 14, height: 14 }} /> {user.currentStreak || 0} day streak
          </div>
          <button onClick={() => { signOut(); window.location.replace("/"); }} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            <LogOut style={{ width: 14, height: 14 }} /> Exit
          </button>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <nav style={{ width: 200, padding: "1.5rem 0", borderRight: `1px solid ${colors.border}`, minHeight: "calc(100vh - 60px)" }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: "flex", alignItems: "center", gap: "0.625rem", width: "100%", padding: "0.625rem 1.25rem", border: "none", background: activeTab === item.id ? colors.primarySoft : "transparent", color: activeTab === item.id ? colors.primary : colors.textMuted, fontWeight: activeTab === item.id ? 700 : 500, fontSize: "0.875rem", cursor: "pointer", textAlign: "left", borderRadius: 0, borderLeft: activeTab === item.id ? `3px solid ${colors.primary}` : "3px solid transparent" }}>
              <item.icon style={{ width: 18, height: 18 }} />
              {item.label}
            </button>
          ))}
          <div style={{ padding: "1rem 1.25rem", marginTop: "1rem" }}>
            <div style={{ padding: "1rem", borderRadius: 12, background: gradients.primary, color: "white", textAlign: "center" }}>
              <div style={{ fontSize: "0.6875rem", opacity: 0.8, marginBottom: "0.25rem" }}>Current Level</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>Level {Math.floor((user.totalXp || 0) / 100) + 1}</div>
              <div style={{ marginTop: "0.5rem", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }}>
                <div style={{ height: "100%", borderRadius: 3, background: "white", width: `${((user.totalXp || 0) % 100)}%` }} />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "2rem" }}>
          {/* Welcome */}
          <div style={{ padding: "1.5rem", borderRadius: 16, background: gradients.primary, color: "white", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 800, marginBottom: "0.25rem" }}>Hey, {displayName}! 👋</h1>
            <p style={{ opacity: 0.9, fontSize: "0.9375rem" }}>Ready for today's adventure? You've got {quests.filter(q => q.progress < 100).length} quests in progress!</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total XP", value: user.totalXp || 0, icon: Zap, color: colors.xp },
              { label: "Streak", value: `${user.currentStreak || 0} days`, icon: Flame, color: colors.streak },
              { label: "Badges", value: badges.filter(b => b.earned).length, icon: Award, color: colors.badge },
              { label: "Quests", value: quests.length, icon: Target, color: colors.primary },
            ].map((stat) => (
              <div key={stat.label} style={{ ...ds.card, padding: "1rem", textAlign: "center" }}>
                <stat.icon style={{ width: 24, height: 24, color: stat.color, margin: "0 auto 0.5rem" }} />
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.text }}>{stat.value}</div>
                <div style={{ fontSize: "0.75rem", color: colors.textMuted, fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Active Quests */}
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Target style={{ width: 20, height: 20, color: colors.primary }} /> Active Quests
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {quests.map((quest) => (
              <div key={quest.title} style={{ ...ds.card, padding: "1.25rem", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <h3 style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{quest.title}</h3>
                  <span style={{ padding: "0.125rem 0.5rem", borderRadius: 6, fontSize: "0.6875rem", fontWeight: 700, background: quest.difficulty === "Easy" ? colors.successSoft : quest.difficulty === "Medium" ? colors.warningSoft : colors.dangerSoft, color: quest.difficulty === "Easy" ? colors.success : quest.difficulty === "Medium" ? colors.warning : colors.danger }}>{quest.difficulty}</span>
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: colors.textMuted, marginBottom: "0.25rem" }}>
                    <span>{quest.lessons} lessons</span><span>{quest.progress}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: colors.border }}>
                    <div style={{ height: "100%", borderRadius: 4, background: gradients.primary, width: `${quest.progress}%`, transition: "width 0.3s" }} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: colors.xp, fontWeight: 700 }}>+{quest.xp} XP</span>
                  <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted }} />
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Award style={{ width: 20, height: 20, color: colors.badge }} /> My Badges
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
            {badges.map((badge) => (
              <div key={badge.name} style={{ ...ds.card, padding: "1rem", textAlign: "center", opacity: badge.earned ? 1 : 0.4 }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{badge.icon}</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: colors.text }}>{badge.name}</div>
                {badge.earned && <div style={{ fontSize: "0.625rem", color: colors.success, fontWeight: 600, marginTop: "0.25rem" }}>Earned!</div>}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
