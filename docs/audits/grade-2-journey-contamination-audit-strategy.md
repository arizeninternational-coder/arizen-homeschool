# Grade 2 Journey Contamination Audit Strategy

## Purpose

Identify every Grade 2 lesson where the journey content does not match the lesson's subject, title, strand, sub-strand, or learning outcome. This is a read-only audit — no data will be modified.

## Background

A known example: "Relationship Between Addition and Subtraction" (Mathematics) has a journey teaching English reading comprehension ("What is the main idea?", "Read a short passage"). This suggests systemic contamination — English fallback templates may have been applied to Mathematics lessons, or the generator confused subjects.

## Audit Categories

### 1. Subject Contamination
Journey teaches a different subject than the lesson's assigned subject.
- **Math lesson** → journey teaches reading comprehension, grammar, English vocabulary
- **English lesson** → journey teaches arithmetic, fractions, number patterns
- **Kiswahili lesson** → journey is mostly English without translation support
- **Hygiene/Environmental/Movement** → journey teaches Math or English content

### 2. Strand Mismatch
Journey teaches a different strand than the lesson's assigned strand.
- **Subtraction lesson** → journey teaches fractions, reading, hygiene, or movement

### 3. Learning Outcome Mismatch
Journey does not teach the stated learning outcome.
- Outcome: "work out missing numbers in patterns involving subtraction up to 100"
- Journey: "What did you learn about reading today?"

### 4. Title-Copying
Journey repeats the lesson title verbatim but does not teach the concept.

### 5. Generic Fallback Content
Journey uses generic phrases without lesson-specific teaching:
- "Here is what you need to know"
- "This is an example sentence"
- "We use this every day"
- "Take a moment to think"
- "Let's learn about this topic"
- "This is important for your learning"

### 6. Duplicate Text
Same content repeated across owlText, studentText, and interaction fields.

### 7. Wrong Media Strategy
- Video controls on steps where video does not belong
- Missing visual support for Math (no diagram/number line/counters)
- No media where essential for the concept

### 8. Weak Practice Step
Practice is passive, repeated, generic, or does not scaffold the skill.
- Just says "Your Turn" with no actual practice content
- Practice does not match the lesson objective

### 9. Invalid Quick Check
- Wrong subject content in Quick Check
- Missing correctIndex
- Answer leak (owlText reveals the answer)
- Unrelated options
- Unsupported concept tested

### 10. Reflection Mismatch
Reflection prompt does not match the subject.
- Math lesson → "What did you learn about reading?"
- English lesson → "What numbers did you learn?"

### 11. Published-Empty Issue
Lessons with `status = PUBLISHED` but `studentJourney` is empty or has 0 steps.

### 12. Draft/Live Mismatch
`studentJourneyDraft` may be correct while `studentJourney` is stale or contaminated, or vice versa.

## Data Sources

- **Primary**: `Lesson.contentBlocks` (JSON field containing `studentJourney` and `studentJourneyDraft`)
- **Metadata**: `Lesson.title`, `Lesson.status`, `Lesson.slug`
- **Subject**: `ThemeSubject.subject` via `Quest.themeId`
- **Strand/Sub-strand**: `Lesson.contentBlocks.curriculum.strand`, `contentBlocks.curriculum.subStrand`
- **Learning Outcome**: `Lesson.contentBlocks.curriculum.specificLearningOutcome`

## Scope

- **Only Grade 2 lessons** (Theme.grade = 2)
- **All subjects**: Mathematics, English, Kiswahili, Environmental, Hygiene, Movement
- **Both journeys**: `studentJourney` (published) and `studentJourneyDraft` (draft)
- **Read-only**: No Supabase writes

## Output Files

1. `docs/audits/grade-2-journey-contamination-report.csv` — Per-lesson detail
2. `docs/audits/grade-2-journey-contamination-summary.md` — Executive summary
3. `docs/audits/grade-2-contaminated-lessons.json` — Machine-readable full data
4. `docs/audits/grade-2-journey-contamination-root-cause.md` — Root cause analysis
5. `docs/audits/grade-2-journey-repair-plan.md` — Repair strategy (not executed)
