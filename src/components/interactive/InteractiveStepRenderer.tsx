"use client";

import React from "react";
import { FractionCircle, FractionRectangle } from "./FractionVisuals";
import { StepReveal } from "./StepReveal";
import OwlTeacher from "@/components/ui/OwlTeacher";
import { ChoiceGrid } from "./ChoiceGrid";
import { HorizontalTeachingStrip } from "./HorizontalTeachingStrip";
import { TapContinue, TapChoice, MultipleChoice, ReflectionChips } from "./InteractionRenderers";
import { MediaSpecVideo } from "./MediaSpecVideo";
import { CelebrationBurst, ConfettiCelebration, SparkleGlow } from "./CelebrationAnimations";
import ChapatiSharingIllustration from "@/components/ChapatiSharingIllustration";
import { Upload, Sparkles } from "lucide-react";
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
  storyIntro?: string;
  mathDisplay?: string;
  visualType?: string;
  illustrationPrompt?: string;
  interaction?: any;
  reflectionOptions?: string[];
  materials?: string[];
  video?: any;
  media?: any;
  estimatedMinutes?: number;
  childImageGen?: {
    enabled: boolean;
    maxTries: number;
    prompt: string;
  };
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
    illustration?: {
      mode?: "none" | "uploaded" | "generated" | "static";
      prompt?: string;
      approvedUrl?: string;
      generatedUrl?: string;
      uploadedUrl?: string;
      candidateUrls?: string[];
      reviewStatus?: string;
      alt?: string;
      caption?: string;
      source?: "generated" | "uploaded" | "static" | "fallback";
      status?: "none" | "generating" | "generated" | "approved" | "rejected" | "failed";
      uploadedAt?: string;
      approvedAt?: string;
      generatedAt?: string;
    };
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
    steps?: Array<{ title: string; description?: string; visual?: any }>;
    choices?: Array<{ id: string; label: string; description?: string; visual?: any }>;
    icon?: string;
    sentenceStarter?: string;
    theme?: CircleTheme;
  };
  interactionSpec?: any;
  feedbackSpec?: { correct?: string; incorrect?: string; hint?: string };
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
  showChrome?: boolean;
  isAdmin?: boolean;
  onUpload?: (stepIndex: number, file: File) => void;
  onGenerateAI?: (stepIndex: number, prompt?: string) => void;
  generating?: boolean;
}

// -- Visual Spec Interpreter --------------------------------------------------

