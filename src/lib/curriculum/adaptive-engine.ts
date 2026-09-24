/**
 * Adaptive Learning Engine for Arizen
 * 
 * Provides concept-level tracking, misconception detection, and
 * adaptive activity selection based on student evidence.
 * 
 * Architecture:
 *   Curriculum → Concepts → Activities → Evidence → Learning State → Next Activity
 */

// -- Types --------------------------------------------------------------------

export type MasteryLevel = 'not_assessed' | 'emerging' | 'developing' | 'proficient';

export interface ConceptId {
  /** e.g. "place-value", "digit-value", "expanded-form" */
  id: string;
  label: string;
}

export interface Evidence {
  conceptId: string;
  correct: boolean;
  timestamp: number;
  activityId: string;
  answer?: string;
  expectedAnswer?: string;
  misconceptionId?: string;
}

export interface ConceptState {
  conceptId: string;
  level: MasteryLevel;
  attempts: number;
  correctAttempts: number;
  lastEvidence: Evidence | null;
  history: Evidence[];
}

export interface LearningState {
  studentId: string;
  lessonId: string;
  concepts: Record<string, ConceptState>;
  currentActivityId: string;
  remediationCount: number;
  difficultyLevel: number;
  startedAt: number;
}

export interface Misconception {
  id: string;
  label: string;
  description: string;
  indicators: string[];  // wrong answer patterns
  remediationActivities: string[];  // activity IDs
}

export interface AdaptiveStep {
  id: string;
  type: 'activity' | 'remediation' | 'challenge';
  title: string;
  conceptId: string;
  difficulty: number;
  content: any;  // JourneyStep-compatible
  prerequisites?: string[];
}

export interface AdaptiveDecision {
  nextStep: AdaptiveStep;
  reason: string;
  updatedState: LearningState;
}

// -- Place Value Concepts (CBC-mapped) ------------------------------------------

export const PLACE_VALUE_CONCEPTS: ConceptId[] = [
  { id: 'read-numbers', label: 'Read whole numbers' },
  { id: 'digit-position', label: 'Identify digit position' },
  { id: 'digit-value', label: 'Identify digit value' },
  { id: 'expanded-form', label: 'Expanded form' },
  { id: 'compare-order', label: 'Compare/order numbers' },
];

// -- Misconceptions for Place Value --------------------------------------------

export const PLACE_VALUE_MISCONCEPTIONS: Misconception[] = [
  {
    id: 'digit-not-value',
    label: 'Confuses digit with digit value',
    description: 'Student thinks the digit IS the value, ignoring place position',
    indicators: ['7 instead of 700', '5 instead of 5000', 'reports digit face value'],
    remediationActivities: ['place-value-chart-explorer', 'digit-position-quiz'],
  },
  {
    id: 'position-confusion',
    label: 'Confuses place positions',
    description: 'Student mixes up hundreds/tens/ones or thousands/hundreds',
    indicators: ['700 instead of 70', '70 instead of 700', 'reverses adjacent places'],
    remediationActivities: ['place-value-chart-explorer', 'number-line-hunt'],
  },
  {
    id: 'expanded-form-skip',
    label: 'Skips zero places in expanded form',
    description: 'Student omits places with zero value in expanded form',
    indicators: ['4000+200+9 for 4209', 'omits zero terms'],
    remediationActivities: ['expanded-form-builder', 'zero-place-activity'],
  },
  {
    id: 'left-right-reverse',
    label: 'Reads place positions right-to-left',
    description: 'Student reverses the direction of place value positions',
    indicators: ['ones reported as thousands', 'reversed positions'],
    remediationActivities: ['place-value-chart-explorer', 'column-matching'],
  },
  {
    id: 'comparison-reverse',
    label: 'Confuses greater-than/less-than direction',
    description: 'Student picks the smaller number when asked which is larger',
    indicators: ['chooses smaller when asked for larger', 'reverses comparison'],
    remediationActivities: ['comparison-number-line', 'place-value-chart-explorer'],
  },
  {
    id: 'comparison-equal',
    label: 'Treats numbers with different digits as equal',
    description: 'Student ignores digit differences and assumes numbers are equal',
    indicators: ['says equal when digits differ', 'ignores place differences'],
    remediationActivities: ['comparison-number-line', 'digit-by-digit-compare'],
  },
];

