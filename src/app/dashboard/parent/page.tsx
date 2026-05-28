"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  Heart, Users, BookOpen, TrendingUp, Settings, LogOut,
  ChevronRight, Flower2, ShieldCheck, Flame, Award, Loader2,
  LayoutDashboard, ClipboardList, Plus
} from "lucide-react";
import { ds, colors, gradients, shadows } from "@/lib/design-system";
import Link from "next/link";

// ─── EQ Color Palette (parent view) ───
const eqColors: Record<string, { bg: string; border: string; emoji: string; label: string }> = {
  happy:      { bg: "#FEF9C3", border: "#FDE047", emoji: "😊", label: "Happy" },
  calm:       { bg: "#D1FAE5", border: "#6EE7B7", emoji: "😌", label: "Calm" },
  curious:    { bg: "#E0E7FF", border: "#A5B4FC", emoji: "🤔", label: "Curious" },
  okay:       { bg: "#E0F2FE", border: "#7DD3FC", emoji: "😐", label: "Okay" },
  worried:    { bg: "#EDE9FE", border: "#C4B5FD", emoji: "😟", label: "Worried" },
  tired:      { bg: "#DDD6FE", border: "#A78BFA", emoji: "😴", label: "Tired" },
  frustrated: { bg: "#FFE4E6", border: "#FDA4AF", emoji: "😤", label: "Frustrated" },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/parent" },
  { label: "My Children", icon: Users, href: "/dashboard/parent/children" },
  { label: "Progress", icon: TrendingUp, href: "/dashboard/parent/progress" },
  { label: "Lessons", icon: BookOpen, href: "/dashboard/parent/lessons" },
  { label: "Reports", icon: ClipboardList, href: "/dashboard/parent/reports" },
  { label: "Settings", icon: Settings, href: "/dashboard/parent/settings" },
];

interface ChildCheckin {
  childId: string;
  childName: string;
  emotion: string | null;
  checkedIn: boolean;
}

