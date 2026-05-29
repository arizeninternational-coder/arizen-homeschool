"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { BookOpen, ArrowLeft, AlertCircle, GraduationCap, Layers, Clock, CheckCircle, Edit } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface LessonDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  status: string;
  orderIndex: number;
  xpReward: number;
  activityInstructions: string | null;
  question1: string | null;
  answer1: string | null;
  question2: string | null;
  answer2: string | null;
  question3: string | null;
  answer3: string | null;
  createdAt: string;
  updatedAt: string;
  quest?: {
    id: string;
    title: string;
    theme?: {
      id: string;
      title: string;
      grade: number;
    };
  };
}

export default function AdminLessonDetailPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/lessons/${params.id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setLesson(data.lesson);
        } else {
          const errBody = await res.json().catch(() => ({}));
          setError(errBody.error || "Failed to load lesson");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <p style={{ color: colors.textMuted }}>Loading lesson...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <Link href="/dashboard/admin/lessons" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Lessons
          </Link>
          <div style={{ ...ds.alertError }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
            <span>{error || "Lesson not found"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/admin/lessons" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Lessons
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            Sign Out
          </button>
        </div>

        {/* Header */}
        <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: lesson.status === "PUBLISHED" ? colors.success : colors.warning, background: lesson.status === "PUBLISHED" ? `${colors.success}15` : `${colors.warning}15`, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                  {lesson.status}
                </span>
                {lesson.quest?.theme && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: colors.textMuted, background: colors.bgSoft, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                    <GraduationCap style={{ width: 10, height: 10 }} /> Grade {lesson.quest.theme.grade} · {lesson.quest.theme.title}
                  </span>
                )}
                {lesson.quest && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: colors.textMuted, background: colors.bgSoft, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                    <Layers style={{ width: 10, height: 10 }} /> {lesson.quest.title}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>{lesson.title}</h1>
              {lesson.description && <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>{lesson.description}</p>}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              <div style={{ padding: "0.5rem 1rem", borderRadius: 10, background: colors.primarySoft, color: colors.primary, fontWeight: 700, fontSize: "0.875rem" }}>
                {lesson.xpReward || 0} XP
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {lesson.content && (
          <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>Lesson Content</h2>
            <div style={{ color: colors.textMuted, fontSize: "0.9375rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{lesson.content}</div>
          </div>
        )}

        {/* Activities */}
        {lesson.activityInstructions && (
          <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>Activity Instructions</h2>
            <div style={{ color: colors.textMuted, fontSize: "0.9375rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{lesson.activityInstructions}</div>
          </div>
        )}

        {/* Questions */}
        {(lesson.question1 || lesson.question2 || lesson.question3) && (
          <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>Questions</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              {[lesson.question1, lesson.question2, lesson.question3].filter(Boolean).map((q, i) => (
                <div key={i} style={{ padding: "1rem", borderRadius: 12, background: colors.bgSoft }}>
                  <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem", marginBottom: "0.5rem" }}>Q{i + 1}: {q}</div>
                  <div style={{ fontSize: "0.8125rem", color: colors.textMuted }}>
                    Answer: {[lesson.answer1, lesson.answer2, lesson.answer3][i] || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div style={{ ...ds.card, padding: "1rem 1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.75rem", color: colors.textMuted }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <Clock style={{ width: 12, height: 12 }} /> Created: {new Date(lesson.createdAt).toLocaleDateString()}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <CheckCircle style={{ width: 12, height: 12 }} /> Updated: {new Date(lesson.updatedAt).toLocaleDateString()}
          </span>
          <span>Order: #{lesson.orderIndex}</span>
          <span>Slug: {lesson.slug}</span>
        </div>
      </div>
    </div>
  );
}
