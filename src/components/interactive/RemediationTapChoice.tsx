"use client";

import React, { useState } from "react";
import { FeedbackDisplay } from "./InteractionRenderers";

/**
 * RemediationTapChoice renders the interactive scaffold portion of a
 * misconception-specific remediation step.
 *
 * Key design rules:
 *  - The correct answer is NEVER pre-selected or highlighted before the
 *    learner has chosen.
 *  - After the learner selects (correct or incorrect), immediate targeted
 *    feedback is shown.
 *  - The learner can re-select to try again within the scaffold (no
 *    permanent lock-in until they hit "Try Again" in the parent overlay).
 */
export function RemediationTapChoice({
  choices,
  correctChoiceId,
  feedbackSpec,
  conceptId,
  onAnswer,
}: {
  choices: any[];
  correctChoiceId: string;
  feedbackSpec?: { correct?: string; incorrect?: string; hint?: string };
  conceptId?: string;
  onAnswer?: (selectedId: string, isCorrect: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const normChoice = (c: any): { id: string; label: string; description?: string } => {
    if (typeof c === "string") {
      return { id: c, label: c };
    }
    return {
      id: c.id ?? String(c.label ?? ""),
      label: c.label ?? "",
      description: c.description,
    };
  };

  const normalized = choices.map(normChoice);
  const isCorrectPick = (c: { id: string }) => c.id === correctChoiceId;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
      {normalized.map((choice, i) => {
        const picked = selectedId === choice.id;
        const correct = isCorrectPick(choice);
        let bg = "#fff";
        let border = "2px solid #CBD5E1";
        let color = "#334155";

        if (submitted && picked) {
          if (correct) {
            bg = "#D1FAE5";
            border = "2px solid #10B981";
          } else {
            bg = "#FEE2E2";
            border = "2px solid #EF4444";
          }
        }

        return (
          <button
            key={i}
            onClick={() => {
              if (submitted) return;
              setSelectedId(choice.id);
              setSubmitted(true);
              const isCorrect = choice.id === correctChoiceId;
              onAnswer?.(choice.id, isCorrect);
            }}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border,
              background: bg,
              textAlign: "left",
              cursor: submitted ? "default" : "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              color,
            }}
            disabled={submitted}
          >
            {choice.label} {choice.description ? `-- ${choice.description}` : ""}
          </button>
        );
      })}
      {submitted && selectedId !== null && (() => {
        const pickedChoice = normalized.find((c) => c.id === selectedId);
        const isCorrect = pickedChoice ? isCorrectPick(pickedChoice) : false;
        return isCorrect ? (
          <FeedbackDisplay
            state="correct"
            feedback={{ correct: feedbackSpec?.correct || "Exactly right!" }}
          />
        ) : (
          <FeedbackDisplay
            state="incorrect"
            feedback={{
              incorrect: feedbackSpec?.incorrect || feedbackSpec?.hint || "Not quite — think about it and try the Try Again button below.",
              hint: feedbackSpec?.hint,
            }}
          />
        );
      })()}
    </div>
  );
}
