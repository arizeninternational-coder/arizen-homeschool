"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Users, BookOpen, GraduationCap, Award, Settings, BarChart3,
  Shield, LogOut, Plus, ChevronRight, TrendingUp, Activity,
  UserCheck, Layers, Zap, AlertCircle, Menu, X, ShoppingBag
} from "lucide-react";
import { ds, colors, gradients, shadows } from "@/lib/design-system";

interface AdminStats {
  users: number;
  parents: number;
  learners: number;
  lessons: number;
  quests: number;
}

interface SeedFeedback {
  type: "success" | "error";
  message: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({ users: 0, parents: 0, learners: 0, lessons: 0, quests: 0 });
  const [statsError, setStatsError] = useState<string | null>(null);
  const [seedFeedback, setSeedFeedback] = useState<SeedFeedback | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [shopSeedFeedback, setShopSeedFeedback] = useState<SeedFeedback | null>(null);
  const [shopSeeding, setShopSeeding] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

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
        // Fetch stats — do NOT swallow errors
        try {
          const statsRes = await fetch("/api/admin/stats", { credentials: "include" });
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
        } catch (statsErr: any) {
          setStatsError(statsErr?.message || "Failed to load dashboard stats");
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
      // Auto-dismiss after 8s
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <div style={{ textAlign: "center" }}>
          <Shield style={{ width: 48, height: 48, color: colors.primary, margin: "0 auto 1rem" }} />
          <p style={{ color: colors.textMuted, fontWeight: 600 }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Fix: proper name fallback chain
  const displayName = user.name || user.email || "Admin";
  const firstName = displayName.includes(" ") ? displayName.split(" ")[0] : displayName;

  const navItems = [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard/admin", active: true, desc: "Overview & analytics" },
    { icon: Users, label: "Users", href: "/dashboard/admin/users", desc: "Manage all users" },
    { icon: GraduationCap, label: "Learners", href: "/dashboard/admin/learners", desc: "Student profiles" },
    { icon: BookOpen, label: "Lessons", href: "/dashboard/admin/lessons", desc: "Lesson content" },
    { icon: Layers, label: "Quests", href: "/dashboard/admin/quests", desc: "Quest management" },
    { icon: Award, label: "Badges", href: "/dashboard/admin/badges", desc: "Achievement badges" },
    { icon: ShoppingBag, label: "Shop", href: "/dashboard/admin/shop", desc: "Shop items & rewards" },
    { icon: TrendingUp, label: "Reports", href: "/dashboard/admin/reports", desc: "System reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/admin/settings", desc: "App settings" },
  ];

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: colors.primary },
    { label: "Parents", value: stats.parents, icon: UserCheck, color: colors.accent },
    { label: "Learners", value: stats.learners, icon: GraduationCap, color: colors.success },
    { label: "Lessons", value: stats.lessons, icon: BookOpen, color: colors.warning },
    { label: "Quests", value: stats.quests, icon: Layers, color: colors.primary },
  ];

  const quickActions = [
    { label: "Manage Users", icon: Plus, desc: "View and manage accounts", href: "/dashboard/admin/users" },
    { label: "Create Lesson", icon: BookOpen, desc: "Add new lesson content", href: "/dashboard/admin/lessons" },
    { label: "Design Quest", icon: Layers, desc: "Build a new quest", href: "/dashboard/admin/quests" },
    { label: "Issue Badge", icon: Award, desc: "Configure achievements", href: "/dashboard/admin/badges" },
  ];

