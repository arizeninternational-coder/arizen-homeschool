"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

const subjectIcons: Record<string, string> = {
  "Mathematics":"🔢","Math":"🔢","Science":"🔬","English":"📚","Language Arts":"📚",
  "History":"🏛️","Geography":"🌍","Art":"🎨","Music":"🎵","Physical Education":"🏃","PE":"🏃",
  "Computer Science":"💻","Coding":"💻","Life Skills":"🌱","World Explorers":"🌍","default":"📖",
};

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/learner/subjects", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
        } else {
          setError("Failed to load subjects");
        }
      } catch { setError("Failed to load subjects"); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen style={{ width: 22, height: 22, color: colors.primary }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.text }}>My Subjects</h1>
            <p style={{ color: colors.textMuted, fontSize: "0.8125rem" }}>Explore subjects for your learning level</p>
          </div>
        </div>

        {error && <div style={{ ...ds.alertError, marginBottom: "1rem" }}>{error}</div>}

        {loading ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "2.5rem", color: colors.textMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <Loader2 style={{ width: 20, height: 20 }} className="spinner" /> Loading subjects...
          </div>
        ) : subjects.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "2.5rem" }}>
            <BookOpen style={{ width: 40, height: 40, color: colors.textMuted, margin: "0 auto 0.75rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>No subjects yet</h3>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>Subjects will appear here when your curriculum is published.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.625rem" }}>
            {subjects.map((s: any) => (
              <Link key={s.id} href={`/dashboard/student/subjects/${s.id}`}
                style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderRadius: 16, border: `1px solid ${colors.borderLight}`, background: "#fff", textDecoration: "none", transition: "box-shadow 0.2s" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                  {subjectIcons[s.name] || subjectIcons.default}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{s.name}</div>
                  <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>{s.lessonCount || 0} lessons · {s.themeCount || 0} themes</div>
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
