import Link from "next/link";
import {
  Heart,
  BookOpen,
  Sparkles,
  Shield,
  ChevronRight,
  GraduationCap,
  Users,
  Flower2,
  Sun,
  Star,
  TreePine,
  Palette,
  Globe,
} from "lucide-react";

/* ─── Floating Background Orbs ─── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-lavender-light/40 rounded-full blur-3xl float-slow" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-light/30 rounded-full blur-3xl float-medium" />
      <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-green-light/30 rounded-full blur-3xl float-fast" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-peach-light/20 rounded-full blur-3xl float-medium" />
    </div>
  );
}

/* ─── Navigation ─── */
function Navbar() {
  return (
    <nav className="navbar">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow">
              <Flower2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold gradient-text">Arizen School</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm py-2">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm !py-2.5 !px-5">
              Get Started
            </Link>
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
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-lavender-light/60 border border-lavender-soft/40 px-4 py-1.5 mb-8 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Emotionally Intelligent Learning</span>
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
          <Link href="/auth/register" className="btn-primary text-base !px-8 !py-3.5 w-full sm:w-auto">
            Get Started Free
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/auth/login" className="btn-secondary text-base !px-8 !py-3.5 w-full sm:w-auto">
            I Have an Account
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { icon: Heart, label: "Emotionally Safe" },
            { icon: Shield, label: "Privacy First" },
            { icon: Sun, label: "Joyful Learning" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-text-muted">
              <Icon className="w-4 h-4 text-lavender" />
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
  return (
    <section className="relative px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="heading-lg text-center mb-3 text-balance">How would you like to join?</h2>
        <p className="text-body text-center mb-10 max-w-lg mx-auto">
          Choose your path and we&apos;ll set up the perfect experience for you.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Parent Card */}
          <Link
            href="/auth/register?role=parent"
            className="group card-glass-hover p-7 text-center md:text-left"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-light to-lavender-soft flex items-center justify-center mx-auto md:mx-0 mb-5 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="heading-md mb-2">I&apos;m a Parent</h3>
            <p className="text-body mb-4 text-balance">
              Support your child&apos;s learning journey. Track progress and celebrate milestones together.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all">
              Start as Parent <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Child Card */}
          <Link
            href="/auth/register?role=learner"
            className="group card-glass-hover p-7 text-center md:text-left"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-light to-green-soft flex items-center justify-center mx-auto md:mx-0 mb-5 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-7 h-7 text-green" />
            </div>
            <h3 className="heading-md mb-2">I&apos;m a Child</h3>
            <p className="text-body mb-4 text-balance">
              Explore amazing lessons, earn XP, and go on quests! Your adventure starts here.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-green group-hover:gap-2 transition-all">
              Start Learning <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Sign In Card */}
          <Link
            href="/auth/login"
            className="group card-glass-hover p-7 text-center md:text-left"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-light to-blue-soft flex items-center justify-center mx-auto md:mx-0 mb-5 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-7 h-7 text-blue" />
            </div>
            <h3 className="heading-md mb-2">Sign In</h3>
            <p className="text-body mb-4 text-balance">
              Welcome back! Access your account and pick up right where you left off.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-blue group-hover:gap-2 transition-all">
              Sign In Now <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Features Section ─── */
function FeaturesSection() {
  const features = [
    {
      icon: Heart,
      title: "Emotionally Intelligent",
      description: "Lessons adapt to your child's emotional state and learning pace. No stress, only growth.",
      color: "from-peach-light to-peach-soft",
      iconColor: "text-peach",
    },
    {
      icon: TreePine,
      title: "CBC Aligned",
      description: "Curriculum aligned with Kenya's Competency-Based Curriculum, designed for Grades 1–8.",
      color: "from-green-light to-green-soft",
      iconColor: "text-green",
    },
    {
      icon: Star,
      title: "Gamified Learning",
      description: "XP, streaks, badges, and quests — your child stays motivated while having fun.",
      color: "from-lavender-light to-lavender-soft",
      iconColor: "text-primary",
    },
    {
      icon: Globe,
      title: "World Cultures",
      description: "Explore diverse cultures, languages, and perspectives from around the globe.",
      color: "from-blue-light to-blue-soft",
      iconColor: "text-blue",
    },
    {
      icon: Palette,
      title: "Creative Expression",
      description: "Art, music, storytelling, and hands-on projects that nurture creativity.",
      color: "from-lavender-light to-peach-light",
      iconColor: "text-primary",
    },
    {
      icon: Shield,
      title: "Safe & Private",
      description: "Your family's data is protected. No ads, no tracking, no compromises.",
      color: "from-green-light to-blue-light",
      iconColor: "text-green",
    },
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
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card-hover p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="heading-sm mb-2">{feature.title}</h3>
                <p className="text-body text-balance">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Social Proof / Calm Section ─── */
function CalmSection() {
  return (
    <section className="relative px-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="card-glass p-8 md:p-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-accent text-accent" />
            ))}
          </div>
          <blockquote className="text-body-lg italic mb-6 text-balance" style={{ color: "rgb(var(--color-text) / 0.8)" }}>
            &ldquo;Learning should feel like a warm hug, not a test. Arizen School understands
            that children grow best when they feel safe, seen, and celebrated.&rdquo;
          </blockquote>
          <p className="text-sm font-bold text-primary">— The Arizen Philosophy</p>
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
        <h2 className="heading-lg mb-4 text-balance">Ready to begin?</h2>
        <p className="text-body mb-8 max-w-lg mx-auto">
          Join families who are reimagining education — one gentle lesson at a time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register" className="btn-primary text-base !px-8 !py-3.5 w-full sm:w-auto">
            Create Free Account
          </Link>
          <Link href="/auth/login" className="btn-secondary text-base !px-8 !py-3.5 w-full sm:w-auto">
            Existing Account
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-border/30 py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Flower2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold gradient-text">Arizen School</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/auth/login" className="text-xs font-medium text-text-muted hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/auth/register" className="text-xs font-medium text-text-muted hover:text-primary transition-colors">
            Register
          </Link>
        </div>

        <p className="text-xs text-text-muted/60">
          © {new Date().getFullYear()} Arizen International. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <CTACards />
        <FeaturesSection />
        <CalmSection />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