export default function ParentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [childCheckins, setChildCheckins] = useState<ChildCheckin[]>([]);
  const [checkinsLoading, setCheckinsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!data?.user) { window.location.replace("/auth/login"); return; }
        if (data.user.role !== "PARENT") {
          window.location.replace(data.user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/student");
          return;
        }
        setUser(data.user);
        // Load linked children
        try {
          const childrenRes = await fetch("/api/parent/link-child", { credentials: "include" });
          if (childrenRes.ok) {
            const childrenData = await childrenRes.json();
            setChildren(childrenData.children || []);
          }
        } catch { /* ignore children load error */ }
      } catch { window.location.replace("/auth/login"); }
      finally { setLoading(false); }
    }
    checkAuth();
  }, []);

  // Fetch child check-ins
  useEffect(() => {
    async function loadCheckins() {
      try {
        const res = await fetch("/api/parent/child-checkins");
        if (res.ok) {
          const data = await res.json();
          setChildCheckins(data.checkins || []);
        }
      } catch (err) {
        console.error("[PARENT] Check-ins load error:", err);
      } finally {
        setCheckinsLoading(false);
      }
    }
    if (user) loadCheckins();
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...ds.logoMark, width: 64, height: 64, margin: "0 auto 1.5rem" }}>
            <Loader2 style={{ width: 32, height: 32 }} className="spinner" />
          </div>
          <p style={{ color: colors.textMuted, fontWeight: 600 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.name || user.email || "Parent";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: colors.bg, position: "relative", overflow: "hidden" }}>
      {/* Background Orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden="true">
        <div style={{ ...ds.orb(colors.primarySoft, "30rem"), top: "-10rem", right: "-8rem", opacity: 0.3 }} className="float-slow" />
        <div style={{ ...ds.orb(colors.accentSoft, "24rem"), bottom: "-8rem", left: "-6rem", opacity: 0.2 }} className="float-medium" />
        <div style={{ ...ds.orb(colors.warmSoft, "18rem"), top: "50%", right: "5%", opacity: 0.15 }} className="float-fast" />
      </div>

      {/* Top Nav */}
      <header style={{ background: "rgba(253,253,251,0.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${colors.border}`, padding: "0 1.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/dashboard/parent" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <div style={{ ...ds.logoMark, width: 36, height: 36 }}>
            <Flower2 style={{ width: 20, height: 20 }} />
          </div>
          <span style={{ fontSize: "1.125rem", fontWeight: 900, ...ds.textGradient }}>Arizen School</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="desktop-nav">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.875rem", borderRadius: "0.75rem", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none", color: colors.textMuted, background: "transparent", transition: "all 0.2s ease" }}>
              <item.icon style={{ width: 15, height: 15 }} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.875rem", borderRadius: "0.75rem", background: colors.bgSoft, border: `1px solid ${colors.borderLight}` }}>
            <ShieldCheck style={{ width: 14, height: 14, color: colors.primary }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.text }}>{displayName}</span>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ ...ds.btnGhost, color: colors.textMuted, padding: "0.5rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }} title="Sign out">
            <LogOut style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, position: "relative", zIndex: 1, padding: "2.5rem 0 4rem" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.5rem" }}>

          {/* Welcome */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Heart style={{ width: 20, height: 20, color: colors.accent }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.primary }}>Parent Dashboard</span>
            </div>
            <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 900, letterSpacing: "-0.03em", color: colors.textHeading, marginBottom: "0.75rem", lineHeight: 1.15 }}>
              {getGreeting()}, <span style={ds.textGradient}>{displayName.split(" ")[0]}</span> 👋
            </h1>
            <p style={{ fontSize: "1.0625rem", color: colors.textMuted, maxWidth: 560, fontWeight: 500, lineHeight: 1.7 }}>
              Welcome to your family&apos;s learning hub. Track your children&apos;s progress, explore lessons, and celebrate their achievements.
            </p>
          </div>

          {/* ─── Today's Check-In Section ─── */}
          {children.length > 0 && (
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.125rem" }}>💛</span>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text }}>Today&apos;s Check-In</h2>
              </div>
              <div style={{
                background: "white",
                borderRadius: 20,
                border: `1px solid ${colors.borderLight}`,
                padding: "1.5rem",
                boxShadow: ds.shadows.sm,
              }}>
                {checkinsLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0" }}>
                    <Loader2 style={{ width: 18, height: 18, color: colors.primary }} className="spinner" />
                    <span style={{ fontSize: "0.875rem", color: colors.textMuted, fontWeight: 500 }}>Loading check-ins...</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {childCheckins.map((ci) => {
                        const eq = ci.emotion ? eqColors[ci.emotion] : null;
                        return (
                          <div key={ci.childId} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.75rem 1rem",
                            borderRadius: 14,
                            background: eq ? eq.bg : colors.bgSoft,
                            border: `1px solid ${eq ? eq.border : colors.borderLight}`,
                          }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%",
                              background: gradients.primary,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0,
                            }}>
                              {ci.childName.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {ci.checkedIn && eq ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: colors.text }}>
                                    {ci.childName} checked in as
                                  </span>
                                  <span style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.3rem",
                                    padding: "0.2rem 0.625rem", borderRadius: 999,
                                    background: eq.bg, border: `1.5px solid ${eq.border}`,
                                    fontSize: "0.8125rem", fontWeight: 700, color: "#44403c",
                                  }}>
                                    {eq.emoji} {eq.label}
                                  </span>
                                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: colors.text }}>today.</span>
                                </div>
                              ) : (
                                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: colors.textMuted }}>
                                  {ci.childName} hasn&apos;t checked in yet today.
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p style={{
                      fontSize: "0.75rem", color: colors.textMuted, fontWeight: 500,
                      marginTop: "1rem", paddingTop: "0.75rem",
                      borderTop: `1px solid ${colors.borderLight}`,
                      display: "flex", alignItems: "center", gap: "0.35rem",
                    }}>
                      💛 All feelings are welcome. Check-ins help children build self-awareness.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            {[
              { icon: Users, label: "Children", value: String(children.length), color: colors.primary, bgColor: colors.primarySoft },
              { icon: Flame, label: "Active Streaks", value: String(children.filter((c: any) => c.childUser?.learnerProfile?.currentStreak > 0).length), color: colors.warm, bgColor: colors.warmSoft },
              { icon: Award, label: "Total XP", value: String(children.reduce((sum: number, c: any) => sum + (c.childUser?.learnerProfile?.totalXp || 0), 0)), color: colors.accent, bgColor: colors.accentSoft },
              { icon: BookOpen, label: "Lessons Done", value: "0", color: colors.info, bgColor: colors.bgBlue },
            ].map((stat) => (
              <div key={stat.label} style={{ ...ds.card, padding: "1.25rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem", background: stat.bgColor }}>
                  <stat.icon style={{ width: 20, height: 20, color: stat.color }} />
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text }}>{stat.value}</div>
                <div style={{ fontSize: "0.8125rem", color: colors.textMuted, fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Children Section */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text }}>My Children</h2>
              <Link href="/dashboard/parent/children" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8125rem", fontWeight: 700, color: colors.primary, textDecoration: "none" }}>
                Manage <ChevronRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>

            {children.length === 0 ? (
              <div style={{ ...ds.card, textAlign: "center", padding: "2.5rem 2rem" }}>
                <div style={{ ...ds.logoMark, width: 48, height: 48, margin: "0 auto 1rem", background: colors.bgSoft }}>
                  <Users style={{ width: 24, height: 24, color: colors.textMuted }} />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>No children linked</h3>
                <p style={{ color: colors.textMuted, fontSize: "0.875rem", maxWidth: 320, margin: "0 auto 1rem" }}>
                  Link a learner account to start tracking progress.
                </p>
                <Link href="/dashboard/parent/children" style={{ ...ds.btnPrimary, fontSize: "0.875rem", textDecoration: "none", display: "inline-flex" }}>
                  <Plus style={{ width: 14, height: 14 }} /> Add Child
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {children.map((link: any) => {
                  const profile = link.childUser?.learnerProfile;
                  const childDisplayName = profile?.displayName || link.childUser?.name || "Learner";
                  // Find check-in for this child
                  const ci = childCheckins.find((c: any) => c.childId === link.childUser?.id);
                  const eq = ci?.checkedIn && ci?.emotion ? eqColors[ci.emotion] : null;
                  return (
                    <div key={link.id} style={{ ...ds.card, padding: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: gradients.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>
                          {childDisplayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{childDisplayName}</div>
                          {profile && <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Grade {profile.grade}</div>}
                        </div>
                      </div>
                      {profile && (
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", alignItems: "center" }}>
                          <span style={{ color: colors.primary, fontWeight: 600 }}>{profile.totalXp} XP</span>
                          <span style={{ color: colors.warm, fontWeight: 600 }}>{profile.currentStreak}d streak</span>
                          {eq && (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "0.2rem",
                              padding: "0.15rem 0.5rem", borderRadius: 999,
                              background: eq.bg, border: `1px solid ${eq.border}`,
                              fontSize: "0.6875rem", fontWeight: 700, color: "#44403c",
                              marginLeft: "auto",
                            }}>
                              {eq.emoji} {eq.label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "1.25rem" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Add Child", icon: Users, desc: "Link a learner account", href: "/dashboard/parent/children" },
              { label: "View Progress", icon: TrendingUp, desc: "See learning progress", href: "/dashboard/parent/progress" },
              { label: "Browse Lessons", icon: BookOpen, desc: "Explore available content", href: "/dashboard/parent/lessons" },
            ].map((action) => (
              <Link key={action.label} href={action.href} style={{ ...ds.card, padding: "1.25rem", cursor: "pointer", textDecoration: "none", display: "block" }}>
                <action.icon style={{ width: 24, height: 24, color: colors.primary, marginBottom: "0.75rem" }} />
                <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{action.label}</div>
                <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "0.25rem" }}>{action.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