function renderVisualElement(visual: any, theme?: CircleTheme): React.ReactNode {
  if (!visual || typeof visual !== "object") return null;
  if (visual.type === "fraction_circle") {
    return <FractionCircle parts={visual.parts || 1} shadedParts={visual.shadedParts || 0} equalParts={visual.equalParts !== false} showLabels={visual.showLabels !== false} labels={visual.labels} size={120} theme={theme} />;
  }
  if (visual.type === "fraction_rectangle") {
    return <FractionRectangle parts={visual.parts || 1} shadedParts={visual.shadedParts || 0} equalParts={visual.equalParts !== false} orientation={(visual.orientation as any) || "vertical"} showLabels={visual.showLabels !== false} labels={visual.labels} width={140} height={90} />;
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
  showChrome = false,
  isAdmin = false,
  onUpload,
  onGenerateAI,
  generating = false,
}: InteractiveStepRendererProps) {
  const hasNewSpec = !!(step.visualSpec || step.interactionSpec || step.feedbackSpec || step.mediaSpec || (step.interaction && (step.interaction.options || step.interaction.question || step.interaction.type)));
  const theme = (step.visualSpec?.theme || step.interactionSpec?.theme || "plain") as CircleTheme;

  const [missionAccepted, setMissionAccepted] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showBurst, setShowBurst] = React.useState(false);
  const [genTries, setGenTries] = React.useState(0);

  const genConfig = step.childImageGen;
  const canGenerateImage = genConfig?.enabled && genTries < genConfig.maxTries;

  const handleCorrectAnswer = () => {
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 800);
  };

  const handleLessonComplete = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // -- Illustration rendering ------------------------------------------------

  const renderIllustration = () => {
    const illo = step.mediaSpec?.illustration;
    if (!illo || illo.mode === "none") return null;

    // Priority 1: Approved image
    if (illo.approvedUrl) {
      return (
        <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm bg-white">
          <img src={illo.approvedUrl} alt={illo.alt || step.title} className="w-full h-auto max-h-[240px] object-contain" />
          {illo.caption && <p className="text-xs text-slate-500 text-center py-2 bg-slate-50 border-t border-slate-100">{illo.caption}</p>}
        </div>
      );
    }

    // Priority 2: Generated candidate images
    if (illo.candidateUrls && illo.candidateUrls.length > 0) {
      return (
        <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm bg-white">
          <img src={illo.candidateUrls[0]} alt={illo.alt || step.title} className="w-full h-auto max-h-[240px] object-contain" />
          {illo.caption && <p className="text-xs text-slate-500 text-center py-2 bg-slate-50 border-t border-slate-100">{illo.caption}</p>}
        </div>
      );
    }

    // Priority 3: Clean placeholder
    const themedBg = theme === "chapati" ? "from-amber-50 to-orange-50" : "from-indigo-50 to-purple-50";
    return (
      <div className={`rounded-2xl border border-slate-200/60 bg-gradient-to-br ${themedBg} p-3 flex flex-col items-center gap-2 min-h-[120px] justify-center`}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-slate-400">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
          <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-[10px] text-slate-500 text-center leading-snug">
          {illo.caption || "Image coming soon"}
        </p>
      </div>
    );
  };

  // -- Visual spec ------------------------------------------------------------

  const renderVisualSpec = () => {
    if (!step.visualSpec) return null;
    const vs = step.visualSpec;

    if (vs.type === "welcome_story") {
      // Clean welcome illustration: a single warm image/placeholder, no heavy concept cards
      const illo = step.mediaSpec?.illustration;
      if (illo?.approvedUrl) {
        return (
          <div className="flex justify-center my-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm max-w-sm bg-white">
              <img src={illo.approvedUrl} alt={illo.alt || step.title} className="w-full h-auto max-h-[260px] object-contain" />
              {illo.caption && <p className="text-xs text-slate-500 text-center py-2 bg-slate-50 border-t border-slate-100">{illo.caption}</p>}
            </div>
          </div>
        );
      }
      // Polished student-facing placeholder (no admin controls here)
      const theme = (step.visualSpec?.theme || "plain") as CircleTheme;
      const themeBg = theme === "chapati" ? "from-amber-50 to-orange-50" : theme === "orange" ? "from-orange-50 to-amber-50" : "from-indigo-50 to-purple-50";
      return (
        <div className="flex justify-center my-4">
          <div className={`rounded-2xl border border-slate-200/60 bg-gradient-to-br ${themeBg} p-6 flex flex-col items-center gap-3 max-w-sm w-full`}>
            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-xs text-slate-500 text-center font-medium leading-relaxed">
              Image coming soon: Amina and her brother sharing a chapati
            </p>
          </div>
        </div>
      );
    }

    if (vs.type === "welcome_panel") {
      // Legacy 4-panel welcome (deprecated — kept for backward compat with other lessons)
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Whole</span>
            <FractionCircle parts={1} shadedParts={0} equalParts={true} showLabels={false} size={80} theme={theme} />
            <span className="text-xs text-slate-600 font-medium">One whole chapati</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Two equal parts</span>
            <FractionCircle parts={2} shadedParts={0} equalParts={true} showLabels={true} labels={["1/2", "1/2"]} size={80} theme={theme} />
            <span className="text-xs text-slate-600 font-medium">Split in half</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/60">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">One half</span>
            <FractionCircle parts={2} shadedParts={1} equalParts={true} showLabels={true} labels={["1/2", ""]} size={80} theme={theme} />
            <span className="text-xs text-slate-600 font-medium">Shade one part</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Not halves</span>
            <FractionCircle parts={2} shadedParts={1} equalParts={false} showLabels={false} size={80} theme="plain" />
            <span className="text-xs text-slate-600 font-medium">Unequal pieces</span>
          </div>
        </div>
      );
    }

    if (vs.type === "fraction_circle") {
      return (
        <div className="flex justify-center my-4">
          <FractionCircle parts={vs.parts || 1} shadedParts={vs.shadedParts || 0} equalParts={vs.equalParts !== false} showLabels={vs.showLabels !== false} labels={vs.labels} size={180} theme={theme} />
        </div>
      );
    }

    if (vs.type === "fraction_rectangle") {
      return (
        <div className="flex justify-center my-4">
          <FractionRectangle parts={vs.parts || 1} shadedParts={vs.shadedParts || 0} equalParts={vs.equalParts !== false} orientation={(vs.orientation as any) || "vertical"} showLabels={vs.showLabels !== false} labels={vs.labels} width={200} height={140} />
        </div>
      );
    }

    if (vs.type === "step_reveal") {
      const revealSteps = (vs.steps || []).map((s) => ({
        title: s.title,
        description: s.description,
        visual: renderVisualElement(s.visual, theme),
      }));
      if (step.stepKey === "learn" || step.stepKey === "example") {
        return <HorizontalTeachingStrip steps={revealSteps} theme={theme} />;
      }
      return <StepReveal steps={revealSteps} onComplete={onNext} mode="carousel" />;
    }

    if (vs.type === "choice_grid") {
      const choices = (vs.choices || []).map((c) => ({
        id: c.id, label: c.label, description: c.description, visual: renderVisualElement(c.visual, theme),
      }));
      return (
        <ChoiceGrid
          options={choices}
          onSelect={(choiceId) => {
            const isCorrect = choiceId === vs.choices?.find((c: any) => c.id === choiceId)?.id;
            setInteraction((p: any) => ({ ...p, selectedChoiceId: choiceId, choiceCorrect: isCorrect }));
            if (isCorrect) handleCorrectAnswer();
          }}
          selectedId={interaction.selectedChoiceId}
          columns={Math.min(choices.length, 3)}
        />
      );
    }

    if (vs.type === "real_life_fraction") {
      if (step.interactionSpec?.type === "tap_region") return null;
      return <RealLifeFraction object={vs.object || "shape"} parts={vs.parts || 2} equalParts={vs.equalParts !== false} highlightPart={vs.highlightPart || 1} label={vs.label} theme={theme} />;
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

    if (vs.type === "reflection_card") return null;
    if (vs.type === "reward_animation") return null;
    if (vs.type === "practice_set") return null;

    return null;
  };

  // -- Interaction spec -------------------------------------------------------

  const renderInteractionSpec = () => {
    if (!step.interactionSpec) return null;
    const spec = step.interactionSpec;
    const feedback = step.feedbackSpec || {};

    if (spec.type === "tap_choice" && step.visualSpec?.type === "choice_grid") {
      return (
        <div className="mt-3">
          {feedback.correct && interaction.choiceSubmitted && interaction.choiceCorrect && (
            <p className="text-sm font-semibold text-emerald-600 text-center animate-fade-in">{feedback.correct}</p>
          )}
          {feedback.incorrect && interaction.choiceSubmitted && !interaction.choiceCorrect && (
            <p className="text-sm font-semibold text-orange-600 text-center animate-fade-in">{feedback.incorrect}</p>
          )}
        </div>
      );
    }

    if (spec.type === "tap_continue") {
      const isWelcome = step.stepKey === "welcome" || step.stepType === "welcome";
      const isMission = step.stepKey === "mission" || step.stepType === "mission";
      const isComplete = step.stepKey === "complete" || step.stepType === "complete";
      return (
        <TapContinue
          prompt={isWelcome ? undefined : (isMission ? undefined : spec.prompt)}
          onContinue={() => {
            if (isMission) setMissionAccepted(true);
            if (isComplete) handleLessonComplete();
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
          onAnswer={(correct: boolean, idx: number) => {
            setInteraction((p: any) => ({ ...p, selectedChoice: idx, choiceFeedback: correct ? "correct" : "incorrect" }));
            if (correct) handleCorrectAnswer();
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
            setInteraction((p: any) => ({ ...p, reflectionChips: selectedChips, reflectionText: text, reflectionSaved: true }));
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
            setInteraction((p: any) => ({ ...p, tapRegionSubmitted: true, tapRegionCorrect: correct }));
            if (correct) handleCorrectAnswer();
          }}
        />
      );
    }

    if (spec.type === "shade_shape") {
      const isPractice = step.stepKey === "practice";
      return (
        <ShadeShape
          shape={spec.shape || { type: "fraction_circle", parts: 2, equalParts: true, theme }}
          requiredShadedParts={spec.requiredShadedParts || 1}
          prompt={spec.prompt}
          feedback={feedback}
          onAnswer={(correct: boolean) => {
            setInteraction((p: any) => ({ ...p, shadeSubmitted: true, shadeCorrect: correct }));
            if (correct) handleCorrectAnswer();
          }}
          theme={theme}
          isPractice={isPractice}
        />
      );
    }

    if (spec.type === "multi_activity") {
      if (step.stepKey === "practice") {
        const shadeActivity = (spec.activities || []).find((a: any) => a.type === "shade_shape");
        if (shadeActivity) {
          return (
            <PracticeShadePanel
              activity={shadeActivity}
              feedback={feedback}
              onAnswer={(correct: boolean) => {
                setInteraction((p: any) => ({ ...p, shadeSubmitted: true, shadeCorrect: correct }));
                if (correct) handleCorrectAnswer();
              }}
              theme={theme}
            />
          );
        }
      }
      return (
        <MultiActivity
          activities={spec.activities || []}
          feedback={feedback}
          onComplete={() => setInteraction((p: any) => ({ ...p, multiActivityComplete: true }))}
        />
      );
    }

    if (spec.type === "step_reveal") return null;

    return null;
  };

  // -- Mission confirmation ---------------------------------------------------

  const renderMissionConfirmation = () => {
    if (step.stepKey === "mission" && missionAccepted && step.feedbackSpec?.correct) {
      return <p className="text-sm font-semibold text-emerald-600 text-center mt-2 animate-fade-in">{step.feedbackSpec.correct}</p>;
    }
    return null;
  };

  // -- Main render ------------------------------------------------------------

  if (hasNewSpec) {
    return (
      <div className={`space-y-4 ${className}`}>
        <SparkleGlow active={showBurst} />
        <CelebrationBurst active={showBurst} />
        <ConfettiCelebration active={showConfetti} />

        {/* Step chrome: title + step number + owl + instruction — only when showChrome is true */}
        {showChrome ? (
          <React.Fragment>
            {step.title && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-black shadow-sm">
                  {stepNumber}
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">{step.title}</h3>
                <span className="text-xs text-slate-400 font-semibold">Step {stepNumber} of {totalSteps}</span>
              </div>
            )}

            {/* Owl guidance removed per instruction */}

            {/* Student instruction / topic intro for non-Welcome steps */}
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
          </React.Fragment>
        ) : null}

        {/* Welcome intro — grouped owl + story in one card */}
        {(step.stepKey === "welcome" || step.stepType === "welcome") && (
          <div className="rounded-2xl bg-white/80 border border-purple-200/60 shadow-sm p-5 space-y-3">
            {step.owlText && (
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">🦉</span>
                <p className="text-[15px] text-slate-800 leading-relaxed font-semibold">{step.owlText}</p>
              </div>
            )}
            {step.storyIntro && (
              <p className="text-sm text-slate-600 leading-relaxed pl-9">{step.storyIntro}</p>
            )}
          </div>
        )}

        {/* For Welcome step, render only the welcome_story visual (not both illustration + visualSpec) */}
        {step.stepKey === "welcome" || step.stepType === "welcome" ? (
          <WelcomeStepVisual step={step} isAdmin={isAdmin} onUpload={onUpload} onGenerateAI={onGenerateAI} generating={generating} />
        ) : (
          <>
            {renderIllustration()}
            {renderVisualSpec()}
          </>
        )}


        {/* Admin Image Controls removed from student renderer — use admin student-view page for uploads */}

        {/* Video */}
        <MediaSpecVideoRenderer step={step} />

        {/* Interaction */}
        {renderInteractionSpec()}

        {/* Mission confirmation */}
        {renderMissionConfirmation()}

        {/* Reward */}
        {step.visualSpec?.type === "reward_animation" || step.rewardText ? (
          <RewardAnimation rewardText={step.rewardText} badgeName={step.mediaSpec?.name} />
        ) : null}

        {/* Dev debug */}
        {step.successCriteria && process.env.NODE_ENV === "development" && (
          <details className="text-[10px] text-slate-400 mt-2">
            <summary>Success criteria</summary>
            <p className="mt-1">{step.successCriteria}</p>
          </details>
        )}
      </div>
    );
  }

  // -- Legacy fallback --------------------------------------------------------
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Step title */}
      {step.title && (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-black shadow-sm">
            {stepNumber}
          </div>
          <h3 className="text-lg font-extrabold text-slate-800">{step.title}</h3>
        </div>
      )}

      {/* Owl guidance removed per instruction */}

      {/* Student text */}
      {step.studentText && (
        <div className="prose prose-sm max-w-none">
          {step.studentText.split("\n").filter((f: string) => f.trim()).map((line: string, i: number) => (
            <p key={i} className="text-slate-700 leading-relaxed mb-2 last:mb-0">{line}</p>
          ))}
        </div>
      )}

      {step.mathDisplay && (
        <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-lg font-mono font-bold text-slate-800">{step.mathDisplay}</span>
        </div>
      )}

      <MediaSpecVideoRenderer step={step} />

      {step.interaction && <LegacyInteractionRenderer step={step} interaction={interaction} setInteraction={setInteraction} onNext={onNext} />}
      {renderMissionConfirmation()}
      {step.rewardText && <RewardAnimation rewardText={step.rewardText} badgeName={step.mediaSpec?.name} />}
    </div>
  );
}

