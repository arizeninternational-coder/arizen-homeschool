"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, ChevronRight, Target, CheckCircle2, Zap, ArrowLeft
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
  const [themeSlug, setThemeSlug] = useState<string | null>(null);
  const [theme, setTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div style={{ ...ds.card, padding: "2rem", textAlign: "center", color: colors.textMuted }}>Loading theme...</div>;
  if (!theme) return (
    <div style={{ ...ds.card, padding: "2rem", textAlign: "center" }}>
      <BookOpen style={{ width: 36, height: 36, color: colors.textMuted, margin: "0 auto 0.75rem" }} />
      <h3 style={{ fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>Theme not found</h3>
      <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>This theme may not exist or isn't published yet.</p>
      <Link href="/dashboard/student/lessons" style={{ ...ds.btnPrimary, display: "inline-flex", textDecoration: "none", marginTop: "1rem" }}>Back to Themes</Link>
    </div>
  );

  const quests: Quest[] = theme.quests || [];
  const totalLessons = quests.reduce((sum, q) => sum + (q.lessons?.length || 0), 0);
  const completedLessons = quests.reduce((sum, q) => sum + (q.lessons?.filter(l => l.isCompleted).length || 0), 0);

  return (
    <>
      <Link href="/dashboard/student/lessons" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: colors.textMuted, fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none", marginBottom: "0.75rem" }}>
        <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Themes
      </Link>

      <div style={{ padding: "1.25rem", borderRadius: 16, background: gradients.primary, color: "white", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.375rem" }}>{theme.title}</h1>
        {theme.description && <p style={{ opacity: 0.9, fontSize: "0.875rem", marginBottom: "0.75rem" }}>{theme.description}</p>}
        <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", opacity: 0.85, flexWrap: "wrap" }}>
          <span>{quests.length} quests</span>
          <span>{totalLessons} lessons</span>
          <span>{completedLessons}/{totalLessons} completed</span>
        </div>
        {theme.drivingQuestion && (
          <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", fontStyle: "italic", opacity: 0.8 }}>❝ {theme.drivingQuestion} ❞</p>
        )}
      </div>

      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.75rem" }}>Quests</h2>

      {quests.length === 0 ? (
        <div style={{ ...ds.card, textAlign: "center", padding: "1.5rem" }}>
          <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>No quests available in this theme yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {quests.map((quest, i) => (
            <QuestCard key={quest.id} quest={quest} index={i} themeSlug={theme.slug} />
          ))}
        </div>
      )}
    </>
  );
}

function QuestCard({ quest, index, themeSlug }: { quest: Quest; index: number; themeSlug: string }) {
  const typeColors: Record<string, string> = { MAIN: colors.primary, SIDE: colors.warm, CHALLENGE: colors.accent };
  const typeColor = typeColors[quest.questType || "MAIN"] || colors.primary;

  return (
    <Link href={`/dashboard/student/lessons/${themeSlug}/${quest.slug}`} style={{ ...ds.card, padding: "1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: quest.isCompleted ? `${colors.success}15` : `${typeColor}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {quest.isCompleted ? <CheckCircle2 style={{ width: 20, height: 20, color: colors.success }} /> : <span style={{ fontWeight: 800, color: typeColor, fontSize: "0.8125rem" }}>{index + 1}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.125rem", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>{quest.title}</span>
          {quest.questType && <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: typeColor, background: `${typeColor}15`, padding: "0.1rem 0.3rem", borderRadius: 4 }}>{quest.questType}</span>}
        </div>
        {quest.description && <p style={{ fontSize: "0.75rem", color: colors.textMuted, lineHeight: 1.3 }}>{quest.description}</p>}
        {quest.lessons && quest.lessons.length > 0 && (
          <span style={{ fontSize: "0.6875rem", color: colors.textMuted }}>{quest.lessons.length} lessons</span>
        )}
      </div>
      {quest.progress > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: colors.border }}>
            <div style={{ height: "100%", borderRadius: 3, background: colors.primary, width: `${quest.progress}%` }} />
          </div>
          <span style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.primary }}>{quest.progress}%</span>
        </div>
      )}
      <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted, flexShrink: 0 }} />
    </Link>
  );
}
