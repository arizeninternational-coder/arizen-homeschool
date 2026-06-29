# Fraction Lesson Journey Skill

> Reusable standard for designing and improving Grade 2 fraction lesson journeys.
> Derived from lessons learned improving "Introduction to Halves Using Circular Cut-outs" (lesson `f5bee6a0`).

---

## 1. Purpose

This skill defines a **reusable contract** for fraction lesson journeys so that:

- Every fraction lesson follows the same proven 10-step structure
- Visuals are consistent, large enough to teach, and never leak admin tools
- Interactions are interactive, not static cards
- Progress persists to Supabase and syncs to the parent dashboard
- We avoid repeating the same mistakes across lessons

---

## 2. Standard 10-Step Journey Structure

| # | Step Key | Step Type | Purpose |
|---|----------|-----------|---------|
| 1 | `welcome` | Welcome | Introduce story context, invite the child in |
| 2 | `mission` | Mission | Child accepts the challenge |
| 3 | `think_first` | Predict | Child predicts before formal teaching |
| 4 | `learn` | Learn | Teach the core concept clearly |
| 5 | `connect` | Recognition | Child recognizes concept among distractors |
| 6 | `example` | Worked Example | Show a practical step-by-step process |
| 7 | `practice` | Practice | Child applies the idea |
| 8 | `quick_check` | Quick Check | Assess understanding |
| 9 | `reflect` | Reflect | Child reflects on what they learned |
| 10 | `complete` | Done | Celebrate completion |

---

## 3. Step-by-Step Design Contracts

### Step 1: Welcome

**Purpose:** Introduce the story context and invite the child in.

**Must include:**
- Short story context (e.g., "Amina has one chapati to share with her brother")
- Friendly owl/teacher message
- One main visual supporting the story
- "Start lesson" button

**Must NOT:**
- Teach the full concept yet
- Duplicate title, step count, owl message, or image card (no double chrome)
- Show admin upload/generation controls in student view
- Use placeholder/debug visuals in student-facing route

**Visual spec:**
```json
{ "type": "welcome_story", "theme": "chapati" }
```

---

### Step 2: Mission

**Purpose:** Tell the child what challenge they are accepting.

**Must include:**
- Mission brief card with 🎯 header
- 3–4 mission items as numbered/icon cards
- "Accept mission" button
- Success message **only after** clicking

**Must NOT:**
- Show success message before the click
- Use radio-button-style empty circles
- Include unrelated tasks

**Visual spec:**
```json
{ "type": "mission_brief", "title": "Your mission has 4 parts:", "items": [...], "icons": ["🍞","✂️","📏","🗣️"] }
```

**Interaction spec:**
```json
{ "type": "tap_continue", "buttonLabel": "Accept mission" }
```

**Critical rule:** `missionAccepted` state must initialize as `false`. Success message renders ONLY after state becomes `true` via button click. Never pass `feedback` to `TapContinue` for mission steps — let `renderMissionConfirmation` handle it exclusively.

---

### Step 3: Predict / Think First

**Purpose:** Let the child make a prediction before formal teaching.

**Must include:**
- Clear question prompt
- A/B/C labeled options
- Meaningful visuals showing different fraction situations
- Feedback after selection (green for correct, orange for gentle correction)

**Must NOT:**
- Use unlabeled static cards
- Use unclear or tiny diagrams
- Show feedback before selection

**Visual spec:**
```json
{ "type": "predict_choice", "prompt": "Which picture shows fair sharing?", "choices": [{"id":"A","label":"A","title":"1/2","description":"...","visual":{...},"feedback":"..."}] }
```

---

### Step 4: Learn

**Purpose:** Teach the core concept clearly.

**Must include:**
- Compact horizontal or 2×2 grid layout (NOT long vertical stack)
- Large teaching diagrams (100–130px)
- Process: whole → split equally → one part → written symbol
- Simple language

**Must NOT:**
- Use tiny icon-sized diagrams
- Scroll excessively for a simple concept
- Skip teaching the symbol (e.g., `1/2`)

