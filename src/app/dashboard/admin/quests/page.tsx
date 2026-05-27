"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, ArrowLeft } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

export default function Page() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/auth/session").then(r=>r.json()).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}><p style={{ color: colors.textMuted }}>Loading...</p></div>;
  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/dashboard/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}><ArrowLeft style={{ width: 16, height: 16 }} /> Back to Admin Dashboard</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.text, marginBottom: '0.5rem' }}>Quests</h1>
        <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>Design and organize quests within themes.</p>
        <div style={{ ...ds.card, textAlign: 'center', padding: '3rem 2rem' }}>
          <Layers style={{ width: 48, height: 48, color: colors.primary, margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text, marginBottom: '0.5rem' }}>Quest management coming soon</h3>
          <p style={{ color: colors.textMuted, fontSize: '0.9375rem', maxWidth: 400, margin: '0 auto' }}>This module is under development. Full quest CRUD functionality will be available here.</p>
        </div>
      </div>
    </div>
  );
}
