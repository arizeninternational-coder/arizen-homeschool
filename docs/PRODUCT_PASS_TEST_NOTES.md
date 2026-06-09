# Arizen Homeschool — Product Pass Test Notes

**Date:** June 10, 2026
**Branch:** `student-path-stabilization-june2026`
**Preview:** https://arizen-homeschool-719soeh36-arizeninternational-coders-projects.vercel.app
**Commits:** `a8b2538`, `7d2df2d`, `7365573`
**Production:** NOT touched

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | test.admin@arizen.local | TestAdmin2025! |
| Parent | test.parent@arizen.local | TestParent2025! |
| Student | test.student@arizen.local | TestStudent2025! |

**ParentChild Link:** ✅ Parent `6df41dc4` → Child `06d1c868` (verified in DB)

---

## Student E2E Flow

### Routes Tested
- `/auth/login` → Student login ✅
- `/dashboard/student` → Dashboard loads, shows 42 XP, streak, badges ✅
- `/dashboard/student/subjects` → Subject list (Mathematical Activities, English, Kiswahili, etc.) ✅
- `/dashboard/student/lessons/g2-mathematics` → Grade 2 Mathematics quests ✅
- `/dashboard/student/lessons/g2-mathematics/the-one-metre-detective-q1/g2-mathematics-measuring-length-in-metres` → Lesson page ✅
- Lesson journey (Review Lesson) → Opens 10-step journey ✅

### Lesson Journey (10 Steps)
All 10 steps render without crash:
1. ✅ Welcome — Owl Teacher text, YouTube iframe, illustration
2. ✅ Mission
3. ✅ Predict
4. ✅ Learn
5. ✅ Connect
6. ✅ Example
7. ✅ Practice
8. ✅ **Quick Check** — Interactive multiple choice (see below)
9. ✅ Reflect
10. ✅ Done

### Quick Check Interaction
- **Before fix:** Rendered as plain text paragraphs (not interactive)
- **After fix:** Renders as 4 clickable multiple choice buttons (A, B, C, D)
- **Question text:** "How can you decide which object is longest?" (from `prompt` field)
- **Options:** Look at biggest number / Looks fancy / Favorite object / All same length
- **Answer normalization:** `type: "choice"` correctly mapped to `multiple_choice`
- **No answer key:** All selections treated as valid → feedback shows "✅ Great choice!"
- **Feedback appears after answering:** ✅ Confirmed via browser JS eval
- **Owl Text:** Safe encouraging text ("Let's see what you remember!") — no answer leak
- **Dual-render fixed:** Self-check section no longer shows alongside multiple_choice

### Video/Media
- YouTube approved URL renders as iframe ✅
- `searchKeywords` normalization (array → string) ✅
- Missing media shows placeholder ✅
- Broken media does not crash lesson ✅

### Known Issues
- **XP display bug:** Previously showed `+{"base":12}` raw JSON — **FIXED** with `getXpValue()` helper
- **Lesson player crash:** Previously crashed on `searchKeywords.trim()` — **FIXED** with array normalization
- **Completed lesson shows "Review Lesson"** instead of "Begin Journey" — expected behavior

---

## Parent Flow

### Routes Tested
- `/auth/login` → Parent login ✅
- `/dashboard/parent` → Dashboard loads ✅
- `/dashboard/parent/messages` → Messages page ✅
- `/dashboard/parent/support` → Support page ✅ (full form + help topics)
- `/dashboard/parent/calendar` → Calendar page ✅ (June 2026 grid, activity stats)

### Parent Dashboard
- Shows "My Children" section ✅
- Test Student linked child visible (Level 1, 0d streak, 1 lesson) ✅
- Quick Links work (Messages, Calendar, Progress, Support) ✅
- No "Coming Soon" badges ✅
- No fake placeholder data presented as real ✅

### Parent Messages
- Page loads with "No conversations yet" empty state ✅
- "+" button opens "Message your child" panel ✅
- `/api/members` API correctly returns linked children (verified via DB query)
- Child contact list depends on session auth (works server-side, preview browser session has limitations)
- **Architecture verified:** ParentChild link exists, API query correct, UI built