// -- Learning State Manager ---------------------------------------------------

export function createInitialLearningState(
  studentId: string,
  lessonId: string,
  conceptIds: string[],
): LearningState {
  const concepts: Record<string, ConceptState> = {};
  for (const cid of conceptIds) {
    concepts[cid] = {
      conceptId: cid,
      level: 'not_assessed',
      attempts: 0,
      correctAttempts: 0,
      lastEvidence: null,
      history: [],
    };
  }
  return {
    studentId,
    lessonId,
    concepts,
    currentActivityId: 'welcome',
    remediationCount: 0,
    difficultyLevel: 2,
    startedAt: Date.now(),
  };
}

export function recordEvidence(
  state: LearningState,
  evidence: Evidence,
): LearningState {
  const concept = state.concepts[evidence.conceptId];
  if (!concept) return state;

  const updatedHistory = [...concept.history, evidence];
  const correctAttempts = concept.correctAttempts + (evidence.correct ? 1 : 0);
  const attempts = concept.attempts + 1;

  let level: MasteryLevel = 'not_assessed';
  if (attempts >= 1) level = 'emerging';
  if (correctAttempts >= 2 && attempts <= 3) level = 'developing';
  if (correctAttempts >= 3 && correctAttempts / attempts >= 0.8) level = 'proficient';

  return {
    ...state,
    concepts: {
      ...state.concepts,
      [evidence.conceptId]: {
        ...concept,
        level,
        attempts,
        correctAttempts,
        lastEvidence: evidence,
        history: updatedHistory,
      },
    },
  };
}

// -- Answer Evaluation ---------------------------------------------------------

export interface AnswerResult {
  correct: boolean;
  selectedIndex: number;
  expectedIndex: number;
  selectedAnswer: string;
  expectedAnswer: string;
}

export function evaluateAnswer(
  selectedIndex: number,
  expectedIndex: number,
  options: string[],
): AnswerResult {
  return {
    correct: selectedIndex === expectedIndex,
    selectedIndex,
    expectedIndex,
    selectedAnswer: options[selectedIndex] || '',
    expectedAnswer: options[expectedIndex] || '',
  };
}

// -- Misconception Detection ---------------------------------------------------

export function detectMisconception(
  conceptId: string,
  selectedAnswer: string,
  expectedAnswer: string,
  questionContext: any,
): Misconception | null {
  const selected = selectedAnswer.toLowerCase();
  const expected = expectedAnswer.toLowerCase();
  
  // Place Value specific detection
  if (conceptId === 'digit-value') {
    // Check if student chose "ones" when the correct answer involves a higher place
    // This indicates digit-vs-value confusion (they picked the digit face value)
    const selectedIsOnes = selected.includes('ones') || selected.includes('one');
    const expectedIsOnes = expected.includes('ones') || expected.includes('one');
    
    if (selectedIsOnes && !expectedIsOnes) {
      return PLACE_VALUE_MISCONCEPTIONS.find(m => m.id === 'digit-not-value') || null;
    }
    
    // Check for position confusion (chose tens instead of hundreds, etc.)
    const places = ['ones', 'tens', 'hundreds', 'thousands'];
    const selectedPlace = places.find(p => selected.includes(p));
    const expectedPlace = places.find(p => expected.includes(p));
    
    if (selectedPlace && expectedPlace && selectedPlace !== expectedPlace) {
      return PLACE_VALUE_MISCONCEPTIONS.find(m => m.id === 'position-confusion') || null;
    }
  }

  if (conceptId === 'expanded-form') {
    // Check for zero-skip pattern
    const zeroPattern = /0/;
    if (zeroPattern.test(expected) && !zeroPattern.test(selected)) {
      return PLACE_VALUE_MISCONCEPTIONS.find(m => m.id === 'expanded-form-skip') || null;
    }
  }

  return null;
}

