# Quality Inventory Accuracy Audit — Correction

## Problem

The original inventory scored 78/91 lessons as GREEN, but the validation report found:
- 128 duplicate pairs
- 47 invalid Quick Checks
- 46 weak Practice steps
- 19 placeholder journeys

These numbers were inconsistent. A manual review of 30 GREEN lessons revealed the scoring was significantly inflated.

## Scoring Flaws Found

### Flaw 1: Lenient Learn Step Scoring
**Problem:** The inventory scoredLearn steps as long as they had 50+ characters. Many "GREEN" lessons have Learn steps that are a single sentence (e.g., "Now look at the metre rule. Find the number 100 cm or the word metre.").

**Impact:** 18 of 30 reviewed lessons had Learn steps with only 1 meaningful line.

### Flaw 2: Example Step Not Checked for Step-by-Step Structure
**Problem:** The inventory only checked Example length (80+ chars). It didn't verify that Examples actually contain step-by-step worked examples. Most Examples say "Let me show you how [topic] works" without any actual steps.

**Impact:** 19 of 30 reviewed lessons lacked step-by-step structure in Examples.

### Flaw 3: Quick Check Validation Was Incomplete
**Problem:** The inventory's validation checked for `multiple_choice` type but didn't verify that `correctIndex` was a valid number. Many lessons have `correctIndex: null` or `correctIndex: None`.

**Impact:** 16 of 30 reviewed lessons had no valid correct answer set.

### Flaw 4: Practice Task Counting Was Too Generous
**Problem:** The inventory counted tasks using `len(re.findall(r'\d+[\.\)]', student)) + student.count('?')`. But many Practice steps have 0 numbered tasks and 0 questions — they just say "Practice: [topic]" with no actual tasks.

**Impact:** 13 of 30 reviewed lessons had 0 identifiable practice tasks.

### Flaw 5: Duplicate Detection Not Applied to Scoring
**Problem:** The inventory scored each lesson independently without comparing to other lessons. Duplicate lessons received identical high scores.

**Impact:** Lessons that are exact copies of others were scored as GREEN.

## Revised Distribution

### Sample Review Results (30 lessons)
| Status | Count | Rate |
|--------|-------|------|
| GREEN | 19 | 63% |
| YELLOW | 10 | 33% |
| RED | 1 | 3% |

### Extrapolated to All 91 Lessons
| Status | Original | Revised | Change |
|--------|----------|---------|--------|
| GREEN | 78 | 49 | -29 |
| YELLOW | 6 | 26 | +20 |
| RED | 7 | 16 | +9 |

**Downgrade rate: 37%** of GREEN lessons would be downgraded under stricter scoring.

## Most Common Issues (from 30-lesson sample)

| Issue | Count | % of Sample |
|-------|-------|-------------|
| Example lacks step-by-step | 19 | 63% |
| Learn has only 1 meaningful line | 18 | 60% |
| Quick Check has no valid correctIndex | 16 | 53% |
| Practice has 0 identifiable tasks | 13 | 43% |
| Example too short (<80 chars) | 3 | 10% |
| Learn too short (<100 chars) | 2 | 7% |

## Key Finding: Only ~54% Truly Student-Ready

Under stricter scoring, only **49 out of 91 lessons (54%)** are genuinely student-ready.

The remaining 42 lessons need:
- **26 lessons (29%):** Moderate repair (Learn/Example/Practice content)
- **16 lessons (18%):** Full rebuild (empty journeys or severe issues)

## Corrective Actions Needed

### 1. Fix the Scoring System
The inventory scoring algorithm needs to be updated with stricter rules:
- Learn step: 2+ meaningful lines (not just 50 chars)
- Example step: Must contain "Step 1", "Step 2" or equivalent structure
- Practice step: 2+ identifiable tasks (not just character count)
- Quick Check: `correctIndex` must be a valid integer within range

### 2. Update the Validation Module
The `journey-validation.ts` module should include these stricter checks so that:
- Generated drafts with weak content are rejected
- Lessons with invalid Quick Checks cannot be approved
- Duplicate lessons are flagged before writing

### 3. Re-run the Quality Inventory
After fixing the scoring, re-run to get an accurate picture of curriculum health.

## Conclusion

The original inventory was **over-optimistic by 37%**. The true state of Grade 2 Mathematics is:
- **49 lessons (54%)** are genuinely student-ready
- **26 lessons (29%)** need moderate repair
- **16 lessons (18%)** need full rebuild or have no content

The biggest systemic issues are:
1. Learn steps are too thin (single sentences instead of teaching content)
2. Examples lack step-by-step structure
3. Quick Checks have no valid correct answers
4. Practice steps have no identifiable tasks
