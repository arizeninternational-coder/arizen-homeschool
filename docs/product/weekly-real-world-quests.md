# Weekly Real-World Quests — Product Definition

## Problem

Quests in Arizen are currently just containers for lessons. Clicking a quest shows a list of lessons. There's no real-world application, no connection to the physical world, and no way for parents to see or support quest completion.

## Vision

Each subject has one weekly quest that asks the child to apply what they learned in the physical world. Parents can see these quests and help their child complete them.

---

## Quest Examples by Subject

### Mathematics
| Week | Quest | Real-World Activity |
|------|-------|-------------------|
| Fractions | Find Halves at Home | Find 5 things at home that can be split into equal halves. Draw or photograph them. |
| Shapes | Shape Hunt | Find 10 shapes in your neighborhood. Name each shape and draw it. |
| Measurement | Measure Your World | Measure 5 objects at home using a ruler. Record the lengths. |

### English
| Week | Quest | Real-World Activity |
|------|-------|-------------------|
| Stories | Interview & Retell | Ask someone to tell you their favorite story. Retell it in your own words. |
| Vocabulary | Word Collector | Find 5 new words this week (from books, signs, conversations). Use each in a sentence. |
| Writing | Letter to Someone | Write a short letter or message to someone in your family. |

### Kiswahili
| Week | Quest | Real-World Activity |
|------|-------|-------------------|
| Vocabulary | Nyumbani Kiswahili | Find 5 Kiswahili words used at home this week. Write them and their meanings. |
| Conversation | Mazoezi ya Mazungumzo | Practice a Kiswahili conversation with someone at home. |

### Environmental Activities
| Week | Quest | Real-World Activity |
|------|-------|-------------------|
| Living Things | Nature Observer | Observe and draw 3 living things and 3 non-living things in your environment. |
| Water | Water Tracker | Track how water is used in your home for one day. Draw or write about it. |

### Hygiene and Nutrition
| Week | Quest | Real-World Activity |
|------|-------|-------------------|
| Hand-washing | Habit Tracker | Track your hand-washing for one day. Mark each time you wash your hands. |
| Healthy Eating | My Plate | Draw what you eat in one day. Identify which foods are healthy. |

### Movement and Creative Activities
| Week | Quest | Real-World Activity |
|------|-------|-------------------|
| Movement Challenge | Safe Moves | Complete 3 safe movement challenges (e.g., balance on one foot, jump 10 times, stretch). |
| Creativity | Make Something | Create something using materials found at home. Draw, build, or craft. |

---

## Quest Lifecycle

1. **Monday**: Quest appears on student's subject page and parent's dashboard
2. **Monday-Friday**: Student works on the quest (real-world activity)
3. **Any time**: Student marks quest complete (with optional photo/note)
4. **Parent**: Sees completion, can add encouragement note
5. **End of week**: Quest archives, new quest appears Monday

---

## UI Requirements

### Student Subject Page
```
┌─────────────────────────────────────┐
│  📐 Mathematics                     │
│  12 lessons · 3 this week           │
│                                     │
│  🌟 THIS WEEK'S QUEST               │
│  Find Halves at Home                │
│  Find 5 things at home that can be  │
│  split into equal halves.           │
│  [Start Quest] [Mark Complete]      │
│                                     │
│  📚 THIS WEEK'S LESSONS             │
│  Mon: What are Fractions?    [Done] │
│  Tue: Halves                 [→]    │
│  Wed: Quarters               [ ]    │
│                                     │
│  📋 ALL LESSONS                     │
│  In Progress | Completed | Locked  │
└─────────────────────────────────────┘
```

### Parent Dashboard
```
┌─────────────────────────────────────┐
│  👧 Ada · Grade 2                   │
│  😊 Feeling Happy today             │
│  🔥 5 day streak                    │
│                                     │
│  🌟 Weekly Quest: Find Halves       │
│  Status: In Progress                │
└─────────────────────────────────────┘
```

---

## Data Model (Future Implementation)

### Option A: Extend Quest Table
```sql
ALTER TABLE "Quest" ADD COLUMN "questType" VARCHAR DEFAULT 'LESSON_SET';
ALTER TABLE "Quest" ADD COLUMN "realWorldActivity" TEXT;
ALTER TABLE "Quest" ADD COLUMN "weekStartDate" DATE;
```

### Option B: New WeeklyQuest Table (Preferred)
```sql
CREATE TABLE "WeeklyQuest" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  realWorldActivity TEXT NOT NULL,
  weekStartDate DATE NOT NULL,
  grade INTEGER,
  createdAt TIMESTAMP DEFAULT now()
);

CREATE TABLE "QuestCompletion" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weeklyQuestId UUID REFERENCES "WeeklyQuest"(id),
  learnerId UUID REFERENCES "LearnerProfile"(id),
  completedAt TIMESTAMP,
  note TEXT,
  parentNote TEXT,
  UNIQUE(weeklyQuestId, learnerId)
);
```

---

## Implementation Phases

### Phase 1: Documentation & UI Only (Now)
- Create quest content for each subject (4 weeks per subject)
- Add quest placeholder to student subject page
- Add quest visibility to parent dashboard
- No DB changes — use existing Quest table with a `questType` field

### Phase 2: DB Schema + API (When Ready)
- Create WeeklyQuest table
- Create QuestCompletion table
- Build quest completion flow
- Parent notification on quest completion

### Phase 3: Rich Features (Future)
- Photo upload for quest evidence
- Parent encouragement notes
- Quest streaks (complete quest every week for a month)
- Quest showcase (gallery of completed quests)
