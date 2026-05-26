import Link from "next/link";
import {
  Heart, BookOpen, Sparkles, Shield, ChevronRight, GraduationCap, Users,
  Flower2, Sun, Star, TreePine, Palette, Globe, Lightbulb, Puzzle,
  ArrowRight, CheckCircle2
} from "lucide-react";
import { ds, colors, gradients, shadows } from "@/lib/design-system";

/* ─── Floating Decorations ─── */
function FloatingDecorations() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
      <div style={{ ...ds.orb(colors.primarySoft, '32rem'), top: '-12rem', left: '-10rem' }} className="float-slow" />
      <div style={{ ...ds.orb(colors.bgPink, '26rem'), top: '15%', right: '-12rem' }} className="float-medium" />
      <div style={{ ...ds.orb(colors.warmSoft, '22rem'), bottom: '5%', left: '10%' }} className="float-fast" />
      <div style={{ ...ds.orb(colors.bgBlue, '20rem'), bottom: '-6rem', right: '15%' }} className="float-x" />
      <div style={{ ...ds.orb(colors.bgGreen, '18rem'), top: '40%', left: '50%' }} className="float-slow" />

      {[
        { Icon: Star, x: '7%', y: '15%', size: 28, color: colors.warm, opacity: 0.12, anim: 'float-slow' },
        { Icon: Puzzle, x: '88%', y: '30%', size: 24, color: colors.accent, opacity: 0.1, anim: 'float-medium' },
        { Icon: Lightbulb, x: '10%', y: '70%', size: 22, color: colors.warm, opacity: 0.08, anim: 'float-fast' },
        { Icon: Heart, x: '90%', y: '55%', size: 26, color: colors.accent, opacity: 0.1, anim: 'float-x' },
        { Icon: TreePine, x: '85%', y: '80%', size: 24, color: colors.primary, opacity: 0.08, anim: 'float-slow' },
        { Icon: Palette, x: '15%', y: '45%', size: 20, color: colors.accent, opacity: 0.07, anim: 'float-medium' },
        { Icon: Sparkles, x: '50%', y: '10%', size: 18, color: colors.primary, opacity: 0.1, anim: 'float-x' },
        { Icon: Globe, x: '75%', y: '15%', size: 22, color: colors.primary, opacity: 0.06, anim: 'float-fast' },
      ].map(({ Icon, x, y, size, color, opacity, anim }, i) => (
        <div key={i} style={{ position: 'absolute', top: y, left: x, opacity }} className={anim}>
          <Icon style={{ width: `${size}px`, height: `${size}px`, color }} />
        </div>
      ))}

      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle, ${colors.primaryLight}12 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        opacity: 0.4,
      }} />
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  return (
    <nav style={ds.nav}>
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{ ...ds.logoMark, width: '40px', height: '40px', borderRadius: '0.875rem' }}>
              <Flower2 style={{ width: '22px', height: '22px' }} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', ...ds.textGradient }}>Arizen School</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/auth/login" style={{ ...ds.btnGhost, fontWeight: 700 }}>Sign In</Link>
            <Link href="/auth/register" style={{ ...ds.btnPrimary, fontSize: '0.875rem', padding: '0.65rem 1.6rem' }}>Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      paddingTop: '9rem',
      paddingBottom: '5rem',
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
    }}>
      <FloatingDecorations />

      <div style={{ position: 'relative', maxWidth: '56rem', margin: '0 auto', textAlign: 'center' }}>
        <div className="fade-in-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          borderRadius: '9999px', padding: '0.45rem 1.25rem', marginBottom: '2.5rem',
          background: `linear-gradient(135deg, ${colors.primarySoft}, white)`,
          border: `1.5px solid ${colors.primaryLight}`,
          boxShadow: `0 2px 12px ${colors.primarySoft}`,
        }}>
          <Sparkles style={{ width: '14px', height: '14px', color: colors.primary }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: colors.primary, letterSpacing: '0.06em' }}>
            Emotionally Intelligent Learning
          </span>
        </div>

        <h1 className="fade-in-up" style={{
          fontSize: 'clamp(2.25rem, 5.5vw, 3.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.035em',
          lineHeight: 1.1,
          color: colors.textHeading,
          marginBottom: '1.75rem',
          animationDelay: '0.1s',
        }}>
          A personalized learning
          <br />
          <span style={ds.textGradient}>experience</span> for{' '}
          <span style={{ color: colors.primary }}>your child</span>
        </h1>

        <p className="fade-in-up" style={{
          fontSize: 'clamp(1rem, 2vw, 1.125rem)',
          lineHeight: 1.75,
          color: colors.textMuted,
          maxWidth: '34rem',
          margin: '0 auto 3rem',
          fontWeight: 500,
          animationDelay: '0.2s',
        }}>
          A personalized, emotionally intelligent learning system for your child.
          Where curiosity meets calm, and every lesson feels like a{' '}
          <span style={{ color: colors.primary, fontWeight: 700 }}>gentle adventure</span>.
        </p>

        <div className="fade-in-up" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '1rem', marginBottom: '4.5rem',
          animationDelay: '0.3s',
        }}>
          <Link href="/auth/register" style={{
            ...ds.btnPrimary,
            width: '100%', maxWidth: '300px',
            fontSize: '1.0625rem', padding: '1.0625rem 2.25rem',
            gap: '0.625rem', textDecoration: 'none',
          }}>
            Get Started Free <ArrowRight style={{ width: '18px', height: '18px' }} />
          </Link>
          <Link href="/auth/login" style={{
            ...ds.btnOutline,
            width: '100%', maxWidth: '300px',
            fontSize: '1rem', padding: '1rem 2.25rem',
            textDecoration: 'none',
          }}>
            I Have an Account
          </Link>
        </div>

        <div className="fade-in-up" style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'center', gap: '2.5rem',
          animationDelay: '0.4s',
        }}>
          {[
            { icon: Heart, label: "Emotionally Safe", color: colors.accent },
            { icon: Shield, label: "Privacy First", color: colors.primary },
            { icon: Sun, label: "Joyful Learning", color: colors.warm },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}12`,
                boxShadow: `0 2px 8px ${color}10`,
              }}>
                <Icon style={{ width: '17px', height: '17px', color }} />
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: colors.textMuted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Stats Bar ─── */
function StatsBar() {
  return (
    <section style={{ padding: '0 1.5rem 4rem', position: 'relative' }}>
      <div style={{
        maxWidth: '56rem', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px',
        background: colors.borderLight,
        borderRadius: '1.5rem',
        overflow: 'hidden',
        boxShadow: shadows.md,
      }}>
        {[
          { value: 'Fun', label: 'Learning style' },
          { value: 'Safe', label: 'Environment' },
          { value: 'CBC', label: 'Curriculum' },
          { value: 'Free', label: 'To get started' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'white', padding: '2rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.375rem', fontWeight: 900, color: colors.primary, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.02em' }}>
              {stat.label}
            </div>
          </div>
        ))}
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
      desc: "Track progress, celebrate milestones, and support your child's unique learning journey.",
      gradient: `linear-gradient(160deg, ${colors.primarySoft}, white 60%)`,
      iconBg: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
      iconColor: 'white',
      border: colors.primaryLight,
      cta: "Set Up Parent Account",
      ctaColor: colors.primary,
    },
    {
      href: "/auth/register?role=learner",
      icon: GraduationCap,
      title: "I'm a Child",
      desc: "Explore lessons, earn XP, go on quests, and discover the joy of learning!",
      gradient: `linear-gradient(160deg, ${colors.accentSoft}, white 60%)`,
      iconBg: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`,
      iconColor: 'white',
      border: colors.accentLight,
      cta: "Start Learning",
      ctaColor: colors.accent,
    },
    {
      href: "/auth/login",
      icon: BookOpen,
      title: "Sign In",
      desc: "Welcome back! Pick up where you left off — your adventure awaits.",
      gradient: `linear-gradient(160deg, ${colors.warmSoft}, white 60%)`,
      iconBg: `linear-gradient(135deg, ${colors.warm}, ${colors.warmDark})`,
      iconColor: 'white',
      border: colors.warmLight,
      cta: "Continue Learning",
      ctaColor: colors.warm,
    },
  ];

  return (
    <section style={{ padding: '2rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
            fontWeight: 900, letterSpacing: '-0.03em',
            color: colors.textHeading, marginBottom: '0.75rem', lineHeight: 1.15,
          }}>
            How would you like to <span style={ds.textGradient}>join us</span>?
          </h2>
          <p style={{ fontSize: '1rem', color: colors.textMuted, maxWidth: '30rem', margin: '0 auto', fontWeight: 500, lineHeight: 1.7 }}>
            Choose your path and we'll set up the perfect experience.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link key={c.title} href={c.href} className={`scale-in cta-card-hover`} style={{
                textDecoration: 'none', display: 'block',
                borderRadius: '1.75rem', overflow: 'hidden',
                background: c.gradient, border: `1.5px solid ${c.border}`,
                boxShadow: shadows.md,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                animationDelay: `${i * 0.1}s`,
              }}>
                <div style={{ padding: '2.25rem' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem', background: c.iconBg,
                    boxShadow: `0 4px 20px ${colors.primaryLight}40`,
                  }}>
                    <Icon style={{ width: '30px', height: '30px', color: c.iconColor }} />
                  </div>
                  <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: colors.textHeading, marginBottom: '0.625rem', letterSpacing: '-0.02em' }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: '0.9375rem', color: colors.textMuted, lineHeight: 1.65, marginBottom: '1.75rem', fontWeight: 500 }}>
                    {c.desc}
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', color: c.ctaColor }}>
                    {c.cta} <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </div>
                </div>
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
    { icon: Heart, title: "Emotionally Intelligent", desc: "Lessons adapt to your child's emotional state and unique learning pace — no stress, just growth.", gradient: `linear-gradient(135deg, #ffedd5, #fed7aa)`, color: "#ea580c" },
    { icon: TreePine, title: "CBC Aligned", desc: "Curriculum aligned with Kenya's Competency-Based Curriculum for Grades 1–8.", gradient: `linear-gradient(135deg, #d1fae5, #a7f3d0)`, color: "#059669" },
    { icon: Star, title: "Gamified Learning", desc: "XP, streaks, badges, and quests — your child stays motivated and excited to learn.", gradient: `linear-gradient(135deg, #ccfbf1, #99f6e4)`, color: "#0d9488" },
    { icon: Globe, title: "World Cultures", desc: "Explore diverse cultures, languages, and perspectives from around the globe.", gradient: `linear-gradient(135deg, #e0f2fe, #bae6fd)`, color: "#0284c7" },
    { icon: Palette, title: "Creative Expression", desc: "Art, music, storytelling, and hands-on projects that nurture creativity.", gradient: `linear-gradient(135deg, #fef9c3, #fef08a)`, color: "#ca8a04" },
    { icon: Shield, title: "Safe & Private", desc: "Your family's data is protected. No ads, no tracking, no compromises.", gradient: `linear-gradient(135deg, #fce7f3, #fbcfe8)`, color: "#be185d" },
  ];

  return (
    <section style={{ padding: '4rem 1.5rem 6rem', background: colors.bgSoft, borderRadius: '3rem 3rem 0 0' }}>
      <div style={{ maxWidth: '68rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1.25rem',
            background: colors.primarySoft, border: `1px solid ${colors.primaryLight}`,
          }}>
            <CheckCircle2 style={{ width: '14px', height: '14px', color: colors.primary }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: colors.primary, letterSpacing: '0.06em' }}>
              Why Parents Love Us
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 900, letterSpacing: '-0.03em', color: colors.textHeading, marginBottom: '0.75rem', lineHeight: 1.15 }}>
            Every child learns <span style={ds.textGradient}>differently</span>
          </h2>
          <p style={{ fontSize: '1rem', color: colors.textMuted, maxWidth: '32rem', margin: '0 auto', fontWeight: 500, lineHeight: 1.7 }}>
            Arizen School meets each learner exactly where they are — and helps them grow.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={`fade-in-up feature-card-hover`} style={{
                background: 'white', borderRadius: '1.5rem',
                border: `1px solid ${colors.borderLight}`, padding: '2rem',
                boxShadow: shadows.sm, animationDelay: `${i * 0.08}s`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '1.375rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.375rem', background: f.gradient,
                  boxShadow: `0 4px 16px ${f.color}20`,
                }}>
                  <Icon style={{ width: '28px', height: '28px', color: f.color }} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: colors.textHeading, marginBottom: '0.625rem', letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.9375rem', color: colors.textMuted, lineHeight: 1.65, fontWeight: 500 }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Bottom CTA ─── */
