// @ts-nocheck
/**
 * RemediationTutor — the multi-turn tutoring surface.
 *
 * Replaces the single-shot RemediationTapChoice overlay. The learner can:
 *   - read the tutor's response (acknowledgement, misconception, scaffold,
 *     thinking question, retry invitation)
 *   - answer the tutor's question (the original or the transfer question)
 *   - retry, and receive the tutor's next response
 *   - eventually reach a worked explanation and a transfer question
 *
 * Every turn carries its stage so the escalation is visible to the learner.
 * A degraded turn (deterministic fallback, not the model) is labelled as such
 * and is never presented as AI tutoring.
 *
 * This is an EXTENSION of the existing overlay: same visual language, same
 * tap_choice interaction, plus a transcript and a stage badge.
 */

import { useEffect, useState } from "react";
import type { RemediationStage, TutoringTurn } from "@/lib/ai/AIProvider";

export interface TutorQuestion {
  prompt: string;
  options: string[];
  correctAnswer: string;
  isTransfer: boolean;
}

const STAGE_LABEL: Record<RemediationStage, { text: string; color: string; bg: string }> = {
  scaffold: { text: "Let us think about this together", color: "#4338CA", bg: "#EEF2FF" },
  deeper_scaffold: { text: "A different way to look at it", color: "#6D28D9", bg: "#F5F3FF" },
  explain_then_transfer: { text: "Now we work through it", color: "#B45309", bg: "#FFFBEB" },
  recovered: { text: "You have got it", color: "#047857", bg: "#ECFDF5" },
};

