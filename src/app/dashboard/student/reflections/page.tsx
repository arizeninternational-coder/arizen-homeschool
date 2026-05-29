"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Heart, Send, ChevronRight, Loader2, Check } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

const PROMPTS = [
  "What did you learn today?",
  "What felt easy today?",
  "What felt difficult today?",
  "What are you proud of today?",
  "What do you want help with?",
  "How did you feel while learning?",
  "What was the most interesting thing you discovered?",
  "What would you like to learn more about?",
];

export default function StudentReflectionsPage() {
  const [reflections, setReflections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPTS[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/learner/reflections", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setReflections(data.reflections || []);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!response.trim()) { setError("Please write your reflection before saving."); return; }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/learner/reflections", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: customPrompt.trim() || selectedPrompt,
          response: response.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Reflection saved! ✨");
        setResponse("");
        setCustomPrompt("");
        setFormKey(k => k + 1);
        // Refresh list
        const listRes = await fetch("/api/learner/reflections", { credentials: "include" });
        if (listRes.ok) {
          const listData = await listRes.json();
          setReflections(listData.reflections || []);
        }
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Failed to save reflection.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.25rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart style={{ width: 22, height: 22, color: colors.primary }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.text }}>Reflections</h1>
            <p style={{ color: colors.textMuted, fontSize: "0.8125rem" }}>Write about your learning journey</p>
          </div>
        </div>

        {/* New Reflection Form */}
        <div key={formKey} style={{ ...ds.card, padding: "1.5rem", marginBottom: "1.5rem", background: `linear-gradient(135deg, ${colors.primarySoft}, #fff)` }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: colors.text, marginBottom: "0.75rem" }}>✍️ New Reflection</h3>

          {/* Prompt selector */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Choose a prompt</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.5rem" }}>
              {PROMPTS.map((p) => (
                <button key={p} type="button" onClick={() => { setSelectedPrompt(p); setCustomPrompt(""); }}
                  style={{ padding: "0.3rem 0.75rem", borderRadius: 8, border: selectedPrompt === p && !customPrompt ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`, background: selectedPrompt === p && !customPrompt ? colors.primarySoft : "#fff", color: selectedPrompt === p && !customPrompt ? colors.primary : colors.textMuted, fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>
                  {p}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Or write your own prompt..." value={customPrompt} onChange={e => { setCustomPrompt(e.target.value); if (e.target.value) setSelectedPrompt(""); }}
              style={{ ...ds.input, fontSize: "0.875rem" }} />
          </div>

          {/* Response textarea */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Your reflection</label>
            <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Write your thoughts here... What did you learn? How did you feel?"
              style={{ ...ds.input, fontSize: "0.9375rem", minHeight: 120, resize: "vertical", lineHeight: 1.6, fontFamily: "'Nunito', system-ui, sans-serif" }} />
            <div style={{ textAlign: "right", fontSize: "0.6875rem", color: colors.textMuted, marginTop: "0.25rem" }}>{response.length} characters</div>
          </div>

          {/* Messages */}
          {error && <div style={{ ...ds.alertError, marginBottom: "0.75rem" }}>{error}</div>}
          {success && <div style={{ ...ds.alertSuccess, marginBottom: "0.75rem" }}>{success}</div>}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={saving || !response.trim()}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", borderRadius: 12, border: "none", background: saving || !response.trim() ? "#CBD5E1" : colors.primary, color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: saving || !response.trim() ? "not-allowed" : "pointer" }}>
            {saving ? <Loader2 style={{ width: 16, height: 16 }} className="spinner" /> : <Send style={{ width: 16, height: 16 }} />}
            {saving ? "Saving..." : "Save Reflection"}
          </button>
        </div>

        {/* Past Reflections */}
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: colors.text, marginBottom: "0.75rem" }}>Past Reflections</h2>
        {loading ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "2rem", color: colors.textMuted }}>Loading...</div>
        ) : reflections.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: 36, marginBottom: "0.75rem" }}>📝</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>No reflections yet</h3>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>Write your first reflection above to get started!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {reflections.map((r: any) => (
              <div key={r.id} style={{ ...ds.card, padding: "1.125rem" }}>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.primary, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.375rem" }}>
                  {r.prompt}
                </div>
                <p style={{ fontSize: "0.9375rem", color: colors.text, lineHeight: 1.6, marginBottom: "0.5rem" }}>{typeof r.response === "object" ? r.response?.text || r.response?.body || JSON.stringify(r.response) : r.response}</p>
                <div style={{ fontSize: "0.6875rem", color: colors.textMuted, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Check style={{ width: 12, height: 12, color: colors.success || "#22C55E" }} />
                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
