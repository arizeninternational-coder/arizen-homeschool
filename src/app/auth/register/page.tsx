"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Flower2, Mail, Lock, User, AlertCircle, ArrowLeft,
  Eye, EyeOff, GraduationCap, Users, Loader2,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "learner";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    grade: "5",
    role: initialRole === "parent" ? "PARENT" : "LEARNER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          displayName: form.displayName || form.name,
          grade: parseInt(form.grade),
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      // Auto-login after registration
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/auth/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isParent = form.role === "PARENT";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[rgb(var(--color-cream))] via-[rgb(245,243,255)] to-[rgb(240,249,255)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(237,233,254,0.3)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(236,253,245,0.2)' }} />
      </div>

      {/* Header */}
      <header className="relative px-4 sm:px-6 pt-5 pb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: 'rgb(var(--color-text-muted))' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Main content */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-[440px]">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105" style={{ background: 'linear-gradient(135deg, rgb(var(--color-primary)), #7c3aed)' }}>
                <Flower2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold gradient-text">Arizen School</span>
            </Link>

            <h1 className="heading-lg mb-2">Create your account</h1>
            <p className="text-body">Join Arizen and start your learning adventure.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-2xl p-1.5 mb-6 border" style={{ background: 'rgb(var(--color-surface-soft))', borderColor: 'rgba(226,232,240,0.5)' }}>
            <button
              type="button"
              onClick={() => update("role", "LEARNER")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={!isParent ? { background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', color: 'rgb(var(--color-primary))' } : { color: 'rgb(var(--color-text-muted))' }}
            >
              <GraduationCap className="w-4 h-4" />
              I&apos;m a Child
            </button>
            <button
              type="button"
              onClick={() => update("role", "PARENT")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={isParent ? { background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', color: 'rgb(var(--color-primary))' } : { color: 'rgb(var(--color-text-muted))' }}
            >
              <Users className="w-4 h-4" />
              I&apos;m a Parent
            </button>
          </div>

          {/* Form Card */}
          <div className="card-glass p-7 sm:p-8">
            {error && (
              <div className="alert-error">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="label" htmlFor="name">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(100,116,139,0.5)' }} />
                  <input id="name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" required className="input-field pl-11" />
                </div>
              </div>

              {/* Display Name (child only) */}
              {!isParent && (
                <div>
                  <label className="label" htmlFor="displayName">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(100,116,139,0.5)' }} />
                    <input id="displayName" type="text" value={form.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="What should we call you?" className="input-field pl-11" />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="label" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(100,116,139,0.5)' }} />
                  <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required autoComplete="email" className="input-field pl-11" />
                </div>
              </div>

              {/* Grade (child only) */}
              {!isParent && (
                <div>
                  <label className="label" htmlFor="grade">Grade</label>
                  <select id="grade" value={form.grade} onChange={(e) => update("grade", e.target.value)} className="input-field">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(100,116,139,0.5)' }} />
                  <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" required autoComplete="new-password" className="input-field pl-11 pr-11" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity" style={{ color: 'rgba(100,116,139,0.5)' }} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(100,116,139,0.5)' }} />
                  <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat your password" required autoComplete="new-password" className="input-field pl-11" />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-primary w-full" style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 spinner" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>

          {/* Login link */}
          <p className="text-center mt-6 text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold transition-opacity hover:opacity-80" style={{ color: 'rgb(var(--color-primary))' }}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgb(var(--color-cream))' }}>
        <div className="w-14 h-14 rounded-3xl flex items-center justify-center" style={{ background: 'rgb(var(--color-lavender-light))' }}>
          <Flower2 className="w-7 h-7" style={{ color: 'rgb(var(--color-primary))' }} />
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
