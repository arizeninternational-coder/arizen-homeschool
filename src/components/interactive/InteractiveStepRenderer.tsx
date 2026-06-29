"use client";

import React from "react";
import { FractionCircle, FractionRectangle, FractionSemicircle, FractionCircleWithDottedLine } from "./FractionVisuals";
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
    return <FractionCircle parts={visual.parts || 1} shadedParts={visual.shadedParts || 0} equalParts={visual.equalParts !== false} showLabels={visual.showLabels !== false} labels={visual.labels} size={visual.size || 120} theme={theme} />;
  }
  if (visual.type === "fraction_rectangle") {
    return <FractionRectangle parts={visual.parts || 1} shadedParts={visual.shadedParts || 0} equalParts={visual.equalParts !== false} orientation={(visual.orientation as any) || "vertical"} showLabels={visual.showLabels !== false} labels={visual.labels} width={140} height={90} />;
  }
  if (visual.type === "fraction_semicircle") {
    return <FractionSemicircle theme={theme} size={visual.size || 72} shaded={visual.shaded !== false} />;
  }
  if (visual.type === "fraction_circle_dotted") {
    return <FractionCircleWithDottedLine theme={theme} size={visual.size || 72} />;
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
        symbol: s.symbol,
        highlight: s.highlight,
      }));
      if (step.stepKey === "learn" || step.stepKey === "example") {
        return <HorizontalTeachingStrip steps={revealSteps} theme={theme} intro={vs.intro || step.storyIntro} />;
      }
      return <StepReveal steps={revealSteps} onComplete={onNext} mode="carousel" />;
    }

    if (vs.type === "predict_choice") {
      return (
        <PredictChoiceCard
          prompt={vs.prompt || step.interactionSpec?.prompt || step.studentInstruction}
          instruction={vs.instruction}
          options={vs.choices || []}
          correctId={step.interactionSpec?.correctChoiceId || step.interaction?.correctAnswer}
          feedbackMap={vs.feedbackMap || {}}
          correctFeedback={step.feedbackSpec?.correct}
          incorrectFeedback={step.feedbackSpec?.incorrect}
          theme={theme}
          onSelect={(choiceId, isCorrect) => {
            setInteraction((p: any) => ({ ...p, selectedChoiceId: choiceId, choiceCorrect: isCorrect, choiceSubmitted: true }));
            if (isCorrect) handleCorrectAnswer();
          }}
          onContinue={onNext}
          interaction={interaction}
        />
      );
    }

    if (vs.type === "worked_example") {
      return (
        <WorkedExampleGrid
          intro={vs.intro || step.storyIntro}
          steps={(vs.steps || []).map((s: any) => ({
            title: s.title,
            description: s.description,
            visualType: s.visualType,
            visualProps: s.visualProps,
          }))}
          theme={theme}
        />
      );
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

    if (vs.type === "mission_brief") {
      return (
        <MissionBriefCard
          title={vs.title || "Your mission has 4 parts:"}
          missionIntro={vs.missionIntro || step.storyIntro}
          items={vs.items || []}
          icons={vs.icons}
          accepted={missionAccepted}
          theme={theme}
        />
      );
    }

    if (vs.type === "checklist") {
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
            if (isMission) {
              setMissionAccepted(true);
              // Show success message, then advance after delay
              setTimeout(() => {
                onNext();
              }, 1800);
            } else {
              if (isComplete) handleLessonComplete();
              onNext();
            }
          }}
          feedback={isMission ? undefined : feedback}
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
      return (
        <div className="mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/70 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <p className="text-sm font-bold text-emerald-700">{step.feedbackSpec.correct}</p>
          </div>
        </div>
      );
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

// -- Predict Choice Card ---------------------------------------------------

interface PredictOption {
  id: string;
  label: string;
  title?: string;
  description?: string;
  visual?: any;
  feedback?: string;
}

interface PredictChoiceCardProps {
  prompt?: string;
  instruction?: string;
  options: PredictOption[];
  correctId?: string;
  feedbackMap?: Record<string, string>;
  correctFeedback?: string;
  incorrectFeedback?: string;
  theme?: CircleTheme;
  onSelect: (choiceId: string, isCorrect: boolean) => void;
  onContinue: () => void;
  interaction: any;
}

