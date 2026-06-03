import Link from "next/link";
import {
  ShieldCheck, BookOpen, UsersRound, Gamepad2,
  Heart, Coins, Trophy, Target, ArrowRight,
  GraduationCap, CheckCircle2, Sparkles, LayoutDashboard,
  Star, Swords, Zap
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   ARIZEN SCHOOL — Landing Page v6
   Premium • Colorful • Child-friendly • African
   Uses CSS variable-based Tailwind colors from design system
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
        <nav className="h-[72px] border-b border-border-soft bg-white/90 backdrop-blur-xl sticky top-0 z-50">
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
          <div className="text-center bg-white rounded-3xl border border-border-soft p-10 max-w-[420px] shadow-card">
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

      {/* ── Background Gradient Blobs (.bg-app pattern) ── */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[5%] right-[12%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.10)_0%,transparent_70%)]" />
        <div className="absolute top-[20%] -left-[3%] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(0,168,132,0.10)_0%,transparent_70%)]" />
        <div className="absolute bottom-[5%] right-[25%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(245,165,36,0.08)_0%,transparent_70%)]" />
        <div className="absolute top-[60%] left-[15%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(255,92,138,0.06)_0%,transparent_70%)]" />
      </div>

      {/* ── App Background Overlay ── */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 bg-app opacity-60" />

      {/* ── Navbar ── */}
      <div className="relative z-10">
        <nav className="h-[72px] border-b border-border-soft bg-white/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-[1380px] mx-auto px-10 flex items-center justify-between h-full">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-purple text-white flex items-center justify-center font-black text-lg shadow-glow-soft">A</div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">Arizen School</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="font-bold text-text no-underline text-sm hidden sm:block">Sign In</Link>
              <Link href="/auth/register" className="bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm py-2.5 px-6 rounded-xl no-underline shadow-pill hover:shadow-glow transition-all duration-200">Get Started</Link>
            </div>
          </div>
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-[1380px] mx-auto px-6 lg:px-10 pt-12 pb-8 lg:pt-16 lg:pb-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">

          {/* ── Left: Hero Copy ── */}
          <div className="flex-1 fade-in-up min-w-0 lg:max-w-[580px]">

            {/* Announcement pill */}
            <div className="inline-flex items-center gap-2 bg-accent-purple-soft rounded-full py-2 px-4 mb-6 text-xs font-bold text-accent-purple">
              <Heart className="w-3.5 h-3.5" />
              Learning that understands every child
            </div>

            {/* Headline */}
            <h1 className="font-black text-text tracking-tight leading-[1.1] mb-5 text-[2rem] sm:text-5xl lg:text-6xl">
              Welcome to emotionally<br />
              <span className="bg-gradient-to-r from-primary via-accent-purple to-primary bg-clip-text text-transparent">intelligent learning</span>
            </h1>

            {/* Subheadline */}
            <p className="text-text-muted text-base lg:text-lg leading-relaxed max-w-lg">
              A personalized CBC learning experience that helps your child build confidence, curiosity, emotional awareness, and mastery of core subjects — all in a safe, gamified environment.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold text-base lg:text-lg py-3.5 lg:py-4 px-7 lg:px-8 rounded-2xl no-underline shadow-pill hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold text-base lg:text-lg py-3.5 lg:py-4 px-7 lg:px-8 rounded-2xl no-underline border-2 border-primary/20 hover:border-primary/40 hover:bg-primary-soft transition-all duration-200"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2.5 mt-7">
              <TrustBadge icon={ShieldCheck} text="CBC-Aligned" bgClass="bg-accent-blue-soft" iconClass="text-accent-blue" borderClass="border-accent-blue/20" />
              <TrustBadge icon={Heart} text="Emotionally Safe" bgClass="bg-pink-soft" iconClass="text-pink" borderClass="border-pink/20" />
              <TrustBadge icon={UsersRound} text="Parent-Friendly" bgClass="bg-accent-purple-soft" iconClass="text-accent-purple" borderClass="border-accent-purple/20" />
              <TrustBadge icon={Gamepad2} text="Gamified Learning" bgClass="bg-gold-soft" iconClass="text-gold" borderClass="border-gold/20" />
            </div>
          </div>

          {/* ── Right: Dashboard Preview Mockup ── */}
          <div className="flex-1 w-full max-w-[600px] lg:max-w-none fade-in" style={{ animationDelay: "0.2s" }}>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-[1380px] mx-auto px-6 lg:px-10 py-12 lg:py-20">
        {/* Section header */}
        <div className="text-center mb-12 fade-in-up">
          <div className="inline-flex items-center gap-2 bg-primary-soft rounded-full py-2 px-4 mb-4 text-xs font-bold text-primary">
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

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">

          {/* EQ Check-ins */}
          <FeatureCard
            icon={Heart}
            title="EQ Check-ins"
            description="Daily emotional check-ins help students build self-awareness and express how they feel."
            gradient="bg-card-gradient-pink"
            iconBg="bg-pink/10"
            iconColor="text-pink"
            accentBorder="border-pink/15"
            delay={0}
          />

          {/* Gamified Rewards */}
          <FeatureCard
            icon={Coins}
            title="Gamified Rewards"
            description="Earn Spark Coins, unlock badges, and level up your avatar by completing lessons and quests."
            gradient="bg-card-gradient-gold"
            iconBg="bg-gold/10"
            iconColor="text-gold"
            accentBorder="border-gold/15"
            delay={0.1}
          />

          {/* Parent Dashboard */}
          <FeatureCard
            icon={LayoutDashboard}
            title="Parent Dashboard"
            description="Track your child's progress, view EQ reports, and stay connected with their learning journey."
            gradient="bg-card-gradient-purple"
            iconBg="bg-accent-purple/10"
            iconColor="text-accent-purple"
            accentBorder="border-accent-purple/15"
            delay={0.2}
          />

          {/* CBC-Aligned */}
          <FeatureCard
            icon={BookOpen}
            title="CBC-Aligned"
            description="Full Competency Based Curriculum coverage for all grades, designed by Kenyan educators."
            gradient="bg-card-gradient-green"
            iconBg="bg-secondary/10"
            iconColor="text-secondary"
            accentBorder="border-secondary/15"
            delay={0.3}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS STRIP
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-[1380px] mx-auto px-6 lg:px-10 pb-12 lg:pb-16">
        <div className="bg-white rounded-3xl border border-border-soft shadow-card overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border-soft">
            <StatItem value="3" suffix="K+" label="Active Students" icon={GraduationCap} color="text-primary" />
            <StatItem value="500" suffix="+" label="Lessons & Quests" icon={Target} color="text-secondary" />
            <StatItem value="98" suffix="%" label="Parent Satisfaction" icon={Heart} color="text-pink" />
            <StatItem value="12" label="Grade Levels" icon={BookOpen} color="text-accent-blue" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA BANNER
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-[1380px] mx-auto px-6 lg:px-10 pb-16 lg:pb-20">
        <div className="relative bg-gradient-to-br from-primary via-primary-dark to-accent-purple rounded-3xl p-8 lg:p-14 overflow-hidden">
          {/* Decorative circles */}
          <div aria-hidden="true" className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
          <div aria-hidden="true" className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="font-black text-white text-2xl lg:text-4xl mb-3 leading-tight">
                Ready to start your child's<br />learning adventure?
              </h2>
              <p className="text-white/70 text-base lg:text-lg max-w-md">
                Join thousands of families already using Arizen School to make learning fun, safe, and effective.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold text-base lg:text-lg py-3.5 px-8 rounded-2xl no-underline shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-bold text-base lg:text-lg py-3.5 px-8 rounded-2xl no-underline border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-border-0 bg-white/60 backdrop-blur-sm">
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
   SUB-COMPONENTS (inline, no emoji, lucide-react only)
   ═══════════════════════════════════════════════════════════════════ */

/* ── Trust Badge Pill ── */
function TrustBadge({ icon: Icon, text, bgClass, iconClass, borderClass }: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  bgClass: string;
  iconClass: string;
  borderClass: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${bgClass} border ${borderClass} rounded-full py-1.5 px-3.5 text-xs font-bold text-text shadow-sm`}>
      <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
      {text}
    </span>
  );
}

/* ── Feature Card ── */
function FeatureCard({ icon: Icon, title, description, gradient, iconBg, iconColor, accentBorder, delay }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  accentBorder: string;
  delay: number;
}) {
  return (
    <div
      className={`group ${gradient} rounded-2xl lg:rounded-3xl p-6 lg:p-7 border ${accentBorder} hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 fade-in-up`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="font-extrabold text-text text-base lg:text-lg mb-2">{title}</h3>
      <p className="text-text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}

/* ── Stat Item ── */
function StatItem({ value, suffix, label, icon: Icon, color }: {
  value: string;
  suffix?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-7 justify-center">
      <div className="w-10 h-10 rounded-xl bg-bg-main flex items-center justify-center">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <div className="font-black text-text text-xl lg:text-2xl">
          {value}{suffix && <span className="text-base">{suffix}</span>}
        </div>
        <div className="text-xs font-bold text-text-muted">{label}</div>
      </div>
    </div>
  );
}

/* ── Dashboard Preview Mockup ── */
function DashboardPreview() {
  return (
    <div className="relative">
      {/* Outer glow */}
      <div className="absolute -inset-3 bg-gradient-to-br from-primary/10 via-accent-purple/5 to-secondary/10 rounded-[32px] blur-2xl" />

      <div className="relative bg-white rounded-3xl border border-border-soft shadow-card-hover overflow-hidden">
        {/* Top bar mockup */}
        <div className="bg-bg-main border-b border-border-soft px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-pink/60" />
            <div className="w-3 h-3 rounded-full bg-gold/60" />
            <div className="w-3 h-3 rounded-full bg-secondary/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-32 h-2.5 rounded-full bg-border-soft" />
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="hidden sm:flex flex-col items-center gap-3 py-5 px-3 border-r border-border-soft bg-bg-main">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white font-black text-sm mb-2">A</div>
            {[LayoutDashboard, Swords, BookOpen, Trophy, UsersRound].map((Icn, i) => (
              <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center ${i === 1 ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-white"} transition-colors`}>
                <Icn className="w-4 h-4" />
              </div>
            ))}
            <div className="mt-auto w-9 h-9 rounded-xl bg-gold-soft flex items-center justify-center">
              <Coins className="w-4 h-4 text-gold" />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 lg:p-5 min-w-0">
            {/* Greeting row */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-extrabold text-text text-base lg:text-lg leading-tight">Good morning, Learner!</h3>
                <p className="text-text-muted text-xs mt-0.5">Ready to learn something amazing today?</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center border-2 border-gold/30">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gold-soft rounded-xl py-1.5 px-3 text-center border border-gold/15">
                  <div className="font-black text-gold text-sm leading-none">1,240</div>
                  <div className="text-[10px] font-bold text-gold/70 mt-0.5">Coins</div>
                </div>
              </div>
            </div>

            {/* Dashboard grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">

              {/* Today's Lesson — spans 2 */}
              <div className="col-span-2 bg-card-gradient-blue rounded-2xl p-3.5 border border-accent-blue/15">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-extrabold text-accent-blue uppercase tracking-wider mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Today's Lesson
                    </p>
                    <h4 className="font-extrabold text-text text-sm lg:text-base">Adding Fractions</h4>
                    <span className="inline-block bg-accent-blue-light/20 rounded-full py-0.5 px-2 text-[10px] font-bold text-accent-blue mt-1">Mathematics</span>
                    <p className="text-text-muted text-[11px] leading-relaxed mt-1.5 hidden sm:block">Add fractions with like and unlike denominators using step-by-step examples.</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <button className="bg-primary text-white font-bold text-xs py-1.5 px-4 rounded-lg border-none cursor-pointer inline-flex items-center gap-1 shadow-pill">
                        Continue <ArrowRight className="w-3 h-3" />
                      </button>
                      <span className="text-[11px] text-text-muted font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 text-gold" /> 12 min
                      </span>
                    </div>
                  </div>
                  {/* Math visual */}
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-accent-blue-soft flex flex-col items-center justify-center flex-shrink-0 border border-accent-blue/10">
                    <span className="text-lg lg:text-xl font-black text-accent-blue">½+¼</span>
                    <span className="text-[10px] font-bold text-accent-blue/60">= ¾</span>
                  </div>
                </div>
              </div>

              {/* Spark Coins */}
              <div className="bg-card-gradient-gold rounded-2xl p-3.5 border border-gold/15 flex flex-col">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center mb-2">
                  <Coins className="w-4 h-4 text-gold" />
                </div>
                <h4 className="font-extrabold text-text text-sm">Spark Coins</h4>
                <p className="text-text-muted text-[11px] leading-relaxed mt-0.5 flex-1">Earn by completing lessons.</p>
                <div className="font-black text-gold text-xl mt-1">1,240</div>
              </div>

              {/* EQ Check-in */}
              <div className="bg-card-gradient-pink rounded-2xl p-3.5 border border-pink/15 flex flex-col">
                <div className="w-8 h-8 rounded-lg bg-pink/10 flex items-center justify-center mb-2">
                  <Heart className="w-4 h-4 text-pink" />
                </div>
                <h4 className="font-extrabold text-text text-sm">EQ Check-in</h4>
                <p className="text-text-muted text-[11px] leading-relaxed mt-0.5">How are you feeling?</p>
                <div className="flex gap-1.5 mt-1.5">
                  {[
                    { bg: "bg-secondary/10", icon: CheckCircle2, color: "text-secondary", label: "Good" },
                    { bg: "bg-accent-blue/10", icon: Zap, color: "text-accent-blue", label: "Great" },
                    { bg: "bg-gold/10", icon: Star, color: "text-gold", label: "Amazing" },
                  ].map((m, i) => (
                    <div key={i} className={`flex-1 ${m.bg} rounded-lg py-2 flex flex-col items-center gap-0.5 border border-white/50`}>
                      <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                      <span className="text-[9px] font-bold text-text-muted">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="bg-white rounded-2xl p-3.5 border border-border-soft flex flex-col">
                <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center mb-2">
                  <Trophy className="w-4 h-4 text-accent-purple" />
                </div>
                <h4 className="font-extrabold text-text text-sm">Badges</h4>
                <p className="text-text-muted text-[11px] leading-relaxed mt-0.5">Unlocked so far</p>
                <div className="flex gap-1.5 mt-1.5">
                  {[
                    { icon: Star, bg: "bg-gold-soft", color: "text-gold" },
                    { icon: BookOpen, bg: "bg-accent-blue-soft", color: "text-accent-blue" },
                    { icon: Zap, bg: "bg-secondary-soft", color: "text-secondary" },
                    { icon: Heart, bg: "bg-pink-soft", color: "text-pink" },
                  ].map((b, i) => (
                    <div key={i} className={`w-7 h-7 rounded-lg ${b.bg} flex items-center justify-center border border-white/60`}>
                      <b.icon className={`w-3.5 h-3.5 ${b.color}`} />
                    </div>
                  ))}
                </div>
                <div className="font-extrabold text-accent-purple text-lg mt-auto">12</div>
              </div>

              {/* Quest Progress */}
              <div className="bg-card-gradient-pink/50 rounded-2xl p-3.5 border border-pink/10 flex flex-col">
                <div className="w-8 h-8 rounded-lg bg-pink/10 flex items-center justify-center mb-2">
                  <Target className="w-4 h-4 text-pink" />
                </div>
                <h4 className="font-extrabold text-text text-sm">Quest Progress</h4>
                <p className="text-text-muted text-[11px] leading-relaxed mt-0.5 flex-1">Weekly goal</p>
                <div className="mt-1">
                  <div className="h-2 rounded-full bg-pink-soft overflow-hidden">
                    <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-pink to-pink-light" />
                  </div>
                  <p className="text-[11px] font-bold text-text-muted mt-1">6 / 10 completed</p>
                </div>
              </div>

              {/* Avatar + XP — spans 2 on lg */}
              <div className="col-span-2 lg:col-span-1 bg-card-gradient-green rounded-2xl p-3.5 border border-secondary/15">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary-light to-secondary flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm relative">
                    <GraduationCap className="w-7 h-7 text-white" />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black text-primary border-2 border-primary/20 shadow-sm">7</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-text text-sm">Level 7</h4>
                    <div className="h-2.5 rounded-full bg-secondary-soft overflow-hidden mt-1">
                      <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-secondary to-secondary-light" />
                    </div>
                    <p className="text-[10px] font-bold text-text-muted mt-0.5">680 / 1,000 XP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
