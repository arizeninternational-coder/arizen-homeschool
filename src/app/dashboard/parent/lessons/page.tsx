"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

export default function ParentLessonsPage() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [childrenRes, themesRes] = await Promise.allSettled([
          fetch("/api/parent/link-child", { credentials: "include" }).then(r => r.json()),
          fetch("/api/themes", { credentials: "include" }).then(r => r.json()),
        ]);
        if (childrenRes.status === "fulfilled") setChildren(childrenRes.value.children || []);
        if (themesRes.status === "fulfilled") setThemes(themesRes.value.themes || []);
      } catch (e) { console.error("[PARENT_LESSONS] Load error:", e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <Loader2 size={32} style={{ color: colors.primary }} />
      </div>
    );
  }

  const hasContent = children.length > 0 && themes.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <Link href="/dashboard/parent" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>Lessons</h1>
        <p style={{ color: colors.textMuted, marginBottom: "2rem" }}>Browse published lessons for your children.</p>

        {!hasContent ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
            <BookOpen style={{ width: 48, height: 48, color: colors.primary, margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>No lessons yet</h3>
            <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>
              {children.length === 0
                ? "Link a child account first, then lessons will appear here when published by the admin."
                : "Lessons will appear here when the admin publishes curriculum for your child's grade."}
            </p>
          </div>
        ) : (
          themes.map((theme: any) => {
            const quests = (theme.quests || []).filter((q: any) => q.lessons && q.lessons.length > 0);
            if (quests.length === 0) return null;
            return (
              <div key={theme.id} style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "0.75rem" }}>{theme.title}</h2>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {quests.map((quest: any) => (
                    <div key={quest.id} style={{ ...ds.card, padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.primary, background: colors.primarySoft, padding: "2px 8px", borderRadius: 6 }}>
                          {quest.questType || "MAIN"}
                        </span>
                        <span style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{quest.title}</span>
                      </div>
                      {quest.description && (
                        <p style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "0.5rem" }}>{quest.description}</p>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                        {quest.lessons.map((lesson: any) => (
                          <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "8px 12px", borderRadius: 10, background: colors.bgSoft, border: `1px solid ${colors.border}` }}>
                            <BookOpen size={14} style={{ color: colors.primary, flexShrink: 0 }} />
                            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: colors.text, flex: 1 }}>{lesson.title}</span>
                            {lesson.estimatedDurationMinutes && (
                              <span style={{ fontSize: "0.6875rem", color: colors.textMuted }}>{lesson.estimatedDurationMinutes}m</span>
                            )}
                            <span style={{ fontSize: "0.6875rem", color: colors.warning }}>🪙 {typeof lesson.xpReward === "object" ? lesson.xpReward?.base : lesson.xpReward || 10}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
