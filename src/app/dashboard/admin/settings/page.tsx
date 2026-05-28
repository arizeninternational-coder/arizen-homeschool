"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, ArrowLeft } from "lucide-react";
import { ds, colors } from "@/lib/design-system";
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
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}><p style={{ color: colors.textMuted }}>Loading...</p></div>;
  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}><ArrowLeft style={{ width: 16, height: 16 }} /> Back to Admin Dashboard</Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>Sign Out</button>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.text, marginBottom: '2rem' }}>Settings</h1>
        <div style={{ ...ds.card, padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 800 }}>{user?.name?.charAt(0) || "A"}</div>
            <div>
              <div style={{ fontWeight: 700, color: colors.text }}>{user?.email || "Admin"}</div>
              <div style={{ fontSize: '0.875rem', color: colors.textMuted }}>{user?.role || "System Administrator"}</div>
            </div>
          </div>
          {[
            { label: "Email Notifications", desc: "Receive system alerts", on: false },
            { label: "Weekly Summary", desc: "Activity digest email", on: true },
            { label: "Maintenance Mode", desc: "Temporarily disable access", on: false },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: `1px solid ${colors.borderLight}` }}>
              <div>
                <div style={{ fontWeight: 600, color: colors.text, fontSize: '0.9375rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.8125rem', color: colors.textMuted }}>{s.desc}</div>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: s.on ? colors.primary : colors.border, position: 'relative' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: s.on ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