// -- Media Spec Video (student-safe) ----------------------------------------

function MediaSpecVideoRenderer({ step }: { step: ExtendedJourneyStep }) {
  if (!step.mediaSpec || step.mediaSpec.type !== "video") return null;
  if (step.mediaSpec.reviewStatus === "needs_review") return null;
  return <MediaSpecVideo mediaSpec={step.mediaSpec} fallbackVideo={step.media?.video || step.video} />;
}

// -- Practice Shade Panel ---------------------------------------------------

function PracticeShadePanel({ activity, feedback, onAnswer, theme }: { activity: any; feedback?: any; onAnswer?: (correct: boolean) => void; theme?: CircleTheme }) {
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
        <FractionCircle parts={2} shadedParts={shadedParts} equalParts={true} showLabels={false} size={200} interactive onClickPart={handlePartClick} theme={theme === "plain" ? "paper_cutout" : theme} />
      </div>
      <p className="text-xs text-slate-500 text-center">
        Tap inside one half to shade it, tap again to erase.
      </p>
      {!submitted && shadedParts > 0 && (
        <div className="flex justify-center">
          <button onClick={handleSubmit} className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors">
            Check my shading
          </button>
        </div>
      )}
      {submitted && feedback && (
        <div className="text-center animate-fade-in">
          {isCorrect ? (
            <p className="text-sm font-bold text-emerald-600">{feedback.correct || "Well done! You shaded one half."}</p>
          ) : (
            <p className="text-sm font-bold text-orange-600">{feedback.incorrect || "Try again. Remember: shade exactly one of the two equal parts."}</p>
          )}
        </div>
      )}
    </div>
  );
}

