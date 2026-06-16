# Grade 2 Mathematics — Final Audit Summary

**Date:** 2026-06-16
**Branch:** `grade-2-english-journey-batch-1-june2026`
**Database:** Supabase production (hgufndnqbvcukbxmwtvo.supabase.co)
**Mode:** READ ONLY — no changes made

---

## Key Numbers

| Metric | Count |
|--------|-------|
| **Total Grade 2 Math lessons** | **121** |
| Published & available (isAvailable=true) | 81 |
| Hidden/unavailable (isAvailable=false) | 37 |
| Both published AND draft | 2 |
| Has draft journey (draftSteps > 0) | 49 |
| Has published journey (publishedSteps > 0) | 84 |
| Recovery batch (g2-math-hq) | 37 |
| Old v2 journeys (pre-existing, published) | ~81 |

---

## Topic Breakdown (121 lessons)

| Topic | Count |
|-------|-------|
| Number Patterns & Counting | 20 |
| Measurement (length, mass, capacity, time, money) | 19 |
| Subtraction | 16 |
| Addition | 15 |
| Numbers (reading, writing, place value) | 14 |
| Multiplication | 10 |
| Fractions | 6 |
| Geometry & Patterns | 7 |
| Word Problems & Application | 8 |
| Number Concept | 6 |

---

## Journey Quality: 411 Defects Found

### By Severity

| Severity | Count | Top Issues |
|----------|-------|------------|
| **Critical** | 75 | missing_correctIndex (75) — QC has no correct answer set |
| **High** | 22 | malformed_mcq_options (3), wrong_step_count (1), qc_unrelated_to_topic (18) |
| **Medium** | 95 | missing_svg (95) — no SVG illustration |
| **Low** | 216 | title_copying (120), missing_video (91), generic_greeting (5) |

### Top 10 Defects

1. **title_copying** (120) — studentText contains the lesson title verbatim
2. **missing_svg** (95) — journey has no SVG illustration
3. **missing_video** (91) — journey has no video URL
4. **missing_correctIndex** (75) — Quick Check MCQ has no correct answer index
5. **qc_unrelated_to_topic** (18) — QC question doesn't match lesson topic
6. **malformed_mcq_options** (3) — MCQ has fewer than 2 options
7. **generic_greeting** (5) — "Welcome to today's lesson" type text
8. **wrong_step_count** (1) — journey doesn't have exactly 10 steps
9. **answer_leak** (0 found after fixes) — was present in earlier versions
10. **wrong_math_answer** (0 found after fixes) — was 3, now fixed

### By Journey Field

| Field | Defects | Notes |
|-------|---------|-------|
| studentJourney (published) | 311 | Old v2 journeys — many missing SVGs, videos, correctIndex |
| studentJourneyDraft | 97 | Recovery batch — mostly title_copying, some QC issues |

---

## Production Readiness

| Category | Ready | Needs Work | Blocked |
|----------|-------|------------|---------|
| Recovery batch (37) | ✅ QC fixed, ✅ admin preview works | ⚠️ Videos unverified | ❌ Needs source pack for regeneration |
| Old v2 published (81) | ✅ Available to students | ⚠️ 311 defects (missing SVGs, videos, QC issues) | ❌ Needs source pack for regeneration |
| **Overall** | **0 production-ready** | **37 partially ready** | **84 need regeneration** |

**Zero journeys are production-ready from a quality standpoint.** The 37 recovery batch drafts are structurally sound (10 steps, SVGs, correct QC answers) but need video verification and source-pack-guided refinement. The 81 old v2 published journeys have significant defects.

---

## Source Files

| File | Rows | Safe? | Notes |
|------|------|-------|-------|
| `curriculum-shells/grade-2/mathematics-source-extended.csv` | 156 | ✅ YES | KICD/CBC sourced, has outcomes, activities, inquiry questions, assessment hints, source references |
| `curriculum-shells/grade-2/mathematics-source-.csv` | 157 | ✅ YES | Similar to extended, slightly fewer columns |
| `curriculum-shells/grade-2/mathematics-import.csv` | 157 | ⚠️ Partial | Has outcomes and activities, no inquiry questions |
| `docs/kicd-lower-primary-volume-2.pdf` | 227 pages | ✅ YES | Official KICD document — source of truth |

