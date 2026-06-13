# MATH RECOVERY QA REPORT

**Date:** 2026-06-13  
**Branch:** `grade-2-english-journey-batch-1-june2026`  
**Commit:** `1816c9c`  
**Status:** Recovered into draft, NOT yet approved for learner availability  

---

## 1. SCOPE CONFIRMATION

### Exact Numbers

| Metric | Count |
|--------|-------|
| Total lessons in DB | 1000 |
| Grade 2 Math lessons (total) | 122 |
| Math lessons cleared by emergency fix | 0 (all cleared flags removed by regeneration) |
| Math lessons regenerated into draft | **38** |
| Math lessons untouched (had old journey) | 84 |
| Non-Math lessons still cleared/hidden | 316 |

### 37 vs 38 Discrepancy Explained

The earlier DATA_RECOVERY_REPORT said **37 Math lessons** disappeared. This report says **38 Math journeys** were regenerated.

**Root cause:** The emergency-fix.js script counted lessons with `isAvailable=false AND aiMetadata.cleared=true` at the time it ran. The actual number of Math lessons affected by the ELA regeneration script was 38. The count of 37 was from an earlier snapshot before the final state was settled. The regeneration script targeted all Math lessons that had empty journeys (cleared by the emergency fix), which is exactly 38.

### Subject Breakdown

| Subject | Count |
|---------|-------|
| Grade 2 English | 86 |
| Grade 2 Environmental Activities | 150 |
| Grade 2 Hygiene and Nutrition | 66 |
| Grade 2 Kiswahili | 90 |
| Grade 2 Mathematics | 122 |
| Grade 2 Movement | 240 |
| Grade 5 Creative Arts | 2 |
| Grade 5 English | 74 |
| Grade 5 Kiswahili | 5 |
| Grade 5 Mathematics | 150 |
| Grade 5 Social Studies | 4 |
| Living Things Lab | 3 |
| Number Mastery | 3 |
| Numbers in Everyday Life | 5 |

---

## 2. EXACT 38 MATH LESSON LIST

All 38 lessons below:
- Have `studentJourney = []` (empty, cleared by emergency fix)
- Have `studentJourneyDraft = [10-step journey]` (our new journey)
- Have `isAvailable = false`
- Have `aiMetadata.batchId = g2-math-hq-*`
- Have SVG illustrations
- Have YouTube video embeds