// -- Legacy interaction renderer ---------------------------------------------

function LegacyInteractionRenderer({ step, interaction, setInteraction, onNext }: any) {
  const type = step.interaction?.type;
  if (type === "tap_continue") {
    return <TapContinue prompt={step.interaction.prompt} onContinue={onNext} buttonLabel={step.interaction.buttonLabel || step.interaction.prompt} />;
  }
  if (type === "choice") {
    const options = step.interaction.options || [];
    return <ChoiceGrid options={options.map((opt: string, i: number) => ({ id: String(i), label: String.fromCharCode(65 + i), description: opt }))} onSelect={(id: string) => setInteraction((p: any) => ({ ...p, selectedChoice: parseInt(id) }))} selectedId={interaction.selectedChoice != null ? String(interaction.selectedChoice) : undefined} columns={Math.min(options.length, 3)} />;
  }
  if (type === "multiple_choice") {
    const options = step.interaction.options || [];
    const correctIdx = step.interaction.correctIndex != null ? step.interaction.correctIndex : (typeof step.interaction.correctAnswer === "number" ? step.interaction.correctAnswer : 0);
    return <MultipleChoice question={step.interaction.question || ""} options={options} correctIndex={correctIdx} onAnswer={(correct: boolean, idx: number) => setInteraction((p: any) => ({ ...p, selectedChoice: idx, choiceFeedback: correct ? "correct" : "incorrect" }))} />;
  }
  return null;
}

