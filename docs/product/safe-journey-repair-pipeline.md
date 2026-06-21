# Safe Journey Repair Pipeline

## Purpose

Define a safe, repeatable process for repairing contaminated journeys without risking further contamination or data loss.

## Pipeline Stages

### Stage 1: Identify
- Run audit script to identify contaminated lessons
- Classify by severity (contaminated, suspicious, empty)
- Group by topic for batch repair
- **Output**: List of lessons to repair, grouped by topic

### Stage 2: Map to Source Pack
- For each lesson, identify the source pack (KICD curriculum CSV)
- Extract: strand, sub-strand, learning outcome, suggested learning experience
- Verify source pack data matches the lesson metadata
- **Output**: Source pack data for each lesson

### Stage 3: Build/Approve Topic Source Pack
- Create a topic-specific source pack with:
  - Key vocabulary
  - Concept explanations
  - Worked examples
  - Practice problem types
  - Visual/SVG requirements
  - Video keywords (if appropriate)
- Victor approves the source pack before generation
- **Output**: Approved source pack per topic

### Stage 4: Generate One Local POC
- Generate ONE journey for the first lesson in the topic
- Output to local JSON file ONLY (no DB writes)
- Use the approved source pack as context
- **Output**: `scratch/journey-poc-[lesson-slug].json`

### Stage 5: Validate Local POC
- Run validator against the local POC
- Check for forbidden phrases
- Check for required elements
- Check for Math-specific content
- **Output**: Validation report

### Stage 6: Victor Review
- Victor reviews the local POC journey
- Checks content accuracy, age-appropriateness, visual quality
- Approves or requests changes
- **Output**: Approved POC

### Stage 7: Write POC to `studentJourneyDraft` Only
- Backup the lesson's current contentBlocks
- Write the approved POC to `studentJourneyDraft` field
- Do NOT touch `studentJourney` (published)
- Do NOT change `status`
- **Output**: POC in draft, visible in admin preview

### Stage 8: Browser-Test Admin Preview
- Open the lesson in admin preview mode
- Verify: no "Owl Teacher says" label, correct content, working interactions
- Verify: Quick Check works, Practice has content, visuals render
- **Output**: Browser test confirmation

### Stage 9: Generate Remaining Local JSONs
- Generate journeys for remaining lessons in the topic
- Output all to local JSON files
- Validate each one
- **Output**: `scratch/journey-[lesson-slug].json` for each lesson

### Stage 10: Validate All
- Run batch validator on all generated journeys
- Flag any that fail validation
- Fix failures before proceeding
- **Output**: Batch validation report

### Stage 11: Victor Review Batch
- Victor reviews sample journeys from the batch
- Approves the full batch or requests changes
- **Output**: Batch approval

### Stage 12: Write Drafts to `studentJourneyDraft`
- Backup all lessons' current contentBlocks
- Write approved journeys to `studentJourneyDraft` for all lessons in batch
- Do NOT touch `studentJourney`
- Do NOT change `status`
- **Output**: All drafts in `studentJourneyDraft`

### Stage 13: Post-Repair Audit
- Run the contamination audit again on repaired lessons
- Verify: 0 contaminated, 0 suspicious
- **Output**: Clean audit report

### Stage 14: Approve/Publish (Separate Decision)
- Only after all above stages are complete
- Victor decides which lessons to publish
- Copy `studentJourneyDraft` → `studentJourney` for approved lessons
- Set `isAvailable = true` for approved lessons
- **Output**: Clean, published Math journeys

## Strict Rules

1. **NEVER write directly to `studentJourney`** — always go through `studentJourneyDraft` first
2. **NEVER set status automatically** — status changes require explicit Victor approval
3. **NEVER run a generator without dry-run/local output first** — always generate to local JSON first
4. **NEVER repair all topics at once** — one topic at a time, with review between
5. **ALWAYS backup before DB writes** — create a backup script that saves current contentBlocks
6. **ALWAYS validate before DB writes** — run validator on every journey before writing
7. **ALWAYS browser-test samples** — verify in admin preview before scaling
8. **ALWAYS keep source pack as source of truth** — use KICD data, not title guessing
9. **NEVER use `journey-engine-v3.js` without fixing the default fallback** — it will contaminate again
10. **NEVER use English generators for Math lessons** — subject detection must use `ThemeSubject` table

## Backup Strategy

Before any DB write:
```javascript
// Backup current contentBlocks
const { data } = await db.from('Lesson').select('id, contentBlocks').eq('id', lessonId);
fs.writeFileSync(`backups/${lessonId}-${Date.now()}.json`, JSON.stringify(data[0].contentBlocks));
```

## Rollback Plan

If a repair goes wrong:
1. Restore from backup: `contentBlocks` → backup JSON
2. Verify with audit script
3. Investigate the failure
4. Fix the generator
5. Re-attempt with smaller batch
