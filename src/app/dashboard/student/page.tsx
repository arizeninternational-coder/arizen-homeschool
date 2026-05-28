"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Zap, Award, Target, BookOpen, ChevronRight, Sparkles, Coins, ShoppingBag
} from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";

interface LearnerProfile {
  id: string;
  displayName: string;
  totalXp: number;
  currentStreak: number;
  completedItems: number;
  badgesCount: number;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, walletRes] = await Promise.allSettled([
          fetch("/api/learner/profile").then(r => r.json()),
          fetch("/api/coins/wallet").then(r => r.json()),
        ]);
        if (profileRes.status === "fulfilled" && profileRes.value.profile) {
          setProfile(profileRes.value.profile);
        }
        if (walletRes.status === "fulfilled") {
          setCoinBalance(walletRes.value.wallet?.balance || walletRes.value.balance || 0);
        }
      } catch (err) {
        console.error("[DASHBOARD] Load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const user = session?.user as any;
  const displayName = profile?.displayName || user?.name?.split(" ")[0] || "Learner";
  const totalXp = profile?.totalXp || 0;
  const streak = profile?.currentStreak || 0;
  const badgesCount = profile?.badgesCount || 0;
  const completedItems = profile?.completedItems || 0;
  const level = Math.floor(totalXp / 500) + 1;
  const xpInLevel = totalXp % 500;
  const xpProgress = Math.min((xpInLevel / 500) * 100, 100);

  return (
    <>
      {/* Welcome */}
      <div style={{ padding: "1.25rem", borderRadius: 16, background: gradients.primary, color: "white", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem" }}>Hey, {displayName}! 👋</h1>
        <p style={{ opacity: 0.9, fontSize: "0.875rem" }}>Welcome back to your learning dashboard.</p>
      </div>

      {/* Level card */}
      <div style={{ padding: "1rem", borderRadius: 12, background: colors.primarySoft, marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ fontSize: "0.6875rem", color: colors.primary, fontWeight: 700, marginBottom: "0.125rem" }}>Current Level</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.text }}>Level {level}</div>
        </div>
        <div style={{ flex: 1, minWidth: 120, maxWidth: 200 }}>
          <div style={{ height: 8, borderRadius: 4, background: `${colors.primary}30` }}>
            <div style={{ height: "100%", borderRadius: 4, background: colors.primary, width: `${xpProgress}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: "0.6875rem", color: colors.textMuted, marginTop: "0.25rem" }}>{xpInLevel}/500 XP to next level</div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total XP", value: totalXp.toLocaleString(), icon: Zap, color: colors.primary },
          { label: "Spark Coins", value: coinBalance.toLocaleString(), icon: Coins, color: "#D97706" },
          { label: "Streak", value: `${streak} days`, icon: Zap, color: colors.warm },
          { label: "Badges", value: String(badgesCount), icon: Award, color: colors.info || colors.accent },
        ].map((stat) => (
          <div key={stat.label} style={{ ...ds.card, padding: "0.875rem", textAlign: "center" }}>
            <stat.icon style={{ width: 20, height: 20, color: stat.color, margin: "0 auto 0.375rem" }} />
            <div style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text }}>{stat.value}</div>
            <div style={{ fontSize: "0.6875rem", color: colors.textMuted, fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <Link href="/dashboard/student/lessons" style={{ ...ds.card, padding: "1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen style={{ width: 18, height: 18, color: colors.primary }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>My Lessons</div>
            <div style={{ fontSize: "0.6875rem", color: colors.textMuted }}>Continue learning</div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: colors.textMuted, marginLeft: "auto", flexShrink: 0 }} />
        </Link>
        <Link href="/dashboard/student/quests" style={{ ...ds.card, padding: "1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: colors.warmSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Target style={{ width: 18, height: 18, color: colors.warm }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>Quests</div>
            <div style={{ fontSize: "0.6875rem", color: colors.textMuted }}>Explore challenges</div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: colors.textMuted, marginLeft: "auto", flexShrink: 0 }} />
        </Link>
        <Link href="/dashboard/student/badges" style={{ ...ds.card, padding: "1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${colors.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Award style={{ width: 18, height: 18, color: colors.accent }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>Badges</div>
            <div style={{ fontSize: "0.6875rem", color: colors.textMuted }}>{badgesCount} earned</div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: colors.textMuted, marginLeft: "auto", flexShrink: 0 }} />
        </Link>
        <Link href="/dashboard/student/shop" style={{ ...ds.card, padding: "1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShoppingBag style={{ width: 18, height: 18, color: "#D97706" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>Avatar Shop</div>
            <div style={{ fontSize: "0.6875rem", color: colors.textMuted }}>Customize your character</div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: colors.textMuted, marginLeft: "auto", flexShrink: 0 }} />
        </Link>
      </div>
    </>
  );
}
