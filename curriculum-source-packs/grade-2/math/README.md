# Grade 2 Mathematics — Source Pack

**Version:** 0.1.0 — Skeleton (awaiting human input)
**Created:** 2026-06-16
**Source database:** Supabase production (hgufndnqbvcukbxmwtvo.supabase.co)
**Source CSV:** `curriculum-shells/grade-2/mathematics-source-extended.csv` (KICD/CBC)
**Reference PDF:** `docs/kicd-lower-primary-volume-2.pdf` (KICD Lower Primary Curriculum Designs Vol.2, Aug 2017)
**Audit reference:** `docs/audits/grade-2-math-final-audit-summary.md`

---

## What Is a Source Pack?

A **source pack** is the **approved teaching guide** used by the journey generator.

**It is NOT the journey itself.**

The source pack tells the generator:

- **What each Math topic means** — in plain language, for a Grade 2 child
- **How to explain it** — teaching approach, progression, key points
- **What examples are allowed** — approved worked examples, not AI-invented ones
- **What practice tasks are allowed** — guided and independent practice patterns
- **What Quick Checks are allowed** — question templates, correct answer rules, distractor rules
- **What mistakes to avoid** — common misconceptions, wrong answer patterns
- **What visuals/videos are appropriate** — per-topic visual guidance, approved video URLs
- **What difficulty limits apply** — number ranges, operation limits, Grade 2 boundaries

### The Core Principle

**The AI/generator should assemble journeys from the source pack. It should NOT invent teaching content from lesson titles alone.**

Before this source pack existed, the generator was guessing:
- What "Addition" means to a Grade 2 child
- What examples to use
- What practice tasks to create
- What Quick Check questions to write
- What videos to pick

That produced 411 defects across 121 lessons. The source pack eliminates guessing.

---

## How to Use This Source Pack

### For Humans (Victor)

1. **Review each topic guide** in `math-topic-guides.md`
2. **Fill in the TODO sections** — these need your teaching expertise
3. **Approve or replace videos** in `math-video-map.csv`
4. **Confirm visual guidance** in `math-visual-guidance.md`
5. **Sign off on validation rules** in `math-validation-rules.md`

### For the Generator (AI)

1. **Read** `math-lesson-map.csv` to find the lesson's topic, sub-topic, and requirements
2. **Load** the corresponding topic section from `math-topic-guides.md`
3. **Follow** the teaching approach, examples, practice patterns, and QC templates
4. **Apply** validation rules from `math-validation-rules.md` — any journey that fails validation is rejected
5. **Use** approved videos from `math-video-map.csv` — never invent video URLs
6. **Generate** SVG illustrations matching `math-visual-guidance.md`

---

## File Structure

| File | Purpose |
|------|---------|
| `README.md` | This file — overview and how to use |
| `math-topic-guides.md` | Teaching guide for each of the 13 Math topics |
| `math-lesson-map.csv` | All 121 lessons mapped to topics with requirements |
| `math-video-map.csv` | Video audit and approval status for all lessons |
| `math-visual-guidance.md` | Per-topic visual/illustration guidance |
| `math-validation-rules.md` | Rules the generator must pass — or the journey is rejected |
| `math-human-input-needed.md` | Exactly what Victor needs to provide, grouped by topic |

---

## Current Status

| Item | Status |
|------|--------|
| Folder structure | ✅ Created |
| README | ✅ Created |
| Topic guides skeleton | ✅ Created (all 13 topics, TODOs marked) |
| Lesson map CSV | ✅ Created (121 lessons, TODOs marked) |
| Video map CSV | ✅ Created (all videos marked "needs human review") |
| Visual guidance | ✅ Created (topic-level, TODOs marked) |
| Validation rules | ✅ Created |
| Human input needed | ✅ Created |
| **Human approval** | ❌ **PENDING — Victor must fill TODOs** |

---

## Scope

- **Grade:** 2
- **Subject:** Mathematics (Mathematical Activities)
- **Total lessons:** 121
- **Topics:** 13
- **Source:** KICD Lower Primary Curriculum Designs Volume Two (August 2017)
- **Strands covered:** Numbers, Measurement, Geometry

---

## What This Source Pack Does NOT Cover

- Journey step structure (handled by generator templates)
- Gamification (XP, coins, badges — handled by reward system)
- UI rendering (handled by frontend components)
- Student progress tracking (handled by backend)
- Other subjects (English, Kiswahili, etc. — separate source packs needed)
- Grade 5 (out of scope)

---

## Next Steps

1. Victor reviews and fills TODO sections
2. Victor approves/replaces all 121 video URLs
3. Victor confirms visual guidance per topic
4. Generator is updated to read from this source pack
5. Recovery batch (37 lessons) regenerated from source pack
6. Old v2 journeys (81 lessons) regenerated from source pack
7. All journeys validated against `math-validation-rules.md`
8. Victor reviews and approves
9. Publish