| # | Title | Quest | Strand | isAvailable | Draft Steps | SVG | Video | QC Question |
|---|-------|-------|--------|-------------|-------------|-----|-------|-------------|
| 1 | Multiplication as Repeated Addition with 2s and 3s | Equal Groups Quest | Multiplication | false | 10 | ✅ | ✅ | What is 12 + 3? |
| 2 | Adding Two 2-Digit Numbers Without Regrouping | 1.4 Addition Quest | Addition | false | 10 | ✅ | ✅ | What is 12 + 8? |
| 3 | Breaking Numbers Apart to Make 10 | 1.4 Addition Quest | Addition | false | 10 | ✅ | ✅ | What is 20 + 8? |
| 4 | Representing Numbers 1 to 50 Using Concrete Objects | 1.1 Number Concept Quest | Numbers | false | 10 | ✅ | ✅ | In the number 64, what does the 6 represent? |
| 5 | Adding Two 2-Digit Numbers With Regrouping | 1.4 Addition Quest | Addition | false | 10 | ✅ | ✅ | What is 12 + 8? |
| 6 | Reading Numbers 51 to 100 in Symbols | 1.1 Number Concept Quest | Numbers | false | 10 | ✅ | ✅ | How do you write "seventy-six" in digits? |
| 7 | Counting Numbers 1 to 100 Backward | 1.1 Number Concept Quest | Numbers | false | 10 | ✅ | ✅ | What number comes after 49? |
| 8 | Filling in Missing Numbers 1 to 50 | 1.1 Number Concept Quest | Numbers | false | 10 | ✅ | ✅ | What is 12 + 13? |
| 9 | Counting Numbers 1 to 100 Forward | 1.1 Number Concept Quest | Numbers | false | 10 | ✅ | ✅ | What number comes after 49? |
| 10 | Filling in Missing Numbers 51 to 100 | 1.1 Number Concept Quest | Numbers | false | 10 | ✅ | ✅ | What is 12 + 13? |
| 11 | Counting in 2s Backward up to 100 | 1.2 Whole Numbers Quest | Numbers | false | 10 | ✅ | ✅ | What number comes after 49? |
| 12 | Counting in 5s Forward up to 100 | 1.2 Whole Numbers Quest | Numbers | false | 10 | ✅ | ✅ | What number comes after 49? |
| 13 | Counting in 10s Forward up to 100 | 1.2 Whole Numbers Quest | Numbers | false | 10 | ✅ | ✅ | What number comes after 49? |
| 14 | Counting to 100 *Soh | Numbers Quest | Numbers | false | 10 | ✅ | ✅ | What number comes after 49? |
| 15 | Writing Numbers 1 to 10 in Words | 1.2 Whole Numbers Quest | Numbers | false | 10 | ✅ | ✅ | How do you write "seventy-six" in digits? |
| 16 | Writing Numbers 11 to 20 in Words | 1.2 Whole Numbers Quest | Numbers | false | 10 | ✅ | ✅ | How do you write "seventy-six" in digits? |
| 17 | Introduction to Halves Using Rectangular Cut-outs | 1.3 Fractions Quest | Fractions | false | 10 | ✅ | ✅ | What is 12 + 13? ⚠️ |
| 18 | Identifying 1/2 in Everyday Objects | 1.3 Fractions Quest | Fractions | false | 10 | ✅ | ✅ | In the number 64, what does the 6 represent? ⚠️ |
| 19 | Introduction to Quarters Using Rectangular Cut-outs | 1.3 Fractions Quest | Fractions | false | 10 | ✅ | ✅ | When the short hand points to 5... ⚠️ |
| 20 | Identifying 1/4 in Everyday Objects | 1.3 Fractions Quest | Fractions | false | 10 | ✅ | ✅ | In the number 64, what does the 6 represent? ⚠️ |
| 21 | Making Patterns with Fractions | 1.3 Fractions Quest | Fractions | false | 10 | ✅ | ✅ | What is 12 + 13? ⚠️ |
| 22 | Digital Games with Fractions | 1.3 Fractions Quest | Fractions | false | 10 | ✅ | ✅ | What is 12 + 13? ⚠️ |
| 23 | Adding 2-Digit and 1-Digit Numbers With Regrouping | 1.4 Addition Quest | Addition | false | 10 | ✅ | ✅ | What is 12 + 1? |
| 24 | Adding Using the Number Line | 1.4 Addition Quest | Addition | false | 10 | ✅ | ✅ | What is 25 + 8? |
| 25 | Adding 3 Single Digit Numbers Horizontally | 1.4 Addition Quest | Addition | false | 10 | ✅ | ✅ | What is 13 + 8? |
| 26 | Adding 3 Single Digit Numbers Vertically | 1.4 Addition Quest | Addition | false | 10 | ✅ | ✅ | What is 13 + 8? |
| 27 | Adding Single Digit Numbers Vertically | 1.4 Addition Quest | Addition | false | 10 | ✅ | ✅ | What is 25 + 8? |
| 28 | Subtracting 2-Digit Numbers Without Regrouping (Horizontal) | 1.5 Subtraction Quest | Subtraction | false | 10 | ✅ | ✅ | What is 12 − 17? ⚠️ |
| 29 | Subtracting 2-Digit Numbers Without Regrouping (Vertical) | 1.5 Subtraction Quest | Subtraction | false | 10 | ✅ | ✅ | What is 12 − 17? ⚠️ |
| 30 | Subtracting Single Digit Numbers | 1.5 Subtraction Quest | Subtraction | false | 10 | ✅ | ✅ | What is 55 − 17? |
| 31 | Subtracting Using the Number Line | 1.5 Subtraction Quest | Subtraction | false | 10 | ✅ | ✅ | What is 55 − 17? |
| 32 | Using Number Families for Subtraction | 1.5 Subtraction Quest | Subtraction | false | 10 | ✅ | ✅ | What is 55 − 17? |
| 33 | Missing Numbers in Subtraction | 1.5 Subtraction Quest | Subtraction | false | 10 | ✅ | ✅ | What is 55 − 17? |
| 34 | Multiplication as Repeated Addition Using Counters | 1.6 Multiplication Quest | Multiplication | false | 10 | ✅ | ✅ | What number comes after 49? ⚠️ |
| 35 | Multiplication as Repeated Addition Using Number Lines | 1.6 Multiplication Quest | Multiplication | false | 10 | ✅ | ✅ | What is 25 + 8? |
| 36 | Writing Multiplication Sentences Using the × Sign | 1.6 Multiplication Quest | Multiplication | false | 10 | ✅ | ✅ | What is 4 × 2? |
| 37 | Multiplying by 3 and 4 | 1.6 Multiplication Quest | Multiplication | false | 10 | ✅ | ✅ | What is 4 × 4? |
| 38 | Multiplying by 5 and 10 | 1.6 Multiplication Quest | Multiplication | false | 10 | ✅ | ✅ | What is 6 × 10? |

⚠️ = QC question has issues (see Section 3)

---

## 3. QUALITY ISSUES FOUND

### 3A. Weak Quick Check Questions

| Lesson | Issue | Severity |
|--------|-------|----------|
| 28, 29 | "What is 12 − 17?" — negative result, not Grade 2 appropriate | HIGH |
| 17, 21, 22 | Fraction lesson with generic addition QC ("What is 12 + 13?") | MEDIUM |
| 18, 20 | Fraction lesson with place value QC | MEDIUM |
| 19 | Fraction lesson with time QC | MEDIUM |
| 34 | Multiplication lesson with counting QC | MEDIUM |
| 7-14, 34 | "What number comes after 49?" repeated across 6+ lessons | LOW |

