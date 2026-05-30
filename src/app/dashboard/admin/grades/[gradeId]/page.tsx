"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const C = { page: "#F7FBF7", teal: "#047A70", tealSoft: "#E6F5F1", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

const SUBJECTS_BY_GRADE: Record<number, { name: string; slug: string; icon: string; color: string }[]> = {
  1: [
    { name: "Mathematics", slug: "mathematics", icon: "\uD83D\uDCCA", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "\uD83D\uDCD6", color: "#FFF4D8" },
    { name: "Kiswahili", slug: "kiswahili", icon: "\uD83C\uDF0D", color: "#ECFDF5" },
    { name: "Environmental", slug: "environmental", icon: "\uD83C\uDF31", color: "#EAF3FF" },
    { name: "Movement", slug: "movement", icon: "\uD83C\uDFC3", color: "#FFF1F2" },
    { name: "Hygiene & Nutrition", slug: "hygiene", icon: "\uD83D\uDEBF", color: "#FEF3C7" },
  ],
  2: [
    { name: "Mathematical Activities", slug: "mathematics", icon: "\uD83D\uDCCA", color: "#EDE9FE" },
    { name: "English Language", slug: "english", icon: "\uD83D\uDCD6", color: "#FFF4D8" },
    { name: "Kiswahili Language", slug: "kiswahili", icon: "\uD83C\uDF0D", color: "#ECFDF5" },
    { name: "Environmental Activities", slug: "environmental", icon: "\uD83C\uDF31", color: "#EAF3FF" },
    { name: "Hygiene & Nutrition", slug: "hygiene", icon: "\uD83D\uDEBF", color: "#FEF3C7" },
    { name: "Movement Activities", slug: "movement", icon: "\uD83C\uDFC3", color: "#FFF1F2" },
  ],
  3: [
    { name: "Mathematics", slug: "mathematics", icon: "\uD83D\uDCCA", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "\uD83D\uDCD6", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "\uD83D\uDD2C", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "\uD83C\uDF0D", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "\uD83D\uDCDA", color: "#FEF3C7" },
    { name: "Creative Arts", slug: "creative-arts", icon: "\uD83C\uDFA8", color: "#FFF1F2" },
  ],
  4: [
    { name: "Mathematics", slug: "mathematics", icon: "\uD83D\uDCCA", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "\uD83D\uDCD6", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "\uD83D\uDD2C", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "\uD83C\uDF0D", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "\uD83D\uDCDA", color: "#FEF3C7" },
    { name: "Agriculture", slug: "agriculture", icon: "\uD83C\uDF3E", color: "#ECFDF5" },
  ],
  5: [
    { name: "Mathematics", slug: "mathematics", icon: "\uD83D\uDCCA", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "\uD83D\uDCD6", color: "#FFF4D8" },
    { name: "Science & Technology", slug: "science", icon: "\uD83D\uDD2C", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "\uD83C\uDF0D", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "\uD83D\uDCDA", color: "#FEF3C7" },
    { name: "Agriculture & Nutrition", slug: "agriculture", icon: "\uD83C\uDF3E", color: "#ECFDF5" },
    { name: "Creative Arts", slug: "creative-arts", icon: "\uD83C\uDFA8", color: "#FFF1F2" },
  ],
  6: [
    { name: "Mathematics", slug: "mathematics", icon: "\uD83D\uDCCA", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "\uD83D\uDCD6", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "\uD83D\uDD2C", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "\uD83C\uDF0D", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "\uD83D\uDCDA", color: "#FEF3C7" },
    { name: "Agriculture", slug: "agriculture", icon: "\uD83C\uDF3E", color: "#ECFDF5" },
    { name: "Creative Arts", slug: "creative-arts", icon: "\uD83C\uDFA8", color: "#FFF1F2" },
    { name: "IRE / CRE", slug: "religious-education", icon: "\uD83D\uDED0", color: "#FEF3C7" },
  ],
  7: [
    { name: "Mathematics", slug: "mathematics", icon: "\uD83D\uDCCA", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "\uD83D\uDCD6", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "\uD83D\uDD2C", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "\uD83C\uDF0D", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "\uD83D\uDCDA", color: "#FEF3C7" },
    { name: "Agriculture", slug: "agriculture", icon: "\uD83C\uDF3E", color: "#ECFDF5" },
    { name: "Creative Arts", slug: "creative-arts", icon: "\uD83C\uDFA8", color: "#FFF1F2" },
    { name: "IRE / CRE", slug: "religious-education", icon: "\uD83D\uDED0", color: "#FEF3C7" },
    { name: "Business Studies", slug: "business", icon: "\uD83D\uDCC8", color: "#EAF3FF" },
    { name: "Computing", slug: "computing", icon: "\uD83D\uDCBB", color: "#EDE9FE" },
  ],
  8: [
    { name: "Mathematics", slug: "mathematics", icon: "\uD83D\uDCCA", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "\uD83D\uDCD6", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "\uD83D\uDD2C", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "\uD83C\uDF0D", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "\uD83D\uDCDA", color: "#FEF3C7" },
    { name: "Agriculture", slug: "agriculture", icon: "\uD83C\uDF3E", color: "#ECFDF5" },
    { name: "Creative Arts", slug: "creative-arts", icon: "\uD83C\uDFA8", color: "#FFF1F2" },
    { name: "IRE / CRE", slug: "religious-education", icon: "\uD83D\uDED0", color: "#FEF3C7" },
    { name: "Business Studies", slug: "business", icon: "\uD83D\uDCC8", color: "#EAF3FF" },
    { name: "Computing", slug: "computing", icon: "\uD83D\uDCBB", color: "#EDE9FE" },
  ],
  9: [
    { name: "Mathematics", slug: "mathematics", icon: "\uD83D\uDCCA", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "\uD83D\uDCD6", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "\uD83D\uDD2C", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "\uD83C\uDF0D", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "\uD83D\uDCDA", color: "#FEF3C7" },
    { name: "Agriculture", slug: "agriculture", icon: "\uD83C\uDF3E", color: "#ECFDF5" },
    { name: "Creative Arts", slug: "creative-arts", icon: "\uD83C\uDFA8", color: "#FFF1F2" },
    { name: "IRE / CRE", slug: "religious-education", icon: "\uD83D\uDED0", color: "#FEF3C7" },
    { name: "Business Studies", slug: "business", icon: "\uD83D\uDCC8", color: "#EAF3FF" },
    { name: "Computing", slug: "computing", icon: "\uD83D\uDCBB", color: "#EDE9FE" },
  ],
};

export default function GradeSubjectsPage() {
  const params = useParams();
  const router = useRouter();
  const gradeId = Number(params.gradeId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        const data = await res.json();
        if (!data?.user) router.push("/auth/login");
      } catch { router.push("/auth/login"); }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) return null;

  const subjects = SUBJECTS_BY_GRADE[gradeId] || [];

  return (
    <div style={{ minHeight: "100vh", background: C.page, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <Link href="/dashboard/admin/grades" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.body, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
          {"\u2190"} Back to Grades
        </Link>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 4px 0" }}>Grade {gradeId}</h1>
          <p style={{ color: C.body, fontSize: "0.9375rem" }}>Select a subject to manage curriculum content</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {subjects.map((subject) => (
            <Link key={subject.slug} href={`/dashboard/admin/grades/${gradeId}/${subject.slug}`} style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "20px",
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              background: C.white,
              textDecoration: "none",
              color: "inherit",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: subject.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                {subject.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>{subject.name}</h3>
                <p style={{ fontSize: "0.75rem", color: C.body, margin: 0 }}>Manage modules, strands, and lessons</p>
              </div>
              <span style={{ color: C.body, fontSize: "1.125rem", flexShrink: 0 }}>{"\u2192"}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
