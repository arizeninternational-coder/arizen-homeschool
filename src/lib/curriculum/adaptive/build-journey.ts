/**
 * Generated journey builder — derives a full adaptive journey from a lesson's
 * AdaptiveLessonConfig plus its curriculum content blocks.
 *
 * Replaces two problems in the old generic Grade 4 builder:
 *  - practice activities were invented from an `experiment` block's steps,
 *    with placeholder text ("Try the activity", "Follow each step");
 *  - completion/review copy was fixed rather than derived from the lesson.
 *
 * Every scored activity here comes from the lesson's own config, so the step
 * that renders a question and the config that scores it are the same data.
 * Explanatory text comes from the lesson's real content blocks; nothing is
 * invented when the lesson has none.
 */

import type { GeneratedContentBlock as ContentBlock } from '../../../data/content-types';
import type { JourneyStep } from '../grade4-journeys';
import type { AdaptiveActivitySpec, AdaptiveLessonConfig } from './types';

function textBlocks(blocks: ContentBlock[]): string[] {
  return blocks
    .filter((b) => b.type === 'text')
    .map((b) => String((b.data as any)?.content || '').trim())
    .filter(Boolean);
}

function journalBlock(blocks: ContentBlock[]): string | null {
  const j = blocks.find((b) => b.type === 'journal');
  return j ? String((j.data as any)?.prompt || '').trim() || null : null;
}

function firstSentence(text: string, max = 220): string {
  if (!text) return '';
  const sentences = text.match(/[^.!?\n]+[.!?]?/g) || [text];
  let out = '';
  for (const s of sentences) {
    if ((out + ' ' + s).trim().length > max) break;
    out = (out + ' ' + s).trim();
  }
  return out || text.slice(0, max);
}

interface ChoiceStep {
  id: string;
  label: string;
  description?: string;
}

function choiceStep(activity: AdaptiveActivitySpec): ChoiceStep[] {
  const choices = activity.choices || [];
  return choices.map((label, i) => ({
    id: String.fromCharCode(65 + i),
    label,
  }));
}

/** A scored single-choice step built from a config activity. */
function scoredStep(
  activity: AdaptiveActivitySpec,
  stepType: string,
  stepId: string,
): JourneyStep {
  const choices = choiceStep(activity);
  const correctIndex = (activity.choices || []).indexOf(activity.correctAnswer || '');
  const correctId = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : undefined;

  return {
    id: stepId,
    stepType,
    title: stepType === 'quick_check' ? 'Quick Check' : activity.prompt || '',
    studentText: activity.prompt || '',
    owlText:
      stepType === 'think_first'
        ? 'Before we go further, make your best guess. Let us see how it goes.'
        : 'Let us work through this one together.',
    studentInstruction: activity.hint || 'Choose the best answer.',
    interactionSpec: {
      type: 'tap_choice',
      prompt: activity.prompt || '',
      choices,
      correctChoiceId: correctId,
      conceptId: activity.conceptId,
      hint: activity.hint || '',
    },
    feedbackSpec: {
      correct: activity.explanation || 'Correct! Well done.',
      // Deliberately does NOT reveal the correct answer after a wrong choice.
      incorrect: 'Not quite. Let us look at this again — help is on the way.',
      hint: activity.hint || '',
    },
    successCriteria: 'Answers correctly or receives misconception-specific remediation.',
  };
}

/**
 * Split the lesson's activities across journey step types:
 *   first  → think_first
 *   second → connect
 *   middle → practice (multi_activity)
 *   last   → quick_check
 *
 * This mirrors the Place Value journey shape (think_first, connect, practice,
 * quick_check) without any lesson-specific branching.
 */
