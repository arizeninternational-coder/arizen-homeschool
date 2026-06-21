# Product Quality Audit — June 2026

## Executive Summary

Arizen School has a solid foundation: working student dashboard, parent dashboard, lesson player, admin tools, and Supabase backend. But the product currently feels like a set of disconnected pages rather than a coherent learning system. This audit identifies the gaps and provides a roadmap to make it feel like a real, connected learning product.

**Overall health: Functional but fragmented. Core flows work; the connective tissue between them is weak or missing.**

---

## 1. Student Dashboard (`/dashboard/student/page.tsx`)

### What works
- Beautiful greeting card with XP, coins, badges, lessons done
- EQ emotion check-in (POST/GET working against `EmotionalCheckin` table)
- "Today's Learning Plan" card grid showing lessons
- Weekly progress bar (hardcoded — first 3 days green, today indigo, rest gray)
- Subject pills linking to `/dashboard/student/subjects`

### Issues

| # | Issue | Root Cause | Data Source | Should Happen | Safe to Fix | DB Change? |
|---|-------|-----------|-------------|---------------|-------------|------------|
| 1 | "Today's Learning Plan" shows ALL lessons, not today's | `deduplicateBySubject(allLessons, 5)` just takes first 5 unique subjects — no date filtering | `/api/learner/lessons` returns all PUBLISHED lessons | Show only lessons assigned/scheduled for today | Yes — frontend only | No |
| 2 | Weekly progress bar is hardcoded | Days M-W always green, T always indigo, F-S always gray — not based on real data | None (static) | Show real check-in/completion data per day | Yes — frontend only | No |
| 3 | "This Week" widget shows aggregate count, not per-day breakdown | No per-day data fetched | API returns aggregate only | Show real daily activity | Needs API change | No |
| 4 | Subject pills link to subject list page, not subject-specific lesson view | Link goes to generic subjects page | — | Clicking Math should show Math lessons | Yes — change link target | No |

---

## 2. Subjects Page (`/dashboard/student/subjects/page.tsx`)

### What works
- Loads subjects from `/api/learner/subjects` (ThemeSubject table)
- Shows subject cards with lesson count
- Links to `/dashboard/student/lessons/${themeSlug}`

### Issues

| # | Issue | Root Cause | Data Source | Should Happen | Safe to Fix | DB Change? |
|---|-------|-----------|-------------|---------------|-------------|------------|
| 5 | Subject page is just a grid of cards — no subject-specific lesson list | Page only shows subject cards, clicking goes to theme page which shows quests | — | Subject page should show: today's lesson, this week's lessons, all lessons by status, weekly quest | Yes — new page component | No |
| 6 | No weekly quest shown on subject page | Quests are at theme/subject level, not exposed on subject page | Quest table | Show the weekly quest for each subject | Yes | No |

---

## 3. Theme Detail Page (`/dashboard/student/lessons/[themeSlug]/page.tsx`)

### What works
- Shows theme header with progress
- Lists quests with lesson counts
- Links to quest detail pages

### Issues

| # | Issue | Root Cause | Data Source | Should Happen | Safe to Fix | DB Change? |
|---|-------|-----------|-------------|---------------|-------------|------------|
| 7 | This page shows quests, not lessons directly | It's a theme → quest → lesson hierarchy | — | When coming from subject, should show lessons grouped by subject | Yes — add lesson list view | No |
| 8 | No "today's lesson" highlight | No date-based filtering | — | Highlight today's lesson prominently | Yes | No |

---

## 4. Quests Page (`/dashboard/student/quests/page.tsx`)

### What works
- Loads published quests from `/api/themes`
- Shows active/completed quests
- Displays progress bars, XP rewards

### Issues

| # | Issue | Root Cause | Data Source | Should Happen | Safe to Fix | DB Change? |
|---|-------|-----------|-------------|---------------|-------------|------------|
| 9 | Quests redirect to lesson lists, not real-world activities | Quests are currently just containers for lessons | Quest table has no "real-world activity" field | Each subject should have one weekly quest that applies learning in the physical world | Yes — needs new quest type | Yes — new fields |
| 10 | Quest progress is just lesson completion % | `quest.progress` comes from lesson completion | Progress table | Quest progress should also include real-world activity completion | Partial — document gap | Yes |

---

## 5. Calendar Page (`/dashboard/student/calendar/page.tsx`)

### What works
- Weekly grid with day labels
- Shows check-in hearts on days with check-ins
- Shows lesson chips per day
- Weekly goals with progress bars

### Issues

| # | Issue | Root Cause | Data Source | Should Happen | Safe to Fix | DB Change? |
|---|-------|-----------|-------------|---------------|-------------|------------|
| 11 | Weekly schedule is built algorithmically, not from real schedule | `buildWeeklySchedule()` spreads lessons across M-F by subject | No schedule data | Should show actual assigned schedule | Yes — improve algorithm | No (needs Schedule table long-term) |
| 12 | Check-in only loads today's, not the week's | Only today's check-in fetched | `/api/learner/checkin` returns only today | Show all check-ins for the week | Needs API change | No |
| 13 | "This Week's Goals" check-in progress is limited | Only today's check-in loaded | — | Show real weekly check-in count | Needs API change | No |

