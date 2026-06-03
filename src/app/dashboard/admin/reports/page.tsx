"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { BarChart3, ArrowLeft, AlertCircle, Users, GraduationCap, BookOpen, Layers, Award, TrendingUp, LogOut } from "lucide-react";

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

  const statCards = stats ? [
    { label: "Total Users", value: stats.users ?? 0, icon: Users, color: "text-primary", bg: "bg-primary-soft" },
    { label: "Parents", value: stats.parents ?? 0, icon: Users, color: "text-pink", bg: "bg-pink-soft" },
    { label: "Learners", value: stats.learners ?? 0, icon: GraduationCap, color: "text-secondary", bg: "bg-secondary-soft" },
    { label: "Lessons", value: stats.lessons ?? 0, icon: BookOpen, color: "text-accent-blue", bg: "bg-accent-blue-soft" },
    { label: "Quests", value: stats.quests ?? 0, icon: Layers, color: "text-accent-purple", bg: "bg-accent-purple-soft" },
    { label: "Badges Awarded", value: stats.badges ?? 0, icon: Award, color: "text-gold", bg: "bg-gold-soft" },
  ] : [];

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-[1100px] mx-auto py-6 px-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-text-muted hover:text-text text-sm font-semibold transition-colors no-underline">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/40 text-text-muted hover:bg-white/80 cursor-pointer text-xs font-semibold transition-all">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-text mb-1">Reports</h1>
          <p className="text-text-muted">System overview and key metrics</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-5 bg-amber-50/80 border border-amber-200/60 text-amber-800 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-[1.5rem] bg-white/60 backdrop-blur-sm border border-white/60 p-12 text-center text-text-muted">
            <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">Loading reports...</p>
          </div>
        ) : stats ? (
          <>
            <h2 className="text-lg font-extrabold text-text mb-4">System Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {statCards.map(stat => (
                <div key={stat.label} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 text-center">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-xl font-extrabold text-text">{stat.value}</div>
                  <div className="text-[11px] font-bold text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>

            {stats._errors && stats._errors.length > 0 && (
              <div className="rounded-2xl bg-amber-50/60 backdrop-blur-sm border border-amber-200/40 p-4 mb-6">
                <div className="text-xs font-extrabold text-amber-800 mb-2">Partial Data Warnings:</div>
                {stats._errors.map((e: string, i: number) => (
                  <div key={i} className="text-xs text-text-muted pl-2">• {e}</div>
                ))}
              </div>
            )}

            <h2 className="text-lg font-extrabold text-text mb-4">Content Status</h2>
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 mb-6">
              <div className="flex items-center gap-3 py-3 border-b border-white/30">
                <TrendingUp className="w-[18px] h-[18px] text-secondary" />
                <span className="text-sm text-text">{(stats.lessons ?? 0)} lessons in database</span>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-white/30">
                <Layers className="w-[18px] h-[18px] text-primary" />
                <span className="text-sm text-text">{(stats.quests ?? 0)} quests in database</span>
              </div>
              <div className="flex items-center gap-3 py-3">
                <GraduationCap className="w-[18px] h-[18px] text-accent-purple" />
                <span className="text-sm text-text">{(stats.learners ?? 0)} active learner profiles</span>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[1.5rem] bg-white/60 backdrop-blur-sm border border-white/60 p-12 text-center text-text-muted">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No data available. Try refreshing the page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
