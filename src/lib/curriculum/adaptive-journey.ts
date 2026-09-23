/**
 * Adaptive Journey Builder for Grade 4 Place Value
 * 
 * Takes the existing linear journey and inserts remediation steps
 * based on student performance evidence.
 * 
 * Integration point: called from buildPlaceValueJourney() to inject
 * adaptive branches after specific quiz steps.
 */

import type { JourneyStep } from "./grade4-journeys";
import {
  type LearningState,
  type AdaptiveStep,
  type AnswerResult,
  evaluateAnswer,
  detectMisconception,
  selectNextActivity,
  recordEvidence,
  PLACE_VALUE_MISCONCEPTIONS,
} from "./adaptive-engine";

// -- Concept mapping for Place Value quiz blocks ---------------------------

interface QuizConceptMapping {
  lessonSlug: string;
  quizIndex: number; // 0-based index within the lesson's quiz blocks
  conceptId: string;
  expectedAnswer?: string; // optional, for documentation
  misconceptionCheck?: (selected: string, expected: string) => string | null;
}

export const PLACE_VALUE_QUIZ_MAPPINGS: QuizConceptMapping[] = [
  {
    lessonSlug: 'place-value',
    quizIndex: 0,
    conceptId: 'digit-value',
    // Curriculum question: "What is the place value of 7 in 4,729?"
    // 4,729 → 4=thousands, 7=hundreds, 2=tens, 9=ones
    // Correct: index 2 = "7 hundreds"
    expectedAnswer: '7 hundreds',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      const exp = expected.toLowerCase();
      // Chose "7 ones" → digit-vs-value confusion (picked face value)
      if (sel.includes('ones') && !exp.includes('ones')) {
        return 'digit-not-value';
      }
      // Chose wrong position (e.g., tens instead of hundreds)
      const places = ['ones', 'tens', 'hundreds', 'thousands'];
      const selPlace = places.find(p => sel.includes(p));
      const expPlace = places.find(p => exp.includes(p));
      if (selPlace && expPlace && selPlace !== expPlace) {
        return 'position-confusion';
      }
      return null;
    },
  },
  {
    lessonSlug: 'place-value',
    quizIndex: 1,
    conceptId: 'expanded-form',
    misconceptionCheck: (selected, expected) => {
      if (selected.includes('0') && !expected.includes('0')) {
        return 'expanded-form-skip';
      }
      return null;
    },
  },
];

/**
 * Check if a lesson is the Place Value lesson that should use adaptive path.
 */
export function isPlaceValueLesson(lessonTitle?: string): boolean {
  if (!lessonTitle) return false;
  const title = lessonTitle.toLowerCase();
  return title.includes('place value') || title.includes('place-value');
}

export interface AdaptiveJourneyResult {
  steps: JourneyStep[];
  adaptiveInserted: boolean;
  remediationStepIds: string[];
}

/**
 * Build an adaptive journey for Place Value.
 * 
 * Takes the standard journey and augments quiz steps with answer
 * evaluation + misconception detection + remediation insertion.
 * 
 * @param lessonTitle - title of the lesson (used for routing)
 * @param studentId - current student ID
 * @param learningState - current adaptive learning state
 */
export function buildAdaptivePlaceValueJourney(
  lessonTitle: string,
  studentId: string,
  learningState?: LearningState,
): AdaptiveJourneyResult {
  // Import the base journey
  const { buildPlaceValueJourney } = require('./grade4-journeys');
  const baseSteps = buildPlaceValueJourney();
  
  // Return base steps without injecting extra adaptive-eval steps.
  // Adaptive evaluation happens via the onAnswer callback in the student player,
  // not as a separate numbered learner step.
  return {
    steps: baseSteps,
    adaptiveInserted: false,
    remediationStepIds: [],
  };
}

/**
 * Generate a remediation journey step for a detected misconception.
 */
