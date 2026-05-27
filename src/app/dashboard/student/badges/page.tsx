"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles, Award, Lock, Zap, LogOut, Compass, BookOpen, Target, Heart, User
} from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";

interface Badge {
  id: string;
  badgeType: string;
  name: string;
  description: string;
  awardedAt: string;
  iconUrl?: string;
}

const badgeIcons: Record<string, string> = {
  first_lesson: "🎯",
  ten_lessons: "📚",
  first_quest: "⚔️",
  five_quests: "🏆",
  streak_3: "🔥",
  streak_7: "🌟",
  xp_1000: "💎",
  xp_5000: "👑",
  level_5: "⭐",
  level_10: "🏅",
};

const allBadgeTypes = [
  { type: "first_lesson", name: "First Step", description: "Complete your first lesson" },
  { type: "ten_lessons", name: "Quick Learner", description: "Complete 10 lessons" },
  { type: "first_quest", name: "Quest Complete!", description: "Complete your first quest" },
  { type: "five_quests", name: "Quest Master", description: "Complete 5 quests" },
  { type: "streak_3", name: "Streak Starter", description: "3-day learning streak" },
  { type: "streak_7", name: "Week Warrior", description: "7-day learning streak" },
  { type: "xp_1000", name: "XP Champion", description: "Earn 1,000 XP" },
  { type: "xp_5000", name: "XP Legend", description: "Earn 5,000 XP" },
  { type: "level_5", name: "Rising Star", description: "Reach level 5" },
  { type: "level_10", name: "Mastermind", description: "Reach level 10" },
];

export default function StudentBadgesPage() {
  const { data: session, status } = useSession();
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") window.location.replace("/auth/login");
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/learner/badges")
      .then(r => r.json())
      .then(data => setEarnedBadges(data.badges || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading") return <LoadingScreen />;

  const navItems = [
    { icon: Compass, label: "Dashboard", href: "/dashboard/student" },
    { icon: BookOpen, label: "My Lessons", href: "/dashboard/student/lessons" },
    { icon: Target, label: "Quests", href: "/dashboard/student/quests" },
    { icon: Award, label: "Badges", href: "/dashboard/student/badges", active: true },
    { icon: Heart, label: "Reflections", href: "/dashboard/student/reflections" },
    { icon: User, label: "Profile", href: "/dashboard/student/profile" },
  ];

  const earnedTypes = new Set(earnedBadges.map(b => b.badgeType));
  const earnedCount = earnedBadges.length;
  const totalCount = allBadgeTypes.length;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <header style={{ background: 'rgba(253,253,251,0.85)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${colors.border}`, padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/dashboard/student" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <Sparkles style={{ width: 28, height: 28, color: colors.primary }} />
          <span style={{ fontWeight: 800, fontSize: "1.125rem", ...ds.textGradient }}>Arizen School</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 20, background: colors.primarySoft, color: colors.primary, fontWeight: 700, fontSize: "0.8125rem" }}>
            <Zap style={{ width: 14, height: 14 }} /> {((session?.user as any)?.totalXp || 0).toLocaleString()} XP
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            <LogOut style={{ width: 14, height: 14 }} /> Exit
          </button>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        <nav style={{ width: 200, padding: "1.5rem 0", borderRight: `1px solid ${colors.border}`, minHeight: "calc(100vh - 60px)", flexShrink: 0 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 1.25rem", textDecoration: "none", background: item.active ? colors.primarySoft : "transparent", color: item.active ? colors.primary : colors.textMuted, fontWeight: item.active ? 700 : 500, fontSize: "0.875rem", borderLeft: item.active ? `3px solid ${colors.primary}` : "3px solid transparent" }}>
              <item.icon style={{ width: 18, height: 18 }} />
              {item.label}
            </Link>
          ))}
        </nav>

        <main style={{ flex: 1, padding: "2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Badges</h1>
            <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>
              {earnedCount}/{totalCount} badges earned
            </p>
            <div style={{ marginTop: "0.5rem", height: 8, borderRadius: 4, background: colors.border, maxWidth: 300 }}>
              <div style={{ height: "100%", borderRadius: 4, background: gradients.primary, width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`, transition: "width 0.3s" }} />
            </div>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
              {[1,2,3,4,5,6].map(i => <div key={i} style={{ ...ds.card, padding: "1.5rem", height: 160, background: colors.bgAlt }} />)}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
              {allBadgeTypes.map((badgeDef) => {
                const earned = earnedBadges.find(b => b.badgeType === badgeDef.type);
                const isEarned = !!earned;
                return (
                  <div key={badgeDef.type} style={{ ...ds.card, padding: "1.25rem", textAlign: "center", opacity: isEarned ? 1 : 0.5, position: "relative" }}>
                    {!isEarned && (
                      <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}>
                        <Lock style={{ width: 14, height: 14, color: colors.textMuted }} />
                      </div>
                    )}
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", filter: isEarned ? "none" : "grayscale(1)" }}>
                      {badgeIcons[badgeDef.type] || "🏅"}
                    </div>
                    <div style={{ fontWeight: 700, color: isEarned ? colors.text : colors.textMuted, fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
                      {badgeDef.name}
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: colors.textMuted, lineHeight: 1.3 }}>
                      {badgeDef.description}
                    </div>
                    {earned?.awardedAt && (
                      <div style={{ fontSize: "0.625rem", color: colors.success, fontWeight: 600, marginTop: "0.5rem" }}>
                        ✓ {new Date(earned.awardedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
      <div style={{ textAlign: "center" }}>
        <Sparkles style={{ width: 48, height: 48, color: colors.primary, margin: "0 auto 1rem" }} />
        <p style={{ color: colors.textMuted, fontWeight: 600 }}>Loading badges...</p>
      </div>
    </div>
  );
}