// -- Welcome Step Visual ---------------------------------------------------
// Single polished visual for the Welcome step: shows the illustration or a clean placeholder.
// This prevents double-rendering (illustration + visualSpec) for Welcome steps.

function WelcomeStepVisual({ step, isAdmin, onUpload, onGenerateAI, generating }: {
  step: ExtendedJourneyStep;
  isAdmin?: boolean;
  onUpload?: (stepIndex: number, file: File) => void;
  onGenerateAI?: (stepIndex: number, prompt?: string) => void;
  generating?: boolean;
}) {
  const illo = step.mediaSpec?.illustration;
  const caption = illo?.caption || "Amina has one chapati to share.";
  const imageUrl = illo?.approvedUrl;

  // Admin controls — compact, attached to image card
  const adminControls = isAdmin && onUpload && onGenerateAI ? (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border-t border-slate-100 flex-wrap">
      <span className="text-[11px] font-bold text-emerald-700">✓ Ready</span>
      <div className="flex items-center gap-3 flex-wrap">
        <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500 text-white text-[11px] font-bold cursor-pointer hover:bg-indigo-600 transition-colors">
          <Upload className="w-3 h-3" />
          Upload Image
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(-1, f); e.target.value = ""; }} />
        </label>
        <button onClick={() => onGenerateAI(-1, illo?.prompt)} disabled={generating}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors">
          <Sparkles className="w-3 h-3" />
          {generating ? "Generating..." : "Replace with AI"}
        </button>
      </div>
    </div>
  ) : null;

  // Priority 1: Approved uploaded/generated image
  if (imageUrl) {
    return (
      <div className="flex justify-center my-4">
        <div className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm max-w-md w-full bg-white">
          <img src={imageUrl} alt={illo.alt || "Lesson illustration"} className="w-full h-auto max-h-[300px] object-contain" />
          {illo.caption && <p className="text-xs text-slate-500 text-center py-2 bg-slate-50 border-t border-slate-100">{illo.caption}</p>}
          {adminControls}
        </div>
      </div>
    );
  }

  // Priority 2: HTML/CSS illustration fallback
  return (
    <div className="flex justify-center my-4">
      <div className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm max-w-md w-full">
        <ChapatiSharingIllustration />
        <p className="text-xs text-slate-500 text-center py-2 bg-slate-50 border-t border-slate-100">{caption}</p>
        {adminControls}
      </div>
    </div>
  );
}
