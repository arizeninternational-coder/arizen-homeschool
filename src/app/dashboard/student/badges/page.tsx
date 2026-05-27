"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, ArrowLeft, Lock } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

export default function StudentBadgesPage() {
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
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/dashboard/student" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.text, marginBottom: '0.5rem' }}>Badges</h1>
        <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>Track your achievements and unlock new badges as you learn.</p>

        <div style={{ ...ds.card, textAlign: 'center', padding: '3rem 2rem' }}>
          <Award style={{ width: 48, height: 48, color: colors.primary, margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text, marginBottom: '0.5rem' }}>No badges earned yet</h3>
          <p style={{ color: colors.textMuted, fontSize: '0.9375rem', maxWidth: 400, margin: '0 auto 2rem' }}>
            Complete lessons and quests to earn your first badge. Every achievement counts!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', maxWidth: 600, margin: '0 auto' }}>
            {[
              { name: "First Steps", icon: "🌟", req: "Complete your first lesson" },
              { name: "Quick Learner", icon: "⚡", req: "Complete 10 lessons" },
              { name: "Explorer", icon: "🧭", req: "Complete your first quest" },
              { name: "Scholar", icon: "📚", req: "Reach Level 5" },
            ].map((b) => (
              <div key={b.name} style={{ padding: '1.25rem 1rem', borderRadius: 16, border: `1px solid ${colors.border}`, background: colors.bgSoft, textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', filter: 'grayscale(0.6)', opacity: 0.6 }}>{b.icon}</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: colors.text, marginBottom: '0.25rem' }}>{b.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: colors.textMuted }}>
                  <Lock style={{ width: 10, height: 10 }} /> {b.req}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
