"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Users, ArrowLeft, Plus, CheckCircle, AlertCircle, Loader2, GraduationCap, Mail, X } from "lucide-react";
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

  // Create child form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createGrade, setCreateGrade] = useState("2");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Link existing child state
  const [linkEmail, setLinkEmail] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!data?.user) { window.location.replace("/auth/login"); return; }
        setUser(data.user);
        await loadChildren();
      } catch { window.location.replace("/auth/login"); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function loadChildren() {
    try {
      const res = await fetch("/api/parent/link-child", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setChildren(data.children || []);
      }
    } catch { /* ignore */ }
  }

  async function handleCreateChild(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/parent/create-child", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          grade: parseInt(createGrade),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateMsg({ type: "error", text: data.error || "Failed to create child" });
      } else {
        setCreateMsg({ type: "success", text: `${data.child.name}'s profile created successfully!` });
        setCreateName("");
        setCreateGrade("2");
        setShowCreateForm(false);
        await loadChildren();
      }
    } catch { setCreateMsg({ type: "error", text: "Something went wrong. Please try again." }); }
    finally { setCreating(false); }
  }

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkEmail.trim()) return;
    setLinking(true);
    setLinkMsg(null);
    try {
      const res = await fetch("/api/parent/link-child", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childEmail: linkEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLinkMsg({ type: "error", text: data.error || "Failed to link child" });
      } else {
        setLinkMsg({ type: "success", text: `Linked ${data.child.name || data.child.email} successfully!` });
        setLinkEmail("");
        await loadChildren();
      }
    } catch { setLinkMsg({ type: "error", text: "Something went wrong. Please try again." }); }
    finally { setLinking(false); }
  }

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}><p style={{ color: colors.textMuted }}>Loading...</p></div>;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/parent" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            Sign Out
          </button>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>My Children</h1>
        <p style={{ color: colors.textMuted, marginBottom: "2rem" }}>Create child profiles or link existing learner accounts.</p>

        {/* Create Child Form */}
        {!showCreateForm ? (
          <button onClick={() => setShowCreateForm(true)} style={{ ...ds.btnPrimary, marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            <Plus style={{ width: 14, height: 14 }} /> Add Child
          </button>
        ) : (
          <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text }}>Create Child Profile</h2>
              <button onClick={() => { setShowCreateForm(false); setCreateMsg(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            {createMsg && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem", background: createMsg.type === "success" ? `${colors.success}10` : `${colors.warning || "#EF4444"}10`, color: createMsg.type === "success" ? colors.success : "#DC2626", fontSize: "0.875rem", fontWeight: 600 }}>
                {createMsg.type === "success" ? <CheckCircle style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
                {createMsg.text}
              </div>
            )}
            <form onSubmit={handleCreateChild} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <input
                type="text" value={createName} onChange={(e) => setCreateName(e.target.value)}
                placeholder="Child's name" required
                style={{ ...ds.input, flex: 1, minWidth: 160, fontSize: "0.875rem" }}
              />
              <select value={createGrade} onChange={(e) => setCreateGrade(e.target.value)} style={{ ...ds.input, minWidth: 100, fontSize: "0.875rem" }}>
                {[1,2,3,4,5,6,7,8].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
              <button type="submit" disabled={creating} style={{ ...ds.btnPrimary, fontSize: "0.875rem", padding: "0.75rem 1.5rem", whiteSpace: "nowrap" }}>
                {creating ? <><Loader2 style={{ width: 14, height: 14 }} className="spinner" /> Creating...</> : <><Plus style={{ width: 14, height: 14 }} /> Create</>}
              </button>
            </form>
          </div>
        )}

        {/* Link Existing Child */}
        <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>Link Existing Learner</h2>
          <p style={{ color: colors.textMuted, fontSize: "0.8125rem", marginBottom: "1rem" }}>
            If your child already has a learner account, enter their email to link it.
          </p>
          {linkMsg && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem", background: linkMsg.type === "success" ? `${colors.success}10` : `${colors.warning || "#EF4444"}10`, color: linkMsg.type === "success" ? colors.success : "#DC2626", fontSize: "0.875rem", fontWeight: 600 }}>
              {linkMsg.type === "success" ? <CheckCircle style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
              {linkMsg.text}
            </div>
          )}
          <form onSubmit={handleLink} style={{ display: "flex", gap: "0.75rem" }}>
            <input type="email" value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="child@example.com" required
              style={{ ...ds.input, flex: 1, fontSize: "0.875rem" }}
            />
            <button type="submit" disabled={linking} style={{ ...ds.btnPrimary, fontSize: "0.875rem", padding: "0.75rem 1.5rem", whiteSpace: "nowrap" }}>
              {linking ? <><Loader2 style={{ width: 14, height: 14 }} className="spinner" /> Linking...</> : <><Plus style={{ width: 14, height: 14 }} /> Link Child</>}
            </button>
          </form>
        </div>

        {/* Linked Children */}
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>
          Linked Children ({children.length})
        </h2>

        {children.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "2.5rem 1.5rem" }}>
            <Users style={{ width: 40, height: 40, color: colors.textMuted, margin: "0 auto 0.75rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>No children yet</h3>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem", maxWidth: 320, margin: "0 auto" }}>
              Create a child profile above or link an existing learner account.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {children.map((link) => {
              const profile = link.childUser?.learnerProfile;
              const displayName = profile?.displayName || link.childUser?.name || "Learner";
              return (
                <div key={link.id} style={{ ...ds.card, padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", color: colors.primary, fontSize: "1rem", fontWeight: 800, flexShrink: 0 }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{displayName}</div>
                    <div style={{ fontSize: "0.8125rem", color: colors.textMuted }}>{link.childUser?.email}</div>
                    {profile && (
                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.375rem" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: colors.textMuted }}>
                          <GraduationCap style={{ width: 12, height: 12 }} /> Grade {profile.grade}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: colors.primary, fontWeight: 600 }}>{profile.totalXp} XP</span>
                        <span style={{ fontSize: "0.75rem", color: colors.warm, fontWeight: 600 }}>{profile.currentStreak}d streak</span>
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
