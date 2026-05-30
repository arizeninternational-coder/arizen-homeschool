"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { GraduationCap, ArrowLeft, BookOpen, Layers, Users, ChevronRight, Loader2 } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface GradeData {
  grade: number;
  themes: any[];
}

export default function AdminGradesPage() {
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/grades", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setGrades(data.grades || []);
        } else {
          const errBody = await res.json().catch(() => ({}));
          setError(errBody.error || "Failed to load grades");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load grades");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const gradeLabels: Record<number, string> = {
    1: "Grade 1", 2: "Grade 2", 3: "Grade 3", 4: "Grade 4",
    5: "Grade 5", 6: "Grade 6", 7: "Grade 7", 8: "Grade 8", 9: "Grade 9",
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            Sign Out
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap style={{ width: 22, height: 22, color: colors.primary }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text }}>Grades</h1>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>Manage grades, subjects, modules, and lessons</p>
          </div>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: `${colors.warning || "#F59E0B"}15`, border: `1px solid ${colors.warning || "#F59E0B"}30`, color: colors.warning || "#B45309", fontSize: "0.875rem", fontWeight: 600 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem", color: colors.textMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <Loader2 style={{ width: 20, height: 20 }} className="spinner" /> Loading grades...
          </div>
        ) : grades.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
            <GraduationCap style={{ width: 48, height: 48, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>No grades found</h3>
            <p style={{ color: colors.textMuted, fontSize: "0.9375rem", maxWidth: 400, margin: "0 auto" }}>
              No grade levels exist in the database yet. Run the seed script or create themes with grade assignments.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {grades.map((g) => (
              <Link key={g.grade} href={`/dashboard/admin/grades/${g.grade}`} style={{ ...ds.card, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none", color: "inherit" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <GraduationCap style={{ width: 22, height: 22, color: colors.primary }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: colors.text, fontSize: "1rem" }}>
                    {gradeLabels[g.grade] || `Grade ${g.grade}`}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "0.125rem" }}>
                    {g.themes.length} theme{g.themes.length !== 1 ? "s" : ""} · {g.themes.filter((t: any) => t.status === "PUBLISHED").length} published
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", borderRadius: 6, background: colors.primarySoft, color: colors.primary, fontSize: "0.6875rem", fontWeight: 700 }}>
                    <BookOpen style={{ width: 12, height: 12 }} /> {g.themes.length} themes
                  </div>
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: colors.textMuted, flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