---

## 6. Parent Dashboard (`/dashboard/parent/page.tsx`)

### What works
- Loads children from ParentChild + progress APIs
- Shows child cards with XP, streak, coins, lessons completed
- Shows emotional check-in status per child
- Quick links to Messages, Calendar, Progress, Support

### Issues

| # | Issue | Root Cause | Data Source | Should Happen | Safe to Fix | DB Change? |
|---|-------|-----------|-------------|---------------|-------------|------------|
| 14 | "View Progress" links to empty placeholder page | Progress page only shows `EmptyStateCard` | — | Should show per-subject progress, completed lessons, weekly summary | Yes — build the page | No |
| 15 | Recent Activity lacks lesson titles | API returns `lessonId` but not `lessonTitle` | `/api/parent/progress` | Show lesson names in recent activity | Yes — fix API | No |
| 16 | No weekly quest visibility for parents | Not fetched or displayed | — | Parents should see child's weekly quests | Yes — add to API + UI | No |
| 17 | Streak may not be accurately calculated | Stored field, not computed from actions | `LearnerProfile.currentStreak` | Streak should count real student actions | Document — needs backend work | Yes |

---

## 7. Parent Progress Page (`/dashboard/parent/progress/page.tsx`)

| # | Issue | Root Cause | Should Happen | Safe to Fix |
|---|-------|-----------|---------------|-------------|
| 18 | Entire page is an empty placeholder | Page only shows `EmptyStateCard` | Show detailed per-child, per-subject progress | Yes — build the page |

---

## 8. Parent Calendar (`/dashboard/parent/calendar/page.tsx`)

### What works
- Full calendar grid with month navigation
- Shows events from progress data and check-ins
- Color-coded event types
- Monthly stats

### Issues

| # | Issue | Root Cause | Should Happen | Safe to Fix |
|---|-------|-----------|---------------|-------------|
| 19 | Streak days are fabricated | Generated by looping from today, not from real data | Show real streak history | Document — needs event sourcing |
| 20 | Events only from limited `recentActivity` | API returns only last 3 records | Show all activity for the month | Needs API change |
| 21 | No quest completion events | Not fetched | Show quest completions | Yes — add to events |

---

## 9. Lesson Player (Student)

### Issues

| # | Issue | Root Cause | Should Happen | Safe to Fix |
|---|-------|-----------|---------------|-------------|
| 22 | "Owl Teacher says:" label is visible | Explicit label in rendering | Remove — owl + speech bubble is enough | Yes |
| 23 | studentText sometimes duplicates owlText | Both fields rendered separately | One primary content block per step | Yes — improve rendering |
| 24 | Practice step shows minimal content | Only shows "Your Turn" label | Practice should have scaffolding | Yes |
| 25 | Video "Add Video" may show in student context | Admin controls not properly hidden | Students never see admin buttons | Yes |
| 26 | Quick Check feedback is generic | Uses generic hint field | Feedback should be educational | Yes |

---

## 10. Admin Lesson Preview

### Issues

| # | Issue | Should Happen | Safe to Fix |
|---|-------|---------------|-------------|
| 27 | "Owl Teacher says:" label visible | Same fix as student view | Yes |
| 28 | "Add Video" shows for every step | Only show for appropriate step types | Yes |
| 29 | No media type guidance per step | Show appropriate controls by step type | Yes |

---

## 11. API Issues

| # | Issue | Route | Should Happen |
|---|-------|-------|---------------|
| 30 | Check-in only returns today | `GET /api/learner/checkin` | Add `?days=N` for week's check-ins |
| 31 | Parent progress lacks lesson titles | `GET /api/parent/progress` | Join with Lesson table |
| 32 | Parent progress lacks quest data | `GET /api/parent/progress` | Include quests per child |
| 33 | Subjects API returns theme-keyed data | `GET /api/learner/subjects` | Aggregate by subject across themes |

---

## 12. Data Model Gaps

| # | Gap | Impact | Priority |
|-----|-----|--------|----------|
| 34 | No `Schedule` table | Can't show "today's lesson" accurately | High |
| 35 | No `WeeklyQuest` / real-world quest support | Quests are just lesson containers | High |
| 36 | No `StreakEvent` table | Streak is a counter, not computed | Medium |
| 37 | No audio support on journey steps | Can't support audio narration | Low |

---

## Priority Fix List (Safe to Do Now, No DB Changes)

1. Fix subject navigation — clicking a subject shows lessons for that subject
2. Fix parent progress page — build the actual progress view
3. Fix parent dashboard — include lesson titles, quest data
4. Fix weekly calendar — load week's check-ins, not just today
5. Fix lesson player UX — remove "Owl Teacher says" label, fix practice steps
6. Fix admin preview — hide "Add Video" where inappropriate
7. Fix streak display — improve sidebar streak visualization
8. Create weekly quest documentation

## What Needs DB/Schema Work (Document, Don't Build Now)

- Schedule table for lesson-day assignments
- WeeklyQuest / QuestActivity table for real-world quests
- StreakEvent table for accurate streak computation
- Audio support on journey steps
