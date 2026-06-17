# Fractions Draft Journeys — QA Summary Report

**Date:** 2026-06-17
**Branch:** grade-2-english-journey-batch-1-june2026
**Scope:** 8 Grade 2 Fractions lessons — studentJourneyDraft write only

---

## Lessons Covered

| # | Lesson ID | Title | Status | SJ Steps | SJD Steps |
|---|-----------|-------|--------|----------|-----------|
| 1 | 9b887eb8-0a48-4f37-9689-b53113904728 | Introduction to Quarters Using Rectangular Cut-outs | PUBLISHED | 0 | 10 |
| 2 | 839653eb-cd5e-405b-a483-b6d307fee352 | Comparing Fractions: 1/2 and 1/4 | PUBLISHED | 10 | 10 |
| 3 | 159f92b9-69c7-45ea-8376-2b15af491360 | Identifying 1/2 in Everyday Objects | PUBLISHED | 0 | 10 |
| 4 | 60441bd5-774f-4135-9871-666fc481b13b | Identifying 1/4 in Everyday Objects | PUBLISHED | 0 | 10 |
| 5 | b163de06-c0e5-4a42-8bce-ba7dcab330a9 | Making Patterns with Fractions | PUBLISHED | 0 | 10 |
| 6 | dbadac3a-b59b-4f76-bebf-efda6fb3e261 | Digital Games with Fractions | PUBLISHED | 0 | 10 |
| 7 | c71a49c8-e9c6-41e5-b6ef-ad0aa386a59f | Fractions: Practice and Application | PUBLISHED | 10 | 10 |
| 8 | 2e1869d6-f5df-46a1-9d02-b4b53a1062fe | Fractions: Assessment and Reflection | PUBLISHED | 10 | 10 |

**Note:** POC lesson (0767b9f0) is NOT included — it was already written and untouched.

---

## Validation Results

### All 8 Lessons — PASS

| Check | Result |
|-------|--------|
| Exactly 10 steps | PASS (all 8) |
| Required fields present (stepType, title) | PASS (all 8) |
| No empty studentText/owlText | PASS (all 8) |
| No repeated generic greetings | PASS (all 8) |
| Quick Check has valid interaction | PASS (all 8) — interactions use `interaction.correctAnswer` + `interaction.correctIndex` |
| Answer key exists where needed | PASS (all 8) — answers in `interaction` object |
| Lesson-specific content matches title | PASS (all 8) |
| studentJourneyDraft changed (has content) | PASS (all 8) |
| studentJourney unchanged | PASS (all 8) — verified against backups |
| Status unchanged | PASS (all 8) — verified against backups |

---

## DB Fields Changed

| Field | Changed? | Notes |
|-------|----------|-------|
| `contentBlocks.studentJourneyDraft` | YES | Updated with 10-step generated journeys |
| `contentBlocks.studentJourney` | NO | Untouched |
| `status` | NO | All remain PUBLISHED (or DRAFT for POC) |
| `title` | NO | Untouched |
| `strand` | NO | Untouched |
| `sub_strand` | NO | Untouched |
| `isAvailable` | NO | Untouched |
| `orderIndex` | NO | Untouched |
| `xpReward` | NO | Untouched |
| `difficulty` | NO | Untouched |
| `estimatedDurationMinutes` | NO | Untouched |

---

## Browser Testing

**Status: SKIPPED** — Owner requested preview deployment for manual review.

---

## Content Quality Notes

### Quarters (9b887eb8)
- Teaches 1/4 concept correctly using rectangular cut-outs
- No thirds in teaching content
- QC answer key: Shape A (4 equal parts, 1 shaded)
- Scope: quarters only, no arithmetic ✓

### Comparing (839653eb)
- Visual recognition of 1/2 vs 1/4
- No greater-than/less-than comparison (out of scope)
- QC tests equal vs unequal parts
- Scope: halves and quarters only ✓

### Halves Real Life (159f92b9)
- Real-world objects (chapati, cake, fruit)
- Halves only (1/2), no quarters
- Everyday context ✓

### Quarters Real Life (60441bd5)
- Real-world objects (cake, pizza, chocolate)
- Quarters only (1/4), no halves
- Everyday context ✓

### Patterns (b163de06)
- Alternating 1/2, 1/4, 1/2, 1/4 patterns
- Continue-the-pattern activity
- Create-your-own-pattern practice
- No arithmetic ✓

### Digital Games (dbadac3a)
- Match fraction to shaded shape
- Interactive game format
- Halves and quarters identification only ✓

### Practice & Application (c71a49c8)
- Mixed practice: identify, shade, create
- Equal vs unequal parts
- Covers all fractions concepts learned ✓

### Assessment (2e1869d6)
- Comprehensive review questions
- Reflection prompt
- Covers halves, quarters, equal parts, fair sharing ✓

---

## Backups

All 8 lessons backed up before write:
- `backups/fractions-before-draft-write-9b887eb8.json`
- `backups/fractions-before-draft-write-839653eb.json`
- `backups/fractions-before-draft-write-159f92b9.json`
- `backups/fractions-before-draft-write-60441bd5.json`
- `backups/fractions-before-draft-write-b163de06.json`
- `backups/fractions-before-draft-write-dbadac3a.json`
- `backups/fractions-before-draft-write-c71a49c8.json`
- `backups/fractions-before-draft-write-2e1869d6.json`

---

## Remaining Risks Before Publishing

1. **Browser testing skipped** — Admin preview pages not visually verified. Recommend manual review of all 8 preview pages before publishing.
2. **No publish action tested** — The publish flow (copy draft → studentJourney) has not been tested.
3. **POC lesson (0767b9f0)** — Still DRAFT status with v1.0.2. Not included in this batch.
4. **6 remaining non-POC lessons** — These were previously written with stale content. Now overwritten with our generated journeys. The old content is in backups.
5. **No arithmetic validation** — Lessons are designed to avoid arithmetic, but the renderer should be verified to not introduce any.
6. **SVG illustrations** — Generated journeys reference SVG illustrations. Verify all render correctly in the player.
