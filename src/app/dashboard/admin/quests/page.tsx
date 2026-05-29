"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Layers, ArrowLeft, Plus, Search, AlertCircle, Edit, Trash2, Eye, X, Check } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface QuestRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  questType: string;
  orderIndex: number;
  status: string;
  createdAt: string;
  theme?: {
    id: string;
    title: string;
    grade: number;
  };
}

export default function AdminQuestsPage() {
  const [quests, setQuests] = useState<QuestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createThemeId, setCreateThemeId] = useState("");
  const [createType, setCreateType] = useState("MAIN");
  const [createStatus, setCreateStatus] = useState("DRAFT");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [themes, setThemes] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/quests", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests || []);
      } else {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.error || "Failed to load quests");
      }
      // Load themes for the create form
      const themesRes = await fetch("/api/themes", { credentials: "include" });
      if (themesRes.ok) {
        const themesData = await themesRes.json();
        setThemes(themesData.themes || []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load quests");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createTitle.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/admin/quests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createTitle.trim(),
          description: createDesc.trim(),
          themeId: createThemeId || undefined,
          questType: createType,
          status: createStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateMsg({ type: "error", text: data.error || "Failed to create quest" });
      } else {
        setCreateMsg({ type: "success", text: `Quest "${data.quest.title}" created!` });
        setCreateTitle("");
        setCreateDesc("");
        setCreateThemeId("");
        setShowCreate(false);
        await load();
      }
    } catch (err: any) {
      setCreateMsg({ type: "error", text: err.message || "Failed to create quest" });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete quest "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/quests?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete quest");
      }
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  }

  const grades = [...new Set(quests.map(q => q.theme?.grade).filter(Boolean))].sort();
  const filtered = quests.filter(q => {
    if (filterGrade !== "all" && q.theme?.grade !== parseInt(filterGrade)) return false;
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (q.title || "").toLowerCase().includes(s) || (q.theme?.title || "").toLowerCase().includes(s);
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Quests</h1>
            <p style={{ color: colors.textMuted }}>{quests.length} quests across all themes</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} style={{ ...ds.btnPrimary, fontSize: "0.875rem", padding: "0.625rem 1.25rem" }}>
            <Plus style={{ width: 14, height: 14 }} /> Create Quest
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
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text }}>Create New Quest</h2>
              <button onClick={() => { setShowCreate(false); setCreateMsg(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            {createMsg && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem", background: createMsg.type === "success" ? `${colors.success}10` : `${colors.warning || "#EF4444"}10`, color: createMsg.type === "success" ? colors.success : "#DC2626", fontSize: "0.875rem", fontWeight: 600 }}>
                {createMsg.type === "success" ? <Check style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
                {createMsg.text}
              </div>
            )}
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input type="text" value={createTitle} onChange={e => setCreateTitle(e.target.value)} placeholder="Quest title *" required style={{ ...ds.input, fontSize: "0.875rem" }} />
              <textarea value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Description (optional)" rows={2} style={{ ...ds.input, fontSize: "0.875rem", resize: "vertical" }} />
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <select value={createThemeId} onChange={e => setCreateThemeId(e.target.value)} required style={{ ...ds.input, fontSize: "0.875rem", flex: 1, minWidth: 160 }}>
                  <option value="">Select theme *</option>
                  {themes.map(t => <option key={t.id} value={t.id}>Grade {t.grade} — {t.title}</option>)}
                </select>
                <select value={createType} onChange={e => setCreateType(e.target.value)} style={{ ...ds.input, fontSize: "0.875rem", minWidth: 120 }}>
                  <option value="MAIN">Main Quest</option>
                  <option value="SIDE">Side Quest</option>
                  <option value="CHALLENGE">Challenge</option>
                </select>
                <select value={createStatus} onChange={e => setCreateStatus(e.target.value)} style={{ ...ds.input, fontSize: "0.875rem", minWidth: 120 }}>
                  <option value="DRAFT">Draft</option>
                  <option value="REVIEW">Review</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <button type="submit" disabled={creating} style={{ ...ds.btnPrimary, fontSize: "0.875rem", padding: "0.75rem 1.5rem", alignSelf: "flex-start" }}>
                {creating ? "Creating..." : "Create Quest"}
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: colors.textMuted }} />
            <input placeholder="Search quests..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...ds.input, paddingLeft: "2.5rem", fontSize: "0.875rem" }} />
          </div>
          {grades.length > 0 && (
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{ ...ds.input, fontSize: "0.875rem", minWidth: 120 }}>
              <option value="all">All Grades</option>
              {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          )}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...ds.input, fontSize: "0.875rem", minWidth: 120 }}>
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Review</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        {loading ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem", color: colors.textMuted }}>Loading quests...</div>
        ) : filtered.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
            <Layers style={{ width: 48, height: 48, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>
              {search || filterGrade !== "all" || filterStatus !== "all" ? "No quests match your filters" : "No quests found"}
            </h3>
            <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>
              {search || filterGrade !== "all" || filterStatus !== "all" ? "Try adjusting your search or filters." : "Create your first quest using the button above, or run the seed script."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {filtered.map(quest => (
              <Link key={quest.id} href={`/dashboard/admin/quests/${quest.id}`} style={{ ...ds.card, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Layers style={{ width: 18, height: 18, color: colors.primary }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{quest.title}</div>
                  <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "0.125rem" }}>
                    {quest.theme && <span>Grade {quest.theme.grade} · {quest.theme.title}</span>}
                    <span style={{ marginLeft: "0.75rem" }}>{quest.questType}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: "0.6875rem", fontWeight: 700,
                  color: quest.status === "PUBLISHED" ? colors.success : colors.warning || "#F59E0B",
                  background: quest.status === "PUBLISHED" ? `${colors.success}15` : `${colors.warning || "#F59E0B"}15`,
                  padding: "0.2rem 0.5rem", borderRadius: 6, flexShrink: 0, textTransform: "uppercase"
                }}>{quest.status}</span>
                <button onClick={() => handleDelete(quest.id, quest.title)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, padding: "0.25rem", flexShrink: 0 }} title="Delete">
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
