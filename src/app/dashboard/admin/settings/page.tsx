"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Bell, Shield, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (data?.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-main"><p className="text-text-muted">Loading...</p></div>;
  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-[600px] mx-auto py-6 px-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-text-muted hover:text-text text-sm font-semibold transition-colors no-underline">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/40 text-text-muted hover:bg-white/80 cursor-pointer text-xs font-semibold transition-all">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
        <h1 className="text-2xl font-extrabold text-text mb-6">Settings</h1>
        <div className="rounded-[1.5rem] bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/40">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xl font-extrabold shadow-[0_0_16px_rgba(79,70,229,0.2)]">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <div className="font-bold text-text">{user?.email || "Admin"}</div>
              <div className="text-sm text-text-muted">{user?.role || "System Administrator"}</div>
            </div>
          </div>
          {[
            { label: "Email Notifications", desc: "Receive system alerts", on: false, icon: Bell },
            { label: "Weekly Summary", desc: "Activity digest email", on: true, icon: User },
            { label: "Maintenance Mode", desc: "Temporarily disable access", on: false, icon: Shield },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-4 border-b border-white/30 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-text text-sm">{s.label}</div>
                  <div className="text-xs text-text-muted">{s.desc}</div>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${s.on ? "bg-primary" : "bg-bg-main"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${s.on ? "right-0.5" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