// -- Adaptive Activity Selection -----------------------------------------------

export function selectNextActivity(
  state: LearningState,
  conceptId: string,
  wasCorrect: boolean,
): AdaptiveDecision {
  const concept = state.concepts[conceptId];
  const misconception = concept?.lastEvidence?.misconceptionId;
  const remediationCount = state.remediationCount;

  // Struggling: provide remediation
  if (!wasCorrect && remediationCount < 3) {
    const misconceptionData = misconception
      ? PLACE_VALUE_MISCONCEPTIONS.find(m => m.id === misconception)
      : null;
    
    const remediationId = misconceptionData?.remediationActivities[0] 
      || 'place-value-chart-explorer';
    
    return {
      nextStep: createRemediationStep(remediationId, conceptId),
      reason: `Struggling with ${conceptId}. Providing targeted remediation.`,
      updatedState: { ...state, remediationCount: remediationCount + 1 },
    };
  }

  // Successful recovery: continue normal progression
  if (wasCorrect && remediationCount > 0) {
    return {
      nextStep: createStandardStep(conceptId, state.difficultyLevel),
      reason: `Successfully recovered from ${conceptId} struggle. Returning to normal path.`,
      updatedState: { ...state, remediationCount: 0 },
    };
  }

  // Normal progression
  return {
    nextStep: createStandardStep(conceptId, state.difficultyLevel),
    reason: `Progressing normally through ${conceptId}.`,
    updatedState: state,
  };
}

function createRemediationStep(activityId: string, conceptId: string): AdaptiveStep {
  const remediationContent: Record<string, any> = {
    'place-value-chart-explorer': {
      title: 'Place Value Chart Explorer',
      studentText: 'Let\'s explore place value more carefully. Look at the chart below.',
      interactionSpec: { type: 'tap_choice', prompt: 'Which column is the 7 in?' },
    },
    'digit-position-quiz': {
      title: 'Which Place Is It?',
      studentText: 'Let\'s practice identifying where digits live.',
      interactionSpec: { type: 'tap_choice', prompt: 'In 4,729, which place is the 7 in?' },
    },
    'expanded-form-builder': {
      title: 'Build the Expanded Form',
      studentText: 'Let\'s build the expanded form step by step. Remember to include zeros!',
      interactionSpec: { type: 'multi_activity', prompt: 'Write each place value' },
    },
    'number-line-hunt': {
      title: 'Find It on the Number Line',
      studentText: 'Let\'s visualize where this number sits.',
      interactionSpec: { type: 'tap_continue', prompt: 'Watch the marker' },
    },
    'zero-place-activity': {
      title: 'Don\'t Forget the Zeros!',
      studentText: 'Zero is a placeholder — it still counts in expanded form!',
      interactionSpec: { type: 'tap_choice', prompt: 'Which is correct?' },
    },
    'column-matching': {
      title: 'Match the Columns',
      studentText: 'Let\'s match each digit to its correct place.',
      interactionSpec: { type: 'tap_choice', prompt: 'Match them up' },
    },
  };

  const content = remediationContent[activityId] || remediationContent['place-value-chart-explorer'];

  return {
    id: activityId,
    type: 'remediation',
    title: content.title,
    conceptId,
    difficulty: 1,
    content: {
      stepType: 'learn',
      title: content.title,
      studentText: content.studentText,
      interactionSpec: content.interactionSpec,
      visualSpec: { type: 'place_value_chart', digits: ['4', '7', '2', '9'] },
    },
  };
}

function createStandardStep(conceptId: string, difficulty: number): AdaptiveStep {
  return {
    id: `${conceptId}-standard-${difficulty}`,
    type: 'activity',
    title: conceptId,
    conceptId,
    difficulty,
    content: {
      stepType: 'practice',
      title: `Practice: ${conceptId}`,
      studentText: 'Let\'s try another one.',
      interactionSpec: { type: 'multiple_choice' },
    },
  };
}
