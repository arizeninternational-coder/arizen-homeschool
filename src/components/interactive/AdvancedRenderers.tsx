"use client";

import React, { useState } from "react";
import { FractionCircle, FractionRectangle } from "./FractionVisuals";
import { FeedbackDisplay, TapChoice, MultipleChoice } from "./InteractionRenderers";

// -- Tap Region ----------------------------------------------------------------

interface TapRegionProps {
  visualSpec: {
    type?: string;
    parts?: number;
    shadedParts?: number;
    equalParts?: boolean;
    showLabels?: boolean;
    labels?: string[];
    object?: string;
    highlightPart?: number;
    label?: string;
    orientation?: string;
  };
  correctRegion: string;
  prompt?: string;
  feedback?: { correct?: string; incorrect?: string; hint?: string };
  onAnswer?: (correct: boolean) => void;
}

export function TapRegion({
  visualSpec,
  correctRegion,
  prompt,
  feedback,
  onAnswer,
}: TapRegionProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const parts = visualSpec.parts || 2;
  const isCorrect = selectedRegion === correctRegion;
  const state = !submitted ? "idle" : isCorrect ? "correct" : "incorrect";

  const handlePartClick = (partIndex: number) => {
    if (submitted) return;
    const regionId = `part_${partIndex + 1}`;
    setSelectedRegion(regionId);
    setSubmitted(true);
    onAnswer?.(regionId === correctRegion);
  };

  // Render a fraction shape with tappable parts
  const renderTappableShape = () => {
    if (visualSpec.type === "real_life_fraction" || visualSpec.object) {
      // For real-life objects, render as fraction circle with object label
      const objName = visualSpec.object || "shape";
      return (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-slate-500 font-semibold capitalize">{objName}</p>
          <FractionCircle
            parts={parts}
            shadedParts={selectedRegion ? 1 : 0}
            equalParts={visualSpec.equalParts !== false}
            showLabels={visualSpec.showLabels !== false}
            labels={visualSpec.labels}
            size={160}
            interactive
            onClickPart={(i) => handlePartClick(i)}
          />
        </div>
      );
    }

    // Default: fraction circle
    return (
      <FractionCircle
        parts={parts}
        shadedParts={selectedRegion ? 1 : 0}
        equalParts={visualSpec.equalParts !== false}
        showLabels={visualSpec.showLabels !== false}
        labels={visualSpec.labels}
        size={160}
        interactive
        onClickPart={(i) => handlePartClick(i)}
      />
    );
  };

  return (
    <div className="mt-4 space-y-3">
      {prompt && (
        <p className="text-base font-bold text-slate-800">{prompt}</p>
      )}
      <div className="flex justify-center">{renderTappableShape()}</div>
      {!submitted && (
        <p className="text-xs text-slate-500 text-center">
          Tap one part of the shape.
        </p>
      )}
      {feedback && <FeedbackDisplay feedback={feedback} state={state} />}
    </div>
  );
}

// -- Shade Shape ---------------------------------------------------------------

interface ShadeShapeProps {
  shape: {
    type?: string;
    parts?: number;
    equalParts?: boolean;
    orientation?: string;
  };
  requiredShadedParts: number;
  prompt?: string;
  feedback?: { correct?: string; incorrect?: string; hint?: string };
  onAnswer?: (correct: boolean) => void;
}

export function ShadeShape({
  shape,
  requiredShadedParts,
  prompt,
  feedback,
  onAnswer,
}: ShadeShapeProps) {
  const [shadedParts, setShadedParts] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = shadedParts === requiredShadedParts;
  const state = !submitted ? "idle" : isCorrect ? "correct" : "incorrect";

  const handlePartClick = (partIndex: number) => {
    if (submitted) return;
    // Toggle: if clicking an already shaded part, unshade it
    // Simple approach: track count, cycle through parts
    const newCount = shadedParts === partIndex + 1 ? partIndex : partIndex + 1;
    setShadedParts(newCount);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onAnswer?.(isCorrect);
  };

  const isRectangle = shape.type === "fraction_rectangle";

  return (
    <div className="mt-4 space-y-3">
      {prompt && (
        <p className="text-base font-bold text-slate-800">{prompt}</p>
      )}

      <div className="flex justify-center">
        {isRectangle ? (
          <FractionRectangle
            parts={shape.parts || 2}
            shadedParts={shadedParts}
            equalParts={shape.equalParts !== false}
            orientation={(shape.orientation as "horizontal" | "vertical") || "vertical"}
            showLabels={false}
            width={180}
            height={120}
            interactive
            onClickPart={handlePartClick}
          />
        ) : (
          <FractionCircle
            parts={shape.parts || 2}
            shadedParts={shadedParts}
            equalParts={shape.equalParts !== false}
            showLabels={false}
            size={160}
            interactive
            onClickPart={handlePartClick}
          />
        )}
      </div>

      <p className="text-xs text-slate-500 text-center">
        Tap parts to shade. Shade exactly {requiredShadedParts} part{requiredShadedParts > 1 ? "s" : ""}.
        Currently shaded: {shadedParts}
      </p>

      {!submitted && shadedParts > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
          >
            Check my shading
          </button>
        </div>
      )}

      {feedback && <FeedbackDisplay feedback={feedback} state={state} />}
    </div>
  );
}

