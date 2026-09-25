/**
 * Step-to-concept mappings for adaptive learning.
 * 
 * Each scored activity maps to a concept and misconception detection logic.
 * This extends the existing adaptive architecture to all 6 scored activities.
 */

export interface StepConceptMapping {
  stepId: string;           // Journey step ID (e.g., 'think_first', 'connect', 'p1', 'p2', 'p3', 'quick_check')
  conceptId: string;        // Concept being assessed
  expectedAnswer: string;   // The correct answer
  misconceptionCheck: (selected: string, expected: string) => string | null;
}

export const STEP_CONCEPT_MAPPINGS: StepConceptMapping[] = [
  {
    stepId: 'think_first',
    conceptId: 'digit-value',
    expectedAnswer: '7 hundreds',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      const exp = expected.toLowerCase();
      if (sel.includes('ones') && !exp.includes('ones')) return 'digit-not-value';
      if (sel.includes('7') && !sel.includes('hundreds') && !sel.includes('tens') && !sel.includes('thousands')) return 'digit-not-value';
      const places = ['ones', 'tens', 'hundreds', 'thousands'];
      const selPlace = places.find(p => sel.includes(p));
      const expPlace = places.find(p => exp.includes(p));
      if (selPlace && expPlace && selPlace !== expPlace) return 'position-confusion';
      return null;
    },
  },
  {
    stepId: 'connect',
    conceptId: 'digit-value',
    expectedAnswer: '3,000 people',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      const exp = expected.toLowerCase();
      if (sel.includes('3 people') || sel.includes('30 people') || sel.includes('300 people')) return 'digit-not-value';
      const places = ['ones', 'tens', 'hundreds', 'thousands'];
      const selPlace = places.find(p => sel.includes(p));
      const expPlace = places.find(p => exp.includes(p));
      if (selPlace && expPlace && selPlace !== expPlace) return 'position-confusion';
      return null;
    },
  },
  {
    stepId: 'p1',
    conceptId: 'expanded-form',
    expectedAnswer: '2,538',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      const exp = expected.toLowerCase();
      // Confused thousands with hundreds
      if (sel.includes('5,238')) return 'position-confusion';
      // Reversed digits
      if (sel.includes('2,358') || sel.includes('2,583')) return 'left-right-reverse';
      return null;
    },
  },
  {
    stepId: 'p2',
    conceptId: 'expanded-form',
    expectedAnswer: '1,547',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      const exp = expected.toLowerCase();
      // Added incorrectly (1,247 = forgot to add 300)
      if (sel.includes('1,247')) return 'expanded-form-skip';
      // Wrong addition (1,347)
      if (sel.includes('1,347')) return 'expanded-form-skip';
      return null;
    },
  },
  {
    stepId: 'p3',
    conceptId: 'compare-order',
    expectedAnswer: '5,621',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      // Chose the smaller number
      if (sel.includes('5,261')) return 'comparison-reverse';
      // Said they're equal
      if (sel.includes('equal')) return 'comparison-equal';
      return null;
    },
  },
  {
    stepId: 'quick_check',
    conceptId: 'read-numbers',
    expectedAnswer: '3,042',
    misconceptionCheck: (selected, expected) => {
      if (selected.toLowerCase() !== expected.toLowerCase()) return 'read-numbers';
      return null;
    },
  },
];

export function getStepConceptMapping(stepId: string): StepConceptMapping | undefined {
  return STEP_CONCEPT_MAPPINGS.find(m => m.stepId === stepId);
}

export function getAllScoredStepIds(): string[] {
  return STEP_CONCEPT_MAPPINGS.map(m => m.stepId);
}
