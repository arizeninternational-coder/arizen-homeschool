"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, ArrowLeft, Eye, EyeOff, GraduationCap, Users, Loader2, Sparkles } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "learner";

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    displayName: "", grade: "5",
    role: initialRole === "parent" ? "PARENT" : "LEARNER",
  });
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
      if (!res.ok) { setError(data.error || "Failed to create account"); setLoading(false); return; }
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        setError(`Login after registration failed: ${result.error}. Please log in manually.`);
        setLoading(false);
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        const role = sessionData?.user?.role;
        if (role === "ADMIN") window.location.replace("/dashboard/admin");
        else if (role === "PARENT") window.location.replace("/dashboard/parent");
        else window.location.replace("/dashboard/student");
      }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  const isParent = form.role === "PARENT";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-bg-main">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.10)_0%,transparent_60%)] float-slow" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.10)_0%,transparent_60%)] float-medium" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(245,165,36,0.06)_0%,transparent_60%)] float-fast" />
      </div>

      {/* Header */}
      <header className="relative px-4 pt-5 pb-3">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text transition-colors no-underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      {/* Main */}
      <main className="relative flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-[460px] fade-in-up">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-3 no-underline mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(79,70,229,0.25)]">
                A
              </div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
                Arizen School
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold text-text tracking-tight mb-2">Create your account</h1>
            <p className="text-text-muted">Join Arizen and start your learning adventure.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-2xl p-1 mb-6 bg-bg-main/60 border border-white/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <button type="button" onClick={() => update("role", "LEARNER")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-extrabold border-none cursor-pointer transition-all ${
                !isParent
                  ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_16px_rgba(79,70,229,0.2)]"
                  : "text-text-muted bg-transparent"
              }`}>
              <GraduationCap className="w-4 h-4" /> I&apos;m a Child
            </button>
            <button type="button" onClick={() => update("role", "PARENT")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-extrabold border-none cursor-pointer transition-all ${
                isParent
                  ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_16px_rgba(79,70,229,0.2)]"
                  : "text-text-muted bg-transparent"
              }`}>
              <Users className="w-4 h-4" /> I&apos;m a Parent
            </button>
          </div>

          {/* Form Card */}
          <div className="rounded-[1.5rem] bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 lg:p-8">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50/80 border border-red-200/60 px-4 py-3 mb-5 fade-in">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <span className="text-sm text-danger font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-text mb-1.5" htmlFor="name">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input id="name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main/60 border border-white/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:outline-none transition-all placeholder:text-text-muted"
                  />
                </div>
              </div>

              {!isParent && (
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-text mb-1.5" htmlFor="displayName">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input id="displayName" type="text" value={form.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="What should we call you?"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main/60 border border-white/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:outline-none transition-all placeholder:text-text-muted"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-text mb-1.5" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main/60 border border-white/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:outline-none transition-all placeholder:text-text-muted"
                  />
                </div>
              </div>

              {!isParent && (
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-text mb-1.5" htmlFor="grade">Grade</label>
                  <select id="grade" value={form.grade} onChange={(e) => update("grade", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main/60 border border-white/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all cursor-pointer"
                  >
                    {[1,2,3,4,5,6,7,8].map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-text mb-1.5" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" required autoComplete="new-password"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main/60 border border-white/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:outline-none transition-all placeholder:text-text-muted"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-text mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat your password" required autoComplete="new-password"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main/60 border border-white/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:outline-none transition-all placeholder:text-text-muted"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(79,70,229,0.2)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.3)] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 spinner" /> Creating account...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Create Account</>
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-sm text-text-muted font-semibold">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-extrabold text-primary hover:text-primary-dark no-underline">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="w-14 h-14 rounded-3xl bg-primary-soft flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-primary animate-pulse" />
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
