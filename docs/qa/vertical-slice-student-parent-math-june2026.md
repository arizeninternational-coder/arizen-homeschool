# Vertical Slice Test Plan — Student + Parent + Math

## Scope

Test one child, one week, one subject (Mathematics) across both student and parent experiences.

## Test Child Profile
- Name: Test Student
- Grade: 2
- Subject: Mathematics

## Test Scenarios

### Student Flow

#### 1. Dashboard → Math Subject
**Steps**:
1. Log in as student
2. Verify dashboard shows greeting, check-in, today's lessons
3. Click "Mathematics" subject pill
4. Verify: Subject detail page loads with Math color theme (indigo)

**Expected**:
- Subject header shows "Mathematics" with calculator icon
- Progress bar shows correct completion percentage
- Lessons grouped by status (In Progress / Completed / All Lessons)

#### 2. Subject Page → Lesson
**Steps**:
1. On Math subject page, click a lesson
2. Verify: Lesson player opens with 10-step journey
3. Verify: No "Owl Teacher says:" labels visible
4. Complete the lesson
5. Verify: XP popup, confetti, back to quest

**Expected**:
- Owl guidance appears without label (just owl + speech bubble)
- Practice step has scaffolding text
- No "Add Video" or admin controls visible
- Completion flow works end-to-end

#### 3. Check-in → Progress Update
**Steps**:
1. On dashboard, select an emotion for check-in
2. Verify: Check-in saves, confirmation shown
3. Complete a Math lesson
4. Verify: Dashboard stats update (lessons done, XP)

**Expected**:
- Check-in appears immediately after selection
- Stats update after lesson completion

#### 4. Calendar View
**Steps**:
1. Navigate to Calendar
2. Verify: Week view shows check-in and lesson activity
3. Verify: Goals section shows real data

**Expected**:
- Check-in heart appears on today's column
- Lesson chips appear on scheduled days

### Parent Flow

#### 5. Parent Dashboard → Child View
**Steps**:
1. Log in as parent
2. Verify: Child card shows name, grade, XP, streak, coins
3. Verify: Today's emotional check-in is visible
4. Click "View Progress"

**Expected**:
- Child card displays all stats
- Emotional check-in shows "Feeling [emotion] today" or "No check-in yet"
- Progress link works

#### 6. Parent Progress Page
**Steps**:
1. On Progress page, verify child section shows:
   - Lessons Done count
   - Total XP
   - Streak with best streak
   - Coins
   - Level progress bar
   - Recent activity with lesson names

**Expected**:
- All stats populated correctly
- Recent activity shows LESSON NAMES (not just "a lesson")
- Level progress bar shows correct percentage

#### 7. Parent Calendar
**Steps**:
1. Navigate to Calendar
2. Verify: Calendar shows child's activity events
3. Click on a date with activity
4. Verify: Events shown correctly (lesson completed, check-in)

**Expected**:
- Events from real data only (no fabricated streak dots)
- Click shows event details

## Known Limitations (Not Blockers)

1. **Weekly Quest placeholder**: Shows "coming soon" message — no real quest data yet
2. **Streak computation**: Uses stored `currentStreak` field, not computed from actions
3. **Today's lessons**: Shows all lessons filtered by subject, not date-scheduled
4. **Calendar schedule**: Algorithmically distributed, not from actual schedule data
5. **Recent activity**: Limited to last 5 progress records (no lesson titles for Quest completions)

## Streak Fixes (This Session)

### Changes Made
1. **Shared streak helper** (`src/lib/streak.ts`) — extracted streak computation from progress route into reusable module
2. **Check-in streak tracking** — check-ins now advance the streak (previously only lesson completions did)
3. **Badge bug fix** — badge unlock checks now use freshly computed streak value instead of stale `LearnerProfile.currentStreak`
4. **Profile denormalization** — `LearnerProfile.bestStreak` now updated alongside `Streak` table
5. **Parent calendar** — removed fabricated streak events; real activity events only
6. **Student sidebar** — streak calendar now shows real active days from `Progress` + `EmotionalCheckin` tables
7. **New API** — `GET /api/learner/streak-history` returns 7-day active day map

### Streak Test Scenarios
- [ ] Student checks in → streak increments
- [ ] Student completes lesson → streak increments
- [ ] Same-day second check-in → streak unchanged (idempotent)
- [ ] Student sidebar shows correct active days for the week
- [ ] Parent dashboard shows accurate streak count
- [ ] Parent calendar no longer shows fabricated streak events
- [ ] 3-Day Streak badge unlocks at correct threshold

## Data Verification Checklist

- [x] No PUBLISHED status changes made
- [x] No drafts approved or copied to studentJourney
- [x] No Grade 5 data touched
- [x] No secrets or .env committed
- [x] No scratch scripts committed
- [x] No temporary DB write scripts committed
- [x] No Supabase writes from this session
- [ ] Build passes cleanly
- [ ] All changes are frontend-only + API logic (no schema changes)

## Result

Build: ⏳ Pending
Commit: ⏳ Pending
Push: ⏳ Pending
