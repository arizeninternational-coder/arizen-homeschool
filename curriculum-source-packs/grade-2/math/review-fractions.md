# Grade 2 Mathematics — Fractions Source Pack: Reconciliation & Review

**Status:** Draft for Victor review
**Date:** 2026-06-16
**Source file:** `curriculum-shells/grade-2/mathematics-source-extended.csv` (156 rows, KICD/CBC)
**Database:** Supabase production (121 Grade 2 Math lessons)
**Audit reference:** `docs/audits/grade-2-math-topic-map.md`

---

## 12-Lesson Reconciliation Table

### Category 1: Existing DB Fractions Lessons (7)

These lessons exist in the database with strand/sub_strand = "Numbers" / "1.3 Fractions".

| # | Source Lesson Title | DB ID | DB Strand | DB Sub-strand | In Audit Count? | Recommended Action | Reason |
|---|-------------------|-------|-----------|---------------|-----------------|-------------------|--------|
| 1 | Introduction to Halves Using Rectangular Cut-outs | 0767b9f0 | Numbers | 1.3 Fractions | ✅ Yes | **Use for proof-of-concept** | Clearly Fractions. Recovery batch. Has draft journey. |
| 2 | Introduction to Quarters Using Rectangular Cut-outs | 9b887eb8 | Numbers | 1.3 Fractions | ✅ Yes | Generate after approval | Clearly Fractions. Recovery batch. Has draft journey. |
| 3 | Comparing Fractions: 1/2 and 1/4 | 839653eb | Numbers | 1.3 Fractions | ✅ Yes | Generate after approval | Published lesson. Needs source pack content. |
| 4 | Making Patterns with Fractions | b163de06 | Numbers | 1.3 Fractions | ✅ Yes | Generate after approval | Recovery batch. Visual patterns only. |
| 5 | Digital Games with Fractions | dbadac3a | Numbers | 1.3 Fractions | ✅ Yes | Generate after approval | Published lesson. Digital-style practice. |
| 6 | Fractions: Practice and Application | c71a49c8 | Numbers | 1.3 Fractions | ✅ Yes | Generate after approval | Published lesson. Mixed practice. |
| 7 | Fractions: Assessment and Reflection | 2e1869d6 | Numbers | 1.3 Fractions | ✅ Yes | Generate after approval | Published lesson. Comprehensive review. |

### Category 2: Existing DB Lessons Misclassified Under Numbers (2)

These lessons exist in the database but were mapped to "Numbers" / "1.1 Number Concept" or "1.2 Whole Numbers" instead of "1.3 Fractions". The CSV confirms they belong under "1.3 Fractions".

| # | Source Lesson Title | DB ID | DB Strand | DB Sub-strand | In Audit Count? | Recommended Action | Reason |
|---|-------------------|-------|-----------|---------------|-----------------|-------------------|--------|
| 8 | Identifying 1/2 in Everyday Objects | 159f92b9 | Numbers | 1.1 Number Concept | ❌ No (was in Numbers) | **Remap in source pack** — do NOT update DB yet | CSV sub_strand = "1.3 Fractions". Content is clearly about halves. |
| 9 | Identifying 1/4 in Everyday Objects | 60441bd5 | Numbers | 1.1 Number Concept | ❌ No (was in Numbers) | **Remap in source pack** — do NOT update DB yet | CSV sub_strand = "1.3 Fractions". Content is clearly about quarters. |

### Category 3: CSV-Only Fractions Lessons (3)

These lessons exist in the CSV source file but do NOT exist in the database. They should NOT be generated now.

| # | Source Lesson Title | CSV Strand | CSV Sub-strand | In DB? | Recommended Action | Reason |
|---|-------------------|------------|----------------|--------|-------------------|--------|
| 10 | Introduction to Halves Using Circular Cut-outs | Numbers | 1.3 Fractions | ❌ No | **Import later** | Not in DB. Needs import before generation. |
| 11 | Introduction to Quarters Using Circular Cut-outs | Numbers | 1.3 Fractions | ❌ No | **Import later** | Not in DB. Needs import before generation. |
| 12 | Fractions in Daily Life: Sharing Food | Numbers | 1.3 Fractions | ❌ No | **Import later** | Not in DB. Needs import before generation. |

### Summary

