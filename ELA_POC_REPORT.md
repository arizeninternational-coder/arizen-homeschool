# ENGLISH LANGUAGE ACTIVITIES — Proof of Concept Report

## 3 PoC Journeys Generated

### Lesson 1: Responding to Questions
- **Strand**: 1.0 Listening
- **Skill detected**: listening skills ✅
- **Mission**: "Use appropriate non-verbal communication cues to indicate understanding of questions and instructions." ⚠️ Too complex
- **Think First**: "Who asks us questions?" ✅ (key inquiry)
- **QC**: Generic listening QC ⚠️ (same as all other lessons)

### Lesson 2: Words that Rhyme
- **Strand**: 1.0 Listening / 1.2 Word and Sentence Formation
- **Skill detected**: listening skills ⚠️ (should be vocabulary/phonetics)
- **Mission**: "Listen carefully to a story about everyday life and tell the main idea." ⚠️ Generic
- **Think First**: "Which words sound the same at the end?" ✅ (key inquiry)
- **QC**: Generic listening QC ⚠️ (identical to Lesson 1)

### Lesson 3: Following Simple Instructions
- **Strand**: 1.0 Listening / 1.1 Listen to Instructions and Questions
- **Skill detected**: listening skills ✅
- **Mission**: "Listen attentively to simple sequenced instructions." ⚠️ Still formal
- **Think First**: "Who gives us instructions?" ✅ (key inquiry)
- **QC**: Generic listening QC ⚠️ (identical to Lessons 1 & 2)

## Issues Found

### Critical: All 3 lessons produce identical journey content
Because:
1. Theme extraction returns `null` for ELA titles (no "Theme: Skill" pattern)
2. All map to "listening skills" skill type
3. Generic content is used when theme is null

### High: Mission text still uses raw curriculum language
The `buildChildFriendlyGoal` function doesn't simplify aggressively enough. "Use appropriate non-verbal communication cues..." should become something like "Listen to questions and show you understand."

### Medium: "Words that Rhyme" classified as listening
The strand "1.2 Word and Sentence Formation" doesn't contain "vocabulary" or "rhyme", so it falls through to listening. Need to add "rhyme" and "syllable" to vocabulary detection.

### Medium: ELA lessons lack theme differentiation
Without a theme, all ELA lessons with the same skill type produce identical content. Need to use the lesson title itself as the context/theme.

## Verdict: PoC DOES NOT PASS ❌

The journeys are structurally valid but:
1. Content is not differentiated across lessons
2. Mission text is not child-friendly enough
3. Skill detection misses vocabulary/phonetics lessons

## Required Fixes Before Full Regeneration

1. **Improve theme extraction for ELA**: Use the lesson title as the context when no theme prefix exists
2. **Add rhyme/syllable to vocabulary detection**: "Words that Rhyme" and "Syllables in Words" should be vocabulary skill
3. **Aggressive mission simplification**: Strip all formal curriculum language, use simple Grade 2 phrasing
4. **Differentiate practice/QC by lesson title**: Even within the same skill type, different lessons should have different examples and practice tasks
