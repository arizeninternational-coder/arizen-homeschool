"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight, CheckCircle2, Zap, ArrowLeft, Target
} from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";

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

export default function QuestDetailPage({ params }: { params: Promise<{ themeSlug: string; questSlug: string }> }) {
  const [slugs, setSlugs] = useState<{ themeSlug: string; questSlug: string } | null>(null);
  const [quest, setQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => {
      setSlugs(p);
      fetch(`/api/quests/${p.questSlug}?slug=${p.questSlug}`)
        .then(r => r.json())
        .then(data => setQuest(data.quest))
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) return <div style={{ ...ds.card, padding: "2rem", textAlign: "center", color: colors.textMuted }}>Loading quest...</div>;
  if (!quest) return (
    <div style={{ ...ds.card, padding: "2rem", textAlign: "center" }}>
      <Target style={{ width: 36, height: 36, color: colors.textMuted, margin: "0 auto 0.75rem" }} />
      <h3 style={{ fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>Quest not found</h3>
      <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>This quest may not exist or isn't published yet.</p>
      <Link href="/dashboard/student/lessons" style={{ ...ds.btnPrimary, display: "inline-flex", textDecoration: "none", marginTop: "1rem" }}>Back to Themes</Link>
    </div>
  );

  const lessons: Lesson[] = quest.lessons || [];
  const completedCount = lessons.filter((l: Lesson) => l.isCompleted).length;
  const xpReward = typeof quest.xpReward === "object" ? (quest.xpReward as any)?.base : quest.xpReward;

  return (
    <>
      <Link href={slugs ? `/dashboard/student/lessons/${slugs.themeSlug}` : "/dashboard/student/lessons"} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: colors.textMuted, fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none", marginBottom: "0.75rem" }}>
        <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Theme
      </Link>

      <div style={{ padding: "1.25rem", borderRadius: 16, background: gradients.primary, color: "white", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
          {quest.questType && <span style={{ fontSize: "0.625rem", fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "0.1rem 0.375rem", borderRadius: 5 }}>{quest.questType}</span>}
          {quest.isCompleted && <span style={{ fontSize: "0.625rem", fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "0.1rem 0.375rem", borderRadius: 5 }}>✓ COMPLETED</span>}
        </div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.375rem" }}>{quest.title}</h1>
        {quest.description && <p style={{ opacity: 0.9, fontSize: "0.875rem", marginBottom: "0.75rem" }}>{quest.description}</p>}
        <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", opacity: 0.85, flexWrap: "wrap" }}>
          <span>{lessons.length} lessons</span>
          <span>{completedCount}/{lessons.length} completed</span>
          {xpReward && <span style={{ display: "flex", alignItems: "center", gap: "0.125rem" }}><Zap style={{ width: 12, height: 12 }} /> +{xpReward} XP</span>}
        </div>
        {quest.progress !== undefined && (
          <div style={{ marginTop: "0.75rem", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.2)" }}>
            <div style={{ height: "100%", borderRadius: 3, background: "white", width: `${quest.progress}%`, transition: "width 0.3s" }} />
          </div>
        )}
      </div>

      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.75rem" }}>Lessons</h2>

      {lessons.length === 0 ? (
        <div style={{ ...ds.card, textAlign: "center", padding: "1.5rem" }}>
          <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>No lessons available in this quest yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {lessons.map((lesson: Lesson, i: number) => (
            <LessonCard key={lesson.id} lesson={lesson} index={i} themeSlug={slugs?.themeSlug || ""} questSlug={slugs?.questSlug || ""} />
          ))}
        </div>
      )}
    </>
  );
}

function LessonCard({ lesson, index, themeSlug, questSlug }: { lesson: Lesson; index: number; themeSlug: string; questSlug: string }) {
  const xp = typeof lesson.xpReward === "object" ? (lesson.xpReward as any)?.base : lesson.xpReward;

  return (
    <Link href={`/dashboard/student/lessons/${themeSlug}/${questSlug}/${lesson.slug}`} style={{ ...ds.card, padding: "0.875rem 1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: lesson.isCompleted ? `${colors.success}15` : lesson.progress > 0 ? colors.primarySoft : colors.bgAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {lesson.isCompleted ? <CheckCircle2 style={{ width: 18, height: 18, color: colors.success }} /> : <span style={{ fontWeight: 800, color: colors.textMuted, fontSize: "0.75rem" }}>{index + 1}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>{lesson.title}</span>
        {lesson.description && <p style={{ fontSize: "0.6875rem", color: colors.textMuted, marginTop: "0.125rem" }}>{lesson.description}</p>}
      </div>
      {lesson.progress > 0 && !lesson.isCompleted && (
        <span style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.primary }}>{lesson.progress}%</span>
      )}
      {xp && (
        <span style={{ display: "flex", alignItems: "center", gap: "0.125rem", fontSize: "0.6875rem", fontWeight: 700, color: colors.warm, background: colors.warmSoft, padding: "0.125rem 0.375rem", borderRadius: 6 }}>
          <Zap style={{ width: 10, height: 10 }} /> +{xp}
        </span>
      )}
      <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted, flexShrink: 0 }} />
    </Link>
  );
}
