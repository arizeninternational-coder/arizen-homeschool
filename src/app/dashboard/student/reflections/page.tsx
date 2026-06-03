"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Heart, RefreshCw, PenLine, Frown, Meh, Smile, Laugh, SmilePlus } from "lucide-react";
import { PageHeader, SectionHeader, GradientButton, EmptyStateCard } from "@/components/ui/Pill";
import { HeartIcon } from "@/components/ui/Illustrations";
import { cn } from "@/lib/utils/cn";

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

function getMood(r: any): string {
  return r?.mood || r?.moodIndicator || "";
}

const MOOD_CONFIG: Record<string, { color: string; bg: string; Icon: React.FC<any> }> = {
  sad:     { color: "text-red-500",  bg: "bg-red-soft",   Icon: Frown },
  neutral: { color: "text-amber-500", bg: "bg-gold-soft",  Icon: Meh },
  happy:   { color: "text-blue-500", bg: "bg-accent-blue-soft", Icon: Smile },
  excited: { color: "text-emerald-500", bg: "bg-secondary-soft", Icon: Laugh },
  joyful:  { color: "text-pink",     bg: "bg-pink-soft",  Icon: SmilePlus },
};

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-pink/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-pink animate-spin" />
          </div>
          <p className="text-sm font-bold text-text-muted">Loading reflections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="My Reflections"
        subtitle="Share your thoughts and feelings after each lesson."
      >
        <div className="flex items-center gap-2 mt-3">
          <div className="w-9 h-9 rounded-2xl bg-pink-soft flex items-center justify-center">
            <HeartIcon size={18} />
          </div>
        </div>
      </PageHeader>

      {/* ── New Reflection Form ── */}
      <div className="relative rounded-[1.75rem] border border-pink/20 p-6 mb-6 overflow-hidden bg-card-gradient-pink shadow-[0_8px_25px_rgba(255,92,138,0.06)]">
        <div className="absolute top-3 right-5 opacity-20">
          <Heart className="w-16 h-16 text-pink" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <PenLine className="w-4 h-4 text-pink" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-pink">New Reflection</p>
          </div>
          <p className="text-sm font-bold text-text mb-4">{prompt}</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full min-h-[100px] p-4 rounded-2xl border border-pink/20 bg-white/80 text-sm text-text placeholder:text-text-muted resize-vertical focus:outline-none focus:ring-2 focus:ring-pink/30 transition-all"
          />
          <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
            <button
              onClick={() => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-pink/20 bg-white/80 text-xs font-bold text-text-muted hover:bg-white hover:text-text transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Prompt
            </button>
            <GradientButton
              variant={saved ? "success" : "primary"}
              size="sm"
              icon={saved ? undefined : <PenLine className="w-4 h-4" />}
              onClick={handleSave}
              disabled={saving || !text.trim()}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full spinner" />
                  Saving...
                </span>
              ) : saved ? "Saved!" : "Save Reflection"}
            </GradientButton>
          </div>
        </div>
      </div>

      {/* ── Past Reflections ── */}
      {reflections.length === 0 ? (
        <EmptyStateCard
          icon={<Heart className="w-8 h-8" />}
          title="No reflections yet"
          description="Write your first reflection above!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reflections.map((r, i) => {
            const reflectionText = getReflectionText(r);
            const reflectionPrompt = getReflectionPrompt(r);
            const reflectionDate = getReflectionDate(r);
            const mood = getMood(r);
            const moodConfig = mood ? MOOD_CONFIG[mood.toLowerCase()] : null;
            const MoodIcon = moodConfig?.Icon;

            return (
              <div
                key={i}
                className={cn(
                  "rounded-[1.25rem] border bg-white p-5 transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(15,23,42,0.06)]",
                  moodConfig?.color === "text-red-500" ? "border-red-200" :
                  moodConfig?.color === "text-amber-500" ? "border-amber-200" :
                  moodConfig?.color === "text-blue-500" ? "border-blue-200" :
                  moodConfig?.color === "text-emerald-500" ? "border-emerald-200" :
                  moodConfig?.color === "text-pink" ? "border-pink/20" :
                  "border-border-soft"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-pink leading-tight">
                    {reflectionPrompt}
                  </p>
                  {moodConfig && MoodIcon && (
                    <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0", moodConfig.bg)}>
                      <MoodIcon className={cn("w-4 h-4", moodConfig.color)} />
                    </div>
                  )}
                </div>
                {reflectionText && (
                  <p className="text-sm text-text-muted leading-relaxed mb-3 line-clamp-3">
                    {reflectionText}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  {reflectionDate && (
                    <span className="text-xs font-semibold text-text-muted">{reflectionDate}</span>
                  )}
                  {mood && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        mood === "sad" ? "bg-red-400" :
                        mood === "neutral" ? "bg-amber-400" :
                        mood === "happy" ? "bg-blue-400" :
                        mood === "excited" ? "bg-emerald-400" :
                        mood === "joyful" ? "bg-pink" :
                        "bg-text-muted"
                      )} />
                      {mood}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