| Category | Count | Action |
|----------|-------|--------|
| Existing DB Fractions (correctly mapped) | 7 | Generate from source pack after approval |
| Existing DB misclassified under Numbers | 2 | Remap in source pack. Do NOT update DB yet. |
| CSV-only (not in DB) | 3 | Import backlog. Do NOT generate yet. |
| **Total CSV Fractions lessons** | **12** | |

---

## Proof-of-Concept Decision

### Recommended: Lesson #1 — Introduction to Halves Using Rectangular Cut-outs

**Why this lesson:**
- ✅ Exists in database (ID: 0767b9f0)
- ✅ Correctly mapped to "1.3 Fractions"
- ✅ Has a draft journey (recovery batch)
- ✅ Clearly scoped: halves only, rectangular cut-outs, paper folding
- ✅ Single concept (halves) — easiest to validate
- ✅ Source pack section is fully drafted
- ✅ QC template is defined (QC-H1: Identify Halves Shape)

**Source pack section:** `math-topic-guides.md` → Section 5: Fractions → Halves sub-topic

**QC template:** QC-H1 (Identify Halves — Shape)

**What the proof-of-concept will validate:**
1. Source pack → generator → journey pipeline
2. SVG-first approach (no video dependency)
3. QC template correctness
4. Fractions scope enforcement (no arithmetic, no thirds)
5. Media fallback behavior
6. Admin preview vs learner view distinction

### Lessons to Use After Proof-of-Concept

After Victor approves the proof-of-Concept:
1. **Lesson #2:** Introduction to Quarters (same structure, different fraction)
2. **Lessons #3-7:** Remaining DB Fractions lessons
3. **Lessons #8-9:** Remapped lessons (do NOT update DB strand/sub_strand)
4. **Lessons #10-12:** Import from CSV first, then generate

---

## Teaching Decisions (Tightened)

### Comparing Fractions: 1/2 and 1/4

**Allowed:**
- Visual recognition using the same whole
- Same-size shapes side by side
- Shaded parts comparison
- Food sharing scenarios ("Which is a bigger piece?")
- Questions like: "Which picture shows one half?" / "Which picture shows one quarter?" / "Are the parts equal?"

**NOT allowed:**
- Abstract fraction comparison ("Which is greater: 1/2 or 1/4?")
- Number-line fraction comparison
- Equivalent fractions (1/2 = 2/4)
- Symbolic inequality (<, >, = with fractions)
- Any wording that asks "which fraction is bigger/smaller"

**Source evidence:** CSV learning outcome says "identify 1/4 as part of a whole" — not "compare fractions."

### Making Patterns with Fractions

**Allowed:**
- Visual repeating patterns: half, quarter, half, quarter...
- Shaded shape sequences
- Paper folding patterns (fold in half, fold in quarters)
- Real-object patterns (chapati half, cake quarter, chapati half, cake quarter...)

**NOT allowed:**
- Abstract sequences like 1/4, 2/4, 3/4, ___
- Fraction arithmetic disguised as patterns
- Any pattern that requires adding or counting fractions
- Symbolic fraction sequences without visual support

**Grade 2-safe version:** "Look at the pattern: half, quarter, half, quarter... What comes next? Draw the next shape."

### Digital Games with Fractions

**Is this an official lesson?** ✅ Yes. CSV row exists. Published in DB.

**What should the child learn?** Halves, quarters, equal parts identification — same as other Fractions lessons.

**Appropriate interactions (no game engine needed):**
- Match the fraction to the shaded shape
- Sort shapes into "halves" and "quarters" groups
- Shade the correct fraction of a shape
- Choose the correct fraction from 4 options
- Equal vs unequal parts sorting

**NOT required:** Real game engine, scoring system, levels, animations. Simple interactive tasks are sufficient.

### Assessment and Reflection

**Is this a standalone lesson?** Yes. CSV has it as a separate lesson.

**Should it be a mixed review?** Yes. Comprehensive review of all Fractions concepts.

**Appropriate QC type:** Mixed — one question on halves, one on quarters, one on equal vs unequal, one on fair sharing.

**How to avoid being too broad:** Focus on identification and recognition only. No arithmetic. No abstract comparison. Keep it visual.

---

## 6 Quick Check Templates (Final)

### QC-H1: Identify Halves (Shape)

