# Curriculum Generation Pipeline — Root Cause Analysis

## Executive Summary

The curriculum generation pipeline has **10 systemic failures** that produce incomplete, duplicate, and placeholder-filled lessons. The root causes span the entire pipeline: from source pack ingestion through generation scripts to database writes. No single fix will resolve all issues — the pipeline needs structural changes.

---

## A. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CURRICULUM GENERATION PIPELINE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │  SOURCE PACKS │───▶│  GENERATION  │───▶│   DATABASE   │───▶│  APPROVAL │ │
│  │  (Markdown)   │    │  (AI/Script) │    │  (Supabase)  │    │  (Admin)  │ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └───────────┘ │
│         │                    │                    │                  │       │
│         ▼                    ▼                    ▼                  ▼       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │ math-topic-  │    │ generate-50- │    │  Lesson      │    │ review-   │ │
│  │ guides.md    │    │ math-        │    │  .content    │    │ journey   │ │
│  │              │    │ journeys.py  │    │  Blocks      │    │ .route.ts │ │
│  │ (incomplete  │    │              │    │              │    │           │ │
│  │  fractions)  │    │ (placeholder │    │ studentJourney│   │ (copies   │ │
│  │              │    │  patterns)   │    │ studentJourney│   │  draft→   │ │
│  │              │    │              │    │  Draft       │    │  live)    │ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └───────────┘ │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐                                      │
│  │  AI GENERATION│    │  ADMIN       │                                      │
│  │  (OpenRouter) │    │  EDITOR      │                                      │
│  │              │    │  (Next.js)   │                                      │
│  │ generate-    │    │              │                                      │
│  │ journey/     │    │  Inline edit │                                      │
│  │ route.ts     │    │  Live preview│                                      │
│  └──────────────┘    └──────────────┘                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## B. Curriculum Generation Pipeline Diagram

```
Phase 1: SOURCE PACK INGESTION
──────────────────────────────
math-topic-guides.md ──▶ Read by generation script
                          │
                          ├──▶ Concept detection (keyword matching)
                          ├──▶ Content lookup (dictionary-based)
                          └──▶ Fallback: generic template

Phase 2: JOURNEY GENERATION
──────────────────────────────
Lesson metadata + Source pack ──▶ generate_journey()
                                      │
                                      ├──▶ detect_concept() — keyword match title
                                      ├──▶ Build 10 steps:
                                      │    ├── Welcome: template + title
                                      │    ├── Mission: outcome from dict
                                      │    ├── Think First: content from dict ✅
                                      │    ├── Learn: PLACEHOLDER ❌
                                      │    ├── Connect: template + title
                                      │    ├── Example: PLACEHOLDER ❌
                                      │    ├── Practice: PLACEHOLDER ❌
                                      │    ├── Quick Check: template + options
                                      │    ├── Reflect: template
                                      │    └── Complete: template + outcome
                                      │
                                      └──▶ Output: JSON file (local only)

Phase 3: DATABASE WRITE
──────────────────────────────
Local JSON ──▶ PATCH /api/admin/lessons/:id
                  │
                  └──▶ Update contentBlocks.studentJourneyDraft
                       (NOT studentJourney)

Phase 4: APPROVAL
──────────────────────────────
Admin clicks "Approve" ──▶ POST /api/admin/lessons/:id/review-journey
                                │
                                └──▶ Copy studentJourneyDraft → studentJourney
                                     Clear studentJourneyDraft
                                     Set aiMetadata.reviewStatus = "APPROVED"

Phase 5: STUDENT VIEW
──────────────────────────────
Student opens lesson ──▶ buildLessonJourney(lesson)
                              │
                              └──▶ Returns studentJourney (live) if non-empty
                                   Otherwise falls back to draft
```

---

## C. Top 10 Pipeline Failures

### Failure 1: Placeholder Content in Generated Drafts
**Root Cause:** The generation script (`generate-50-math-journeys.py`) uses a dictionary-based content system. Only Think First, Mission, and Quick Check have topic-specific content. Learn, Example, and Practice steps contain placeholder strings like `"[Detailed teaching content based on source pack for {concept}]"`.

