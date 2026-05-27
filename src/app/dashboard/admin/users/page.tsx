"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Plus, Search } from "lucide-react";
import { ds, colors } from "@/lib/design-system";
export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/auth/session").then(r=>r.json()).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}><p style={{ color: colors.textMuted }}>Loading...</p></div>;
  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/dashboard/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}><ArrowLeft style={{ width: 16, height: 16 }} /> Back to Admin Dashboard</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.text, marginBottom: '0.25rem' }}>Users</h1>
            <p style={{ color: colors.textMuted }}>Manage all user accounts in the system.</p>
          </div>
          <button style={{ ...ds.btnPrimary, cursor: 'default', fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}><Plus style={{ width: 14, height: 14 }} /> Add User</button>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: colors.textMuted }} />
            <input placeholder="Search users by name or email..." style={{ ...ds.input, paddingLeft: '2.5rem', fontSize: '0.875rem' }} readOnly />
          </div>
        </div>
        <div style={{ ...ds.card, textAlign: 'center', padding: '3rem 2rem' }}>
          <Users style={{ width: 48, height: 48, color: colors.primary, margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text, marginBottom: '0.5rem' }}>User management coming soon</h3>
          <p style={{ color: colors.textMuted, fontSize: '0.9375rem', maxWidth: 400, margin: '0 auto' }}>Full user CRUD functionality is being built. You can create new users via the registration page.</p>
        </div>
      </div>
    </div>
  );
}
