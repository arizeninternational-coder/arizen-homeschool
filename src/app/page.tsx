import Link from "next/link";
import {
  Heart, BookOpen, Sparkles, Shield, ChevronRight, GraduationCap, Users,
  Flower2, Sun, Star, TreePine, Palette, Globe, Lightbulb, Puzzle
} from "lucide-react";
import { ds, colors, gradients, shadows } from "@/lib/design-system";

/* ─── Floating Decorations ─── */
function FloatingDecorations() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
      {/* Soft gradient orbs */}
      <div style={{ ...ds.orb(colors.primarySoft, '28rem'), top: '-10rem', left: '-8rem' }} className="float-slow" />
      <div style={{ ...ds.orb(colors.accentSoft, '24rem'), top: '20%', right: '-10rem' }} className="float-medium" />
      <div style={{ ...ds.orb(colors.warmSoft, '20rem'), bottom: '10%', left: '15%' }} className="float-fast" />
      <div style={{ ...ds.orb(colors.bgBlue, '18rem'), bottom: '-5rem', right: '20%' }} className="float-x" />

      {/* Floating icons */}
      <div style={{ position: 'absolute', top: '18%', left: '8%', opacity: 0.15 }} className="float-slow">
        <Star style={{ width: '32px', height: '32px', color: colors.warm }} />
      </div>
      <div style={{ position: 'absolute', top: '35%', right: '12%', opacity: 0.12 }} className="float-medium">
        <Puzzle style={{ width: '28px', height: '28px', color: colors.accent }} />
      </div>
      <div style={{ position: 'absolute', bottom: '25%', left: '12%', opacity: 0.1 }} className="float-fast">
        <Lightbulb style={{ width: '24px', height: '24px', color: colors.warm }} />
      </div>
      <div style={{ position: 'absolute', top: '60%', right: '8%', opacity: 0.12 }} className="float-x">
        <Heart style={{ width: '26px', height: '26px', color: colors.accent }} />
      </div>
      <div style={{ position: 'absolute', bottom: '15%', right: '25%', opacity: 0.1 }} className="float-slow">
        <TreePine style={{ width: '28px', height: '28px', color: colors.primary }} />
      </div>
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  return (
    <nav style={ds.nav}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{ ...ds.logoMark, width: '38px', height: '38px', borderRadius: '0.875rem' }}>
              <Flower2 style={{ width: '20px', height: '20px' }} />
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 900, ...ds.textGradient }}>Arizen School</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/auth/login" style={{ ...ds.btnGhost, fontWeight: 700 }}>Sign In</Link>
            <Link href="/auth/register" style={{ ...ds.btnPrimary, fontSize: '0.875rem', padding: '0.625rem 1.5rem' }}>Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section style={{ position: 'relative', paddingTop: '8rem', paddingBottom: '5rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
      <FloatingDecorations />

      <div style={{ position: 'relative', maxWidth: '52rem', margin: '0 auto', textAlign: 'center' }}>
        {/* Trust badge */}
        <div className="fade-in-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '9999px', padding: '0.4rem 1.1rem', marginBottom: '2rem', background: gradients.primarySoft, border: `1px solid ${colors.primaryLight}` }}>
          <Sparkles style={{ width: '14px', height: '14px', color: colors.primary }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: colors.primary, letterSpacing: '0.05em' }}>Emotionally Intelligent Learning</span>
        </div>

        <h1 className="fade-in-up" style={{ ...ds.headingHero, marginBottom: '1.5rem', animationDelay: '0.1s' }}>
          Welcome to <span style={ds.textGradient}>Arizen School</span>
        </h1>
        <p className="fade-in-up" style={{ ...ds.textBodyLg, maxWidth: '38rem', margin: '0 auto 2.5rem', fontSize: '1.125rem', animationDelay: '0.2s' }}>
          A personalized, emotionally intelligent learning system for your child.
          Where curiosity meets calm, and every lesson feels like a gentle adventure.
        </p>

        {/* CTAs */}
        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '4rem', animationDelay: '0.3s' }}>
          <Link href="/auth/register" style={{ ...ds.btnPrimary, width: '100%', maxWidth: '280px', fontSize: '1rem', padding: '1rem 2rem', gap: '0.625rem', textDecoration: 'none' }}>
            Get Started Free <ChevronRight style={{ width: '18px', height: '18px' }} />
          </Link>
          <Link href="/auth/login" style={{ ...ds.btnOutline, width: '100%', maxWidth: '280px', fontSize: '1rem', padding: '0.9375rem 2rem', textDecoration: 'none' }}>
            I Have an Account
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="fade-in-up" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '2rem', animationDelay: '0.4s' }}>
          {[
            { icon: Heart, label: "Emotionally Safe", color: colors.accent },
            { icon: Shield, label: "Privacy First", color: colors.primary },
            { icon: Sun, label: "Joyful Learning", color: colors.warm },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15` }}>
                <Icon style={{ width: '16px', height: '16px', color }} />
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: colors.textMuted }}>{label}</span>
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
    {
      href: "/auth/register?role=parent",
      icon: Users,
      title: "I'm a Parent",
      desc: "Track progress and celebrate milestones together.",
      gradient: `linear-gradient(135deg, ${colors.primarySoft}, white)`,
      iconBg: `linear-gradient(135deg, ${colors.primarySoft}, ${colors.primaryLight})`,
      iconColor: colors.primary,
      border: colors.primaryLight,
    },
    {
      href: "/auth/register?role=learner",
      icon: GraduationCap,
      title: "I'm a Child",
      desc: "Explore lessons, earn XP, and go on quests!",
      gradient: `linear-gradient(135deg, ${colors.accentSoft}, white)`,
      iconBg: `linear-gradient(135deg, ${colors.accentSoft}, ${colors.accentLight})`,
      iconColor: colors.accentDark,
      border: colors.accentLight,
    },
    {
      href: "/auth/login",
      icon: BookOpen,
      title: "Sign In",
      desc: "Welcome back! Pick up where you left off.",
      gradient: `linear-gradient(135deg, ${colors.warmSoft}, white)`,
      iconBg: `linear-gradient(135deg, ${colors.warmSoft}, ${colors.warmLight})`,
      iconColor: colors.warmDark,
      border: colors.warmLight,
    },
  ];

  return (
    <section style={{ padding: '1rem 1rem 5rem' }}>
      <div style={{ maxWidth: '60rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ ...ds.headingLg, marginBottom: '0.75rem' }}>How would you like to join?</h2>
          <p style={{ ...ds.textBody, maxWidth: '28rem', margin: '0 auto' }}>
            Choose your path and we'll set up the perfect experience for you.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link key={c.title} href={c.href} className="scale-in" style={{
                ...ds.cardInteractive,
                background: c.gradient,
                border: `1.5px solid ${c.border}`,
                animationDelay: `${i * 0.1}s`,
                textDecoration: 'none',
              }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', background: c.iconBg, boxShadow: shadows.sm }}>
                  <Icon style={{ width: '30px', height: '30px', color: c.iconColor }} />
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
    { icon: Heart, title: "Emotionally Intelligent", desc: "Lessons adapt to your child's emotional state and learning pace.", gradient: `linear-gradient(135deg, #ffedd5, #fed7aa)`, color: "#ea580c" },
    { icon: TreePine, title: "CBC Aligned", desc: "Curriculum aligned with Kenya's Competency-Based Curriculum for Grades 1–8.", gradient: `linear-gradient(135deg, #d1fae5, #a7f3d0)`, color: "#059669" },
    { icon: Star, title: "Gamified Learning", desc: "XP, streaks, badges, and quests — your child stays motivated.", gradient: `linear-gradient(135deg, #ccfbf1, #99f6e4)`, color: "#0d9488" },
    { icon: Globe, title: "World Cultures", desc: "Explore diverse cultures, languages, and perspectives from around the globe.", gradient: `linear-gradient(135deg, #e0f2fe, #bae6fd)`, color: "#0284c7" },
    { icon: Palette, title: "Creative Expression", desc: "Art, music, storytelling, and hands-on projects that nurture creativity.", gradient: `linear-gradient(135deg, #fef9c3, #fef08a)`, color: "#ca8a04" },
    { icon: Shield, title: "Safe & Private", desc: "Your family's data is protected. No ads, no tracking, no compromises.", gradient: `linear-gradient(135deg, #fce7f3, #fbcfe8)`, color: "#be185d" },
  ];

  return (
    <section style={{ padding: '4rem 1rem 6rem' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ ...ds.headingLg, marginBottom: '0.75rem' }}>Every child learns differently.</h2>
          <p style={{ ...ds.textBody, maxWidth: '28rem', margin: '0 auto' }}>
            Arizen School meets each learner where they are.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="fade-in-up" style={{ ...ds.card, animationDelay: `${i * 0.08}s`, padding: '1.5rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', background: f.gradient, boxShadow: shadows.sm }}>
                  <Icon style={{ width: '26px', height: '26px', color: f.color }} />
                </div>
                <h3 style={{ ...ds.headingSm, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ ...ds.textBody, fontSize: '0.875rem' }}>{f.desc}</p>
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
    <footer style={{ padding: '2.5rem 1rem', borderTop: `1px solid ${colors.borderLight}`, background: colors.bgSoft }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ ...ds.logoMark, width: '32px', height: '32px', borderRadius: '0.625rem' }}>
            <Flower2 style={{ width: '18px', height: '18px' }} />
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, ...ds.textGradient }}>Arizen School</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: 600 }}>
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
    <div style={{ minHeight: '100vh', background: colors.bg }}>
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
