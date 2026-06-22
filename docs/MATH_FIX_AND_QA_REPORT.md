# MATH RECOVERY — FIX & QA REPORT
**Date:** 2026-06-16
**Branch:** `grade-2-english-journey-batch-1-june2026`
**Commits:** `c37fd90` (fix), `10b821e` (QC fixes), `c0c79c6` (QA report)
**New Preview:** https://arizen-homeschool-daqmdarws-arizeninternational-coders-projects.vercel.app
**Build:** ✅ Passes

---

## FIXES APPLIED

### 1. Admin Preview Draft Display Bug — FIXED ✅
**File:** `src/app/dashboard/admin/lessons/[id]/student-view/page.tsx` line 100

**Before:**
```js
return cb?.studentJourney || cb?.studentJourneyDraft || [];
```

**After:**
```js
const publishedJourney = Array.isArray(cb?.studentJourney) ? cb.studentJourney : [];
const draftJourney = Array.isArray(cb?.studentJourneyDraft) ? cb.studentJourneyDraft : [];
return publishedJourney.length > 0 ? publishedJourney : draftJourney;
```

**Verified:** Admin preview now shows all 10 draft steps for Math lessons. Tested 3 lessons (Addition, Fractions, Multiplication) — all render correctly with SVG illustrations.

**Scope:** Admin preview only. Student-facing route unchanged (uses published journey only).

### 2. Wrong Multiplication QC Answers — FIXED ✅

| Lesson | Question | Before | After |
|--------|----------|--------|-------|
| Multiplying by 3 and 4 | What is 4 × 4? | 15 ❌ | **16** ✅ |
| Multiplying by 5 and 10 | What is 6 × 10? | 55 ❌ | **60** ✅ |
| Writing Multiplication Sentences | What is 4 × 2? | 9 ❌ | **8** ✅ |

**Verified:** DB validation confirms correct answers. Admin preview shows correct questions.

**Scope:** Only `studentJourneyDraft.quick_check` updated. `isAvailable=false`, `studentJourney` unchanged.

---

## VALIDATION

- **38/38 Math drafts clean** ✅
- All have 10 steps, SVG, video
- All `isAvailable=false`
- All `studentJourney` empty (not published)
- No non-Math lessons touched
- No Grade 5 lessons touched
- Build passes ✅

---

## VIDEO REVIEW TABLE

**8 unique YouTube videos across 38 lessons.** All need human review (cannot auto-fetch titles).

| Video ID | URL | Used In | Strands | Reused? | Review |
|----------|-----|---------|---------|---------|--------|
| pAtrNu8y6FQ | https://youtube.com/watch?v=pAtrNu8y6FQ | 11 lessons | Addition, Numbers, Fractions | ⚠️ Cross-strand | ❓ Needs human review |
| gBXbs6lVRuo | https://youtube.com/watch?v=gBXbs6lVRuo | 6 lessons | Subtraction | ✓ Same strand | ❓ Needs human review |
| bo2A425u6hk | https://youtube.com/watch?v=bo2A425u6hk | 9 lessons | Numbers, Multiplication | ⚠️ Cross-strand | ❓ Needs human review |
| jEYs9Z2w8oU | https://youtube.com/watch?v=jEYs9Z2w8oU | 3 lessons | Numbers, Fractions | ⚠️ Cross-strand | ❓ Needs human review |
| lxyjIFHXSCA | https://youtube.com/watch?v=lxyjIFHXSCA | 1 lesson | Fractions | ✓ Single | ❓ Needs human review |
| lTcewUmUnyE | https://youtube.com/watch?v=lTcewUmUnyE | 2 lessons | Fractions | ✓ Same strand | ❓ Needs human review |
| iO7owL6Xr_M | https://youtube.com/watch?v=iO7owL6Xr_M | 1 lesson | Fractions | ✓ Single | ❓ Needs human review |
| eW1fMMcN0oA | https://youtube.com/watch?v=eW1fMMcN0oA | 3 lessons | Multiplication | ✓ Same strand | ❓ Needs human review |

**Concerns:**
- `pAtrNu8y6FQ` used for 11 lessons across Addition, Numbers, AND Fractions — likely not relevant to all
- `bo2A425u6hk` used for 9 lessons across Numbers and Multiplication — likely not relevant to all
- `jEYs9Z2w8oU` used for Numbers AND Fractions lessons

**Full details:** `docs/MATH_VIDEO_REVIEW.json`

---

## STATUS

| Item | Status |
|------|--------|
| Admin preview bug | ✅ Fixed |
| 3 wrong QC answers | ✅ Fixed |
| 38 Math drafts validated | ✅ Clean |
| Build | ✅ Passes |
| Admin preview shows drafts | ✅ Verified |
| Video relevance | ❓ Needs human review |
| Student route shows only published | ✅ Confirmed |

---

## NEXT STEPS (before publish approval)

1. **Human video review** — Check 8 YouTube videos for relevance/child-safety
2. **Browser QA** — Now that admin preview works, test all 8 priority lessons end-to-end
3. **Publish approval** — After video review + browser QA pass

**Math is NOT yet ready for publish.** Blocked by video review.