**DB vs CSV:** The extended CSV has 156 rows covering all KICD Grade 2 Math sub-strands. The DB has 121 lessons. The CSV is the authoritative source — some CSV lessons may not be imported yet, and some DB lessons may have been generated with different titles.

---

## What Information We Need to Create Manually

### Critical (needed before any regeneration)

1. **Fractions** — Approved examples for halves and quarters. What real-life objects to use. What "equal parts" means to a Grade 2 child.
2. **Subtraction** — Rule: NO negative answers. Approved method (decomposition vs. number line). Common mistakes.
3. **Multiplication** — Approved equal-groups examples. Connection to repeated addition. Max factor (5 or 10?).
4. **Measurement** — Approved units (metres, litres, kilograms). Classroom object references. Non-standard vs. standard units.
5. **Time** — What's in Grade 2 (o'clock, half past only?). Clock-reading method.
6. **Money** — Kenyan shillings context. Coin/note denominations. Simple purchases.
7. **Videos** — Manual selection for ALL 121 lessons. Current videos are reused across unrelated topics.

### Important (needed for quality)

8. **Number Patterns** — Skip counting rules. Number line usage. Pattern types.
9. **Place Value** — Base-ten block diagrams. Tens/ones decomposition. Common errors (6 vs 60).
10. **Word Problems** — Kenyan context templates. Step-by-step solving method.
11. **Geometry** — Shape attributes. Line types. Sorting rules.
12. **Data Handling** — Pictograph reading. Simple tables.

### Nice to Have

13. **Child-friendly vocabulary** per topic
14. **Distractor rules** for MCQs per topic
15. **Visual guidance** — what illustrations to generate

---

## Recommended Correction Order

### Phase A: Source Pack Creation (manual, no code)
1. Create `source-packs/grade-2-mathematics/` directory structure
2. Write topic files for each of the 10-12 topics
3. Create lesson-map.json mapping all 121 lessons to topics
4. Select and approve videos for all lessons
5. Define validation rules (difficulty limits, QC templates, distractor rules)

### Phase B: Recovery Batch Refinement (37 lessons)
1. Regenerate 37 recovery batch lessons from source pack
2. Verify all QC answers mathematically correct
3. Verify all videos relevant
4. Browser-test all 10 steps
5. Publish to draft for Victor review

### Phase C: Old v2 Regeneration (81 lessons)
1. Regenerate all 81 old v2 lessons from source pack
2. Same verification as Phase B
3. Publish in batches by topic

### Phase D: Full Grade 2 Math Launch
1. All 121 lessons published
2. All verified
3. Source pack complete and versioned

---

## What Should NOT Be Touched Yet

- **81 old v2 published journeys** — they're live, don't break them until replacements are ready
- **Grade 5** — explicitly out of scope
- **Other subjects** (English, Kiswahili, etc.) — out of scope
- **publish-math-drafts.js --execute** — do NOT run until source pack is ready
- **Any mass regeneration** — without source pack, it will produce the same quality issues

---

## Audit Files Produced

| File | Description |
|------|-------------|
| `docs/audits/grade-2-math-full-inventory.csv` | All 121 lessons with full fields |
| `docs/audits/grade-2-math-full-inventory.json` | Same data in JSON |
| `docs/audits/grade-2-math-summary.md` | Summary with strand breakdown |
| `docs/audits/grade-2-math-topic-map.md` | Lessons grouped by topic |
| `docs/audits/grade-2-math-journey-defects.csv` | 411 defects with severity |
| `docs/audits/grade-2-math-video-audit.csv` | Video audit for all lessons |
| `docs/audits/grade-2-math-visual-audit.csv` | SVG/visual audit |
| `docs/audits/math-source-files-inventory.md` | Source files found |
| `docs/audits/math-db-vs-csv-comparison.md` | DB vs CSV comparison |
| `docs/audits/grade-2-math-source-pack-needs.md` | What info we need manually |
| `docs/audits/proposed-math-source-pack-structure.md` | Recommended source pack format |