| Field | Value |
|-------|-------|
| **Template ID** | QC-H1 |
| **Skill tested** | Identify 1/2 from a shape |
| **Question** | This circle is divided into 2 equal parts. One part is shaded. What fraction is shaded? |
| **Option A** | 1/2 |
| **Option B** | 1/4 |
| **Option C** | 1/3 |
| **Option D** | 2/2 |
| **Correct answer** | 1/2 |
| **Correct index** | 0 |
| **Distractor logic** | B: confuses halves with quarters. C: random wrong fraction. D: thinks "2 parts" = 2/2 |
| **Feedback correct** | Yes! One out of two equal parts is one half. Well done! |
| **Feedback incorrect** | Look again. The shape is divided into 2 equal parts. One part is shaded. That's one half. |
| **Grade 2 safety** | ✅ Safe. Only uses 1/2. No arithmetic. Visual shape. |

### QC-H2: Identify Halves (Real Object)

| Field | Value |
|-------|-------|
| **Template ID** | QC-H2 |
| **Skill tested** | Identify 1/2 from a real object |
| **Question** | A chapati is cut into 2 equal pieces. You get 1 piece. What fraction of the chapati do you have? |
| **Option A** | 1/4 |
| **Option B** | 1/2 |
| **Option C** | 1 whole |
| **Option D** | 2/2 |
| **Correct answer** | 1/2 |
| **Correct index** | 1 |
| **Distractor logic** | A: confuses with quarters. C: thinks one piece = whole thing. D: confuses number of pieces with fraction |
| **Feedback correct** | Correct! One piece out of 2 equal pieces is one half. Good thinking! |
| **Feedback incorrect** | The chapati was cut into 2 equal pieces. You have 1 of those pieces. That's one half. |
| **Grade 2 safety** | ✅ Safe. Real-life context. Only uses 1/2. |

### QC-Q1: Identify Quarters (Shape)

| Field | Value |
|-------|-------|
| **Template ID** | QC-Q1 |
| **Skill tested** | Identify 1/4 from a shape |
| **Question** | This rectangle is divided into 4 equal parts. One part is shaded. What fraction is shaded? |
| **Option A** | 1/2 |
| **Option B** | 1/3 |
| **Option C** | 1/4 |
| **Option D** | 4/4 |
| **Correct answer** | 1/4 |
| **Correct index** | 2 |
| **Distractor logic** | A: confuses quarters with halves. B: random wrong fraction. D: thinks "4 parts" = 4/4 |
| **Feedback correct** | Yes! One out of four equal parts is one quarter. Excellent! |
| **Feedback incorrect** | Count the equal parts. There are 4. One part is shaded. That's one quarter. |
| **Grade 2 safety** | ✅ Safe. Only uses 1/4. No arithmetic. |

### QC-Q2: Identify Quarters (Real Object)

| Field | Value |
|-------|-------|
| **Template ID** | QC-Q2 |
| **Skill tested** | Identify 1/4 from a real object |
| **Question** | A cake is cut into 4 equal slices. You eat 1 slice. What fraction of the cake did you eat? |
| **Option A** | 1/2 |
| **Option B** | 1/4 |
| **Option C** | 1/3 |
| **Option D** | 1 whole |
| **Correct answer** | 1/4 |
| **Correct index** | 1 |
| **Distractor logic** | A: confuses quarters with halves. C: random wrong fraction. D: thinks eating a slice = eating whole cake |
| **Feedback correct** | Correct! One slice out of 4 equal slices is one quarter. Well done! |
| **Feedback incorrect** | The cake was cut into 4 equal slices. You ate 1 slice. That's one quarter of the cake. |
| **Grade 2 safety** | ✅ Safe. Real-life context. Only uses 1/4. |

### QC-E1: Equal vs Unequal Parts

| Field | Value |
|-------|-------|
| **Template ID** | QC-E1 |
| **Skill tested** | Distinguish equal from unequal parts |
| **Question** | Which shape shows equal parts? |
| **Option A** | Shape A: rectangle divided into 2 equal parts |
| **Option B** | Shape B: rectangle divided into 2 unequal parts |
| **Option C** | Shape C: circle divided into 3 unequal parts |
| **Option D** | Shape D: square divided into 4 unequal parts |
| **Correct answer** | Shape A |
| **Correct index** | 0 |
| **Distractor logic** | All other shapes show unequal parts. Tests core concept: fractions require EQUAL parts. |
| **Feedback correct** | Yes! Only Shape A has equal parts. Fractions need equal parts! |
| **Feedback incorrect** | Remember: fractions need parts that are the same size. Look for the shape where all parts are equal. |
| **Grade 2 safety** | ✅ Safe. No fraction notation. Purely visual. |