**Affected Lessons:** All 5 generated fractions drafts + 40 other generated lessons
**Severity:** CRITICAL — Lessons cannot be approved with placeholder content
**Fix:** Either (a) fill the content dictionaries with real Math content for all 20+ concepts, or (b) integrate AI generation to create the content dynamically.

### Failure 2: Duplicate Lessons in Database
**Root Cause:** The 3 live fractions lessons ("Comparing Fractions: 1/2 and 1/4", "Fractions: Practice and Application", "Fractions: Assessment and Reflection") were created by an earlier generation process that used a template with only the title field changed. The AI prompt likely received different titles but the same generic content was generated for all three.

**Affected Lessons:** 3 live fractions lessons (exact duplicates)
**Severity:** HIGH — Wastes curriculum space, confuses students
**Fix:** Delete duplicates. Add uniqueness validation before writing to DB.

### Failure 3: Missing Lessons
**Root Cause:** The database only has 8 of the 12 listed fractions lessons. "Introduction to Halves Using Circular Cut-outs", "Introduction to Quarters Using Circular Cut-outs", and "Fractions in Daily Life: Sharing Food" were never created. The generation script only generates journeys for lessons that already exist in the database — it doesn't create new lesson records.

**Affected Lessons:** 4 missing lessons
**Severity:** HIGH — Incomplete curriculum unit
**Fix:** Create the missing lesson records first, then generate journeys.

### Failure 4: Source Pack Doesn't Cover All Concepts
**Root Cause:** The `math-topic-guides.md` file has detailed content for "Reading and Representing Numbers" and "Addition and Subtraction Relationships" but lacks equivalent depth for fractions, multiplication, division, and measurement. The generation script's content dictionaries only have entries for concepts that were manually coded.

**Affected Lessons:** All fractions, multiplication, division lessons
**Severity:** HIGH — Generator can't produce content it doesn't have
**Fix:** Expand source packs to cover all Grade 2 Math topics with the same depth as the numbers topic.

### Failure 5: No Source Pack Ingestion in Generation Script
**Root Cause:** The generation script does NOT read `math-topic-guides.md` at all. It uses hardcoded Python dictionaries. The source pack exists but is never ingested. This means the generation is disconnected from the curriculum guidance.

**Affected Lessons:** All generated lessons
**Severity:** HIGH — Source packs are written but never used
**Fix:** Either (a) parse source packs into the generation dictionaries, or (b) pass source pack content to AI for dynamic generation.

### Failure 6: Generic Template Text With Certain Titles
**Root Cause:** The generation script uses f-strings like `f"We use {title.lower()} in everyday life!"` which produces nonsensical text when the title is "Practice and Application" or "Assessment and Reflection". The script doesn't distinguish between topic titles and meta-titles.

**Affected Lessons:** Lessons with meta-titles (Practice and Application, Assessment and Reflection)
**Severity:** MEDIUM — Produces confusing student-facing text
**Fix:** Add title classification logic to detect meta-titles and use appropriate generic text.

### Failure 7: AI Generation Endpoint Not Used for Batch Generation
**Root Cause:** The `/api/admin/lessons/[id]/generate-journey` endpoint exists and uses OpenRouter AI, but the batch generation script doesn't use it. Instead, it uses hardcoded dictionaries. The AI endpoint was likely used for the original 3 live fractions lessons (which explains why they have different content than the script-generated ones).

**Affected Lessons:** All batch-generated lessons
**Severity:** MEDIUM — AI generation produces better content than templates
**Fix:** Use the AI generation endpoint for batch generation, or improve the template dictionaries to match AI quality.

### Failure 8: No Validation Before Database Write
**Root Cause:** The generation script validates locally (10 steps, correct types, no contamination) but doesn't check for placeholder content, empty Learn/Example/Practice steps, or duplicate text. The validation passes even with `[content based on source pack]` placeholders.

**Affected Lessons:** All generated lessons
**Severity:** MEDIUM — Placeholder content passes validation
**Fix:** Add content quality validation: check for placeholder patterns, minimum content length per step, topic-specific vocabulary.

### Failure 9: Approval Workflow Clears Draft
**Root Cause:** The `review-journey` endpoint copies draft → live AND clears the draft (`studentJourneyDraft: []`). This means if a lesson is approved with placeholder content, the draft is lost and can't be re-edited without regenerating.

