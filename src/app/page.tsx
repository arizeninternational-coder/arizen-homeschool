import Link from "next/link";
import React from "react";

/* ═══════════════════════════════════════════════════════
   ARIZEN SCHOOL — Homepage v2
   Built to spec: warm, premium, child-friendly, emotionally intelligent
   ═══════════════════════════════════════════════════════ */

const C = {
  page: "#F7FBF7",
  teal: "#047A70",
  tealLight: "#E6F5F1",
  dark: "#111827",
  body: "#475569",
  white: "#FFFFFF",
  border: "#E2E8F0",
  purple: "#F1ECFF",
  yellow: "#FFF4D8",
  green: "#EAF8EE",
  coral: "#FFE4E6",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Read session via direct cookie (Vercel-safe, no getServerSession)
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
    const token = cookieStore.get(cookieName)?.value || cookieStore.get("next-auth.session-token")?.value;
    if (token) {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
      if (payload.sub && payload.role) {
        isLoggedIn = true;
        userRole = (payload.role as string).toUpperCase();
        userName = payload.name as string | undefined;
      }
    }
  } catch {}

  if (isLoggedIn) {
    const dash = userRole === "ADMIN" ? "/dashboard/admin" : userRole === "PARENT" ? "/dashboard/parent" : "/dashboard/student";
    return (
      <div style={{ minHeight: "100vh", background: C.page }}>
        <Navbar loggedIn role={userRole} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "2rem" }}>
          <div style={{ textAlign: "center", background: C.white, borderRadius: 32, border: `1px solid ${C.border}`, padding: "3rem 2.5rem", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 48, marginBottom: "1rem" }}>✨</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, marginBottom: "0.5rem" }}>Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}!</h2>
            <p style={{ color: C.body, marginBottom: "2rem", fontSize: "0.9375rem" }}>You're signed in. Head to your dashboard to continue.</p>
            <Link href={dash} style={{ display: "inline-block", background: C.teal, color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.875rem 2rem", borderRadius: 14, textDecoration: "none" }}>Go to Dashboard →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", overflow: "hidden", background: C.page, color: C.dark, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "3.5rem 1.5rem 3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem", alignItems: "center" }} className="hero-grid">
          {/* Left copy */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: C.tealLight, borderRadius: 999, padding: "0.4rem 1.1rem", marginBottom: "1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: C.teal }}>
              <span>♡</span> Learning that understands every child
            </div>

            <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.035em", color: C.dark, marginBottom: "1.25rem" }}>
              Welcome to emotionally{" "}
              <span style={{ color: C.teal }}>intelligent learning</span>
            </h1>

            <p style={{ fontSize: "clamp(0.9375rem, 2vw, 1.0625rem)", lineHeight: 1.75, color: C.body, marginBottom: "2rem", maxWidth: 520 }}>
              A personalized learning experience that helps your child build confidence, curiosity, emotional awareness, and mastery of core subjects.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
              <Link href="/auth/register" style={{ display: "inline-block", background: C.teal, color: "#fff", fontWeight: 700, fontSize: "1rem", padding: "0.875rem 1.75rem", borderRadius: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(4,122,112,0.18)" }}>
                Get Started →
              </Link>
              <Link href="/auth/login" style={{ display: "inline-block", background: C.white, color: C.teal, fontWeight: 700, fontSize: "1rem", padding: "0.875rem 1.75rem", borderRadius: 14, textDecoration: "none", border: `1.5px solid ${C.teal}` }}>
                Sign In
              </Link>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {[
                { icon: "🛡️", text: "Emotionally Safe" },
                { icon: "📚", text: "CBC-Aligned" },
                { icon: "👨‍👩‍👧", text: "Parent-Friendly" },
                { icon: "🎮", text: "Gamified Learning" },
              ].map((b) => (
                <span key={b.text} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "0.35rem 0.875rem", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                  <span>{b.icon}</span> {b.text}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <DashboardPreview />
        </div>
      </section>

      {/* ── Value Strip ── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem 3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", background: C.white, border: `1px solid ${C.border}`, borderRadius: 24, padding: "1.5rem", boxShadow: "0 2px 16px rgba(0,0,0,0.03)" }} className="value-strip">
          <ValueItem icon="🎉" title="Fun learning style">Engaging lessons, stories, and activities kids love.</ValueItem>
          <ValueItem icon="🛡️" title="Safe environment">Built with care to keep kids safe and supported.</ValueItem>
          <ValueItem icon="📖" title="CBC curriculum">Aligned with the Competency Based Curriculum.</ValueItem>
          <ValueItem icon="🎁" title="Free to get started">Explore lessons and features at no cost.</ValueItem>
        </div>
      </section>

      {/* ── Join Section ── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem 4rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.dark, marginBottom: "0.5rem" }}>
          How would you like to <span style={{ color: C.teal }}>join us</span>?
        </h2>
        <p style={{ color: C.body, fontSize: "1rem", marginBottom: "2rem" }}>Choose your path and we'll set up the perfect experience.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }} className="join-grid">
          <JoinCard icon="👩‍👧" title="Parent" text="Create an account, add your child, and follow their progress." href="/auth/register?role=parent" />
          <JoinCard icon="🧒🏽" title="Student" text="Start lessons, complete quests, earn coins, and grow your avatar." href="/auth/register?role=learner" />
          <JoinCard icon="🛡️" title="Admin" text="Manage grades, subjects, lessons, badges, and student progress." href="/auth/register" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.125rem" }}>A</div>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: C.teal }}>Arizen School</span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: C.body }}>© {new Date().getFullYear()} Arizen International. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════ */

function Navbar({ loggedIn, role }: { loggedIn?: boolean; role?: string }) {
  const dashUrl = role === "ADMIN" ? "/dashboard/admin" : role === "PARENT" ? "/dashboard/parent" : "/dashboard/student";

  return (
    <nav style={{ height: 72, borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.25rem" }}>A</div>
          <span style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.02em", color: C.teal }}>Arizen School</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {loggedIn ? (
            <>
              <Link href={dashUrl} style={{ fontWeight: 700, color: "#374151", textDecoration: "none", fontSize: "0.9375rem" }}>Dashboard</Link>
              <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); window.location.href = "/"; }} style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.5rem 1.25rem", borderRadius: 12, border: "none", cursor: "pointer" }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ fontWeight: 700, color: "#374151", textDecoration: "none", fontSize: "0.9375rem" }}>Sign In</Link>
              <Link href="/auth/register" style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.5rem 1.25rem", borderRadius: 12, textDecoration: "none", boxShadow: "0 2px 8px rgba(4,122,112,0.15)" }}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function DashboardPreview() {
  return (
    <div style={{ borderRadius: 28, border: `1px solid ${C.border}`, background: C.white, padding: "1.5rem", boxShadow: "0 8px 40px rgba(4,122,112,0.08), 0 2px 8px rgba(0,0,0,0.03)" }}>
      {/* Greeting row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 900, color: C.dark, marginBottom: "0.25rem" }}>Good morning, Alex! 👋</h3>
          <p style={{ color: C.body, fontSize: "0.875rem" }}>Ready to learn something amazing today?</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", border: "2px solid #FDE047" }}>🧒🏽</div>
          <div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: C.dark }}>450</div>
            <div style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>Spark Coins</div>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
        {/* Today's Lesson — large purple card */}
        <div style={{ background: C.purple, borderRadius: 18, padding: "1.25rem" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#6D28D9" }}>Today's Lesson</p>
          <h4 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, marginTop: "0.5rem" }}>Understanding Feelings</h4>
          <span style={{ display: "inline-block", marginTop: "0.35rem", background: "rgba(255,255,255,0.7)", borderRadius: 999, padding: "0.2rem 0.75rem", fontSize: "0.6875rem", fontWeight: 700, color: "#7C3AED" }}>Life Skills</span>
          <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", lineHeight: 1.55, color: C.body, maxWidth: 340 }}>Learn how to identify and manage your emotions in a healthy way.</p>
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem" }}>
            <button style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.8125rem", padding: "0.625rem 1.25rem", borderRadius: 12, border: "none", cursor: "pointer" }}>Continue Lesson →</button>
            <div style={{ fontSize: "2.75rem" }}>🧘🏽‍♂️</div>
          </div>
        </div>

        {/* EQ Check-in */}
        <MiniCard icon="💚" title="EQ Check-in" text="How are you feeling today?" button="Check In" bg={C.green} />

        {/* Quest Progress */}
        <MiniCard icon="⚔️" title="Quest Progress" text="Complete quests and earn rewards!" progress={6} total={10} />

        {/* Spark Coins */}
        <MiniCard icon="🪙" title="Spark Coins" text="450 coins earned — keep learning to earn more!" bg={C.yellow} />

        {/* Avatar Progress */}
        <div style={{ background: C.green, borderRadius: 18, padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ fontSize: "3.5rem", flexShrink: 0 }}>🧒🏽</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 800, color: C.dark }}>Avatar Progress</h4>
              <p style={{ fontSize: "0.8125rem", color: C.body, marginBottom: "0.5rem" }}>Level 7</p>
              <div style={{ height: 8, borderRadius: 4, background: "#fff", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "68%", borderRadius: 4, background: "linear-gradient(90deg, #047A70, #0D9488)" }} />
              </div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94A3B8", marginTop: "0.35rem" }}>680 / 1000 XP</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <MiniCard icon="🏆" title="Badges Earned" text="12 badges unlocked" button="View All" />
      </div>
    </div>
  );
}

function MiniCard({ icon, title, text, button, bg, progress, total }: {
  icon: string; title: string; text: string; button?: string; bg?: string; progress?: number; total?: number;
}) {
  return (
    <div style={{ borderRadius: 18, border: `1px solid ${C.border}`, background: bg || C.white, padding: "1.125rem" }}>
      <div style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>{icon}</div>
      <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.9375rem" }}>{title}</h4>
      <p style={{ fontSize: "0.8125rem", color: C.body, lineHeight: 1.5, marginTop: "0.25rem" }}>{text}</p>

      {progress !== undefined && total !== undefined && (
        <>
          <div style={{ marginTop: "0.75rem", height: 8, borderRadius: 4, background: "#F1F5F9", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(progress / total) * 100}%`, borderRadius: 4, background: C.teal }} />
          </div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94A3B8", marginTop: "0.35rem" }}>{progress} / {total}</p>
        </>
      )}

      {button && (
        <button style={{ marginTop: "0.75rem", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.35rem 1rem", fontSize: "0.75rem", fontWeight: 700, color: C.teal, cursor: "pointer" }}>{button}</button>
      )}
    </div>
  );
}

function ValueItem({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "1rem", textAlign: "left", alignItems: "flex-start" }}>
      <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: "50%", background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>{icon}</div>
      <div>
        <h3 style={{ fontWeight: 800, color: C.teal, fontSize: "0.9375rem" }}>{title}</h3>
        <p style={{ marginTop: "0.25rem", fontSize: "0.8125rem", lineHeight: 1.6, color: C.body }}>{children}</p>
      </div>
    </div>
  );
}

function JoinCard({ icon, title, text, href }: { icon: string; title: string; text: string; href: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", borderRadius: 24, border: `1px solid ${C.border}`, background: C.white, padding: "1.5rem", textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
      <div style={{ width: 72, height: 72, flexShrink: 0, borderRadius: "50%", background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.25rem" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark }}>{title}</h3>
        <p style={{ marginTop: "0.25rem", fontSize: "0.8125rem", lineHeight: 1.55, color: C.body }}>{text}</p>
      </div>
      <Link href={href} style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%", border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.teal, textDecoration: "none", fontSize: "1.125rem" }}>→</Link>
    </div>
  );
}
