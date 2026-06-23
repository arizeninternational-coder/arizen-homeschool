"use client";

import React from "react";
import { FractionCircle, FractionRectangle } from "./FractionVisuals";
import { StepReveal } from "./StepReveal";
import { ChoiceGrid } from "./ChoiceGrid";
import {
  TapContinue,
  TapChoice,
  MultipleChoice,
  ReflectionChips,
} from "./InteractionRenderers";
import { MediaSpecVideo } from "./MediaSpecVideo";
import {
  TapRegion,
  ShadeShape,
  MultiActivity,
  RealLifeFraction,
  RecapChecklist,
  RewardAnimation,
} from "./AdvancedRenderers";

// -- Extended Journey Step Type -----------------------------------------------

export interface ExtendedJourneyStep {
  id: string;
  stepType: string;
  title: string;
  studentText?: string;
  owlText?: string;
  mathDisplay?: string;
  visualType?: string;
  illustrationPrompt?: string;
  interaction?: {
    type?: string;
    question?: string;
    prompt?: string;
    options?: string[];
    correctAnswer?: number | string;
    correctIndex?: number;
    hint?: string;
    parentInstructions?: string;
  };
  reflectionOptions?: string[];
  materials?: string[];
  video?: any;
  media?: any;
  estimatedMinutes?: number;

  stepKey?: string;
  activityType?: string;
  studentInstruction?: string;
  content?: string;
  mediaSpec?: {
    type?: string;
    provider?: string;
    url?: string;
    title?: string;
    altText?: string;
    purpose?: string;
    placement?: string;
    startTime?: number;
    endTime?: number;
    reviewStatus?: string;
    suggestedVideoSearch?: string;
    source?: string;
    name?: string;
  };
  visualSpec?: {
    type?: string;
    parts?: number;
    shadedParts?: number;
    equalParts?: boolean;
    showLabels?: boolean;
    labels?: string[];
    orientation?: string;
    object?: string;
    highlightPart?: number;
    label?: string;
    items?: string[];
    steps?: Array<{
      title: string;
      description?: string;
      visual?: any;
    }>;
    choices?: Array<{
      id: string;
      label: string;
      description?: string;
      visual?: any;
    }>;
    icon?: string;
    sentenceStarter?: string;
  };
  interactionSpec?: {
    type?: string;
    prompt?: string;
    question?: string;
    options?: string[];
    correctChoiceId?: string;
    correctIndex?: number;
    choices?: string[];
    correctAnswer?: number | string;
    hint?: string;
    chips?: string[];
    sentenceStarter?: string;
    targetVisualId?: string;
    correctRegion?: string;
    draggables?: any[];
    targets?: any[];
    correctMatches?: any[];
    items?: any[];
    buckets?: any[];
    correctPlacements?: any[];
    shape?: any;
    requiredShadedParts?: number;
    activities?: Array<{
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
    }>;
  };
  feedbackSpec?: {
    correct?: string;
    incorrect?: string;
    hint?: string;
  };
  successCriteria?: string;
  rewardText?: string;
}

// -- Props --------------------------------------------------------------------

interface InteractiveStepRendererProps {
  step: ExtendedJourneyStep;
  stepNumber: number;
  totalSteps: number;
  interaction: any;
  setInteraction: (v: any) => void;
  onNext: () => void;
  className?: string;
}

// -- Visual Spec Interpreter (renders data objects as React components) -------

function renderVisualElement(visual: any): React.ReactNode {
  if (!visual || typeof visual !== "object") return null;

  if (visual.type === "fraction_circle") {
    return (
      <FractionCircle
        parts={visual.parts || 1}
        shadedParts={visual.shadedParts || 0}
        equalParts={visual.equalParts !== false}
        showLabels={visual.showLabels !== false}
        labels={visual.labels}
        size={120}
      />
    );
  }

  if (visual.type === "fraction_rectangle") {
    return (
      <FractionRectangle
        parts={visual.parts || 1}
        shadedParts={visual.shadedParts || 0}
        equalParts={visual.equalParts !== false}
        orientation={(visual.orientation as "horizontal" | "vertical") || "vertical"}
        showLabels={visual.showLabels !== false}
        labels={visual.labels}
        width={140}
        height={90}
      />
    );
  }

  return null;
}

