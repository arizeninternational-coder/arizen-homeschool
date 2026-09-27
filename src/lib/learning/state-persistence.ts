/**
 * State Persistence — Load/Save LearningState for the adaptive loop.
 *
 * Reconstructs LearningState from InteractionResponse records (already
 * persisted by the student page via /api/learner/responses). No new schema
 * migration is required — every student response is already stored.
 */

import { supabase } from '@/lib/supabase';
import {
  createInitialLearningState,
  recordEvidence,
  type LearningState,
  type Evidence,
} from '@/lib/curriculum/adaptive-engine';

interface InteractionResponseRow {
  activityId: string;
  conceptId: string | null;
  selectedAnswer: string;
  expectedAnswer: string;
  correct: boolean;
  misconceptionId: string | null;
  attemptNumber: number | null;
  remediationShown: string | null;
  timestamp: string;
}

/**
 * Load the learner's current LearningState by replaying their persisted
 * InteractionResponse records through recordEvidence().
 *
 * Returns a fresh initial state if no responses exist yet (never null).
 */
export async function loadLearningState(
  studentId: string,
  lessonId: string,
  conceptIds: string[],
): Promise<LearningState> {
  let state = createInitialLearningState(studentId, lessonId, conceptIds);

  const { data: rows, error } = await supabase
    .from('InteractionResponse')
    .select(
      'activityId,conceptId,selectedAnswer,expectedAnswer,correct,misconceptionId,attemptNumber,remediationShown,timestamp'
    )
    .eq('learnerId', studentId)
    .eq('lessonId', lessonId)
    .order('timestamp', { ascending: true })
    .limit(500);

  if (error || !rows || rows.length === 0) {
    return state;
  }

  let remediationCount = 0;

  for (const row of rows as InteractionResponseRow[]) {
    // Skip state-snapshot marker rows (activityId === '__adaptive_snapshot__')
    if (row.activityId === '__adaptive_snapshot__') continue;
    const evidence: Evidence = {
      conceptId: row.conceptId || '',
      correct: row.correct,
      timestamp: new Date(row.timestamp).getTime(),
      activityId: row.activityId,
      answer: row.selectedAnswer,
      expectedAnswer: row.expectedAnswer,
      misconceptionId: row.misconceptionId || undefined,
      attemptNumber: row.attemptNumber || 1,
      remediationShown: row.remediationShown || null,
    };
    state = recordEvidence(state, evidence);
    if (row.remediationShown) remediationCount++;
  }

  state.remediationCount = remediationCount;
  return state;
}

/**
 * Save a lightweight state snapshot for diagnostics.
 * Uses upsert on a special marker row — no schema migration needed.
 */
export async function saveLearningStateSnapshot(
  studentId: string,
  lessonId: string,
  state: LearningState,
): Promise<void> {
  const snapshot = {
    studentId,
    lessonId,
    concepts: Object.fromEntries(
      Object.entries(state.concepts).map(([id, c]) => [
        id,
        { level: c.level, attempts: c.attempts, correctAttempts: c.correctAttempts },
      ])
    ),
    remediationCount: state.remediationCount,
    difficultyLevel: state.difficultyLevel,
    savedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('InteractionResponse')
    .upsert(
      {
        learnerId: studentId,
        lessonId,
        activityId: '__adaptive_snapshot__',
        conceptId: null,
        selectedAnswer: JSON.stringify(snapshot),
        expectedAnswer: '',
        correct: false,
        misconceptionId: null,
        attemptNumber: 0,
        remediationShown: null,
      },
      { onConflict: 'learnerId,lessonId,activityId', ignoreDuplicates: false }
    );

  if (error) {
    console.error('[state-persistence] Failed to save snapshot:', error);
  }
}
