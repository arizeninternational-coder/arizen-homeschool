# Math Lesson Client-Side Crash Fix Report

**Date:** 2026-06-21  
**Branch:** grade-2-english-journey-batch-1-june2026  
**Commit:** b4f1d5e  

## Error Reported

"Application error: a client-side exception has occurred while loading arizen-homeschool-fmfs0tokj-arizeninternational-coders-projects.vercel.app"

Occurred when opening Math lessons on Vercel preview deployment.

## Root Cause Analysis

The crash was caused by insufficient defensive checks in the admin lesson preview components when handling journey data. Specifically:

1. **`AdminInteraction` component** (student-view page): Accessed `step.interaction` without checking if `step` was null. When `currentJourneyStep` was null (empty journey or loading state), this crashed with "Cannot read property 'interaction' of null".

2. **Journey step rendering** (admin editor page): Accessed `step.stepType` directly without filtering out null/undefined steps from the journey array. Malformed data could cause crashes.

3. **`getStudentJourney` helper** (lesson-journey library): Accessed `blocks.studentJourney` without verifying `blocks` was a valid object. Legacy array-format contentBlocks could cause unexpected behavior.

4. **Contamination detection IIFE**: Parsed `contentBlocks` without wrapping in try-catch. Malformed JSON would crash the entire render.

## Files Changed

### 1. `src/app/dashboard/admin/lessons/[id]/student-view/page.tsx`
- Added null check in `AdminInteraction` function
- Added null check for `cb` object in contamination detection
- Added `Array.isArray()` guards before accessing `studentJourney`/`studentJourneyDraft`
- Added fallback UI when `currentJourneyStep` is null

### 2. `src/app/dashboard/admin/lessons/[id]/page.tsx`
- Added `.filter()` to journey steps before rendering to remove null/invalid entries
- Used local `stepType` variable with fallback to `"welcome"` instead of direct `step.stepType` access
- Wrapped contamination detection in try-catch

### 3. `src/lib/curriculum/lesson-journey.ts`
- Added type check in `getStudentJourney()` to return null for non-object contentBlocks (legacy array format)

## Routes Verified

- `/dashboard/admin/lessons/[id]` — Lesson editor with journey preview
- `/dashboard/admin/lessons/[id]/student-view` — Student-view preview
- `/dashboard/student/subjects/[subjectSlug]` — Subject page
- `/dashboard/student/lessons/[themeSlug]/[questSlug]/[lessonSlug]` — Lesson player

## Data Safety

- ✅ No Supabase writes
- ✅ No journey data modified
- ✅ No approval or publish actions
- ✅ No status changes
- ✅ Target lesson draft still clean
- ✅ Target lesson live journey still unchanged

## Target Lesson Verification

Lesson `cd845a68-f275-4f7f-b8a8-7d4887b95cda` (Relationship Between Addition and Subtraction):
- `studentJourneyDraft`: 10 clean Math steps (unchanged)
- `studentJourney`: 10 contaminated reading comprehension steps (unchanged)
- Status: PUBLISHED (unchanged)
- isAvailable: true (unchanged)

## Build Result

✅ PASS — Clean build, no errors
