/**
 * Detect "order these numbers" questions and turn them into cards.
 *
 * The adaptive configs express ordering as four multiple-choice strings:
 *
 *   prompt:  "Order these numbers from SMALLEST to LARGEST: 345, 521, 298, 476"
 *   choices: ["298, 345, 476, 521", "345, 298, 476, 521", ...]
 *   correctAnswer: "298, 345, 476, 521"
 *
 * Choosing between four pre-sorted lists is a recognition task — the learner can
 * pattern-match the first number instead of thinking about place value. This
 * module recovers the underlying task (sort these four numbers) so the UI can
 * offer cards to arrange.
 *
 * The answer string produced by the card UI is byte-identical in shape to the
 * existing `correctAnswer`, so scoring, misconception detection and the tutor
 * loop keep working without modification.
 */

export type OrderDirection = 'asc' | 'desc';

export interface OrderingQuestion {
  /** The values to sort, in the order they appeared in the prompt (already scrambled). */
  numbers: number[];
  /** asc = smallest first, desc = largest first. */
  direction: OrderDirection;
  /** Canonical answer string, e.g. "298, 345, 476, 521". */
  answer: string;
}

/** Format an array of numbers the way the curriculum configs do. */
export function formatOrder(numbers: number[]): string {
  return numbers.join(', ');
}

/**
 * Parse an ordering prompt. Returns null for anything that is not clearly one,
 * so callers can fall back to the existing multiple-choice UI.
 */
export function parseOrderingQuestion(prompt?: string | null): OrderingQuestion | null {
  if (!prompt) return null;

  const text = String(prompt);
  if (!/\border\b/i.test(text)) return null;

  const ascending = /\bsmallest\b[\s\S]{0,40}?\blargest\b/i.test(text);
  const descending = /\blargest\b[\s\S]{0,40}?\bsmallest\b/i.test(text);
  if (!ascending && !descending) return null;

  // The values follow the prompt's colon, e.g. "… LARGEST: 345, 521, 298, 476".
  const tail = text.includes(':') ? text.slice(text.lastIndexOf(':') + 1) : text;
  const groups = tail.match(/\d[\d,]*/g) || [];
  const numbers = groups
    .map((g) => Number(g.replace(/,/g, '')))
    .filter((n) => Number.isFinite(n));

  if (numbers.length < 3 || numbers.length > 6) return null;

  // A degenerate prompt where every value repeats is not a sortable task.
  if (new Set(numbers).size < 2) return null;

  const direction: OrderDirection = descending ? 'desc' : 'asc';
  const sorted = [...numbers].sort((a, b) => (direction === 'asc' ? a - b : b - a));

  return { numbers, direction, answer: formatOrder(sorted) };
}

/** Does this learner-side answer string represent a correct ordering? */
export function isCorrectOrder(
  arranged: string,
  expected: string
): boolean {
  const norm = (s: string) =>
    (s || '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .join(',');
  return norm(arranged) === norm(expected);
}
