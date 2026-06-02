"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

interface ThemeSubject {
  id: string;
  name: string;
  emoji: string;
  themeSlug: string;
  lessonCount: number;
  color: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<ThemeSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch published themes with their quests/lessons
        const res = await fetch("/api/themes", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const themes = data.themes || [];

          // Extract unique subjects with their theme slugs and lesson counts
          const subjectMap = new Map<string, ThemeSubject>();
          const colors = ["#0D9488", "#059669", "#7C3AED", "#2563EB", "#D97706", "#DC2626", "#0891B2", "#E11D48"];
          const emojis: Record<string, string> = {
            "Mathematics": "🔢", "Math": "🔢",
            "Science": "🔬", "English": "📚", "Language Arts": "📚",
            "History": "🏛️", "Geography": "🌍", "Art": "🎨", "Music": "🎵",
            "Kiswahili": "📖", "Social Studies": "🌐", "IRE": "🕌", "CRE": "⛪",
            "Physical Education": "🏃", "PE": "🏃", "Computing": "💻",
          };

          for (const theme of themes) {
            const themeSubjects = theme.themeSubjects || [];
            // Extract subject names from theme title (e.g. "Grade 2 Mathematics" → "Mathematics")
            const themeTitle = theme.title || "";
            let subjectName = themeSubjects[0]?.subject || "";
            if (!subjectName) {
              // Try to extract from theme title
              const parts = themeTitle.split(" ");
              if (parts.length >= 3) {
                subjectName = parts.slice(2).join(" ");
              }
            }
            if (!subjectName) continue;

            const lessonCount = (theme.quests || []).reduce(
              (sum: number, q: any) => sum + (q.lessons?.length || 0), 0
            );

            if (!subjectMap.has(subjectName)) {
              subjectMap.set(subjectName, {
                id: subjectName.toLowerCase().replace(/\s+/g, "-"),
                name: subjectName,
                emoji: emojis[subjectName] || "📖",
                themeSlug: theme.slug,
                lessonCount,
                color: colors[subjectMap.size % colors.length],
              });
            } else {
              const existing = subjectMap.get(subjectName)!;
              existing.lessonCount += lessonCount;
            }
          }

          setSubjects(Array.from(subjectMap.values()));
        }
      } catch (e) {
        console.error("[SUBJECTS] Load error:", e);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={32} style={{ color: C.teal, margin: "0 auto 1rem" }} />
          <p style={{ color: C.body, fontWeight: 600 }}>Loading your subjects...</p>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.5rem 0" }}>📚 My Subjects</h1>
        <p style={{ color: C.body, fontSize: "0.9375rem", maxWidth: 420 }}>
          Your subjects will appear here once your grade is set and curriculum is published by your admin. Ask your admin to publish lessons to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.25rem 0" }}>📚 My Subjects</h1>
        <p style={{ color: C.body, fontSize: "0.875rem" }}>Tap a subject to explore its lessons and quests.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/dashboard/student/lessons/${subject.themeSlug}`}
            style={{
              background: C.white,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              padding: "20px",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              cursor: "pointer",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${subject.color}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", marginBottom: 12,
            }}>
              {subject.emoji}
            </div>
            <div style={{ fontWeight: 800, color: C.dark, fontSize: "0.9375rem", marginBottom: 4 }}>
              {subject.name}
            </div>
            <div style={{ fontSize: "0.75rem", color: C.body, marginBottom: 10 }}>
              {subject.lessonCount} lesson{subject.lessonCount !== 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, color: C.teal }}>
              Explore <ChevronRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
