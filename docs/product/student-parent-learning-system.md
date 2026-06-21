# Student-Parent Learning System — Product Definition

## Vision

A child logs in and sees a clear, warm, purposeful learning experience. A parent logs in and gets an honest, accurate window into their child's learning life. The product feels like one connected system, not a collection of pages.

---

## Child Dashboard Experience

### First Screen (above the fold)
1. **Greeting** — "Good morning, [Name]!" with grade and motivational message
2. **EQ Check-in** — "How are you feeling today?" with 8 emotion buttons. One tap. Shows confirmation with owl message.
3. **Today's Learning Plan** — Up to 5 lesson cards for today, each showing:
   - Subject color bar
   - Subject name
   - Lesson title
   - Completion status (check mark if done)
   - Tap to open lesson player

### Below the Fold
4. **This Week** — 7-day strip showing real activity per day (check-in ✓, lesson completed ✓, nothing ○)
5. **My Progress** — 2x2 grid: Lessons Done, XP Earned, Badges, Coins
6. **My Subjects** — Color-coded subject pills. Tapping one opens the subject page.

### Key Behaviors
- If no check-in today: show check-in prominently
- If check-in done: show "You're feeling [emotion] today" with option to update
- Today's lessons should be REAL (scheduled for today), not just a random selection
- Completed lessons show with green check and "Done" label

---

## Subject Page Experience

### When a child clicks "Mathematics" (or any subject):

1. **Subject Header** — Subject name, icon, color theme, total lessons count
2. **Today's Lesson** — Prominent card: "Today's [Subject] Lesson" with title, tap to start
3. **This Week's Lessons** — List of lessons for this week, each with:
   - Day label (Mon, Tue, Wed...)
   - Lesson title
   - Status: Not Started / In Progress / Completed
4. **All Lessons** — Full list grouped by status:
   - In Progress (started but not completed)
   - Completed (with check mark and date)
   - Not Started (locked or available)
5. **Weekly Quest** — One real-world activity card for this subject this week
   - Title: e.g., "Find Halves at Home"
   - Description: what to do in the physical world
   - Status: Not Started / In Progress / Completed
   - Tap to see details and mark complete

### Key Behaviors
- Subject page is NOT a redirect to quests — it's a lesson-focused view
- Lessons are filtered by this subject across all themes/quests
- Weekly quest is prominently displayed

---

## Lesson Player Experience (10-Step Journey)

### Step Types and Their Purpose

| Step | Purpose | Media | Interaction |
|------|---------|-------|-------------|
| **Welcome** | Warm greeting, set the mood | Owl illustration | None |
| **Mission** | "Today you will learn..." | Owl + visual | None |
| **Think First** | Activate prior knowledge | Image/diagram | Prediction text input |
| **Learn** | Core teaching content | Image/SVG/diagram primary, video optional | Read/watch |
| **Connect** | Real-world connection | Image + real-world example | None |
| **Example** | Worked example | Image/SVG showing the work | None |
| **Practice** | Guided practice | Scaffolding + workspace | Multiple choice or text |
| **Quick Check** | Check understanding | Question | Multiple choice with feedback |
| **Reflect** | Metacognition | Reflection prompt | Text input or chip selection |
| **Complete** | Celebration | Trophy + XP earned | Mark complete button |

### Media Rules
- **Math**: SVG/diagrams PRIMARY. Video optional. Always show visual representation.
- **English**: Images + text. Video for stories/listening. Audio for pronunciation.
- **Kiswahili**: Same as English. Audio important.
- **Environmental**: Images of nature/real world. Video for experiments.
- **Hygiene**: Images showing habits. Diagrams for processes.
- **Movement**: Video PRIMARY. Images for poses/steps.

