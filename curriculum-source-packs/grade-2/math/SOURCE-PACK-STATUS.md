# Grade 2 Mathematics — Source Pack Skeleton: Final Report

**Date:** 2026-06-16
**Status:** Skeleton complete — awaiting human input before generation can begin

---

## Files Created

| File | Path | Status |
|------|------|--------|
| README.md | `curriculum-source-packs/grade-2/math/README.md` | ✅ Complete |
| Topic Guides | `curriculum-source-packs/grade-2/math/math-topic-guides.md` | ✅ Skeleton (13 topics, all TODOs marked) |
| Lesson Map CSV | `curriculum-source-packs/grade-2/math/math-lesson-map.csv` | ✅ 121 lessons mapped |
| Video Map CSV | `curriculum-source-packs/grade-2/math/math-video-map.csv` | ✅ 121 lessons, all videos unverified |
| Video Map MD | `curriculum-source-packs/grade-2/math/math-video-map.md` | ✅ Summary + policy |
| Visual Guidance | `curriculum-source-packs/grade-2/math/math-visual-guidance.md` | ✅ Per-topic guidance |
| Validation Rules | `curriculum-source-packs/grade-2/math/math-validation-rules.md` | ✅ 18 rules, critical/high/medium |
| Human Input Needed | `curriculum-source-packs/grade-2/math/math-human-input-needed.md` | ✅ Complete |

---

## Numbers

| Metric | Count |
|--------|-------|
| Lessons mapped | 121 |
| Topics covered | 13 |
| Unique videos | 8 (all need human review) |
| Video reuse instances | 7 videos reused across lessons |
| Cross-strand video reuse | 3 videos (pAtrNu8y6FQ, bo2A425u6hk, jEYs9Z2w8oU) |
| Validation rules defined | 18 |
| Critical rules | 10 |
| TODO items for Victor | ~150+ (across all files) |

---

## Fields Already Filled (From Audit/Source CSV)

The following fields were populated from existing data (no guessing):

- **lesson_id** — from DB
- **title** — from DB
- **strand** — from DB (KICD strand names)
- **sub_strand** — from DB
- **learningOutcome** — from DB (from CSV import)
- **keyInquiryQuestion** — from DB (from CSV import)
- **suggestedLearningExperience** — from DB (from CSV import)
- **activityInstructions** — from DB (from CSV import)
- **mapped_topic** — derived from title + strand
- **mapped_subtopic** — derived from title + sub_strand
- **source_file_reference** — `mathematics-source-extended.csv`
- **representation_needed** — derived from topic
- **example_type** — derived from topic
- **difficulty_limit** — derived from topic (needs confirmation)
- **video_needed** — OPTIONAL for Math (SVG/diagrams more important); YES for English/Kiswahili
- **visual_needed** — YES for all
- **source_pack_status** — recovery-batch / old-v2 / new
- **human_input_needed** — YES for all
- **safe_to_generate** — NO for all (awaiting source pack completion)

---

## Fields Marked TODO (Need Victor Input)

| Field | Lessons Affected | Type |
|-------|-----------------|------|
| child_friendly_goal | 121 | Per-lesson |
| vocabulary_needed | 121 | Per-lesson |
| practice_type | 121 | Per-lesson |
| quick_check_type | 121 | Per-topic |
| approved_video_url | 121 | Per-lesson |
| backup_video_url | 121 | Per-lesson |
| approved_examples | 13 topics | Per-topic |
| qc_templates | 13 topics | Per-topic |
| distractor_rules | 13 topics | Per-topic |
| common_mistakes | 13 topics | Per-topic |

---

## Top 10 Things Victor Needs to Provide

### 1. Fractions Examples (6 lessons)
Approved examples for halves and quarters. What real-life objects to use. What "equal parts" means to a Grade 2 child.

### 2. Subtraction Rules (16 lessons)
Confirmation: NO negative answers. Approved borrowing/regrouping method. Common mistakes.

### 3. Multiplication Rules (10 lessons)
Confirmed max factor. Approved equal-groups examples. Connection to repeated addition.

### 4. Video URLs (ALL 121 lessons)
Review 8 existing videos. Approve or replace. Provide backup URLs. Confirm child-safety.

### 5. Time Scope (lessons in Time topic)
Confirmed: o'clock only? o'clock + half past? quarter past?

### 6. Money Denominations (lesson in Money topic)
Confirmed Kenyan shilling coins and notes for Grade 2.

### 7. Measurement Units (19 lessons)
Confirmed: metres, litres, kilograms. Non-standard units to reference.

### 8. Number Patterns Range (20 lessons)
Confirmed upper limit (100? 1000?).

### 9. Word Problem Scope (8 lessons)
Confirmed: single-step only? Kenyan context scenarios.

### 10. Quick Check Templates (13 topics)
2-3 approved QC templates per topic with correct answer rules and distractor rules.

---

## Recommended Order for Filling the Source Pack

### Round 1: Critical Teaching Content (blocks all generation)
1. Fractions — examples, rules, QC templates
2. Subtraction — rules, common mistakes, QC templates
3. Multiplication — rules, examples, QC templates

### Round 2: Scope Confirmation (blocks topic-specific generation)
4. Time — scope confirmation
5. Money — denomination confirmation
6. Measurement — unit confirmation
7. Number Patterns — range confirmation
8. Word Problems — scope confirmation

### Round 3: Videos (blocks publishing)
9. Review all 8 existing videos
10. Provide approved URLs for all 121 lessons

### Round 4: Per-Lesson Content (blocks individual lesson generation)
11. Child-friendly goals (121 lessons)
12. Vocabulary lists (121 lessons)
13. Practice types (121 lessons)

### Round 5: Quality Assurance
14. Review all topic guides
15. Confirm validation rules
16. Sign off on source pack

---

## Is the Source Pack Ready for Human Editing?

**YES.** The skeleton is complete. All 8 files are created. All TODOs are clearly marked. Victor can start filling in content immediately.

The source pack is structured so Victor can fill it incrementally:
- Start with Fractions (6 lessons) — smallest topic, highest impact
- Then Subtraction (16 lessons) — most critical rules
- Then Multiplication (10 lessons) — wrong answers to fix
- Then videos (all 121 lessons)
- Then remaining topics

---

## What Should Happen After Victor Fills It

1. **Source pack updated** with approved content
2. **Generator updated** to read from source pack (not guess from titles)
3. **Recovery batch (37 lessons) regenerated** from source pack
4. **All journeys validated** against `math-validation-rules.md`
5. **Victor reviews** regenerated journeys
6. **Old v2 (81 lessons) regenerated** from source pack
7. **All 121 lessons published**

---

## What Should NOT Happen

- ❌ Do NOT generate journeys without the source pack filled
- ❌ Do NOT publish any Math lessons until source pack is complete
- ❌ Do NOT touch the 81 old v2 published journeys until replacements are ready
- ❌ Do NOT touch Grade 5
- ❌ Do NOT touch other subjects
- ❌ Do NOT run `publish-math-drafts.js --execute`
- ❌ Do NOT assume any video is safe or relevant
- ❌ Do NOT invent teaching content — only use what's in the source pack