  // Shared sidebar/nav content
  const renderNavContent = (inline: boolean) => (
    <>
      {/* Brand / Logo area */}
      <div style={{ padding: "0 1.25rem", marginBottom: "2rem" }}>
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

      {/* Navigation links */}
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

      {/* Logout */}
      {!inline ? (
        <div style={{ padding: "0 1.25rem", borderTop: `1px solid ${colors.border}`, paddingTop: "1rem" }}>
          <button onClick={() => { signOut({ callbackUrl: "/" }); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", borderRadius: 8, border: "none", background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, width: "100%" }}>
            <LogOut style={{ width: 16, height: 16 }} /> Sign Out
          </button>
        </div>
      ) : (
        <div style={{ padding: "1rem" }}>
          <button onClick={() => { signOut({ callbackUrl: "/" }); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem", borderRadius: 10, border: `1px solid ${colors.border}`, background: "rgba(239,68,68,0.05)", color: colors.danger, cursor: "pointer", fontSize: "0.875rem", fontWeight: 700, width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
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
          {/* Drawer header with close button */}
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
            {/* Hamburger (mobile only) */}
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
            {/* Mobile logout in top bar */}
            {!isDesktop && (
              <button
                onClick={() => { signOut({ callbackUrl: "/" }); }}
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

        {/* Page Content */}
        <div style={{ padding: isDesktop ? "2rem" : "1.25rem", flex: 1 }}>

          {/* Welcome Header — desktop only */}
          {isDesktop && (
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rm" }}>
                Welcome back, {firstName} 👋
              </h2>
              <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>
                Here's what's happening across your homeschool network.
              </p>
            </div>
          )}

          {/* Stats error banner */}
          {statsError && (
            <div style={{ ...ds.alertError, marginBottom: "1.5rem" }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
              <span>Unable to load some dashboard stats: {statsError}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(auto-fit, minmax(180px, 1fr))" : "repeat(2, 1fr)", gap: isDesktop ? "1rem" : "0.75rem", marginBottom: "2rem" }}>
            {statCards.map((stat) => (
              <div key={stat.label} style={{ ...ds.card, padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <stat.icon style={{ width: 20, height: 20, color: stat.color }} />
                  </div>
                  {statsError && (
                    <AlertCircle style={{ width: 14, height: 14, color: colors.warning }} />
                  )}
                  {!statsError && (
                    <TrendingUp style={{ width: 16, height: 16, color: colors.success }} />
                  )}
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: colors.text }}>
                  {statsError ? "—" : stat.value}
                </div>
                <div style={{ fontSize: "0.8125rem", color: colors.textMuted, fontWeight: 600 }}>{stat.label}</div>
                {statsError && (
                  <div style={{ fontSize: "0.6875rem", color: colors.warning, fontWeight: 600, marginTop: "0.25rem" }}>
                    Unable to load
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 style={{ fontSize: isDesktop ? "1.125rem" : "1rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(auto-fit, minmax(200px, 1fr))" : "repeat(2, 1fr)", gap: isDesktop ? "1rem" : "0.75rem", marginBottom: "2rem" }}>
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} style={{
                ...ds.card,
                padding: "1.25rem",
                textAlign: "left",
                cursor: "pointer",
                border: `1.5px solid ${colors.border}`,
                background: "white",
                transition: "all 0.15s",
                textDecoration: "none",
                display: "block",
              }}>
                <action.icon style={{ width: 24, height: 24, color: colors.primary, marginBottom: "0.75rem" }} />
                <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{action.label}</div>
                <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "0.25rem" }}>{action.desc}</div>
              </Link>
            ))}
          </div>

          {/* Seed Curriculum */}
          <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>Curriculum</h2>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem", marginBottom: "1rem" }}>
              Seed draft curriculum structure for Grade 2 and Grade 5. This creates themes, quests, and lesson placeholders. Already-existing records will not be duplicated.
            </p>

            {/* Inline feedback banner */}
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
                <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>
                  {seedFeedback.type === "success" ? "✅" : "❌"}
                </span>
                {seedFeedback.message}
                <button
                  onClick={() => setSeedFeedback(null)}
                  style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem", padding: "0 0.25rem" }}
                  aria-label="Dismiss"
                >
                  ×
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
                <>🌱 Seed Draft Curriculum</>
              )}
            </button>
          </div>

          {/* Seed Shop Items */}
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
                <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>
                  {shopSeedFeedback.type === "success" ? "✅" : "❌"}
                </span>
                {shopSeedFeedback.message}
                <button
                  onClick={() => setShopSeedFeedback(null)}
                  style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem", padding: "0 0.25rem" }}
                  aria-label="Dismiss"
                >
                  ×
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
                <>🛍️ Seed Shop Items & Rewards</>
              )}
            </button>
          </div>

          {/* Recent Activity */}
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>System Activity</h2>
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