**Visual spec:**
```json
{ "type": "step_reveal", "intro": "Let's see how one whole becomes one half.", "steps": [
  { "title": "Whole", "visual": { "type": "fraction_circle", "parts": 1, "size": 110 } },
  { "title": "Split equally", "visual": { "type": "fraction_circle_dotted", "size": 110 } },
  { "title": "One half", "visual": { "type": "fraction_semicircle", "size": 110 } },
  { "title": "Write it as", "symbol": "1/2", "description": "1 part out of 2 equal parts", "highlight": true }
]}
```

---

### Step 5: Connect / Recognition

**Purpose:** Help the child recognize the concept among related examples.

**Must include:**
- 4 options labeled A/B/C/D
- All options show fraction visuals with one part shaded
- Only one option correctly matches the target fraction
- Per-option feedback explaining why wrong answers are wrong

**Must NOT:**
- Give away the answer with misleading labels
- Use visuals with unequal parts for distractors (unless testing that specific misconception)

**Visual spec:**
```json
{ "type": "predict_choice", "prompt": "Which picture correctly shows 1/2?", "choices": [
  { "id": "A", "label": "A", "title": "1/2", "visual": { "type": "fraction_circle", "parts": 2, "shadedParts": 1, "size": 90 }, "feedback": "Yes! 1/2 means 1 out of 2 equal parts." },
  { "id": "B", "label": "B", "title": "1/2", "visual": { "type": "fraction_circle", "parts": 3, "shadedParts": 1, "size": 90 }, "feedback": "Not quite. This shows 1 out of 3 equal parts, so it is 1/3." },
  { "id": "C", "label": "C", "title": "1/2", "visual": { "type": "fraction_circle", "parts": 4, "shadedParts": 1, "size": 90 }, "feedback": "Not quite. This shows 1 out of 4 equal parts, so it is 1/4." }
]}
```

---

### Step 6: Worked Example

**Purpose:** Show the process in a practical, hands-on way.

**Must include:**
- 4-step 2×2 grid layout
- Custom SVG diagrams for each step (NOT generic icons)
- Real actions a child can imagine or copy
- Simple Grade 2 language

**Must NOT:**
- Use tiny icon-sized diagrams
- Use abstract descriptions instead of concrete actions

**Visual spec:**
```json
{ "type": "worked_example", "intro": "Let's make one half step by step.", "steps": [
  { "title": "Trace a circle", "visualType": "trace_circle", "description": "Use a small lid to draw a circle." },
  { "title": "Cut it out", "visualType": "cut_out", "description": "Cut out the circle carefully." },
  { "title": "Fold it equally", "visualType": "fold_circle", "description": "Fold it so both sides match." },
  { "title": "Open and shade one half", "visualType": "shade_half", "description": "Now shade one of the two equal parts." }
]}
```

**SVG standards:** Each diagram must be 120×120px minimum, with thick lines (2–3px), clear objects, and consistent style.

---

### Step 7: Practice

**Purpose:** Let the child apply the idea.

**Must include:**
- One focused interaction (shade a shape, tap a region, etc.)
- Helpful feedback
- No quiz-like pressure

---

### Step 8: Quick Check

**Purpose:** Assess whether the child understood.

**Must include:**
- Clear question
- Visual options with A/B/C labels
- Correct/incorrect feedback
- Progress persistence to Supabase after completion

**Must NOT:**
- Show feedback before selection
- Use unlabeled static cards

---

### Step 9: Reflect

**Purpose:** Let the child explain or reflect on what they learned.

**Must include:**
- Simple reflection prompt
- Age-appropriate response (chips, not long text)
- No heavy typing for Grade 2

---

### Step 10: Done

**Purpose:** Celebrate completion.

**Must include:**
- Positive completion message
- What the child learned
- XP/reward display
- Link back to dashboard or next lesson

---

## 4. Visual Standards

