"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Layers, ArrowLeft, Plus, Search, AlertCircle, Edit, Trash2, Eye, X, Check, Loader2 } from "lucide-react";
import { PageHeader, GradientButton, EmptyStateCard } from "@/components/ui/Pill";
import { QuestIcon } from "@/components/ui/Illustrations";

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
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-[1100px] mx-auto py-8 px-6">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-text-muted hover:text-text text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-soft text-text-muted hover:bg-white hover:border-primary/30 cursor-pointer text-xs font-semibold transition-all">
            Sign Out
          </button>
        </div>

        {/* Header */}
        <PageHeader title="Quests" subtitle={`${quests.length} quests across all themes`}>
          <div className="mt-4">
            <GradientButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(!showCreate)}>
              Create Quest
            </GradientButton>
          </div>
        </PageHeader>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Create Form */}
        {showCreate && (
          <div className="rounded-[1.75rem] border border-border-soft bg-white p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-text">Create New Quest</h2>
              <button onClick={() => { setShowCreate(false); setCreateMsg(null); }} className="text-text-muted hover:text-text transition-colors cursor-pointer p-1 rounded-lg hover:bg-bg-main"><X className="w-5 h-5" /></button>
            </div>
            {createMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-2xl mb-4 text-sm font-semibold ${createMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {createMsg.type === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {createMsg.text}
              </div>
            )}
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input type="text" value={createTitle} onChange={e => setCreateTitle(e.target.value)} placeholder="Quest title *" required className="w-full px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
              <textarea value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-y" />
              <div className="flex gap-3 flex-wrap">
                <select value={createThemeId} onChange={e => setCreateThemeId(e.target.value)} required className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft focus:outline-none focus:border-primary/40 transition-all flex-1 min-w-[160px]">
                  <option value="">Select theme *</option>
                  {themes.map(t => <option key={t.id} value={t.id}>Grade {t.grade} — {t.title}</option>)}
                </select>
                <select value={createType} onChange={e => setCreateType(e.target.value)} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft focus:outline-none focus:border-primary/40 transition-all min-w-[120px]">
                  <option value="MAIN">Main Quest</option>
                  <option value="SIDE">Side Quest</option>
                  <option value="CHALLENGE">Challenge</option>
                </select>
                <select value={createStatus} onChange={e => setCreateStatus(e.target.value)} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft focus:outline-none focus:border-primary/40 transition-all min-w-[120px]">
                  <option value="DRAFT">Draft</option>
                  <option value="REVIEW">Review</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <button type="submit" disabled={creating} className="self-start">
                <GradientButton variant="primary" size="sm" disabled={creating}>
                  {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Quest"}
                </GradientButton>
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input placeholder="Search quests..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
          {grades.length > 0 && (
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-border-soft focus:outline-none focus:border-primary/40 transition-all min-w-[120px]">
              <option value="all">All Grades</option>
              {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          )}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-border-soft focus:outline-none focus:border-primary/40 transition-all min-w-[120px]">
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Review</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-[1.75rem] border border-border-soft bg-white p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm font-medium">Loading quests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyStateCard
            icon={<QuestIcon size={48} />}
            title={search || filterGrade !== "all" || filterStatus !== "all" ? "No quests match your filters" : "No quests found"}
            description={search || filterGrade !== "all" || filterStatus !== "all" ? "Try adjusting your search or filters." : "Create your first quest using the button above, or run the seed script."}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(quest => (
              <Link key={quest.id} href={`/dashboard/admin/quests/${quest.id}`} className="rounded-[1.75rem] border border-border-soft bg-white p-4 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all group">
                <div className="w-10 h-10 rounded-2xl bg-primary-soft flex items-center justify-center flex-shrink-0">
                  <Layers className="w-[18px] h-[18px] text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-text text-sm group-hover:text-primary transition-colors">{quest.title}</div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {quest.theme && <span>Grade {quest.theme.grade} · {quest.theme.title}</span>}
                    <span className="ml-3">{quest.questType}</span>
                  </div>
                </div>
                <span className={`text-[0.6875rem] font-bold px-2 py-1 rounded-lg flex-shrink-0 uppercase ${
                  quest.status === "PUBLISHED" ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                }`}>{quest.status}</span>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(quest.id, quest.title); }} className="text-text-muted hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all flex-shrink-0 cursor-pointer" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
