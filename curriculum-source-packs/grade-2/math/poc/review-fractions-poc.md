# Fractions Proof-of-Conscious — Review v1.1

**Status:** Updated draft for Victor review
**Date:** 2026-06-16
**Lesson:** Introduction to Halves Using Rectangular Cut-outs

---

## Source Lesson Fields

| Field | Value |
|-------|-------|
| **Lesson ID** | `0767b9f0-4a75-4a27-b2a2-fa9833c8dae8` |
| **Database title** | Introduction to Halves Using Rectangular Cut-outs |
| **Strand** | Numbers |
| **Sub-strand** | 1.3 Fractions |
| **isAvailable** | false |
| **Draft steps** | 10 (existing recovery batch) |
| **Published steps** | 0 |
| **CSV source title** | Introduction to Halves Using Rectangular Cut-outs |
| **CSV strand** | Numbers |
| **CSV sub_strand** | 1.3 Fractions |
| **Category** | Existing DB Fractions lesson (1 of 7 correctly mapped) |

---

## Changes from v1.0

### Quick Check Options Fixed

**Old (v1.0) — VIOLATED scope:**
- A: 1/2 ✅
- B: 1/4
- C: **1/3** ← NOT allowed in halves-only lesson
- D: 2/2

**New (v1.1) — Grade 2 safe:**
- A: one half (1/2) ✅
- B: one quarter (1/4) — confuses halves with quarters
- C: one whole — confuses "one part" with "whole thing"
- D: two halves (2/2) — confuses number of parts with fraction

**Rationale:** All distractors now use only Grade 2-safe concepts (whole, half, quarter). No 1/3, no thirds, no unsupported fractions.

### Practice Step Differentiated from Quick Check

**Old (v1.0) — Practice was identical to QC:**
- Question: "What fraction is shaded?"
- Options: 1/2, 1/4, 1/3, 2/2

**New (v1.1) — Practice tests shape identification:**
- Question: "Which shape shows halves?"
- Options: "Shape A — the parts are equal", "Shape B — the parts are not equal", "Both shapes", "Neither shape"
- Tests: Can the child identify which shape has equal parts?
- Different skill from QC: QC tests fraction naming, Practice tests shape recognition

### Validator Updated

New validation rule added:
```
FRACTIONS_SCOPE_CHECK:
  IF lesson scope = "halves only" THEN
    NO occurrence of "1/3", "thirds", "one third" anywhere in journey
    INCLUDING distractors, options, feedback, alt text
  IF lesson scope = "halves and quarters" THEN
    NO occurrence of "1/5", "1/8", "fifths", "eighths" anywhere
```

---

## SVG/Media Status

### Current State
- All SVG media uses `altText` descriptions, NOT inline renderable SVG
- `url` fields are empty — no actual SVG files exist yet
- `assetId` fields are placeholders (e.g., `svg-welcome-owl-001`)
- `approvalStatus` is `"draft"` on all media

### What This Means

**Admin preview:** Will show SVG descriptions as text fallback. No broken images. No "Illustration coming soon." The `altText` serves as the fallback.

**Learner view (future):** Before publishing, one of these must happen:
1. Generate actual SVG files and upload to Supabase Storage
2. Use inline SVG generated from the visual descriptions
3. Confirm the text-only fallback is acceptable for MVJ

**For this POC:** The journey is valid as a text + description prototype. It proves the structure, content, and validation work. Actual SVG generation is a separate step.

### Media Approval Status

| Step | Media Type | approvalStatus | Fallback |
|------|-----------|---------------|----------|
| 1. Welcome | svg | draft | text |
| 2. Mission | none | approved | none |
| 3. Think First | svg | draft | text |
| 4. Learn | svg | draft | text |
| 5. Real Life | svg | draft | text |
| 6. Example | svg | draft | text |
| 7. Practice | svg | draft | text |
| 8. Quick Check | svg | draft | text |
| 9. Reflect | none | approved | none |
| 10. Complete | svg | draft | text |

**Admin preview behavior:** Shows all media with "DRAFT" warning badges. No broken images.

