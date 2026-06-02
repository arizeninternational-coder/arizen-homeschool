"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Heart, CheckCircle2 } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

const PROMPTS = [
  "How did today's lesson make you feel?",
  "What was the most interesting thing you learned today?",
  "Is there anything you found challenging today?",
  "What are you most proud of learning this week?",
  "How can you use what you learned today in real life?",
];

// Safely extract reflection text from various API response shapes
function getReflectionText(r: any): string {
  if (!r) return "";
  if (typeof r === "string") return r;
  // API returns { response: { text: "..." } } or { content: "..." }
  if (r.responseText) return r.responseText;
  if (r.response && typeof r.response === "object") return r.response.text || "";
  if (typeof r.response === "string") return r.response;
  if (r.content) return r.content;
  if (r.text) return r.text;
  return "";
}

function getReflectionPrompt(r: any): string {
  if (!r) return "Reflection";
  return r.prompt || r.question || "Reflection";
}

function getReflectionDate(r: any): string {
  if (!r) return "";
  const d = r.createdAt || r.created_at || r.date;
  if (!d) return "";
  try { return new Date(d).toLocaleDateString(); } catch { return ""; }
}

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learner/reflections", { credentials: "include" })
      .then(r => r.ok ? r.json() : { reflections: [] })
      .then(d => setReflections(Array.isArray(d.reflections) ? d.reflections : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/learner/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt, response: text }),
      });
      if (res.ok) {
        setSaved(true);
        setText("");
        setReflections(prev => [{
          prompt,
          response: { text },
          createdAt: new Date().toISOString(),
        }, ...prev]);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) { console.error("[REFLECTION] Save error:", e); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: C.body, fontWeight: 600 }}>Loading reflections...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.5rem 0" }}>
        <Heart size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#E11D48" }} /> Reflections
      </h1>
      <p style={{ color: C.body, fontSize: "0.9375rem", margin: "0 0 20px 0" }}>Share your thoughts and feelings after each lesson.</p>

      {/* Write new reflection */}
      <div style={{ background: "#FFF1F2", borderRadius: 16, border: "1px solid #FECDD3", padding: "20px", marginBottom: 24 }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E11D48", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>New Reflection</p>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: C.dark, marginBottom: 12 }}>{prompt}</p>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write your thoughts here..." style={{
          width: "100%", minHeight: 100, padding: "12px", borderRadius: 10,
          border: "1px solid #E2E8F0", fontSize: "0.875rem", fontFamily: "inherit",
          resize: "vertical", boxSizing: "border-box",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <button onClick={() => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])} style={{
            padding: "6px 12px", borderRadius: 8, border: "1px solid #E2E8F0",
            background: "#fff", color: C.body, fontWeight: 600, fontSize: "0.75rem", cursor: "pointer",
          }}>🔄 New Prompt</button>
          <button onClick={handleSave} disabled={saving || !text.trim()} style={{
            padding: "8px 20px", borderRadius: 10, border: "none",
            background: text.trim() ? C.teal : "#E2E8F0", color: text.trim() ? "#fff" : "#94A3B8",
            fontWeight: 700, fontSize: "0.8125rem", cursor: text.trim() ? "pointer" : "default",
          }}>{saving ? "Saving..." : saved ? "✓ Saved" : "Save Reflection"}</button>
        </div>
      </div>

      {/* Past reflections */}
      {reflections.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0" }}>
          <Heart size={32} style={{ color: "#94A3B8", margin: "0 auto 1rem" }} />
          <p style={{ color: C.body, fontWeight: 600 }}>No reflections yet.</p>
          <p style={{ color: "#94A3B8", fontSize: "0.875rem", marginTop: 4 }}>Write your first reflection above!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {reflections.map((r, i) => {
            const reflectionText = getReflectionText(r);
            const reflectionPrompt = getReflectionPrompt(r);
            const reflectionDate = getReflectionDate(r);
            return (
              <div key={i} style={{ padding: "16px", borderRadius: 12, background: "#fff", border: "1px solid #E2E8F0" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#E11D48", marginBottom: 4 }}>{reflectionPrompt}</p>
                {reflectionText && <p style={{ fontSize: "0.875rem", color: C.dark, margin: "0 0 6px 0" }}>{reflectionText}</p>}
                {reflectionDate && <span style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>{reflectionDate}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
