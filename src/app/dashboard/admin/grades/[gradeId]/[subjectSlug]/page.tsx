"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gradeId = Number(params.gradeId);
  const subjectSlug = params.subjectSlug as string;
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const subjectNames: Record<string, string> = {
    mathematics: "Mathematics",
    english: "English",
    kiswahili: "Kiswahili",
    science: "Science",
    "social-studies": "Social Studies",
    environmental: "Environmental",
    movement: "Movement",
    hygiene: "Hygiene & Nutrition",
    agriculture: "Agriculture",
    "creative-arts": "Creative Arts",
    "religious-education": "IRE / CRE",
    business: "Business Studies",
    computing: "Computing",
  };

  const subjectName = subjectNames[subjectSlug] || subjectSlug;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/grades/${gradeId}/subjects/${subjectSlug}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setThemes(data.themes || []);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [gradeId, subjectSlug]);

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/admin/seed-curriculum", { method: "POST", credentials: "include" });
      const data = await res.json();
      setImportResult(data);
    } catch (e: any) {
      setImportResult({ error: e.message });
    }
    setImporting(false);
  };

  if (loading) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.page, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <Link href={`/dashboard/admin/grades/${gradeId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.body, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
          {"\u2190"} Back to Grade {gradeId}
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 4px 0" }}>{subjectName}</h1>
            <p style={{ color: C.body, fontSize: "0.9375rem" }}>Grade {gradeId} · Manage curriculum content</p>
          </div>
          <button onClick={handleImport} disabled={importing} style={{
            padding: "10px 20px", borderRadius: 12, border: "none", background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: importing ? "default" : "pointer", opacity: importing ? 0.7: 1,
          }}>
            {importing ? "Importing..." : "\uD83D\uDCE4 Import Curriculum Materials"}
          </button>
        </div>

        {importResult && (
          <div style={{
            padding: "16px", borderRadius: 12, marginBottom: "2rem",
            background: importResult.success ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${importResult.success ? "#A7F3D0" : "#FECACA"}`,
            color: importResult.success ? "#065F46" : "#991B1B",
            fontSize: "0.875rem",
          }}>
            {importResult.message || importResult.error}
          </div>
        )}

        {themes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{"\uD83D\uDCC2"}</div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: C.dark, marginBottom: "0.5rem" }}>No content yet</h3>
            <p style={{ color: C.body, fontSize: "0.875rem", maxWidth: 400, margin: "0 auto 1.5rem" }}>
              Import curriculum materials to populate modules, strands, sub-strands, and lessons for {subjectName}.
            </p>
            <button onClick={handleImport} disabled={importing} style={{
              padding: "10px 24px", borderRadius: 12, border: "none", background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: importing ? "default" : "pointer",
            }}>
              {importing ? "Importing..." : "Import Curriculum Materials"}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {themes.map((theme: any) => (
              <div key={theme.id} style={{
                padding: "16px 20px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.white,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: C.dark, margin: "0 0 2px 0" }}>{theme.title}</h4>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: theme.status === "PUBLISHED" ? "#059669" : "#D97706", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {theme.status}
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: C.body }}>{theme.lessonCount || 0} lessons</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
