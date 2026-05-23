"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, BookOpen,
  Flame, Trophy, ArrowLeft
} from "lucide-react";
import { ContentBlockList } from "@/components/content";
import { XpPopup, BadgeUnlock, Confetti } from "@/components/gamification";
import { Progress, XpBadge, StreakBadge } from "@/components/ui";
import type { ContentBlock } from "@/types/models";

interface LessonViewerProps {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    contentBlocks: ContentBlock[];
    xpReward: any;
    estimatedDurationMinutes: number | null;
    progress: number;
    isCompleted: boolean;
  };
  questTitle: string;
  themeSlug: string;
  questSlug: string;
  onClose: () => void;
  onComplete: () => void;
}

export function LessonViewer({
  lesson,
  questTitle,
  themeSlug,
  questSlug,
  onClose,
  onComplete,
}: LessonViewerProps) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [completed, setCompleted] = useState(lesson.isCompleted);
  const [showXp, setShowXp] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [localProgress, setLocalProgress] = useState<Record<string, boolean>>({});

  const blocks = lesson.contentBlocks || [];
  const totalBlocks = blocks.length;
  const currentBlock = blocks[currentBlockIndex];
  const progressPercent = totalBlocks > 0
    ? Math.round(((currentBlockIndex + 1) / totalBlocks) * 100)
    : 0;

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBlockIndex, totalBlocks]);

  const goNext = useCallback(() => {
    if (currentBlockIndex < totalBlocks - 1) {
      setCurrentBlockIndex((i) => i + 1);
    }
  }, [currentBlockIndex, totalBlocks]);

  const goPrev = useCallback(() => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((i) => i - 1);
    }
  }, [currentBlockIndex]);

  const handleBlockComplete = useCallback((blockId: string) => {
    setLocalProgress((prev) => ({ ...prev, [blockId]: true }));
  }, []);

  const handleLessonComplete = useCallback(async () => {
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masteryPercent: 100 }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.xpAwarded > 0) {
          setXpAmount(data.xpAwarded);
          setShowXp(true);
        }
      }
    } catch (err) {
      console.error("Failed to complete lesson:", err);
    }

    setCompleted(true);
    setShowConfetti(true);
    onComplete();
  }, [lesson.id, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col animate-fade-in">
      {/* XP Popup */}
      <XpPopup amount={xpAmount} show={showXp} onDismiss={() => setShowXp(false)} />
      <Confetti show={showConfetti} />

      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-surface-raised/90 backdrop-blur-md border-b border-border flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: back + title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <a
              href={`/theme/${themeSlug}/quest/${questSlug}`}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-text-muted flex-shrink-0"
              title="Back to quest"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div className="min-w-0">
              <p className="text-xs text-text-muted truncate">{questTitle}</p>
              <h1 className="text-sm font-bold text-text truncate">{lesson.title}</h1>
            </div>
          </div>

          {/* Center: progress */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs">
            <Progress value={progressPercent} size="sm" className="flex-1" />
            <span className="text-xs font-semibold text-text-muted flex-shrink-0">
              {currentBlockIndex + 1}/{totalBlocks}
            </span>
          </div>

          {/* Right: XP + close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {lesson.xpReward?.base && (
              <XpBadge amount={lesson.xpReward.base} />
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-text-muted"
              title="Close lesson"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden h-1 bg-surface-sunken">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {/* Current content block */}
          {currentBlock && (
            <div className="animate-fade-in" key={currentBlock.id}>
              {/* Block type indicator */}
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-text-muted" />
                <span className="text-xs font-medium text-text-muted">
                  {currentBlockIndex + 1} of {totalBlocks}
                </span>
                <span className="text-xs text-text-muted">•</span>
                <span className="text-xs font-medium text-text-muted capitalize">
                  {currentBlock.type}
                </span>
              </div>

              {/* The actual block */}
              <div className="bg-surface-raised rounded-2xl border border-border p-6">
                <BlockRenderer
                  block={currentBlock}
                  onQuizComplete={() => handleBlockComplete(currentBlock.id)}
                />
              </div>
            </div>
          )}

          {/* Block dots navigation */}
          {totalBlocks > 1 && (
            <div className="flex justify-center gap-1.5 py-2">
              {blocks.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBlockIndex(i)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    i === currentBlockIndex
                      ? "bg-primary w-6"
                      : localProgress[blocks[i].id]
                      ? "bg-success"
                      : "bg-surface-sunken hover:bg-border"
                  )}
                />
              ))}
            </div>
          )}

          {/* Completion area */}
          {currentBlockIndex === totalBlocks - 1 && (
            <div className="space-y-4 pt-4">
              {completed ? (
                <div className="bg-success/10 border border-success/20 rounded-2xl p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-text mb-1">Lesson Complete!</h3>
                  <p className="text-sm text-text-muted mb-4">
                    Great work! You&apos;ve finished this lesson.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <a
                      href={`/theme/${themeSlug}/quest/${questSlug}`}
                      className="bg-primary text-white rounded-xl px-5 py-2.5 font-semibold text-sm hover:bg-primary-dark transition-colors"
                    >
                      Back to Quest
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                  <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-text mb-1">Ready to complete?</h3>
                  <p className="text-sm text-text-muted mb-4">
                    Mark this lesson as complete to earn{" "}
                    <span className="font-bold text-amber-600">+{lesson.xpReward?.base || 50} XP</span>
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={goPrev}
                      className="bg-surface-sunken border border-border text-text rounded-xl px-4 py-2.5 font-semibold text-sm hover:bg-border transition-colors"
                    >
                      Review Again
                    </button>
                    <button
                      onClick={handleLessonComplete}
                      className="bg-success text-white rounded-xl px-5 py-2.5 font-semibold text-sm hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Complete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom navigation */}
      <footer className="sticky bottom-0 z-10 bg-surface-raised/90 backdrop-blur-md border-t border-border flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={currentBlockIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-text-muted hover:bg-surface-sunken disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-xs text-text-muted font-medium">
            {progressPercent}% complete
          </span>

          <button
            onClick={currentBlockIndex === totalBlocks - 1 ? onClose : goNext}
            disabled={currentBlockIndex === totalBlocks - 1 && !completed}
            className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-all"
          >
            {currentBlockIndex === totalBlocks - 1 ? "Finish" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}

// ── Block renderer with interactive support ──────────────────

interface BlockRendererProps {
  block: ContentBlock;
  onQuizComplete?: () => void;
}

function BlockRenderer({ block, onQuizComplete }: BlockRendererProps) {
  const data = block.data;

  switch (block.type) {
    case "text":
      return (
        <div className="prose prose-sm max-w-none">
          {((data.content as string) || "").split("\n\n").map((p, i) => (
            <p key={i} className="text-text-muted leading-relaxed mb-3 last:mb-0">{p}</p>
          ))}
        </div>
      );

    case "image":
      return (
        <div>
          {data.url && (
            <img src={data.url as string} alt={(data.caption as string) || ""} className="w-full rounded-xl object-cover max-h-80" />
          )}
          {data.caption && <p className="text-xs text-text-muted mt-2 italic text-center">{data.caption as string}</p>}
        </div>
      );

    case "video":
      return (
        <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={data.url as string}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            title="Video content"
          />
        </div>
      );

    case "experiment":
      return (
        <div className="space-y-4">
          {data.title && <h4 className="font-semibold text-text">{data.title as string}</h4>}
          {(data.materials as any[])?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Materials</p>
              <ul className="space-y-1">
                {(data.materials as any[]).map((m: any, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    {typeof m === "string" ? m : m.item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(data.steps as string[])?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Steps</p>
              <ol className="space-y-2">
                {(data.steps as string[]).map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-text-muted">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      );

    case "quiz":
      return (
        <QuizInline
          question={(data.question as string) || ""}
          options={(data.options as string[]) || []}
          correctIndex={(data.correctIndex as number) || 0}
          explanation={(data.explanation as string) || ""}
          onComplete={onQuizComplete}
        />
      );

    case "journal":
      return (
        <div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-3">
            <p className="text-sm text-purple-800 font-medium">{data.prompt as string}</p>
          </div>
          <textarea
            placeholder="Write your reflection..."
            rows={4}
            className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>
      );

    default:
      return <p className="text-sm text-text-muted italic">Unsupported: {block.type}</p>;
  }
}

// ── Inline quiz for lesson viewer ────────────────────────────

interface QuizInlineProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onComplete?: () => void;
}

function QuizInline({ question, options, correctIndex, explanation, onComplete }: QuizInlineProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    onComplete?.();
  };

  const isCorrect = selected === correctIndex;

  return (
    <div className="space-y-4">
      <p className="font-medium text-text">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          let style = "border-border hover:border-primary/50";
          if (submitted) {
            style = i === correctIndex
              ? "border-success bg-success/5"
              : i === selected
              ? "border-danger bg-danger/5"
              : "border-border opacity-50";
          } else if (i === selected) {
            style = "border-primary bg-primary/5";
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              disabled={submitted}
              className={cn("w-full text-left rounded-xl border px-4 py-3 text-sm transition-all", style)}
            >
              <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {submitted && (
        <>
          {explanation && (
            <div className={cn("p-3 rounded-xl text-sm", isCorrect ? "bg-success/10 text-success" : "bg-amber-50 text-amber-800")}>
              {isCorrect ? "✅ Correct! " : "💡 "}{explanation}
            </div>
          )}
          {!isCorrect && (
            <button
              onClick={() => { setSubmitted(false); setSelected(null); }}
              className="text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Try again →
            </button>
          )}
        </>
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          Check Answer
        </button>
      )}
    </div>
  );
}
