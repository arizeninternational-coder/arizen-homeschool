"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Users, BookOpen, GraduationCap, Award, Settings, BarChart3,
  Shield, LogOut, Plus, ChevronRight, TrendingUp, Activity,
  UserCheck, Layers, Zap
} from "lucide-react";
import { ds, colors, gradients, shadows } from "@/lib/design-system";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, parents: 0, learners: 0, lessons: 0, quests: 0 });

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
        // Fetch stats
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch {
        window.location.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
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

  const navItems = [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard/admin", active: true, desc: "Overview & analytics" },
    { icon: Users, label: "Users", href: "/dashboard/admin/users", desc: "Manage all users" },
    { icon: GraduationCap, label: "Learners", href: "/dashboard/admin/learners", desc: "Student profiles" },
    { icon: BookOpen, label: "Lessons", href: "/dashboard/admin/lessons", desc: "Lesson content" },
    { icon: Layers, label: "Quests", href: "/dashboard/admin/quests", desc: "Quest management" },
    { icon: Award, label: "Badges", href: "/dashboard/admin/badges", desc: "Achievement badges" },
    { icon: TrendingUp, label: "Reports", href: "/dashboard/admin/reports", desc: "System reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/admin/settings", desc: "App settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: colors.surface, borderRight: `1px solid ${colors.border}`, padding: "1.5rem 0", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 10 }}>
        <div style={{ padding: "0 1.25rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: gradients.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield style={{ width: 20, height: 20, color: "white" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: colors.text }}>Arizen Admin</div>
              <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Management Portal</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "0 0.75rem" }}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6875rem 0.75rem", borderRadius: 10, marginBottom: "0.25rem", textDecoration: "none", background: item.active ? colors.primarySoft : "transparent", color: item.active ? colors.primary : colors.textMuted, fontWeight: item.active ? 700 : 500, fontSize: "0.875rem", transition: "all 0.15s" }}>
              <item.icon style={{ width: 18, height: 18 }} />
              <div>
                <div>{item.label}</div>
                {item.active && <div style={{ fontSize: "0.6875rem", opacity: 0.7, fontWeight: 400 }}>{item.desc}</div>}
              </div>
            </Link>
          ))}
        </nav>
        <div style={{ padding: "0 1.25rem", borderTop: `1px solid ${colors.border}`, paddingTop: "1rem" }}>
          <button onClick={() => { signOut(); window.location.replace("/"); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", borderRadius: 8, border: "none", background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, width: "100%" }}>
            <LogOut style={{ width: 16, height: 16 }} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 260, flex: 1, padding: "2rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Welcome back, {user.name?.split(" ")[0]} 👋</h1>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>Here's what's happening across your homeschool network.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.375rem 0.875rem", borderRadius: 20, background: colors.primarySoft, color: colors.primary, fontSize: "0.75rem", fontWeight: 700 }}>ADMIN</div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: gradients.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
              {user.name?.charAt(0) || "A"}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Users", value: stats.users, icon: Users, color: colors.primary },
              { label: "Parents", value: stats.parents, icon: UserCheck, color: colors.accent },
              { label: "Learners", value: stats.learners, icon: GraduationCap, color: colors.success },
              { label: "Lessons", value: stats.lessons, icon: BookOpen, color: colors.warning },
              { label: "Quests", value: stats.quests, icon: Layers, color: colors.primary },
            ].map((stat) => (
            <div key={stat.label} style={{ ...ds.card, padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon style={{ width: 20, height: 20, color: stat.color }} />
                </div>
                <TrendingUp style={{ width: 16, height: 16, color: colors.success }} />
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: colors.text }}>{stat.value}</div>
              <div style={{ fontSize: "0.8125rem", color: colors.textMuted, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Manage Users", icon: Plus, desc: "View and manage accounts", href: "/dashboard/admin/users" },
            { label: "Create Lesson", icon: BookOpen, desc: "Add new lesson content", href: "/dashboard/admin/lessons" },
            { label: "Design Quest", icon: Layers, desc: "Build a new quest", href: "/dashboard/admin/quests" },
            { label: "Issue Badge", icon: Award, desc: "Configure achievements", href: "/dashboard/admin/badges" },
          ].map((action) => (
            <Link key={action.label} href={action.href} style={{ ...ds.card, padding: "1.25rem", textAlign: "left", cursor: "pointer", border: `1.5px solid ${colors.border}`, background: colors.surface, transition: "all 0.15s", textDecoration: "none", display: "block" }}>
              <action.icon style={{ width: 24, height: 24, color: colors.primary, marginBottom: "0.75rem" }} />
              <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{action.label}</div>
              <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "0.25rem" }}>{action.desc}</div>
            </Link>
          ))}
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
      </main>
    </div>
  );
}
