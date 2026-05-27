"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, ArrowLeft } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

export default function StudentProfilePage() {
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

  const displayName = user?.displayName || user?.name?.split(" ")[0] || "Learner";

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/dashboard/student" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.text, marginBottom: '2rem' }}>My Profile</h1>

        <div style={{ ...ds.card, textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.5rem', background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 800 }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.text, marginBottom: '0.25rem' }}>{displayName}</h2>
          <p style={{ color: colors.textMuted, fontSize: '0.875rem', marginBottom: '0.5rem' }}>{user?.email}</p>
          <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 20, background: colors.primarySoft, color: colors.primary, fontSize: '0.75rem', fontWeight: 700, marginBottom: '2rem' }}>
            {user?.role || "LEARNER"}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: `1px solid ${colors.border}`, paddingTop: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.primary }}>{user?.totalXp || 0}</div>
              <div style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: 600 }}>Total XP</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.warm }}>{user?.currentStreak || 0}</div>
              <div style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: 600 }}>Day Streak</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.accent }}>{user?.grade || '—'}</div>
              <div style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: 600 }}>Grade</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
