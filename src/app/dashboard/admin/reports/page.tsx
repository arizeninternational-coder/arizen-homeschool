"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { BarChart3, ArrowLeft, AlertCircle, Users, GraduationCap, BookOpen, Layers, Award, TrendingUp } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.error || "Failed to load stats");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Reports</h1>
          <p style={{ color: colors.textMuted }}>System overview and key metrics</p>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: `${colors.warning || "#F59E0B"}15`, border: `1px solid ${colors.warning || "#F59E0B"}30`, color: colors.warning || "#B45309", fontSize: "0.875rem", fontWeight: 600 }}>
            <AlertCircle style={{ width: 16, height: 16 }} /> {error}
          </div>
        )}

        {loading ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem", color: colors.textMuted }}>Loading reports...</div>
        ) : stats ? (
          <>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>System Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { label: "Total Users", value: stats.users ?? 0, icon: Users, color: colors.primary },
                { label: "Parents", value: stats.parents ?? 0, icon: Users, color: colors.accent },
                { label: "Learners", value: stats.learners ?? 0, icon: GraduationCap, color: colors.success },
                { label: "Lessons", value: stats.lessons ?? 0, icon: BookOpen, color: colors.warning || "#F59E0B" },
                { label: "Quests", value: stats.quests ?? 0, icon: Layers, color: colors.primary },
                { label: "Badges Awarded", value: stats.badges ?? 0, icon: Award, color: colors.accent },
              ].map(stat => (
                <div key={stat.label} style={{ ...ds.card, padding: "1.25rem" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem", background: `${stat.color}15` }}>
                    <stat.icon style={{ width: 20, height: 20, color: stat.color }} />
                  </div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: colors.text }}>{stat.value}</div>
                  <div style={{ fontSize: "0.8125rem", color: colors.textMuted, fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {stats._errors && stats._errors.length > 0 && (
              <div style={{ ...ds.card, padding: "1rem", marginBottom: "2rem", background: `${colors.warning || "#F59E0B"}08`, border: `1px solid ${colors.warning || "#F59E0B"}20` }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.warning || "#B45309", marginBottom: "0.5rem" }}>Partial Data Warnings:</div>
                {stats._errors.map((e: string, i: number) => (
                  <div key={i} style={{ fontSize: "0.75rem", color: colors.textMuted }}>• {e}</div>
                ))}
              </div>
            )}

            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>Content Status</h2>
            <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0", borderBottom: `1px solid ${colors.border}` }}>
                <TrendingUp style={{ width: 18, height: 18, color: colors.success }} />
                <span style={{ fontSize: "0.875rem", color: colors.text }}>Lesson content: {(stats.lessons ?? 0)} lessons in database</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0", borderBottom: `1px solid ${colors.border}` }}>
                <Layers style={{ width: 18, height: 18, color: colors.primary }} />
                <span style={{ fontSize: "0.875rem", color: colors.text }}>Quest content: {(stats.quests ?? 0)} quests in database</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0" }}>
                <GraduationCap style={{ width: 18, height: 18, color: colors.accent }} />
                <span style={{ fontSize: "0.875rem", color: colors.text }}>Active learners: {(stats.learners ?? 0)} profiles</span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem", color: colors.textMuted }}>
            No data available. Try refreshing the page.
          </div>
        )}
      </div>
    </div>
  );
}
