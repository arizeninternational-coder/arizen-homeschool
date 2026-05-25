import Link from "next/link";
import { Heart, BookOpen, Sparkles, Shield, ChevronRight, GraduationCap, Users, Flower2, Sun, Star, TreePine, Palette, Globe } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

/* ─── Navbar ─── */
function Navbar() {
  return (
    <nav style={ds.nav}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{ ...ds.logoMark, width: '36px', height: '36px' }}>
              <Flower2 style={{ width: '20px', height: '20px' }} />
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, ...ds.textGradient }}>Arizen School</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/auth/login" style={{ ...ds.btnGhost }}>Sign In</Link>
            <Link href="/auth/register" style={{ ...ds.btnPrimary, fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}>Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section style={{ position: 'relative', paddingTop: '7rem', paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '-5rem', left: '-5rem', width: '18rem', height: '18rem', borderRadius: '50%', filter: 'blur(48px)', background: colors.primarySoft, opacity: 0.4 }} className="float-slow" />
        <div style={{ position: 'absolute', top: '33%', right: '-5rem', width: '20rem', height: '20rem', borderRadius: '50%', filter: 'blur(48px)', background: colors.accentSoft, opacity: 0.3 }} className="float-medium" />
        <div style={{ position: 'absolute', bottom: '5rem', left: '25%', width: '16rem', height: '16rem', borderRadius: '50%', filter: 'blur(48px)', background: colors.warmSoft, opacity: 0.3 }} className="float-fast" />
      </div>

      <div style={{ position: 'relative', maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
        {/* Trust badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '9999px', padding: '0.375rem 1rem', marginBottom: '2rem', background: colors.primarySoft, border: `1px solid ${colors.primaryLight}` }}>
          <Sparkles style={{ width: '14px', height: '14px', color: colors.primary }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.primary }}>Emotionally Intelligent Learning</span>
        </div>

        <h1 style={{ ...ds.headingHero, marginBottom: '1.5rem' }}>
          Welcome to <span style={ds.textGradient}>Arizen School</span>
        </h1>
        <p style={{ ...ds.textBodyLg, maxWidth: '36rem', margin: '0 auto 2.5rem' }}>
          A personalized, emotionally intelligent learning system for your child.
          Where curiosity meets calm, and every lesson feels like a gentle adventure.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
          <Link href="/auth/register" style={{ ...ds.btnPrimary, width: '100%', maxWidth: '280px', fontSize: '1rem', padding: '0.875rem 2rem', textDecoration: 'none' }}>
            Get Started Free <ChevronRight style={{ width: '16px', height: '16px' }} />
          </Link>
          <Link href="/auth/login" style={{ ...ds.btnSecondary, width: '100%', maxWidth: '280px', fontSize: '1rem', padding: '0.875rem 2rem', textDecoration: 'none' }}>
            I Have an Account
          </Link>
        </div>

        {/* Trust indicators */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          {[
            { icon: Heart, label: "Emotionally Safe", color: colors.primary },
            { icon: Shield, label: "Privacy First", color: colors.accent },
            { icon: Sun, label: "Joyful Learning", color: colors.warm },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted }}>
              <Icon style={{ width: '16px', height: '16px', color }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Cards ─── */
function CTACards() {
  const cards = [
    { href: "/auth/register?role=parent", icon: Users, title: "I'm a Parent", desc: "Track progress and celebrate milestones together.", softColor: colors.primarySoft, mainColor: colors.primary },
    { href: "/auth/register?role=learner", icon: GraduationCap, title: "I'm a Child", desc: "Explore lessons, earn XP, and go on quests!", softColor: colors.accentSoft, mainColor: colors.accent },
    { href: "/auth/login", icon: BookOpen, title: "Sign In", desc: "Welcome back! Pick up where you left off.", softColor: colors.warmSoft, mainColor: colors.warm },
  ];

  return (
    <section style={{ padding: '0 1rem 4rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <h2 style={{ ...ds.headingLg, textAlign: 'center', marginBottom: '0.75rem' }}>How would you like to join?</h2>
        <p style={{ ...ds.textBody, textAlign: 'center', maxWidth: '28rem', margin: '0 auto 2.5rem' }}>
          Choose your path and we'll set up the perfect experience for you.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.title} href={c.href} style={{ ...ds.cardInteractive, display: 'block', textDecoration: 'none' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', background: `linear-gradient(135deg, ${c.softColor}, white)` }}>
                  <Icon style={{ width: '28px', height: '28px', color: c.mainColor }} />
                </div>
                <h3 style={{ ...ds.headingMd, marginBottom: '0.5rem' }}>{c.title}</h3>
                <p style={{ ...ds.textBody }}>{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function FeaturesSection() {
  const features = [
    { icon: Heart, title: "Emotionally Intelligent", desc: "Lessons adapt to your child's emotional state and learning pace.", gradient: "linear-gradient(135deg, #ffedd5, #fed7aa)", color: "#ea580c" },
    { icon: TreePine, title: "CBC Aligned", desc: "Curriculum aligned with Kenya's Competency-Based Curriculum for Grades 1–8.", gradient: "linear-gradient(135deg, #d1fae5, #a7f3d0)", color: "#059669" },
    { icon: Star, title: "Gamified Learning", desc: "XP, streaks, badges, and quests — your child stays motivated.", gradient: "linear-gradient(135deg, #ccfbf1, #99f6e4)", color: "#0d9488" },
    { icon: Globe, title: "World Cultures", desc: "Explore diverse cultures, languages, and perspectives from around the globe.", gradient: "linear-gradient(135deg, #e0f2fe, #bae6fd)", color: "#0284c7" },
    { icon: Palette, title: "Creative Expression", desc: "Art, music, storytelling, and hands-on projects that nurture creativity.", gradient: "linear-gradient(135deg, #fef9c3, #fef08a)", color: "#ca8a04" },
    { icon: Shield, title: "Safe & Private", desc: "Your family's data is protected. No ads, no tracking, no compromises.", gradient: "linear-gradient(135deg, #d1fae5, #e0f2fe)", color: "#059669" },
  ];

  return (
    <section style={{ padding: '4rem 1rem 5rem' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ ...ds.headingLg, marginBottom: '0.75rem' }}>Every child learns differently.</h2>
          <p style={{ ...ds.textBody, maxWidth: '28rem', margin: '0 auto' }}>
            Arizen School meets each learner where they are.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={ds.card}>
                <div style={{ width: '48px', height: '48px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', background: f.gradient }}>
                  <Icon style={{ width: '24px', height: '24px', color: f.color }} />
                </div>
                <h3 style={{ ...ds.headingSm, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={ds.textBody}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer style={{ padding: '2rem 1rem', borderTop: `1px solid ${colors.border}` }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ ...ds.logoMark, width: '28px', height: '28px', borderRadius: '0.5rem' }}>
            <Flower2 style={{ width: '16px', height: '16px' }} />
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, ...ds.textGradient }}>Arizen School</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: colors.textMuted }}>
          &copy; {new Date().getFullYear()} Arizen International. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main>
        <HeroSection />
        <CTACards />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
