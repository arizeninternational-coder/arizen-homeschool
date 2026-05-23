"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Mail, Lock, AlertCircle } from "lucide-react";

const demoAccounts = [
  { email: "ariadne@arizen.local", password: "demo123", name: "Ariadne", grade: 5, xp: 2450, streak: 7, color: "from-amber-500 to-red-500" },
  { email: "ariyana@arizen.local", password: "demo123", name: "Ariyana", grade: 2, xp: 890, streak: 3, color: "from-pink-400 to-purple-500" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) setError(result.error);
      else { router.push("/"); router.refresh(); }
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  async function quickLogin(account: typeof demoAccounts[0]) {
    setLoading(true);
    const result = await signIn("credentials", { email: account.email, password: account.password, redirect: false });
    if (result?.error) setError(result.error);
    else { router.push("/"); router.refresh(); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">Welcome to Arizen</h1>
          <p className="text-sm text-text-muted mt-1">Choose a learner account to continue</p>
        </div>

        {/* Quick login buttons */}
        <div className="space-y-3 mb-6">
          {demoAccounts.map(account => (
            <button
              key={account.email}
              onClick={() => quickLogin(account)}
              disabled={loading}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface-raised hover:shadow-card-hover hover:border-border-strong transition-all text-left`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center text-white font-bold text-lg`}>
                {account.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text">{account.name}</p>
                <p className="text-xs text-text-muted">Grade {account.grade} • {account.xp} XP • 🔥 {account.streak} day streak</p>
              </div>
              <span className="text-xs font-semibold text-primary">Login →</span>
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center"><span className="bg-surface px-3 text-xs text-text-muted">or sign in with email</span></div>
        </div>

        {/* Email/password form */}
        <div className="bg-surface-raised rounded-2xl border border-border p-6 shadow-card">
          {error && (
            <div className="flex items-center gap-2 bg-danger/10 text-danger rounded-xl p-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@arizen.local" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="demo123" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-xs text-text-muted text-center mt-3">Password for all demo accounts: <strong>demo123</strong></p>
        </div>
      </div>
    </div>
  );
}
