# GRADE 2 PROJECT SNAPSHOT — June 10, 2026

## 1. REPO STATE

- **Branch**: `grade-2-english-journey-batch-1-june2026`
- **Latest commit**: `b58ba02` (chore: final state before verification)
- **Uncommitted changes**: 
  - `HERMES_HANDOFF.md` (modified)
  - `src/app/dashboard/student/lessons/[themeSlug]/[questSlug]/[lessonSlug]/page.tsx` (modified)
  - `src/components/LessonJourneyViewer.tsx` (modified)
  - `DIAGNOSIS.md` (new)
  - `scripts/integrity-audit.js` (new)
  - `scripts/integrity-deep.js` (new)
  - `scripts/snapshot.js` (new)
- **All changes pushed**: Yes

## 2. BUILD STATUS

**TypeScript: FAILS** — 28 errors in our modified files:

| File | Error |
|------|-------|
| `lessons/.../page.tsx` | `lang` not found (lines 465,475,520,549,550,580) — useState declared at line 683 but JSX at line 465 is in a conditional return ABOVE the hook |
| `LessonJourneyViewer.tsx` | `step.subject` doesn't exist on JourneyStep type (line 424) |
| `LessonJourneyViewer.tsx` | `accent`, `softBg`, `iconBg` don't exist on STEP_THEME type |
| `LessonJourneyViewer.tsx` | `Trophy` not imported |
| `LessonJourneyViewer.tsx` | `reflectionOptions.length` possibly undefined |
| `parent/page.tsx` | `StatCardProps` type mismatch (4 instances) |
| `parent/page.tsx` | Parameter `n` implicitly `any` (line 156) |
| `parent/lessons/page.tsx` | `slug` property doesn't exist (2 instances) |

**Pre-existing errors** (not from our changes): `.next/types/` errors (18), `bcryptjs` declaration missing (2), `useEffect` not imported (1), `Request` vs `NextRequest` type mismatch (2).

**Next.js build**: Not tested since TypeScript fails.

## 3. LESSON DATA STATUS

### Counts by Subject (843 total, all PUBLISHED)

| Subject | Total | With Journey | Without |
|---------|-------|--------------|---------|
| 1.0 Listening | 12 | 12 | 0 |
| 2.0 Speaking | 10 | 10 | 0 |
| 3.0 Reading | 13 | 13 | 0 |
| 4.0 Writing | 13 | 13 | 0 |
| Alfabeti | 2 | 2 | 0 |
| Art and Craft (8 sub-strands) | 42 | 42 | 0 |
| Care for the environment | 25 | 25 | 0 |
| Environment and its resources | 75 | 75 | 0 |
| Foods | 18 | 18 | 0 |
| Foods and Safety Education | 4 | 4 | 0 |
| Geometry | 10 | 9 | 1 |
| Health Practices | 23 | 23 | 0 |
| Integrated English Practice | 15 | 15 | 0 |
| Kuandika | 8 | 8 | 0 |
| Kusikiliza na Kuzungumza | 13 | 13 | 0 |
| Kusoma | 15 | 15 | 0 |
| Listening and Speaking | 45 | 45 | 0 |
| **Measurement** | **40** | **2** | **38** |
| Movement: Basic Movement Skills | 75 | 75 | 0 |
| Movement: Gymnastics | 19 | 19 | 0 |
| Movement: Integrated Practice | 12 | 12 | 0 |
| Movement: Swimming | 44 | 44 | 0 |
| Msamiati | 16 | 16 | 0 |
| Music (3 sub-strands) | 33 | 33 | 0 |
| Number Concept | 1 | 0 | 1 |
| **Numbers** | **102** | **20** | **82** |
| Personal Hygiene | 12 | 12 | 0 |
| Reading | 15 | 15 | 0 |
| Safety Education | 9 | 9 | 0 |
| Sarufi | 16 | 16 | 0 |
| Sauti na Herufi | 11 | 11 | 0 |
| Social environment | 50 | 50 | 0 |
| Tathmini | 9 | 9 | 0 |
| Writing | 15 | 15 | 0 |
| **unknown** | **6** | **0** | **6** |
| **TOTAL** | **843** | **715** | **128** |

### Key Field Health
- `learningOutcome`: 837 populated, 6 missing
- `specificLearningOutcome`: 48 populated, **784 empty**, 11 missing
- `keyInquiryQuestion`: 832 populated, 11 missing
- `suggestedLearningExperience`: 832 populated, 11 missing
- `activityInstructions`: 837 populated, 6 missing
- `strand`: 837 populated, 6 missing
- `subStrand`: 837 populated, 6 missing

### Unknown/Other Lessons (6 records, all PUBLISHED, no journeys, no curriculum data)
1. `e0000001` — "Counting by Ones" (seed data)
2. `e0000002` — "Counting by Tens" (seed data)
3. `e0000003` — "Reading and Writing Numbers" (seed data)
4. `e0000004` — "Adding Within 20" (seed data)
5. `e0000005` — "Word Problems" (seed data)
6. `2f528f6b` — "Adding 2-Digit and 1-Digit Numbers With Regrouping" (no strand/subject)

### Published Without Journeys (128 total)
- **Numbers**: 82 lessons (all published, no journey)
- **Measurement**: 38 lessons (all published, no journey)
- **Geometry**: 1 lesson ("Drawing Straight Lines")
- **Number Concept**: 1 lesson ("Counting to 100 *Soh")
- **Unknown**: 6 lessons (seed data)

