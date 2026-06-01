"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronRight, CheckCircle2, Circle, Lock, Play } from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B",
  white: "#FFFFFF", border: "#E2E8F0",
};

interface Lesson {
  id: string; title: string; slug: string; description: string;
  status: string; xpReward: number; completed?: boolean; orderIndex?: number;
}

interface Module {
  id: string; title: string; slug: string; description: string;
  status: string; lessons: Lesson[]; lessonCount?: number;
}

export default function StudentSubjectDetailPage() {
  const params = useParams();
  const subjectSlug = params.subjectSlug as string;
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/learner/subjects/${subjectSlug}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSubjectName(data.subject?.name || data.name || subjectSlug.replace(/-/g, " "));
          const rawModules = data.modules || data.themes || [];
          setModules(rawModules.map((m: any) => ({
            id: m.id || m.slug,
            title: m.title || m.name,
            slug: m.slug || m.id,
            description: m.description || "",
            status: m.status || "published",
            lessons: (m.lessons || m.Lessons || []).map((l: any) => ({
              id: l.id, title: l.title, slug: l.slug || l.id,
              description: l.description || "",
              status: l.status || "published",
              xpReward: typeof l.xpReward === "number" ? l.xpReward : (JSON.parse(l.xpReward || '{"base":10}').base || 10),
              completed: l.completed || false,
              orderIndex: l.orderIndex || 1,
            })),
            lessonCount: m.lessonCount || m.lessons?.length || 0,
          })));
        }
      } catch (e) { console.error("[SUBJECT_DETAIL] Load error:", e); }
      setLoading(false);
    };
    load();
  }, [subjectSlug]);

  if (loading) return null;

  return (
    <div style={{ padding: "28px 32px 40px" }}>
      <div style={{ marginBottom: 8 }}>
        <Link href="/dashboard/student/subjects" style={{ color: C.body, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
          ← Back to Subjects
        </Link>
      </div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 4px 0" }}>{subjectName}</h1>
        <p style={{ color: C.body, fontSize: "0.9375rem", margin: 0 }}>
          {modules.length} modules · {modules.reduce((a, m) => a + (m.lessons?.length || 0), 0)} lessons
        </p>
      </div>

      {modules.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: C.white, borderRadius: 20, border: "1px solid " + C.border }}>
          <BookOpen size={48} style={{ color: C.body, margin: "0 auto 16px", opacity: 0.4 }} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: C.dark, marginBottom: "0.5rem" }}>No modules yet</h3>
          <p style={{ color: C.body, fontSize: "0.875rem", maxWidth: 400, margin: "0 auto" }}>
            Your learning modules will appear here once curriculum is imported.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {modules.map((mod, mi) => (
            <div key={mod.id} style={{
              background: C.white, borderRadius: 20, border: "1px solid " + C.border,
              overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            }}>
              {/* Module header */}
              <div style={{
                padding: "20px 24px", background: `linear-gradient(135deg, #F8FAFC, #F1F5F9)`,
                borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: C.teal,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 900, fontSize: "0.875rem",
                }}>{mi + 1}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: C.dark, margin: "0 0 2px" }}>{mod.title}</h3>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: C.body }}>
                    {mod.lessons?.length || mod.lessonCount || 0} lessons · {mod.status}
                  </span>
                </div>
              </div>

              {/* Lessons */}
              <div style={{ padding: "8px 16px" }}>
                {(!mod.lessons || mod.lessons.length === 0) ? (
                  <p style={{ padding: "16px 8px", fontSize: "0.8125rem", color: C.body, textAlign: "center" }}>No lessons in this module yet.</p>
                ) : (
                  mod.lessons
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                    .map((lesson, li) => (
                      <Link key={lesson.id} href={`/dashboard/student/lessons/${lesson.slug}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 8px", borderRadius: 12, textDecoration: "none",
                          borderBottom: li < mod.lessons.length - 1 ? "1px solid #F1F5F9" : "none",
                        }}>
                        {lesson.completed ? (
                          <CheckCircle2 size={20} style={{ color: "#059669", flexShrink: 0 }} />
                        ) : lesson.status === "draft" ? (
                          <Lock size={18} style={{ color: C.muted, flexShrink: 0 }} />
                        ) : (
                          <Play size={18} style={{ color: C.teal, flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            fontSize: "0.875rem", fontWeight: 600, color: lesson.completed ? C.body : C.dark,
                            textDecoration: lesson.completed ? "none" : "none",
                          }}>{lesson.title}</span>
                          {lesson.description && (
                            <p style={{ fontSize: "0.75rem", color: C.body, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#D97706", flexShrink: 0 }}>+{lesson.xpReward} XP</span>
                        <ChevronRight size={16} style={{ color: C.muted, flexShrink: 0 }} />
                      </Link>
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
