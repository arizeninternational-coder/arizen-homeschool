"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Heart, RefreshCw, PenLine, Frown, Meh, Smile, Laugh, SmilePlus, Check, X } from "lucide-react";
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

const PREMADE_RESPONSES = [
  "I understand it well.",
  "I need more practice.",
  "This was fun.",
  "This was a little hard.",
  "I can use this at home.",
  "I want help from my parent/teacher.",
  "I learned something new.",
  "I am proud of myself.",
];

// Safely extract reflection text from various API response shapes
function getReflectionText(r: any): string {
  if (!r) return "";
  if (typeof r === "string") return r;
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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/learner/reflections", { credentials: "include" })
      .then(r => r.ok ? r.json() : { reflections: [] })
      .then(d => setReflections(Array.isArray(d.reflections) ? d.reflections : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggleOption(option: string) {
    setSelectedOptions(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  }

  const handleSave = async () => {
    const hasSelection = selectedOptions.length > 0;
    const hasText = text.trim().length > 0;

    if (!hasSelection && !hasText) {
      setSaveError("Choose one option or write something before saving.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    // Combine selected options and custom text into one response
    const parts: string[] = [];
    if (hasSelection) {
      parts.push(selectedOptions.join(". "));
    }
    if (hasText) {
      parts.push(text.trim());
    }
    const combinedResponse = parts.join(". ");

    try {
      const res = await fetch("/api/learner/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt, response: combinedResponse }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        setText("");
        setSelectedOptions([]);
        setReflections(prev => [{
          prompt,
          response: { text: combinedResponse },
          createdAt: new Date().toISOString(),
        }, ...prev]);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setSaveError(data.error || "Failed to save reflection. Please try again.");
      }
    } catch (e: any) {
      console.error("[REFLECTION] Save error:", e);
      setSaveError("Network error. Please check your connection and try again.");
    }
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
      <div className="relative rounded-[1.5rem] border border-pink/10 p-5 mb-5 overflow-hidden bg-card-gradient-pink shadow-[0_4px_20px_rgba(255,92,138,0.04)] backdrop-blur-sm">
        <div className="absolute top-3 right-5 opacity-20">
          <Heart className="w-16 h-16 text-pink" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <PenLine className="w-4 h-4 text-pink" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-pink">New Reflection</p>
          </div>
          <p className="text-sm font-bold text-text mb-4">{prompt}</p>

          {/* Premade response chips */}
          <div className="mb-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2">Quick responses — tap to select:</p>
            <div className="flex flex-wrap gap-2">
              {PREMADE_RESPONSES.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 border",
                      isSelected
                        ? "bg-pink-100 text-pink-700 border-pink-300 shadow-[0_2px_8px_rgba(225,29,72,0.1)]"
                        : "bg-white/80 text-text-muted border-pink/10 hover:bg-pink-50 hover:text-pink-600 hover:border-pink/20"
                    )}
                  >
                    {isSelected && <Check size={12} className="text-pink" />}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom text area */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Or write your own thought here..."
            className="w-full min-h-[80px] p-4 rounded-2xl border border-pink/10 bg-white/80 text-sm text-text placeholder:text-text-muted resize-vertical focus:outline-none focus:ring-2 focus:ring-pink/20 transition-all"
          />

          <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
            {saveError && (
              <div className="flex-1 min-w-[200px] rounded-lg border border-red-300 bg-red-50 px-3 py-2 flex items-center gap-2">
                <X size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-red-700">{saveError}</p>
              </div>
            )}
            {saved && !saveError && (
              <div className="flex-1 min-w-[200px] rounded-lg border border-green-300 bg-green-50 px-3 py-2">
                <p className="text-xs font-semibold text-green-700">✅ Reflection saved! Great work thinking about what you learned.</p>
              </div>
            )}
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
              disabled={saving}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  "rounded-[1.25rem] border bg-white/90 backdrop-blur-sm p-5 transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(15,23,42,0.06)]",
                  moodConfig?.color === "text-red-500" ? "border-red-200/60" :
                  moodConfig?.color === "text-amber-500" ? "border-amber-200/60" :
                  moodConfig?.color === "text-blue-500" ? "border-blue-200/60" :
                  moodConfig?.color === "text-emerald-500" ? "border-emerald-200/60" :
                  moodConfig?.color === "text-pink" ? "border-pink/10" :
                  "border-white/60"
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