### QC-F1: Fair Sharing

| Field | Value |
|-------|-------|
| **Template ID** | QC-F1 |
| **Skill tested** | Apply fair sharing to find a fraction |
| **Question** | 2 children want to share a chapati fairly. What fraction does each child get? |
| **Option A** | 1/4 |
| **Option B** | 1/3 |
| **Option C** | 1/2 |
| **Option D** | 1 whole |
| **Correct answer** | 1/2 |
| **Correct index** | 2 |
| **Distractor logic** | A: confuses 2 people with 4 parts. B: random wrong fraction. D: thinks each person gets the whole chapati |
| **Feedback correct** | Correct! When 2 children share fairly, each gets one half. That's fair sharing! |
| **Feedback incorrect** | If 2 children share one chapati fairly, we cut it into 2 equal parts. Each child gets 1 out of 2 parts. That's one half. |
| **Grade 2 safety** | ✅ Safe. Real-life context. Only uses 1/2. No arithmetic. |

---

## Approval Checklist

### ✅ Safe to Approve (no changes needed)

- [x] Fractions scope: halves (1/2) and quarters (1/4) only
- [x] No fraction arithmetic (no 1/2 + 1/4)
- [x] No equivalent fractions
- [x] No comparing which fraction is bigger
- [x] No improper fractions, mixed numbers, decimals, percentages
- [x] No thirds (1/3) unless Victor confirms
- [x] 6 QC templates (H1, H2, Q1, Q2, E1, F1) — all Grade 2 safe
- [x] Visual-first approach (SVG over video)
- [x] Video is optional, not required
- [x] Audio/read-aloud is optional but recommended
- [x] Real-life examples (chapati, cake, pizza, chocolate, paper folding)
- [x] Equal vs unequal parts teaching moment
- [x] Fair sharing context
- [x] Proof-of-concept lesson: Introduction to Halves Using Rectangular Cut-outs

### ⚠️ Needs Victor Decision

- [ ] **Comparing Fractions: 1/2 and 1/4** — Is this lesson about visual recognition only, or does KICD require comparing which is bigger? (CSV says "identify 1/4 as part of a whole" — not "compare")
- [ ] **Making Patterns with Fractions** — Is visual pattern (half, quarter, half, quarter) sufficient, or does KICD require more?
- [ ] **Digital Games with Fractions** — What interaction types are appropriate? (matching, sorting, shading, choose-correct-picture)
- [ ] **Assessment and Reflection** — Should this be a comprehensive mixed review or focused on specific skills?
- [ ] **3 CSV-only lessons** — Import now or later? (Introduction to Halves Using Circular Cut-outs, Introduction to Quarters Using Circular Cut-outs, Fractions in Daily Life: Sharing Food)
- [ ] **2 misclassified DB lessons** — Remap in source pack now or later? (Identifying 1/2 in Everyday Objects, Identifying 1/4 in Everyday Objects)

### ❌ Needs Change Before Generation

- [ ] **Lesson count in source pack** — Currently says 9. Should say 7 (DB) + 2 (remappable) + 3 (CSV-only, import later) = 12 total
- [ ] **QC templates for lessons 3-7** — Currently use generic templates. Need specific templates for Comparing, Patterns, Digital Games, Practice, Assessment
- [ ] **Visual descriptions** — Need detailed SVG descriptions for all 7 DB lessons
- [ ] **safe_to_generate** — Currently NO for all. Should be YES for Lesson #1 after Victor approves proof-of-concept

---

## Can Fractions Move to Proof-of-Concept After Approval?

**YES.**

**Recommended proof-of-concept:** Lesson #1 — Introduction to Halves Using Rectangular Cut-outs (ID: 0767b9f0)

**What to generate:**
- 10-step journey from source pack
- SVG-first (no video dependency)
- QC template: QC-H1
- Validate against all 20 validation rules
- Admin preview only (do NOT publish)

**After proof-of-concept review:**
- Victor approves or adjusts
- Generate remaining 6 DB Fractions lessons
- Add 2 remapped lessons
- Import 3 CSV-only lessons (separate task)

**Do NOT:**
- Update database strand/sub_strand for misclassified lessons
- Import CSV-only lessons
- Generate all 12 lessons at once
- Publish anything
