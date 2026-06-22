# Admin Grade 2 Math Route Runtime Fix — Root Cause

**Date:** 2026-06-21  
**Branch:** grade-2-english-journey-batch-1-june2026  
**Build:** ✅ PASS  

## Exact Failing Route
`/dashboard/admin/grades/2/mathematics`

## Exact Error
`ReferenceError: lesson is not defined`

## Root Cause

**File:** `src/app/dashboard/admin/lessons/[id]/student-view/page.tsx`  
**Line:** 118 (component function body)

The `AdminStudentLessonEditor` component in the student-view page was missing the `lesson` state variable declaration. The component used `setLesson()` in multiple places (lines 174, 188, 201, 215, 228, 240) and referenced `lesson` directly (line 137: `buildLessonJourney(lesson, viewMode)`), but never declared `const [lesson, setLesson] = useState<any>(null)`.

The component only had:
```tsx
const [lessonId, setLessonId] = useState<string>("");
```

But was missing:
```tsx
const [lesson, setLesson] = useState<any>(null);
```

This caused a `ReferenceError: lesson is not defined` at runtime when the component rendered.

## Why It Affected the Grade Page

The grade subject page (`/dashboard/admin/grades/2/mathematics`) renders lesson cards with `<Link>` components pointing to `/dashboard/admin/lessons/${id}/student-view`. When Next.js prefetches these links (or when the user navigates to them), the student-view chunk loads and the component crashes because `lesson` is undefined.

## Fix Applied

Added the missing `useState` declaration:
```tsx
const [lesson, setLesson] = useState<any>(null);
```

## Files Changed

- `src/app/dashboard/admin/lessons/[id]/student-view/page.tsx` — Added missing `lesson` state declaration

## Data Safety

- ✅ No Supabase writes
- ✅ No journey data modified
- ✅ No approval or publish actions
- ✅ Target lesson draft still clean
- ✅ Target lesson live journey still unchanged
- ✅ No status changes

## Status

⚠️ **Git push timed out** — The fix is committed locally but could not be pushed to remote due to network issues. The commit needs to be pushed.
