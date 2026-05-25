"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Flower2, Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Show error from NextAuth redirect
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      const messages: Record<string, string> = {
        CredentialsSignin: "Invalid email or password. Please try again.",
        SessionExpired: "Your session has expired. Please sign in again.",
        AccessDenied: "Access denied. Please sign in first.",
      };
      setError(messages[err] || "Something went wrong. Please try again.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email: email.toLowerCase().trim(), password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.bgSoft} 100%)` }}>
      {/* BG orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '-8rem', right: '-8rem', width: '24rem', height: '24rem', borderRadius: '50%', filter: 'blur(64px)', background: colors.primarySoft }} />
        <div style={{ position: 'absolute', bottom: '-8rem', left: '-8rem', width: '24rem', height: '24rem', borderRadius: '50%', filter: 'blur(64px)', background: colors.accentSoft }} />
      </div>

      {/* Header */}
      <header style={{ position: 'relative', padding: '1.25rem 1rem 0.75rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: colors.textMuted, textDecoration: 'none' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Home
        </Link>
      </header>

      {/* Main */}
      <main style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{ ...ds.logoMark, width: '44px', height: '44px' }}>
                <Flower2 style={{ width: '24px', height: '24px' }} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, ...ds.textGradient }}>Arizen School</span>
            </Link>
            <h1 style={{ ...ds.headingLg, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Welcome back</h1>
            <p style={ds.textBody}>Sign in to continue your learning journey.</p>
          </div>

          {/* Card */}
          <div style={ds.cardFlat}>
            {error && (
              <div style={ds.alertError}>
                <AlertCircle style={{ width: '20px', height: '20px', color: colors.danger, flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.875rem', color: colors.danger }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={ds.label} htmlFor="email">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: colors.textMuted }} />
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" style={{ ...ds.input, paddingLeft: '2.75rem' }} />
                </div>
              </div>

              <div>
                <label style={ds.label} htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: colors.textMuted }} />
                  <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" style={{ ...ds.input, paddingLeft: '2.75rem', paddingRight: '2.75rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: 0 }}>
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ ...ds.btnPrimary, width: '100%', padding: '0.875rem', marginTop: '0.25rem', opacity: loading ? 0.6 : 1 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader2 style={{ width: '16px', height: '16px' }} className="spinner" /> Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: colors.textMuted }}>
            Don't have an account?{" "}
            <Link href="/auth/register" style={{ fontWeight: 700, color: colors.primary, textDecoration: 'none' }}>Create one free</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.primarySoft }}>
          <Flower2 style={{ width: '28px', height: '28px', color: colors.primary }} />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
