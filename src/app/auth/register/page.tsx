"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Flower2, Mail, Lock, User, AlertCircle, ArrowLeft, Eye, EyeOff, GraduationCap, Users, Loader2 } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "learner";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", displayName: "", grade: "5", role: initialRole === "parent" ? "PARENT" : "LEARNER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(field: string, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email.toLowerCase().trim(),
          password: form.password,
          displayName: form.displayName || form.name,
          grade: parseInt(form.grade),
          role: form.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create account"); return; }
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", { email: form.email.toLowerCase().trim(), password: form.password, redirect: false });
      if (result?.error) { router.push("/auth/login"); } else { router.push("/"); router.refresh(); }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  const isParent = form.role === "PARENT";

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.bgSoft} 100%)` }}>
      {/* BG orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '-8rem', left: '-8rem', width: '24rem', height: '24rem', borderRadius: '50%', filter: 'blur(64px)', background: colors.primarySoft }} />
        <div style={{ position: 'absolute', bottom: '-8rem', right: '-8rem', width: '24rem', height: '24rem', borderRadius: '50%', filter: 'blur(64px)', background: colors.accentSoft }} />
      </div>

      <header style={{ position: 'relative', padding: '1.25rem 1rem 0.75rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: colors.textMuted, textDecoration: 'none' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Home
        </Link>
      </header>

      <main style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem 3rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{ ...ds.logoMark, width: '44px', height: '44px' }}>
                <Flower2 style={{ width: '24px', height: '24px' }} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, ...ds.textGradient }}>Arizen School</span>
            </Link>
            <h1 style={{ ...ds.headingLg, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Create your account</h1>
            <p style={ds.textBody}>Join Arizen and start your learning adventure.</p>
          </div>

          {/* Role Toggle */}
          <div style={{ display: 'flex', borderRadius: '1rem', padding: '0.375rem', marginBottom: '1.5rem', background: colors.bgSoft, border: `1px solid ${colors.border}` }}>
            <button type="button" onClick={() => update("role", "LEARNER")} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', ...(isParent ? { color: colors.textMuted, background: 'transparent' } : { color: colors.primary, background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }) }}>
              <GraduationCap style={{ width: '16px', height: '16px' }} /> I'm a Child
            </button>
            <button type="button" onClick={() => update("role", "PARENT")} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', ...(isParent ? { color: colors.primary, background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: colors.textMuted, background: 'transparent' }) }}>
              <Users style={{ width: '16px', height: '16px' }} /> I'm a Parent
            </button>
          </div>

          {/* Form Card */}
          <div style={ds.cardFlat}>
            {error && (
              <div style={ds.alertError}>
                <AlertCircle style={{ width: '20px', height: '20px', color: colors.danger, flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.875rem', color: colors.danger }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={ds.label} htmlFor="name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: colors.textMuted }} />
                  <input id="name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" required style={{ ...ds.input, paddingLeft: '2.75rem' }} />
                </div>
              </div>

              {!isParent && (
                <div>
                  <label style={ds.label} htmlFor="displayName">Display Name</label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: colors.textMuted }} />
                    <input id="displayName" type="text" value={form.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="What should we call you?" style={{ ...ds.input, paddingLeft: '2.75rem' }} />
                  </div>
                </div>
              )}

              <div>
                <label style={ds.label} htmlFor="email">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: colors.textMuted }} />
                  <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required autoComplete="email" style={{ ...ds.input, paddingLeft: '2.75rem' }} />
                </div>
              </div>

              {!isParent && (
                <div>
                  <label style={ds.label} htmlFor="grade">Grade</label>
                  <select id="grade" value={form.grade} onChange={(e) => update("grade", e.target.value)} style={ds.input}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label style={ds.label} htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: colors.textMuted }} />
                  <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" required autoComplete="new-password" style={{ ...ds.input, paddingLeft: '2.75rem', paddingRight: '2.75rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: 0 }}>
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={ds.label} htmlFor="confirmPassword">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: colors.textMuted }} />
                  <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat your password" required autoComplete="new-password" style={{ ...ds.input, paddingLeft: '2.75rem' }} />
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ ...ds.btnPrimary, width: '100%', padding: '0.875rem', marginTop: '0.25rem', opacity: loading ? 0.6 : 1 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader2 style={{ width: '16px', height: '16px' }} className="spinner" /> Creating account...
                  </span>
                ) : "Create Account"}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: colors.textMuted }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ fontWeight: 700, color: colors.primary, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.primarySoft }}>
          <Flower2 style={{ width: '28px', height: '28px', color: colors.primary }} />
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
