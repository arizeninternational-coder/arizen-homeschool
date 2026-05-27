"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles, Target, CheckCircle2, Zap, LogOut, Compass, BookOpen, Award, Heart, User
} from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";

interface Quest {
  id: string;
  title: string;
  slug: string;
  description: string;
  questType?: string;
  xpReward?: { base: number } | number;
  progress: number;
  isCompleted: boolean;
}

export default function StudentQuestsPage() {
  const { data: session, status } = useSession();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") window.location.replace("/auth/login");
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    // Fetch themes first, then get quests from each theme
    fetch("/api/themes")
      .then(r => r.json())
      .then(async (data) => {
        const themes = data.themes || [];
        const allQuests: Quest[] = [];
        for (const theme of themes) {
          try {
            const res = await fetch(`/api/themes?slug=${theme.slug}`);
            const detail = await res.json();
            if (detail.theme?.quests) {
              for (const q of detail.theme.quests) {
                allQuests.push({ ...q, themeSlug: theme.slug, themeTitle: theme.title });
              }
            }
          } catch { /* skip failed themes */ }
        }
        setQuests(allQuests);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading") return <LoadingScreen />;

  const navItems = [
    { icon: Compass, label: "Dashboard", href: "/dashboard/student" },
    { icon: BookOpen, label: "My Lessons", href: "/dashboard/student/lessons" },
    { icon: Target, label: "Quests", href: "/dashboard/student/quests", active: true },
    { icon: Award, label: "Badges", href: "/dashboard/student/badges" },
    { icon: Heart, label: "Reflections", href: "/dashboard/student/reflections" },
    { icon: User, label: "Profile", href: "/dashboard/student/profile" },
  ];

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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Quests</h1>
          <p style={{ color: colors.textMuted, fontSize: "0.9375rem", marginBottom: "1.5rem" }}>Choose a quest and start your learning adventure!</p>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {[1,2,3].map(i => <div key={i} style={{ ...ds.card, padding: "1.5rem", height: 140, background: colors.bgAlt }} />)}
            </div>
          ) : quests.length === 0 ? (
            <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
              <Target style={{ width: 40, height: 40, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.3 }} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>No quests available</h3>
              <p style={{ color: colors.textMuted }}>Explore themes to find quests, or check back later!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {quests.map((quest, i) => (
                <QuestCard key={quest.id} quest={quest} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function QuestCard({ quest, index }: { quest: Quest & { themeSlug?: string; themeTitle?: string }; index: number }) {
  const typeColors: Record<string, string> = { MAIN: colors.primary, SIDE: colors.warm, CHALLENGE: colors.accent };
  const typeColor = typeColors[quest.questType || "MAIN"] || colors.primary;
  const xp = typeof quest.xpReward === "object" ? (quest.xpReward as any)?.base : quest.xpReward;

  return (
    <Link href={`/dashboard/student/lessons/${quest.themeSlug || ""}/${quest.slug}`} style={{ ...ds.card, padding: "1.25rem", textDecoration: "none", display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: quest.isCompleted ? `${colors.success}15` : `${typeColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {quest.isCompleted ? <CheckCircle2 style={{ width: 20, height: 20, color: colors.success }} /> : <span style={{ fontWeight: 800, color: typeColor, fontSize: "0.8125rem" }}>{index + 1}</span>}
        </div>
        {quest.questType && <span style={{ fontSize: "0.625rem", fontWeight: 700, color: typeColor, background: `${typeColor}15`, padding: "0.125rem 0.5rem", borderRadius: 6 }}>{quest.questType}</span>}
      </div>
      <h3 style={{ fontWeight: 700, color: colors.text, fontSize: "1rem", marginBottom: "0.375rem" }}>{quest.title}</h3>
      <p style={{ fontSize: "0.8125rem", color: colors.textMuted, marginBottom: "0.75rem", lineHeight: 1.4 }}>{quest.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem" }}>
        {quest.progress > 0 && (
          <span style={{ fontWeight: 600, color: colors.primary, background: colors.primarySoft, padding: "0.125rem 0.5rem", borderRadius: 6 }}>{quest.progress}%</span>
        )}
        {xp && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: 700, color: colors.warm }}>
            <Zap style={{ width: 12, height: 12 }} /> +{xp} XP
          </span>
        )}
        {quest.isCompleted && <span style={{ fontWeight: 700, color: colors.success }}>✓ Done</span>}
      </div>
    </Link>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
      <div style={{ textAlign: "center" }}>
        <Sparkles style={{ width: 48, height: 48, color: colors.primary, margin: "0 auto 1rem" }} />
        <p style={{ color: colors.textMuted, fontWeight: 600 }}>Loading quests...</p>
      </div>
    </div>
  );
}
