"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Loader2, GraduationCap } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

const SUBJECT_COLORS = ["#0D9488", "#059669", "#7C3AED", "#2563EB", "#D97706", "#DC2626", "#0891B2", "#E11D48", "#4F46E5", "#0F766E"];

interface SubjectData {
  id: string;
  name: string;
  grade: number;
  themeSlug: string;
  themeId: string;
  lessonCount: number;
  color: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learnerGrade, setLearnerGrade] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Get learner profile to know their grade
        const profileRes = await fetch("/api/learner/profile", { credentials: "include" });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const grade = profileData?.profile?.grade ?? profileData?.grade ?? null;
          setLearnerGrade(grade);
        }

        // Fetch subjects from dedicated learner subjects API
        // This returns ALL subjects for the learner's grade, even with 0 published lessons
        const res = await fetch("/api/learner/subjects", { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) { setError("Please log in to view subjects."); setLoading(false); return; }
          setError("Unable to load subjects. Please try again.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setSubjects(data.subjects || []);
      } catch (e: any) {
        console.error("[SUBJECTS] Load error:", e);
        setError("Unable to load subjects. Please try again.");
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

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <BookOpen size={40} style={{ color: C.body, margin: "0 auto 1rem" }} />
        <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: "0.5rem" }}>{error}</h3>
        <Link href="/dashboard/student" style={{ color: C.teal, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>← Back to Dashboard</Link>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.5rem 0" }}>📚 My Subjects</h1>
        <p style={{ color: C.body, fontSize: "0.9375rem", maxWidth: 420 }}>
          {learnerGrade
            ? `No subjects found for Grade ${learnerGrade}. Ask your admin to add curriculum for your grade.`
            : "Your subjects will appear here once your grade is set and curriculum is added by your admin."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.25rem 0" }}>📚 My Subjects</h1>
        <p style={{ color: C.body, fontSize: "0.875rem" }}>
          {learnerGrade ? `Grade ${learnerGrade} · ` : ""}{subjects.length} subject{subjects.length !== 1 ? "s" : ""} · Tap to explore lessons
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {subjects.map((subject) => {
          const hasLessons = subject.lessonCount > 0;
          return (
            <div key={subject.id}>
              {hasLessons ? (
                <Link
                  href={`/dashboard/student/lessons/${subject.themeSlug}`}
                  style={{
                    background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
                    padding: "20px", textDecoration: "none", color: "inherit", display: "block", cursor: "pointer",
                  }}
                >
                  <SubjectCardContent subject={subject} hasLessons={true} />
                </Link>
              ) : (
                <div style={{
                  background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
                  padding: "20px", opacity: 0.75,
                }}>
                  <SubjectCardContent subject={subject} hasLessons={false} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubjectCardContent({ subject, hasLessons }: { subject: SubjectData; hasLessons: boolean }) {
  return (
    <>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${subject.color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.5rem", marginBottom: 12,
      }}>
        📖
      </div>
      <div style={{ fontWeight: 800, color: C.dark, fontSize: "0.9375rem", marginBottom: 4 }}>
        {subject.name}
      </div>
      <div style={{ fontSize: "0.75rem", color: C.body, marginBottom: 4 }}>
        {subject.grade ? `Grade ${subject.grade} · ` : ""}
        {hasLessons
          ? `${subject.lessonCount} lesson${subject.lessonCount !== 1 ? "s" : ""}`
          : "No published lessons yet"}
      </div>
      {hasLessons ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, color: C.teal }}>
          <GraduationCap size={12} /> Open subject <ChevronRight size={14} />
        </div>
      ) : (
        <div style={{ fontSize: "0.6875rem", color: C.body, fontStyle: "italic" }}>
          Ask your admin to publish lessons
        </div>
      )}
    </>
  );
}
