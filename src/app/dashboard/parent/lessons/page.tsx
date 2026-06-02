"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { BookOpen, ArrowLeft, Loader2, GraduationCap } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

// Helper to safely extract reward value
function getRewardValue(xpReward: any): number {
  if (!xpReward) return 0;
  if (typeof xpReward === "number") return xpReward;
  if (typeof xpReward === "object") return xpReward?.base || xpReward?.amount || 0;
  if (typeof xpReward === "string") {
    try { const parsed = JSON.parse(xpReward); return parsed?.base || parsed?.amount || 0; } catch { return 0; }
  }
  return 0;
}

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

  // Filter themes to only those matching linked children's grades
  const childrenGrades = new Set(children.map(c => c.grade).filter(Boolean));
  const relevantThemes = children.length > 0 && childrenGrades.size > 0
    ? themes.filter(t => childrenGrades.has(t.grade))
    : themes;

  const hasContent = children.length > 0 && relevantThemes.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <Link href="/dashboard/parent" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>Lessons</h1>
        <p style={{ color: colors.textMuted, marginBottom: "2rem" }}>Published lessons for your children.</p>

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
          <div style={{ display: "grid", gridTemplateColumns: children.length > 1 ? "1fr 1fr" : "1fr", gap: 20 }}>
            {children.map((child) => {
              const childName = child.name || "Unnamed child";
              const childGrade = child.grade;
              const childThemes = childGrade
                ? relevantThemes.filter(t => t.grade === childGrade)
                : relevantThemes;

              return (
                <div key={child.id || childName} style={{ ...ds.card, padding: "1.5rem" }}>
                  {/* Child header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${colors.border}` }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1rem", flexShrink: 0,
                    }}>
                      {childName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: colors.text, fontSize: "1rem" }}>{childName}</div>
                      {childGrade != null && (
                        <div style={{ fontSize: "0.75rem", color: colors.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                          <GraduationCap size={12} /> Grade {childGrade}
                        </div>
                      )}
                    </div>
                  </div>

                  {childThemes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem 1rem", background: colors.bgSoft, borderRadius: 12 }}>
                      <p style={{ fontSize: "0.8125rem", color: colors.textMuted }}>No published lessons for Grade {childGrade} yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {childThemes.map((theme: any) => {
                        const quests = (theme.quests || []).filter((q: any) => q.lessons && q.lessons.length > 0);
                        if (quests.length === 0) return null;
                        return (
                          <div key={theme.id}>
                            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: colors.text, marginBottom: 6 }}>{theme.title}</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {quests.map((quest: any) => (
                                <div key={quest.id} style={{ padding: "10px 12px", borderRadius: 10, background: colors.bgSoft, border: `1px solid ${colors.border}` }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                    <span style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.primary, background: colors.primarySoft, padding: "1px 6px", borderRadius: 4 }}>
                                      {quest.questType || "MAIN"}
                                    </span>
                                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: colors.text }}>{quest.title}</span>
                                  </div>
                                  {quest.lessons && quest.lessons.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                      {quest.lessons.map((lesson: any) => (
                                        <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, background: "#fff", border: `1px solid ${colors.borderLight}` }}>
                                          <BookOpen size={12} style={{ color: colors.primary, flexShrink: 0 }} />
                                          <span style={{ fontSize: "0.75rem", fontWeight: 500, color: colors.text, flex: 1 }}>{lesson.title}</span>
                                          {lesson.estimatedDurationMinutes && (
                                            <span style={{ fontSize: "0.625rem", color: colors.textMuted }}>{lesson.estimatedDurationMinutes}m</span>
                                          )}
                                          <span style={{ fontSize: "0.625rem", color: "#D97706", fontWeight: 600 }}>🪙 {getRewardValue(lesson.xpReward)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