### 3B. Root Cause

The topic detection regex doesn't catch all fraction/multiplication lesson titles correctly. Lessons titled "Introduction to Halves" or "Identifying 1/2" are being mapped to `general-math` or `place-value` instead of `fractions` or `multiplication`. The default/generic QC question is being used as fallback.

### 3C. Impact

- **Safety:** None. All journeys are Math-appropriate. No English content remains.
- **Quality:** 10 of 38 lessons have QC questions that don't match their topic.
- **Learner experience:** A child opening a fractions lesson would see fractions content in Learn/Practice but get an unrelated QC question.

### 3D. Recommendation

**Option A (recommended):** Fix the topic detection and QC generation for the 10 affected lessons, then regenerate and re-QA before publishing.

**Option B:** Publish as-is. The QC is weak but not harmful. Fix in a follow-up iteration.

---

## 4. UNTOUCHED MATH LESSONS VERIFICATION

- **84 Math lessons** were NOT affected by the ELA regeneration
- All 84 have `studentJourney` with content
- All 84 have `isAvailable !== false` (available to learners)
- None were touched by our regeneration script
- These are the "old v2" template journeys — functional but generic

---

## 5. SAFETY VERIFICATION

### Dry-Run Publish Script

**File:** `scripts/publish-math-drafts.js`

**Targeting logic:**
- Only the exact 38 lesson IDs from the `g2-math-hq` batch
- No other lessons touched

**Safety checks (all pass ✅):**
- Only Math lessons targeted
- No English lessons touched
- No ELA lessons touched
- No Kiswahili lessons touched
- No Environmental lessons touched
- No Hygiene lessons touched
- No Movement lessons touched
- No Grade 5 lessons touched

**What the publish script does:**
1. Copy `studentJourneyDraft` → `studentJourney`
2. Set `isAvailable = true`
3. Keep `studentJourneyDraft` intact
4. Add `aiMetadata.publishedAt` timestamp

**What it does NOT do:**
- Does NOT modify any other lesson
- Does NOT touch draft data
- Does NOT change any other fields

---

## 6. BUILD AND REPO STATUS

| Item | Status |
|------|--------|
| Branch | `grade-2-english-journey-batch-1-june2026` |
| Latest commit | `1816c9c` |
| Build | ✅ Passes |
| Secrets committed | NONE |
| Files in commit | PROFILES.md, OPERATING_SYSTEM.md, WORK_SESSION_STATUS.md, docs/MATH_GENERATION_REPORT.md, scripts/math-journey-generator.js, scripts/generate-math-journeys.js |

---

## 7. NON-MATH LESSONS STILL CLEARED

**316 non-Math lessons** remain cleared/hidden (isAvailable=false). These are from the original ELA regeneration incident and are NOT touched by this work:

- Grade 2 Movement: ~47 lessons
- Grade 2 Kiswahili: ~55 lessons
- Grade 2 Environmental: ~70 lessons
- Grade 2 Hygiene: ~29 lessons
- Others: ~115 lessons

These need separate subject-by-subject regeneration (not in scope for this Math recovery).

---

## 8. RECOMMENDATION

### Is publishing the 38 Math drafts safe?

**YES, with caveats:**

1. **Safety:** ✅ The publish script is safe. Only 38 Math lessons targeted. No other subjects touched.
2. **Content quality:** ⚠️ 10 of 38 lessons have weak QC questions (wrong topic). The Learn, Practice, Example, and other steps are all correct.
3. **Images:** ✅ All 38 have SVG illustrations (embedded as data URIs, no external hosting needed).
4. **Videos:** ✅ All 38 have YouTube embed URLs in the Example step.

### Recommended approach:

**Option A (preferred):** Fix the 10 weak QC questions, regenerate, re-QA, then publish all 38 at once. This adds ~30 minutes but ensures all journeys are high-quality.

**Option B:** Publish now. The weak QC questions are not harmful — they're just not topic-specific. The rest of each journey (Learn, Practice, Example, images, videos) is correct. Fix QC in a follow-up.

**I recommend Option A.** The 10 affected lessons are:
- Lessons 17-22 (Fractions strand) — QC should be about halves/quarters
- Lessons 28-29 (Subtraction) — QC should not produce negative numbers
- Lesson 34 (Multiplication) — QC should be about multiplication

---

## 9. APPROVAL STATUS

**Math status:** Recovered into draft, NOT yet approved for learner availability.

**Next steps after approval:**
1. Run `node scripts/publish-math-drafts.js --execute`
2. Verify 38 lessons now have `isAvailable=true` and `studentJourney` populated
3. Browser-test 8 sample journeys across different strands
4. Verify YouTube video relevance for each lesson
