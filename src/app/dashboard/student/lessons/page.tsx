"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Clock, ChevronRight, Target, Filter, Sparkles
} from "lucide-react";
import { ds, colors } from "@/lib/design-system";

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
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  useEffect(() => {
    const url = selectedGrade ? `/api/themes?grade=${selectedGrade}` : "/api/themes";
    fetch(url)
      .then(r => r.json())
      .then(data => setThemes(data.themes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedGrade]);

  const uniqueGrades = [...new Set(themes.map(t => t.grade).filter(Boolean))].sort() as number[];

  return (
    <>
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Explore Themes</h1>
        <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>Discover topics and start your learning adventure.</p>
      </div>

      {/* Grade Filter */}
      {uniqueGrades.length > 0 && (
        <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <button onClick={() => setSelectedGrade(null)} style={{ padding: "0.375rem 0.75rem", borderRadius: 20, border: `1px solid ${selectedGrade === null ? colors.primary : colors.border}`, background: selectedGrade === null ? colors.primarySoft : "white", color: selectedGrade === null ? colors.primary : colors.textMuted, fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>
            All Grades
          </button>
          {uniqueGrades.map(g => (
            <button key={g} onClick={() => setSelectedGrade(g)} style={{ padding: "0.375rem 0.75rem", borderRadius: 20, border: `1px solid ${selectedGrade === g ? colors.primary : colors.border}`, background: selectedGrade === g ? colors.primarySoft : "white", color: selectedGrade === g ? colors.primary : colors.textMuted, fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>
              Grade {g}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.75rem" }}>
          {[1,2,3,4].map(i => <div key={i} style={{ ...ds.card, padding: "1.25rem", height: 160, background: colors.bgAlt }} />)}
        </div>
      ) : themes.length === 0 ? (
        <div style={{ ...ds.card, textAlign: "center", padding: "2.5rem 1.5rem" }}>
          <BookOpen style={{ width: 36, height: 36, color: colors.textMuted, margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>No themes available yet</h3>
          <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>Check back soon — new learning themes are being added!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.75rem" }}>
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </>
  );
}

function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <Link href={`/dashboard/student/lessons/${theme.slug}`} style={{ ...ds.card, padding: "1rem", textDecoration: "none", display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${colors.primary}, ${colors.info || colors.primary})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BookOpen style={{ width: 18, height: 18, color: "white" }} />
        </div>
        {theme.progress !== undefined && theme.progress > 0 && (
          <span style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.primary, background: colors.primarySoft, padding: "0.125rem 0.375rem", borderRadius: 6 }}>
            {theme.progress}%
          </span>
        )}
      </div>
      <h3 style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{theme.title}</h3>
      <p style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "0.5rem", lineHeight: 1.4 }}>{theme.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.6875rem", color: colors.textMuted, flexWrap: "wrap" }}>
        {theme.grade && <span style={{ fontWeight: 600 }}>Grade {theme.grade}</span>}
        {theme.durationWeeks && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.125rem" }}>
            <Clock style={{ width: 10, height: 10 }} /> {theme.durationWeeks}w
          </span>
        )}
        {theme.questsCount !== undefined && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.125rem" }}>
            <Target style={{ width: 10, height: 10 }} /> {theme.questsCount}
          </span>
        )}
      </div>
      {theme.subjects && theme.subjects.length > 0 && (
        <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
          {theme.subjects.slice(0, 3).map(s => (
            <span key={s} style={{ fontSize: "0.625rem", fontWeight: 600, color: colors.primary, background: colors.primarySoft, padding: "0.1rem 0.375rem", borderRadius: 5 }}>{s}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
