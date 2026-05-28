"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { GraduationCap, ArrowLeft, Search, AlertCircle, Users, Flame, Award, Mail } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface LearnerRecord {
  id: string;
  displayName: string;
  grade: number;
  totalXp: number;
  currentStreak: number;
  bestStreak: number;
  avatarUrl: string | null;
  userId: string;
  user?: {
    name: string | null;
    email: string | null;
    role: string;
    createdAt: string;
  };
}

export default function AdminLearnersPage() {
  const [learners, setLearners] = useState<LearnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/learners", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLearners(data.learners || []);
      } else {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.error || "Failed to load learners");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load learners");
    } finally {
      setLoading(false);
    }
  }

  const grades = [...new Set(learners.map(l => l.grade).filter(Boolean))].sort();
  const filtered = learners.filter(l => {
    if (filterGrade !== "all" && l.grade !== parseInt(filterGrade)) return false;
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (l.displayName || "").toLowerCase().includes(s) ||
           (l.user?.name || "").toLowerCase().includes(s) ||
           (l.user?.email || "").toLowerCase().includes(s);
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

        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Learners</h1>
          <p style={{ color: colors.textMuted }}>{learners.length} students enrolled</p>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: `${colors.warning || "#F59E0B"}15`, border: `1px solid ${colors.warning || "#F59E0B"}30`, color: colors.warning || "#B45309", fontSize: "0.875rem", fontWeight: 600 }}>
            <AlertCircle style={{ width: 16, height: 16 }} /> {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: colors.textMuted }} />
            <input placeholder="Search learners..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...ds.input, paddingLeft: "2.5rem", fontSize: "0.875rem" }} />
          </div>
          {grades.length > 0 && (
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{ ...ds.input, fontSize: "0.875rem", minWidth: 120 }}>
              <option value="all">All Grades</option>
              {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem", color: colors.textMuted }}>Loading learners...</div>
        ) : filtered.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
            <GraduationCap style={{ width: 48, height: 48, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>
              {search || filterGrade !== "all" ? "No learners match your filters" : "No learners found"}
            </h3>
            <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>
              {search || filterGrade !== "all" ? "Try adjusting your search or filters." : "Learners will appear here when they register."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {filtered.map(learner => (
              <div key={learner.id} style={{ ...ds.card, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", color: colors.primary, fontWeight: 800, fontSize: "1rem", flexShrink: 0 }}>
                  {(learner.displayName || "L").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{learner.displayName}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: colors.textMuted, marginTop: "0.125rem" }}>
                    <Mail style={{ width: 12, height: 12 }} /> {learner.user?.email || "No email"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", flexShrink: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: colors.primary, fontWeight: 600 }}>
                    <GraduationCap style={{ width: 12, height: 12 }} /> Grade {learner.grade}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: colors.warm, fontWeight: 600 }}>
                    <Award style={{ width: 12, height: 12 }} /> {learner.totalXp} XP
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: colors.success, fontWeight: 600 }}>
                    <Flame style={{ width: 12, height: 12 }} /> {learner.currentStreak}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
