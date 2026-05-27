"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  LogOut,
  ChevronRight,
  Flower2,
  ShieldCheck,
  Flame,
  Award,
  Loader2,
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { ds, colors, gradients, shadows } from "@/lib/design-system";

interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  guildId: string;
}

interface ChildProfile {
  id: string;
  name: string;
  grade: number;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  currentStreak: number;
  lastActivityDate: string | null;
  progressSummary: string;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/parent", active: true },
  { label: "My Children", icon: Users, href: "/dashboard/parent/children", active: false },
  { label: "Progress", icon: TrendingUp, href: "/dashboard/parent/progress", active: false },
  { label: "Lessons", icon: BookOpen, href: "/dashboard/parent/lessons", active: false },
  { label: "Reports", icon: ClipboardList, href: "/dashboard/parent/reports", active: false },
  { label: "Settings", icon: Settings, href: "/dashboard/parent/settings", active: false },
];

// Placeholder children data — will be replaced with Supabase query
const placeholderChildren: ChildProfile[] = [
  {
    id: "child-1",
    name: "Emma Johnson",
    grade: 3,
    displayName: "Emma",
    avatarUrl: null,
    totalXp: 1250,
    currentStreak: 7,
    lastActivityDate: "2026-05-26",
    progressSummary: "Completed 4 lessons this week. Excelling in Environmental Science.",
  },
  {
    id: "child-2",
    name: "Liam Johnson",
    grade: 5,
    displayName: "Liam",
    avatarUrl: null,
    totalXp: 980,
    currentStreak: 3,
    lastActivityDate: "2026-027",
    progressSummary: "Working on Grade 5 Mathematics. Needs support with fractions.",
  },
];

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (!data?.user) {
          window.location.replace("/auth/login");
          return;
        }

        if (data.user.role !== "PARENT") {
          // Redirect non-parents to their appropriate dashboard
          if (data.user.role === "ADMIN") {
            window.location.replace("/dashboard/admin");
          } else {
            window.location.replace("/dashboard/student");
          }
          return;
        }

        setUser(data.user);

        // TODO: Query Supabase for linked children
        // For now, use placeholder data
        // const { data: linkedChildren } = await supabase
        //   .from("User")
        //   .select(`
        //     id, name, role,
        //     learnerProfile:LearnerProfile(grade, displayName, avatarUrl, totalXp, currentStreak, lastActivityDate)
        //   `)
        //   .eq("guildId", data.user.guildId)
        //   .eq("role", "LEARNER");
        setChildren(placeholderChildren);
        setLoading(false);
      } catch (err) {
        console.error("[PARENT_DASHBOARD] Auth check failed:", err);
        setError("Failed to verify authentication. Please try again.");
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  async function handleLogout() {
    try {
      // Call NextAuth signout
      window.location.replace("/api/auth/signout?callbackUrl=/auth/login");
    } catch {
      window.location.replace("/auth/login");
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: colors.bg,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              ...ds.logoMark,
              width: "64px",
              height: "64px",
              margin: "0 auto 1.5rem",
            }}
          >
            <Loader2
              style={{ width: "32px", height: "32px" }}
              className="spinner"
            />
          </div>
          <p style={{ ...ds.textBody, color: colors.textMuted }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: colors.bg,
        }}
      >
        <div style={{ ...ds.card, maxWidth: "420px", textAlign: "center" }}>
          <AlertCircle
            style={{ width: "48px", height: "48px", color: colors.danger, margin: "0 auto 1rem" }}
          />
          <h2 style={{ ...ds.headingMd, marginBottom: "0.75rem" }}>
            Something went wrong
          </h2>
          <p style={{ ...ds.textBody, marginBottom: "1.5rem" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={ds.btnPrimary}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const displayName = user?.name || "Parent";
  const greeting = getGreeting();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: colors.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Orbs */}
      <div
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
        aria-hidden="true"
      >
        <div
          style={{
            ...ds.orb(colors.primarySoft, "30rem"),
            top: "-10rem",
            right: "-8rem",
            opacity: 0.3,
          }}
          className="float-slow"
        />
        <div
          style={{
            ...ds.orb(colors.accentSoft, "24rem"),
            bottom: "-8rem",
            left: "-6rem",
            opacity: 0.2,
          }}
          className="float-medium"
        />
        <div
          style={{
            ...ds.orb(colors.warmSoft, "18rem"),
            top: "50%",
            right: "5%",
            opacity: 0.15,
          }}
          className="float-fast"
        />
      </div>

      {/* Top Navigation Bar */}
      <header style={{ ...ds.nav, zIndex: 50 }}>
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ ...ds.logoMark, width: "36px", height: "36px" }}>
              <Flower2 style={{ width: "20px", height: "20px" }} />
            </div>
            <span
              style={{
                fontSize: "1.125rem",
                fontWeight: 900,
                ...ds.textGradient,
              }}
            >
              Arizen School
            </span>
          </div>

          {/* Nav Links (Desktop) */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
            className="desktop-nav"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={item.active ? "nav-item-active" : "nav-item"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  ...(item.active
                    ? {
                        background: colors.primarySoft,
                        color: colors.primaryDark,
                      }
                    : {
                        color: colors.textMuted,
                        background: "transparent",
                      }),
                }}
              >
                <item.icon style={{ width: "15px", height: "15px" }} />
                {item.label}
              </a>
            ))}
          </nav>

          {/* User & Logout */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.375rem 0.875rem",
                borderRadius: "0.75rem",
                background: colors.bgSoft,
                border: `1px solid ${colors.borderLight}`,
              }}
            >
              <ShieldCheck
                style={{ width: "14px", height: "14px", color: colors.primary }}
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: colors.text,
                }}
              >
                {displayName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="logout-btn"
              style={{
                ...ds.btnGhost,
                color: colors.textMuted,
                padding: "0.5rem",
                borderRadius: "0.75rem",
              }}
              title="Sign out"
            >
              <LogOut style={{ width: "18px", height: "18px" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          position: "relative",
          zIndex: 1,
          paddingTop: "64px",
        }}
      >
        <div
          style={{
            ...ds.containerBase,
            paddingTop: "2.5rem",
            paddingBottom: "4rem",
          }}
        >
          {/* Welcome Section */}
          <div
            className="fade-in-up"
            style={{
              marginBottom: "2.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <Heart
                style={{ width: "20px", height: "20px", color: colors.accent }}
              />
              <span style={ds.textTagline}>Parent Dashboard</span>
            </div>
            <h1
              style={{
                ...ds.headingHero,
                marginBottom: "0.75rem",
              }}
            >
              {greeting},{" "}
              <span style={ds.textGradient}>{displayName.split(" ")[0]}</span>
              <span role="img" aria-label="wave">
                {" "}
                👋
              </span>
            </h1>
            <p
              style={{
                ...ds.textBodyLg,
                maxWidth: "560px",
              }}
            >
              Welcome to your family's learning hub. Track your children's
              progress, explore lessons, and celebrate their achievements — all
              in one place.
            </p>
          </div>

          {/* Quick Stats Row */}
          <div
            className="fade-in-up"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "2.5rem",
              animationDelay: "0.1s",
            }}
          >
            <QuickStatCard
              icon={Users}
              label="Children"
              value={children.length.toString()}
              color={colors.primary}
              bgColor={colors.primarySoft}
            />
            <QuickStatCard
              icon={Flame}
              label="Active Streaks"
              value={children
                .filter((c) => c.currentStreak > 0)
                .length.toString()}
              color={colors.warm}
              bgColor={colors.warmSoft}
            />
            <QuickStatCard
              icon={Award}
              label="Total XP"
              value={children
                .reduce((sum, c) => sum + c.totalXp, 0)
                .toLocaleString()}
              color={colors.accent}
              bgColor={colors.accentSoft}
            />
            <QuickStatCard
              icon={BookOpen}
              label="Lessons Done"
              value="12"
              color={colors.info}
              bgColor={colors.bgBlue}
            />
          </div>

          {/* Children Section */}
          <div
            className="fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                }}
              >
                <Users
                  style={{ width: "22px", height: "22px", color: colors.primary }}
                />
                <h2 style={ds.headingMd}>My Children</h2>
              </div>
              <a
                href="/dashboard/parent/children"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: colors.primary,
                  textDecoration: "none",
                  transition: "gap 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.gap = "0.55rem")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.gap = "0.35rem")
                }
              >
                View All <ChevronRight style={{ width: "14px", height: "14px" }} />
              </a>
            </div>

            {children.length === 0 ? (
              <div
                style={{
                  ...ds.card,
                  textAlign: "center",
                  padding: "3rem 2rem",
                }}
              >
                <div
                  style={{
                    ...ds.logoMark,
                    width: "56px",
                    height: "56px",
                    margin: "0 auto 1.25rem",
                    background: colors.bgSoft,
                  }}
                >
                  <Users
                    style={{ width: "28px", height: "28px", color: colors.textMuted }}
                  />
                </div>
                <h3
                  style={{
                    ...ds.headingSm,
                    marginBottom: "0.5rem",
                  }}
                >
                  No children linked yet
                </h3>
                <p
                  style={{
                    ...ds.textBody,
                    maxWidth: "360px",
                    margin: "0 auto 1.5rem",
                  }}
                >
                  Link your children's accounts to start tracking their learning
                  progress and achievements.
                </p>
                <button style={ds.btnPrimary}>
                  <Users style={{ width: "16px", height: "16px" }} />
                  Link a Child
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                {children.map((child, index) => (
                  <ChildCard key={child.id} child={child} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className="fade-in-up"
            style={{
              marginTop: "2.5rem",
              animationDelay: "0.3s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                marginBottom: "1.5rem",
              }}
            >
              <TrendingUp
                style={{ width: "22px", height: "22px", color: colors.accent }}
              />
              <h2 style={ds.headingMd}>Quick Actions</h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "1rem",
              }}
            >
              <QuickActionCard
                icon={BookOpen}
                title="Browse Lessons"
                description="Explore available lessons and learning materials"
                href="/dashboard/parent/lessons"
                gradient={gradients.sky}
              />
              <QuickActionCard
                icon={TrendingUp}
                title="View Progress"
                description="See detailed progress reports for each child"
                href="/dashboard/parent/progress"
                gradient={gradients.primarySoft}
              />
              <QuickActionCard
                icon={ClipboardList}
                title="Generate Report"
                description="Create a learning summary report"
                href="/dashboard/parent/reports"
                gradient={gradients.sunset}
              />
              <QuickActionCard
                icon={Settings}
                title="Account Settings"
                description="Manage your family account and preferences"
                href="/dashboard/parent/settings"
                gradient={gradients.card}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: `1px solid ${colors.borderLight}`,
          padding: "1.5rem 0",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.8125rem",
            color: colors.textMuted,
            fontWeight: 600,
          }}
        >
          © 2026 Arizen School — Empowering families through personalized
          learning 🌿
        </p>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function QuickStatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      style={{
        ...ds.card,
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
      className="feature-card-hover"
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bgColor,
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: "20px", height: "20px", color }} />
      </div>
      <div>
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 900,
            color: colors.textHeading,
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function ChildCard({
  child,
  index,
}: {
  child: ChildProfile;
  index: number;
}) {
  const gradeLabel = getGradeLabel(child.grade);
  const initials = child.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <a
      href={`/dashboard/parent/children/${child.id}`}
      className="fade-in-up"
      style={{
        ...ds.cardInteractive,
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        animationDelay: `${0.1 * index}s`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = shadows.lg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = shadows.md;
      }}
    >
      {/* Header: Avatar + Name + Grade */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "1rem",
            background: gradients.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "1.125rem",
            fontWeight: 900,
            flexShrink: 0,
            boxShadow: shadows.primary,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "1.0625rem",
              fontWeight: 800,
              color: colors.textHeading,
              marginBottom: "0.125rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {child.displayName}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.2rem 0.625rem",
              borderRadius: "0.5rem",
              background: colors.primarySoft,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: colors.primaryDark,
            }}
          >
            {gradeLabel}
          </div>
        </div>
        <ChevronRight
          style={{ width: "18px", height: "18px", color: colors.textMuted, flexShrink: 0 }}
        />
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          padding: "0.875rem 1rem",
          borderRadius: "1rem",
          background: colors.bgSoft,
        }}
      >
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontSize: "1.125rem",
              fontWeight: 900,
              color: colors.primary,
            }}
          >
            {child.totalXp.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: colors.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            XP
          </div>
        </div>
        <div
          style={{
            width: "1px",
            background: colors.border,
          }}
        />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "1.125rem",
              fontWeight: 900,
              color: colors.warm,
            }}
          >
            {child.currentStreak}
            <Flame style={{ width: "14px", height: "14px" }} />
          </div>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: colors.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Streak
          </div>
        </div>
        <div
          style={{
            width: "1px",
            background: colors.border,
          }}
        />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontSize: "1.125rem",
              fontWeight: 900,
              color: colors.accent,
            }}
          >
            {child.lastActivityDate
              ? formatRelativeDate(child.lastActivityDate)
              : "—"}
          </div>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: colors.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Last Active
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <p
        style={{
          fontSize: "0.8125rem",
          lineHeight: 1.6,
          color: colors.textMuted,
          fontWeight: 500,
          margin: 0,
        }}
      >
        {child.progressSummary}
      </p>
    </a>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  gradient,
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  description: string;
  href: string;
  gradient: string;
}) {
  return (
    <a
      href={href}
      className="feature-card-hover"
      style={{
        ...ds.card,
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = shadows.lg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = shadows.md;
      }}
    >
      {/* Gradient accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: gradient,
        }}
      />
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "0.875rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: colors.bgSoft,
        }}
      >
        <Icon style={{ width: "18px", height: "18px", color: colors.primary }} />
      </div>
      <div>
        <div
          style={{
            fontSize: "0.9375rem",
            fontWeight: 800,
            color: colors.textHeading,
            marginBottom: "0.25rem",
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: "0.8125rem",
            color: colors.textMuted,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
    </a>
  );
}

/* ── Helpers ── */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getGradeLabel(grade: number): string {
  const suffixes: Record<number, string> = {
    1: "st",
    2: "nd",
    3: "rd",
  };
  const suffix = suffixes[grade] || "th";
  return `Grade ${grade}${suffix}`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