function PredictChoiceCard({ prompt, instruction, options, correctId, feedbackMap, correctFeedback, incorrectFeedback, theme, onSelect, onContinue, interaction }: PredictChoiceCardProps) {
  const selectedId = interaction?.selectedChoiceId;
  const isSubmitted = interaction?.choiceSubmitted;
  const isCorrect = interaction?.choiceCorrect;
  const selectedOpt = options.find(o => o.id === selectedId);
  const selectedFeedback = selectedOpt?.feedback || feedbackMap?.[selectedId || ''];
  const showFeedback = isSubmitted && selectedId;

  const getCardState = (optId: string) => {
    if (!isSubmitted) return selectedId === optId ? 'selected' : 'idle';
    if (optId === correctId) return 'correct';
    if (optId === selectedId) return 'incorrect';
    return 'dimmed';
  };

  const stateStyles: Record<string, string> = {
    idle: 'border-slate-200 bg-white hover:border-violet-300 hover:shadow-lg cursor-pointer',
    selected: 'border-violet-400 bg-violet-50/60 shadow-lg shadow-violet-100 cursor-pointer',
    correct: 'border-emerald-400 bg-emerald-50/70 shadow-lg shadow-emerald-100',
    incorrect: 'border-orange-400 bg-orange-50/70 shadow-lg shadow-orange-100',
    dimmed: 'border-slate-200 bg-slate-50/50 opacity-60',
  };

  const badgeStyles: Record<string, string> = {
    idle: 'bg-slate-400 text-white',
    selected: 'bg-violet-500 text-white',
    correct: 'bg-emerald-500 text-white',
    incorrect: 'bg-orange-500 text-white',
    dimmed: 'bg-slate-300 text-white',
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Prompt card */}
      {prompt && (
        <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-yellow-50/30 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm">💭</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">{prompt}</p>
              {instruction && (
                <p className="text-xs text-amber-700 font-medium mt-1.5">{instruction}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Option cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${options.length >= 4 ? 2 : Math.min(options.length, 3)}, 1fr)` }}>
        {options.map((opt) => {
          const state = getCardState(opt.id);
          const isSelected = state === 'selected';
          const visualNode = opt.visual ? renderVisualElement(opt.visual, theme) : null;

          return (
            <button
              key={opt.id}
              onClick={() => {
                if (!isSubmitted || !isCorrect) {
                  onSelect(opt.id, opt.id === correctId);
                }
              }}
              disabled={isSubmitted && isCorrect}
              className={`relative rounded-2xl border-2 p-4 pt-5 text-center transition-all duration-200 ${stateStyles[state]}`}
            >
              {/* Letter badge */}
              <div className={`absolute -top-2.5 -left-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${badgeStyles[state]}`}>
                {state === 'correct' ? '✓' : state === 'incorrect' ? '✗' : opt.label}
              </div>

              {/* Title (e.g. fraction name) */}
              {opt.title && (
                <h5 className={`text-sm font-bold text-slate-700 mb-1 ${
                  state === 'correct' ? 'text-emerald-700' : state === 'incorrect' ? 'text-orange-700' : ''
                }`}>
                  {opt.title}
                </h5>
              )}

              {/* Visual */}
              {visualNode && (
                <div className="flex justify-center mb-3 mt-1">
                  <div className="transform scale-90">{visualNode}</div>
                </div>
              )}

              {/* Description */}
              {opt.description && (
                <p className={`text-xs font-semibold leading-snug ${state === 'correct' ? 'text-emerald-700' : state === 'incorrect' ? 'text-orange-700' : 'text-slate-600'}`}>
                  {opt.description}
                </p>
              )}

              {/* Correct check overlay */}
              {state === 'correct' && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback area */}
      {showFeedback && (
        <div className={`rounded-xl px-4 py-3 shadow-sm animate-fade-in ${
          isCorrect
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/70'
            : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/70'
        }`}>
          <div className="flex items-start gap-2.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isCorrect ? 'bg-emerald-500' : 'bg-orange-400'
            }`}>
              <span className="text-white text-[10px] font-bold">{isCorrect ? '✓' : '✗'}</span>
            </div>
            <p className={`text-sm font-semibold leading-snug ${
              isCorrect ? 'text-emerald-700' : 'text-orange-700'
            }`}>
              {isCorrect
                ? (selectedFeedback || correctFeedback || "Yes! That's correct!")
                : (selectedFeedback || incorrectFeedback || "Not quite. Try again!")
              }
            </p>
          </div>
        </div>
      )}

      {/* Continue button after correct answer */}
      {isSubmitted && isCorrect && (
        <div className="flex justify-center pt-1 animate-fade-in">
          <button
            onClick={onContinue}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

// -- Worked Example Grid ---------------------------------------------------

interface WorkedExampleStep {
  title: string;
  description?: string;
  visualType: string;
  visualProps?: any;
}

interface WorkedExampleGridProps {
  intro?: string;
  steps: WorkedExampleStep[];
  theme?: CircleTheme;
}

function WorkedExampleGrid({ intro, steps, theme }: WorkedExampleGridProps) {
  const accentBg = theme === "chapati" ? "from-amber-50/50 to-orange-50/30" : theme === "paper_cutout" ? "from-sky-50/40 to-indigo-50/30" : "from-slate-50 to-white";

  const renderStepVisual = (vs: WorkedExampleStep) => {
    switch (vs.visualType) {
      case "trace_circle":
        return (
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Paper sheet */}
            <rect x="15" y="15" width="90" height="90" rx="3" fill="#FFFEF9" stroke="#CBD5E1" strokeWidth="2" />
            {/* Paper texture lines */}
            <line x1="25" y1="30" x2="95" y2="30" stroke="#E2E8F0" strokeWidth="0.5" />
            <line x1="25" y1="40" x2="95" y2="40" stroke="#E2E8F0" strokeWidth="0.5" />
            <line x1="25" y1="50" x2="95" y2="50" stroke="#E2E8F0" strokeWidth="0.5" />
            {/* Lid / cup */}
            <ellipse cx="60" cy="48" rx="22" ry="8" fill="#94A3B8" opacity="0.4" />
            <rect x="38" y="48" width="44" height="16" fill="#94A3B8" opacity="0.3" rx="2" />
            <ellipse cx="60" cy="64" rx="22" ry="8" fill="#64748B" opacity="0.5" />
            {/* Lid rim */}
            <ellipse cx="60" cy="48" rx="22" ry="8" fill="none" stroke="#475569" strokeWidth="2" />
            {/* Dotted circle being traced */}
            <circle cx="60" cy="72" r="20" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" />
            {/* Pencil */}
            <g transform="translate(82, 36) rotate(-25)">
              <rect x="0" y="0" width="28" height="5" rx="1" fill="#F59E0B" />
              <polygon points="28,0 34,2.5 28,5" fill="#1E293B" />
              <rect x="0" y="0" width="5" height="5" fill="#FBBF24" rx="1" />
            </g>
            {/* Small hand hint */}
            <circle cx="82" cy="32" r="4" fill="#FDBA74" opacity="0.6" />
          </svg>
        );
      case "cut_out":
        return (
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Paper circle */}
            <circle cx="55" cy="60" r="28" fill="#FFFEF9" stroke="#CBD5E1" strokeWidth="2" />
            {/* Dashed cut line */}
            <circle cx="55" cy="60" r="28" fill="none" stroke="#7C3AED" strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />
            {/* Cut marks / snip lines */}
            <path d="M 55 32 L 55 28" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
            <path d="M 70 35 L 73 32" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 82 48 L 86 46" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
            {/* Scissors */}
            <g transform="translate(82, 42) rotate(15)">
              {/* Handles */}
              <ellipse cx="0" cy="-4" rx="7" ry="4" fill="none" stroke="#475569" strokeWidth="2.5" />
              <ellipse cx="0" cy="6" rx="7" ry="4" fill="none" stroke="#475569" strokeWidth="2.5" />
              {/* Blades */}
              <line x1="5" y1="-2" x2="22" y2="-10" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
              <line x1="5" y1="4" x2="22" y2="12" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
              {/* Pivot */}
              <circle cx="4" cy="1" r="2.5" fill="#475569" />
            </g>
            {/* Small paper piece falling */}
            <rect x="30" y="90" width="8" height="6" rx="1" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" transform="rotate(15, 34, 93)" />
          </svg>
        );
      case "fold_circle":
        return (
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Full circle (before fold) */}
            <circle cx="60" cy="60" r="28" fill="#FFFEF9" stroke="#CBD5E1" strokeWidth="2" />
            {/* Dashed fold line (vertical center) */}
            <line x1="60" y1="32" x2="60" y2="88" stroke="#7C3AED" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" />
            {/* Fold arrows (curved, showing top folding down) */}
            <path d="M 45 40 Q 40 30 50 25" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrow)" />
            <path d="M 75 40 Q 80 30 70 25" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrow)" />
            {/* Arrowhead marker */}
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#7C3AED" />
              </marker>
            </defs>
            {/* Alignment checkmarks showing edges match */}
            <text x="38" y="50" fontSize="10" fill="#16A34A" fontWeight="bold">✓</text>
            <text x="76" y="50" fontSize="10" fill="#16A34A" fontWeight="bold">✓</text>
            <text x="38" y="74" fontSize="10" fill="#16A34A" fontWeight="bold">✓</text>
            <text x="76" y="74" fontSize="10" fill="#16A34A" fontWeight="bold">✓</text>
            {/* "fold" label */}
            <text x="48" y="22" fontSize="10" fill="#7C3AED" fontWeight="bold">fold</text>
          </svg>
        );
      case "shade_half":
        return (
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Full circle */}
            <circle cx="60" cy="60" r="32" fill="#FFFEF9" stroke="#CBD5E1" strokeWidth="2.5" />
            {/* Right half shaded */}
            <path d="M 60 28 A 32 32 0 0 1 60 92 Z" fill="#7C3AED" opacity="0.75" stroke="#7C3AED" strokeWidth="2.5" />
            {/* Center fold line */}
            <line x1="60" y1="28" x2="60" y2="92" stroke="#4C1D95" strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />
            {/* 1/2 label on shaded part */}
            <text x="76" y="64" fontSize="14" fill="#fff" fontWeight="800">1/2</text>
            {/* "shaded" label */}
            <text x="22" y="64" fontSize="9" fill="#64748B" fontWeight="600">whole</text>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-2">
      {intro && (
        <p className="text-sm text-slate-600 font-medium text-center mb-3 leading-relaxed">
          {intro}
        </p>
      )}

      <div className={`rounded-2xl border border-slate-200/60 bg-gradient-to-br ${accentBg} p-4 lg:p-6`}>
        <div className="grid grid-cols-2 gap-5 lg:gap-6">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              {/* Step number */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black mb-2 ${
                theme === "paper_cutout"
                  ? "bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-sm"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {i + 1}
              </div>

              {/* Title */}
              <h4 className="font-bold text-slate-700 text-xs text-center leading-tight mb-2">
                {s.title}
              </h4>

              {/* Visual */}
              <div className="flex justify-center mb-2">
                {renderStepVisual(s)}
              </div>

              {/* Description */}
              {s.description && (
                <p className="text-[11px] text-slate-500 text-center leading-snug font-medium max-w-[140px]">
                  {s.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
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

// -- Mission Brief Card ----------------------------------------------------

const MISSION_ICONS = ["🍞", "✂️", "📏", "🗣️"];

interface MissionBriefCardProps {
  title: string;
  missionIntro?: string;
  items: string[];
  icons?: string[];
  accepted: boolean;
  theme?: CircleTheme;
}

function MissionBriefCard({ title, missionIntro, items, icons, accepted, theme }: MissionBriefCardProps) {
  const accentGradient = "from-violet-500 to-purple-600";
  const cardBg = theme === "chapati"
    ? "from-amber-50/40 via-violet-50/30 to-purple-50/40"
    : "from-violet-50/60 via-purple-50/40 to-indigo-50/30";

  return (
    <div className={`mt-4 rounded-2xl border-2 border-violet-200/70 bg-gradient-to-br ${cardBg} shadow-md overflow-hidden`}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-md`}>
            <span className="text-lg">🎯</span>
          </div>
          <div>
            <h4 className="font-extrabold text-violet-800 text-base tracking-tight">Mission</h4>
            <p className="text-[11px] text-violet-500 font-medium">Your challenge today</p>
          </div>
        </div>
        {missionIntro && (
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {missionIntro}
          </p>
        )}
      </div>

      {/* Mission items */}
      <div className="px-5 pb-4">
        <p className="text-[11px] font-bold text-violet-600 uppercase tracking-wider mb-2.5">{title}</p>
        <div className="space-y-2">
          {items.map((item, i) => {
            const icon = icons?.[i] || MISSION_ICONS[i] || `${i + 1}`;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 ${
                  accepted
                    ? "bg-white/90 border border-violet-200/70 shadow-sm"
                    : "bg-white/60 border border-violet-100/60"
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  accepted
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm"
                    : "bg-violet-100 text-violet-600"
                }`}>
                  {accepted ? "✓" : icon}
                </div>
                <span className={`text-sm font-semibold transition-colors duration-300 ${
                  accepted ? "text-violet-800" : "text-slate-700"
                }`}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
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
