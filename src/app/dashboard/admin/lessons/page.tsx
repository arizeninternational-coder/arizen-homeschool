"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { BookOpen, ArrowLeft, Plus, Search, AlertCircle, CheckCircle, Eye, Edit, Layers, GraduationCap } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface LessonRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  orderIndex: number;
  createdAt: string;
  quest?: {
    id: string;
    title: string;
    theme?: { id: string; title: string; grade: number };
  };
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Content Missing",
  REVIEW: "In Review",
  PUBLISHED: "Published",
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  DRAFT:          { color: "#92400E", bg: "#FEF3C7" },
  REVIEW:         { color: "#1E40AF", bg: "#DBEAFE" },
  PUBLISHED:      { color: "#065F46", bg: "#D1FAE5" },
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [publishing, setPublishing] = useState<string | null>(null);

  const loadLessons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/lessons", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLessons(data.lessons || []);
      } else {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.error || "Failed to load lessons");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLessons(); }, [loadLessons]);

  const handlePublish = async (lesson: LessonRecord) => {
    if (publishing) return;
    setPublishing(lesson.id);
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      if (res.ok) {
        setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, status: "PUBLISHED" } : l));
      }
    } catch (e) {
      console.error("[PUBLISH] Error:", e);
    }
    setPublishing(null);
  };

  const handleUnpublish = async (lesson: LessonRecord) => {
    if (publishing) return;
    setPublishing(lesson.id);
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "DRAFT" }),
      });
      if (res.ok) {
        setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, status: "DRAFT" } : l));
      }
    } catch (e) {
      console.error("[UNPUBLISH] Error:", e);
    }
    setPublishing(null);
  };

  const grades = [...new Set(lessons.map(l => l.quest?.theme?.grade).filter(Boolean))].sort();

  const filtered = lessons.filter(l => {
    if (filterGrade !== "all" && l.quest?.theme?.grade !== parseInt(filterGrade)) return false;
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (l.title || "").toLowerCase().includes(q) || (l.quest?.title || "").toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            Sign Out
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Lessons</h1>
            <p style={{ color: colors.textMuted }}>{lessons.length} lessons · {lessons.filter(l => l.status === "PUBLISHED").length} published · {lessons.filter(l => l.status === "DRAFT").length} draft</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link href="/dashboard/admin/curriculum/import" style={{ ...ds.btnSecondary, fontSize: "0.875rem", padding: "0.625rem 1.25rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              📥 Import
            </Link>
            <Link href="/dashboard/admin/lessons/new" style={{ ...ds.btnPrimary, fontSize: "0.875rem", padding: "0.625rem 1.25rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <Plus style={{ width: 14, height: 14 }} /> Create
            </Link>
          </div>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: `${colors.warning || "#F59E0B"}15`, border: `1px solid ${colors.warning || "#F59E0B"}30`, color: colors.warning || "#B45309", fontSize: "0.875rem", fontWeight: 600 }}>
            <AlertCircle style={{ width: 16, height: 16 }} /> {error}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: colors.textMuted }} />
            <input placeholder="Search lessons..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...ds.input, paddingLeft: "2.5rem", fontSize: "0.875rem" }} />
          </div>
          {grades.length > 0 && (
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} style={{ ...ds.input, fontSize: "0.875rem", minWidth: 140 }}>
              <option value="all">All Grades</option>
              {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          )}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...ds.input, fontSize: "0.875rem", minWidth: 150 }}>
            <option value="all">All Status</option>
            <option value="DRAFT">Content Missing</option>
            <option value="REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        {loading ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem", color: colors.textMuted }}>Loading lessons...</div>
        ) : filtered.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
            <BookOpen style={{ width: 48, height: 48, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>
              {search || filterGrade !== "all" || filterStatus !== "all" ? "No lessons match your filters" : "No lessons found"}
            </h3>
            <p style={{ color: colors.textMuted, fontSize: "0.9375rem", maxWidth: 400, margin: "0 auto" }}>
              {search || filterGrade !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Import a CSV or create lessons to get started."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {filtered.map((lesson) => {
              const sc = STATUS_COLORS[lesson.status] || STATUS_COLORS["DRAFT"];
              return (
                <div key={lesson.id} style={{ ...ds.card, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BookOpen style={{ width: 18, height: 18, color: colors.primary }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{lesson.title}</div>
                    <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "0.125rem" }}>
                      {lesson.quest?.theme && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <GraduationCap style={{ width: 10, height: 10 }} />
                          Grade {lesson.quest.theme.grade} · {lesson.quest.theme.title}
                        </span>
                      )}
                      {lesson.quest && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginLeft: "0.75rem" }}>
                          <Layers style={{ width: 10, height: 10 }} />
                          {lesson.quest.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{
                    fontSize: "0.6875rem", fontWeight: 700,
                    color: sc.color, background: sc.bg,
                    padding: "0.2rem 0.5rem", borderRadius: 6, flexShrink: 0
                  }}>
                    {STATUS_LABELS[lesson.status] || lesson.status}
                  </span>
                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                    {lesson.status !== "PUBLISHED" ? (
                      <button
                        onClick={(e) => { e.preventDefault(); handlePublish(lesson); }}
                        disabled={publishing === lesson.id}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          padding: "4px 10px", borderRadius: 6, border: "1px solid #A7F3D0",
                          background: "#ECFDF5", color: "#065F46", fontSize: "0.6875rem",
                          fontWeight: 700, cursor: publishing === lesson.id ? "default" : "pointer",
                        }}
                      >
                        {publishing === lesson.id ? "Publishing..." : <><CheckCircle size={12} /> Publish</>}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.preventDefault(); handleUnpublish(lesson); }}
                        disabled={publishing === lesson.id}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          padding: "4px 10px", borderRadius: 6, border: "1px solid #FEE2E2",
                          background: "#FEF2F2", color: "#991B1B", fontSize: "0.6875rem",
                          fontWeight: 700, cursor: publishing === lesson.id ? "default" : "pointer",
                        }}
                      >
                        {publishing === lesson.id ? "Unpublishing..." : "Unpublish"}
                      </button>
                    )}
                    <Link href={`/dashboard/admin/lessons/${lesson.id}`} style={{
                      padding: "4px 10px", borderRadius: 6, border: `1px solid ${colors.border}`,
                      background: "white", color: colors.textMuted, fontSize: "0.6875rem",
                      fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px",
                    }}>
                      <Edit size={12} /> Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
