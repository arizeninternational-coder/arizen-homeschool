# Grade 2 Journey Repair Plan

## Status: NOT EXECUTED — Pending Victor Review

This document describes the repair strategy for the 27 contaminated Math lessons and other journey quality issues found in the audit.

## Immediate Actions (Before Any Repair)

### 1. Hide Unsafe Published Lessons

**351 PUBLISHED lessons have empty studentJourney** — students see nothing when they open these lessons.

**Recommended action**: Set `isAvailable = false` for all PUBLISHED lessons with empty studentJourney. This hides them from students without changing status.

**27 contaminated Math lessons** — these are PUBLISHED and teach the wrong subject.

**Recommended action**: Set `isAvailable = false` immediately. These must NOT be visible to students.

### 2. Do NOT Delete Data

- Do NOT delete any journey content
- Do NOT delete any lessons
- Only change `isAvailable` flag or `status` field
- All changes should be reversible

## Repair Phases

### Phase A: Stop the Bleeding

1. **Set `isAvailable = false`** for all 27 contaminated Math lessons
2. **Set `isAvailable = false`** for all 351 PUBLISHED-empty lessons
3. **Verify** the 448 suspicious lessons — check if any are PUBLISHED with visible issues

### Phase B: Fix Generator Logic

1. **Add subject detection** — use `ThemeSubject.subject` field, not just title parsing
2. **Add subject-specific templates** — Math journeys must use Math language
3. **Add validation gates** — reject journeys that contain forbidden phrases for the subject
4. **Add per-lesson review** — no bulk generation without individual verification

### Phase C: Build Subject-Specific Validators

See `docs/lesson-quality/subject-specific-journey-validators.md`

### Phase D: Generate Replacements (Local Only)

1. Use source packs (curriculum CSV data) for generation context
2. Generate journeys to `studentJourneyDraft` ONLY
3. Validate each journey before writing
4. Browser-test samples before scaling

### Phase E: Review and Approve

1. Victor reviews sample journeys
2. Approve specific lessons for publishing
3. Copy `studentJourneyDraft` → `studentJourney` only after approval
4. Set `status = PUBLISHED` and `isAvailable = true` only after approval

## What NOT to Do

- Do NOT mass-regenerate all 843 lessons
- Do NOT write to `studentJourney` directly
- Do NOT set `status = PUBLISHED` without review
- Do NOT use title-only subject detection
- Do NOT use English fallback templates for non-English subjects
