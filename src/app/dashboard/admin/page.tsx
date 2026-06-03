"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Users, BookOpen, GraduationCap, Award, Settings, BarChart3,
  Shield, LogOut, Plus, ChevronRight, TrendingUp, Activity,
  UserCheck, Layers, Zap, AlertCircle, Menu, X, ShoppingBag, Bell, Flame, CheckCircle,
  BookCheck, Sparkles, UserCog, FileText, ScrollText, Swords
} from "lucide-react";
import { ds, colors, gradients, shadows } from "@/lib/design-system";
import {
  StatCard, SectionHeader, PageHeader, EmptyStateCard, GradientButton
} from "@/components/ui/Pill";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    window.location.href = "/";
  }, []);

  // Detect desktop viewport
  useEffect(() => {
    const check = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setDrawerOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen && !isDesktop) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen, isDesktop]);

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

        // Fetch both stats and progress in parallel
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
            if (progressData.error) {
              // Non-fatal: stats already loaded
            } else {
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

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-text-muted font-bold text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ── Error State ──
  if (statsError && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main p-4">
        <EmptyStateCard
          icon={<AlertCircle className="w-8 h-8" />}
          title="Unable to load dashboard"
          description={statsError}
        />
      </div>
    );
  }

  const displayName = user.name || user.email || "Admin";
  const firstName = displayName.includes(" ") ? displayName.split(" ")[0] : displayName;

  // Merge stats with progress data (progress API has more detailed learning stats)
  const s = stats || {} as AdminStats;
  const p = progress || {} as ProgressStats;

  const totalUsers = s.users || 0;
  const parents = s.parents || 0;
  const learners = s.learners || 0;
  const teachers = s.teachers || 0;
  const admins = s.admins || 0;
  const completedLessons = p.totalCompletedLessons || s.completedLessons || 0;
  const activeLearners = p.activeLearners || s.activeLearners || 0;
  const activeToday = p.activeToday || s.activeToday || 0;
  const totalXp = p.totalXpAwarded || s.totalXpAwarded || 0;
  const publishedLessons = s.publishedLessons || 0;
  const draftLessons = s.draftLessons || 0;
  const quests = s.quests || 0;
  const shopItems = s.shopItems || 0;

  const navItems = [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard/admin", active: true, desc: "Overview & analytics" },
    { icon: Users, label: "Users", href: "/dashboard/admin/users", desc: "Manage all users" },
    { icon: GraduationCap, label: "Learners", href: "/dashboard/admin/learners", desc: "Student profiles" },
    { icon: GraduationCap, label: "Grades", href: "/dashboard/admin/grades", desc: "Grade levels & subjects" },
    { icon: Layers, label: "Quests", href: "/dashboard/admin/quests", desc: "Quest management" },
    { icon: Award, label: "Badges", href: "/dashboard/admin/badges", desc: "Achievement badges" },
    { icon: ShoppingBag, label: "Shop", href: "/dashboard/admin/shop", desc: "Shop items & rewards" },
    { icon: TrendingUp, label: "Reports", href: "/dashboard/admin/reports", desc: "System reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/admin/settings", desc: "App settings" },
  ];

  // Shared sidebar/nav content
  const renderNavContent = (inline: boolean) => (
    <>
      {!inline && (
        <div style={{ padding: "0 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: gradients.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Shield style={{ width: 20, height: 20, color: "white" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: colors.text }}>Arizen Admin</div>
              <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Management Portal</div>
            </div>
          </div>
        </div>
      )}

      {!inline && (
        <nav style={{ flex: 1, padding: "0 0.75rem" }}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => { if (!isDesktop) setDrawerOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6875rem 0.75rem", borderRadius: 10, marginBottom: "0.25rem", textDecoration: "none", background: item.active ? colors.primarySoft : "transparent", color: item.active ? colors.primary : colors.textMuted, fontWeight: item.active ? 700 : 500, fontSize: "0.875rem", transition: "all 0.15s" }}>
              <item.icon style={{ width: 18, height: 18 }} />
              <div>
                <div>{item.label}</div>
                {item.active && <div style={{ fontSize: "0.6875rem", opacity: 0.7, fontWeight: 400 }}>{item.desc}</div>}
              </div>
            </Link>
          ))}
        </nav>
      )}

      {inline && (
        <nav style={{ padding: "0 0.75rem" }}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => { if (!isDesktop) setDrawerOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 0.75rem", borderRadius: 10, marginBottom: "0.25rem", textDecoration: "none", background: item.active ? colors.primarySoft : "transparent", color: item.active ? colors.primary : colors.textMuted, fontWeight: item.active ? 700 : 500, fontSize: "0.875rem", transition: "all 0.15s" }}>
              <item.icon style={{ width: 18, height: 18 }} />
              <div>
                <div>{item.label}</div>
                {item.active && <div style={{ fontSize: "0.6875rem", opacity: 0.7, fontWeight: 400 }}>{item.desc}</div>}
              </div>
            </Link>
          ))}
        </nav>
      )}

      {!inline ? (
        <div style={{ padding: "0 1.25rem", borderTop: `1px solid ${colors.border}`, paddingTop: "1rem" }}>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", borderRadius: 8, border: "none", background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, width: "100%" }}>
            <LogOut style={{ width: 16, height: 16 }} /> Sign Out
          </button>
        </div>
      ) : (
        <div style={{ padding: "1rem" }}>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem", borderRadius: 10, border: `1px solid ${colors.border}`, background: "rgba(239,68,68,0.05)", color: colors.danger, cursor: "pointer", fontSize: "0.875rem", fontWeight: 700, width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
            <LogOut style={{ width: 16, height: 16 }} /> Sign Out
          </button>
        </div>
      )}
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, display: "flex" }}>

      {/* ── Desktop Sidebar (≥1024px) ── */}
      {isDesktop && (
        <aside
          className="admin-sidebar"
          style={{
            width: 260,
            background: "white",
            borderRight: `1px solid ${colors.border}`,
            padding: "1.5rem 0",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 40,
            boxShadow: shadows.sm,
          }}
        >
          {renderNavContent(false)}
        </aside>
      )}

      {/* ── Mobile Drawer Overlay ── */}
      {!isDesktop && drawerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 45,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            transition: "opacity 0.25s ease",
          }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile Drawer (<1024px, slide-out) ── */}
      {!isDesktop && (
        <aside
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: 280,
            maxWidth: "85vw",
            background: "white",
            borderRight: `1px solid ${colors.border}`,
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: drawerOpen ? shadows.xl : "none",
            WebkitOverflowScrolling: "touch",
            overflowY: "auto",
            padding: "1.25rem 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: gradients.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield style={{ width: 20, height: 20, color: "white" }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: colors.text }}>Arizen Admin</div>
                <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Management Portal</div>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: `1px solid ${colors.border}`, background: "white", color: colors.textMuted, cursor: "pointer" }}
              aria-label="Close menu"
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
          {renderNavContent(true)}
        </aside>
      )}

      {/* ── Main Content Area ── */}
      <main style={{ marginLeft: isDesktop ? 260 : 0, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Mobile Top Bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.625rem 1rem",
            background: "rgba(253,253,251,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: `1px solid ${colors.border}`,
            position: "sticky",
            top: 0,
            zIndex: 30,
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }}>
            {!isDesktop && (
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  borderRadius: 10,
                  border: `1px solid ${colors.border}`,
                  background: "white",
                  color: colors.text,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                aria-label="Open menu"
              >
                <Menu style={{ width: 20, height: 20 }} />
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Dashboard
              </h1>
              <p style={{ display: "none", color: colors.textMuted, fontSize: "0.75rem" }}>Welcome back, {firstName}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <div style={{ padding: "0.375rem 0.875rem", borderRadius: 20, background: colors.primarySoft, color: colors.primary, fontSize: "0.75rem", fontWeight: 700 }}>ADMIN</div>
            <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: "50%", background: gradients.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            {!isDesktop && (
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: "rgba(239,68,68,0.05)",
                  color: colors.danger,
                  cursor: "pointer",
                }}
                aria-label="Sign out"
              >
                <LogOut style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
        </header>

        {/* Notification bell for mobile */}
        {!isDesktop && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) { fetch("/api/notifications", { credentials: "include" }).then(r => r.json()).then(d => setNotifications(d.notifications || [])).catch(() => {}); } }}
              style={{ position: "fixed", bottom: 24, right: 24, zIndex: 70, width: 52, height: 52, borderRadius: "50%", background: gradients.primary, color: "white", border: "none", boxShadow: shadows.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Bell style={{ width: 22, height: 22 }} />
              {notifications.filter((n: any) => !n.read).length > 0 && (
                <span style={{ position: "absolute", top: -2, right: -2, width: 20, height: 20, borderRadius: "50%", background: colors.danger, color: "white", fontSize: "0.6875rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {notifications.filter((n: any) => !n.read).length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div style={{ position: "fixed", bottom: 84, right: 16, width: 320, maxWidth: "95vw", background: "white", borderRadius: 16, boxShadow: shadows.xl, zIndex: 70, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1rem", borderBottom: `1px solid ${colors.border}`, fontWeight: 700, fontSize: "0.875rem", color: colors.text, display: "flex", justifyContent: "space-between", alignItems: "center", background: gradients.primarySoft }}>
                  <span style={{ background: gradients.textPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Notifications</span>
                  <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted }}><X style={{ width: 16, height: 16 }} /></button>
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "2rem 1rem", textAlign: "center", color: colors.textMuted, fontSize: "0.8125rem" }}>No notifications yet</div>
                  ) : notifications.slice(0, 10).map((n: any) => (
                    <div key={n.id} style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${colors.borderLight}`, fontSize: "0.8125rem" }}>
                      <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.8125rem" }}>{n.title}</div>
                      <div style={{ color: colors.textMuted, marginTop: "0.125rem", fontSize: "0.75rem" }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            PAGE CONTENT — v6 Design System
            ═══════════════════════════════════════════════════════════ */}
        <div style={{ padding: isDesktop ? "2rem" : "1.25rem", flex: 1 }}>

          {/* ── Page Header ── */}
          <PageHeader
            title="Teacher Dashboard"
            subtitle={`Welcome back, ${firstName}. Here's an overview of your homeschool network.`}
          />

          {/* ── Stats Error Banner ── */}
          {statsError && (
            <div style={{ ...ds.alertError, marginBottom: "1.5rem" }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
              <span>Unable to load some dashboard stats: {statsError}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SECTION 1 — Users
              ═══════════════════════════════════════════════════════════ */}
          <SectionHeader
            title="Users"
            subtitle="People in your homeschool network"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Users"
              value={totalUsers.toLocaleString()}
              icon={<Users className="w-5 h-5 text-primary" />}
              gradient="bg-card-gradient-purple"
              borderColor="border-accent-purple/20"
              textColor="text-primary-dark"
            />
            <StatCard
              label="Parents"
              value={parents.toLocaleString()}
              icon={<UserCheck className="w-5 h-5 text-accent-purple" />}
              gradient="bg-card-gradient-purple"
              borderColor="border-accent-purple/20"
              textColor="text-primary-dark"
            />
            <StatCard
              label="Learners"
              value={learners.toLocaleString()}
              icon={<GraduationCap className="w-5 h-5 text-primary" />}
              gradient="bg-card-gradient-purple"
              borderColor="border-primary/20"
              textColor="text-primary-dark"
            />
            <StatCard
              label="Teachers & Admins"
              value={(teachers + admins).toLocaleString()}
              icon={<Shield className="w-5 h-5 text-accent-purple" />}
              gradient="bg-card-gradient-purple"
              borderColor="border-accent-purple/20"
              textColor="text-primary-dark"
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════
              SECTION 2 — Learning Activity
              ═══════════════════════════════════════════════════════════ */}
          <SectionHeader
            title="Learning Activity"
            subtitle="Engagement and progress across all learners"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Completed Lessons"
              value={completedLessons.toLocaleString()}
              icon={<BookCheck className="w-5 h-5 text-secondary" />}
              gradient="bg-card-gradient-green"
              borderColor="border-secondary/20"
              textColor="text-emerald-700"
            />
            <StatCard
              label="Active Learners"
              value={activeLearners.toLocaleString()}
              icon={<Flame className="w-5 h-5 text-pink" />}
              gradient="bg-card-gradient-pink"
              borderColor="border-pink/20"
              textColor="text-pink-700"
            />
            <StatCard
              label="Active Today"
              value={activeToday.toLocaleString()}
              icon={<Activity className="w-5 h-5 text-accent-blue" />}
              gradient="bg-card-gradient-blue"
              borderColor="border-accent-blue/20"
              textColor="text-blue-700"
            />
            <StatCard
              label="Total XP Awarded"
              value={totalXp.toLocaleString()}
              icon={<Sparkles className="w-5 h-5 text-gold" />}
              gradient="bg-card-gradient-gold"
              borderColor="border-gold/20"
              textColor="text-amber-700"
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════
              SECTION 3 — Content
              ═══════════════════════════════════════════════════════════ */}
          <SectionHeader
            title="Content"
            subtitle="Lessons, quests, and shop items available"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Published Lessons"
              value={publishedLessons.toLocaleString()}
              icon={<BookOpen className="w-5 h-5 text-secondary" />}
              gradient="bg-card-gradient-green"
              borderColor="border-secondary/20"
              textColor="text-emerald-700"
            />
            <StatCard
              label="Draft Lessons"
              value={draftLessons.toLocaleString()}
              icon={<FileText className="w-5 h-5 text-gold" />}
              gradient="bg-card-gradient-gold"
              borderColor="border-gold/20"
              textColor="text-amber-700"
            />
            <StatCard
              label="Quests"
              value={quests.toLocaleString()}
              icon={<Swords className="w-5 h-5 text-accent-purple" />}
              gradient="bg-card-gradient-purple"
              borderColor="border-accent-purple/20"
              textColor="text-primary-dark"
            />
            <StatCard
              label="Shop Items"
              value={shopItems.toLocaleString()}
              icon={<ShoppingBag className="w-5 h-5 text-accent-blue" />}
              gradient="bg-card-gradient-blue"
              borderColor="border-accent-blue/20"
              textColor="text-blue-700"
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════
              QUICK ACTIONS
              ═══════════════════════════════════════════════════════════ */}
          <SectionHeader
            title="Quick Actions"
            subtitle="Common tasks to manage your platform"
          />
          <div className="flex flex-wrap gap-3 mb-8">
            <GradientButton
              variant="primary"
              size="md"
              icon={<BookOpen className="w-4 h-4" />}
            >
              Create Lesson
            </GradientButton>
            <GradientButton
              variant="success"
              size="md"
              icon={<Swords className="w-4 h-4" />}
            >
              Add Quest
            </GradientButton>
            <GradientButton
              variant="secondary"
              size="md"
              icon={<ScrollText className="w-4 h-4" />}
            >
              Import Curriculum
            </GradientButton>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              CURRICULUM SEED
              ═══════════════════════════════════════════════════════════ */}
          <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>Curriculum</h2>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem", marginBottom: "1rem" }}>
              Seed draft curriculum structure for Grade 2 and Grade 5. This creates themes, quests, and lesson placeholders. Already-existing records will not be duplicated.
            </p>

            {seedFeedback && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  padding: "0.75rem 1rem",
                  borderRadius: 12,
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  background: seedFeedback.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.06)",
                  border: `1px solid ${seedFeedback.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
                  color: seedFeedback.type === "success" ? colors.success : colors.danger,
                }}
              >
                {seedFeedback.message}
                <button
                  onClick={() => setSeedFeedback(null)}
                  style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem", padding: "0 0.25rem" }}
                  aria-label="Dismiss"
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}

            <button
              onClick={handleSeed}
              disabled={seeding}
              style={{
                ...ds.btnPrimary,
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                cursor: seeding ? "not-allowed" : "pointer",
                opacity: seeding ? 0.7 : 1,
              }}
            >
              {seeding ? (
                <>
                  <span style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }} />
                  Seeding...
                </>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles style={{ width: 16, height: 16 }} /> Seed Draft Curriculum
                </span>
              )}
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              SHOP SEED
              ═══════════════════════════════════════════════════════════ */}
          <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>Reward Shop</h2>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem", marginBottom: "1rem" }}>
              Seed default avatar shop items and reward rules. This creates 20 shop items (hats, clothing, pets, backgrounds, etc.) and 7 reward rules for earning Spark Coins.
            </p>

            {shopSeedFeedback && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  padding: "0.75rem 1rem",
                  borderRadius: 12,
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  background: shopSeedFeedback.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.06)",
                  border: `1px solid ${shopSeedFeedback.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
                  color: shopSeedFeedback.type === "success" ? colors.success : colors.danger,
                }}
              >
                {shopSeedFeedback.message}
                <button
                  onClick={() => setShopSeedFeedback(null)}
                  style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem", padding: "0 0.25rem" }}
                  aria-label="Dismiss"
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}

            <button
              onClick={handleShopSeed}
              disabled={shopSeeding}
              style={{
                ...ds.btnPrimary,
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                cursor: shopSeeding ? "not-allowed" : "pointer",
                opacity: shopSeeding ? 0.7 : 1,
              }}
            >
              {shopSeeding ? (
                <>
                  <span style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }} />
                  Seeding...
                </>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  <ShoppingBag style={{ width: 16, height: 16 }} /> Seed Shop Items & Rewards
                </span>
              )}
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              SYSTEM ACTIVITY
              ═══════════════════════════════════════════════════════════ */}
          <SectionHeader title="System Activity" />
          <div style={{ ...ds.card, padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0" }}>
              <Activity style={{ width: 18, height: 18, color: colors.primary }} />
              <span style={{ fontSize: "0.875rem", color: colors.text }}>Dashboard loaded successfully</span>
              <span style={{ fontSize: "0.75rem", color: colors.textMuted, marginLeft: "auto" }}>Just now</span>
            </div>
          </div>
        </div>
      </main>

      {/* Spin animation for loading spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