| Rule | Standard |
|------|----------|
| Diagram size | 100–130px for teaching visuals; never < 80px |
| Line thickness | 2–3px for SVG strokes |
| Style | Consistent flat educational style across all steps in a lesson |
| Colors | Soft purple/lavender Arizen accents; warm chapati/paper colors where relevant |
| Labels | A/B/C/D for all multiple-choice steps |
| Placeholders | Never show image generation/debug tools in student view |
| Fallbacks | Use HTML/CSS/SVG diagrams when AI art is unreliable |
| Image priority | approvedUrl → generatedUrl → clean SVG fallback |
| Admin controls | Only in admin student-view route, NEVER in student route |

---

## 5. Interaction Standards

| Rule | Standard |
|------|----------|
| Feedback timing | Only AFTER student action, never before |
| Success state | Must initialize as `false`; only set `true` after interaction |
| Retry | Allow retry after incorrect answers (no shame) |
| Mission step | Uses "Accept mission" button, not quiz-style selection |
| Learn step | Must NOT feel like a quiz — it's teaching |
| Quick check | Uses answer selection with feedback |
| Practice | Uses interaction (tap, shade, drag) |
| State persistence | `missionAccepted` and similar states are session-only; progress is Supabase-backed |

---

## 6. Data and Persistence Standards

| Rule | Standard |
|------|----------|
| Never clear `studentJourney` | Always preserve existing journey data |
| Never clear `studentJourneyDraft` | Draft data must survive edits |
| Never overwrite `contentBlocks` partially | Always read-modify-write the full object |
| Progress writes | Call `POST /api/learner/progress` with `action: "start"` on lesson load and `action: "complete"` on lesson finish |
| Parent reads | Parent dashboard reads from same `Progress` table student writes to |
| No local-only state | Meaningful progress must persist to Supabase, not just React state |
| Parent sees only linked children | Use `ParentChild` table to filter |
| No service role in browser | Use anon key + RLS for client operations |
| Admin/student separation | Admin controls only in `/dashboard/admin/` routes, never in `/dashboard/student/` |

**Critical ID mapping:**
```
ParentChild.childUserId → User.id
LearnerProfile.userId → User.id
EmotionalCheckin.learnerId → LearnerProfile.id (NOT User ID!)
Progress.learnerId → LearnerProfile.id (NOT User ID!)
```

When querying child data for parents, always map User IDs → LearnerProfile IDs first.

---

## 7. QA Checklist

For every improved lesson, verify:

- [ ] Screenshot of each changed step
- [ ] Student route tested (`/dashboard/student/lessons/...`)
- [ ] Admin student-view tested (`/dashboard/admin/lessons/[id]/student-view`)
- [ ] Step navigation tested (forward and back)
- [ ] Build passes (`npx next build`)
- [ ] No duplicate chrome (title, owl, step count appear once)
- [ ] No admin controls in student view
- [ ] Interaction state tested before and after click
- [ ] Success message does NOT appear before interaction
- [ ] Progress persistence tested (refresh keeps state)
- [ ] Parent dashboard sync tested (progress visible to linked parent)
- [ ] Emotional check-ins visible to linked parent

---

## 8. Batch Improvement Process

### Rules
1. Improve only a small batch first (3–5 lessons)
2. Back up rows before changes (export JSON from Supabase)
3. Do not publish blindly — keep as DRAFT until QA'd
4. QA one representative lesson deeply before scaling
5. Run build after each lesson
6. Provide screenshots for review
7. Stop for review before scaling to next batch

### Backup command
```sql
-- Export lesson before editing
SELECT contentBlocks FROM Lesson WHERE id = '<lesson-id>';
-- Save result to docs/backups/<lesson-slug>-<timestamp>.json
```

---

## 9. Other Grade 2 Fraction Lessons

