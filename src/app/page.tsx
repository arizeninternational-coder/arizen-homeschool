import Link from "next/link";
import React from "react";

/* ═══════════════════════════════════════════════════════════════════
   ARIZEN SCHOOL — Homepage v3
   Desktop-first premium landing: strong hero left, rich dashboard right
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  page:    "#F7FBF7",
  teal:    "#047A70",
  tealL:   "#E6F5F1",
  dark:    "#111827",
  body:    "#475569",
  white:   "#FFFFFF",
  border:  "#E2E8F0",
  purple:  "#F1ECFF",
  yellow:  "#FFF4D8",
  green:   "#EAF8EE",
  coral:   "#FFE4E6",
  mint:    "#D1FAE5",
  lavender:"#EDE9FE",
  peach:   "#FFF7ED",
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
  } catch {
    // silently fail
  }

  if (isLoggedIn) {
    const dash =
      userRole === "ADMIN" ? "/dashboard/admin" :
      userRole === "PARENT" ? "/dashboard/parent" :
      "/dashboard/student";
    const firstName = userName ? userName.split(" ")[0] : "";
    return (
      <div style={{ minHeight: "100vh", background: C.page }}>
        <nav style={{ height: 72, borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.25rem" }}>A</div>
              <span style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.02em", color: C.teal }}>Arizen School</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link href={dash} style={{ fontWeight: 700, color: "#374151", textDecoration: "none", fontSize: "0.9375rem" }}>Dashboard</Link>
              <button onClick={async () => { try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {} window.location.href = "/"; }} style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.5rem 1.25rem", borderRadius: 12, border: "none", cursor: "pointer" }}>Sign Out</button>
            </div>
          </div>
        </nav>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "2rem" }}>
          <div style={{ textAlign: "center", background: C.white, borderRadius: 32, border: `1px solid ${C.border}`, padding: "3rem 2.5rem", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 48, marginBottom: "1rem" }}>✨</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, marginBottom: "0.5rem" }}>Welcome back{firstName ? `, ${firstName}` : ""}!</h2>
            <p style={{ color: C.body, marginBottom: "2rem", fontSize: "0.9375rem" }}>You are signed in. Head to your dashboard to continue.</p>
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
        <div style={{ position: "absolute", top: "-8%", right: "10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(4,122,112,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,102,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)" }} />
      </div>

      {/* Navbar */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <Navbar />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", padding: "3.5rem 1.5rem 4rem" }}>
        <div className="hero-grid">

          {/* Left: Hero copy */}
          <div className="hero-copy fade-in-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: C.tealL, borderRadius: 999, padding: "0.5rem 1.25rem", marginBottom: "2rem", fontSize: "0.875rem", fontWeight: 700, color: C.teal }}>
              <span style={{ fontSize: "1rem" }}>{"\u2764"}</span> Learning that understands every child
            </div>

            <h1 className="hero-heading" style={{ fontWeight: 900, letterSpacing: "-0.04em", color: C.dark, margin: 0 }}>
              Welcome to emotionally<br />
              <span style={{ color: C.teal }}>intelligent learning</span>
            </h1>

            <p className="hero-subtitle" style={{ lineHeight: 1.75, color: "#475569", margin: "1.5rem 0 0" }}>
              A personalized learning experience that helps your child build confidence, curiosity, emotional awareness, and mastery of core subjects {"\u2014"} all in a safe, warm, and joyful environment.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "2.25rem" }}>
              <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: C.teal, color: "#fff", fontWeight: 700, fontSize: "1.0625rem", padding: "0 2rem", borderRadius: 14, textDecoration: "none", boxShadow: "0 4px 20px rgba(4,122,112,0.22)", height: 56, transition: "all 0.2s" }}>
                Get Started {"\u2192"}
              </Link>
              <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: C.white, color: C.teal, fontWeight: 700, fontSize: "1.0625rem", padding: "0 2rem", borderRadius: 14, textDecoration: "none", border: "1.5px solid " + C.teal, height: 56, transition: "all 0.2s" }}>
                Sign In
              </Link>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", marginTop: "2rem" }}>
              {[
                { icon: "\uD83D\uDEE1\uFE0F", text: "Emotionally Safe" },
                { icon: "\uD83D\uDCDA", text: "CBC-Aligned" },
                { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", text: "Parent-Friendly" },
                { icon: "\uD83C\uDFAE", text: "Gamified Learning" },
              ].map((b) => (
                <span key={b.text} className="hero-trust-badge" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: C.white, border: "1px solid " + C.border, borderRadius: 12, padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 700, color: "#374151", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <span style={{ fontSize: "1.05rem" }}>{b.icon}</span> {b.text}
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
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", padding: "0 1.5rem 4.5rem" }}>
        <div className="hero-value-strip" style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 28, padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.03)" }}>
          <div className="hero-value-grid">
            <ValueItem icon="\uD83C\uDF89" color={C.yellow} title="Fun learning style" text="Engaging lessons, stories, and activities kids love." />
            <ValueItem icon="\uD83D\uDEE1\uFE0F" color={C.green} title="Safe environment" text="Built with care to keep kids safe and supported every day." />
            <ValueItem icon="\uD83D\uDCD6" color={C.purple} title="CBC curriculum" text="Fully aligned with the Competency Based Curriculum." />
            <ValueItem icon="\uD83C\uDF81" color={C.coral} title="Free to start" text="Explore lessons, quests, and features at no cost." />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          JOIN SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 className="hero-join-heading" style={{ fontWeight: 900, letterSpacing: "-0.035em", color: C.dark, marginBottom: "0.75rem" }}>
            How would you like to <span style={{ color: C.teal }}>join us</span>?
          </h2>
          <p style={{ color: "#475569", fontSize: "1.0625rem", maxWidth: 520, margin: "0 auto" }}>
            Choose your path and we will set up the perfect experience for you and your family.
          </p>
        </div>

        <div className="hero-join-grid">
          <JoinCard icon={"\uD83D\uDC69\u200D\uD83D\uDC67"} color={C.tealL} title="Parent" text="Create an account, add your child, and follow their progress every step of the way." href="/auth/register?role=parent" />
          <JoinCard icon={"\uD83E\uDDD2\uD83C\uDFFD"} color={C.yellow} title="Student" text="Start lessons, complete quests, earn Spark Coins, and grow your avatar." href="/auth/register?role=learner" />
          <JoinCard icon={"\uD83D\uDEE1\uFE0F"} color={C.lavender} title="Admin" text="Manage grades, subjects, lessons, badges, and student progress at scale." href="/auth/register" />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid " + C.border, padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.125rem" }}>A</div>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: C.teal }}>Arizen School</span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: C.body }}>{"\u00A9"} {new Date().getFullYear()} Arizen International. All rights reserved.</p>
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
    <nav style={{ height: 76, borderBottom: "1px solid " + C.border, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.25rem" }}>A</div>
          <span style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.02em", color: C.teal }}>Arizen School</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/auth/login" style={{ fontWeight: 700, color: "#374151", textDecoration: "none", fontSize: "0.9375rem" }}>Sign In</Link>
          <Link href="/auth/register" style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.5625rem 1.25rem", borderRadius: 12, textDecoration: "none", boxShadow: "0 2px 8px rgba(4,122,112,0.15)" }}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD PREVIEW
   ═══════════════════════════════════════════════════════════════════ */
function DashboardPreview() {
  return (
    <div className="dashboard-preview-card" style={{
      borderRadius: 32,
      border: "1px solid " + C.border,
      background: C.white,
      padding: 28,
      boxShadow: "0 24px 80px rgba(4,122,112,0.10), 0 4px 16px rgba(0,0,0,0.04)",
    }}>
      {/* Greeting row */}
      <div className="dash-greeting-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: C.dark, margin: "0 0 4px 0" }}>Good morning, Alex! {"\uD83D\uDC4B"}</h3>
          <p style={{ color: "#64748B", fontSize: "0.875rem", margin: 0 }}>Ready to learn something amazing today?</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", border: "2.5px solid #FDE047" }}>{"\uD83E\uDDD2\uD83C\uDFFD"}</div>
          <div>
            <div style={{ fontSize: "1.25rem", fontWeight: 900, color: C.dark, lineHeight: 1 }}>450</div>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.02em" }}>Spark Coins</div>
          </div>
        </div>
      </div>

      {/* Dashboard card grid */}
      <div className="dash-card-stack">

        {/* Today's Lesson - featured wide card */}
        <div className="dash-today-lesson" style={{ background: "#EDE9FE", borderRadius: 20, padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px 0" }}>{"\uD83C\uDFAF"} Today{"\u2019"}s Lesson</p>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>Understanding Feelings</h4>
              <span style={{ display: "inline-block", background: "rgba(124,58,237,0.1)", borderRadius: 999, padding: "2px 12px", fontSize: "0.6875rem", fontWeight: 700, color: "#7C3AED", marginBottom: "8px" }}>Life Skills</span>
              <p style={{ fontSize: "0.875rem", color: "#64748B", lineHeight: 1.55, margin: "4px 0 0 0" }}>Learn how to identify and manage your emotions in a healthy, fun way.</p>
            </div>
            <div style={{ fontSize: "3.5rem", flexShrink: 0, alignSelf: "center" }}>{"\uD83E\uDDD8\uD83C\uDFFD\u200D\u2642\uFE0F"}</div>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.8125rem", padding: "0.625rem 1.5rem", borderRadius: 12, border: "none", cursor: "pointer" }}>Continue Lesson {"\u2192"}</button>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94A3B8" }}>12 min</span>
          </div>
        </div>

        {/* Row of two small cards */}
        <div className="dash-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <SmallCard bg={C.green} accentColor="#059669" icon={"\uD83D\uDC9A"} title="EQ Check-in" text="How are you feeling today?" button="Check In" />
          <SmallCard bg={C.peach} accentColor="#EA580C" icon={"\u2694\uFE0F"} title="Quest Progress" text="Complete quests, earn rewards!" progress={6} total={10} />
        </div>

        {/* Row of two more */}
        <div className="dash-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <SmallCard bg={C.yellow} accentColor="#D97706" icon={"\uD83E\uDEE1"} title="Spark Coins" text="450 earned - keep learning!" />
          <SmallCard bg={C.white} accentColor="#047A70" icon={"\uD83C\uDFC6"} title="Badges" text="12 badges unlocked" button="View All" />
        </div>

        {/* Avatar Progress - full width */}
        <div className="dash-avatar-card" style={{ background: "#ECFDF5", borderRadius: 20, padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ fontSize: "3.5rem", flexShrink: 0 }}>{"\uD83E\uDDD2\uD83C\uDFFD"}</div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.9375rem", margin: "0 0 2px 0" }}>Avatar Progress</h4>
              <p style={{ fontSize: "0.75rem", color: "#64748B", margin: "0 0 8px 0" }}>Level 7 - Customize your look!</p>
              <div style={{ height: 10, borderRadius: 5, background: "#D1FAE5", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "68%", borderRadius: 5, background: "linear-gradient(90deg, #047A70, #34D399)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94A3B8" }}>680 / 1,000 XP</span>
                <span style={{ fontSize: "0.6875rem", fontWeight: 800, color: C.teal }}>320 to go</span>
              </div>
            </div>
            <button style={{ background: "white", border: "1.5px solid " + C.teal, borderRadius: 12, padding: "0.5rem 1.125rem", fontSize: "0.75rem", fontWeight: 700, color: C.teal, cursor: "pointer", flexShrink: 0 }}>Customize {"\u2192"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallCard({ bg, accentColor, icon, title, text, button, progress, total }: {
  bg: string; accentColor: string; icon: string; title: string; text: string; button?: string; progress?: number; total?: number;
}) {
  return (
    <div style={{ borderRadius: 18, background: bg, border: "1px solid " + (bg === C.white ? C.border : "transparent"), padding: "1.125rem" }}>
      <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{icon}</div>
      <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.875rem", margin: "0 0 2px 0" }}>{title}</h4>
      <p style={{ fontSize: "0.75rem", color: "#64748B", lineHeight: 1.5, margin: "2px 0 0 0" }}>{text}</p>
      {progress !== undefined && total !== undefined && (
        <>
          <div style={{ marginTop: "10px", height: 8, borderRadius: 4, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: (progress / total * 100) + "%", borderRadius: 4, background: accentColor }} />
          </div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94A3B8", margin: "4px 0 0 0" }}>{progress} / {total}</p>
        </>
      )}
      {button && !progress && (
        <button style={{ marginTop: "10px", background: "transparent", border: "1.5px solid " + accentColor + "33", borderRadius: 10, padding: "0.3rem 1rem", fontSize: "0.75rem", fontWeight: 700, color: accentColor, cursor: "pointer" }}>{button}</button>
      )}
    </div>
  );
}

function ValueItem({ icon, color, title, text }: { icon: string; color: string; title: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 16, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>{icon}</div>
      <div>
        <h3 style={{ fontWeight: 800, color: C.dark, fontSize: "0.9375rem", margin: "0 0 4px 0" }}>{title}</h3>
        <p style={{ fontSize: "0.8125rem", lineHeight: 1.6, color: "#64748B", margin: 0 }}>{text}</p>
      </div>
    </div>
  );
}

function JoinCard({ icon, color, title, text, href }: { icon: string; color: string; title: string; text: string; href: string }) {
  return (
    <Link href={href} className="hero-join-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem", borderRadius: 24, border: "1px solid " + C.border, background: C.white, padding: "1.5rem", textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,0.02)", textDecoration: "none", color: "inherit", minHeight: 120, transition: "transform 0.25s, box-shadow 0.25s" }}>
      <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 16, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>{title}</h3>
        <p style={{ fontSize: "0.8125rem", lineHeight: 1.55, color: "#64748B", margin: 0 }}>{text}</p>
      </div>
      <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: "50%", border: "1.5px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.teal, fontSize: "1rem" }}>{"\u2192"}</div>
    </Link>
  );
}
