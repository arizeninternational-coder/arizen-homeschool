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

import type { AIProvider } from '../AIProvider';
import { MockAIProvider, type MockAIProviderOptions } from './mock';
import { OllamaProvider } from './ollama';

export type ProviderType = 'mock' | 'ollama';

export interface ProviderFactoryOptions {
  /** Override the AI_PROVIDER env var. */
  provider?: ProviderType;
  /** Override the AI_MODEL env var. */
  model?: string;
  /** Override the AI_BASE_URL env var. */
  baseUrl?: string;
}

/**
 * Create an AIProvider instance based on environment configuration.
 *
 * @throws if AI_PROVIDER is unset or an unknown provider type.
 */
export function createAIProvider(options?: ProviderFactoryOptions): AIProvider {
  const providerType = options?.provider ?? (process.env.AI_PROVIDER as ProviderType | undefined);

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
        baseUrl: options?.baseUrl,
        model: options?.model,
      });

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
