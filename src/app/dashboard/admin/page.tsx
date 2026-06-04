"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, GraduationCap, Award, Settings, BarChart3,
  Shield, Plus, ChevronRight, TrendingUp, Activity,
  UserCheck, Layers, Zap, AlertCircle, ShoppingBag, CheckCircle,
  BookCheck, Sparkles, FileText, ScrollText, Swords
} from "lucide-react";

interface AdminStats {
  users: number;
  parents: number;
  learners: number;
  teachers: number;
  admins: number;
  lessons: number;
  publishedLessons: number;
  draftLessons: number;
  quests: number;
  badges: number;
  shopItems: number;
  completedLessons: number;
  activeLearners: number;
  activeToday: number;
  totalXpAwarded: number;
}

interface ProgressStats {
  totalCompletedLessons: number;
  activeLearners: number;
  activeToday: number;
  totalXpAwarded: number;
  totalCoinsAwarded: number;
  topLearners: Array<{ id: string; displayName: string; totalXp: number; currentStreak: number }>;
}

interface SeedFeedback {
  type: "success" | "error";
  message: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [seedFeedback, setSeedFeedback] = useState<SeedFeedback | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [shopSeedFeedback, setShopSeedFeedback] = useState<SeedFeedback | null>(null);
  const [shopSeeding, setShopSeeding] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!data?.user || data.user.role !== "ADMIN") {
          window.location.replace("/auth/login");
          return;
        }
        setUser(data.user);

        try {
          const [statsRes, progressRes] = await Promise.all([
            fetch("/api/admin/stats", { credentials: "include" }),
            fetch("/api/admin/progress", { credentials: "include" }),
          ]);

          if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.error) {
              setStatsError(statsData.error);
            } else {
              setStats(statsData);
              setStatsError(null);
            }
          } else {
            const errBody = await statsRes.json().catch(() => ({}));
            setStatsError(errBody.error || `Stats API returned ${statsRes.status}`);
          }

          if (progressRes.ok) {
            const progressData = await progressRes.json();
            if (!progressData.error) {
              setProgress(progressData);
            }
          }
        } catch (fetchErr: any) {
          setStatsError(fetchErr?.message || "Failed to load dashboard data");
        }
      } catch {
        window.location.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleSeed = useCallback(async () => {
    setSeeding(true);
    setSeedFeedback(null);
    try {
      const res = await fetch("/api/admin/seed-curriculum", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setSeedFeedback({ type: "success", message: data.message || "Curriculum seeded successfully!" });
      } else {
        setSeedFeedback({ type: "error", message: data.error || "Failed to seed curriculum" });
      }
    } catch (err: any) {
      setSeedFeedback({ type: "error", message: err?.message || "Network error — please try again" });
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedFeedback(null), 8000);
    }
  }, []);

  const handleShopSeed = useCallback(async () => {
    setShopSeeding(true);
    setShopSeedFeedback(null);
    try {
      const res = await fetch("/api/admin/shop-seed", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setShopSeedFeedback({ type: "success", message: data.message || "Shop items seeded successfully!" });
      } else {
        setShopSeedFeedback({ type: "error", message: data.error || "Failed to seed shop items" });
      }
    } catch (err: any) {
      setShopSeedFeedback({ type: "error", message: err?.message || "Network error — please try again" });
    } finally {
      setShopSeeding(false);
      setTimeout(() => setShopSeedFeedback(null), 8000);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#4F46E5]/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#4F46E5] animate-spin" />
          </div>
          <p className="text-sm font-bold text-[#64748B]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (statsError && !stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="rounded-3xl bg-red-50/80 border border-red-200/60 p-8 text-center max-w-md">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#0F172A] mb-2">Unable to load dashboard</h3>
          <p className="text-sm text-[#64748B]">{statsError}</p>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.email || "Admin";
  const firstName = displayName.includes(" ") ? displayName.split(" ")[0] : displayName;

  const s = stats || {} as AdminStats;
  const p = progress || {} as ProgressStats;

  const totalUsers = s.users || 0;
  const parents = s.parents || 0;
  const learners = s.learners || 0;
  const admins = s.admins || 0;
  const completedLessons = p.totalCompletedLessons || s.completedLessons || 0;
  const activeLearners = p.activeLearners || s.activeLearners || 0;
  const activeToday = p.activeToday || s.activeToday || 0;
  const totalXp = p.totalXpAwarded || s.totalXpAwarded || 0;
  const publishedLessons = s.publishedLessons || 0;
  const draftLessons = s.draftLessons || 0;
  const quests = s.quests || 0;
  const shopItems = s.shopItems || 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-[#64748B] text-sm mt-0.5">Welcome back, {firstName}. Here's an overview of your homeschool network.</p>
      </div>

      {/* Stats Error Banner */}
      {statsError && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-amber-800 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Unable to load some dashboard stats: {statsError}</span>
        </div>
      )}

      {/* Users */}
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#64748B] mb-3">Users</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users },
            { label: "Parents", value: parents.toLocaleString(), icon: UserCheck },
            { label: "Learners", value: learners.toLocaleString(), icon: GraduationCap },
            { label: "Admins", value: admins.toLocaleString(), icon: Shield },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0]/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B]">{stat.label}</p>
                  <p className="text-lg font-bold text-[#0F172A]">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Activity */}
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#64748B] mb-3">Learning Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Completed Lessons", value: completedLessons.toLocaleString(), icon: BookCheck, color: "text-[#059669]", bg: "bg-emerald-50" },
            { label: "Active Learners", value: activeLearners.toLocaleString(), icon: Activity, color: "text-[#EC4899]", bg: "bg-pink-50" },
            { label: "Active Today", value: activeToday.toLocaleString(), icon: Zap, color: "text-[#3B82F6]", bg: "bg-blue-50" },
            { label: "Total XP Awarded", value: totalXp.toLocaleString(), icon: Sparkles, color: "text-[#D97706]", bg: "bg-amber-50" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0]/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B]">{stat.label}</p>
                  <p className="text-lg font-bold text-[#0F172A]">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#64748B] mb-3">Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Published Lessons", value: publishedLessons.toLocaleString(), icon: CheckCircle, color: "text-[#059669]", bg: "bg-emerald-50" },
            { label: "Draft Lessons", value: draftLessons.toLocaleString(), icon: FileText, color: "text-[#D97706]", bg: "bg-amber-50" },
            { label: "Quests", value: quests.toLocaleString(), icon: Swords, color: "text-[#7C3AED]", bg: "bg-violet-50" },
            { label: "Shop Items", value: shopItems.toLocaleString(), icon: ShoppingBag, color: "text-[#3B82F6]", bg: "bg-blue-50" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0]/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B]">{stat.label}</p>
                  <p className="text-lg font-bold text-[#0F172A]">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#64748B] mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-[0_4px_15px_rgba(79,70,229,0.15)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.25)] transition-all">
            <Plus className="w-4 h-4" /> Create Lesson
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#059669] to-[#00A884] text-white shadow-[0_4px_15px_rgba(5,150,105,0.15)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.25)] transition-all">
            <Swords className="w-4 h-4" /> Add Quest
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white shadow-[0_4px_15px_rgba(217,119,6,0.15)] hover:shadow-[0_6px_20px_rgba(217,119,6,0.25)] transition-all">
            <ScrollText className="w-4 h-4" /> Import Curriculum
          </button>
        </div>
      </div>

      {/* Curriculum Seed */}
      <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0]/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <h2 className="text-base font-bold text-[#0F172A] mb-1">Curriculum</h2>
        <p className="text-sm text-[#64748B] mb-4">
          Seed draft curriculum structure for Grade 2 and Grade 5. Already-existing records will not be duplicated.
        </p>
        {seedFeedback && (
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-semibold ${seedFeedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-red-50 text-red-700 border border-red-200/60"}`}>
            {seedFeedback.message}
            <button onClick={() => setSeedFeedback(null)} className="ml-auto text-current opacity-60 hover:opacity-100">✕</button>
          </div>
        )}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-[0_4px_15px_rgba(79,70,229,0.15)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.25)] transition-all disabled:opacity-60 cursor-pointer"
        >
          {seeding ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Seeding...
            </>
          ) : (
            <><Sparkles className="w-4 h-4" /> Seed Draft Curriculum</>
          )}
        </button>
      </div>

      {/* Shop Seed */}
      <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0]/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <h2 className="text-base font-bold text-[#0F172A] mb-1">Reward Shop</h2>
        <p className="text-sm text-[#64748B] mb-4">
          Seed default avatar shop items and reward rules. Creates 20 shop items and 7 reward rules.
        </p>
        {shopSeedFeedback && (
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-semibold ${shopSeedFeedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-red-50 text-red-700 border border-red-200/60"}`}>
            {shopSeedFeedback.message}
            <button onClick={() => setShopSeedFeedback(null)} className="ml-auto text-current opacity-60 hover:opacity-100">✕</button>
          </div>
        )}
        <button
          onClick={handleShopSeed}
          disabled={shopSeeding}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#059669] to-[#00A884] text-white shadow-[0_4px_15px_rgba(5,150,105,0.15)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.25)] transition-all disabled:opacity-60 cursor-pointer"
        >
          {shopSeeding ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Seeding...
            </>
          ) : (
            <><ShoppingBag className="w-4 h-4" /> Seed Shop Items & Rewards</>
          )}
        </button>
      </div>

      {/* System Activity */}
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#64748B] mb-3">System Activity</h2>
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0]/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-[#4F46E5]" />
            <span className="text-sm text-[#0F172A]">Dashboard loaded successfully</span>
            <span className="text-xs text-[#64748B] ml-auto">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
