"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Award, ArrowLeft, Plus, Search, AlertCircle, Edit, Trash2, X, Check, Star, Zap, Target, BookOpen, Heart, Shield } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

const BADGE_ICONS = [
  { value: "star", label: "Star", Icon: Star },
  { value: "zap", label: "Zap", Icon: Zap },
  { value: "target", label: "Target", Icon: Target },
  { value: "book", label: "Book", Icon: BookOpen },
  { value: "heart", label: "Heart", Icon: Heart },
  { value: "shield", label: "Shield", Icon: Shield },
  { value: "award", label: "Award", Icon: Award },
];

interface BadgeRecord {
  id: string;
  name?: string;
  badgeType?: string;
  description: string | null;
  imageUrl?: string;
  icon?: string;
  xpReward?: number;
  unlockCondition?: string;
  status?: string;
  awardedAt?: string;
  createdAt?: string;
  learner?: {
    displayName: string;
    grade: number;
  } | null;
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<BadgeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createIcon, setCreateIcon] = useState("star");
  const [createXp, setCreateXp] = useState("50");
  const [createCondition, setCreateCondition] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Template badges (badge definitions not tied to learners)
  const [templates, setTemplates] = useState<BadgeRecord[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/badges", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges || []);
      } else {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.error || "Failed to load badges");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load badges");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDesc.trim(),
          icon: createIcon,
          xpReward: parseInt(createXp) || 50,
          unlockCondition: createCondition.trim() || "Complete assigned tasks",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateMsg({ type: "error", text: data.error || "Failed to create badge" });
      } else {
        const newBadge: BadgeRecord = {
          id: data.badge.id,
          name: data.badge.name,
          description: data.badge.description,
          icon: data.badge.badgeType,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        setTemplates(prev => [newBadge, ...prev]);
        setCreateMsg({ type: "success", text: `Badge "${data.badge.name}" created!` });
        setCreateName("");
        setCreateDesc("");
        setCreateXp("50");
        setCreateCondition("");
        setShowCreate(false);
      }
    } catch (err: any) {
      setCreateMsg({ type: "error", text: err.message || "Failed to create badge" });
    } finally {
      setCreating(false);
    }
  }

  function handleDeleteTemplate(id: string) {
    if (!confirm("Delete this badge template?")) return;
    setTemplates(prev => prev.filter(b => b.id !== id));
  }

  const allBadges = [...templates, ...badges];
  const filtered = allBadges.filter(b => {
    if (filterStatus !== "all" && b.status !== filterStatus && b.status !== filterStatus?.toLowerCase()) return false;
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (b.name || b.badgeType || "").toLowerCase().includes(s) || (b.description || "").toLowerCase().includes(s);
  });

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            Sign Out
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Badges</h1>
            <p style={{ color: colors.textMuted }}>{allBadges.length} badges — {templates.length} templates, {badges.length} awarded</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} style={{ ...ds.btnPrimary, fontSize: "0.875rem", padding: "0.625rem 1.25rem" }}>
            <Plus style={{ width: 14, height: 14 }} /> Create Badge
          </button>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: `${colors.warning || "#F59E0B"}15`, border: `1px solid ${colors.warning || "#F59E0B"}30`, color: colors.warning || "#B45309", fontSize: "0.875rem", fontWeight: 600 }}>
            <AlertCircle style={{ width: 16, height: 16 }} /> {error}
          </div>
        )}

        {/* Create Form */}
        {showCreate && (
          <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text }}>Create Badge Template</h2>
              <button onClick={() => { setShowCreate(false); setCreateMsg(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            {createMsg && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem", background: createMsg.type === "success" ? `${colors.success}10` : `${colors.warning || "#EF4444"}10`, color: createMsg.type === "success" ? colors.success : "#DC2626", fontSize: "0.875rem", fontWeight: 600 }}>
                {createMsg.type === "success" ? <Check style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
                {createMsg.text}
              </div>
            )}
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input type="text" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Badge name * (e.g. 'Math Whiz', 'Reading Star')" required style={{ ...ds.input, fontSize: "0.875rem" }} />
              <textarea value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Description — what does this badge represent?" rows={2} style={{ ...ds.input, fontSize: "0.875rem", resize: "vertical" }} />
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <select value={createIcon} onChange={e => setCreateIcon(e.target.value)} style={{ ...ds.input, fontSize: "0.875rem", minWidth: 140 }}>
                  {BADGE_ICONS.map(({ value, label }) => <option key={value} value={value}>Icon: {label}</option>)}
                </select>
                <input type="number" value={createXp} onChange={e => setCreateXp(e.target.value)} placeholder="XP Reward" min="0" style={{ ...ds.input, fontSize: "0.875rem", width: 120 }} />
                <input type="text" value={createCondition} onChange={e => setCreateCondition(e.target.value)} placeholder="Unlock condition (e.g. 'Complete 5 math lessons')" style={{ ...ds.input, fontSize: "0.875rem", flex: 1, minWidth: 200 }} />
              </div>
              <button type="submit" disabled={creating} style={{ ...ds.btnPrimary, fontSize: "0.875rem", padding: "0.75rem 1.5rem", alignSelf: "flex-start" }}>
                {creating ? "Creating..." : "Create Badge"}
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: colors.textMuted }} />
            <input placeholder="Search badges..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...ds.input, paddingLeft: "2.5rem", fontSize: "0.875rem" }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...ds.input, fontSize: "0.875rem", minWidth: 120 }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {loading ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem", color: colors.textMuted }}>Loading badges...</div>
        ) : filtered.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
            <Award style={{ width: 48, height: 48, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>
              {search ? "No badges match your search" : "No badges yet"}
            </h3>
            <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>
              {search ? "Try a different search term." : "Create your first badge template using the button above."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {filtered.map(badge => {
              const iconData = BADGE_ICONS.find(i => i.value === (badge.icon || "star")) || BADGE_ICONS[0];
              const IconComp = iconData.Icon;
              return (
                <div key={badge.id} style={{ ...ds.card, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconComp style={{ width: 22, height: 22, color: colors.primary }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{badge.name || badge.badgeType || "Unnamed Badge"}</div>
                    <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "0.125rem" }}>
                      {badge.description || "No description"}
                    </div>
                  </div>
                  {badge.learner && (
                    <span style={{ fontSize: "0.6875rem", color: colors.textMuted, flexShrink: 0 }}>
                      Awarded to: {badge.learner.displayName} (Gr.{badge.learner.grade})
                    </span>
                  )}
                  <span style={{
                    fontSize: "0.6875rem", fontWeight: 700,
                    color: (badge.status === "active" || !badge.status) ? colors.success : colors.textMuted,
                    background: (badge.status === "active" || !badge.status) ? `${colors.success}15` : `${colors.textMuted}15`,
                    padding: "0.2rem 0.5rem", borderRadius: 6, flexShrink: 0, textTransform: "uppercase"
                  }}>{badge.status || "active"}</span>
                  {templates.includes(badge) && (
                    <button onClick={() => handleDeleteTemplate(badge.id)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, padding: "0.25rem", flexShrink: 0 }} title="Delete">
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