function assignStepTypes(activities: AdaptiveActivitySpec[]): {
  thinkFirst?: AdaptiveActivitySpec;
  connect?: AdaptiveActivitySpec;
  practice: AdaptiveActivitySpec[];
  quickCheck?: AdaptiveActivitySpec;
} {
  if (activities.length === 0) return { practice: [] };
  if (activities.length === 1) return { thinkFirst: activities[0], practice: [] };
  if (activities.length === 2) {
    return { thinkFirst: activities[0], quickCheck: activities[1], practice: [] };
  }
  return {
    thinkFirst: activities[0],
    connect: activities[1],
    practice: activities.slice(2, -1),
    quickCheck: activities[activities.length - 1],
  };
}

export function buildAdaptiveJourneyFromConfig(
  config: AdaptiveLessonConfig,
  blocks: ContentBlock[] = [],
): JourneyStep[] {
  const texts = textBlocks(blocks);
  const journal = journalBlock(blocks);
  const assignment = assignStepTypes(config.activities);

  const overview = firstSentence(texts[0] || config.objectives[0] || '');
  const secondText = texts[1] || '';
  const thirdText = texts[2] || '';

  const steps: JourneyStep[] = [];

  // ── Welcome ─────────────────────────────────────────────────────────────
  steps.push({
    id: 'welcome',
    stepType: 'welcome',
    title: `Welcome to ${config.lessonTitle}`,
    studentText: overview,
    owlText: `Today we are learning about ${config.lessonTitle.toLowerCase()}. Ready?`,
    studentInstruction: 'Look at what we will explore today.',
    interactionSpec: {
      type: 'tap_continue',
      prompt: 'Begin your learning journey',
      buttonLabel: 'Start lesson',
      hint: '',
    },
    visualSpec: {
      type: 'mission_preview',
      items: config.objectives,
    },
    feedbackSpec: { hint: '' },
    successCriteria: 'Ready to learn.',
  });

  // ── Mission ─────────────────────────────────────────────────────────────
  steps.push({
    id: 'mission',
    stepType: 'mission',
    title: 'Your Mission',
    studentText:
      'By the end of this lesson you will be able to show what you know — and I will help you with ' +
      'anything that is tricky.',
    owlText: 'Here is your mission. Every question you answer gives us evidence about what you know.',
    studentInstruction: 'Accept your mission.',
    interactionSpec: {
      type: 'tap_continue',
      prompt: 'Accept your mission to begin learning',
      buttonLabel: 'Accept mission',
    },
    visualSpec: {
      type: 'mission_preview',
      items: config.objectives,
    },
    feedbackSpec: { hint: '' },
    successCriteria: 'Understands the goal.',
  });

  // ── Think First (scored) ────────────────────────────────────────────────
  if (assignment.thinkFirst) {
    steps.push(scoredStep(assignment.thinkFirst, 'think_first', 'think_first'));
  }

  // ── Learn (from the lesson's own teaching text) ─────────────────────────
  const learnText = texts[0] || secondText || overview;
  steps.push({
    id: 'learn',
    stepType: 'learn',
    title: `Learn: ${config.lessonTitle}`,
    studentText: learnText,
    owlText: 'Let me explain the important idea. Read it carefully, then we will use it.',
    studentInstruction: 'Read and understand the idea.',
    interactionSpec: {
      type: 'tap_continue',
      prompt: 'I understand',
      buttonLabel: 'I understand',
    },
    feedbackSpec: { correct: 'Good. Now let us try it.', hint: '' },
    successCriteria: 'Understands the main idea.',
  });

  // ── Connect (scored, real-life application) ────────────────────────────
  if (assignment.connect) {
    const step = scoredStep(assignment.connect, 'connect', 'connect');
    if (thirdText) {
      step.studentText = thirdText;
      step.owlText = 'Numbers show up in real life all the time. Let us use this one.';
    }
    steps.push(step);
  } else if (secondText) {
    steps.push({
      id: 'connect',
      stepType: 'connect',
      title: 'In Real Life',
      studentText: secondText,
      owlText: 'Let us see where this shows up around you.',
      studentInstruction: 'Think about where you meet this in daily life.',
      interactionSpec: {
        type: 'tap_continue',
        prompt: 'I understand',
        buttonLabel: 'Continue',
      },
      feedbackSpec: { hint: '' },
      successCriteria: 'Connects the idea to a real-life situation.',
    });
  }

  // ── Practice (scored multi_activity) ────────────────────────────────────
  if (assignment.practice.length > 0) {
    steps.push({
      id: 'practice',
      stepType: 'practice',
      title: 'Your Turn',
      studentText: 'Now it is your turn. Answer each question — I will help you with any you find tricky.',
      owlText: 'Take your time and think carefully. Wrong answers help me understand how to help you.',
      studentInstruction: 'Complete each activity.',
      interactionSpec: {
        type: 'multi_activity',
        prompt: 'Complete each activity',
        activities: assignment.practice.map((activity) => {
          const choices: any[] = choiceStep(activity);
          const correctIndex = (activity.choices || []).indexOf(activity.correctAnswer || '');
          return {
            id: activity.activityId,
            type: 'tap_choice' as const,
            prompt: activity.prompt || '',
            choices,
            correctChoiceId:
              correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : undefined,
            hint: activity.hint || '',
          };
        }),
      },
      visualSpec: {
        type: 'practice_set',
        items: assignment.practice.map((activity) => ({
          id: activity.activityId,
          type: 'tap_choice',
          prompt: activity.prompt || '',
        })) as any,
      },
      feedbackSpec: {
        correct: 'Well done! You worked through every activity.',
        incorrect: 'Let us look at the one you found tricky again.',
        hint: '',
      },
      successCriteria: 'Responds to every practice activity.',
    });
  }

  // ── Quick Check (scored) ────────────────────────────────────────────────
  if (assignment.quickCheck) {
    steps.push(scoredStep(assignment.quickCheck, 'quick_check', 'quick_check'));
  }

  // ── Reflect ─────────────────────────────────────────────────────────────
  steps.push({
    id: 'reflect',
    stepType: 'reflect',
    title: 'Think About It',
    studentText: journal || `Think about ${config.lessonTitle.toLowerCase()} and what you discovered.`,
    owlText: 'Take a moment to reflect on what you learned today.',
    studentInstruction: 'Write your reflection.',
    interactionSpec: {
      type: 'reflection_chips',
      prompt: journal || `What did you learn about ${config.lessonTitle.toLowerCase()}?`,
      chips: config.objectives,
      sentenceStarter: 'I learned that...',
      hint: 'Use your own words.',
    },
    feedbackSpec: {
      correct: 'Great reflection!',
      incorrect: 'Think about what you learned.',
      hint: 'Use your own words.',
    },
    successCriteria: 'Reflects on learning.',
  });

  // ── Complete ────────────────────────────────────────────────────────────
  // Copy is derived from THIS lesson's config, never hardcoded for a subject.
  steps.push({
    id: 'complete',
    stepType: 'complete',
    title: "You're done!",
    studentText: config.celebration.praise,
    owlText: `${config.celebration.headline} ${config.celebration.praise}`,
    studentInstruction: 'You completed this lesson.',
    interactionSpec: {
      type: 'tap_continue',
      prompt: 'You completed this lesson.',
      buttonLabel: 'Done',
    },
    visualSpec: {
      type: 'recap_checklist',
      items: config.celebration.recap,
    },
    feedbackSpec: {
      correct: config.celebration.badge
        ? `You earned your ${config.celebration.badge}!`
        : 'You completed the lesson!',
      hint: 'Great work!',
    },
    successCriteria: 'Completes the lesson.',
    rewardText: config.celebration.badge
      ? `You earned your ${config.celebration.badge}!`
      : 'You completed the lesson and earned XP!',
    mediaSpec: {
      type: 'reward_animation',
      name: config.celebration.badge || `${config.lessonTitle} Complete`,
      purpose: `Celebrate ${config.lessonTitle} mastery`,
    } as any,
  });

  return steps;
}