**Affected Lessons:** All approved lessons
**Severity:** MEDIUM — Irreversible approval of bad content
**Fix:** Don't clear draft on approval. Keep draft as backup. Add "request revision" action.

### Failure 10: No Progression Tracking Between Lessons
**Root Cause:** Each lesson is generated independently. There's no mechanism to ensure Lesson N+1 builds on Lesson N. The source pack doesn't define prerequisites or learning progressions.

**Affected Lessons:** All lessons in a unit
**Severity:** MEDIUM — No coherent learning path
**Fix:** Add prerequisite tracking to source packs. Validate that each lesson references concepts from previous lessons.

---

## D. Ordered Fix Plan

### Priority 1: Stop the Bleeding (Do First)

**Fix 1.1: Delete duplicate lessons**
- Delete "Fractions: Practice and Application" and "Fractions: Assessment and Reflection"
- Keep only "Comparing Fractions: 1/2 and 1/4"
- Prevents confusion in curriculum map

**Fix 1.2: Add placeholder detection to validation**
- Reject any journey containing `[content based on source pack]`, `[Example for`, `[Practice question`
- Prevents placeholder content from being written to DB

**Fix 1.3: Don't clear draft on approval**
- Change `review-journey` to keep `studentJourneyDraft` after approval
- Allows re-editing if issues are found

### Priority 2: Fix the Generation Script

**Fix 2.1: Integrate source pack ingestion**
- Parse `math-topic-guides.md` into the generation dictionaries
- Use real curriculum content instead of placeholders

**Fix 2.2: Fill content dictionaries for all concepts**
- Add real Math content for Learn, Example, Practice steps for all 20+ concepts
- Minimum: 3 examples, 4 practice tasks, 1 worked example per concept

**Fix 2.3: Add title classification**
- Detect meta-titles (Practice and Application, Assessment and Reflection)
- Use appropriate generic text for meta-titles

**Fix 2.4: Add content quality validation**
- Minimum content length per step (Learn: 200+ chars, Example: 150+ chars, Practice: 100+ chars)
- Topic-specific vocabulary check
- No duplicate text between steps

### Priority 3: Fix the Pipeline Architecture

**Fix 3.1: Use AI generation for batch processing**
- Call `/api/admin/lessons/[id]/generate-journey` for each lesson
- Pass source pack content as context
- Produces higher-quality content than templates

**Fix 3.2: Create missing lesson records**
- Create the 4 missing fractions lessons in the database
- Then generate journeys for them

**Fix 3.3: Add progression tracking**
- Define prerequisites in source packs
- Validate that each lesson builds on previous lessons
- Ensure coherent learning path through the unit

**Fix 3.4: Add uniqueness validation**
- Before writing a journey, check if identical content already exists
- Prevent duplicate lessons from being created

### Priority 4: Long-Term Improvements

**Fix 4.1: Build a proper content management system**
- Separate content from structure
- Allow curriculum authors to edit content without touching code
- Version control for curriculum content

**Fix 4.2: Add automated quality scoring**
- Score each generated journey on multiple dimensions
- Flag journeys below quality threshold
- Require manual review for low-scoring journeys

**Fix 4.3: Implement content reuse detection**
- Detect when the same content is used across multiple lessons
- Flag potential duplicates before database write

---

## Summary Table

| # | Failure | Root Cause | Severity | Fix Priority |
|---|---------|------------|----------|--------------|
| 1 | Placeholder content | Hardcoded dictionaries without real content | CRITICAL | 1 |
| 2 | Duplicate lessons | Template generation with only title changed | HIGH | 1 |
| 3 | Missing lessons | Generator doesn't create lesson records | HIGH | 3 |
| 4 | Incomplete source packs | Fractions/multiplication topics not covered | HIGH | 2 |
| 5 | No source pack ingestion | Script uses hardcoded dicts, ignores source packs | HIGH | 2 |
| 6 | Generic text with meta-titles | f-string templates don't classify titles | MEDIUM | 2 |
| 7 | AI endpoint not used for batch | Batch uses templates instead of AI | MEDIUM | 3 |
| 8 | Weak validation | Placeholder content passes validation | MEDIUM | 1 |
| 9 | Draft cleared on approval | Irreversible approval | MEDIUM | 1 |
| 10 | No progression tracking | Each lesson generated independently | MEDIUM | 3 |
