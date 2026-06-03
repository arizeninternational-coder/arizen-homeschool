"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Users, ArrowLeft, Plus, CheckCircle, AlertCircle, Loader2, GraduationCap, Mail, X } from "lucide-react";
import { GradientButton } from "@/components/ui/Pill";

interface LinkedChild {
  id: string;
  name: string;
  email: string;
  grade: number | null;
  totalXp: number;
  currentStreak: number;
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-secondary/15" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-secondary animate-spin" />
        </div>
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard/parent" className="inline-flex items-center gap-2 text-text-muted text-sm font-semibold hover:text-text transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-soft text-text-muted cursor-pointer text-sm font-semibold hover:bg-red-50 hover:text-danger transition-colors">
            Sign Out
          </button>
        </div>

        <h1 className="text-2xl font-extrabold text-text mb-2">My Children</h1>
        <p className="text-text-muted mb-8">Create child profiles or link existing learner accounts.</p>

        {/* Create Child Form */}
        {!showCreateForm ? (
          <button onClick={() => setShowCreateForm(true)} className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white bg-gradient-to-br from-secondary to-secondary-dark shadow-[0_4px_15px_rgba(0,168,132,0.2)] hover:shadow-[0_8px_25px_rgba(0,168,132,0.3)] hover:brightness-110 transition-all cursor-pointer mb-6">
            <Plus className="w-4 h-4" /> Add Child
          </button>
        ) : (
          <div className="rounded-2xl border border-border-soft bg-white p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-extrabold text-text">Create Child Profile</h2>
              <button onClick={() => { setShowCreateForm(false); setCreateMsg(null); }} className="p-1.5 rounded-lg hover:bg-bg-main text-text-muted transition-colors">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            {createMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 text-sm font-semibold border ${
                createMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                {createMsg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {createMsg.text}
              </div>
            )}
            <form onSubmit={handleCreateChild} className="flex gap-3 flex-wrap">
              <input
                type="text" value={createName} onChange={(e) => setCreateName(e.target.value)}
                placeholder="Child's name" required
                className="flex-1 min-w-[160px] px-4 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10 transition-all"
              />
              <select value={createGrade} onChange={(e) => setCreateGrade(e.target.value)} className="min-w-[100px] px-4 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft focus:outline-none focus:border-secondary/50 transition-all">
                {[1,2,3,4,5,6,7,8].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
              <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white bg-gradient-to-br from-secondary to-secondary-dark shadow-[0_4px_15px_rgba(0,168,132,0.2)] hover:shadow-[0_8px_25px_rgba(0,168,132,0.3)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap">
                {creating ? <><Loader2 className="w-4 h-4 spinner" /> Creating...</> : <><Plus className="w-4 h-4" /> Create</>}
              </button>
            </form>
          </div>
        )}

        {/* Link Existing Child */}
        <div className="rounded-2xl border border-border-soft bg-white p-6 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)]">
          <h2 className="text-base font-extrabold text-text mb-1">Link Existing Learner</h2>
          <p className="text-sm text-text-muted mb-4">
            If your child already has a learner account, enter their email to link it.
          </p>
          {linkMsg && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 text-sm font-semibold border ${
              linkMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {linkMsg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {linkMsg.text}
            </div>
          )}
          <form onSubmit={handleLink} className="flex gap-3">
            <input type="email" value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="child@example.com" required
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10 transition-all"
            />
            <button type="submit" disabled={linking} className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white bg-gradient-to-br from-secondary to-secondary-dark shadow-[0_4px_15px_rgba(0,168,132,0.2)] hover:shadow-[0_8px_25px_rgba(0,168,132,0.3)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap">
              {linking ? <><Loader2 className="w-4 h-4 spinner" /> Linking...</> : <><Plus className="w-4 h-4" /> Link Child</>}
            </button>
          </form>
        </div>

        {/* Linked Children */}
        <h2 className="text-lg font-extrabold text-text mb-4">
          Linked Children ({children.length})
        </h2>

        {children.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-white text-center p-10 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="w-14 h-14 rounded-3xl bg-secondary-soft/50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-base font-extrabold text-text mb-1">No children yet</h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              Create a child profile above or link an existing learner account.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {children.map((child: any) => {
              const displayName = child.name || "Unnamed child";
              const childGrade = child.grade;
              const childXp = child.totalXp || 0;
              const childStreak = child.currentStreak || 0;
              return (
                <div key={child.id} className="rounded-2xl border border-border-soft bg-white p-5 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all duration-200">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary-dark/10 flex items-center justify-center text-secondary text-base font-extrabold flex-shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-text text-sm">{displayName}</div>
                    <div className="text-xs text-text-muted">{child.email}</div>
                    <div className="flex gap-4 mt-1">
                      {childGrade != null && (
                        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                          <GraduationCap className="w-3 h-3" /> Grade {childGrade}
                        </span>
                      )}
                      <span className="text-xs text-primary font-semibold">{childXp} XP</span>
                      <span className="text-xs text-gold font-semibold">{childStreak}d streak</span>
                    </div>
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
