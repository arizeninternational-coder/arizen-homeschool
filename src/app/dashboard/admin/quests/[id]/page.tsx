"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Layers, ArrowLeft, AlertCircle, GraduationCap, BookOpen, Clock, Award } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface QuestDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  orderIndex: number;
  xpReward: number;
  badgeReward: string | null;
  createdAt: string;
  updatedAt: string;
  theme?: {
    id: string;
    title: string;
    grade: number;
  };
  lessons?: {
    id: string;
    title: string;
    slug: string;
    status: string;
    orderIndex: number;
  }[];
}

export default function AdminQuestDetailPage({ params }: { params: { id: string } }) {
  const [quest, setQuest] = useState<QuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/quests/${params.id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setQuest(data.quest);
        } else {
          const errBody = await res.json().catch(() => ({}));
          setError(errBody.error || "Failed to load quest");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load quest");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <p style={{ color: colors.textMuted }}>Loading quest...</p>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <Link href="/dashboard/admin/quests" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Quests
          </Link>
          <div style={{ ...ds.alertError }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
            <span>{error || "Quest not found"}</span>
          </div>
        </div>
      </div>
    );
  }

  const linkedLessons = quest.lessons || [];

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/admin/quests" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Quests
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            Sign Out
          </button>
        </div>

        {/* Header */}
        <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: quest.status === "PUBLISHED" ? colors.success : colors.warning, background: quest.status === "PUBLISHED" ? `${colors.success}15` : `${colors.warning}15`, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
              {quest.status}
            </span>
            {quest.theme && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: colors.textMuted, background: colors.bgSoft, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                <GraduationCap style={{ width: 10, height: 10 }} /> Grade {quest.theme.grade} · {quest.theme.title}
              </span>
            )}
            <span style={{ fontSize: "0.6875rem", color: colors.primary, fontWeight: 700, background: colors.primarySoft, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
              {quest.xpReward || 0} XP
            </span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>{quest.title}</h1>
          {quest.description && <p style={{ color: colors.textMuted, fontSize: "0.9375rem", lineHeight: 1.7 }}>{quest.description}</p>}
        </div>

        {/* Linked Lessons */}
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>
          Linked Lessons ({linkedLessons.length})
        </h2>

        {linkedLessons.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "2.5rem 1.5rem", marginBottom: "1.5rem" }}>
            <BookOpen style={{ width: 40, height: 40, color: colors.textMuted, margin: "0 auto 0.75rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>No lessons linked yet</h3>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>Lessons linked to this quest will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {linkedLessons.map((lesson) => (
              <Link key={lesson.id} href={`/dashboard/admin/lessons/${lesson.id}`} style={{ ...ds.card, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BookOpen style={{ width: 18, height: 18, color: colors.primary }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{lesson.title}</div>
                  <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Order: #{lesson.orderIndex}</div>
                </div>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: lesson.status === "PUBLISHED" ? colors.success : colors.warning, background: lesson.status === "PUBLISHED" ? `${colors.success}15` : `${colors.warning}15`, padding: "0.2rem 0.5rem", borderRadius: 6, flexShrink: 0 }}>
                  {lesson.status}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Meta */}
        <div style={{ ...ds.card, padding: "1rem 1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.75rem", color: colors.textMuted }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <Clock style={{ width: 12, height: 12 }} /> Created: {new Date(quest.createdAt).toLocaleDateString()}
          </span>
          <span>Order: #{quest.orderIndex}</span>
          <span>Slug: {quest.slug}</span>
          {quest.badgeReward && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Award style={{ width: 12, height: 12 }} /> Badge: {quest.badgeReward}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
