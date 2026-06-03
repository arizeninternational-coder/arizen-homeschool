"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Invalid email or password. Please try again.");
        setLoading(false);
      } else {
        window.location.replace(data.redirectUrl || "/");
      }
    } catch (err: any) {
      console.error("[LOGIN] Error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-bg-main">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-48 -right-40 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.12)_0%,transparent_60%)] float-slow" />
        <div className="absolute -bottom-40 -left-32 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.10)_0%,transparent_60%)] float-medium" />
        <div className="absolute top-1/2 right-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(245,165,36,0.08)_0%,transparent_60%)] float-fast" />
      </div>

      {/* Header */}
      <header className="relative px-4 pt-5 pb-3">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text transition-colors no-underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      {/* Main */}
      <main className="relative flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-[440px] fade-in-up">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 no-underline mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(79,70,229,0.25)]">
                A
              </div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
                Arizen School
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold text-text tracking-tight mb-2">Welcome back</h1>
            <p className="text-text-muted">Sign in to continue your learning journey.</p>
          </div>

          {/* Card */}
          <div className="rounded-[1.5rem] bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 lg:p-8">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50/80 border border-red-200/60 px-4 py-3 mb-5 fade-in">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <span className="text-sm text-danger font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-text mb-1.5" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="email" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main/60 border border-white/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:outline-none transition-all placeholder:text-text-muted"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-text mb-1.5" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" required autoComplete="current-password"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main/60 border border-white/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:outline-none transition-all placeholder:text-text-muted"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(79,70,229,0.2)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.3)] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                {loading ? (
                  <><Loader2 className="w-4 h-4 spinner" /> Signing in...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Sign In</>
                )}
              </button>
            </form>
          </div>

          {/* Footer link */}
          <p className="text-center mt-6 text-sm text-text-muted font-semibold">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-extrabold text-primary hover:text-primary-dark no-underline">Create one free</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="w-14 h-14 rounded-3xl bg-primary-soft flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-primary animate-pulse" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
