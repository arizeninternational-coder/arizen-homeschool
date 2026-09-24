/**
 * Scoring configuration for Arizen lessons.
 * 
 * Defines which activities are scored vs instructional/practice.
 * This is the source of truth for lesson assessment.
 */

export interface ScoringConfig {
  /** Step types that count toward the final score */
  scoredStepTypes: string[];
  /** Step types that are practice/remediation (not scored) */
  practiceStepTypes: string[];
  /** Step types that are reflection/journal (not scored) */
  reflectionStepTypes: string[];
  /** Maximum score per activity (for partial credit) */
  maxScorePerActivity: number;
  /** Whether to count retries as separate attempts */
  countRetries: boolean;
  /** Whether to count remediation attempts */
  countRemediation: boolean;
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  scoredStepTypes: ['think_first', 'connect', 'quick_check'],
  practiceStepTypes: ['practice'],
  reflectionStepTypes: ['reflect', 'journal', 'welcome', 'mission', 'learn', 'example'],
  maxScorePerActivity: 1,
  countRetries: false,
  countRemediation: false,
};

/**
 * Determines if a step should be scored based on its type and interaction spec.
 */
export function isScoredStep(step: any, config: ScoringConfig = DEFAULT_SCORING_CONFIG): boolean {
  if (!step) return false;
  
  // Check step type
  if (config.scoredStepTypes.includes(step.stepType)) {
    // Must have a defined correct answer
    const hasCorrectAnswer = step.interactionSpec?.correctChoiceId ||
                             step.interactionSpec?.correctIndex != null ||
                             step.interactionSpec?.correctAnswer;
    return !!hasCorrectAnswer;
  }
  
  // Practice activities with choices are scored individually
  if (step.stepType === 'practice' && step.interactionSpec?.activities) {
    return true; // Practice activities are scored individually
  }
  
  return false;
}

/**
 * Gets all scored activities from a lesson journey.
 * Returns flat list of { activityId, stepType, prompt, correctAnswer, correctChoiceId, correctIndex }
 */
export function getScoredActivities(journeySteps: any[], config: ScoringConfig = DEFAULT_SCORING_CONFIG): Array<{
  activityId: string;
  stepType: string;
  prompt: string;
  correctAnswer: string;
  correctChoiceId?: string;
  correctIndex?: number;
  choices: string[];
}> {
  const activities: Array<any> = [];
  
  for (const step of journeySteps) {
    if (!step.interactionSpec) continue;
    
    // Handle multi-activity steps (like practice)
    if (step.stepType === 'practice' && step.interactionSpec.activities) {
      for (const activity of step.interactionSpec.activities) {
        const choices = activity.choices?.map((c: any) => typeof c === 'string' ? c : c.label) ||
                       activity.options || [];
        let correctAnswer = '';
        if (activity.correctChoiceId && activity.choices) {
          const correctChoice = activity.choices.find((c: any) => {
            const id = typeof c === 'object' ? c.id : String(activity.choices.indexOf(c));
            return id === activity.correctChoiceId;
          });
          correctAnswer = correctChoice ? (typeof correctChoice === 'string' ? correctChoice : correctChoice.label) : '';
        } else if (activity.correctIndex != null && activity.options) {
          correctAnswer = activity.options[activity.correctIndex] || '';
        }
        
        activities.push({
          activityId: activity.id,
          stepType: step.stepType,
          prompt: activity.prompt || activity.question || '',
          correctAnswer,
          correctChoiceId: activity.correctChoiceId,
          correctIndex: activity.correctIndex,
          choices,
        });
      }
      continue;
    }
    
    // Handle single-choice steps
    if (config.scoredStepTypes.includes(step.stepType)) {
      const choices = step.interactionSpec.choices?.map((c: any) => typeof c === 'string' ? c : c.label) ||
                     step.interactionSpec.options || [];
      let correctAnswer = '';
      if (step.interactionSpec.correctChoiceId && step.interactionSpec.choices) {
        const correctChoice = step.interactionSpec.choices.find((c: any) => {
          const id = typeof c === 'object' ? c.id : String(choices.indexOf(c));
          return id === step.interactionSpec.correctChoiceId;
        });
        correctAnswer = correctChoice ? (typeof correctChoice === 'string' ? correctChoice : correctChoice.label) : '';
      } else if (step.interactionSpec.correctIndex != null && step.interactionSpec.options) {
        correctAnswer = step.interactionSpec.options[step.interactionSpec.correctIndex] || '';
      }
      
      activities.push({
        activityId: step.id,
        stepType: step.stepType,
        prompt: step.interactionSpec.prompt || step.interactionSpec.question || '',
        correctAnswer,
        correctChoiceId: step.interactionSpec.correctChoiceId,
        correctIndex: step.interactionSpec.correctIndex,
        choices,
      });
    }
  }
  
  return activities;
}

/**
 * Calculates final score from persisted responses and scored activities.
 */
export function calculateLessonScore(
  responses: Array<{ activityId: string; selectedAnswer: string; correct: boolean }>,
  scoredActivities: Array<{ activityId: string; correctAnswer: string }>,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): { correct: number; total: number; percentage: number } {
  const total = scoredActivities.length;
  
  // For each scored activity, find the latest non-retry response
  const activityScores: Record<string, boolean> = {};
  
  for (const response of responses) {
    const activity = scoredActivities.find(a => a.activityId === response.activityId);
    if (!activity) continue;
    
    // If we already have a score for this activity and countRetries is false, skip
    if (activityScores[response.activityId] !== undefined && !config.countRetries) {
      // Keep the first correct answer, or the latest if retries not counted
      if (activityScores[response.activityId] === true) continue;
    }
    
    activityScores[response.activityId] = response.correct;
  }
  
  const correct = Object.values(activityScores).filter(Boolean).length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  return { correct, total, percentage };
}
