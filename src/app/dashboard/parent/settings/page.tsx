"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, ArrowLeft } from "lucide-react";
import { ds, colors } from "@/lib/design-system";
export default function ParentSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/auth/session").then(r=>r.json()).then(d=>{if(d?.user)setUser(d.user);}).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}><p style={{ color: colors.textMuted }}>Loading...</p></div>;
  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/dashboard/parent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}><ArrowLeft style={{ width: 16, height: 16 }} /> Back to Dashboard</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.text, marginBottom: '2rem' }}>Settings</h1>
        <div style={{ ...ds.card, padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 800 }}>
              {(user?.name || "P").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: colors.text }}>{user?.name || "Parent"}</div>
              <div style={{ fontSize: '0.875rem', color: colors.textMuted }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ space: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: `1px solid ${colors.borderLight}` }}>
              <div>
                <div style={{ fontWeight: 600, color: colors.text, fontSize: '0.9375rem' }}>Email Notifications</div>
                <div style={{ fontSize: '0.8125rem', color: colors.textMuted }}>Receive updates about your children&apos;s progress</div>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: colors.border, position: 'relative', cursor: 'default' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: `1px solid ${colors.borderLight}` }}>
              <div>
                <div style={{ fontWeight: 600, color: colors.text, fontSize: '0.9375rem' }}>Weekly Summary</div>
                <div style={{ fontSize: '0.8125rem', color: colors.textMuted }}>Get a weekly activity report</div>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: colors.primary, position: 'relative', cursor: 'default' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, right: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
              <div>
                <div style={{ fontWeight: 600, color: colors.text, fontSize: '0.9375rem' }}>Profile Visibility</div>
                <div style={{ fontSize: '0.8125rem', color: colors.textMuted }}>Visible to your guild</div>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: colors.primary, position: 'relative', cursor: 'default' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, right: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
