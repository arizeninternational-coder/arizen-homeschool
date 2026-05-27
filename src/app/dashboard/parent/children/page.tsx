"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Plus } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

export default function ParentChildrenPage() {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.text, marginBottom: '0.25rem' }}>My Children</h1>
            <p style={{ color: colors.textMuted }}>Manage your children&apos;s learning profiles.</p>
          </div>
        </div>

        <div style={{ ...ds.card, textAlign: 'center', padding: '3rem 2rem' }}>
          <Users style={{ width: 48, height: 48, color: colors.primary, margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text, marginBottom: '0.5rem' }}>No children added yet</h3>
          <p style={{ color: colors.textMuted, fontSize: '0.9375rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Add your child&apos;s learner account to start tracking their progress and supporting their learning journey.
          </p>
          <button style={{ ...ds.btnPrimary, cursor: 'default' }}>
            <Plus style={{ width: 16, height: 16 }} /> Add a Child
          </button>
          <p style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.75rem' }}>
            Coming soon — child linking is being built.
          </p>
        </div>
      </div>
    </div>
  );
}
