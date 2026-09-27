/**
 * OllamaProvider — AIProvider implementation backed by a local Ollama server.
 *
 * Communicates with Ollama via the HTTP REST API using fetch (no SDK).
 * Configuration is environment-driven:
 *   AI_MODEL     — the model name (e.g., qwen2.5:7b-instruct-q4_K_M)
 *   AI_BASE_URL  — base URL of the Ollama API (default: http://localhost:11434)
 *   AI_TEMPERATURE — sampling temperature (default: 0.2)
 *   AI_TIMEOUT_MS  — request timeout in ms (default: 30000)
 *
 * The provider requests structured JSON output from the model and validates
 * the returned structure against the expected schema. Malformed responses
 * result in a safe fallback action (the orchestrator's validator will still
 * check whatever comes back).
 *
 * This provider is NEVER imported by client-side React components. All LLM
 * calls are made server-side through the AdaptiveOrchestrator.
 */

import type {
  AIProvider,
  AIContext,
  MisconceptionAnalysis,
  PedagogicalAction,
  PedagogicalActionKind,
} from '../AIProvider';
import type { Evidence } from '../../curriculum/adaptive-engine';
import {
  PLACE_VALUE_CONCEPTS,
  PLACE_VALUE_MISCONCEPTIONS,
} from '../../curriculum/adaptive-engine';

/** Check whether a concept ID is one of the known Place Value concepts. */
function isConceptKnown(conceptId: string): boolean {
  return PLACE_VALUE_CONCEPTS.some((c) => c.id === conceptId);
}

/** Check whether a misconception ID is one of the known Place Value misconceptions. */
function isMisconceptionKnown(misconceptionId: string): boolean {
  return PLACE_VALUE_MISCONCEPTIONS.some((m) => m.id === misconceptionId);
}

// ── Configuration ────────────────────────────────────────────────────────────

interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature: number;
  timeoutMs: number;
}

function loadConfig(): OllamaConfig {
  return {
    baseUrl: process.env.AI_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:11434',
    model: process.env.AI_MODEL ?? 'qwen2.5:7b-instruct-q4_K_M',
    temperature: parseFloat(process.env.AI_TEMPERATURE ?? '0.2'),
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? '30000', 10),
  };
}

// ── Prompt templates ─────────────────────────────────────────────────────────

/**
 * The list of concepts is sourced dynamically from the existing curriculum
 * (PLACE_VALUE_CONCEPTS), ensuring the AI only references known concepts.
 */
function conceptIdsList(): string {
  return PLACE_VALUE_CONCEPTS.map((c) => c.id).join(', ');
}

function misconceptionIdsList(): string {
  return PLACE_VALUE_MISCONCEPTIONS.map((m) => m.id).join(', ');
}

/** Fallback action types — used when context doesn't supply them. */
const FALLBACK_ACTION_TYPES: PedagogicalActionKind[] = [
  'explain', 'demonstrate', 'ask', 'provide_hint',
  'provide_example', 'remediate', 'targeted_practice',
  'increase_difficulty', 'revisit_prerequisite',
  'change_representation', 'check_mastery', 'move_forward',
];

/** Fallback representations — used when context doesn't supply them. */
const FALLBACK_REPRESENTATIONS = [
  'place_value_chart', 'number_line', 'grouped_objects',
  'digit_comparison', 'recap_checklist', 'step_reveal',
  'counters', 'fraction_model', 'shape_model',
];

/**
 * Build the system prompt, preferring representations/action types from
 * the AIContext (supplied by the orchestrator from curriculum constraints).
 * Falls back to static lists when context doesn't provide them.
 */
function buildSystemPrompt(context: AIContext): string {
  const actionTypes = context.allowedActionTypes ?? FALLBACK_ACTION_TYPES;
  const representations = context.allowedRepresentations ?? FALLBACK_REPRESENTATIONS;

  return `You are the AI tutoring engine for Arizen School, a gamified CBC-aligned
Kenyan homeschool platform. Your role is to INTERPRET learner evidence and PROPOSE
pedagogical actions — but you do NOT own curriculum progression. The application
validates every proposal against deterministic curriculum constraints.

Constraints:
- Only use these concept IDs: ${conceptIdsList()}
- Only use these action types: ${actionTypes.join(', ')}
- Only use these representations: ${representations.join(', ')}
- Only use these misconception IDs: ${misconceptionIdsList()}
- NEVER invent new concepts, actions, or representations.
- You can propose 'move_forward' to a concept only if it is the next in the
  prerequisite chain: read-numbers → digit-position → digit-value →
  expanded-form → compare-order.
- You can propose 'revisit_prerequisite' only to a concept that precedes
  the current one in the chain.

Always respond with valid JSON matching the requested schema.
Do not include any explanatory text outside the JSON object.`;
}

