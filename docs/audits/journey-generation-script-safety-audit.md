# Journey Generation Script Safety Audit

## Purpose

Classify all journey-generation scripts by safety level. Identify which scripts can write contaminated content to Supabase.

## Classification

### UNSAFE WRITE SCRIPTS

These scripts can write to Supabase and have been identified as contamination sources:

| Script | Issue | Evidence |
|--------|-------|----------|
| `journey-engine-v3.js` | **DEFAULT FALLBACK BUG**: Line 626 defaults to `'reading comprehension'` for any lesson that doesn't match English keywords. This is the root cause of the 27 contaminated Math lessons. | `return 'reading comprehension';` at line 626 |
| `generate-english-journeys.js` | English-only generator. If run against Math lessons, produces English content. Has "read a short passage" templates. | Line 483: `read a short passage` |
| `gen-english-theme.js` | English theme generator with reading comprehension templates. | Line 69: `read a short passage` |
| `gen-english-theme-v3.js` | English theme generator v3 with reading comprehension templates. | Line 419: `read a short passage` |
| `repair-all.js` | Contains exact contaminated phrases: "here is what you need to know. good readers think", "What do good readers do?" | Lines 23, 91 |
| `repair-final.js` | Same as repair-all.js — contains contaminated phrases | Lines 23, 115 |
| `repair-lessons.js` | Contains "What do good readers do?" template | Line 81 |
| `fix-reading-writing.js` | Has "read a short passage about ${theme}" template that gets applied generically | Line 23 |

### SAFE LOCAL GENERATION ONLY

These scripts generate journeys but write to local JSON files only:

| Script | Notes |
|--------|-------|
| `generate-math-journeys.js` | Uses `buildMathJourney` from `math-journey-generator.js`. The Math generator itself is clean (no English content), but the script writes to Supabase. **Needs subject guardrail.** |
| `math-journey-generator.js` | The actual Math journey builder. Clean — no English reading comprehension content. Uses Math-specific SVG templates. |

### SAFE READ-ONLY

| Script | Notes |
|--------|-------|
| `audit-grade-2-journey-contamination.js` | Read-only audit. No writes. |

### DEPRECATED / UNUSED

| Script | Notes |
|--------|-------|
| `journey-engine-v2.js` | Older version. Has similar reading comprehension detection but not the default fallback bug. |
| `generate-batch-1-journeys.js` | Batch generator. Unknown safety level — needs review. |
| `generate-batch-2-journeys.js` | Batch generator. Unknown safety level — needs review. |
| `generate-batch-3-journeys.js` | Batch generator. Unknown safety level — needs review. |

## Recommended Actions

### IMMEDIATE (before any generation)

1. **`journey-engine-v3.js`**: Add subject detection. If subject is Mathematics/Kiswahili/Environmental/Hygiene/Movement, do NOT default to 'reading comprehension'. Return the actual Math skill or 'unknown' — never English content.

2. **`repair-all.js`, `repair-final.js`, `repair-lessons.js`**: Move to `scripts/deprecated/`. These contain the exact contaminated phrases.

3. **`fix-reading-writing.js`**: Move to `scripts/deprecated/`. Only appropriate for English lessons.

### BEFORE NEXT GENERATION RUN

4. **All batch generators**: Add subject filter. Only generate for the intended subject.

5. **All generators**: Add validation gate — reject journeys that contain forbidden phrases for the subject.

6. **All generators**: Add dry-run mode. Default to local JSON output. Require explicit `--write` flag for Supabase.

### SAFE GENERATOR REQUIREMENTS

Any journey generator must:
- Detect subject from `ThemeSubject` table, NOT from title parsing
- Use subject-specific templates
- Validate output before writing
- Default to local JSON output
- Require `--confirm` flag for Supabase writes
- Create backup before any DB writes