**Learner view behavior (future):** Only `approved` media shown. `draft` media replaced with fallback text.

---

## 10-Step Journey Summary

| Step | Type | Key Content | Interaction |
|------|------|-------------|-------------|
| 1 | Welcome | Greet + introduce halves | None |
| 2 | Mission | "Learn what a half is" | None |
| 3 | Think First | Share chapati fairly | None |
| 4 | Learn | Half = 1 of 2 equal parts | None |
| 5 | Real Life | Chapati, paper folding | None |
| | Example | Worked example: rectangle, 2 equal parts, 1 shaded = 1/2 | None |
| 7 | Practice | Which shape shows halves? (equal vs unequal) | MCQ (practice) |
| 8 | Quick Check | What fraction is shaded? (circle, 2 equal, 1 shaded) | MCQ (assessment) |
| 9 | Reflect | "What did you learn?" | Emoji self-rating |
| 10 | Complete | Celebration + summary | None |

---

## Quick Check Template (Step 8)

| Field | Value |
|-------|-------|
| **Question** | What fraction is shaded? |
| **Options** | A: one half (1/2), B: one quarter (1/4), C: one whole, D: two halves (2/2) |
| **Correct** | one half (1/2) — index 0 |
| **Distractor logic** | 1/4: confuses halves with quarters. 1 whole: thinks "one part" = whole. 2/2: confuses count with fraction. |
| **Feedback correct** | "Correct! One out of two equal parts is one half. We write it as 1/2. Excellent work!" |
| **Feedback incorrect** | "Not quite. Count the equal parts. There are 2. One part is shaded. That is one half. We write it as 1/2. Try again!" |
| **Grade 2 safety** | No 1/3, no thirds, no arithmetic, no abstract comparison. Uses child-friendly wording ("one half" not just "1/2"). |

---

## Validation Result

**23 checks, 23 passed, 0 failed, 0 warnings**

Key checks:
- ✅ 10 steps, correct order, no duplicates
- ✅ No title-copying, no generic greetings, no placeholder text
- ✅ Fractions scope: halves only — no 1/3 anywhere
- ✅ No fraction arithmetic, no abstract comparison
- ✅ QC answer correct (1/2), distractors Grade 2 safe
- ✅ No answer leaks before QC
- ✅ Video not required, not in Practice/QC
- ✅ All media has alt text, approval status, fallback
- ✅ Practice requires action, different from QC
- ✅ No video dependency in Learn

---

## What Needs Victor Approval Before Writing to studentJourneyDraft

### Safe to Approve Now
- [x] Scope: halves only, no arithmetic, no abstract comparison
- [x] QC template and distractors (Grade 2 safe, no 1/3)
- [x] Practice step is different from QC (shape identification vs fraction naming)
- [x] SVG-first approach, video optional
- [x] All text content is child-friendly
- [x] No placeholder text, no broken media
- [x] Validation passes all 23 checks

### Needs Victor Decision
- [ ] **SVG approach:** Should we generate actual SVG files before writing to DB, or is text-only fallback acceptable for MVJ?
- [ ] **Media approval:** Should we approve the draft media in the POC, or keep as draft for admin preview only?
- [ ] **Audio:** Should we add read-aloud audio for instructions? (Optional but recommended)

### Before Learner-Facing Publishing (Future)
- [ ] Generate actual SVG assets or confirm inline SVG approach
- [ ] Approve all media (change approvalStatus from "draft" to "approved")
- [ ] Add audio/read-aloud for instructions (optional)
- [ ] Add Kiswahili localization
- [ ] Victor reviews and approves the journey

---

## Is This POC Ready for Victor Review?

**YES.** All structural issues are fixed. The journey is valid according to all 23 validation checks. The content is Grade 2 appropriate. The Quick Check uses only Grade 2-safe options (no 1/3). The Practice step is different from the Quick Check.

**Next step:** Victor reviews this document. If approved, we write the journey to `studentJourneyDraft` for the lesson. No database changes until Victor approves.