### Count Differences Explained
- **Math**: Earlier reports showed 6 missing, then 46. The correct number is **120** (82 Numbers + 38 Measurement). Earlier counts were sampling errors.
- **English**: The 90 "English" lessons are spread across 5 strand groupings (1.0-4.0 Listening/Speaking/Reading/Writing = 48, plus Listening and Speaking = 45, plus Integrated English Practice = 15, plus Reading = 15, plus Writing = 15). The 48 "English Language Activities" are a separate set under different strands (Sauti na Herufi, Alfabeti, Kusoma, Kuandika, etc.). These are NOT duplicates — they are different curricula.

## 4. RENDERER STATUS

### "Record Your Measurements" Source
- **NOT in journey JSON** (0 records contain this phrase)
- **Source**: Lesson player renderer at `src/app/dashboard/student/lessons/[themeSlug]/[questSlug]/[lessonSlug]/page.tsx` lines 461-462
- Also in `src/components/LessonJourneyViewer.tsx` lines 426-427
- This is a **hardcoded fallback** for ALL practice steps regardless of subject
- **Fix applied**: Replaced with dynamic `step.studentText` rendering (but fix has TS errors)
- **Fix compiles**: No — `lang` variable not in scope

### Hardcoded English Labels in Renderer
All found in `page.tsx`:
- "Start Mission" (line 78)
- "I'm Ready" (line 78)
- "Save My Guess" (line 78)
- "I Understand" (line 79)
- "Continue" (line 79)
- "Show Practice" (line 79)
- "Save Work" (line 80, changed from "Save Measurements")
- "Check Answer" (line 80)
- "Continue to Finish" (line 81)
- "Quick Check" (lines 475, 520)
- "Reflection Time" (line 549)
- "What did you learn today?" (line 550)
- "You did it! 🏆" (line 580)
- "Back to Quest" (lines 947, 1071)

**Localization map added** but not yet wired into all labels due to TS errors.

## 5. JOURNEY GENERATION STATUS

### Generators/Scripts That Exist
| Script | Status | Notes |
|--------|--------|-------|
| `scripts/repair-lessons.js` | Outdated | First repair pass, fixed ~100 lessons |
| `scripts/repair-all.js` | Outdated | Second pass, fixed 622 lessons |
| `scripts/repair-final.js` | Outdated | Third pass, fixed 619 lessons |
| `scripts/repair-final-v2.js` | Current | Fourth pass, uses comprehensive BAD_PATTERNS |
| `scripts/regression-audit.js` | Current | Audit tool |
| `scripts/integrity-audit.js` | Current | Field health check |
| `scripts/integrity-deep.js` | Current | Deep dive audit |
| `scripts/snapshot.js` | Current | Current state snapshot |

### Generator Quality
- All generators use hardcoded `if/else` chains based on title keywords
- None use `learningOutcome`, `keyInquiryQuestion`, or `suggestedLearningExperience`
- All produce generic "explore [topic] together" missions
- All produce "Where do you see [topic] at home or school?" connect steps
- All produce "Practice: Try [topic] at home" practice steps

### Journeys Regenerated This Session
- **623 journeys** were regenerated by `repair-final.js` (third pass)
- These replaced old contaminated journeys with slightly better but still generic content
- The regenerated journeys still have the "explore [topic] together" mission pattern

### Lesson Data Modified This Session
- **623 lesson records** had their `contentBlocks` field updated with new journeys
- No lesson titles, strands, or other metadata were modified

## 6. RISK LIST

### Critical (Blocks Progress)
1. **Broken build** — 28 TypeScript errors in modified files
2. **128 published lessons without journeys** — Numbers (82), Measurement (38), Geometry (1), Number Concept (1), Unknown (6)
3. **Renderer shows wrong content** — "Record your measurements" hardcoded for all practice steps
4. **No localization** — Kiswahili lessons show English UI labels

### High (Quality Issues)
5. **Generic journey content** — All 715 journeys with content use the same template pattern
6. **"Explore [topic] together" missions** — Not child-friendly
7. **Missing specificLearningOutcome** — 784 of 835 lessons lack this field
8. **379 lessons with raw objective titles** — Not child-friendly

### Medium (Data Integrity)
9. **6 unknown published lessons** — Seed data with no curriculum fields
10. **Duplicate subject naming** — "English" vs "English Language Activities" confusing
11. **Old contaminated journeys** — 623 journeys were "repaired" but still generic

## 7. RECOMMENDED NEXT 3 ACTIONS

### Action 1: Fix Build Errors (Do First)
Fix the 28 TypeScript errors in `page.tsx` and `LessonJourneyViewer.tsx`:
- Move `lang` useState before first return statement
- Fix `step.subject` type error in LessonJourneyViewer
- Fix STEP_THEME type mismatches
- Add missing `Trophy` import
- Fix `StatCardProps` type in parent dashboard
- Fix `slug` property in parent lessons page

### Action 2: Unpublish Incomplete Records
- Unpublish 6 unknown/seed lessons
- Unpublish 128 published lessons without journeys (or generate placeholder journeys)

### Action 3: Design New Journey Architecture (No Code Yet)
Based on the audit, design a data-driven architecture that:
- Uses `learningOutcome` for mission
- Uses `keyInquiryQuestion` for think_first
- Uses `suggestedLearningExperience` for practice
- Uses `activityInstructions` for example
- Has subject-specific adapters (Math, English, Kiswahili, Environmental, Hygiene, Movement)
- Has a validation layer
- Produces child-friendly titles

**Do NOT generate any journeys until the architecture is approved.**
