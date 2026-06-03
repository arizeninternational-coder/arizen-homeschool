import Link from "next/link";
import {
  ShieldCheck, BookOpen, UsersRound, Gamepad2,
  Heart, Coins, Trophy, Target, ArrowRight,
  GraduationCap, CheckCircle2, Sparkles, LayoutDashboard,
  Star, Swords, Zap, Gift, Flame, Eye, SmilePlus,
  Award, Clock, TrendingUp
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   ARIZEN SCHOOL — Landing Page v7.0
   Premium floating cards • Soft gradients • No harsh lines
   ═══════════════════════════════════════════════════════════════════ */

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
      <div className="min-h-screen bg-bg-main">
        <nav className="h-[68px] border-b border-border-soft/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-[1280px] mx-auto px-8 flex items-center justify-between h-full">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-black text-lg">A</div>
              <span className="text-lg font-black tracking-tight text-primary">Arizen School</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href={dash} className="font-bold text-gray-700 no-underline text-sm">Dashboard</Link>
              <button onClick={async () => { try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {} window.location.href = "/"; }} className="bg-primary text-white font-bold text-sm py-2 px-5 rounded-lg cursor-pointer border-none">Sign Out</button>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[70vh] p-8">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl border border-white/60 p-10 max-w-[420px] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="text-4xl mb-3 flex justify-center"><Sparkles className="text-gold w-10 h-10" /></div>
            <h2 className="text-xl font-extrabold text-text mb-2">Welcome back{firstName ? `, ${firstName}` : ""}!</h2>
            <p className="text-text-muted mb-6 text-sm">You are signed in. Head to your dashboard to continue.</p>
            <Link href={dash} className="inline-block bg-primary text-white font-bold text-base py-3 px-8 rounded-xl no-underline shadow-pill">Go to Dashboard <ArrowRight className="inline ml-1 w-4 h-4" /></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-bg-main font-sans">

      {/* ── Background: Warm gradient + floating shapes ── */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Large warm blobs */}
        <div className="absolute -top-[15%] -right-[8%] w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.14)_0%,transparent_60%)]" />
        <div className="absolute top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_60%)]" />
        <div className="absolute bottom-[-5%] right-[15%] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(245,165,36,0.10)_0%,transparent_60%)]" />
        <div className="absolute top-[45%] left-[5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,92,138,0.10)_0%,transparent_60%)]" />
        <div className="absolute top-[70%] right-[40%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,168,132,0.08)_0%,transparent_60%)]" />
        <div className="absolute top-[25%] right-[50%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(59,167,255,0.08)_0%,transparent_60%)]" />

        {/* Floating learning icons (decorative) */}
        <div className="absolute top-[12%] right-[30%] float-slow opacity-[0.08]"><Coins className="w-16 h-16 text-gold" /></div>
        <div className="absolute top-[45%] right-[8%] float-medium opacity-[0.07]"><Trophy className="w-12 h-12 text-accent-purple" /></div>
        <div className="absolute bottom-[20%] left-[5%] float-fast opacity-[0.07]"><Star className="w-10 h-10 text-gold" /></div>
        <div className="absolute top-[70%] right-[45%] float-slow opacity-[0.06]"><BookOpen className="w-14 h-14 text-accent-blue" /></div>
        <div className="absolute top-[25%] left-[20%] float-medium opacity-[0.06]"><Heart className="w-10 h-10 text-pink" /></div>
        <div className="absolute bottom-[35%] right-[15%] float-fast opacity-[0.05]"><Swords className="w-11 h-11 text-primary" /></div>
      </div>

      {/* ── Background overlay ── */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.04),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.04),transparent_35%),linear-gradient(180deg,rgba(247,249,255,0.88)_0%,rgba(247,249,255,0.96)_100%)]" />

      {/* ── Navbar ── */}
      <div className="relative z-10">
        <nav className="h-[68px] bg-white/60 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_1px_0_rgb(var(--color-border-soft),0.5)]">
          <div className="max-w-[1380px] mx-auto px-6 lg:px-10 flex items-center justify-between h-full">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-purple text-white flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(79,70,229,0.25)]">A</div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">Arizen School</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="font-bold text-text no-underline text-sm hidden sm:block hover:text-primary transition-colors">Sign In</Link>
              <Link href="/auth/register" className="bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm py-2.5 px-6 rounded-xl no-underline shadow-pill hover:shadow-glow hover:brightness-110 transition-all duration-200">Get Started</Link>
            </div>
          </div>
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-[1380px] mx-auto px-6 lg:px-10 pt-8 pb-4 lg:pt-12 lg:pb-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">

          {/* ── Left: Hero Copy ── */}
          <div className="flex-1 fade-in-up min-w-0 lg:max-w-[580px]">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-purple-soft to-primary-soft rounded-full py-2 px-4 mb-6 text-xs font-bold text-accent-purple border border-accent-purple/10">
              <Heart className="w-3.5 h-3.5" />
              Learning that understands every child
            </div>

            <h1 className="font-black text-text tracking-tight leading-[1.08] mb-5 text-[2.25rem] sm:text-5xl lg:text-[3.75rem]">
              Where Learning Feels<br />
              <span className="bg-gradient-to-r from-primary via-accent-purple to-pink bg-clip-text text-transparent">Like an Adventure</span>
            </h1>

            <p className="text-text-muted text-base lg:text-lg leading-relaxed max-w-xl">
              A personalized CBC learning experience that builds confidence, curiosity, and emotional mastery — all in a safe, gamified world your child loves and parents trust.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-7">
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold text-base lg:text-lg py-3.5 lg:py-4 px-7 lg:px-8 rounded-2xl no-underline shadow-[0_4px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.35)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm text-primary font-bold text-base lg:text-lg py-3.5 lg:py-4 px-7 lg:px-8 rounded-2xl no-underline shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(79,70,229,0.12)] hover:bg-white transition-all duration-200"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 mt-6">
              <TrustBadge icon={ShieldCheck} text="CBC-Aligned" bg="bg-white/80" color="text-accent-blue" />
              <TrustBadge icon={Heart} text="Emotionally Safe" bg="bg-white/80" color="text-pink" />
              <TrustBadge icon={Eye} text="Parent Visibility" bg="bg-white/80" color="text-accent-purple" />
              <TrustBadge icon={Gamepad2} text="Gamified" bg="bg-white/80" color="text-gold" />
            </div>
          </div>

          {/* ── Right: Rich Dashboard Preview ── */}
          <div className="flex-1 w-full max-w-[640px] lg:max-w-none fade-in" style={{ animationDelay: "0.15s" }}>
            <DashboardPreview />
          </div>
        </div>

        {/* ── Floating Stat Chips below hero ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4 mt-10 lg:mt-14">
          <FloatingStat icon={GraduationCap} value="3K+" label="Active Students" gradient="from-primary-soft to-accent-purple-soft" iconColor="text-primary" delay={0.3} />
          <FloatingStat icon={Target} value="500+" label="Lessons & Quests" gradient="from-secondary-soft to-accent-blue-soft" iconColor="text-secondary" delay={0.4} />
          <FloatingStat icon={Heart} value="98%" label="Parent Satisfaction" gradient="from-pink-soft to-gold-soft" iconColor="text-pink" delay={0.5} />
          <FloatingStat icon={BookOpen} value="12" label="Grade Levels" gradient="from-accent-blue-soft to-primary-soft" iconColor="text-accent-blue" delay={0.6} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          REWARD OBJECTS STRIP
          Floating coins, badges, stars — visual proof of gamification
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-[1380px] mx-auto px-6 lg:px-10 py-6 lg:py-8">
        <div className="flex items-center justify-center gap-3 lg:gap-4 flex-wrap">
          {[
            { icon: Coins, label: "Earn Coins", color: "text-gold", bg: "bg-white/90", shadow: "shadow-[0_2px_16px_rgba(245,165,36,0.10)]" },
            { icon: Trophy, label: "Unlock Badges", color: "text-accent-purple", bg: "bg-white/90", shadow: "shadow-[0_2px_16px_rgba(139,92,246,0.10)]" },
            { icon: GraduationCap, level: true, label: "Level Up", color: "text-primary", bg: "bg-white/90", shadow: "shadow-[0_2px_16px_rgba(79,70,229,0.10)]" },
            { icon: Flame, label: "Build Streaks", color: "text-pink", bg: "bg-white/90", shadow: "shadow-[0_2px_16px_rgba(255,92,138,0.10)]" },
            { icon: Gift, label: "Shop Rewards", color: "text-secondary", bg: "bg-white/90", shadow: "shadow-[0_2px_16px_rgba(0,168,132,0.10)]" },
            { icon: SmilePlus, label: "EQ Check-ins", color: "text-secondary-dark", bg: "bg-white/90", shadow: "shadow-[0_2px_16px_rgba(4,120,87,0.08)]" },
          ].map((item, i) => (
            <div
              key={i}
              className={`inline-flex items-center gap-2.5 ${item.bg} backdrop-blur-sm ${item.shadow} rounded-2xl py-2.5 px-4 lg:px-5 fade-in-up hover:-translate-y-1 transition-all duration-300`}
              style={{ animationDelay: `${0.3 + i * 0.08}s` }}
            >
              <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center ${item.color} ${item.level ? "ring-2 ring-primary/15" : ""} shadow-sm`}>
                <item.icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-text-muted whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-[1380px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
        <div className="text-center mb-10 fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full py-2 px-4 mb-4 text-xs font-bold text-primary shadow-[0_2px_12px_rgba(79,70,229,0.08)]">
            <Star className="w-3.5 h-3.5" />
            Why Arizen School
          </div>
          <h2 className="font-black text-text tracking-tight text-3xl lg:text-4xl mb-3">
            Everything your child needs to{" "}
            <span className="bg-gradient-to-r from-secondary to-secondary-light bg-clip-text text-transparent">thrive</span>
          </h2>
          <p className="text-text-muted text-base lg:text-lg max-w-xl mx-auto">
            Our platform combines emotional intelligence, gamification, and curriculum-aligned learning into one powerful experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          <FeatureCard icon={Heart} title="EQ Check-ins" description="Daily emotional check-ins help students build self-awareness, express feelings, and start each day with confidence." gradient="bg-card-gradient-pink" iconBg="bg-pink/10" iconColor="text-pink" delay={0} />
          <FeatureCard icon={Coins} title="Gamified Rewards" description="Earn Spark Coins, unlock badges, and level up an avatar. Every lesson completed is a step toward mastery." gradient="bg-card-gradient-gold" iconBg="bg-gold/10" iconColor="text-gold" delay={0.1} />
          <FeatureCard icon={LayoutDashboard} title="Parent Dashboard" description="Track your child's progress in real time — from EQ check-ins to lesson completion and XP earned." gradient="bg-card-gradient-purple" iconBg="bg-accent-purple/10" iconColor="text-accent-purple" delay={0.2} />
          <FeatureCard icon={BookOpen} title="CBC-Aligned" description="Full Competency Based Curriculum coverage for all grades, designed by Kenyan educators for Kenyan learners." gradient="bg-card-gradient-green" iconBg="bg-secondary/10" iconColor="text-secondary" delay={0.3} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA BANNER
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-[1380px] mx-auto px-6 lg:px-10 pb-14 lg:pb-20">
        <div className="relative bg-gradient-to-br from-primary via-primary-dark to-accent-purple rounded-[2rem] p-8 lg:p-14 overflow-hidden">
          <div aria-hidden="true" className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/[0.06]" />
          <div aria-hidden="true" className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-white/[0.06]" />
          <div aria-hidden="true" className="absolute top-[40%] left-[40%] w-48 h-48 rounded-full bg-white/[0.04]" />
          <div aria-hidden="true" className="absolute top-[20%] right-[25%] w-32 h-32 rounded-full bg-white/[0.03]" />

          {/* Floating reward decorations */}
          <div aria-hidden="true" className="absolute top-6 right-12 float-slow opacity-20"><Trophy className="w-10 h-10 text-white" /></div>
          <div aria-hidden="true" className="absolute bottom-8 right-[30%] float-medium opacity-15"><Star className="w-8 h-8 text-gold-light" /></div>
          <div aria-hidden="true" className="absolute top-[50%] right-8 float-fast opacity-15"><Coins className="w-7 h-7 text-gold-light" /></div>
          <div aria-hidden="true" className="absolute bottom-12 left-[20%] float-slow opacity-10"><Heart className="w-9 h-9 text-white" /></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="font-black text-white text-2xl lg:text-4xl mb-3 leading-tight">
                Ready to start your child&apos;s<br />learning adventure?
              </h2>
              <p className="text-white/70 text-base lg:text-lg max-w-md">
                Join families across Kenya making learning fun, emotionally safe, and effective.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-primary font-bold text-base lg:text-lg py-3.5 px-8 rounded-2xl no-underline shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/login" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold text-base lg:text-lg py-3.5 px-8 rounded-2xl no-underline border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 bg-white/40 backdrop-blur-sm border-t border-white/60">
        <div className="max-w-[1380px] mx-auto px-6 lg:px-10 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white font-black text-sm">A</div>
              <span className="text-sm font-extrabold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">Arizen School</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-text-muted">
              <Link href="/auth/register" className="no-underline text-text-muted hover:text-primary transition-colors">Get Started</Link>
              <Link href="/auth/login" className="no-underline text-text-muted hover:text-primary transition-colors">Sign In</Link>
            </div>
            <p className="text-xs text-text-muted">&copy; {new Date().getFullYear()} Arizen International. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function TrustBadge({ icon: Icon, text, bg, color }: { icon: React.ComponentType<{ className?: string }>; text: string; bg: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${bg} backdrop-blur-sm rounded-full py-1.5 px-3.5 text-xs font-bold text-text-muted shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      {text}
    </span>
  );
}

