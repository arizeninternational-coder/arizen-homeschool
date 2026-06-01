import Link from "next/link";
import React from "react";

/* ═══════════════════════════════════════════════════════════════════
   ARIZEN SCHOOL — Homepage v4
   Compact desktop-first: tight spacing, academic focus, rich dashboard grid
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  page:    "#F7FBF7",
  teal:    "#047A70",
  tealD:   "#005B50",
  tealL:   "#E6F5F1",
  dark:    "#0F172A",
  body:    "#475569",
  muted:   "#64748B",
  white:   "#FFFFFF",
  border:  "#E2E8F0",
  purple:  "#F1ECFF",
  yellow:  "#FFF4D8",
  green:   "#ECFDF5",
  cream:   "#FFFBEB",
  peach:   "#FFF7ED",
  blue:    "#EFF6FF",
};

/* ── Rarity colors for dashboard cards ── */
const R = {
  teal:   { bg: "#ECFDF5", border: "#A7F3D0", accent: "#047A70" },
  blue:   { bg: "#EFF6FF", border: "#BFDBFE", accent: "#2563EB" },
  warm:   { bg: "#FFFBEB", border: "#FDE68A", accent: "#D97706" },
  rose:   { bg: "#FFF1F2", border: "#FECDD3", accent: "#E11D48" },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let isLoggedIn = false;
  let userRole = "LEARNER";
  let userName: string | undefined;

  try {
    const { cookies } = await import("next/headers");
    const { jwtVerify } = await import("jose");
    const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token";
    const token =
      cookieStore.get(cookieName)?.value ||
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value;
    if (token) {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
      if (payload.sub && payload.role) {
        isLoggedIn = true;
        userRole = String(payload.role).toUpperCase();
        userName = payload.name ? String(payload.name) : undefined;
      }
    }
  } catch {}

  if (isLoggedIn) {
    const dash =
      userRole === "ADMIN" ? "/dashboard/admin" :
      userRole === "PARENT" ? "/dashboard/parent" :
      "/dashboard/student";
    const firstName = userName ? userName.split(" ")[0] : "";
    return (
      <div style={{ minHeight: "100vh", background: C.page }}>
        <nav style={{ height: 72, borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.125rem" }}>A</div>
              <span style={{ fontSize: "1.125rem", fontWeight: 900, letterSpacing: "-0.02em", color: C.teal }}>Arizen School</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href={dash} style={{ fontWeight: 700, color: "#374151", textDecoration: "none", fontSize: "0.9375rem" }}>Dashboard</Link>
              <button onClick={async () => { try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {} window.location.href = "/"; }} style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.5rem 1.25rem", borderRadius: 10, border: "none", cursor: "pointer" }}>Sign Out</button>
            </div>
          </div>
        </nav>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "2rem" }}>
          <div style={{ textAlign: "center", background: C.white, borderRadius: 24, border: `1px solid ${C.border}`, padding: "2.5rem 2rem", maxWidth: 420, boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 40, marginBottom: "0.75rem" }}>{"\u2728"}</div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: C.dark, marginBottom: "0.5rem" }}>Welcome back{firstName ? `, ${firstName}` : ""}!</h2>
            <p style={{ color: C.body, marginBottom: "1.5rem", fontSize: "0.875rem" }}>You are signed in. Head to your dashboard to continue.</p>
            <Link href={dash} style={{ display: "inline-block", background: C.teal, color: "#fff", fontWeight: 700, fontSize: "1rem", padding: "0.875rem 2rem", borderRadius: 14, textDecoration: "none" }}>Go to Dashboard {"\u2192"}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", overflow: "hidden", color: C.dark, fontFamily: "'Nunito', system-ui, sans-serif", background: C.page }}>

      {/* Background blobs */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-5%", right: "12%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(4,122,112,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "20%", left: "-3%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,102,0.10) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "25%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)" }} />
      </div>

      {/* Navbar */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <Navbar />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1380, margin: "0 auto", padding: "4rem 2.5rem 2.5rem" }}>
        <div className="hero-grid">

          {/* Left: Hero copy */}
          <div className="hero-copy fade-in-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: C.tealL, borderRadius: 999, padding: "0.45rem 1.1rem", marginBottom: "1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: C.teal }}>
              <span style={{ fontSize: "0.875rem" }}>{"\u2764"}</span> Learning that understands every child
            </div>

            <h1 className="hero-heading" style={{ fontWeight: 900, letterSpacing: "-0.04em", color: C.dark, margin: 0 }}>
              Welcome to emotionally<br />
              <span style={{ color: C.teal }}>intelligent learning</span>
            </h1>

            <p className="hero-subtitle" style={{ lineHeight: 1.65, color: "#475569", margin: "1.25rem 0 0" }}>
              A personalized CBC learning experience that helps your child build confidence, curiosity, emotional awareness, and mastery of core subjects.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.75rem" }}>
              <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: C.teal, color: "#fff", fontWeight: 700, fontSize: "1rem", padding: "0 1.75rem", borderRadius: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(4,122,112,0.2)", height: 52, transition: "all 0.2s" }}>
                Get Started {"\u2192"}
              </Link>
              <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: C.white, color: C.teal, fontWeight: 700, fontSize: "1rem", padding: "0 1.75rem", borderRadius: 14, textDecoration: "none", border: "1.5px solid " + C.teal, height: 52, transition: "all 0.2s" }}>
                Sign In
              </Link>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.5rem" }}>
              {[
                { icon: "\uD83D\uDEE1\uFE0F", text: "Emotionally Safe" },
                { icon: "\uD83D\uDCDA", text: "CBC-Aligned" },
                { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", text: "Parent-Friendly" },
                { icon: "\uD83C\uDFAE", text: "Gamified" },
              ].map((b) => (
                <span key={b.text} className="hero-trust-badge" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.white, border: "1px solid " + C.border, borderRadius: 10, padding: "0.45rem 0.875rem", fontSize: "0.8125rem", fontWeight: 700, color: "#374151", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                  <span style={{ fontSize: "0.9rem" }}>{b.icon}</span> {b.text}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <div className="hero-dashboard-wrapper fade-in">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          VALUE STRIP
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1380, margin: "0 auto", padding: "0 2.5rem 3rem" }}>
        <div className="hero-value-strip" style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 24, padding: "1.5rem 2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
          <div className="hero-value-grid">
            <ValueItem icon="\uD83C\uDF89" color={C.cream} iconColor="#D97706" title="Fun learning style" text="Engaging lessons, stories, and activities kids love." />
            <ValueItem icon="\uD83D\uDEE1\uFE0F" color={C.green} iconColor="#059669" title="Safe environment" text="Built with care to keep kids safe and supported." />
            <ValueItem icon="\uD83D\uDCD6" color={C.blue} iconColor="#2563EB" title="CBC curriculum" text="Aligned with the Competency Based Curriculum." />
            <ValueItem icon="\uD83C\uDF81" color={C.peach} iconColor="#EA580C" title="Free to start" text="Explore lessons, quests, and features at no cost." />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          JOIN SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1380, margin: "0 auto", padding: "0 2.5rem 4rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 className="hero-join-heading" style={{ fontWeight: 900, letterSpacing: "-0.035em", color: C.dark, marginBottom: "0.5rem" }}>
            How would you like to <span style={{ color: C.teal }}>join us</span>?
          </h2>
          <p style={{ color: "#64748B", fontSize: "1rem", maxWidth: 480, margin: "0 auto" }}>
            Choose your path and we will set up the perfect experience.
          </p>
        </div>

        <div className="hero-join-grid">
          <JoinCard icon="\uD83D\uDC69\u200D\uD83D\uDC67" color={C.tealL} title="Parent" text="Create an account, add your child, and follow their progress." href="/auth/register?role=parent" />
          <JoinCard icon="\uD83E\uDDD2\uD83C\uDFFD" color={C.cream} title="Student" text="Start lessons, complete quests, earn coins, and grow your avatar." href="/auth/register?role=learner" />
          <JoinCard icon="\uD83D\uDEE1\uFE0F" color={C.blue} title="Teacher" text="Manage grades, subjects, lessons, badges, and student progress." href="/auth/register" />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid " + C.border, padding: "1.5rem 2.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1rem" }}>A</div>
            <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.teal }}>Arizen School</span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: C.muted }}>{"\u00A9"} {new Date().getFullYear()} Arizen International. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function Navbar() {
  return (
    <nav style={{ height: 72, borderBottom: "1px solid " + C.border, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.125rem" }}>A</div>
          <span style={{ fontSize: "1.125rem", fontWeight: 900, letterSpacing: "-0.02em", color: C.teal }}>Arizen School</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/auth/login" style={{ fontWeight: 700, color: "#374151", textDecoration: "none", fontSize: "0.9375rem" }}>Sign In</Link>
          <Link href="/auth/register" style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.5rem 1.25rem", borderRadius: 10, textDecoration: "none", boxShadow: "0 2px 8px rgba(4,122,112,0.15)" }}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD PREVIEW — compact 3-column grid
   ═══════════════════════════════════════════════════════════════════ */
function DashboardPreview() {
  return (
    <div className="dashboard-preview-card" style={{
      borderRadius: 28,
      border: "1px solid " + C.border,
      background: C.white,
      padding: 24,
      boxShadow: "0 20px 60px rgba(4,122,112,0.08), 0 4px 12px rgba(0,0,0,0.03)",
    }}>
      {/* Greeting row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: C.dark, margin: "0 0 2px 0" }}>Good morning, Alex! {"\uD83D\uDC4B"}</h3>
          <p style={{ color: C.muted, fontSize: "0.8125rem", margin: 0 }}>Ready to learn something amazing today?</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", border: "2px solid #FDE68A" }}>{"\uD83E\uDDD2\uD83C\uDFFD"}</div>
          <div>
            <div style={{ fontSize: "1.125rem", fontWeight: 900, color: C.dark, lineHeight: 1 }}>450</div>
            <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.03em" }}>Spark Coins</div>
          </div>
        </div>
      </div>

      {/* ── 3-column grid ── */}
      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>

        {/* Today's Lesson — spans 2 columns */}
        <div style={{
          gridColumn: "span 2",
          background: R.blue.bg,
          border: `1px solid ${R.blue.border}`,
          borderRadius: 18,
          padding: "14px 16px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 800, color: R.blue.accent, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px 0" }}>
                {"\uD83C\uDFAF"} Today{"\u2019"}s Lesson
              </p>
              <h4 style={{ fontSize: "1.0625rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>Adding Fractions</h4>
              <span style={{ display: "inline-block", background: R.blue.border, borderRadius: 999, padding: "2px 10px", fontSize: "0.625rem", fontWeight: 700, color: "#1D4ED8" }}>Mathematics</span>
              <p style={{ fontSize: "0.75rem", color: C.muted, lineHeight: 1.5, margin: "4px 0 0 0" }}>Add fractions with like and unlike denominators using step-by-step examples.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <button style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.75rem", padding: "0.5rem 1.125rem", borderRadius: 10, border: "none", cursor: "pointer" }}>Continue Lesson {"\u2192"}</button>
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: C.muted }}>12 min</span>
              </div>
            </div>
            {/* Math visual */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: R.blue.border,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              alignSelf: "center",
            }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 800, color: R.blue.accent, lineHeight: 1.3 }}>
                <span>1/2</span><br />+<br /><span>1/4</span>
              </div>
              <div style={{ fontSize: "0.5625rem", fontWeight: 700, color: "#1D4ED8", marginTop: 2 }}>= ?</div>
            </div>
          </div>
        </div>

        {/* Spark Coins — 1 column */}
        <div style={{ background: R.warm.bg, border: `1px solid ${R.warm.border}`, borderRadius: 18, padding: "14px 16px" }}>
          <div style={{ fontSize: "1.25rem", marginBottom: 4 }}>{"\uD83E\uDEE1"}</div>
          <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.8125rem", margin: "0 0 2px 0" }}>Spark Coins</h4>
          <p style={{ fontSize: "0.6875rem", color: C.muted, lineHeight: 1.4, margin: 0 }}>450 earned. Keep learning to unlock more.</p>
          <div style={{ marginTop: 8, fontSize: "1.5rem", fontWeight: 900, color: R.warm.accent }}>450</div>
        </div>

        {/* EQ Check-in — 1 column */}
        <div style={{ background: R.teal.bg, border: `1px solid ${R.teal.border}`, borderRadius: 18, padding: "14px 16px" }}>
          <div style={{ fontSize: "1.25rem", marginBottom: 4 }}>{"\uD83D\uDC9A"}</div>
          <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.8125rem", margin: "0 0 2px 0" }}>EQ Check-in</h4>
          <p style={{ fontSize: "0.6875rem", color: C.muted, lineHeight: 1.4, margin: "0 0 8px 0" }}>How are you feeling before today{"\u2019"}s lesson?</p>
          <button style={{ background: "transparent", border: "1.5px solid " + R.teal.accent + "40", borderRadius: 10, padding: "0.3rem 0.875rem", fontSize: "0.75rem", fontWeight: 700, color: R.teal.accent, cursor: "pointer" }}>Check In</button>
        </div>

        {/* Badges — 1 column */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: "14px 16px" }}>
          <div style={{ fontSize: "1.25rem", marginBottom: 4 }}>{"\uD83C\uDFC6"}</div>
          <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.8125rem", margin: "0 0 2px 0" }}>Badges</h4>
          <p style={{ fontSize: "0.6875rem", color: C.muted, lineHeight: 1.4, margin: "0 0 8px 0" }}>12 badges unlocked</p>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: C.teal, cursor: "pointer" }}>View All {"\u2192"}</span>
        </div>

        {/* Quest Progress — 1 column */}
        <div style={{ background: R.rose.bg, border: `1px solid ${R.rose.border}`, borderRadius: 18, padding: "14px 16px" }}>
          <div style={{ fontSize: "1.25rem", marginBottom: 4 }}>{"\u2694\uFE0F"}</div>
          <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.8125rem", margin: "0 0 4px 0" }}>Quest Progress</h4>
          <p style={{ fontSize: "0.6875rem", color: C.muted, margin: "0 0 6px 0" }}>Complete lessons and quests</p>
          <div style={{ height: 6, borderRadius: 3, background: "#F1F5F9", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "60%", borderRadius: 3, background: R.rose.accent }} />
          </div>
          <p style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted, margin: "3px 0 0 0" }}>6 / 10</p>
        </div>

        {/* Avatar Progress — spans 2 columns */}
        <div style={{
          gridColumn: "span 2",
          background: R.teal.bg,
          border: `1px solid ${R.teal.border}`,
          borderRadius: 18,
          padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Larger avatar circle */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #A7F3D0, #6EE7B7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              flexShrink: 0,
              border: "2.5px solid #6EE7B7",
              position: "relative",
            }}>
              {"\uD83E\uDDD2\uD83C\uDFFD"}
              <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: "0.875rem" }}>{"\u2728"}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.875rem", margin: "0 0 2px 0" }}>Avatar Progress</h4>
              <p style={{ fontSize: "0.6875rem", color: C.muted, margin: "0 0 6px 0" }}>Level 7 {"\u00B7"} Customize your look</p>
              <div style={{ height: 8, borderRadius: 4, background: "#A7F3D0", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "68%", borderRadius: 4, background: "linear-gradient(90deg, #047A70, #34D399)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted }}>680 / 1,000 XP</span>
                <span style={{ fontSize: "0.625rem", fontWeight: 800, color: C.teal }}>320 to go</span>
              </div>
            </div>
            <button style={{
              background: C.white,
              border: "1.5px solid " + C.teal,
              borderRadius: 10,
              padding: "0.4rem 1rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: C.teal,
              cursor: "pointer",
              flexShrink: 0,
            }}>Customize {"\u2192"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ValueItem({ icon, color, iconColor, title, text }: { icon: string; color: string; iconColor: string; title: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 14, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>{icon}</div>
      <div>
        <h3 style={{ fontWeight: 800, color: C.dark, fontSize: "0.875rem", margin: "0 0 2px 0" }}>{title}</h3>
        <p style={{ fontSize: "0.75rem", lineHeight: 1.55, color: C.muted, margin: 0 }}>{text}</p>
      </div>
    </div>
  );
}

function JoinCard({ icon, color, title, text, href }: { icon: string; color: string; title: string; text: string; href: string }) {
  return (
    <Link href={href} className="hero-join-card" style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      borderRadius: 20,
      border: "1px solid " + C.border,
      background: C.white,
      padding: "22px 20px",
      textAlign: "left",
      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      textDecoration: "none",
      color: "inherit",
      minHeight: 110,
      transition: "transform 0.2s, box-shadow 0.2s",
    }}>
      <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 14, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: C.dark, margin: "0 0 3px 0" }}>{title}</h3>
        <p style={{ fontSize: "0.8125rem", lineHeight: 1.5, color: C.muted, margin: 0 }}>{text}</p>
      </div>
      <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "50%", border: "1.5px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.teal, fontSize: "0.875rem" }}>{"\u2192"}</div>
    </Link>
  );
}
