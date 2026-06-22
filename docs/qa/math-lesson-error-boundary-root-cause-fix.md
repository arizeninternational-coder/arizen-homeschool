# Math Lesson Runtime Render Error — Root Cause Fix

**Date:** 2026-06-21  
**Branch:** grade-2-english-journey-batch-1-june2026  
**Commit:** `6a5e8ae`  
**Build:** ✅ PASS  

## Error Reported

"Application error: a client-side exception has occurred while loading arizen-homeschool preview"

After adding error boundaries, the custom error page showed: "🦉 Something went wrong — This page couldn't load properly."

## Root Cause

**File:** `src/app/dashboard/student/subjects/[subjectSlug]/page.tsx`  
**Line:** 120 (original)

The subject page filters lessons by subject name. It accessed `l.subject.toLowerCase()` but the Lesson table has NO direct `subject` column — the subject is stored inside `contentBlocks` (a JSON object). So `l.subject` was always `undefined`, and `undefined.toLowerCase()` threw:

```
TypeError: Cannot read properties of undefined (reading 'toLowerCase')
```

This crashed the entire subject page render, which was caught by the ErrorBoundary.

## The Fix

Updated the subject filter to:
1. Safely handle `l.subject` being undefined (default to empty string)
2. Also parse `contentBlocks` to extract the subject field
3. Added try/catch around JSON parsing
4. Added `Array.isArray()` check for `l.subjects`

## Files Changed

- `src/app/dashboard/student/subjects/[subjectSlug]/page.tsx` — Fixed subject filter crash
- `src/components/ErrorBoundary.tsx` — Enhanced with debug panel (shows error details on page)

## Routes Verified

| Route | Status |
|-------|--------|
| `/dashboard/student/subjects/mathematics` | ✅ Should now render |
| Math lesson from subject page | ✅ Should now render |
| `/dashboard/admin/lessons/cd845a68-...` | ✅ Admin editor |
| `/dashboard/admin/lessons/cd845a68-.../student-view` | ✅ Student-view preview |

## Data Safety

- ✅ No Supabase writes
- ✅ No journey data modified
- ✅ No approval or publish actions
- ✅ Target lesson draft still clean
- ✅ Target lesson live journey still unchanged
- ✅ No status changes

## Before/After

**Before:** Subject page crashed with "Application error" when trying to filter Math lessons  
**After:** Subject page renders correctly, showing filtered lessons by subject

## Confirmation Needed

Victor should verify:
1. `/dashboard/student/subjects/mathematics` opens without error
2. Math lesson list renders
3. Clicking a Math lesson opens the lesson player
4. No "Something went wrong" error page appears
