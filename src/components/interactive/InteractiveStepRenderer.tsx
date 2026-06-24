"use client";

import React from "react";
import { FractionCircle, FractionRectangle } from "./FractionVisuals";
import { StepReveal } from "./StepReveal";
import { ChoiceGrid } from "./ChoiceGrid";
import { HorizontalTeachingStrip } from "./HorizontalTeachingStrip";
import { TapContinue, TapChoice, MultipleChoice, ReflectionChips } from "./InteractionRenderers";
import { MediaSpecVideo } from "./MediaSpecVideo";
import {
  TapRegion,
  ShadeShape,
  MultiActivity,
  RealLifeFraction,
  RecapChecklist,
  RewardAnimation,
} from "./AdvancedRenderers";
import type { CircleTheme } from "./FractionVisuals";

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
    theme?: CircleTheme;
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
    buttonLabel?: string;
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
    theme?: CircleTheme;
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

function renderVisualElement(visual: any, theme?: CircleTheme): React.ReactNode {
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
        theme={theme}
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
  const theme = (step.visualSpec?.theme || step.interactionSpec?.theme || "plain") as CircleTheme;

  // -- Pre-action states for post-tap feedback -------------------------------

  const [missionAccepted, setMissionAccepted] = React.useState(false);

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
            theme={theme}
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
        visual: renderVisualElement(s.visual, theme),
      }));
      // Teaching steps use horizontal layout instead of carousel
      if (step.stepKey === "learn" || step.stepKey === "example") {
        return <HorizontalTeachingStrip steps={revealSteps} theme={theme} />;
      }
      return (
        <StepReveal
          steps={revealSteps}
          onComplete={onNext}
          mode="carousel"
        />
      );
    }

    if (vs.type === "choice_grid") {
      const choices = (vs.choices || []).map((c) => ({
        id: c.id,
        label: c.label,
        description: c.description,
        visual: renderVisualElement(c.visual, theme),
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
      // TapRegion renders its own interactive visual
      if (step.interactionSpec?.type === "tap_region") return null;
      return (
        <RealLifeFraction
          object={vs.object || "shape"}
          parts={vs.parts || 2}
          equalParts={vs.equalParts !== false}
          highlightPart={vs.highlightPart || 1}
          label={vs.label}
          theme={theme}
        />
      );
    }

    if (vs.type === "checklist") {
      if (step.stepKey === "mission" && !missionAccepted) {
        return (
          <div className="mt-4 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5 space-y-3">
            <div className="space-y-2">
              {(vs.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/60 border border-slate-100">
                  <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return <RecapChecklist items={vs.items || []} heading={step.title} variant="bullet" />;
    }

    if (vs.type === "recap_checklist") {
      return <RecapChecklist items={vs.items || []} heading="You can now:" variant="check" />;
    }

    if (vs.type === "reflection_card") {
      return null; // Rendered by reflection_chips interactionSpec
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

    // When choice_grid visual is present, tap_choice is handled by ChoiceGrid
    if (spec.type === "tap_choice" && step.visualSpec?.type === "choice_grid") {
      return (
        <div className="mt-3">
          {feedback.correct && interaction.choiceSubmitted && (
            <p className="text-sm font-semibold text-emerald-600 text-center">{feedback.correct}</p>
          )}
          {feedback.incorrect && interaction.choiceSubmitted && !interaction.choiceCorrect && (
            <p className="text-sm font-semibold text-orange-600 text-center">{feedback.incorrect}</p>
          )}
        </div>
      );
    }

    if (spec.type === "tap_continue") {
      const isMission = step.stepKey === "mission";
      return (
        <TapContinue
          prompt={isMission ? undefined : spec.prompt}
          onContinue={() => {
            if (isMission) setMissionAccepted(true);
            onNext();
          }}
          feedback={feedback}
          buttonLabel={spec.buttonLabel}
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
          onAnswer={(correct: boolean, selectedIdx: number) => {
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
          onSave={(selectedChips: string[], text: string) => {
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
          visualSpec={step.visualSpec || { type: "fraction_circle", parts: 2, equalParts: true, theme }}
          correctRegion={spec.correctRegion || "part_1"}
          prompt={spec.prompt}
          feedback={feedback}
          onAnswer={(correct: boolean) => {
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
          shape={spec.shape || { type: "fraction_circle", parts: 2, equalParts: true, theme }}
          requiredShadedParts={spec.requiredShadedParts || 1}
          prompt={spec.prompt}
          feedback={feedback}
          onAnswer={(correct: boolean) => {
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
      // Practice step: simplified single-panel shade interaction
      if (step.stepKey === "practice") {
        const shadeActivity = (spec.activities || []).find((a: any) => a.type === "shade_shape");
        if (shadeActivity) {
          return (
            <PracticeShadePanel
              activity={shadeActivity}
              feedback={feedback}
              onAnswer={(correct: boolean) => {
                setInteraction((p: any) => ({ ...p, shadeSubmitted: true, shadeCorrect: correct }));
              }}
            />
          );
        }
      }
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
      // Teaching steps have no interaction; show a "Got it" at end of visual
      return null;
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
    if (step.mediaSpec.reviewStatus === "needs_review") return null;
    return (
      <MediaSpecVideo
        mediaSpec={step.mediaSpec}
        fallbackVideo={step.media?.video || step.video}
      />
    );
  };

  // -- Mission accepted confirmation -----------------------------------------

  const renderMissionConfirmation = () => {
    if (step.stepKey === "mission" && missionAccepted && step.feedbackSpec?.correct) {
      return (
        <p className="text-sm font-semibold text-emerald-600 text-center mt-2 animate-fade-in">
          {step.feedbackSpec.correct}
        </p>
      );
    }
    return null;
  };

  // -- Main render ------------------------------------------------------------

  if (hasNewSpec) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Instruction text — shown before action buttons */}
        {(() => {
          const instruction = step.studentInstruction || step.content || "";
          const prompt = step.interactionSpec?.prompt || "";
          const showInstruction = instruction.trim() && instruction.trim() !== prompt.trim();
          return showInstruction ? (
            <div className="prose prose-sm max-w-none">
              {instruction.split("\n").filter((l) => l.trim()).map((line, i) => (
                <p key={i} className="text-slate-700 leading-relaxed mb-2 last:mb-0">{line}</p>
              ))}
            </div>
          ) : null;
        })()}

        {renderVisualSpec()}
        {renderMediaSpecVideo()}
        {renderInteractionSpec()}
        {renderMissionConfirmation()}
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

      {renderMediaSpecVideo()}

      {step.interaction && (
        <LegacyInteractionRenderer
          step={step}
          interaction={interaction}
          setInteraction={setInteraction}
          onNext={onNext}
        />
      )}

      {step.reflectionOptions && step.interaction?.type === "reflection" && (
        <ReflectionChips
          prompt={step.reflectionOptions.join(" • ")}
          chips={step.reflectionOptions}
        />
      )}

      {renderReward()}

      {step.successCriteria && process.env.NODE_ENV === "development" && (
        <details className="text-[10px] text-slate-400 mt-2">
          <summary>Success criteria</summary>
          <p className="mt-1">{step.successCriteria}</p>
        </details>
      )}
    </div>
  );
}

// -- Practice Shade Panel (improved shading interaction) ---------------------

interface PracticeShadePanelProps {
  activity: any;
  feedback?: { correct?: string; incorrect?: string; hint?: string };
  onAnswer?: (correct: boolean) => void;
  theme?: CircleTheme;
}

function PracticeShadePanel({ activity, feedback, onAnswer, theme }: PracticeShadePanelProps) {
  const [shadedParts, setShadedParts] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const required = activity.requiredShadedParts || 1;
  const isCorrect = shadedParts === required && shadedParts > 0;

  const handlePartClick = (partIndex: number) => {
    if (submitted) return;
    setShadedParts(partIndex + 1 === shadedParts ? 0 : partIndex + 1);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onAnswer?.(isCorrect);
  };

  return (
    <div className="space-y-4">
      <p className="text-base font-bold text-slate-800 text-center">
        {activity.prompt || "Shade one half of the circle"}
      </p>
      <div className="flex justify-center">
        <FractionCircle
          parts={2}
          shadedParts={shadedParts}
          equalParts={true}
          showLabels={false}
          size={170}
          interactive
          onClickPart={handlePartClick}
          theme={theme === "plain" ? "paper_cutout" : theme}
        />
      </div>
      <p className="text-xs text-slate-500 text-center">
        Tap inside one half to shade it, tap again to erase.
      </p>
      {!submitted && shadedParts > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
          >
            Check my shading
          </button>
        </div>
      )}
      {submitted && feedback && (
        <div className="text-center">
          {isCorrect ? (
            <p className="text-sm font-bold text-emerald-600">{feedback.correct || "Well done! You shaded one half."}</p>
          ) : (
            <p className="text-sm font-bold text-orange-600">
              {feedback.incorrect || "Try again. Remember: shade exactly one of the two equal parts."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// -- Legacy interaction renderer (fallback) ---------------------------------

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
  const type = step.interaction?.type;

  if (type === "tap_continue") {
    return (
      <TapContinue
        prompt={step.interaction?.prompt}
        onContinue={onNext}
        buttonLabel={(step.interaction as any)?.buttonLabel || step.interaction?.prompt}
      />
    );
  }

  if (type === "choice") {
    const options = step.interaction?.options || [];
    const correctIdx = typeof step.interaction?.correctAnswer === "number" ? step.interaction.correctAnswer : 0;
    return (
      <ChoiceGrid
        options={options.map((opt: string, i: number) => ({
          id: String(i),
          label: String.fromCharCode(65 + i),
          description: opt,
        }))}
        onSelect={(id) => setInteraction((p: any) => ({ ...p, selectedChoice: parseInt(id) }))}
        selectedId={interaction.selectedChoice != null ? String(interaction.selectedChoice) : undefined}
        columns={Math.min(options.length, 3)}
      />
    );
  }

  if (type === "multiple_choice") {
    const options = step.interaction?.options || [];
    const correctIdx = step.interaction?.correctIndex != null ? step.interaction.correctIndex : (typeof step.interaction?.correctAnswer === "number" ? step.interaction.correctAnswer : 0);
    return (
      <MultipleChoice
        question={step.interaction?.question || ""}
        options={options}
        correctIndex={correctIdx}
        onAnswer={(correct: boolean, idx: number) => {
          setInteraction((p: any) => ({ ...p, selectedChoice: idx, choiceFeedback: correct ? "correct" : "incorrect" }));
        }}
      />
    );
  }

  return null;
}