export function RemediationTutor({
  turn,
  question,
  conceptId,
  /** True when this turn came from a deterministic fallback, not the model. */
  degraded,
  providerLabel,
  onAnswer,
}: {
  turn: TutoringTurn;
  question: TutorQuestion;
  conceptId?: string;
  degraded?: boolean;
  providerLabel?: string;
  onAnswer?: (selectedId: string, isCorrect: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  /**
   * Reset when a NEW turn arrives.
   *
   * The tutor is a multi-turn conversation rendered by one component instance.
   * Without this, a second turn would still carry the previous turn's
   * `submitted` state, the options would be locked, and the learner would be
   * unable to answer the tutor's next question.
   */
  const turnSignature = [
    turn.stage,
    turn.acknowledgement,
    question.prompt,
    question.isTransfer ? 'transfer' : 'original',
  ].join('|');

  const [lastSignature, setLastSignature] = useState(turnSignature);
  if (lastSignature !== turnSignature) {
    // Resets during render (safe: no side effects, React re-renders immediately)
    setLastSignature(turnSignature);
    setSelectedId(null);
    setSubmitted(false);
  }

  const stage = STAGE_LABEL[turn.stage] || STAGE_LABEL.scaffold;
  const options = (question.options || []).map((label, i) => ({
    id: String(i),
    label: typeof label === "string" ? label : label?.label,
  }));

  const norm = (v: string) => String(v || "").trim().toLowerCase();
  const correctIndex = options.findIndex(
    (o) => norm(o.label) === norm(question.correctAnswer),
  );
  const isCorrectPick = (c: { id: string }) => c.id === String(correctIndex);

  return (
    <div data-testid="tutor-turn" data-stage={turn.stage}>
      {/* Stage badge + provenance */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <span
          data-testid="tutor-stage"
          style={{
            fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase",
            color: stage.color, background: stage.bg, padding: "4px 10px", borderRadius: 999,
            border: `1px solid ${stage.color}33`,
          }}
        >
          {stage.text}
        </span>
        {question.isTransfer && (
          <span
            data-testid="tutor-transfer-badge"
            style={{
              fontSize: 11, fontWeight: 800, color: "#B45309", background: "#FEF3C7",
              padding: "4px 10px", borderRadius: 999, border: "1px solid #F59E0B55",
            }}
          >
            New question — did it transfer?
          </span>
        )}
        {degraded && (
          <span
            data-testid="tutor-degraded"
            title={turn.degradedReason}
            style={{
              fontSize: 11, fontWeight: 800, color: "#7F1D1D", background: "#FEE2E2",
              padding: "4px 10px", borderRadius: 999, border: "1px solid #DC262655",
            }}
          >
            Offline help mode{providerLabel ? ` · ${providerLabel}` : ""}
          </span>
        )}
        {!degraded && providerLabel && (
          <span data-testid="tutor-provider" style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>
            Tutored by {providerLabel}
          </span>
        )}
      </div>

      {/* The tutor's teaching */}
      <div style={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.65, whiteSpace: "pre-wrap", marginBottom: 14 }}>
        {turn.acknowledgement}
        {"\n\n"}
        {turn.misconceptionExplanation}
        {turn.workedExample ? `\n\nHow it works:\n${turn.workedExample}` : ""}
        {turn.scaffold?.content ? `\n\n${turn.scaffold.content}` : ""}
        {turn.thinkingQuestion ? `\n\nBefore you answer: ${turn.thinkingQuestion}` : ""}
      </div>

      {/* The question the learner must answer now */}
      <div style={{ fontWeight: 800, color: "#1E293B", marginBottom: 8, fontSize: "0.95rem" }}>
        {question.prompt}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {options.map((c, i) => {
          const picked = selectedId === c.id;
          const correct = isCorrectPick(c);
          let bg = "#fff", border = "#CBD5E1", color = "#334155";
          if (submitted && picked) {
            if (correct) { bg = "#D1FAE5"; border = "#10B981"; }
            else { bg = "#FEE2E2"; border = "#EF4444"; }
          }
          return (
            <button
              key={c.id}
              data-testid={`tutor-choice-${i}`}
              onClick={() => {
                if (submitted) return;
                setSelectedId(c.id);
                setSubmitted(true);
                onAnswer?.(c.id, correct);
              }}
              disabled={submitted}
              style={{
                padding: "12px 16px", borderRadius: 10, border: `2px solid ${border}`,
                background: bg, display: "flex", alignItems: "center", gap: 10,
                cursor: submitted ? "default" : "pointer", textAlign: "left", width: "100%",
                fontSize: "0.875rem",
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: "50%", border: `2px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700, color: border, flexShrink: 0,
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ color, flex: 1 }}>{c.label}</span>
            </button>
          );
        })}
      </div>

      {submitted && (
        <div
          data-testid="tutor-reply"
          style={{
            padding: "10px 14px", borderRadius: 8, fontWeight: 700, fontSize: "0.875rem",
            background: isCorrectPick({ id: selectedId || "" }) ? "#D1FAE5" : "#FEF3C7",
            border: `1px solid ${isCorrectPick({ id: selectedId || "" }) ? "#A7F3D0" : "#FDE68A"}`,
            color: isCorrectPick({ id: selectedId || "" }) ? "#065F46" : "#92400E",
          }}
        >
          {isCorrectPick({ id: selectedId || "" })
            ? "Yes — that is it. Well done."
            : "Not quite. Have another careful look and try again."}
        </div>
      )}

      {/* Retry invitation is always present so the learner is never stranded */}
      <div style={{ marginTop: 12, fontSize: "0.875rem", color: "#4338CA", fontWeight: 700, fontStyle: "italic" }}>
        {turn.inviteRetry}
      </div>
    </div>
  );
}

/**
 * Backwards-compatible wrapper: the previous single-shot overlay.
 * Kept so existing call sites and the RemediationTapChoice import still work.
 */
export function RemediationTapChoice(props: {
  choices: any[];
  correctChoiceId: string;
  feedbackSpec?: { correct?: string; incorrect?: string; hint?: string };
  conceptId?: string;
  onAnswer?: (selectedId: string, isCorrect: boolean) => void;
}) {
  const { choices, correctChoiceId, feedbackSpec, conceptId, onAnswer } = props;
  const options = (choices || []).map((c, i) => ({
    id: (typeof c === "object" && c?.id) || String(i),
    label: typeof c === "string" ? c : c?.label,
  }));
  const correct = options.find((o) => o.id === correctChoiceId);

  const turn: TutoringTurn = {
    acknowledgement: "Let us look at this together.",
    misconceptionExplanation: "",
    scaffold: { kind: "hint", content: feedbackSpec?.hint || "Read the question carefully." },
    thinkingQuestion: "",
    inviteRetry: "Have another go.",
    stage: "scaffold",
  };

  return (
    <RemediationTutor
      turn={turn}
      question={{
        prompt: "Choose your answer",
        options: options.map((o) => o.label),
        correctAnswer: correct?.label || "",
        isTransfer: false,
      }}
      conceptId={conceptId}
      degraded
      onAnswer={onAnswer}
    />
  );
}

export default RemediationTutor;