// -- Main Renderer ------------------------------------------------------------

export function InteractiveStepRenderer({
  step,
  stepNumber,
  totalSteps,
  interaction,
  setInteraction,
  onNext,
  className = "",
}: InteractiveStepRendererProps) {
  const hasNewSpec = !!(step.visualSpec || step.interactionSpec || step.feedbackSpec || step.mediaSpec);

  // -- Render visual spec ----------------------------------------------------

  const renderVisualSpec = () => {
    if (!step.visualSpec) return null;
    const vs = step.visualSpec;

    if (vs.type === "fraction_circle") {
      return (
        <div className="flex justify-center my-4">
          <FractionCircle
            parts={vs.parts || 1}
            shadedParts={vs.shadedParts || 0}
            equalParts={vs.equalParts !== false}
            showLabels={vs.showLabels !== false}
            labels={vs.labels}
            size={180}
          />
        </div>
      );
    }

    if (vs.type === "fraction_rectangle") {
      return (
        <div className="flex justify-center my-4">
          <FractionRectangle
            parts={vs.parts || 1}
            shadedParts={vs.shadedParts || 0}
            equalParts={vs.equalParts !== false}
            orientation={(vs.orientation as "horizontal" | "vertical") || "vertical"}
            showLabels={vs.showLabels !== false}
            labels={vs.labels}
            width={200}
            height={140}
          />
        </div>
      );
    }

    if (vs.type === "step_reveal") {
      const revealSteps = (vs.steps || []).map((s) => ({
        title: s.title,
        description: s.description,
        visual: renderVisualElement(s.visual),
      }));
      return (
        <StepReveal
          steps={revealSteps}
          onComplete={onNext}
        />
      );
    }

    if (vs.type === "choice_grid") {
      const choices = (vs.choices || []).map((c) => ({
        id: c.id,
        label: c.label,
        description: c.description,
        visual: renderVisualElement(c.visual),
      }));
      return (
        <ChoiceGrid
          options={choices}
          onSelect={(choiceId) => {
            setInteraction((p: any) => ({ ...p, selectedChoiceId: choiceId }));
          }}
          selectedId={interaction.selectedChoiceId}
          columns={Math.min(choices.length, 3)}
        />
      );
    }

    if (vs.type === "real_life_fraction") {
      return (
        <RealLifeFraction
          object={vs.object || "shape"}
          parts={vs.parts || 2}
          equalParts={vs.equalParts !== false}
          highlightPart={vs.highlightPart || 1}
          label={vs.label}
        />
      );
    }

    if (vs.type === "checklist" || vs.type === "recap_checklist") {
      return <RecapChecklist items={vs.items || []} />;
    }

    if (vs.type === "reflection_card") {
      return (
        <div className="flex flex-col items-center gap-2 my-4">
          {vs.sentenceStarter && (
            <p className="text-sm text-slate-500 italic">{vs.sentenceStarter}</p>
          )}
        </div>
      );
    }

    if (vs.type === "reward_animation") {
      return null; // Rendered separately after interactionSpec
    }

    if (vs.type === "practice_set") {
      return null; // Handled by multi_activity interaction
    }

    return null;
  };

  // -- Render interaction spec -----------------------------------------------

  const renderInteractionSpec = () => {
    if (!step.interactionSpec) return null;
    const spec = step.interactionSpec;
    const feedback = step.feedbackSpec || {};

    if (spec.type === "tap_continue") {
      return (
        <TapContinue
          prompt={spec.prompt}
          onContinue={onNext}
          feedback={feedback}
        />
      );
    }

    if (spec.type === "tap_choice") {
      const choices = spec.choices || spec.options || [];
      return (
        <TapChoice
          prompt={spec.prompt || spec.question}
          options={choices.map((c: any, i: number) => ({
            id: typeof c === "string" ? String(i) : c.id || String(i),
            label: typeof c === "string" ? String.fromCharCode(65 + i) : c.label || String.fromCharCode(65 + i),
            description: typeof c === "string" ? c : c.description,
            visual: typeof c === "object" ? renderVisualElement(c.visual) : undefined,
          }))}
          correctChoiceId={spec.correctChoiceId}
          onSelect={(choiceId) => {
            setInteraction((p: any) => ({
              ...p,
              selectedChoiceId: choiceId,
              choiceSubmitted: true,
            }));
          }}
          feedback={feedback}
          disabled={interaction.choiceSubmitted}
        />
      );
    }

    if (spec.type === "multiple_choice") {
      const options = spec.options || spec.choices || [];
      const correctIdx = spec.correctIndex != null ? spec.correctIndex : (typeof spec.correctAnswer === "number" ? spec.correctAnswer : 0);
      return (
        <MultipleChoice
          question={spec.question || spec.prompt || ""}
          options={options}
          correctIndex={correctIdx}
          feedback={feedback}
          onAnswer={(correct, selectedIdx) => {
            setInteraction((p: any) => ({
              ...p,
              selectedChoice: selectedIdx,
              choiceFeedback: correct ? "correct" : "incorrect",
            }));
          }}
        />
      );
    }

    if (spec.type === "reflection_chips") {
      return (
        <ReflectionChips
          prompt={spec.prompt}
          chips={spec.chips || step.reflectionOptions || []}
          sentenceStarter={spec.sentenceStarter}
          onSave={(selectedChips, text) => {
            setInteraction((p: any) => ({
              ...p,
              reflectionChips: selectedChips,
              reflectionText: text,
              reflectionSaved: true,
            }));
          }}
        />
      );
    }

    if (spec.type === "tap_region") {
      return (
        <TapRegion
          visualSpec={step.visualSpec || { type: "fraction_circle", parts: 2, equalParts: true }}
          correctRegion={spec.correctRegion || "part_1"}
          prompt={spec.prompt}
          feedback={feedback}
          onAnswer={(correct) => {
            setInteraction((p: any) => ({
              ...p,
              tapRegionSubmitted: true,
              tapRegionCorrect: correct,
            }));
          }}
        />
      );
    }

    if (spec.type === "shade_shape") {
      return (
        <ShadeShape
          shape={spec.shape || { type: "fraction_circle", parts: 2, equalParts: true }}
          requiredShadedParts={spec.requiredShadedParts || 1}
          prompt={spec.prompt}
          feedback={feedback}
          onAnswer={(correct) => {
            setInteraction((p: any) => ({
              ...p,
              shadeSubmitted: true,
              shadeCorrect: correct,
            }));
          }}
        />
      );
    }

    if (spec.type === "multi_activity") {
      return (
        <MultiActivity
          activities={spec.activities || []}
          feedback={feedback}
          onComplete={() => {
            setInteraction((p: any) => ({ ...p, multiActivityComplete: true }));
          }}
        />
      );
    }

    if (spec.type === "step_reveal") {
      // step_reveal interaction is handled by the visual spec renderer
      // but we show feedback at the end
      return (
        <div className="mt-3">
          {feedback.hint && (
            <p className="text-xs text-amber-600 font-semibold text-center">
              💡 {feedback.hint}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  // -- Render reward (after interaction) -------------------------------------

  const renderReward = () => {
    if (step.visualSpec?.type === "reward_animation" || step.rewardText) {
      return (
        <RewardAnimation
          rewardText={step.rewardText}
          badgeName={step.mediaSpec?.name}
        />
      );
    }
    return null;
  };

  // -- Render media spec video ------------------------------------------------

  const renderMediaSpecVideo = () => {
    if (!step.mediaSpec || step.mediaSpec.type !== "video") return null;
    return (
      <MediaSpecVideo
        mediaSpec={step.mediaSpec}
        fallbackVideo={step.media?.video || step.video}
      />
    );
  };

  // -- Main render ------------------------------------------------------------

  if (hasNewSpec) {
    return (
      <div className={`space-y-4 ${className}`}>
        {(step.studentInstruction || step.content) && (
          <div className="prose prose-sm max-w-none">
            {(step.studentInstruction || step.content || "")
              .split("\n")
              .filter((line) => line.trim())
              .map((line, i) => (
                <p key={i} className="text-slate-700 leading-relaxed mb-2 last:mb-0">
                  {line}
                </p>
              ))}
          </div>
        )}

        {renderVisualSpec()}
        {renderMediaSpecVideo()}
        {renderInteractionSpec()}
        {renderReward()}

        {!step.interactionSpec && step.interaction && (
          <LegacyInteractionRenderer
            step={step}
            interaction={interaction}
            setInteraction={setInteraction}
            onNext={onNext}
          />
        )}

        {step.successCriteria && process.env.NODE_ENV === "development" && (
          <details className="text-[10px] text-slate-400 mt-2">
            <summary>Success criteria</summary>
            <p className="mt-1">{step.successCriteria}</p>
          </details>
        )}
      </div>
    );
  }

  // -- Legacy rendering fallback ----------------------------------------------

  return (
    <div className={`space-y-4 ${className}`}>
      {step.studentText && (
        <div className="prose prose-sm max-w-none">
          {step.studentText.split("\n").filter((l) => l.trim()).map((line, i) => (
            <p key={i} className="text-slate-700 leading-relaxed mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </div>
      )}

      {step.mathDisplay && (
        <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-lg font-mono font-bold text-slate-800">
            {step.mathDisplay}
          </span>
        </div>
      )}

      {step.media?.illustration?.approvedUrl && (
        <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm">
          <img
            src={step.media.illustration.approvedUrl}
            alt={step.media.illustration.altText || "Lesson illustration"}
            className="w-full h-auto max-h-[220px] object-cover"
          />
        </div>
      )}

      {step.media?.video?.approvedUrl && (
        <MediaSpecVideo fallbackVideo={step.media.video} />
      )}

      <LegacyInteractionRenderer
        step={step}
        interaction={interaction}
        setInteraction={setInteraction}
        onNext={onNext}
      />
    </div>
  );
}

// -- Legacy Interaction Renderer ----------------------------------------------

function LegacyInteractionRenderer({
  step,
  interaction,
  setInteraction,
  onNext,
}: {
  step: ExtendedJourneyStep;
  interaction: any;
  setInteraction: (v: any) => void;
  onNext: () => void;
}) {
  if (!step.interaction && step.stepType !== "reflect") return null;

  if (step.stepType === "think_first" && step.interaction?.question) {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-amber-50/80 border border-amber-200/60">
        <p className="text-base font-bold text-amber-900 mb-2">
          💭 {step.interaction.question}
        </p>
        <textarea
          value={interaction.predictionText || ""}
          onChange={(e) =>
            setInteraction((p: any) => ({ ...p, predictionText: e.target.value }))
          }
          placeholder="Type your guess here..."
          className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-base text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
          rows={3}
        />
        {interaction.predictionText?.trim() && (
          <p className="text-xs text-amber-600 mt-1.5 font-semibold">
            ✓ Your guess is saved!
          </p>
        )}
      </div>
    );
  }

  if (step.stepType === "practice") {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-sky-50/80 border border-sky-200/60">
        {step.studentText && step.studentText !== "Practice" ? (
          <div
            className="prose prose-sm max-w-none text-sky-900 mb-3"
            dangerouslySetInnerHTML={{
              __html: step.studentText.replace(/\n/g, "<br/>"),
            }}
          />
        ) : (
          <p className="text-base font-bold text-sky-900 mb-1.5">✏️ Your Turn</p>
        )}
      </div>
    );
  }

  if (
    step.stepType === "quick_check" &&
    step.interaction?.type === "multiple_choice" &&
    step.interaction.question
  ) {
    const correctAnswer = step.interaction.correctAnswer;
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-lime-50/80 border border-lime-200/60">
        <p className="text-base font-bold text-lime-900 mb-0.5">✅ Quick Check</p>
        <p className="text-lg font-bold text-lime-800 mb-3">
          {step.interaction.question}
        </p>
        {step.interaction.options?.map((opt: string, i: number) => {
          const isSelected = interaction.selectedChoice === i;
          const isCorrect = i === correctAnswer;
          const showFeedback = interaction.choiceFeedback !== null;
          let btnClass =
            "bg-white border-lime-200 text-lime-800 hover:bg-lime-50 hover:shadow-md";
          if (isSelected && !showFeedback)
            btnClass = "bg-lime-600 text-white border-lime-600 shadow-lg shadow-lime-200";
          if (showFeedback && isSelected && isCorrect)
            btnClass = "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200";
          if (showFeedback && isSelected && !isCorrect)
            btnClass = "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200";
          if (showFeedback && !isSelected && isCorrect)
            btnClass = "bg-emerald-100 border-emerald-400 text-emerald-800";
          return (
            <button
              key={i}
              onClick={() => {
                if (interaction.choiceFeedback !== null) return;
                setInteraction((p: any) => ({
                  ...p,
                  selectedChoice: i,
                  choiceFeedback: i === correctAnswer ? "correct" : "incorrect",
                }));
              }}
              disabled={interaction.choiceFeedback !== null}
              className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${btnClass} disabled:cursor-default mb-2 w-full`}
            >
              <span className="mr-2 text-base">{String.fromCharCode(65 + i)}.</span> {opt}
            </button>
          );
        })}
        {interaction.choiceFeedback === "correct" && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-emerald-100 border border-emerald-300">
            <p className="text-sm font-bold text-emerald-800">✅ Correct! Well done!</p>
          </div>
        )}
        {interaction.choiceFeedback === "incorrect" && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-orange-100 border border-orange-300">
            <p className="text-sm font-bold text-orange-800">
              Not quite. {step.interaction.hint || "Think about it again!"}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (
    step.stepType === "quick_check" &&
    step.interaction?.type === "self_check" &&
    step.interaction.question
  ) {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-lime-50/80 border border-lime-200/60">
        <p className="text-base font-bold text-lime-900 mb-0.5">✅ Check yourself:</p>
        <p className="text-lg font-bold text-lime-800 mb-3">
          {step.interaction.question}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setInteraction((p: any) => ({ ...p, selfChecked: true }))}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
              interaction.selfChecked === true
                ? "bg-emerald-600 text-white border-emerald-600 shadow-lg"
                : "bg-white border-lime-200 text-lime-700 hover:bg-lime-50"
            }`}
          >
            ✓ Yes, I got it!
          </button>
          <button
            onClick={() => setInteraction((p: any) => ({ ...p, selfChecked: false }))}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
              interaction.selfChecked === false
                ? "bg-orange-500 text-white border-orange-500 shadow-lg"
                : "bg-white border-orange-200 text-orange-600 hover:bg-orange-50"
            }`}
          >
            ↺ I need more practice
          </button>
        </div>
      </div>
    );
  }

  if (step.stepType === "reflect") {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-rose-50/80 border border-rose-200/60">
        <p className="text-base font-bold text-rose-900 mb-0.5">🪞 Reflection Time</p>
        <p className="text-lg font-bold text-rose-800 mb-3">
          {step.interaction?.question || "What did you learn today?"}
        </p>
        <textarea
          value={interaction.reflectionText || ""}
          onChange={(e) =>
            setInteraction((p: any) => ({ ...p, reflectionText: e.target.value }))
          }
          placeholder="Write your reflection..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>
    );
  }

  return null;
}
