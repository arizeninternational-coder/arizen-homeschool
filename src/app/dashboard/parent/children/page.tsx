"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Plus, CheckCircle, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface LinkedChild {
  id: string;
  childUserId: string;
  createdAt: string;
  childUser: {
    id: string;
    name: string | null;
    email: string;
    learnerProfile: {
      grade: number;
      displayName: string;
      totalXp: number;
      currentStreak: number;
      avatarUrl: string | null;
    } | null;
  };
}

export default function ParentChildrenPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkMsg, setLinkMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!data?.user) { window.location.replace("/auth/login"); return; }
        setUser(data.user);
        // Load linked children
        const childrenRes = await fetch("/api/parent/link-child");
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          setChildren(childrenData.children || []);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkEmail.trim()) return;
    setLinking(true);
    setLinkMsg(null);
    try {
      const res = await fetch("/api/parent/link-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childEmail: linkEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLinkMsg({ type: "error", text: data.error || "Failed to link child" });
      } else {
        setLinkMsg({ type: "success", text: `Linked ${data.child.name || data.child.email} successfully!` });
        setLinkEmail("");
        // Reload children list
        const childrenRes = await fetch("/api/parent/link-child");
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          setChildren(childrenData.children || []);
        }
      }
    } catch { setLinkMsg({ type: "error", text: "Something went wrong. Please try again." }); }
    finally { setLinking(false); }
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}><p style={{ color: colors.textMuted }}>Loading...</p></div>;

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/dashboard/parent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.text, marginBottom: '0.5rem' }}>My Children</h1>
        <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>Link your children&apos;s learner accounts to track their progress.</p>

        {/* Link Child Form */}
        <div style={{ ...ds.card, padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text, marginBottom: '0.5rem' }}>Link a Child</h2>
          <p style={{ color: colors.textMuted, fontSize: '0.875rem', marginBottom: '1rem' }}>
            Enter the email address of your child&apos;s learner account to link it to your parent account.
          </p>
          {linkMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', background: linkMsg.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', color: linkMsg.type === 'success' ? '#16a34a' : '#dc2626', fontSize: '0.875rem', fontWeight: 600 }}>
              {linkMsg.type === 'success' ? <CheckCircle style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
              {linkMsg.text}
            </div>
          )}
          <form onSubmit={handleLink} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="email"
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="child@example.com"
              required
              style={{ ...ds.input, flex: 1, fontSize: '0.875rem' }}
            />
            <button type="submit" disabled={linking} style={{ ...ds.btnPrimary, fontSize: '0.875rem', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}>
              {linking ? <><Loader2 style={{ width: 14, height: 14 }} className="spinner" /> Linking...</> : <><Plus style={{ width: 14, height: 14 }} /> Link Child</>}
            </button>
          </form>
        </div>

        {/* Linked Children */}
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text, marginBottom: '1rem' }}>Linked Children ({children.length})</h2>

        {children.length === 0 ? (
          <div style={{ ...ds.card, textAlign: 'center', padding: '3rem 2rem' }}>
            <Users style={{ width: 48, height: 48, color: colors.primary, margin: '0 auto 1rem', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.text, marginBottom: '0.5rem' }}>No children linked yet</h3>
            <p style={{ color: colors.textMuted, fontSize: '0.9375rem', maxWidth: 400, margin: '0 auto' }}>
              Use the form above to link your child&apos;s learner account by email.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {children.map((link) => {
              const profile = link.childUser?.learnerProfile;
              const displayName = profile?.displayName || link.childUser?.name || "Learner";
              return (
                <div key={link.id} style={{ ...ds.card, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: gradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.125rem', fontWeight: 800, flexShrink: 0 }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: colors.text, fontSize: '0.9375rem' }}>{displayName}</div>
                    <div style={{ fontSize: '0.8125rem', color: colors.textMuted }}>{link.childUser?.email}</div>
                    {profile && (
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem' }}>
                        <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>Grade {profile.grade}</span>
                        <span style={{ fontSize: '0.75rem', color: colors.primary, fontWeight: 600 }}>{profile.totalXp} XP</span>
                        <span style={{ fontSize: '0.75rem', color: colors.warm, fontWeight: 600 }}>{profile.currentStreak} day streak</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