// ── The Provider ─────────────────────────────────────────────────────────────

export class OllamaProvider implements AIProvider {
  private readonly config: OllamaConfig;

  constructor(config?: Partial<OllamaConfig>) {
    this.config = { ...loadConfig(), ...config };
  }

  /**
   * Make a single request to the Ollama chat completion API.
   * Returns the raw parsed JSON object.
   */
  private async chat(messages: Array<{ role: string; content: string }>): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: false,
          options: { temperature: this.config.temperature },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as {
        message?: { content?: string };
        error?: string;
      };

      if (data.error) {
        throw new Error(`Ollama error: ${data.error}`);
      }

      const content = data.message?.content?.trim() ?? '';
      // Strip markdown code fences if the model wrapped output in ```json
      const cleaned = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');

      return JSON.parse(cleaned);
    } catch (error) {
      throw new Error(
        `OllamaProvider.request failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  // ─── AIProvider Implementation ──────────────────────────────────────────

  async analyzeLearnerEvidence(
    conceptId: string,
    evidence: Evidence[],
    context: AIContext
  ): Promise<MisconceptionAnalysis> {
    const systemPrompt = buildSystemPrompt(context);

    const evidenceSummary = evidence
      .map((e) => `- attempt ${e.attemptNumber ?? '?'}: answer="${e.answer ?? ''}" expected="${e.expectedAnswer}" correct=${e.correct}`)
      .join('\n');

    const userPrompt = `Analyze the following learner evidence for concept "${conceptId}":

Context:
- Question: ${context.prompt}
- Options: ${context.options.join(', ')}
- Student answer: ${context.selectedAnswer}
- Expected answer: ${context.expectedAnswer}

Evidence history (${evidence.length} records):
${evidenceSummary || '(no prior evidence)'}

Return JSON with exactly these fields:
{
  "misconceptionId": string | null,
  "confidence": number (0–1),
  "explanation": string,
  "evidenceStrength": "strong" | "weak"
}

If the evidence suggests a misconception, set misconceptionId to one of: ${misconceptionIdsList()}
If no misconception is detected, set misconceptionId to null.`;

    try {
      const result = (await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ])) as Partial<MisconceptionAnalysis>;

      // Validate response
      if (
        result.misconceptionId !== null &&
        typeof result.misconceptionId === 'string' &&
        !isMisconceptionKnown(result.misconceptionId)
      ) {
        // AI returned an unknown misconception — reject, use null
        return {
          misconceptionId: null,
          confidence: 0,
          explanation: `AI returned unknown misconception "${result.misconceptionId}" — rejected and reset to null.`,
          evidenceStrength: 'weak',
        };
      }

      return {
        misconceptionId: result.misconceptionId ?? null,
        confidence: Math.min(Math.max(result.confidence ?? 0, 0), 1),
        explanation: result.explanation ?? 'No explanation provided.',
        evidenceStrength: result.evidenceStrength === 'strong' ? 'strong' : 'weak',
      };
    } catch (error) {
      // Fallback: return neutral analysis
      return {
        misconceptionId: null,
        confidence: 0,
        explanation: `Ollama analysis failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        evidenceStrength: 'weak',
      };
    }
  }

  async diagnoseMisconception(context: AIContext): Promise<MisconceptionAnalysis> {
    const evidence: Evidence[] = [
      {
        conceptId: context.conceptId,
        correct: context.selectedAnswer === context.expectedAnswer,
        timestamp: Date.now(),
        activityId: context.lessonId,
        answer: context.selectedAnswer,
        expectedAnswer: context.expectedAnswer,
      },
    ];

    return this.analyzeLearnerEvidence(context.conceptId, evidence, context);
  }

  async selectNextAction(
    conceptId: string,
    evidence: Evidence[],
    context: AIContext,
    diagnosis: MisconceptionAnalysis | null
  ): Promise<PedagogicalAction> {
    const systemPrompt = buildSystemPrompt(context);
    const allowedActions = context.allowedActionTypes ?? FALLBACK_ACTION_TYPES;

    const evidenceSummary = evidence
      .map((e) => `- attempt ${e.attemptNumber ?? '?'}: correct=${e.correct}`)
      .join('\n');

    const diagnosisInfo = diagnosis
      ? `Misconception diagnosed: "${diagnosis.misconceptionId}" (confidence: ${diagnosis.confidence.toFixed(2)}, evidence strength: ${diagnosis.evidenceStrength}).\n${diagnosis.explanation}`
      : 'No misconception diagnosed.';

    const userPrompt = `Given the learner evidence for concept "${conceptId}", propose the next pedagogical action.

${diagnosisInfo}

Context:
- Question: ${context.prompt}
- Options: ${context.options.join(', ')}
- Student answer: ${context.selectedAnswer}
- Expected answer: ${context.expectedAnswer}
- Attempt number: ${context.attemptNumber ?? 1}

Evidence history (${evidence.length} records):
${evidenceSummary || '(no prior evidence)'}

The concept prerequisite chain is: ${context.conceptChain?.join(' → ') ?? 'not provided'}.

The diagnosis above MUST influence your action selection. If a misconception was diagnosed,
propose a remediation or explanation that targets that specific misconception. If no
misconception was diagnosed, propose a check_mastery, move_forward, or ask action based
on the evidence patterns.

Return JSON with exactly these fields:
{
  "actionType": one of [${allowedActions.join(', ')}],
  "conceptId": "${conceptId}",
  "reason": string,
  "confidence": number (0–1),
  // plus type-specific fields:
  // move_forward:      "nextConceptId"
  // remediate:         "misconceptionId", "representation", "escalated" (boolean)
  // change_representation: "representation"
  // revisit_prerequisite:  "prerequisiteConceptId", "targetConceptId"
  // check_mastery:     "threshold" (number 0–1)
  // targeted_practice: "prompt", "options" (array), "correctIndex" (number), "difficulty" (number)
  // ask:               "prompt", "options" (array)
  // explain:           "content"
  // demonstrate:       "representation"
  // provide_hint:      "hint", "strength" ("mild" | "strong")
  // provide_example:   "example"
  // increase_difficulty: (no extra fields)
}

Select an action that is within the permitted concept IDs and representations.
Do NOT invent concepts or representations outside the allowed lists.
The diagnosis MUST influence your recommendation — different diagnoses should
lead to different actions for the same evidence.`;

    try {
      const result = (await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ])) as Record<string, unknown>;

      // Validate action type against the allowed set (from context or fallback)
      const actionType = result.actionType as string;
      if (!allowedActions.includes(actionType as PedagogicalActionKind)) {
        return this.safeFallback(context, `Invalid action type: ${actionType}`);
      }

      // Validate conceptId
      if (!isConceptKnown(result.conceptId as string)) {
        return this.safeFallback(context, `Unknown concept: ${result.conceptId}`);
      }

      // Build the action with type-specific fields
      const fullAction: PedagogicalAction = this.buildAction(
        actionType as PedagogicalActionKind,
        result.conceptId as string,
        (result.reason as string) ?? '',
        Math.min(Math.max((result.confidence as number) ?? 0.5, 0), 1),
        result
      );
      return fullAction;
    } catch (error) {
      return this.safeFallback(context, `Ollama selectNextAction failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async generateExplanation(
    conceptId: string,
    context: AIContext
  ): Promise<string> {
    const result = await this.chat([
      {
        role: 'system',
        content: 'You are a helpful tutor. Provide clear, concise explanations.',
      },
      {
        role: 'user',
        content: `Explain the concept "${conceptId}" for a Kenyan Grade 4 student.
Context: ${context.prompt}`,
      },
    ]);

    const data = result as { explanation?: string; content?: string };
    return data.explanation ?? data.content ?? '';
  }

  async generateActivity(
    conceptId: string,
    difficulty: number,
    context: AIContext
  ): Promise<{ question: string; options: string[]; correctIndex: number }> {
    const result = await this.chat([
      {
        role: 'system',
        content: 'Generate a clear multiple-choice practice question with exactly 4 options.',
      },
      {
        role: 'user',
        content: `Generate a practice question for concept "${conceptId}" at difficulty level ${difficulty}.
Context: ${context.prompt}
Expected answer: ${context.expectedAnswer}

Return JSON: {"question": string, "options": [string, string, string, string], "correctIndex": number (0-3)}`,
      },
    ]);

    const data = result as { question?: string; options?: string[]; correctIndex?: number };

    if (
      !data.question ||
      !Array.isArray(data.options) ||
      data.options.length < 2 ||
      typeof data.correctIndex !== 'number'
    ) {
      // Fallback: simple echo question
      return {
        question: context.prompt,
        options: context.options.length >= 2 ? context.options : ['A', 'B', 'C', 'D'],
        correctIndex: 0,
      };
    }

    return {
      question: data.question,
      options: data.options,
      correctIndex: Math.min(Math.max(data.correctIndex, 0), data.options.length - 1),
    };
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  /** Build a PedagogicalAction from a parsed JSON object, dispatching by actionType. */
  private buildAction(
    actionType: PedagogicalActionKind,
    conceptId: string,
    reason: string,
    confidence: number,
    data: Record<string, unknown>
  ): PedagogicalAction {
    switch (actionType) {
      case 'explain':
        return { actionType: 'explain', conceptId, reason, confidence, content: (data.content as string) ?? '' };
      case 'demonstrate':
        return { actionType: 'demonstrate', conceptId, reason, confidence, representation: (data.representation as string) ?? 'place_value_chart', visualSpec: data.visualSpec as Record<string, unknown> | undefined };
      case 'ask':
        return { actionType: 'ask', conceptId, reason, confidence, prompt: (data.prompt as string) ?? '', options: (data.options as string[]) ?? [] };
      case 'provide_hint':
        return { actionType: 'provide_hint', conceptId, reason, confidence, hint: (data.hint as string) ?? '', strength: (data.strength as 'mild' | 'strong') ?? 'mild' };
      case 'provide_example':
        return { actionType: 'provide_example', conceptId, reason, confidence, example: (data.example as string) ?? '' };
      case 'remediate':
        return { actionType: 'remediate', conceptId, misconceptionId: (data.misconceptionId as string) ?? 'unknown', representation: (data.representation as string) ?? 'place_value_chart', escalated: Boolean(data.escalated), reason, confidence, visualSpec: data.visualSpec as Record<string, unknown> | undefined, interactionSpec: data.interactionSpec as Record<string, unknown> | undefined };
      case 'targeted_practice':
        return { actionType: 'targeted_practice', conceptId, prompt: (data.prompt as string) ?? '', options: (data.options as string[]) ?? [], correctIndex: (data.correctIndex as number) ?? 0, difficulty: (data.difficulty as number) ?? 1, reason, confidence };
      case 'increase_difficulty':
        return { actionType: 'increase_difficulty', conceptId, reason, confidence };
      case 'revisit_prerequisite':
        return { actionType: 'revisit_prerequisite', conceptId, prerequisiteConceptId: (data.prerequisiteConceptId as string) ?? '', targetConceptId: (data.targetConceptId as string) ?? conceptId, reason, confidence };
      case 'change_representation':
        return { actionType: 'change_representation', conceptId, representation: (data.representation as string) ?? 'place_value_chart', reason, confidence };
      case 'check_mastery':
        return { actionType: 'check_mastery', conceptId, threshold: (data.threshold as number) ?? 0.8, reason, confidence };
      case 'move_forward':
        return { actionType: 'move_forward', conceptId, nextConceptId: (data.nextConceptId as string) ?? conceptId, reason, confidence };
      default:
        return { actionType: 'ask', conceptId, prompt: '', options: ['A', 'B', 'C', 'D'], reason: `Unknown action type: ${actionType}`, confidence: 0.1 };
    }
  }

  /** Return a safe, validator-acceptable action when the AI response is unusable. */
  private safeFallback(context: AIContext, reason: string): PedagogicalAction {
    return {
      actionType: 'ask',
      conceptId: context.conceptId,
      prompt: context.prompt,
      options: context.options,
      reason: `Ollama fallback: ${reason}`,
      confidence: 0.5,
    };
  }
}
