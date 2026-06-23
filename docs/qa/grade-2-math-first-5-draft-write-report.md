# Grade 2 Math First 5 — Draft Write Pre-Report

## Target Lessons

| # | Lesson ID | Title | Status | isAvailable | Live Steps | Draft Steps | State | Local File | Gen Steps | Validation |
|---|-----------|-------|--------|-------------|------------|-------------|-------|------------|-----------|------------|
| 1 | e0000001-0000-0000-0000-000000000001 | Counting by Ones | PUBLISHED | true | 0 | 0 | empty | 01-counting-by-ones.json | 10 | ✅ PASS |
| 2 | e0000002-0000-0000-0000-000000000002 | Counting by Tens | PUBLISHED | true | 0 | 0 | empty | 02-counting-by-tens.json | 10 | ✅ PASS |
| 3 | e0000003-0000-0000-0000-000000000003 | Reading and Writing Numbers | PUBLISHED | true | 0 | 0 | empty | 03-reading-and-writing-numbers.json | 10 | ✅ PASS |
| 4 | 981b27eb-9d0d-4450-9bed-e76f1ba54c96 | Adding Two 2-Digit Numbers Without Regrouping | PUBLISHED | true | 0 | 10 | draft-only | 15-adding-two-2-digit-numbers-without-regrouping.json | 10 | ✅ PASS |
| 5 | 17d7857a-a622-4b09-8524-db7be78977f8 | Subtracting 2-Digit Numbers Without Regrouping (Vertical) | PUBLISHED | true | 0 | 10 | draft-only | 35-subtracting-2-digit-numbers-without-regrouping-ver.json | 10 | ✅ PASS |

## Fields to Change
- `contentBlocks.studentJourneyDraft` ← from local generated JSON

## Fields NOT to Change
- `contentBlocks.studentJourney` (live journey untouched)
- `status` (PUBLISHED)
- `isAvailable` (true)
- `title`, `slug`, `description`
- `strand`, `subStrand`, `learningOutcome`
- `rewards`, `difficulty`, `xpReward`
- Any other field

## Expected Result
- 5 lessons updated
- Each `studentJourneyDraft` has 10 clean Math steps
- Zero contamination in all 5 drafts
- `studentJourney` unchanged for all 5
- Status unchanged for all 5
- No other lessons modified
