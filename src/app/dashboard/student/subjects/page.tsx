"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

interface Subject {
  id: string;
  name: string;
  emoji: string;
  lessonCount: number;
  themeCount: number;
  color: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/learner/subjects", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
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
          <BookOpen size={32} style={{ color: C.teal, margin: "0 auto 1rem" }} />
          <p style={{ color: C.body, fontWeight: 600 }}>Loading your subjects...</p>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.5rem 0" }}>📚 My Subjects</h1>
        <p style={{ color: C.body, fontSize: "0.9375rem" }}>Your subjects will appear here once your grade is set and curriculum is published by your admin.</p>
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
            href={`/dashboard/student/lessons/${subject.id}`}
            style={{
              background: C.white,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              padding: "20px",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              transition: "box-shadow 0.2s, transform 0.2s",
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
              {subject.lessonCount} lesson{subject.lessonCount !== 1 ? "s" : ""} · {subject.themeCount} theme{subject.themeCount !== 1 ? "s" : ""}
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