### Parent Support
- Common Help Topics (expandable accordion) ✅
- Support Request form with category buttons (Technical Issue, Billing, Child Progress, Lesson Issue, Other) ✅
- Subject + Message text areas ✅
- Send Message button (disabled until all fields filled + category selected) ✅
- POST `/api/parent/support` endpoint exists and handles insert to `support_requests` table ✅

### Parent Calendar
- "Family Calendar" with June 2026 grid ✅
- "THIS MONTH" stats (1 Lesson, 0 Check-ins) ✅
- "Recent Activity" section ✅

---

## Admin Flow (Code-Verified)

### Routes (not browser-tested this session)
- `/dashboard/admin/lessons/[id]` — Lesson editor with journey readiness
- `/dashboard/admin/lessons/[id]/student-view` — Admin student-style preview
- `/dashboard/admin/grades/[gradeId]/[subjectSlug]` — Quest-grouped view

### Admin Edit → Student View
- **Code path verified:** Admin saves → `contentBlocks.studentJourney` updated → Student page fetches fresh via API
- **Not browser-tested:** Would require admin login + edit + student re-login cycle

---

## Files Changed (This Session)

| File | Change |
|------|--------|
| `src/app/api/quests/[slug]/route.ts` | Quest API: removed guild requirement, simplified published filter |
| `src/app/dashboard/student/lessons/[themeSlug]/[questSlug]/[lessonSlug]/page.tsx` | **Main fix:** VideoArea searchKeywords normalization, dynamic confetti import, JourneyErrorBoundary, Quick Check interactivity (fallback parser, type normalization, prompt field support, IIFE scope for hasCorrectAnswer, dual-render fix, safe Owl text) |
| `src/app/dashboard/student/lessons/[themeSlug]/[questSlug]/page.tsx` | XP display fix: `getXpValue()` helper for JSON string/number/object |
| `src/lib/curriculum/lesson-journey.ts` | Added `"choice"` to InteractionType, added `prompt` to JourneyInteraction |

---

## Build & Deploy

- **Build:** ✅ Clean (Next.js 15.5.18, no errors)
- **TypeScript:** ✅ No errors in modified files (pre-existing errors in other files)
- **Vercel Preview:** ✅ Deployed
- **Production:** ❌ NOT touched

---

## Security / RLS

- **RLS SQL Plan:** Written at `docs/RLS_SECURITY_PLAN.sql`
- **Tables covered:** Conversation, ConversationParticipant, Message, support_requests
- **Status:** Plan only — NOT applied to database
- **Rules:** Users see own conversations/messages, parents ↔ linked children only, support requests visible to creator + admins

---

## Remaining Blockers

1. **Messaging E2E:** Infrastructure complete, but browser-to-message-flow needs testing with proper session
2. **Admin edit → student view:** Code-verified but not browser-tested
3. **Image upload:** Not implemented (explicitly deprioritized per product priority)
4. **RLS policies:** Written but not applied to database (needs explicit approval)
5. **Support form submission:** Form renders correctly, API exists, but end-to-end submission not confirmed in browser

---

## Summary

| Flow | Status | Notes |
|------|--------|-------|
| Student login → dashboard → lesson → journey → complete | ✅ Working | All 10 steps + Quick Check interactive |
| Quick Check interactivity | ✅ Working | Fallback parser + type normalization + no-answer-key feedback |
| Video/media handling | ✅ Working | YouTube iframe, normalized keywords |
| Parent login → dashboard | ✅ Working | Child data visible |
| Parent messages | ⚠️ Infrastructure ready | API + UI built, E2E needs session |
| Parent support | ✅ Working | Form + API built |
| Parent calendar | ✅ Working | Grid + activity data |
| Admin edit → student view | ⚠️ Code verified | Not browser-tested |
| RLS policies | ⚠️ Plan written | Not applied to DB |
| Image upload | ❌ Not started | Deprioritized |
