import Link from "next/link";
import {
  Heart, BookOpen, Sparkles, Shield, ChevronRight,
  GraduationCap, Users, Flower2, Sun, Star, TreePine,
  Palette, Globe,
} from "lucide-react";

/* ─── Floating Background Orbs ─── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl float-slow" style={{ background: 'rgba(237,233,254,0.4)' }} />
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full blur-3xl float-medium" style={{ background: 'rgba(224,242,254,0.3)' }} />
      <div className="absolute -bottom-20 left-1/3 w-64 h-64 rounded-full blur-3xl float-fast" style={{ background: 'rgba(236,253,245,0.3)' }} />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full blur-3xl float-medium" style={{ background: 'rgba(255,237,213,0.2)' }} />
    </div>
  );
}

/* ─── Navigation ─── */
function Navbar() {
  return (
    <nav className="navbar">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105" style={{ background: 'linear-gradient(135deg, rgb(var(--color-primary)), #7c3aed)' }}>
              <Flower2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold gradient-text">Arizen School</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm py-2">Sign In</Link>
            <Link href="/auth/register" className="btn-primary text-sm" style={{ padding: '0.625rem 1.25rem' }}>Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4">
      <FloatingOrbs />
      <div className="relative max-w-3xl mx-auto text-center">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm" style={{ background: 'rgba(237,233,254,0.6)', border: '1px solid rgba(221,214,254,0.4)' }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'rgb(var(--color-primary))' }} />
          <span className="text-xs font-semibold" style={{ color: 'rgb(var(--color-primary))' }}>Emotionally Intelligent Learning</span>
        </div>

        {/* Main heading */}
        <h1 className="heading-xl text-balance mb-6">
          Welcome to{" "}
          <span className="gradient-text">Arizen School</span>
        </h1>

        {/* Subtitle */}
        <p className="text-body-lg max-w-2xl mx-auto mb-10 text-balance">
          A personalized, emotionally intelligent learning system for your child.
          Where curiosity meets calm, and every lesson feels like a gentle adventure.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/auth/register" className="btn-primary text-base w-full sm:w-auto" style={{ padding: '0.875rem 2rem' }}>
            Get Started Free
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/auth/login" className="btn-secondary text-base w-full sm:w-auto" style={{ padding: '0.875rem 2rem' }}>
            I Have an Account
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { icon: Heart, label: "Emotionally Safe", color: 'rgb(var(--color-lavender))' },
            { icon: Shield, label: "Privacy First", color: 'rgb(var(--color-green))' },
            { icon: Sun, label: "Joyful Learning", color: 'rgb(var(--color-accent))' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2" style={{ color: 'rgb(var(--color-text-muted))' }}>
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Cards Section ─── */
function CTACards() {
  const cards = [
    {
      href: "/auth/register?role=parent",
      icon: Users,
      title: "I'm a Parent",
      description: "Support and track your child's learning journey. Celebrate milestones together.",
      gradient: "linear-gradient(135deg, rgba(237,233,254,0.5), rgba(221,214,254,0.5))",
      iconColor: "rgb(var(--color-primary))",
      textColor: "rgb(var(--color-primary))",
    },
    {
      href: "/auth/register?role=learner",
      icon: GraduationCap,
      title: "I'm a Child",
      description: "Explore amazing lessons, earn XP, and go on quests! Your adventure starts here.",
      gradient: "linear-gradient(135deg, rgba(236,253,245,0.5), rgba(167,243,208,0.5))",
      iconColor: "rgb(var(--color-green))",
      textColor: "rgb(var(--color-green))",
    },
    {
      href: "/auth/login",
      icon: BookOpen,
      title: "Sign In",
      description: "Welcome back! Access your account and pick up right where you left off.",
      gradient: "linear-gradient(135deg, rgba(224,242,254,0.5), rgba(186,230,253,0.5))",
      iconColor: "rgb(var(--color-blue))",
      textColor: "rgb(var(--color-blue))",
    },
  ];

  return (
    <section className="relative px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="heading-lg text-center mb-3 text-balance">How would you like to join?</h2>
        <p className="text-body text-center mb-10 max-w-lg mx-auto">
          Choose your path and we'll set up the perfect experience for you.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group card-glass-hover p-7 text-center md:text-left"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: card.gradient }}
                >
                  <Icon className="w-7 h-7" style={{ color: card.iconColor }} />
                </div>
                <h3 className="heading-md mb-2">{card.title}</h3>
                <p className="text-body mb-4 text-balance">{card.description}</p>
                <span
                  className="inline-flex items-center gap-1 text-sm font-bold transition-all group-hover:gap-2"
                  style={{ color: card.textColor }}
                >
                  Get Started <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Features Section ─── */
function FeaturesSection() {
  const features = [
    { icon: Heart, title: "Emotionally Intelligent", description: "Lessons adapt to your child's emotional state and learning pace.", gradient: "linear-gradient(135deg, #ffedd5, #fed7aa)", color: "#ea580c" },
    { icon: TreePine, title: "CBC Aligned", description: "Curriculum aligned with Kenya's Competency-Based Curriculum for Grades 1–8.", gradient: "linear-gradient(135deg, #d1fae5, #a7f3d0)", color: "#059669" },
    { icon: Star, title: "Gamified Learning", description: "XP, streaks, badges, and quests — your child stays motivated.", gradient: "linear-gradient(135deg, #ede9fe, #ddd6fe)", color: "#7c3aed" },
    { icon: Globe, title: "World Cultures", description: "Explore diverse cultures, languages, and perspectives from around the globe.", gradient: "linear-gradient(135deg, #e0f2fe, #bae6fd)", color: "#0284c7" },
    { icon: Palette, title: "Creative Expression", description: "Art, music, storytelling, and hands-on projects that nurture creativity.", gradient: "linear-gradient(135deg, #ede9fe, #ffedd5)", color: "#7c3aed" },
    { icon: Shield, title: "Safe & Private", description: "Your family's data is protected. No ads, no tracking, no compromises.", gradient: "linear-gradient(135deg, #d1fae5, #e0f2fe)", color: "#059669" },
  ];

  return (
    <section className="relative px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-3">Every child learns differently.</h2>
          <p className="text-body max-w-lg mx-auto">
            Arizen School meets each learner where they are — emotionally, academically, and creatively.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card-hover p-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: f.gradient }}>
                  <Icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="heading-sm mb-2">{f.title}</h3>
                <p className="text-body text-balance">{f.description}</p>
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
    <section className="relative px-4 pb-20">
      <div className="max-w-3xl mx-auto text-center">
        <div className="card-glass p-8 md:p-12">
          <h2 className="heading-lg mb-4 text-balance">Ready to begin?</h2>
          <p className="text-body mb-8 max-w-lg mx-auto">
            Join families who are reimagining education — one gentle lesson at a time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="btn-primary text-base w-full sm:w-auto" style={{ padding: '0.875rem 2rem' }}>
              Create Free Account
            </Link>
            <Link href="/auth/login" className="btn-secondary text-base w-full sm:w-auto" style={{ padding: '0.875rem 2rem' }}>
              Existing Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="py-8 px-4" style={{ borderTop: '1px solid rgba(226,232,240,0.3)' }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgb(var(--color-primary)), #7c3aed)' }}>
            <Flower2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold gradient-text">Arizen School</span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(100,116,139,0.6)' }}>
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
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <CTACards />
        <FeaturesSection />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
