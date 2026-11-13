/**
 * Provider Factory — Selects an AIProvider from environment configuration.
 *
 * Configuration (environment variables):
 *   AI_PROVIDER  — 'mock' | 'ollama'  (required; determines which provider to instantiate)
 *   AI_MODEL     — model name passed to the provider (e.g., Qwen3 7B Q4_K_M)
 *   AI_BASE_URL  — base URL for HTTP providers (e.g., http://localhost:11434)
 *   AI_TEMPERATURE — sampling temperature (default: 0.2)
 *   AI_TIMEOUT_MS  — request timeout in ms (default: 30000)
 *
 * Usage:
 *   import { createAIProvider } from '@/lib/ai/providers';
 *   const provider = createAIProvider();  // reads env at call time
 *
 * The AdaptiveOrchestrator depends on the AIProvider interface, NOT on any
 * concrete provider. This factory is the only place that knows about concrete
 * providers.
 */

import type {
  AIProvider,
  AIContext,
  MisconceptionAnalysis,
  PedagogicalAction,
  TutoringRequest,
  TutoringTurn,
} from '../AIProvider';
import { MockAIProvider, type MockAIProviderOptions } from './mock';
import { OllamaProvider } from './ollama';

export type ProviderType = 'mock' | 'ollama' | 'unavailable';

/** The intended local model: Qwen3 7B Q4_K_M served by Ollama. */
export const DEFAULT_LOCAL_MODEL = 'qwen3:7b-q4_K_M';
export const DEFAULT_LOCAL_BASE_URL = 'http://localhost:11434';

export interface ProviderFactoryOptions {
  /** Override the AI_PROVIDER env var. */
  provider?: ProviderType;
  /** Override the AI_MODEL env var. */
  model?: string;
  /** Override the AI_BASE_URL env var. */
  baseUrl?: string;
}

/**
 * A provider that reports itself unavailable.
 *
 * Used when AI_PROVIDER is not configured. Production must never silently run
 * with an undefined provider: this makes the missing configuration explicit and
 * lets the application degrade to a clearly-labelled deterministic scaffold
 * instead of throwing a 500 mid-lesson.
 */
export class UnavailableAIProvider implements AIProvider {
  constructor(private readonly reason: string) {}

  async isAvailable() {
    return { available: false, reason: this.reason };
  }

  async analyzeLearnerEvidence(): Promise<MisconceptionAnalysis> {
    return {
      misconceptionId: null,
      confidence: 0,
      explanation: `AI provider unavailable: ${this.reason}`,
      evidenceStrength: 'weak',
    };
  }

  async diagnoseMisconception(): Promise<MisconceptionAnalysis> {
    return this.analyzeLearnerEvidence();
  }

  async selectNextAction(
    conceptId: string,
    _e: unknown,
    context: AIContext,
  ): Promise<PedagogicalAction> {
    return {
      actionType: 'ask',
      conceptId,
      prompt: context.prompt,
      options: context.options.length >= 2 ? context.options : ['A', 'B', 'C', 'D'],
      reason: `AI provider unavailable: ${this.reason}`,
      confidence: 0,
    };
  }

  async generateExplanation() {
    return '';
  }

  async generateActivity(_c: string, _d: number, context: AIContext) {
    return {
      question: context.prompt,
      options: context.options.length >= 2 ? context.options : ['A', 'B', 'C', 'D'],
      correctIndex: 0,
    };
  }

  async generateTutoringTurn(request: TutoringRequest): Promise<TutoringTurn> {
    throw new Error(`AI provider unavailable: ${this.reason}`);
  }
}

/**
 * Create an AIProvider instance based on environment configuration.
 *
 * When AI_PROVIDER is unset this returns an UnavailableAIProvider rather than
 * throwing, so a missing configuration degrades visibly instead of breaking a
 * lesson. An explicitly unknown value still throws — that is a real mistake.
 */
export function createAIProvider(options?: ProviderFactoryOptions): AIProvider {
  const providerType = options?.provider ?? (process.env.AI_PROVIDER as ProviderType | undefined);

  if (!providerType) {
    return new UnavailableAIProvider(
      'AI_PROVIDER is not set. Configure AI_PROVIDER=ollama with AI_MODEL and AI_BASE_URL, ' +
        'or AI_PROVIDER=mock for deterministic tests only.',
    );
  }

  switch (providerType) {
    case 'mock': {
      const mockOpts: MockAIProviderOptions = {
        scenario: (process.env.AI_MOCK_SCENARIO as MockAIProviderOptions['scenario']) ?? 'mastery',
        misconceptionId: process.env.AI_MOCK_MISCONCEPTION ?? undefined,
        nextConceptId: process.env.AI_MOCK_NEXT_CONCEPT ?? undefined,
      };
      return new MockAIProvider(mockOpts);
    }

    case 'ollama':
      return new OllamaProvider({
        baseUrl: options?.baseUrl ?? process.env.AI_BASE_URL ?? DEFAULT_LOCAL_BASE_URL,
        model: options?.model ?? process.env.AI_MODEL ?? DEFAULT_LOCAL_MODEL,
      });

    case 'unavailable':
      return new UnavailableAIProvider('Explicitly configured as unavailable.');

    default:
      throw new Error(
        `Unknown AI_PROVIDER "${providerType}". ` +
        `Set AI_PROVIDER to 'mock' or 'ollama'.`
      );
  }
}

// Re-export for convenience
export { MockAIProvider } from './mock';
export { OllamaProvider } from './ollama';
export type { MockAIProviderOptions, MockScenario } from './mock';