| Lesson ID | Title | Status | Steps | Notes |
|-----------|-------|--------|-------|-------|
| `f5bee6a0` | Introduction to Halves Using Circular Cut-outs | PUBLISHED | 10 | ✅ Benchmark lesson |
| `05517805` | Fractions in Daily Life: Sharing Food | DRAFT | 10 | Has journey, needs QA |
| `2e1869d6` | Fractions: Assessment and Reflection | DRAFT | 10 | Has journey, needs QA |
| `c71a49c8` | Fractions: Practice and Application | DRAFT | 10 | Has journey, needs QA |
| `839653eb` | Comparing Fractions: 1/2 and 1/4 | DRAFT | 10 | Has journey, needs QA |
| `dda4dbd5` | Introduction to Quarters Using Circular Cut-outs | DRAFT | 10 | Has journey, needs QA |
| `0767b9f0` | Introduction to Halves Using Rectangular Cut-outs | DRAFT | 0 | Needs full journey |
| `9b887eb8` | Introduction to Quarters Using Rectangular Cut-outs | DRAFT | 0 | Needs full journey |
| `e6c42ed8` | 1.6 Fractions: Adding Like Fractions | DRAFT | 0 | Needs full journey |
| `6e24fa29` | 1.6 Fractions: Adding Unlike Fractions | DRAFT | 0 | Needs full journey |
| `62254259` | 1.6 Fractions: Comparing Fractions | DRAFT | 0 | Needs full journey |
| `583ddd56` | 1.6 Fractions: Converting Improper Fractions | DRAFT | 0 | Needs full journey |
| `6b37a12a` | 1.6 Fractions: Equivalent Fractions | DRAFT | 0 | Needs full journey |
| `1c32fc58` | 1.6 Fractions: Fraction Word Problems | DRAFT | 0 | Needs full journey |
| `27988882` | 1.6 Fractions: Fractions in Measurement | DRAFT | 0 | Needs full journey |
| `b2cc948a` | 1.6 Fractions: Fractions of Quantities | DRAFT | 0 | Needs full journey |
| `315eef20` | 1.6 Fractions: Fractions on a Number Line | DRAFT | 0 | Needs full journey |
| `a57b6a9d` | 1.6 Fractions: Ordering Fractions | DRAFT | 0 | Needs full journey |
| `a294ac8e` | 1.6 Fractions: Simplifying Fractions | DRAFT | 0 | Needs full journey |
| `cc6d91d3` | 1.6 Fractions: Subtracting Like Fractions | DRAFT | 0 | Needs full journey |
| `c3bb4795` | 1.6 Fractions: Subtracting Unlike Fractions | DRAFT | 0 | Needs full journey |
| `e67a4639` | 1.6 Fractions: Review and Assessment | DRAFT | 0 | Needs full journey |
| `dbadac3a` | Digital Games with Fractions | DRAFT | 0 | Needs full journey |
| `b163de06` | Making Patterns with Fractions | DRAFT | 0 | Needs full journey |

---

## 10. Recommended Next Batch

Start with these 3 lessons (safest — already have 10-step journeys):

1. **`05517805`** — Fractions in Daily Life: Sharing Food
2. **`839653eb`** — Comparing Fractions: 1/2 and 1/4
3. **`dda4dbd5`** — Introduction to Quarters Using Circular Cut-outs

Then this pair (need full journey creation):

4. **`0767b9f0`** — Introduction to Halves Using Rectangular Cut-outs
5. **`9b887eb8`** — Introduction to Quarters Using Rectangular Cut-outs

---

## Key Mistakes to Avoid (from Halves lesson)

| Mistake | Impact | Prevention |
|---------|--------|------------|
| Success message before click | Confuses child, ruins interaction | Initialize state as `false`; render only after action |
| Wrong ID type in queries | Data never found (check-ins invisible) | Always map User ID → LearnerProfile ID |
| No "start" API call | Parent sees no progress | Call `action: "start"` on lesson load |
| Tiny SVG diagrams | Can't teach effectively | Minimum 100px, 2–3px strokes |
| Vertical scrolling for simple concepts | Cognitive overload | Use 2×2 grid or horizontal strip |
| Admin controls in student view | Broken UX, security risk | Gate behind `/dashboard/admin/` routes only |
| Overwriting contentBlocks | Data loss | Always read-modify-write full object |
| Static unlabeled cards | No engagement | Use `predict_choice` with A/B/C labels |
