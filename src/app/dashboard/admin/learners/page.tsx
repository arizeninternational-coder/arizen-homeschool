"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { GraduationCap, ArrowLeft, Search, AlertCircle, Users, Flame, Award, Mail, Loader2 } from "lucide-react";
import { PageHeader, StatCard, EmptyStateCard } from "@/components/ui/Pill";

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

  const totalXp = learners.reduce((sum, l) => sum + (l.totalXp || 0), 0);
  const avgStreak = learners.length ? Math.round(learners.reduce((sum, l) => sum + (l.currentStreak || 0), 0) / learners.length) : 0;

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-[1100px] mx-auto py-8 px-6">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-text-muted hover:text-text text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/60 text-text-muted hover:bg-white hover:border-primary/30 cursor-pointer text-xs font-semibold transition-all">
            Sign Out
          </button>
        </div>

        {/* Header */}
        <PageHeader title="Learners" subtitle={`${learners.length} students enrolled`} />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Enrolled" value={learners.length} gradient="bg-card-gradient-purple" borderColor="border-accent-purple/20" textColor="text-primary-dark" icon={<Users className="w-5 h-5 text-accent-purple" />} />
          <StatCard label="Total XP Earned" value={totalXp.toLocaleString()} gradient="bg-card-gradient-gold" borderColor="border-gold/20" textColor="text-amber-700" icon={<Award className="w-5 h-5 text-gold" />} />
          <StatCard label="Avg Streak" value={`${avgStreak}d`} gradient="bg-card-gradient-pink" borderColor="border-pink/20" textColor="text-pink-700" icon={<Flame className="w-5 h-5 text-pink" />} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input placeholder="Search learners..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-white/60 placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
          {grades.length > 0 && (
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-white/60 focus:outline-none focus:border-primary/40 transition-all min-w-[120px]">
              <option value="all">All Grades</option>
              {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-[1.75rem] border border-white/60 bg-white p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm font-medium">Loading learners...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyStateCard
            icon={<GraduationCap size={48} />}
            title={search || filterGrade !== "all" ? "No learners match your filters" : "No learners found"}
            description={search || filterGrade !== "all" ? "Try adjusting your search or filters." : "Learners will appear here when they register."}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(learner => (
              <div key={learner.id} className="rounded-[1.75rem] border border-white/60 bg-white p-4 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all">
                <div className="w-11 h-11 rounded-full bg-primary-soft flex items-center justify-center text-primary font-extrabold text-base flex-shrink-0">
                  {(learner.displayName || "L").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-text text-sm">{learner.displayName}</div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                    <Mail className="w-3 h-3" /> {learner.user?.email || "No email"}
                  </div>
                </div>
                <div className="flex gap-4 text-xs flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-primary font-semibold">
                    <GraduationCap className="w-3 h-3" /> Grade {learner.grade}
                  </span>
                  <span className="inline-flex items-center gap-1 text-gold font-semibold">
                    <Award className="w-3 h-3" /> {learner.totalXp} XP
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <Flame className="w-3 h-3" /> {learner.currentStreak}d
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