export function generateRemediationStep(
  misconceptionId: string,
  conceptId: string,
): JourneyStep | null {
  const misconception = PLACE_VALUE_MISCONCEPTIONS.find(m => m.id === misconceptionId);
  if (!misconception) return null;
  
  const activityId = misconception.remediationActivities[0] || 'place-value-chart-explorer';
  
  const contentMap: Record<string, Partial<JourneyStep>> = {
    'place-value-chart-explorer': {
      title: 'Let\'s Look Closer 🕵️',
      studentText: misconception.description + '\n\nLet\'s use the place value chart to see it clearly.',
      visualSpec: {
        type: 'place_value_chart',
        digits: ['4', '7', '2', '9'],
        highlightColumn: 1,
        showValues: true,
      },
      interactionSpec: {
        type: 'tap_choice',
        prompt: 'Which column is the 7 in?',
        choices: ['Ones', 'Tens', 'Hundreds', 'Thousands'],
        correctChoiceId: '2',
        hint: 'Look at the labels above each column.',
      },
    },
    'digit-position-quiz': {
      title: 'Practice: Finding Digits 🔍',
      studentText: misconception.description + '\n\nLet\'s practice with a simpler example.',
      visualSpec: {
        type: 'place_value_chart',
        digits: ['3', '5', '1'],
        showValues: true,
      },
      interactionSpec: {
        type: 'multiple_choice',
        question: 'In 351, which place is the 5 in?',
        options: ['Ones', 'Tens', 'Hundreds', 'Thousands'],
        correctIndex: 1,
        hint: 'Count from right to left: Ones, Tens, Hundreds.',
      },
    },
    'expanded-form-builder': {
      title: 'Building Expanded Form 🏗️',
      studentText: misconception.description + '\n\nRemember: even zeros matter!',
      interactionSpec: {
        type: 'multi_activity',
        prompt: 'Build the expanded form step by step',
        activities: [
          { id: 'step1', type: 'tap_choice', prompt: 'What is the thousands digit?' },
          { id: 'step2', type: 'tap_choice', prompt: 'What is the hundreds digit?' },
          { id: 'step3', type: 'tap_choice', prompt: 'What is the tens digit?' },
          { id: 'step4', type: 'tap_choice', prompt: 'What is the ones digit?' },
        ],
      },
    },
    'number-line-hunt': {
      title: 'Find It on the Number Line 📍',
      studentText: 'Let\'s see where this number actually sits.',
      visualSpec: {
        type: 'number_line',
        rangeMin: 0,
        rangeMax: 5000,
        tickInterval: 1000,
        markerValue: 4729,
        markerLabel: '4,729',
      },
      interactionSpec: {
        type: 'tap_continue',
        prompt: 'Watch where 4,729 sits. Notice the thousands!',
      },
    },
  };
  
  const content = contentMap[activityId] || contentMap['place-value-chart-explorer'];
  
  return {
    id: `remediation-${misconceptionId}-${Date.now()}`,
    stepType: 'learn',
    title: content.title || 'Let\'s Practice',
    studentText: content.studentText || '',
    visualSpec: content.visualSpec,
    interactionSpec: content.interactionSpec,
    feedbackSpec: {
      correct: 'Excellent! You\'re getting it.',
      incorrect: 'That\'s okay, let\'s try another way.',
      hint: 'Remember: each place is 10 times bigger than the place to its right.',
    },
  };
}

/**
 * Evaluate a student's answer and determine the next action.
 */
export function evaluateAndAdapt(
  learningState: LearningState,
  conceptId: string,
  selectedIndex: number,
  expectedIndex: number,
  options: string[],
): {
  updatedState: LearningState;
  misconceptionId: string | null;
  shouldRemediate: boolean;
  retryQuestion?: any;
} {
  const result = evaluateAnswer(selectedIndex, expectedIndex, options);
  
  const misconception = detectMisconception(
    conceptId,
    result.selectedAnswer,
    result.expectedAnswer,
    {},
  );
  
  const evidence = {
    conceptId,
    correct: result.correct,
    timestamp: Date.now(),
    activityId: `${conceptId}-check`,
    answer: result.selectedAnswer,
    expectedAnswer: result.expectedAnswer,
    misconceptionId: misconception?.id,
  };
  
  const updatedState = recordEvidence(learningState, evidence);
  const decision = selectNextActivity(updatedState, conceptId, result.correct);
  
  return {
    updatedState,
    misconceptionId: misconception?.id || null,
    shouldRemediate: !result.correct && updatedState.remediationCount < 3,
    retryQuestion: decision.nextStep.content,
  };
}

// -- Test helpers (for automated testing) ------------------------------------

export function createTestLearningState(overrides?: Partial<LearningState>): LearningState {
  return {
    studentId: 'test-student',
    lessonSlug: 'place-value',
    conceptStates: {
      'digit-value': {
        level: 'not_assessed',
        attempts: 0,
        correctAttempts: 0,
        misconceptions: [],
      },
      'expanded-form': {
        level: 'not_assessed',
        attempts: 0,
        correctAttempts: 0,
        misconceptions: [],
      },
    },
    currentActivityIndex: 0,
    remediationCount: 0,
    difficultyLevel: 2,
    ...overrides,
  } as LearningState;
}

export function simulateAnswer(
  state: LearningState,
  conceptId: string,
  selectedIndex: number,
  expectedIndex: number,
  options: string[],
): { state: LearningState; result: AnswerResult; misconceptionId: string | null } {
  const result = evaluateAnswer(selectedIndex, expectedIndex, options);
  const misconception = detectMisconception(conceptId, result.selectedAnswer, result.expectedAnswer, {});
  
  const evidence = {
    conceptId,
    correct: result.correct,
    timestamp: Date.now(),
    activityId: `${conceptId}-simulated`,
    answer: result.selectedAnswer,
    expectedAnswer: result.expectedAnswer,
    misconceptionId: misconception?.id,
  };
  
  const updatedState = recordEvidence(state, evidence);
  
  return { state: updatedState, result, misconceptionId: misconception?.id || null };
}
