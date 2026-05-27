"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles, BookOpen, Clock, ChevronRight, Filter, Compass, Target, Award, Heart, User, LogOut, Zap, Flame
} from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";

interface Theme {
  id: string;
  title: string;
  slug: string;
  description: string;
  drivingQuestion?: string;
  durationWeeks?: number;
  grade?: number;
  subjects?: string[];
  questsCount?: number;
  progress?: number;
}

export default function StudentThemesPage() {
  const { data: session, status } = useSession();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") window.location.replace("/auth/login");
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const url = selectedGrade ? `/api/themes?grade=${selectedGrade}` : "/api/themes";
    fetch(url)
      .then(r => r.json())
      .then(data => setThemes(data.themes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status, selectedGrade]);

  if (status === "loading") return <LoadingScreen />;

  const uniqueGrades = [...new Set(themes.map(t => t.grade).filter(Boolean))].sort() as number[];

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
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Explore Themes</h1>
            <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>Discover topics and start your learning adventure.</p>
          </div>

          {/* Grade Filter */}
          {uniqueGrades.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <button onClick={() => setSelectedGrade(null)} style={{ padding: "0.375rem 0.875rem", borderRadius: 20, border: `1px solid ${selectedGrade === null ? colors.primary : colors.border}`, background: selectedGrade === null ? colors.primarySoft : "white", color: selectedGrade === null ? colors.primary : colors.textMuted, fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
                All Grades
              </button>
              {uniqueGrades.map(g => (
                <button key={g} onClick={() => setSelectedGrade(g)} style={{ padding: "0.375rem 0.875rem", borderRadius: 20, border: `1px solid ${selectedGrade === g ? colors.primary : colors.border}`, background: selectedGrade === g ? colors.primarySoft : "white", color: selectedGrade === g ? colors.primary : colors.textMuted, fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
                  Grade {g}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {[1,2,3,4].map(i => <div key={i} style={{ ...ds.card, padding: "1.5rem", height: 180, background: colors.bgAlt }} />)}
            </div>
          ) : themes.length === 0 ? (
            <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
              <BookOpen style={{ width: 40, height: 40, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.3 }} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>No themes available yet</h3>
              <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>Check back soon — new learning themes are being added!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {themes.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <Link href={`/dashboard/student/lessons/${theme.slug}`} style={{ ...ds.card, padding: "1.25rem", textDecoration: "none", display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: gradients.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BookOpen style={{ width: 22, height: 22, color: "white" }} />
        </div>
        {theme.progress !== undefined && theme.progress > 0 && (
          <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.primary, background: colors.primarySoft, padding: "0.2rem 0.5rem", borderRadius: 8 }}>
            {theme.progress}%
          </span>
        )}
      </div>
      <h3 style={{ fontWeight: 700, color: colors.text, fontSize: "1rem", marginBottom: "0.375rem" }}>{theme.title}</h3>
      <p style={{ fontSize: "0.8125rem", color: colors.textMuted, marginBottom: "0.75rem", lineHeight: 1.4 }}>{theme.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem", color: colors.textMuted }}>
        {theme.grade && <span style={{ fontWeight: 600 }}>Grade {theme.grade}</span>}
        {theme.durationWeeks && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Clock style={{ width: 12, height: 12 }} /> {theme.durationWeeks}w
          </span>
        )}
        {theme.questsCount !== undefined && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Target style={{ width: 12, height: 12 }} /> {theme.questsCount} quests
          </span>
        )}
      </div>
      {theme.subjects && theme.subjects.length > 0 && (
        <div style={{ display: "flex", gap: "0.375rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          {theme.subjects.map(s => (
            <span key={s} style={{ fontSize: "0.6875rem", fontWeight: 600, color: colors.primary, background: colors.primarySoft, padding: "0.125rem 0.5rem", borderRadius: 6 }}>{s}</span>
          ))}
        </div>
      )}
    </Link>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
      <div style={{ textAlign: "center" }}>
        <Sparkles style={{ width: 48, height: 48, color: colors.primary, margin: "0 auto 1rem" }} />
        <p style={{ color: colors.textMuted, fontWeight: 600 }}>Loading themes...</p>
      </div>
    </div>
  );
}
