import Link from "next/link";
import React from "react";
import {
  ShieldCheck, BookOpen, UsersRound, Gamepad2,
  Sparkles, Gift, Heart, Trophy, Coins, Target,
  ArrowRight, CheckCircle2, Star, Zap, Flame,
  GraduationCap, BookMarked, Swords
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   ARIZEN SCHOOL — Homepage v5
   Polished desktop-first: lucide icons, rich dashboard, SVG illustrations
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  page: "#F7FBF7", teal: "#047A70", tealD: "#005B50", tealL: "#E6F5F1",
  dark: "#0F172A", body: "#475569", muted: "#64748B",
  white: "#FFFFFF", border: "#E2E8F0",
  lavender: "#EDE9FE", yellow: "#FFF4D8", green: "#ECFDF5",
  cream: "#FFFBEB", peach: "#FFF7ED", blue: "#EFF6FF", rose: "#FFF1F2",
};

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
    const dash = userRole === "ADMIN" ? "/dashboard/admin" : userRole === "PARENT" ? "/dashboard/parent" : "/dashboard/student";
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
            <div style={{ fontSize: 40, marginBottom: "0.75rem" }}>✨</div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: C.dark, marginBottom: "0.5rem" }}>Welcome back{firstName ? `, ${firstName}` : ""}!</h2>
            <p style={{ color: C.body, marginBottom: "1.5rem", fontSize: "0.875rem" }}>You are signed in. Head to your dashboard to continue.</p>
            <Link href={dash} style={{ display: "inline-block", background: C.teal, color: "#fff", fontWeight: 700, fontSize: "1rem", padding: "0.875rem 2rem", borderRadius: 14, textDecoration: "none" }}>Go to Dashboard →</Link>
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
              <Heart size={14} /> Learning that understands every child
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
                Get Started <ArrowRight size={16} style={{ marginLeft: 6 }} />
              </Link>
              <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: C.white, color: C.teal, fontWeight: 700, fontSize: "1rem", padding: "0 1.75rem", borderRadius: 14, textDecoration: "none", border: "1.5px solid " + C.teal, height: 52, transition: "all 0.2s" }}>
                Sign In
              </Link>
            </div>

            {/* Trust badges with lucide icons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.5rem" }}>
              {[
                { icon: ShieldCheck, text: "Emotionally Safe", color: "#059669" },
                { icon: BookOpen, text: "CBC-Aligned", color: "#2563EB" },
                { icon: UsersRound, text: "Parent-Friendly", color: "#7C3AED" },
                { icon: Gamepad2, text: "Gamified", color: "#D97706" },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <span key={b.text} className="hero-trust-badge" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.white, border: "1px solid " + C.border, borderRadius: 10, padding: "0.45rem 0.875rem", fontSize: "0.8125rem", fontWeight: 700, color: "#374151", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                    <Icon size={13} style={{ color: b.color }} /> {b.text}
                  </span>
                );
              })}
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
            <ValueItem2 icon={Sparkles} color={C.cream} accent="#D97706" title="Fun learning style" text="Engaging lessons, stories, and activities kids love." />
            <ValueItem2 icon={ShieldCheck} color={C.green} accent="#059669" title="Safe environment" text="Built with care to keep kids safe and supported." />
            <ValueItem2 icon={BookOpen} color={C.blue} accent="#2563EB" title="CBC curriculum" text="Aligned with the Competency Based Curriculum." />
            <ValueItem2 icon={Gift} color={C.peach} accent="#EA580C" title="Free to start" text="Explore lessons, quests, and features at no cost." />
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
          <JoinCard2 title="Parent" text="Create an account, add your child, and follow their progress." href="/auth/register?role=parent" bg={C.tealL} icon={<UsersRound size={28} style={{ color: C.teal }} />} />
          <JoinCard2 title="Student" text="Start lessons, complete quests, earn coins, and grow your avatar." href="/auth/register?role=learner" bg={C.cream} icon={<GraduationCap size={28} style={{ color: "#D97706" }} />} />
          <JoinCard2 title="Admin" text="Manage grades, subjects, lessons, badges, and student progress." href="/auth/register" bg={C.blue} icon={<ShieldCheck size={28} style={{ color: "#2563EB" }} />} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid " + C.border, padding: "1.5rem 2.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1rem" }}>A</div>
            <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.teal }}>Arizen School</span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: C.muted }}>© {new Date().getFullYear()} Arizen International. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS (all using lucide-react, no emoji)
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

/* ── Dashboard Preview ── */
function DashboardPreview() {
  return (
    <div className="dashboard-preview-card" style={{
      borderRadius: 28, border: "1px solid " + C.border, background: C.white,
      padding: 24, boxShadow: "0 20px 60px rgba(4,122,112,0.08), 0 4px 12px rgba(0,0,0,0.03)",
    }}>
      {/* Greeting */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: C.dark, margin: "0 0 2px 0" }}>Good morning, Learner!</h3>
          <p style={{ color: C.muted, fontSize: "0.8125rem", margin: 0 }}>Ready to learn something amazing today?</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, #FDE68A, #F59E0B)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #FDE68A",
          }}>
            <GraduationCap size={22} style={{ color: "#92400E" }} />
          </div>
          <div>
            <div style={{ fontSize: "1.125rem", fontWeight: 900, color: C.dark, lineHeight: 1 }}>0</div>
            <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "#94A3B8" }}>Coins</div>
          </div>
        </div>
      </div>

      {/* 3-column grid */}
      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>

        {/* Today's Lesson — spans 2 */}
        <div style={{ gridColumn: "span 2", background: R.blue.bg, border: "1px solid " + R.blue.border, borderRadius: 18, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 800, color: R.blue.accent, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px 0" }}>
                <BookMarked size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} /> Today's Lesson
              </p>
              <h4 style={{ fontSize: "1.0625rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>Adding Fractions</h4>
              <span style={{ display: "inline-block", background: R.blue.border, borderRadius: 999, padding: "2px 10px", fontSize: "0.625rem", fontWeight: 700, color: "#1D4ED8" }}>Mathematics</span>
              <p style={{ fontSize: "0.75rem", color: C.muted, lineHeight: 1.5, margin: "4px 0 0 0" }}>Add fractions with like and unlike denominators using step-by-step examples.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <button style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.75rem", padding: "0.5rem 1.125rem", borderRadius: 10, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Continue Lesson <ArrowRight size={12} />
                </button>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.6875rem", fontWeight: 600, color: C.muted }}>
                  <Star size={10} /> 12 min
                </span>
              </div>
            </div>
            {/* Lesson mascot area */}
            <div style={{
              width: 80, height: 80, borderRadius: 16, background: R.blue.border,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "center",
            }}>
              <div style={{ fontSize: "1.5rem" }}>🔢</div>
              <div style={{ fontSize: "0.5625rem", fontWeight: 800, color: R.blue.accent, lineHeight: 1.3, marginTop: 2 }}>½ + ¼ = ?</div>
            </div>
          </div>
        </div>

        {/* Spark Coins */}
        <div style={{ background: R.warm.bg, border: "1px solid " + R.warm.border, borderRadius: 18, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
          <Coins size={18} style={{ color: R.warm.accent, marginBottom: 6 }} />
          <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.8125rem", margin: "0 0 2px 0" }}>Spark Coins</h4>
          <p style={{ fontSize: "0.6875rem", color: C.muted, lineHeight: 1.4, margin: "0 0 6px 0", flex: 1 }}>Earn coins by completing lessons and quests.</p>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: R.warm.accent }}>0</div>
        </div>

        {/* EQ Check-in */}
        <div style={{ background: R.teal.bg, border: "1px solid " + R.teal.border, borderRadius: 18, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
          <Heart size={18} style={{ color: R.teal.accent, marginBottom: 6 }} />
          <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.8125rem", margin: "0 0 2px 0" }}>EQ Check-in</h4>
          <p style={{ fontSize: "0.6875rem", color: C.muted, lineHeight: 1.4, margin: "0 0 8px 0" }}>How are you feeling?</p>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {["😊", "😌", "🤩"].map((m, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem" }}>{m}</div>
            ))}
          </div>
          <button style={{ background: "transparent", border: "1.5px solid " + R.teal.accent + "40", borderRadius: 10, padding: "0.3rem 0.875rem", fontSize: "0.75rem", fontWeight: 700, color: R.teal.accent, cursor: "pointer" }}>Check In</button>
        </div>

        {/* Badges */}
        <div style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 18, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
          <Trophy size={18} style={{ color: "#6D28D9", marginBottom: 6 }} />
          <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.8125rem", margin: "0 0 2px 0" }}>Badges</h4>
          <p style={{ fontSize: "0.6875rem", color: C.muted, lineHeight: 1.4, margin: "0 0 6px 0" }}>12 badges unlocked</p>
          <div style={{ display: "flex", gap: 4 }}>
            {["🏅", "📚", "🔬", "💚"].map((b, i) => (
              <div key={i} style={{ width: 24, height: 24, borderRadius: 6, background: "#F8FAFC", border: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem" }}>{b}</div>
            ))}
          </div>
        </div>

        {/* Quest Progress */}
        <div style={{ background: R.rose.bg, border: "1px solid " + R.rose.border, borderRadius: 18, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
          <Target size={18} style={{ color: R.rose.accent, marginBottom: 6 }} />
          <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.8125rem", margin: "0 0 4px 0" }}>Quest Progress</h4>
          <p style={{ fontSize: "0.6875rem", color: C.muted, margin: "0 0 6px 0", flex: 1 }}>Complete lessons and quests</p>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "60%", borderRadius: 3, background: R.rose.accent }} />
          </div>
          <p style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted, margin: "3px 0 0 0" }}>6 / 10</p>
        </div>

        {/* Avatar Progress — spans 2 */}
        <div style={{ gridColumn: "span 2", background: R.teal.bg, border: "1px solid " + R.teal.border, borderRadius: 18, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #A7F3D0, #6EE7B7)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2.5px solid #6EE7B7", position: "relative",
            }}>
              <GraduationCap size={28} style={{ color: "#065F46" }} />
              <span style={{ position: "absolute", bottom: -2, right: -2, background: C.white, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5625rem", fontWeight: 800, color: C.teal, border: "1.5px solid " + C.teal }}>7</span>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.875rem", margin: "0 0 2px 0" }}>Avatar Progress</h4>
              <p style={{ fontSize: "0.6875rem", color: C.muted, margin: "0 0 6px 0" }}>Level 7 · Customize your look</p>
              <div style={{ height: 8, borderRadius: 4, background: "#A7F3D0", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "68%", borderRadius: 4, background: "linear-gradient(90deg, #047A70, #34D399)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted }}>680 / 1,000 XP</span>
                <span style={{ fontSize: "0.625rem", fontWeight: 800, color: C.teal }}>320 to go</span>
              </div>
            </div>
            <button style={{
              background: C.white, border: "1.5px solid " + C.teal, borderRadius: 10,
              padding: "0.4rem 1rem", fontSize: "0.75rem", fontWeight: 700, color: C.teal, cursor: "pointer", flexShrink: 0,
            }}>Customize →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ValueItem2({ icon: Icon, color, accent, title, text }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 14, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} style={{ color: accent }} />
      </div>
      <div>
        <h3 style={{ fontWeight: 800, color: C.dark, fontSize: "0.875rem", margin: "0 0 2px 0" }}>{title}</h3>
        <p style={{ fontSize: "0.75rem", lineHeight: 1.55, color: C.muted, margin: 0 }}>{text}</p>
      </div>
    </div>
  );
}

function JoinCard2({ title, text, href, bg, icon }) {
  return (
    <Link href={href} className="hero-join-card" style={{
      display: "flex", alignItems: "center", gap: 16, borderRadius: 20,
      border: "1px solid " + C.border, background: C.white, padding: "22px 20px",
      textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      textDecoration: "none", color: "inherit", minHeight: 110, transition: "transform 0.2s, box-shadow 0.2s",
    }}>
      <div style={{
        width: 56, height: 56, flexShrink: 0, borderRadius: 14, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: C.dark, margin: "0 0 3px 0" }}>{title}</h3>
        <p style={{ fontSize: "0.8125rem", lineHeight: 1.5, color: C.muted, margin: 0 }}>{text}</p>
      </div>
      <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "50%", border: "1.5px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ArrowRight size={14} style={{ color: C.teal }} />
      </div>
    </Link>
  );
}