function BottomCTA() {
  return (
    <section style={{
      padding: '5rem 1.5rem 6rem',
      background: `linear-gradient(160deg, ${colors.primarySoft}, ${colors.bgBlue}, ${colors.bgGreen})`,
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-5rem', left: '50%', transform: 'translateX(-50%)',
        width: '20rem', height: '20rem', borderRadius: '50%',
        background: colors.primarySoft, filter: 'blur(80px)', opacity: 0.5,
      }} />
      <div style={{ position: 'relative' }}>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 900,
          letterSpacing: '-0.03em', color: colors.textHeading,
          marginBottom: '1rem', lineHeight: 1.15,
        }}>
          Ready to start your child's
          <br />
          <span style={ds.textGradient}>learning adventure</span>?
        </h2>
        <p style={{
          fontSize: '1.0625rem', color: colors.textMuted,
          maxWidth: '28rem', margin: '0 auto 2.5rem',
          fontWeight: 500, lineHeight: 1.7,
        }}>
          Join families who've discovered a better way to learn — personalized, joyful, and safe.
        </p>
        <Link href="/auth/register" style={{
          ...ds.btnPrimary, fontSize: '1.0625rem', padding: '1.125rem 2.5rem',
          gap: '0.625rem', textDecoration: 'none',
          boxShadow: `0 8px 32px ${colors.primary}30`,
        }}>
          Get Started — It's Free <Sparkles style={{ width: '18px', height: '18px' }} />
        </Link>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer style={{ padding: '2.5rem 1.5rem', borderTop: `1px solid ${colors.borderLight}`, background: colors.bgSoft }}>
      <div style={{ maxWidth: '68rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ ...ds.logoMark, width: '34px', height: '34px', borderRadius: '0.75rem' }}>
            <Flower2 style={{ width: '18px', height: '18px' }} />
          </div>
          <span style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.01em', ...ds.textGradient }}>Arizen School</span>
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
        <StatsBar />
        <CTACards />
        <FeaturesSection />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
