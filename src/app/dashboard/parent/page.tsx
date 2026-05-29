"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import {
  Heart, Users, BookOpen, TrendingUp, Settings, LogOut,
  ChevronRight, Flower2, ShieldCheck, Flame, Award, Loader2,
  LayoutDashboard, ClipboardList, Plus, X, Check, AlertCircle,
  Bell, PenTool, Clock, CalendarDays
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

interface Homework {
  id: string;
  title: string;
  subject: string;
  focusArea: string;
  instructions: string;
  dueDate: string;
  createdAt: string;
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
}

// ─── Modal overlay style ───
const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: "1rem",
};

export default function ParentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [childCheckins, setChildCheckins] = useState<ChildCheckin[]>([]);
  const [checkinsLoading, setCheckinsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Link child form
  const [childEmail, setChildEmail] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkMessage, setLinkMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Homework modal
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [hwChildId, setHwChildId] = useState("");
  const [hwChildName, setHwChildName] = useState("");
  const [hwTitle, setHwTitle] = useState("");
  const [hwSubject, setHwSubject] = useState("");
  const [hwFocusArea, setHwFocusArea] = useState("");
  const [hwInstructions, setHwInstructions] = useState("");
  const [hwDueDate, setHwDueDate] = useState("");
  const [hwLoading, setHwLoading] = useState(false);
  const [hwMessage, setHwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Homework lists per child
  const [childHomework, setChildHomework] = useState<Record<string, Homework[]>>({});

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch session & children
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        const data = await res.json();
        if (!data?.user) { window.location.replace("/auth/login"); return; }
        if (data.user.role?.toUpperCase() !== "PARENT") {
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
        const res = await fetch("/api/parent/child-checkins", { credentials: "include" });
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

  // Fetch notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        setNotifLoading(true);
        const res = await fetch("/api/notifications", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("[PARENT] Notifications load error:", err);
      } finally {
        setNotifLoading(false);
      }
    }
    if (user) loadNotifications();
  }, [user]);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [notifOpen]);

  // ─── Link Child Handler ───
  async function handleLinkChild(e: React.FormEvent) {
    e.preventDefault();
    if (!childEmail.trim()) {
      setLinkMessage({ type: "error", text: "Please enter an email address." });
      return;
    }
    setLinkLoading(true);
    setLinkMessage(null);
    try {
      const res = await fetch("/api/parent/link-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ childEmail: childEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setLinkMessage({ type: "success", text: data.message || "Child linked successfully!" });
        setChildEmail("");
        // Refresh children list
        try {
          const childrenRes = await fetch("/api/parent/link-child", { credentials: "include" });
          if (childrenRes.ok) {
            const childrenData = await childrenRes.json();
            setChildren(childrenData.children || []);
          }
        } catch { /* ignore */ }
      } else {
        const msg = data.error || data.message || "Something went wrong. Please try again.";
        setLinkMessage({ type: "error", text: msg });
      }
    } catch {
      setLinkMessage({ type: "error", text: "Network error. Please check your connection and try again." });
    } finally {
      setLinkLoading(false);
    }
  }

  // ─── Assign Homework Handler ───
  async function handleAssignHomework(e: React.FormEvent) {
    e.preventDefault();
    if (!hwTitle.trim() || !hwDueDate) {
      setHwMessage({ type: "error", text: "Title and due date are required." });
      return;
    }
    setHwLoading(true);
    setHwMessage(null);
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          childUserId: hwChildId,
          title: hwTitle.trim(),
          subject: hwSubject.trim(),
          focusArea: hwFocusArea.trim(),
          instructions: hwInstructions.trim(),
          dueDate: hwDueDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setHwMessage({ type: "success", text: data.message || "Homework assigned successfully!" });
        // Add to local homework list
        setHwTitle("");
        setHwSubject("");
        setHwFocusArea("");
        setHwInstructions("");
        setHwDueDate("");
        // Refresh child homework lists
        try {
          const hwRes = await fetch(`/api/homework?childUserId=${hwChildId}`, { credentials: "include" });
          if (hwRes.ok) {
            const hwData = await hwRes.json();
            setChildHomework(prev => ({ ...prev, [hwChildId]: hwData.homework || [] }));
          }
        } catch { /* ignore */ }
      } else {
        setHwMessage({ type: "error", text: data.error || data.message || "Failed to assign homework." });
      }
    } catch {
      setHwMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setHwLoading(false);
    }
  }

  // ─── Open Homework Modal ───
  function openHomeworkModal(childId: string, childName: string) {
    setHwChildId(childId);
    setHwChildName(childName);
    setHwTitle("");
    setHwSubject("");
    setHwFocusArea("");
    setHwInstructions("");
    setHwDueDate("");
    setHwMessage(null);
    setShowHomeworkModal(true);
    // Load existing homework for this child
    fetch(`/api/homework?childUserId=${childId}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setChildHomework(prev => ({ ...prev, [childId]: data.homework || [] }));
      })
      .catch(() => {});
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  }

  const unreadCount = notifications.filter(n => !n.read).length;

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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.warmSoft} 100%)`, position: "relative", overflow: "hidden" }}>
      {/* Background Orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden="true">
        <div style={{ ...ds.orb(colors.primarySoft, "30rem"), top: "-10rem", right: "-8rem", opacity: 0.3 }} className="float-slow" />
        <div style={{ ...ds.orb(colors.accentSoft, "24rem"), bottom: "-8rem", left: "-6rem", opacity: 0.25 }} className="float-medium" />
        <div style={{ ...ds.orb(colors.warmSoft, "18rem"), top: "50%", right: "5%", opacity: 0.2 }} className="float-fast" />
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.875rem", borderRadius: "0.75rem", background: colors.bgSoft, border: `1px solid ${colors.borderLight}` }}>
            <ShieldCheck style={{ width: 14, height: 14, color: colors.primary }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.text }}>{displayName}</span>
          </div>

          {/* Notification Bell */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{
                position: "relative",
                background: notifOpen ? colors.primarySoft : "transparent",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              title="Notifications"
            >
              <Bell style={{ width: 18, height: 18, color: colors.textMuted }} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  minWidth: 16,
                  height: 16,
                  borderRadius: 999,
                  background: gradients.accent,
                  color: "white",
                  fontSize: "0.625rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  boxShadow: shadows.accent,
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 0.5rem)",
                right: 0,
                width: "min(360px, 85vw)",
                maxHeight: 400,
                background: "white",
                borderRadius: "1.25rem",
                border: `1px solid ${colors.borderLight}`,
                boxShadow: shadows.xl,
                overflow: "hidden",
                zIndex: 60,
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.25rem",
                  borderBottom: `1px solid ${colors.borderLight}`,
                  background: gradients.primary,
                }}>
                  <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "white" }}>Notifications</span>
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                    {unreadCount} unread
                  </span>
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notifLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "1.5rem", justifyContent: "center" }}>
                      <Loader2 style={{ width: 16, height: 16, color: colors.primary }} className="spinner" />
                      <span style={{ fontSize: "0.8125rem", color: colors.textMuted }}>Loading...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
                      <Bell style={{ width: 28, height: 28, color: colors.border, margin: "0 auto 0.5rem" }} />
                      <p style={{ fontSize: "0.8125rem", color: colors.textMuted, fontWeight: 500 }}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} style={{
                        padding: "0.875rem 1.25rem",
                        borderBottom: `1px solid ${colors.borderLight}`,
                        background: notif.read ? "transparent" : colors.primarySoft,
                        transition: "background 0.15s ease",
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: notif.read ? colors.border : colors.primary,
                            marginTop: 6, flexShrink: 0,
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: "0.8125rem",
                              color: colors.text,
                              fontWeight: notif.read ? 500 : 700,
                              lineHeight: 1.5,
                            }}>
                              {notif.message}
                            </p>
                            <p style={{ fontSize: "0.6875rem", color: colors.textMuted, marginTop: "0.25rem" }}>
                              {new Date(notif.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{ ...ds.btnGhost, color: colors.textMuted, padding: "0.5rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }}
            title="Sign out"
          >
            <LogOut style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, position: "relative", zIndex: 1, padding: "clamp(1rem, 3vw, 2rem) 0 4rem" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 clamp(1rem, 3vw, 1.5rem)" }}>

          {/* Welcome */}
          <div style={{ marginBottom: "1rem" }}>
            <h1 style={{ fontSize: "clamp(1.125rem, 3vw, 1.5rem)", fontWeight: 900, letterSpacing: "-0.02em", color: colors.textHeading, marginBottom: "0.25rem", lineHeight: 1.15 }}>
              {getGreeting()}, <span style={ds.textGradient}>{displayName.split(" ")[0]}</span> 👋
            </h1>
            <p style={{ fontSize: "clamp(0.8125rem, 2vw, 0.875rem)", color: colors.textMuted, maxWidth: 480, fontWeight: 500, lineHeight: 1.5 }}>
              Track your children's progress and celebrate their achievements.
            </p>
          </div>

          {/* Add Child + Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.625rem", marginBottom: "1rem" }}>
            {/* Stats */}
            {[
              { icon: Users, label: "Children", value: String(children.length), color: colors.primary, bgColor: colors.primarySoft },
              { icon: Flame, label: "Streaks", value: String(children.filter((c: any) => c.childUser?.learnerProfile?.currentStreak > 0).length), color: colors.warm, bgColor: colors.warmSoft },
              { icon: Award, label: "Total XP", value: String(children.reduce((sum: number, c: any) => sum + (c.childUser?.learnerProfile?.totalXp || 0), 0)), color: colors.accent, bgColor: colors.accentSoft },
              { icon: BookOpen, label: "Done", value: "0", color: colors.info, bgColor: colors.bgBlue },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "white",
                borderRadius: "1rem",
                border: `1px solid ${colors.borderLight}`,
                padding: "0.75rem",
                boxShadow: shadows.sm,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.375rem", background: stat.bgColor }}>
                  <stat.icon style={{ width: 14, height: 14, color: stat.color }} />
                </div>
                <div style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, lineHeight: 1.2 }}>{stat.value}</div>
                <div style={{ fontSize: "0.625rem", color: colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Add Child Card */}
          <div style={{
            background: `linear-gradient(135deg, white, ${colors.warmSoft})`,
            borderRadius: "1.25rem",
            border: `1px solid ${colors.borderLight}`,
            padding: "clamp(0.875rem, 2vw, 1.25rem)",
            marginBottom: "1.25rem",
            boxShadow: shadows.sm,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: gradients.warm,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Plus style={{ width: 14, height: 14, color: "white" }} />
              </div>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 800, color: colors.text }}>Link a Child Account</h2>
            </div>

            {linkMessage && (
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "0.625rem 0.875rem",
                borderRadius: "0.75rem",
                marginBottom: "0.75rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                ...(linkMessage.type === "success"
                  ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#15803d" }
                  : { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#dc2626" }),
              }}>
                {linkMessage.type === "success"
                  ? <Check style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
                  : <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
                }
                <span>{linkMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleLinkChild} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                type="email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                placeholder="student@email.com"
                required
                style={{
                  flex: "1 1 200px",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: colors.text,
                  background: "white",
                  border: `1.5px solid ${colors.border}`,
                  outline: "none",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              />
              <button
                type="submit"
                disabled={linkLoading}
                style={{
                  ...ds.btnWarm,
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.8125rem",
                  opacity: linkLoading ? 0.7 : 1,
                  cursor: linkLoading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  whiteSpace: "nowrap",
                }}
              >
                {linkLoading ? (
                  <Loader2 style={{ width: 14, height: 14 }} className="spinner" />
                ) : (
                  <Plus style={{ width: 14, height: 14 }} />
                )}
                Add Child
              </button>
            </form>
          </div>

          {/* ─── Today's Check-In Section ─── */}
          {children.length > 0 && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1rem" }}>💛</span>
                <h2 style={{ fontSize: "1rem", fontWeight: 800, color: colors.text }}>Today&apos;s Check-In</h2>
              </div>
              <div style={{
                background: "white",
                borderRadius: "1.25rem",
                border: `1px solid ${colors.borderLight}`,
                padding: "clamp(0.875rem, 2vw, 1.25rem)",
                boxShadow: shadows.sm,
              }}>
                {checkinsLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0" }}>
                    <Loader2 style={{ width: 18, height: 18, color: colors.primary }} className="spinner" />
                    <span style={{ fontSize: "0.8125rem", color: colors.textMuted, fontWeight: 500 }}>Loading check-ins...</span>
                  </div>
                ) : childCheckins.length === 0 ? (
                  <p style={{ fontSize: "0.8125rem", color: colors.textMuted, fontWeight: 500 }}>No children have checked in yet today.</p>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {childCheckins.map((ci) => {
                        const eq = ci.emotion ? eqColors[ci.emotion] : null;
                        return (
                          <div key={ci.childId} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.625rem",
                            padding: "0.625rem 0.875rem",
                            borderRadius: "0.875rem",
                            background: eq ? eq.bg : colors.bgSoft,
                            border: `1px solid ${eq ? eq.border : colors.borderLight}`,
                          }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: gradients.primary,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontWeight: 700, fontSize: "0.8125rem", flexShrink: 0,
                            }}>
                              {ci.childName.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {ci.checkedIn && eq ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: colors.text }}>
                                    {ci.childName}
                                  </span>
                                  <span style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.25rem",
                                    padding: "0.15rem 0.5rem", borderRadius: 999,
                                    background: eq.bg, border: `1.5px solid ${eq.border}`,
                                    fontSize: "0.75rem", fontWeight: 700, color: "#44403c",
                                  }}>
                                    {eq.emoji} {eq.label}
                                  </span>
                                </div>
                              ) : (
                                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: colors.textMuted }}>
                                  {ci.childName} — No check-in yet today.
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p style={{
                      fontSize: "0.6875rem", color: colors.textMuted, fontWeight: 500,
                      marginTop: "0.75rem", paddingTop: "0.625rem",
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

          {/* Children Section */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: colors.text }}>My Children</h2>
              <Link href="/dashboard/parent/children" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 700, color: colors.primary, textDecoration: "none" }}>
                Manage <ChevronRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>

            {children.length === 0 ? (
              <div style={{
                background: "white",
                borderRadius: "1.25rem",
                border: `1px solid ${colors.borderLight}`,
                textAlign: "center",
                padding: "2rem 1.5rem",
                boxShadow: shadows.sm,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "1rem",
                  background: colors.bgSoft,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 0.75rem",
                }}>
                  <Users style={{ width: 24, height: 24, color: colors.textMuted }} />
                </div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>No children linked</h3>
                <p style={{ color: colors.textMuted, fontSize: "0.8125rem", maxWidth: 320, margin: "0 auto 1rem" }}>
                  Link a learner account above to start tracking progress.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {children.map((link: any) => {
                  const profile = link.childUser?.learnerProfile;
                  const childDisplayName = profile?.displayName || link.childUser?.name || "Learner";
                  const childId = link.childUser?.id;
                  const ci = childCheckins.find((c: any) => c.childId === childId);
                  const eq = ci?.checkedIn && ci?.emotion ? eqColors[ci.emotion] : null;
                  const hwList = childHomework[childId] || [];
                  return (
                    <div key={link.id} style={{
                      background: "white",
                      borderRadius: "1.25rem",
                      border: `1px solid ${colors.borderLight}`,
                      padding: "clamp(0.875rem, 2vw, 1.25rem)",
                      boxShadow: shadows.sm,
                    }}>
                      {/* Child Header */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem" }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: gradients.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.9375rem", flexShrink: 0 }}>
                          {childDisplayName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>{childDisplayName}</div>
                          {profile && <div style={{ fontSize: "0.6875rem", color: colors.textMuted }}>Grade {profile.grade}</div>}
                        </div>
                      </div>

                      {/* Stats Row */}
                      {profile && (
                        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.6875rem", alignItems: "center", marginBottom: "0.625rem", flexWrap: "wrap" }}>
                          <span style={{ color: colors.primary, fontWeight: 700 }}>{profile.totalXp} XP</span>
                          <span style={{ color: colors.warm, fontWeight: 700 }}>{profile.currentStreak}d streak</span>
                          {eq && (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "0.2rem",
                              padding: "0.125rem 0.5rem", borderRadius: 999,
                              background: eq.bg, border: `1px solid ${eq.border}`,
                              fontSize: "0.625rem", fontWeight: 700, color: "#44403c",
                              marginLeft: "auto",
                            }}>
                              {eq.emoji} {eq.label}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Assign Homework Button */}
                      <button
                        onClick={() => openHomeworkModal(childId, childDisplayName)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          padding: "0.375rem 0.75rem",
                          borderRadius: "0.625rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: colors.warmDark,
                          background: colors.warmSoft,
                          border: `1px solid ${colors.warmLight}`,
                          cursor: "pointer",
                          marginBottom: "0.625rem",
                        }}
                      >
                        <PenTool style={{ width: 13, height: 13 }} />
                        Assign Homework
                      </button>

                      {/* Homework List */}
                      {hwList.length > 0 && (
                        <div style={{
                          marginTop: "0.5rem",
                          padding: "0.625rem",
                          borderRadius: "0.75rem",
                          background: colors.bgSoft,
                          border: `1px solid ${colors.borderLight}`,
                        }}>
                          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.375rem" }}>
                            Assigned Homework
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                            {hwList.map((hw) => (
                              <div key={hw.id} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontSize: "0.75rem",
                                color: colors.text,
                              }}>
                                <BookOpen style={{ width: 12, height: 12, color: colors.warm, flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, flex: 1, minWidth: 0 }}>{hw.title}</span>
                                {hw.subject && (
                                  <span style={{
                                    fontSize: "0.625rem",
                                    padding: "0.1rem 0.4rem",
                                    borderRadius: 999,
                                    background: colors.warmSoft,
                                    border: `1px solid ${colors.warmLight}`,
                                    color: colors.warmDark,
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                  }}>
                                    {hw.subject}
                                  </span>
                                )}
                                <span style={{ fontSize: "0.625rem", color: colors.textMuted, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                  <Clock style={{ width: 10, height: 10 }} />
                                  {new Date(hw.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: colors.text, marginBottom: "0.875rem" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
            {[
              { label: "Add Child", icon: Users, desc: "Link a learner account", href: "/dashboard/parent/children" },
              { label: "View Progress", icon: TrendingUp, desc: "See learning progress", href: "/dashboard/parent/progress" },
              { label: "Browse Lessons", icon: BookOpen, desc: "Explore available content", href: "/dashboard/parent/lessons" },
            ].map((action) => (
              <Link key={action.label} href={action.href} style={{
                background: "white",
                borderRadius: "1rem",
                border: `1px solid ${colors.borderLight}`,
                padding: "1rem",
                cursor: "pointer",
                textDecoration: "none",
                display: "block",
                boxShadow: shadows.sm,
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
              }}>
                <action.icon style={{ width: 20, height: 20, color: colors.primary, marginBottom: "0.5rem" }} />
                <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>{action.label}</div>
                <div style={{ fontSize: "0.6875rem", color: colors.textMuted, marginTop: "0.2rem" }}>{action.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* ─── Logout Confirmation Modal ─── */}
      {showLogoutModal && (
        <div style={modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "1.5rem",
              padding: "2rem",
              width: "min(400px, 90vw)",
              boxShadow: shadows["2xl"],
              textAlign: "center",
              border: `1px solid ${colors.borderLight}`,
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: colors.primarySoft,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem",
            }}>
              <LogOut style={{ width: 24, height: 24, color: colors.primary }} />
            </div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.textHeading, marginBottom: "0.5rem" }}>
              Log out of Arizen School?
            </h3>
            <p style={{ fontSize: "0.875rem", color: colors.textMuted, marginBottom: "1.5rem", lineHeight: 1.5 }}>
              You&apos;ll need to sign in again to continue.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  ...ds.btnGhost,
                  padding: "0.625rem 1.5rem",
                  borderRadius: "0.875rem",
                  border: `1.5px solid ${colors.border}`,
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  ...ds.btnAccent,
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                <LogOut style={{ width: 14, height: 14 }} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Assign Homework Modal ─── */}
      {showHomeworkModal && (
        <div style={modalOverlay} onClick={() => setShowHomeworkModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "1.5rem",
              padding: "2rem",
              width: "min(520px, 95vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: shadows["2xl"],
              border: `1px solid ${colors.borderLight}`,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: gradients.warm,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <PenTool style={{ width: 16, height: 16, color: "white" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: colors.textHeading }}>Assign Homework</h3>
                  <p style={{ fontSize: "0.75rem", color: colors.textMuted, fontWeight: 500 }}>for {hwChildName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHomeworkModal(false)}
                style={{
                  background: colors.bgSoft,
                  border: "none",
                  borderRadius: "0.625rem",
                  padding: "0.375rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X style={{ width: 18, height: 18, color: colors.textMuted }} />
              </button>
            </div>

            {hwMessage && (
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "0.625rem 0.875rem",
                borderRadius: "0.75rem",
                marginBottom: "1rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                ...(hwMessage.type === "success"
                  ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#15803d" }
                  : { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#dc2626" }),
              }}>
                {hwMessage.type === "success"
                  ? <Check style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
                  : <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
                }
                <span>{hwMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAssignHomework}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={ds.label}>Title *</label>
                  <input
                    type="text"
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    placeholder="e.g. Chapter 5 Math Practice"
                    required
                    style={{ ...ds.input }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={ds.label}>Subject</label>
                    <input
                      type="text"
                      value={hwSubject}
                      onChange={(e) => setHwSubject(e.target.value)}
                      placeholder="e.g. Math"
                      style={{ ...ds.input }}
                    />
                  </div>
                  <div>
                    <label style={ds.label}>Focus Area</label>
                    <input
                      type="text"
                      value={hwFocusArea}
                      onChange={(e) => setHwFocusArea(e.target.value)}
                      placeholder="e.g. Fractions"
                      style={{ ...ds.input }}
                    />
                  </div>
                </div>
                <div>
                  <label style={ds.label}>Instructions</label>
                  <textarea
                    value={hwInstructions}
                    onChange={(e) => setHwInstructions(e.target.value)}
                    placeholder="Provide instructions for this homework..."
                    rows={3}
                    style={{
                      ...ds.input,
                      resize: "vertical",
                      minHeight: 80,
                    }}
                  />
                </div>
                <div>
                  <label style={ds.label}>Due Date *</label>
                  <input
                    type="date"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    required
                    style={{ ...ds.input }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.25rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setShowHomeworkModal(false)}
                  style={{
                    ...ds.btnGhost,
                    padding: "0.625rem 1.5rem",
                    borderRadius: "0.875rem",
                    border: `1.5px solid ${colors.border}`,
                    fontSize: "0.875rem",
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={hwLoading}
                  style={{
                    ...ds.btnWarm,
                    padding: "0.625rem 1.5rem",
                    fontSize: "0.875rem",
                    opacity: hwLoading ? 0.7 : 1,
                    cursor: hwLoading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  {hwLoading ? (
                    <Loader2 style={{ width: 14, height: 14 }} className="spinner" />
                  ) : (
                    <PenTool style={{ width: 14, height: 14 }} />
                  )}
                  Assign Homework
                </button>
              </div>
            </form>

            {/* Existing Homework for this child */}
            {(childHomework[hwChildId] || []).length > 0 && (
              <div style={{
                marginTop: "1.5rem",
                paddingTop: "1.25rem",
                borderTop: `1px solid ${colors.borderLight}`,
              }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.textMuted, marginBottom: "0.625rem" }}>
                  Previously Assigned
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {(childHomework[hwChildId] || []).map((hw) => (
                    <div key={hw.id} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.625rem",
                      borderRadius: "0.625rem",
                      background: colors.bgSoft,
                      fontSize: "0.75rem",
                      color: colors.text,
                    }}>
                      <BookOpen style={{ width: 12, height: 12, color: colors.warm, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>{hw.title}</span>
                      <span style={{ fontSize: "0.625rem", color: colors.textMuted, marginLeft: "auto", whiteSpace: "nowrap" }}>
                        Due {new Date(hw.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
