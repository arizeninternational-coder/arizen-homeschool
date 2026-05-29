"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { BookOpen, ArrowLeft, Save, AlertCircle } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

export default function AdminCreateLessonPage() {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [xpReward, setXpReward] = useState("10");
  const [status, setStatus] = useState("DRAFT");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          xpReward: parseInt(xpReward) || 10,
          status,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: `Lesson "${data.lesson.title}" created as ${status}!` });
        setTitle("");
        setDescription("");
        setContent("");
        setXpReward("10");
      } else {
        setMsg({ type: "error", text: data.error || "Failed to create lesson" });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "Failed to create lesson" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/admin/lessons" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Lessons
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ ...ds.btnGhost, fontSize: "0.8125rem" }}>
            Sign Out
          </button>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>Create Lesson</h1>
        <p style={{ color: colors.textMuted, fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          Create a new lesson. For bulk imports, use the Import Curriculum feature.
        </p>

        {msg && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: msg.type === "success" ? `${colors.success}10` : `${colors.warning || "#EF4444"}10`, color: msg.type === "success" ? colors.success : "#DC2626", fontSize: "0.875rem", fontWeight: 600 }}>
            {msg.type === "success" ? <Save style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={ds.label}>Lesson Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Counting by Ones" style={ds.input} />
          </div>
          <div>
            <label style={ds.label}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Short summary of the lesson" style={{ ...ds.input, resize: "vertical" }} />
          </div>
          <div>
            <label style={ds.label}>Lesson Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Full lesson content..." style={{ ...ds.input, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={ds.label}>XP Reward</label>
              <input type="number" value={xpReward} onChange={e => setXpReward(e.target.value)} min={0} style={ds.input} />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={ds.label}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={ds.input}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="submit" disabled={saving} style={{ ...ds.btnPrimary, fontSize: "0.875rem", padding: "0.75rem 1.5rem", opacity: saving ? 0.6 : 1 }}>
              <Save style={{ width: 14, height: 14 }} /> {saving ? "Saving..." : "Save Lesson"}
            </button>
            <Link href="/dashboard/admin/curriculum/import" style={{ ...ds.btnSecondary, fontSize: "0.875rem", padding: "0.75rem 1.5rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              📥 Import Instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
