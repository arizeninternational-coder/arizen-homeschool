"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users, BookOpen, GraduationCap, Award, Settings, BarChart3,
  Shield, LogOut, TrendingUp, Layers, ShoppingBag, Bell, Menu, X
} from "lucide-react";
import { colors, gradients, shadows } from "@/lib/design-system";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
      } catch {
        window.location.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const navItems = [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard/admin", desc: "Overview & analytics" },
    { icon: Users, label: "Users", href: "/dashboard/admin/users", desc: "Manage all users" },
    { icon: GraduationCap, label: "Learners", href: "/dashboard/admin/learners", desc: "Student profiles" },
    { icon: GraduationCap, label: "Grades", href: "/dashboard/admin/grades", desc: "Grade levels & subjects" },
    { icon: Layers, label: "Quests", href: "/dashboard/admin/quests", desc: "Quest management" },
    { icon: Award, label: "Badges", href: "/dashboard/admin/badges", desc: "Achievement badges" },
    { icon: ShoppingBag, label: "Shop", href: "/dashboard/admin/shop", desc: "Shop items & rewards" },
    { icon: TrendingUp, label: "Reports", href: "/dashboard/admin/reports", desc: "System reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/admin/settings", desc: "App settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard/admin") return pathname === href;
    return pathname.startsWith(href);
  };

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

  const displayName = user.name || user.email || "Admin";
  const firstName = displayName.includes(" ") ? displayName.split(" ")[0] : displayName;

  // Page title from pathname
  const currentPage = navItems.find(i => isActive(i.href));
  const pageTitle = currentPage?.label || "Admin";

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

      <nav style={{ flex: 1, padding: "0 0.75rem" }}>
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} onClick={() => { if (!isDesktop) setDrawerOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.6875rem 0.75rem", borderRadius: 10, marginBottom: "0.25rem",
              textDecoration: "none",
              background: isActive(item.href) ? colors.primarySoft : "transparent",
              color: isActive(item.href) ? colors.primary : colors.textMuted,
              fontWeight: isActive(item.href) ? 700 : 500,
              fontSize: "0.875rem", transition: "all 0.15s",
            }}>
            <item.icon style={{ width: 18, height: 18 }} />
            <div>
              <div>{item.label}</div>
              {isActive(item.href) && <div style={{ fontSize: "0.6875rem", opacity: 0.7, fontWeight: 400 }}>{item.desc}</div>}
            </div>
          </Link>
        ))}
      </nav>

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
      {/* Desktop Sidebar */}
      {isDesktop && (
        <aside className="admin-sidebar" style={{
          width: 260, background: "white", borderRight: `1px solid ${colors.border}`,
          padding: "1.5rem 0", display: "flex", flexDirection: "column",
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40, boxShadow: shadows.sm,
        }}>
          {renderNavContent(false)}
        </aside>
      )}

      {/* Mobile Drawer Overlay */}
      {!isDesktop && drawerOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 45,
          background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)", transition: "opacity 0.25s ease",
        }} onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile Drawer */}
      {!isDesktop && (
        <aside style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 280, maxWidth: "85vw",
          background: "white", borderRight: `1px solid ${colors.border}`, zIndex: 50,
          display: "flex", flexDirection: "column",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: drawerOpen ? shadows.xl : "none",
          WebkitOverflowScrolling: "touch", overflowY: "auto", padding: "1.25rem 0",
        }}>
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
            <button onClick={() => setDrawerOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: `1px solid ${colors.border}`, background: "white", color: colors.textMuted, cursor: "pointer" }} aria-label="Close menu">
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
          {renderNavContent(true)}
        </aside>
      )}

      {/* Main Content */}
      <main style={{ marginLeft: isDesktop ? 260 : 0, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.625rem 1rem",
          background: "rgba(253,253,251,0.92)", backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${colors.border}`, position: "sticky", top: 0, zIndex: 30,
          gap: "0.75rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }}>
            {!isDesktop && (
              <button onClick={() => setDrawerOpen(!drawerOpen)} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 40, height: 40, minWidth: 40, borderRadius: 10,
                border: `1px solid ${colors.border}`, background: "white", color: colors.text, cursor: "pointer", flexShrink: 0,
              }} aria-label="Open menu">
                <Menu style={{ width: 20, height: 20 }} />
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {pageTitle}
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <div style={{ padding: "0.375rem 0.875rem", borderRadius: 20, background: colors.primarySoft, color: colors.primary, fontSize: "0.75rem", fontWeight: 700 }}>ADMIN</div>
            <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: "50%", background: gradients.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            {!isDesktop && (
              <button onClick={handleLogout} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 36, minWidth: 36, borderRadius: 8,
                border: `1px solid ${colors.border}`, background: "rgba(239,68,68,0.05)", color: colors.danger, cursor: "pointer",
              }} aria-label="Sign out">
                <LogOut style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
        </header>

        {/* Mobile notification bell */}
        {!isDesktop && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) { fetch("/api/notifications", { credentials: "include" }).then(r => r.json()).then(d => setNotifications(d.notifications || [])).catch(() => {}); } }}
              style={{ position: "fixed", bottom: 24, right: 24, zIndex: 70, width: 52, height: 52, borderRadius: "50%", background: gradients.primary, color: "white", border: "none", boxShadow: shadows.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Bell style={{ width: 22, height: 22 }} />
            </button>
            {notifOpen && (
              <div ref={notifRef} style={{ position: "fixed", bottom: 84, right: 16, width: 320, maxWidth: "95vw", background: "white", borderRadius: 16, boxShadow: shadows.xl, zIndex: 70, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1rem", borderBottom: `1px solid ${colors.border}`, fontWeight: 700, fontSize: "0.875rem", color: colors.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Notifications</span>
                  <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted }}><X style={{ width: 16, height: 16 }} /></button>
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "2rem 1rem", textAlign: "center", color: colors.textMuted, fontSize: "0.8125rem" }}>No notifications yet ✨</div>
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

        {/* Page Content */}
        <div style={{ padding: isDesktop ? "2rem" : "1.25rem", flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
