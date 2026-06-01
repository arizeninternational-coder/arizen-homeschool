"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Star, Lock } from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", tealD: "#005B50",
  dark: "#0F172A", body: "#64748B", muted: "#94A3B8",
  white: "#FFFFFF", border: "#E2E8F0",
  lavender: "#EDE9FE", yellow: "#FFF4D8", blue: "#EFF6FF",
  rose: "#FFF1F2", mint: "#ECFDF5", cream: "#FFFBEB",
};

const SUBJECT_COLORS = [
  { bg: "#EDE9FE", accent: "#6D28D9", icon: "🔢" },
  { bg: "#DBEAFE", accent: "#2563EB", icon: "📖" },
  { bg: "#D1FAE5", accent: "#059669", icon: "🔬" },
  { bg: "#FEF3C7", accent: "#D97706", icon: "🌍" },
  { bg: "#FFE4E6", accent: "#E11D48", icon: "🎨" },
  { bg: "#CCFBF1", accent: "#047A70", icon: "💪" },
  { bg: "#EFF6FF", accent: "#3B82F6", icon: "💻" },
  { bg: "#FCE7F3", accent: "#BE185D", icon: "🎵" },
  { bg: "#F5F3FF", accent: "#7C3AED", icon: "📐" },
];

interface Subject {
  id?: string;
  name: string;
  slug: string;
  grade?: number;
  level?: number;
  progress?: number;
  modulesCount?: number;
  lessonsCount?: number;
  completedLessons?: number;
  color?: string;
  accent?: string;
  icon?: string;
}

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/learner/subjects", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const raw = data.subjects || data || [];
          setSubjects(raw.map((s: any, i: number) => ({
            id: s.id || s.slug || String(i),
            name: s.name || s.title || "Subject",
            slug: s.slug || s.name?.toLowerCase().replace(/\s+/g, "-") || `subject-${i}`,
            grade: s.grade || null,
            level: s.level || 1,
            progress: s.progress || 0,
            modulesCount: s.modulesCount || s.modules_count || 0,
            lessonsCount: s.lessonsCount || s.lessons_count || 0,
            completedLessons: s.completedLessons || s.completed_lessons || 0,
            ...SUBJECT_COLORS[i % SUBJECT_COLORS.length],
          })));
        }
      } catch (e) { console.error("[SUBJECTS] Load error:", e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return null;

  return (
    <div style={{ padding: "28px 32px 40px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 4px 0" }}>My Subjects</h1>
        <p style={{ color: C.body, fontSize: "0.9375rem", margin: 0 }}>Explore your learning subjects and track your progress.</p>
      </div>

      {subjects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: C.white, borderRadius: 20, border: "1px solid " + C.border }}>
          <BookOpen size={48} style={{ color: C.muted, margin: "0 auto 16px", opacity: 0.4 }} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: C.dark, marginBottom: "0.5rem" }}>No subjects yet</h3>
          <p style={{ color: C.body, fontSize: "0.875rem", maxWidth: 400, margin: "0 auto" }}>
            Your subjects will appear here once your curriculum is set up by your admin.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {subjects.map((subject, i) => (
            <Link
              key={subject.id || i}
              href={`/dashboard/student/subjects/${subject.slug}`}
              style={{
                display: "block", textDecoration: "none",
                background: `linear-gradient(135deg, ${C.white}, ${subject.bg || C.lavender})`,
                border: `1.5px solid ${subject.accent || C.teal}20`,
                borderRadius: 20, padding: "24px",
                boxShadow: `0 4px 16px ${subject.accent || C.teal}08`,
                transition: "transform 0.15s, box-shadow 0.15s",
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Subject icon */}
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: subject.bg || C.lavender,
                border: `2px solid ${subject.accent || C.teal}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, marginBottom: 14,
              }}>
                {subject.icon || "📚"}
              </div>

              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 4px" }}>
                {subject.name}
              </h3>

              {subject.grade && (
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: subject.accent || C.teal, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Grade {subject.grade}
                </span>
              )}

              {/* Progress */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted }}>Progress</span>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: subject.accent || C.teal }}>{subject.progress || 0}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: `${subject.accent || C.teal}10`, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${subject.progress || 0}%`, borderRadius: 3,
                    background: `linear-gradient(90deg, ${subject.accent || C.teal}, ${subject.accent || C.teal}AA)`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                {subject.modulesCount !== undefined && (
                  <span style={{ fontSize: "0.6875rem", color: C.body }}>
                    📦 {subject.modulesCount} modules
                  </span>
                )}
                {subject.lessonsCount !== undefined && (
                  <span style={{ fontSize: "0.6875rem", color: C.body }}>
                    📝 {subject.completedLessons || 0}/{subject.lessonsCount} lessons
                  </span>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight size={20} style={{ position: "absolute", top: 24, right: 20, color: C.muted, opacity: 0.5 }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
