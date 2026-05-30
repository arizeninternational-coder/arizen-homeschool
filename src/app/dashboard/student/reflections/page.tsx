"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const PROMPTS = [
  "How did today's lesson make you feel?",
  "What was the most interesting thing you learned today?",
  "Is there anything you found challenging today?",
  "What are you most proud of learning this week?",
  "How can you use what you learned today in real life?",
];

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState([]);
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/learner/reflections", { credentials: "include" })
      .then(r => r.json())
      .then(d => setReflections(d.reflections || []))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/learner/reflections", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text, prompt }),
      });
      setSaved(true);
      setText("");
      setReflections(prev => [{ content: text, prompt, createdAt: new Date().toISOString() }, ...prev]);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error("[REFLECTION] Save error:", e); }
    setSaving(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0F172A", margin: "0 0 0.5rem 0" }}>
        <Heart size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#E11D48" }} /> Reflections
      </h1>
      <p style={{ color: "#64748B", fontSize: "0.9375rem", margin: "0 0 20px 0" }}>Share your thoughts and feelings after each lesson.</p>

      {/* Write new reflection */}
      <div style={{ background: "#FFF1F2", borderRadius: 16, border: "1px solid #FECDD3", padding: "20px", marginBottom: 24 }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E11D48", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>New Reflection</p>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>{prompt}</p>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write your thoughts here..." style={{
          width: "100%", minHeight: 100, padding: "12px", borderRadius: 10,
          border: "1px solid #E2E8F0", fontSize: "0.875rem", fontFamily: "inherit",
          resize: "vertical", boxSizing: "border-box",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <button onClick={() => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])} style={{
            padding: "6px 12px", borderRadius: 8, border: "1px solid #E2E8F0",
            background: "#fff", color: "#64748B", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer",
          }}>🔄 New Prompt</button>
          <button onClick={handleSave} disabled={saving || !text.trim()} style={{
            padding: "8px 20px", borderRadius: 10, border: "none",
            background: text.trim() ? "#047A70" : "#E2E8F0", color: text.trim() ? "#fff" : "#94A3B8",
            fontWeight: 700, fontSize: "0.8125rem", cursor: text.trim() ? "pointer" : "default",
          }}>{saving ? "Saving..." : saved ? "✓ Saved" : "Save Reflection"}</button>
        </div>
      </div>

      {/* Past reflections */}
      {reflections.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0" }}>
          <Heart size={32} style={{ color: "#94A3B8", margin: "0 auto 1rem" }} />
          <p style={{ color: "#64748B", fontWeight: 600 }}>No reflections yet.</p>
          <p style={{ color: "#94A3B8", fontSize: "0.875rem", marginTop: 4 }}>Write your first reflection above!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {reflections.map((r, i) => (
            <div key={i} style={{ padding: "16px", borderRadius: 12, background: "#fff", border: "1px solid #E2E8F0" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#E11D48", marginBottom: 4 }}>{r.prompt || "Reflection"}</p>
              <p style={{ fontSize: "0.875rem", color: "#0F172A", margin: "0 0 6px 0" }}>{r.content || r}</p>
              <span style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
