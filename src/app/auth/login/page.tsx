"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Flower2, Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { ds, colors, gradients, shadows } from "@/lib/design-system";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      console.log("[LOGIN] Attempting sign in for:", email.toLowerCase().trim());
      const result = await signIn("credentials", { email: email.toLowerCase().trim(), password, redirect: false });
      console.log("[LOGIN] signIn result:", JSON.stringify(result));
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        console.log("[LOGIN] Success, redirecting...");
        window.location.href = "/";
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.error("[LOGIN] Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: colors.bg }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
        <div style={{ ...ds.orb(colors.primarySoft, '32rem'), top: '-12rem', right: '-10rem', opacity: 0.35 }} className="float-slow" />
        <div style={{ ...ds.orb(colors.accentSoft, '28rem'), bottom: '-10rem', left: '-8rem', opacity: 0.25 }} className="float-medium" />
        <div style={{ ...ds.orb(colors.warmSoft, '20rem'), top: '40%', right: '10%', opacity: 0.2 }} className="float-fast" />
      </div>

      {/* Header */}
      <header style={{ position: 'relative', padding: '1.25rem 1rem 0.75rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: colors.textMuted, textDecoration: 'none', transition: 'color 0.2s' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Home
        </Link>
      </header>

      {/* Main */}
      <main style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem 3rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }} className="fade-in-up">
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
              <div style={{ ...ds.logoMark, width: '48px', height: '48px' }}>
                <Flower2 style={{ width: '26px', height: '26px' }} />
              </div>
              <span style={{ fontSize: '1.375rem', fontWeight: 900, ...ds.textGradient }}>Arizen School</span>
            </Link>
            <h1 style={{ ...ds.headingLg, marginBottom: '0.5rem' }}>Welcome back</h1>
            <p style={ds.textBody}>Sign in to continue your learning journey.</p>
          </div>

          {/* Card */}
          <div style={ds.cardGlass}>
            {error && (
              <div style={ds.alertError} className="fade-in">
                <AlertCircle style={{ width: '20px', height: '20px', color: colors.danger, flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.875rem', color: colors.danger, fontWeight: 600 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={ds.label} htmlFor="email">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: colors.textMuted }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    style={{ ...ds.input, paddingLeft: '2.75rem' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`; e.currentTarget.style.background = 'white'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = colors.bgSoft; }}
                  />
                </div>
              </div>

              <div>
                <label style={ds.label} htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: colors.textMuted }} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    style={{ ...ds.input, paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`; e.currentTarget.style.background = 'white'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = colors.bgSoft; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: 0, display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                ...ds.btnPrimary,
                width: '100%',
                padding: '0.9375rem',
                marginTop: '0.25rem',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                gap: '0.5rem',
              }}>
                {loading ? (
                  <>
                    <Loader2 style={{ width: '18px', height: '18px' }} className="spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Sparkles style={{ width: '16px', height: '16px' }} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer link */}
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: colors.textMuted, fontWeight: 600 }}>
            Don't have an account?{" "}
            <Link href="/auth/register" style={{ fontWeight: 800, color: colors.primary, textDecoration: 'none' }}>Create one free</Link>
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
