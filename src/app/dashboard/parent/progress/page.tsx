"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

export default function ParentProgressPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => { if (d?.user) setUser(d.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}><p style={{ color: colors.textMuted }}>Loading...</p></div>;

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/dashboard/parent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.text, marginBottom: '0.5rem' }}>Progress</h1>
        <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>Detailed learning progress for each of your children.</p>
        <div style={{ ...ds.card, textAlign: 'center', padding: '3rem 2rem' }}>
          <TrendingUp style={{ width: 48, height: 48, color: colors.primary, margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text, marginBottom: '0.5rem' }}>No progress data yet</h3>
          <p style={{ color: colors.textMuted, fontSize: '0.9375rem', maxWidth: 400, margin: '0 auto' }}>
            Progress tracking will appear here once your children start completing lessons and quests.
          </p>
        </div>
      </div>
    </div>
  );
}