### UX Rules
1. **No repeated "Owl Teacher Says" labels** — the owl character + speech bubble is self-explanatory
2. **No repeated text** — if owlText says the same thing as studentText, show only one
3. **Practice steps must scaffold** — not just "Your Turn" but actual guided work
4. **Quick Check feedback must be educational** — not just "Not quite" but explaining why
5. **Video controls only where video exists** — no "Add Video" or "Video coming soon" for students
6. **Each step has ONE clear purpose** — if a step doesn't teach or check, remove it

---

## Parent Dashboard Experience

### First Screen (above the fold)
1. **Overview Stats** — Children count, Active Streaks, Total XP, Lessons Done
2. **My Children** — One card per child showing:
   - Name, grade, level
   - Coins, streak, lessons completed
   - **Today's emotional check-in** — "Feeling Happy today" or "No check-in yet"
   - Quick actions: View Progress, View Lessons

### Below the Fold
3. **Recent Activity** — Last N activities across all children with lesson names, dates, completion status
4. **Quick Links** — Messages, Calendar, Progress, Support

### Key Behaviors
- If child hasn't checked in today: show "No check-in yet today" (gentle nudge for parent)
- Recent activity shows LESSON NAMES (not just "completed a lesson")
- Streak is accurate (based on real actions, not a stored counter)

---

## Parent Progress Page

### Per-Child View
1. **Child Header** — Name, grade, level, XP, streak
2. **Progress by Subject** — For each subject:
   - Subject name + icon
   - Lessons completed / total
   - Progress bar
   - Last activity date
3. **Weekly Summary** — This week's check-ins, lessons completed, quests done
4. **Recent Activity** — Detailed list with lesson names, dates, XP earned

---

## Parent Calendar

### Monthly View
- Calendar grid with dots for: lessons (indigo), check-ins (pink), quests (amber)
- Click a date to see that day's events
- Month stats: total lessons, check-ins, quests

### Key Behaviors
- Events come from REAL data (not fabricated streak dots)
- Shows all children's activity color-coded by child

---

## Weekly Quest Behavior

### For Students
- One quest per subject per week
- Real-world activity (not just "complete 3 lessons")
- Examples:
  - Math: "Find 5 things at home that can be split into halves"
  - English: "Interview someone about their favorite story and retell it"
  - Kiswahili: "Find 5 Kiswahili words used in your home"
  - Environmental: "Observe and draw 3 living and 3 non-living things"
  - Hygiene: "Track your hand-washing for one day"
  - Movement: "Complete 3 safe movement challenges"

### For Parents
- See the weekly quest on their dashboard
- Can see completion status
- Can help/support the child

### Data Model (Future)
- `WeeklyQuest` table: id, subject, title, description, weekStartDate, realWorldActivity
- `QuestCompletion` table: id, weeklyQuestId, learnerId, completedAt, parentNote

---

## Streak Behavior

### Current State
- `LearnerProfile.currentStreak` is a stored integer
- Incremented by some backend process (not visible in frontend code)
- Not computed from actual actions

### Desired State
- Streak = count of consecutive days with at least ONE learning action
- Actions that count: check-in, lesson completion, quest completion
- One streak day = one or more actions on that calendar day
- Broken if a full calendar day passes with no actions

### Implementation Needed
- `StreakEvent` table: id, learnerId, date, actionType (checkin/lesson/quest)
- Daily computation or on-action computation
- For now: document the gap, improve the UI to show streak history accurately

---

## Check-in Behavior

### Current State
- Student picks one of 8 emotions per day
- Stored in `EmotionalCheckin` table
- Parent can see today's check-in

### Desired State
- Same as current, plus:
- Week view: parent sees all check-ins for the week
- Student sees their check-in history (mood calendar)
- Optional: add a note to the check-in

---

## Progress Behavior

### Current State
- `Progress` table tracks lesson completion per learner
- `LearnerProfile.totalXp` stores aggregate XP
- `StudentWallet` tracks coins

### Desired State
- Same data model is sufficient
- Need better aggregation APIs for:
  - Per-subject progress
  - Per-week progress
  - Recent activity with lesson names
