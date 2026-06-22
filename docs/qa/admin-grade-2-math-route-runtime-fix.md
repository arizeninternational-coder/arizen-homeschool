# Admin Grade 2 Math Route Runtime Fix — Final

**Date:** 2026-06-21  
**Branch:** grade-2-english-journey-batch-1-june2026  
**Commit:** `0c6583c`  
**Build:** ✅ PASS  
**Push:** ✅ Succeeded  

## Root Cause

**File:** `src/app/dashboard/admin/lessons/[id]/student-view/page.tsx`  
**Line:** 119 (was missing)

The `AdminStudentLessonEditor` component referenced `lesson` throughout (lines 137, 174, 188, 201, 215, 228, 240) but never declared the state variable. Only `lessonId` was declared:

```tsx
// BEFORE (broken):
const [lessonId, setLessonId] = useState<string>("");
// ... later uses lesson.contentBlocks, setLesson(), etc. — lesson is undefined!

// AFTER (fixed):
const [lessonId, setLessonId] = useState<string>("");
const [lesson, setLesson] = useState<any>(null);
```

## Why It Affected the Grade Page

The grade subject page (`/dashboard/admin/grades/2/mathematics`) renders `<Link>` components pointing to `/dashboard/admin/lessons/${id}/student-view`. When Next.js prefetches or navigates to these routes, the student-view chunk loads and crashes with `ReferenceError: lesson is not defined`.

## Fix

Added the missing `useState` declaration:
```tsx
const [lesson, setLesson] = useState<any>(null);
```

## Data Safety

- ✅ No Supabase writes
- ✅ No journey data modified
- ✅ No approval or publish actions
- ✅ Target lesson draft still clean
- ✅ Target lesson live journey still unchanged
- ✅ No status/visibility changes

## Deployment Status

- ✅ Commit `0c6583c` pushed to remote
- ✅ Remote branch `grade-2-english-journey-batch-1-june2026` updated
- ⏳ Vercel deployment pending — user should verify on preview
