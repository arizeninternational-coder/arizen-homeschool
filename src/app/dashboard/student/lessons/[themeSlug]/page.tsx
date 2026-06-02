"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, ChevronRight, Target, CheckCircle2, Zap, ArrowLeft
} from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

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

function getRewardValue(xpReward: any): number {
  if (!xpReward) return 0;
  if (typeof xpReward === "number") return xpReward;
  if (typeof xpReward === "object") return xpReward?.base || xpReward?.amount || 0;
  if (typeof xpReward === "string") {
    try { const parsed = JSON.parse(xpReward); return parsed?.base || parsed?.amount || 0; } catch { return 0; }
  }
  return 0;
}

export default function ThemeDetailPage({ params }: { params: Promise<{ themeSlug: string }> }) {
  const [themeSlug, setThemeSlug] = useState<string | null>(null);
  const [theme, setTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => {
      setThemeSlug(p.themeSlug);
      fetch(`/api/themes?slug=${encodeURIComponent(p.themeSlug)}`, { credentials: "include" })
        .then(r => {
          if (r.status === 401) { setError("Please log in to view lessons."); setLoading(false); return null; }
          if (r.status === 404) { setError("Theme not found."); setLoading(false); return null; }
          return r.json();
        })
        .then(data => {
          if (!data) return;
          if (data.error) { setError(data.error); }
          else if (data.theme) { setTheme(data.theme); }
          else { setError("Theme not found or not yet published."); }
        })
        .catch(() => setError("Unable to load lessons. Please try again."))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) return (
    <div style={{ padding: "2rem", textAlign: "center", color: C.body }}>
      <BookOpen size={36} style={{ color: C.teal, margin: "0 auto 0.75rem" }} />
      <p style={{ fontWeight: 600 }}>Loading theme...</p>
    </div>
  );

  if (error || !theme) return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <BookOpen size={36} style={{ color: C.body, margin: "0 auto 0.75rem" }} />
      <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: "0.375rem" }}>
        {error || "Theme not found"}
      </h3>
      <p style={{ color: C.body, fontSize: "0.875rem", marginBottom: "1rem" }}>
        {error === "Please log in to view lessons."
          ? "Log in and try again."
          : "This theme may not exist or isn't published yet. Ask your admin to publish lessons."}
      </p>
      <Link href="/dashboard/student/subjects" style={{ color: C.teal, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
        ← Back to Subjects
      </Link>
    </div>
  );

  const quests: Quest[] = (theme.quests || []).filter((q: any) => q.lessons && q.lessons.length > 0);
  const totalLessons = quests.reduce((sum, q) => sum + (q.lessons?.length || 0), 0);
  const completedLessons = quests.reduce((sum, q) => sum + (q.lessons?.filter((l: any) => l.isCompleted).length || 0), 0);

  return (
    <div>
      <Link href="/dashboard/student/subjects" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: C.body, fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none", marginBottom: "0.75rem" }}>
        <ArrowLeft size={14} /> Back to Subjects
      </Link>

      <div style={{ padding: "1.25rem", borderRadius: 16, background: `linear-gradient(135deg, ${C.teal}, #065F46)`, color: "#fff", marginBottom: "1.25rem" }}>
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

      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: C.dark, marginBottom: "0.75rem" }}>Quests</h2>

      {quests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "1.5rem", background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <p style={{ color: C.body, fontSize: "0.875rem" }}>No quests with published lessons in this theme yet. Ask your admin to publish more content.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {quests.map((quest, i) => (
            <QuestCard key={quest.id} quest={quest} index={i} themeSlug={theme.slug} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestCard({ quest, index, themeSlug }: { quest: Quest; index: number; themeSlug: string }) {
  return (
    <Link href={`/dashboard/student/lessons/${themeSlug}/${quest.slug}`} style={{
      padding: "1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem",
      background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, transition: "box-shadow 0.2s",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: quest.isCompleted ? `${"#22C55E"}15` : `${C.teal}15`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {quest.isCompleted
          ? <CheckCircle2 size={20} style={{ color: "#22C55E" }} />
          : <span style={{ fontWeight: 800, color: C.teal, fontSize: "0.8125rem" }}>{index + 1}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.125rem", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: C.dark, fontSize: "0.875rem" }}>{quest.title}</span>
          {quest.questType && (
            <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: C.teal, background: `${C.teal}15`, padding: "0.1rem 0.3rem", borderRadius: 4 }}>
              {quest.questType}
            </span>
          )}
        </div>
        {quest.description && <p style={{ fontSize: "0.75rem", color: C.body, lineHeight: 1.3, margin: 0 }}>{quest.description}</p>}
        {quest.lessons && quest.lessons.length > 0 && (
          <span style={{ fontSize: "0.6875rem", color: C.body }}>{quest.lessons.length} lessons · 🪙 {getRewardValue(quest.xpReward)} XP</span>
        )}
      </div>
      {quest.progress > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: C.border }}>
            <div style={{ height: "100%", borderRadius: 3, background: C.teal, width: `${quest.progress}%` }} />
          </div>
          <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.teal }}>{quest.progress}%</span>
        </div>
      )}
      <ChevronRight size={16} style={{ color: C.body, flexShrink: 0 }} />
    </Link>
  );
}
