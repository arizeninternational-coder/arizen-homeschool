"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles, BookOpen, ChevronRight, Clock, Target, CheckCircle2, Zap, ArrowLeft, LogOut, Compass, Award, Heart, User
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
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
  xpReward?: { base: number } | number;
  progress: number;
  isCompleted: boolean;
}

export default function ThemeDetailPage({ params }: { params: Promise<{ themeSlug: string }> }) {
  const { data: session, status } = useSession();
  const [themeSlug, setThemeSlug] = useState<string | null>(null);
  const [theme, setTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") window.location.replace("/auth/login");
  }, [status]);

  useEffect(() => {
    params.then(p => {
      setThemeSlug(p.themeSlug);
      fetch(`/api/themes?slug=${p.themeSlug}`)
        .then(r => r.json())
        .then(data => setTheme(data.theme))
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (status === "loading" || loading) return <LoadingScreen />;
  if (!theme) return <NotFoundScreen themeSlug={themeSlug || ""} />;

  const quests: Quest[] = theme.quests || [];
  const totalLessons = quests.reduce((sum, q) => sum + (q.lessons?.length || 0), 0);
  const completedLessons = quests.reduce((sum, q) => sum + (q.lessons?.filter(l => l.isCompleted).length || 0), 0);

  const navItems = [
    { icon: Compass, label: "Dashboard", href: "/dashboard/student" },
    { icon: BookOpen, label: "My Lessons", href: "/dashboard/student/lessons", active: true },
    { icon: Target, label: "Quests", href: "/dashboard/student/quests" },
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
        <button onClick={() => { signOut({ callbackUrl: "/" }); }} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
          <LogOut style={{ width: 14, height: 14 }} /> Exit
        </button>
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

        <main style={{ flex: 1, padding: "2rem", maxWidth: 800 }}>
          <Link href="/dashboard/student/lessons" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: colors.textMuted, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", marginBottom: "1rem" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Themes
          </Link>

          <div style={{ padding: "1.5rem", borderRadius: 16, background: gradients.primary, color: "white", marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 800, marginBottom: "0.5rem" }}>{theme.title}</h1>
            {theme.description && <p style={{ opacity: 0.9, fontSize: "0.9375rem", marginBottom: "1rem" }}>{theme.description}</p>}
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8125rem", opacity: 0.85 }}>
              <span>{quests.length} quests</span>
              <span>{totalLessons} lessons</span>
              <span>{completedLessons}/{totalLessons} completed</span>
            </div>
            {theme.drivingQuestion && (
              <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", fontStyle: "italic", opacity: 0.8 }}>❝ {theme.drivingQuestion} ❞</p>
            )}
          </div>

          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>Quests</h2>

          {quests.length === 0 ? (
            <div style={{ ...ds.card, textAlign: "center", padding: "2rem" }}>
              <p style={{ color: colors.textMuted }}>No quests available in this theme yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {quests.map((quest, i) => (
                <QuestCard key={quest.id} quest={quest} index={i} themeSlug={theme.slug} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function QuestCard({ quest, index, themeSlug }: { quest: Quest; index: number; themeSlug: string }) {
  const typeColors: Record<string, string> = { MAIN: colors.primary, SIDE: colors.warm, CHALLENGE: colors.accent };
  const typeColor = typeColors[quest.questType || "MAIN"] || colors.primary;

  return (
    <Link href={`/dashboard/student/lessons/${themeSlug}/${quest.slug}`} style={{ ...ds.card, padding: "1.25rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: quest.isCompleted ? `${colors.success}15` : `${typeColor}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {quest.isCompleted ? <CheckCircle2 style={{ width: 22, height: 22, color: colors.success }} /> : <span style={{ fontWeight: 800, color: typeColor, fontSize: "0.875rem" }}>{index + 1}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <span style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{quest.title}</span>
          {quest.questType && <span style={{ fontSize: "0.625rem", fontWeight: 700, color: typeColor, background: `${typeColor}15`, padding: "0.125rem 0.375rem", borderRadius: 4 }}>{quest.questType}</span>}
        </div>
        {quest.description && <p style={{ fontSize: "0.8125rem", color: colors.textMuted, lineHeight: 1.4 }}>{quest.description}</p>}
        {quest.lessons && quest.lessons.length > 0 && (
          <span style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "0.25rem", display: "inline-block" }}>{quest.lessons.length} lessons</span>
        )}
      </div>
      {quest.progress > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <div style={{ width: 60, height: 6, borderRadius: 3, background: colors.border }}>
            <div style={{ height: "100%", borderRadius: 3, background: colors.primary, width: `${quest.progress}%` }} />
          </div>
          <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.primary }}>{quest.progress}%</span>
        </div>
      )}
      <ChevronRight style={{ width: 18, height: 18, color: colors.textMuted, flexShrink: 0 }} />
    </Link>
  );
}

function LoadingScreen() {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}><div style={{ textAlign: "center" }}><Sparkles style={{ width: 48, height: 48, color: colors.primary, margin: "0 auto 1rem" }} /><p style={{ color: colors.textMuted, fontWeight: 600 }}>Loading theme...</p></div></div>;
}

function NotFoundScreen({ themeSlug }: { themeSlug: string }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}><div style={{ textAlign: "center", ...ds.card, padding: "2rem" }}><BookOpen style={{ width: 40, height: 40, color: colors.textMuted, margin: "0 auto 1rem" }} /><h3 style={{ fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>Theme not found</h3><p style={{ color: colors.textMuted }}>This theme may not exist or isn't published yet.</p><Link href="/dashboard/student/lessons" style={{ ...ds.btnPrimary, display: "inline-flex", textDecoration: "none", marginTop: "1rem" }}>Back to Themes</Link></div></div>;
}

function signOut(opts: any) {
  // imported from next-auth/react at runtime
}