function FeatureCard({ icon: Icon, title, description, gradient, iconBg, iconColor, delay }: {
  icon: React.ComponentType<{ className?: string }>; title: string; description: string; gradient: string; iconBg: string; iconColor: string; delay: number;
}) {
  return (
    <div className={`group ${gradient} rounded-[1.5rem] lg:rounded-[2rem] p-6 lg:p-7 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 fade-in-up`} style={{ animationDelay: `${delay}s` }}>
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="font-extrabold text-text text-base lg:text-lg mb-2">{title}</h3>
      <p className="text-text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function FloatingStat({ icon: Icon, value, label, gradient, iconColor, delay }: {
  icon: React.ComponentType<{ className?: string }>; value: string; label: string; gradient: string; iconColor: string; delay: number;
}) {
  return (
    <div
      className={`flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl py-3 px-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 fade-in-up`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center ${iconColor} shadow-sm`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-black text-text text-lg lg:text-xl leading-tight">{value}</div>
        <div className="text-[11px] font-bold text-text-muted">{label}</div>
      </div>
    </div>
  );
}

/* ── Dashboard Preview Mockup — Rich, alive, colorful ── */
function DashboardPreview() {
  return (
    <div className="relative">
      {/* Outer glow layers */}
      <div className="absolute -inset-6 bg-gradient-to-br from-primary/10 via-accent-purple/8 to-secondary/5 rounded-[40px] blur-3xl" />
      <div className="absolute -inset-3 bg-gradient-to-tr from-gold/8 to-pink/5 rounded-[32px] blur-2xl" />

      <div className="relative bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* macOS-style title bar */}
        <div className="bg-bg-main/60 px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-pink/50" />
            <div className="w-3 h-3 rounded-full bg-gold/50" />
            <div className="w-3 h-3 rounded-full bg-secondary/50" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-28 h-2 rounded-full bg-border-soft/60" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-border-soft/60" />
            <div className="w-3 h-3 rounded-full bg-border-soft/60" />
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="hidden sm:flex flex-col items-center gap-2.5 py-4 px-2.5 bg-bg-main/40 w-[52px]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white font-black text-sm mb-1 shadow-[0_0_16px_rgba(79,70,229,0.2)]">A</div>
            {[
              { icon: LayoutDashboard, active: false },
              { icon: Swords, active: true },
              { icon: BookOpen, active: false },
              { icon: Trophy, active: false },
              { icon: UsersRound, active: false },
            ].map((item, i) => (
              <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${item.active ? "bg-primary/10 text-primary shadow-[0_0_12px_rgba(79,70,229,0.10)]" : "text-text-muted hover:bg-white/80"}`}>
                <item.icon className="w-4 h-4" />
              </div>
            ))}
            <div className="mt-auto flex flex-col gap-2 items-center">
              <div className="w-9 h-9 rounded-xl bg-gold-soft flex items-center justify-center">
                <Coins className="w-4 h-4 text-gold" />
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-black">A</div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-3.5 lg:p-4 min-w-0">
            {/* Greeting row */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="min-w-0">
                <h3 className="font-extrabold text-text text-sm lg:text-base leading-tight truncate">Good morning, Ari! 👋</h3>
                <p className="text-text-muted text-[11px] mt-0.5">Let&apos;s make today amazing.</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="bg-gold-soft/80 rounded-xl py-1 px-2.5 text-center shadow-[0_2px_8px_rgba(245,165,36,0.08)]">
                  <div className="font-black text-gold text-xs leading-none flex items-center gap-1"><Coins className="w-3 h-3" /> 1,240</div>
                  <div className="text-[9px] font-bold text-gold/60 mt-0.5">Coins</div>
                </div>
                <div className="bg-pink-soft/80 rounded-xl py-1 px-2.5 text-center shadow-[0_2px_8px_rgba(255,92,138,0.08)]">
                  <div className="font-black text-pink text-xs leading-none flex items-center gap-1"><Flame className="w-3 h-3" /> 7d</div>
                  <div className="text-[9px] font-bold text-pink/60 mt-0.5">Streak</div>
                </div>
              </div>
            </div>

            {/* Dashboard grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">

              {/* Today's Lesson — spans 2 */}
              <div className="col-span-2 bg-card-gradient-blue rounded-2xl p-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-[0.06]"><TrendingUp className="w-16 h-16 text-accent-blue" /></div>
                <div className="relative">
                  <p className="text-[9px] font-extrabold text-accent-blue uppercase tracking-wider mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Today&apos;s Lesson
                  </p>
                  <h4 className="font-extrabold text-text text-sm lg:text-[15px]">Adding Fractions</h4>
                  <span className="inline-block bg-accent-blue-soft/60 rounded-full py-0.5 px-2 text-[9px] font-bold text-accent-blue mt-0.5">Mathematics</span>
                  <p className="text-text-muted text-[10px] leading-relaxed mt-1 hidden sm:block">Add fractions with like and unlike denominators.</p>
                  <div className="flex items-center gap-2.5 mt-2">
                    <button className="bg-primary text-white font-bold text-[10px] py-1.5 px-3 rounded-lg border-none cursor-pointer inline-flex items-center gap-1 shadow-pill">
                      Continue <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-[10px] text-text-muted font-semibold flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> 12 min
                    </span>
                  </div>
                </div>
              </div>

              {/* Child Avatar + Level */}
              <div className="bg-card-gradient-green rounded-2xl p-3 flex flex-col">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary-light to-secondary flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm relative">
                    <GraduationCap className="w-5 h-5 text-white" />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full w-5 h-5 flex items-center justify-center text-[8px] font-black text-primary border-2 border-primary/15 shadow-sm">7</div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-text text-xs">Explorer</h4>
                    <p className="text-[9px] text-text-muted font-semibold">Level 7</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between text-[9px] font-bold text-text-muted mb-0.5">
                    <span>680 XP</span><span>1,000</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary-soft overflow-hidden">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-secondary to-secondary-light progress-fill" />
                  </div>
                </div>
              </div>

              {/* EQ Check-in */}
              <div className="bg-card-gradient-pink rounded-2xl p-3 flex flex-col">
                <div className="w-7 h-7 rounded-lg bg-pink/10 flex items-center justify-center mb-1.5">
                  <Heart className="w-3.5 h-3.5 text-pink" />
                </div>
                <h4 className="font-extrabold text-text text-xs">EQ Check-in</h4>
                <p className="text-text-muted text-[9px] leading-relaxed mt-0.5 flex-1">How are you feeling today?</p>
                <div className="flex gap-1 mt-1.5">
                  {[
                    { bg: "bg-secondary/10", icon: CheckCircle2, color: "text-secondary", label: "Good" },
                    { bg: "bg-accent-blue/10", icon: Zap, color: "text-accent-blue", label: "Great" },
                    { bg: "bg-gold/10", icon: Star, color: "text-gold", label: "Amazing" }
                  ].map((m, i) => (
                    <div key={i} className={`flex-1 ${m.bg} rounded-lg py-1.5 flex flex-col items-center gap-0.5 border border-white/40`}>
                      <m.icon className={`w-3 h-3 ${m.color}`} />
                      <span className="text-[8px] font-bold text-text-muted">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges earned */}
              <div className="bg-white rounded-2xl p-3 flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 text-accent-purple" />
                  </div>
                  <span className="text-[9px] font-extrabold text-accent-purple">12 earned</span>
                </div>
                <h4 className="font-extrabold text-text text-xs">Badges</h4>
                <div className="flex gap-1 mt-1.5 flex-1 items-center">
                  {[
                    { icon: Star, bg: "bg-gold-soft", color: "text-gold" },
                    { icon: BookOpen, bg: "bg-accent-blue-soft", color: "text-accent-blue" },
                    { icon: Zap, bg: "bg-secondary-soft", color: "text-secondary" },
                    { icon: Heart, bg: "bg-pink-soft", color: "text-pink" },
                  ].map((b, i) => (
                    <div key={i} className={`w-8 h-8 rounded-xl ${b.bg} flex items-center justify-center border border-white/60`}>
                      <b.icon className={`w-3.5 h-3.5 ${b.color}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quest Progress */}
              <div className="bg-gradient-to-br from-primary-soft/60 to-accent-purple-soft/40 rounded-2xl p-3 flex flex-col">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mb-1.5">
                  <Target className="w-3.5 h-3.5 text-primary" />
                </div>
                <h4 className="font-extrabold text-text text-xs">Quest Progress</h4>
                <p className="text-text-muted text-[9px] leading-relaxed mt-0.5 flex-1">Weekly goal: 10 lessons</p>
                <div className="mt-1">
                  <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                    <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-primary to-accent-purple progress-fill" />
                  </div>
                  <p className="text-[9px] font-bold text-text-muted mt-0.5">6 / 10 completed</p>
                </div>
              </div>

              {/* Parent visibility hint */}
              <div className="col-span-2 lg:col-span-1 bg-card-gradient-gold rounded-2xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-extrabold text-text text-xs">Parent View</h4>
                  <p className="text-text-muted text-[9px] leading-relaxed">XP, streaks, EQ reports — all visible to parents.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
