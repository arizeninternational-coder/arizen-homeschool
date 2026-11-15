"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, GripVertical, RotateCcw } from "lucide-react";
import { formatOrder, isCorrectOrder, type OrderDirection } from "@/lib/curriculum/order-question";

/**
 * NumberOrderingCards — arrange number cards into order.
 *
 * Replaces the four pre-sorted multiple-choice strings with the underlying task:
 * the learner moves the numbers themselves. The answer it reports is the same
 * comma-joined string the curriculum configs already use for `correctAnswer`, so
 * scoring and misconception detection downstream are unchanged.
 *
 * Three input methods, because this runs on school tablets and phones:
 *   - drag a card onto another slot to swap (mouse)
 *   - tap one card, then another, to swap (touch)
 *   - focus a card and use ← / → to move it one place (keyboard)
 */

interface Props {
  numbers: number[];
  direction?: OrderDirection;
  /** Canonical answer, e.g. "298, 345, 476, 521". Omit for a preview. */
  expectedAnswer?: string;
  disabled?: boolean;
  /** Called on Check with the arrangement and whether it matched. */
  onChecked?: (answer: string, correct: boolean) => void;
  /** Admin previews render it smaller and non-scoring. */
  compact?: boolean;
}

const CARD_TINTS = [
  { bg: "#EEF2FF", border: "#A5B4FC", text: "#3730A3" },
  { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E" },
  { bg: "#DCFCE7", border: "#86EFAC", text: "#166534" },
  { bg: "#FCE7F3", border: "#F9A8D4", text: "#9D174D" },
  { bg: "#E0F2FE", border: "#7DD3FC", text: "#075985" },
  { bg: "#F3E8FF", border: "#D8B4FE", text: "#6B21A8" },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export function NumberOrderingCards({
  numbers,
  direction = "asc",
  expectedAnswer,
  disabled = false,
  onChecked,
  compact = false,
}: Props) {
  const reducedMotion = useReducedMotion();

  // Stable starting layout: the prompt's own (scrambled) order. Re-seed only if
  // the question itself changes, so a re-render never resets the learner's work.
  const seedKey = numbers.join(",");
  const [order, setOrder] = useState<number[]>(numbers);
  const [selected, setSelected] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setOrder(numbers);
    setSelected(null);
    setResult(null);
    setAnnouncement("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedKey]);

  const tintFor = useMemo(() => {
    const map = new Map<number, (typeof CARD_TINTS)[number]>();
    [...numbers]
      .sort((a, b) => a - b)
      .forEach((n, i) => map.set(n, CARD_TINTS[i % CARD_TINTS.length]));
    return (n: number) => map.get(n) || CARD_TINTS[0];
  }, [numbers]);

  const swap = useCallback(
    (from: number, to: number) => {
      if (disabled || from === to || from < 0 || to < 0) return;
      setOrder((prev) => {
        if (from >= prev.length || to >= prev.length) return prev;
        const next = [...prev];
        [next[from], next[to]] = [next[to], next[from]];
        setAnnouncement(`${next[to]} moved to position ${to + 1}`);
        return next;
      });
      setResult(null);
    },
    [disabled]
  );

  const handleCardTap = (idx: number) => {
    if (disabled) return;
    if (selected === null) {
      setSelected(idx);
      setAnnouncement(`Picked up ${order[idx]}. Choose where it should go.`);
      return;
    }
    if (selected === idx) {
      setSelected(null);
      setAnnouncement(`Put ${order[idx]} back down.`);
      return;
    }
    swap(selected, idx);
    setSelected(null);
  };

  const handleCheck = () => {
    if (disabled) return;
    const answer = formatOrder(order);
    const correct = expectedAnswer ? isCorrectOrder(answer, expectedAnswer) : false;
    setResult(correct ? "correct" : "incorrect");
    onChecked?.(answer, correct);
  };

  const dirLabel = direction === "asc" ? "smallest to largest" : "largest to smallest";
  const leftLabel = direction === "asc" ? "SMALLEST" : "LARGEST";
  const rightLabel = direction === "asc" ? "LARGEST" : "SMALLEST";

  const solved = result === "correct";

  return (
    <div
      className="rounded-2xl border-2 p-4 sm:p-5"
      style={{
        borderColor: solved ? "#6EE7B7" : result === "incorrect" ? "#FCD34D" : "#E2E8F0",
        background: solved
          ? "linear-gradient(135deg,#ECFDF5,#F0FDF4)"
          : result === "incorrect"
            ? "linear-gradient(135deg,#FFFBEB,#FEFCE8)"
            : "linear-gradient(135deg,#FFFFFF,#F8FAFF)",
        transition: reducedMotion ? undefined : "background 320ms ease, border-color 320ms ease",
      }}
    >
      {/* Direction track — makes the goal spatial, not just words */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-extrabold tracking-wider text-slate-500">{leftLabel}</span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-[11px] font-extrabold tracking-wider text-slate-500">{rightLabel}</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: "linear-gradient(90deg,#A5B4FC,#FCD34D,#86EFAC)" }} />
        <p className="text-xs text-slate-500 mt-1.5">
          Drag the cards into order — {dirLabel}. Tap one card then another to swap.
        </p>
      </div>

      {/* Slots */}
      <div
        role="list"
        aria-label={`Arrange ${numbers.length} number cards, ${dirLabel}`}
        className={`grid gap-2.5 sm:gap-3 ${compact ? "" : "mt-1"}`}
        style={{ gridTemplateColumns: `repeat(${Math.min(numbers.length, 4)}, minmax(0, 1fr))` }}
      >
        {order.map((value, idx) => {
          const tint = tintFor(value);
          const isSelected = selected === idx;
          const isDragTarget = dragOver === idx && dragFrom !== null && dragFrom !== idx;
          const size = compact ? "py-3" : "py-5 sm:py-7";
          return (
            <div key={`${value}-${idx}`} role="listitem" className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                draggable={!disabled}
                onDragStart={() => setDragFrom(idx)}
                onDragEnd={() => {
                  setDragFrom(null);
                  setDragOver(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(idx);
                }}
                onDragLeave={() => setDragOver((p) => (p === idx ? null : p))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragFrom !== null) swap(dragFrom, idx);
                  setDragFrom(null);
                  setDragOver(null);
                }}
                onClick={() => handleCardTap(idx)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    swap(idx, idx - 1);
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    swap(idx, idx + 1);
                  }
                }}
                aria-label={`Position ${idx + 1}: ${value}. Use arrow keys to move.`}
                aria-pressed={isSelected}
                disabled={disabled}
                className={`relative w-full rounded-xl border-2 font-black tabular-nums select-none ${size} ${
                  disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
                } ${reducedMotion ? "" : "transition-transform hover:-translate-y-0.5"}`}
                style={{
                  background: tint.bg,
                  borderColor: isDragTarget ? "#6366F1" : isSelected ? "#6366F1" : tint.border,
                  color: tint.text,
                  fontSize: compact ? "1.35rem" : "clamp(1.6rem, 4vw, 2.25rem)",
                  boxShadow: isSelected
                    ? "0 0 0 4px rgba(99,102,241,0.22)"
                    : isDragTarget
                      ? "0 0 0 4px rgba(99,102,241,0.18)"
                      : "0 2px 6px rgba(15,23,42,0.06)",
                  transform: !reducedMotion && isSelected ? "scale(1.04)" : undefined,
                  outline: "none",
                }}
              >
                <GripVertical
                  className="w-3.5 h-3.5 absolute top-1.5 left-1.5 opacity-30"
                  aria-hidden="true"
                />
                {value}
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => swap(idx, idx - 1)}
                  disabled={disabled || idx === 0}
                  aria-label={`Move ${value} left`}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-25"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold text-slate-400 w-4 text-center">{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => swap(idx, idx + 1)}
                  disabled={disabled || idx === order.length - 1}
                  aria-label={`Move ${value} right`}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-25"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live region for screen readers */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {/* Check + feedback */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || !expectedAnswer}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
            boxShadow: "0 4px 14px rgba(79,70,229,0.28)",
          }}
        >
          {solved ? <CheckCircle2 className="w-4 h-4" /> : null}
          {solved ? "In order!" : "Check my order"}
        </button>

        {!solved && (result === "incorrect" || selected !== null) && (
          <button
            type="button"
            onClick={() => {
              setOrder(numbers);
              setSelected(null);
              setResult(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Start over
          </button>
        )}

        {result === "correct" && (
          <span className="text-sm font-extrabold" style={{ color: "#047857" }}>
            {formatOrder(order)} ✓
          </span>
        )}
        {result === "incorrect" && (
          <span className="text-sm font-bold" style={{ color: "#B45309" }}>
            Not yet — look at the hundreds digit first.
          </span>
        )}
      </div>
    </div>
  );
}
