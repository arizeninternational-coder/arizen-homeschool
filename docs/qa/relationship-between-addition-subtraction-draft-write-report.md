# Relationship Between Addition and Subtraction — Draft Write Report

**Date:** 2026-06-21  
**Lesson ID:** `cd845a68-f275-4f7f-b8a8-7d4887b95cda`  
**Title:** Relationship Between Addition and Subtraction  

## What Was Done

Wrote the clean Math POC journey to `contentBlocks.studentJourneyDraft` only.

## Source

`curriculum-source-packs/grade-2/math/poc/relationship-between-addition-and-subtraction-journey.json`

- 10 steps
- Math content (addition/subtraction relationships, fact families, missing numbers)
- Zero reading-comprehension contamination
- Validated: 232/232 checks passed

## Target Confirmed

| Field | Value |
|-------|-------|
| id | `cd845a68-f275-4f7f-b8a8-7d4887b95cda` |
| title | Relationship Between Addition and Subtraction |
| grade | 2 |
| subject | Mathematics |
| strand | Numbers |
| sub_strand | 1.5 Subtraction |
| status | PUBLISHED |
| isAvailable | true |

## Backup

`backups/grade-2-math-poc-before-draft-write/cd845a68-f275-4f7f-b8a8-7d4887b95cda-before-draft-write.json`

## Field Changed

Only: `contentBlocks.studentJourneyDraft`

## Verification

| Check | Result |
|-------|--------|
| Exactly 1 lesson updated | ✅ |
| studentJourneyDraft has 10 steps | ✅ |
| studentJourneyDraft has Math content | ✅ |
| No reading comprehension in draft | ✅ |
| No "main idea" in draft | ✅ |
| studentJourney unchanged (still contaminated) | ✅ |
| status unchanged (PUBLISHED) | ✅ |
| isAvailable unchanged (true) | ✅ |
| No other lessons modified | ✅ |

## Draft Steps

1. [welcome] Welcome! — "addition and subtraction are connected"
2. [mission] Our Mission — "find missing numbers using the connection"
3. [think_first] Think First! — mangoes story, open response
4. [learn] Learn It — fact families, opposites, missing numbers
5. [connect] Real Life Connection — shopping, sharing, everyday math
6. [example] Watch and Learn — worked examples, number patterns
7. [practice] Your Turn! — 8 practice problems
8. [quick_check] Quick Check! — MCQ: 8 + ___ = 15
9. [reflect] Think About Your Learning — open response
10. [complete] You Did It! — celebration

## Admin Preview Behavior

The admin student-view preview (`/dashboard/admin/lessons/[id]/student-view`) reads `studentJourney` (published) first, falling back to `studentJourneyDraft` only if published is empty.

**Since `studentJourney` still has 10 contaminated steps, the preview will show the OLD contaminated content, not the clean draft.**

This is by design — the draft is a working copy. To make the clean journey visible in preview, the draft must be **approved** (which copies it to `studentJourney`).

## Recommended Next Step

Victor should review the draft in the admin lesson editor. The draft can be viewed in the journey panel of the editor. If it looks good, the next step would be to **approve** the draft (copies to `studentJourney`), but that requires explicit approval per the safety protocol.
