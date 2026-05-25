"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flower2, Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[rgb(var(--color-cream))] via-[rgb(245,243,255)] to-[rgb(240,249,255)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(237,233,254,0.3)' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(224,242,254,0.2)' }} />
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
      <main className="relative flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[420px]">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105" style={{ background: 'linear-gradient(135deg, rgb(var(--color-primary)), #7c3aed)' }}>
                <Flower2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold gradient-text">Arizen School</span>
            </Link>

            <h1 className="heading-lg mb-2">Welcome back</h1>
            <p className="text-body">Sign in to continue your learning journey.</p>
          </div>

          {/* Login Card */}
          <div className="card-glass p-7 sm:p-8">
            {error && (
              <div className="alert-error">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(100,116,139,0.5)' }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(100,116,139,0.5)' }} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                    style={{ color: 'rgba(100,116,139,0.5)' }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
                style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 spinner" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Register link */}
          <p className="text-center mt-6 text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-bold transition-opacity hover:opacity-80" style={{ color: 'rgb(var(--color-primary))' }}>
              Create one free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
