# Arizen School — Journey Step Rules

**Version:** 1.0.0
**Purpose:** Hard rules for what is allowed and forbidden in each journey step.
**Enforced by:** Generator (at creation) and Renderer (at display).

---

## Universal Rules (All Steps)

1. **No step may be empty.** Every step must have at minimum: title + studentText.
2. **No raw curriculum text.** Never paste learning outcomes verbatim into student-facing text.
3. **No "learner should be able to..."** language in any student-facing text.
4. **No "Illustration coming soon"** or "Media placeholder" shown to learners.
5. **No unverified external media.** YouTube URLs must be approved before learner-facing use.
6. **All text must be Grade 2 reading level.** Short sentences. Simple words.
7. **All media must have alt text.** For accessibility.
8. **No step may exceed 200 words** of student-facing text.
9. **No step may teach content from a different subject.** Math lessons teach Math.
10. **Every journey must have exactly 10 steps.** No more, no less.

---

## Step-Specific Rules

### Step 1: Welcome

**Must have:**
- Owl text (friendly, personal greeting)
- Student text (brief, exciting)

**Must NOT have:**
- Video
- Audio
- Interactive elements
- Teaching content
- Subject-specific widgets
- Text longer than 150 characters

**Validation:**
```
IF stepType = "welcome" THEN
  owlText.length >= 10 AND owlText.length <= 150
  studentText.length >= 10 AND studentText.length <= 150
  media.type != "youtube"
  interaction.type = "none"
```

---

### Step 2: Mission

**Must have:**
- Student text (child-friendly goal, 1-2 sentences)

**Must NOT have:**
- Video
- Raw curriculum outcome text
- Text longer than 100 characters
- "The learner should be able to..." language

**Validation:**
```
IF stepType = "mission" THEN
  studentText.length >= 10 AND studentText.length <= 100
  studentText NOT CONTAINS "learner should be able to"
  studentText NOT CONTAINS "by the end of the lesson"
  media.type != "youtube"
  interaction.type = "none"
```

---

### Step 3: Think First

**Must have:**
- Text prompt or question that activates prior knowledge

**Must NOT have:**
- Teaching new content
- Video
- Answer reveals
- More than 1 question

**Validation:**
```
IF stepType = "think_first" THEN
  (owlText.length >= 10 OR studentText.length >= 10)
  media.type != "youtube"
  interaction.type IN ["none", "text_response"]
```

---

### Step 4: Learn

**Must have:**
- Core teaching content (text explanation)
- Visual support (SVG/diagram recommended)

**Must NOT have:**
- Video as the ONLY teaching content
- No visual at all (for Math concepts)
- Answer leaks
- Text longer than 200 characters

**Validation:**
```
IF stepType = "learn" THEN
  owlText.length >= 20 AND owlText.length <= 200
  studentText.length >= 20 AND studentText.length <= 200
  (media.type IN ["svg", "image"] OR media.type = "none")
  IF media.type = "youtube" THEN
    media.approved = true
    media.humanReviewed = true
    // Must also have text-based teaching content
    owlText.length >= 20
```

---

### Step 5: Real Life Connection

**Must have:**
- Text connecting lesson to real life
- Kenyan context preferred

**Must NOT have:**
- Video longer than 30 seconds
- Abstract examples
- Generic "math is everywhere" without specific example

**Validation:**
```
IF stepType = "real_life" THEN
  studentText.length >= 10 AND studentText.length <= 150
  IF media.type = "youtube" THEN
    video.duration <= 30 seconds
  interaction.type = "none"
```

---

### Step 6: Example

**Must have:**
- Worked example (text + visual)
- Step-by-step reasoning

**Must NOT have:**
- Video with no text-based worked example backup
- Unverified YouTube video
- Example that doesn't match lesson topic

**Validation:**
```
IF stepType = "example" THEN
  owlText.length >= 20 AND owlText.length <= 200
  studentText.length >= 20 AND studentText.length <= 200
  // Worked example MUST exist
  (media.type IN ["svg", "image", "youtube", "animation"] OR media.type = "none")
  IF media.type = "youtube" THEN
    media.approved = true
    media.humanReviewed = true
    media.url != ""
    // Must have text backup
    owlText.length >= 20
```

---

### Step 7: Practice

**Must have:**
- Interactive task (child must do something)
- Clear instructions

**Must NOT have:**
- Passive video
- No learner action required
- Tasks that don't match lesson topic

**Validation:**
```
IF stepType = "practice" THEN
  studentText.length >= 10 AND studentText.length <= 150
  interaction.type IN ["number_input", "text_response", "matching", "drawing_prompt"]
  interaction.requiresSave = true
  media.type != "youtube"
```

---

### Step 8: Quick Check

**Must have:**
- Question that tests the lesson concept
- Correct answer defined
- Feedback for correct and incorrect

**Must NOT have:**
- Video
- Question unrelated to lesson topic
- No correct answer defined
- Answer revealed before child responds
- More than 2 questions

**Validation:**
```
IF stepType = "quick_check" THEN
  studentText.length >= 10 AND studentText.length <= 100
  interaction.type IN ["multiple_choice", "number_input", "matching", "ordering"]
  interaction.question.length >= 5
  interaction.correctIndex IS NOT NULL
  interaction.options.length >= 2
  interaction.options[interaction.correctIndex] IS NOT NULL
  interaction.feedbackCorrect.length >= 5
  interaction.feedbackIncorrect.length >= 5
  media.type = "none"
```

---

### Step 9: Reflect

**Must have:**
- Reflection prompt (text or emoji)

**Must NOT have:**
- Video
- Teaching content
- Graded assessment

**Validation:**
```
IF stepType = "reflect" THEN
  (owlText.length >= 5 OR studentText.length >= 5)
  interaction.type IN ["none", "text_response", "reflection"]
  media.type != "youtube"
```

---

### Step 10: Complete

**Must have:**
- Celebration/closure text
- Summary of what was learned

**Must NOT have:**
- Video
- Teaching content
- New tasks
- "Coming soon" or "To be continued"

**Validation:**
```
IF stepType = "complete" THEN
  studentText.length >= 10 AND studentText.length <= 100
  interaction.type = "none"
  media.type != "youtube"
```

---

## Cross-Step Rules

1. **Step order must be correct.** Welcome → Mission → Think First → Learn → Real Life → Example → Practice → Quick Check → Reflect → Complete.
2. **No duplicate step types.** Each step type appears exactly once.
3. **Text must flow.** Each step should connect to the next.
4. **Media must be consistent.** Same visual style across all steps.
5. **Language must be consistent.** Don't switch between English and Kiswahili mid-journey.
