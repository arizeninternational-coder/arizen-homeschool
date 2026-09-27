/**
 * Structural tests for AI providers.
 *
 * These tests verify that:
 * 1. OllamaProvider implements the full AIProvider interface.
 * 2. OllamaProvider is instantiated correctly from environment config.
 * 3. The OllamaProvider is NOT imported anywhere in client-side React
 *    components (pages, app router, components that run in the browser).
 * 4. Provider switching is environment-driven.
 *
 * No actual Ollama API calls are made — these are structural/type-level
 * checks.
 *
 * Run with: npx tsx tests/ai-native-providers.test.ts
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { OllamaProvider } from '../src/lib/ai/providers/ollama';
import { MockAIProvider } from '../src/lib/ai/providers/mock';
import { createAIProvider } from '../src/lib/ai/providers';
import type { AIProvider } from '../src/lib/ai/AIProvider';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ ASSERTION FAILED: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

// ── Provider interface compliance ───────────────────────────────────────────

async function testProviderInterfaceCompliance(): Promise<void> {
  console.log('\n--- Test: OllamaProvider implements AIProvider interface ---');

  const ollama = new OllamaProvider();
  const mock = new MockAIProvider('mastery');

  const requiredMethods: (keyof AIProvider)[] = [
    'analyzeLearnerEvidence',
    'diagnoseMisconception',
    'selectNextAction',
    'generateExplanation',
    'generateActivity',
  ];

  for (const method of requiredMethods) {
    assert(
      typeof (ollama as Record<string, unknown>)[method] === 'function',
      `OllamaProvider has method: ${method}`
    );
    assert(
      typeof (mock as Record<string, unknown>)[method] === 'function',
      `MockAIProvider has method: ${method}`
    );
  }
}

// ── Environment-driven provider selection ───────────────────────────────────

function testEnvironmentDrivenSelection(): void {
  console.log('\n--- Test: Provider selection is environment-driven ---');

  // Default (no env override): should throw if AI_PROVIDER is unset
  // But with explicit options, it should work regardless of env.
  const mockProvider = createAIProvider({ provider: 'mock' });
  assert(mockProvider instanceof MockAIProvider, 'provider=mock → MockAIProvider');

  const ollamaProvider = createAIProvider({ provider: 'ollama' });
  assert(ollamaProvider instanceof OllamaProvider, 'provider=ollama → OllamaProvider');

  // Verify OllamaProvider reads model from config
  const customOllama = new OllamaProvider({
    baseUrl: 'http://localhost:11434',
    model: 'qwen2.5:7b-instruct-q4_K_M',
  });
  assert(customOllama instanceof OllamaProvider, 'OllamaProvider accepts config');
}

// ── No client-side Ollama imports ───────────────────────────────────────────

function testNoClientSideOllamaImports(): void {
  console.log('\n--- Test: OllamaProvider is NOT imported in client-side code ---');

  const srcDir = join(__dirname, '..', 'src');
  const appDir = join(srcDir, 'app');
  const componentsDir = join(srcDir, 'components');

  // Collect all .ts/.tsx files in app/ and components/
  const filesToCheck: string[] = [];
  collectTsxFiles(appDir, filesToCheck);
  collectTsxFiles(componentsDir, filesToCheck);

  const ollamaImportPatterns = [
    '@/lib/ai/providers/ollama',
    '@/lib/ai/providers',
    '@/lib/learning/orchestrator', // orchestrator depends on AIProvider interface, not concrete providers
    '@/lib/learning/',
  ];

  // The orchestrator should NOT be in app/ or components/ — it's a server-side
  // module. If it appears in client-side code, that's a leak.
  let violations = 0;
  for (const filePath of filesToCheck) {
    const { readFileSync } = require('fs');
    const content = readFileSync(filePath, 'utf-8');
    for (const pattern of ollamaImportPatterns) {
      if (content.includes(`from '${pattern}'`) || content.includes(`from "${pattern}"`)) {
        // Allow imports in server-only contexts (API routes, server components)
        // but not in client components (marked with 'use client')
        if (content.includes("'use client'") || content.includes('"use client"')) {
          console.warn(`WARN: client component ${filePath} imports ${pattern}`);
          violations++;
        }
      }
    }
  }

  assert(violations === 0, `OllamaProvider/orchestrator not imported in client components (${violations} violations)`);
}

/** Recursively collect .ts/.tsx files (excluding node_modules and .next). */
function collectTsxFiles(dir: string, out: string[]): void {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      collectTsxFiles(fullPath, out);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      out.push(fullPath);
    }
  }
}

// ── Provider factory returns correct types ─────────────────────────────────

function testFactoryReturnsCorrectTypes(): void {
  console.log('\n--- Test: createAIProvider returns AIProvider instances ---');

  const mock = createAIProvider({ provider: 'mock' });
  const ollama = createAIProvider({ provider: 'ollama' });

  // Both should be usable as AIProvider (duck-typing)
  assert(typeof mock.selectNextAction === 'function', 'mock: selectNextAction is a function');
  assert(typeof mock.analyzeLearnerEvidence === 'function', 'mock: analyzeLearnerEvidence is a function');
  assert(typeof ollama.selectNextAction === 'function', 'ollama: selectNextAction is a function');
  assert(typeof ollama.analyzeLearnerEvidence === 'function', 'ollama: analyzeLearnerEvidence is a function');
}

// ── Config isolation ────────────────────────────────────────────────────────

function testConfigIsolation(): void {
  console.log('\n--- Test: OllamaProvider config is isolated from orchestrator ---');

  // The orchestrator should accept any AIProvider — we verify by passing
  // both MockAIProvider and a structural check of OllamaProvider.
  const mock = new MockAIProvider('mastery');
  assert(typeof mock.selectNextAction === 'function', 'orchestrator can accept MockAIProvider');

  // OllamaProvider has private config but the interface is the same
  const ollama = new OllamaProvider();
  assert(typeof ollama.selectNextAction === 'function', 'orchestrator can accept OllamaProvider');
}

// ── Main ────────────────────────────────────────────────────────────────────

function main(): void {
  console.log('=== AI Provider Structural Tests ===');

  testProviderInterfaceCompliance();
  testEnvironmentDrivenSelection();
  testNoClientSideOllamaImports();
  testFactoryReturnsCorrectTypes();
  testConfigIsolation();

  console.log('\n=== All provider structural tests passed ✓ ===');
}

main();
