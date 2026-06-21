# Grade 2 Journey Contamination — Root Cause Analysis

## Summary

27 Mathematics lessons are PUBLISHED with journeys that teach English reading comprehension instead of Mathematics. The contamination is systematic — all 27 lessons have nearly identical journey text, suggesting a single generator run applied English templates to Math lessons.

## Evidence

### The Contamination Pattern

Every contaminated Math lesson has this exact text in the journey:
- "today we will learn about reading comprehension together"
- "read a short passage"
- "good readers"
- "words say"
- "what did you learn about reading"

This is NOT a one-off error. The same English reading comprehension template was applied to 27 different Math lessons covering topics like:
- Reading Numbers 1 to 50 in Symbols
- Counting in 2s Forward up to 100
- Introduction to Halves Using Circular Cut-outs
- Relationship Between Addition and Subtraction
- Multiplying by 1 and 2

### Affected Lessons

All 27 contaminated lessons are:
- **Status**: PUBLISHED
- **Subject**: Mathematics
- **Journey source**: Both published AND draft are contaminated (same text in both)
- **Step count**: 10 steps each (full journey, not partial)

### Root Cause Hypothesis

The contamination likely came from one of these scripts:
1. `scripts/generate-math-journeys.js` — Math journey generator
2. `scripts/generate-english-journeys.js` — English journey generator (may have been run against Math lessons)
3. `scripts/generate-batch-*-journeys.js` — Batch generators

The fact that BOTH `studentJourney` and `studentJourneyDraft` contain the same contaminated text suggests:
- The generator wrote English content to both fields
- OR the draft was copied to published without review
- OR a single generation run populated both fields

### Additional Issues Found

Beyond the 27 contaminated Math lessons:
- **448 suspicious lessons** — mostly English lessons with generic fallback phrases ("here is what you need to know", "we use this every day")
- **314 structured lessons with no journey at all** — empty studentJourney and studentJourneyDraft
- **351 PUBLISHED lessons with empty studentJourney** — students see nothing
- **5 legacy format lessons** — old array format, no journey possible

### Generator Code Issues

Looking at the generation scripts:
1. **Subject detection likely uses title only** — if the title doesn't clearly indicate subject, the generator may default to English
2. **No subject-specific validation** — generators don't verify the journey matches the subject
3. **English fallback templates** — the English generator appears to have generic templates that get applied when subject detection fails
4. **Batch generation without per-lesson review** — journeys were generated in bulk without individual verification

### Recommended Fix Priority

1. **IMMEDIATE**: Hide/unpublish the 27 contaminated Math lessons (they're PUBLISHED and students can see them)
2. **HIGH**: Fix generator logic to prevent cross-subject contamination
3. **HIGH**: Add subject-specific validation before any journey generation
4. **MEDIUM**: Review and fix the 448 suspicious lessons (mostly generic content)
5. **MEDIUM**: Build subject-specific journey validators