// -- Multi Activity -----------------------------------------------------------

interface ActivityItem {
  id: string;
  type: string;
  prompt?: string;
  question?: string;
  choices?: string[];
  options?: string[];
  correctChoiceId?: string;
  correctIndex?: number;
  correctAnswer?: number | string;
  hint?: string;
  shape?: any;
  requiredShadedParts?: number;
  expectedIdea?: string;
  keywords?: string[];
}

interface MultiActivityProps {
  activities: ActivityItem[];
  feedback?: { correct?: string; incorrect?: string; hint?: string };
  onComplete?: () => void;
}

export function MultiActivity({
  activities,
  feedback,
  onComplete,
}: MultiActivityProps) {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [activityStates, setActivityStates] = useState<Record<string, any>>({});
  const [allSubmitted, setAllSubmitted] = useState(false);

  const activity = activities[currentActivity];
  if (!activity) return null;

  const isLastActivity = currentActivity >= activities.length - 1;

  const handleActivityAnswer = (activityId: string, state: any) => {
    setActivityStates((prev) => ({ ...prev, [activityId]: state }));
  };

  const handleNextActivity = () => {
    if (isLastActivity) {
      setAllSubmitted(true);
      onComplete?.();
    } else {
      setCurrentActivity((c) => c + 1);
    }
  };

  const renderActivity = (act: ActivityItem) => {
    const actState = activityStates[act.id] || {};

    if (act.type === "tap_choice") {
      const choices = act.choices || act.options || [];
      return (
        <TapChoice
          key={act.id}
          prompt={act.prompt || act.question}
          options={choices.map((c: any, i: number) => ({
            id: typeof c === "string" ? String(i) : c.id || String(i),
            label: typeof c === "string" ? String.fromCharCode(65 + i) : c.label || String.fromCharCode(65 + i),
            description: typeof c === "string" ? c : c.description,
          }))}
          correctChoiceId={act.correctChoiceId}
          onSelect={(choiceId) => {
            const isCorrect = choiceId === act.correctChoiceId;
            handleActivityAnswer(act.id, { selectedChoiceId: choiceId, submitted: true, isCorrect });
          }}
          feedback={actState.submitted ? {
            correct: "Correct!",
            incorrect: "Try again.",
            hint: act.hint,
          } : undefined}
          disabled={actState.submitted}
        />
      );
    }

    if (act.type === "multiple_choice") {
      const options = act.options || act.choices || [];
      const correctIdx = act.correctIndex != null ? act.correctIndex : (typeof act.correctAnswer === "number" ? act.correctAnswer : 0);
      return (
        <MultipleChoice
          key={act.id}
          question={act.question || act.prompt || ""}
          options={options}
          correctIndex={correctIdx}
          feedback={actState.submitted ? {
            correct: "Correct!",
            incorrect: "Not quite.",
            hint: act.hint,
          } : undefined}
          onAnswer={(correct) => {
            handleActivityAnswer(act.id, { submitted: true, isCorrect: correct });
          }}
        />
      );
    }

    if (act.type === "shade_shape") {
      return (
        <ShadeShape
          key={act.id}
          shape={act.shape || { type: "fraction_circle", parts: 2, equalParts: true }}
          requiredShadedParts={act.requiredShadedParts || 1}
          prompt={act.prompt}
          feedback={actState.submitted ? {
            correct: "Well done!",
            incorrect: "Try again.",
            hint: act.hint,
          } : undefined}
          onAnswer={(correct) => {
            handleActivityAnswer(act.id, { submitted: true, isCorrect: correct });
          }}
        />
      );
    }

    if (act.type === "tap_region") {
      return (
        <TapRegion
          key={act.id}
          visualSpec={act.shape || { type: "fraction_circle", parts: 2, equalParts: true }}
          correctRegion="part_1"
          prompt={act.prompt}
          feedback={actState.submitted ? {
            correct: "Correct!",
            incorrect: "Try again.",
            hint: act.hint,
          } : undefined}
          onAnswer={(correct) => {
            handleActivityAnswer(act.id, { submitted: true, isCorrect: correct });
          }}
        />
      );
    }

    if (act.type === "short_response" || act.type === "open_response") {
      const [text, setText] = useState(actState.text || "");
      const [saved, setSaved] = useState(actState.submitted || false);

      return (
        <div key={act.id} className="space-y-2">
          {act.prompt && (
            <p className="text-sm font-semibold text-slate-700">{act.prompt}</p>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your answer..."
            rows={3}
            disabled={saved}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50"
          />
          {!saved && text.trim() && (
            <button
              onClick={() => {
                setSaved(true);
                handleActivityAnswer(act.id, { submitted: true, text });
              }}
              className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
            >
              Save Answer
            </button>
          )}
          {saved && (
            <p className="text-xs text-emerald-600 font-semibold">✓ Answer saved</p>
          )}
        </div>
      );
    }

    // Fallback for unknown activity types
    return (
      <div key={act.id} className="text-sm text-slate-500 italic">
        Activity: {act.type} — {act.prompt || "Complete this activity."}
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Activity progress */}
      <div className="flex items-center gap-2 justify-center">
        {activities.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all flex-1 ${
              i < currentActivity
                ? "bg-emerald-400"
                : i === currentActivity
                ? "bg-indigo-500"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-wider">
        Activity {currentActivity + 1} of {activities.length}
      </p>

      {/* Current activity */}
      {renderActivity(activity)}

      {/* Next / Complete button */}
      {activityStates[activity.id]?.submitted && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleNextActivity}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
          >
            {isLastActivity ? "Complete Practice ✓" : "Next Activity →"}
          </button>
        </div>
      )}

      {allSubmitted && feedback && (
        <FeedbackDisplay feedback={feedback} state="correct" />
      )}
    </div>
  );
}

// -- Real Life Fraction -------------------------------------------------------

interface RealLifeFractionProps {
  object: string;
  parts: number;
  equalParts?: boolean;
  highlightPart?: number;
  label?: string;
}

export function RealLifeFraction({
  object,
  parts,
  equalParts = true,
  highlightPart = 1,
  label,
}: RealLifeFractionProps) {
  // Map object names to visual types
  const isCircular = ["chapati", "mandazi", "orange", "plate", "clock", "wheel"].some(
    (o) => object.toLowerCase().includes(o)
  );

  const shape = isCircular ? "fraction_circle" : "fraction_rectangle";

  return (
    <div className="flex flex-col items-center gap-3 my-4">
      <p className="text-sm text-slate-600 font-semibold capitalize">
        {object}
      </p>
      {shape === "fraction_circle" ? (
        <FractionCircle
          parts={parts}
          shadedParts={highlightPart}
          equalParts={equalParts}
          showLabels={!!label}
          labels={label ? [label] : undefined}
          size={160}
        />
      ) : (
        <FractionRectangle
          parts={parts}
          shadedParts={highlightPart}
          equalParts={equalParts}
          orientation="horizontal"
          showLabels={!!label}
          labels={label ? [label] : undefined}
          width={180}
          height={100}
        />
      )}
    </div>
  );
}

// -- Recap Checklist ----------------------------------------------------------

interface RecapChecklistProps {
  items: string[];
}

export function RecapChecklist({ items }: RecapChecklistProps) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5 space-y-3">
      <p className="text-sm font-bold text-slate-700 text-center">What you learned today</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="text-sm font-medium text-emerald-800">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Reward Animation ---------------------------------------------------------

interface RewardAnimationProps {
  rewardText?: string;
  badgeName?: string;
  xpAmount?: number;
}

export function RewardAnimation({ rewardText, badgeName, xpAmount }: RewardAnimationProps) {
  return (
    <div className="mt-4 text-center space-y-3 py-4">
      <div className="text-4xl">🏆</div>
      {badgeName && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
          <span className="text-lg">⭐</span>
          <span className="text-sm font-bold text-amber-700">{badgeName}</span>
        </div>
      )}
      {rewardText && (
        <p className="text-base font-bold text-slate-800">{rewardText}</p>
      )}
      {xpAmount && xpAmount > 0 && (
        <p className="text-sm text-amber-600 font-semibold">+{xpAmount} XP earned!</p>
      )}
    </div>
  );
}
