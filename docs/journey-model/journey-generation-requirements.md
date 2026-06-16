# Arizen School — Journey Generation Requirements

**Version:** 1.0.0
**Purpose:** Define how future generators must create journeys.
**Principle:** Generate from the source pack. Never guess from titles.

---

## Generator Architecture

### Inputs
1. **Lesson shell** from database (title, strand, sub-strand, learning outcome, activities)
2. **Source pack** (topic guide, examples, practice templates, QC templates, visual guidance, video map)
3. **Journey model** (this document — step purposes, media rules, validation rules)

### Output
- A complete 10-step journey as JSON
- Validated against `journey-step-rules.md`
- Ready for admin review (not learner-facing until approved)

---

## Generation Rules

### Rule 1: Every Step Has a Purpose
- Welcome → greet
- Mission → state goal
- Think First → activate prior knowledge
- Learn → teach core concept
- Real Life → connect to world
- Example → show how
- Practice → child does
- Quick Check → test understanding
- Reflect → think about learning
- Complete → celebrate

**No step may be filler. No step may be empty.**

### Rule 2: Media Must Match Step Purpose
- No video in Welcome, Mission, Think First, Practice, Quick Check, Reflect, Complete
- Video only in Learn (optional) and Example (best place)
- SVG in Learn, Example, Real Life, Complete
- Interactive only in Practice and Quick Check

### Rule 3: Video Is Optional, Never Required
- Generate the journey to work without video
- Video enhances but doesn't carry the lesson
- If no approved video exists, use fallback (worked example, text + SVG)
- Never block generation because video is missing

### Rule 4: Every Media Item Must Have Alt Text
- Describe what the image/SVG shows
- Keep it short (1-2 sentences)
- Grade 2 reading level

### Rule 5: Quick Check Must Be Valid
- Must have a question
- Must have 2-4 options (for MCQ)
- Must have correctIndex
- Must have correct answer
- Must have feedback for correct and incorrect
- Must test the actual lesson concept
- Must be mathematically correct

### Rule 6: Practice Must Require Action
- Child must do something: type, select, match, draw
- No passive content in Practice
- Clear instructions
- Immediate feedback

### Rule 7: No Title-Copying
- studentText must NOT contain the lesson title verbatim
- Rewrite the concept in child-friendly language

### Rule 8: No Generic Greetings
- No "Welcome to today's lesson"
- No "Hello there, let's learn something new"
- Make it lesson-specific

### Rule 9: No Raw Curriculum Text
- Never paste learning outcomes into student-facing text
- Translate curriculum language into child language

### Rule 10: Source Pack Is the Authority
- Use examples from the source pack
- Use practice templates from the source pack
- Use QC templates from the source pack
- Use visual guidance from the source pack
- Use video recommendations from the source pack
- **Do NOT invent teaching content from the lesson title alone**

---

## Generation Process

### Step 1: Load Lesson Shell
```
lesson = getLesson(lessonId)
topic = mapTopic(lesson.title, lesson.strand, lesson.subStrand)
sourcePack = loadSourcePack(topic)
```

### Step 2: Generate Each Step
```
FOR each stepType IN [welcome, mission, think_first, learn, real_life, example, practice, quick_check, reflect, complete]:
  step = generateStep(stepType, lesson, sourcePack)
  validateStep(step, stepType)
  IF validation fails THEN
    regenerate step OR flag for human review
  END
  journey.steps.append(step)
END
```

### Step 3: Validate Complete Journey
```
validateJourney(journey):
  - 10 steps present
  - Correct step order
  - No duplicate step types
  - All required fields present
  - All interactions valid
  - All media has alt text
  - No title-copying
  - No generic text
  - No raw curriculum text
  - QC answer mathematically correct
  - No answer leaks
```

### Step 4: Write to Draft
```
journey.metadata = {
  generatedAt: now(),
  generator: "source-pack-v1",
  sourcePackVersion: "1.0.0",
  validated: true,
  humanReviewed: false,
  approvedForLearners: false
}

lesson.studentJourneyDraft = journey
lesson.isAvailable = false // stays hidden until approved
```

---

## What the Generator Must NOT Do

1. ❌ Do NOT generate journeys without a source pack
2. ❌ Do NOT guess teaching content from lesson titles
3. ❌ Do NOT use unapproved videos
4. ❌ Do NOT create placeholder media ("coming soon")
5. ❌ Do NOT copy lesson titles into student text
6. ❌ Do NOT paste curriculum outcomes verbatim
7. ❌ Do NOT generate video-dependent lessons (must work without video)
8. ❌ Do NOT skip validation
9. ❌ Do NOT write to published journey directly (always draft first)
10. ❌ Do NOT set isAvailable=true (that's a human decision)

---

## Validation Before Write

Before writing ANY journey to the database, the generator must verify:

```
ALL steps have required fields
ALL steps have valid media types for their stepType
ALL interactions have correct answers
ALL QC answers are mathematically correct
NO answer leaks in non-QC steps
NO title-copying
NO generic greetings
NO raw curriculum text
ALL media has alt text
Video is only in Learn or Example
Video is approved (or marked as fallback)
Practice requires learner action
Quick Check tests lesson concept
```

**If any check fails → DO NOT WRITE. Flag for human review.**

---

## Source Pack Integration

### Loading Source Pack Content
```
topicGuide = sourcePack.getTopic(topic)
examples = topicGuide.getApprovedExamples()
practiceTemplates = topicGuide.getPracticeTemplates()
qcTemplates = topicGuide.getQcTemplates()
visualGuidance = topicGuide.getVisualGuidance()
videoRecommendations = topicGuide.getVideoRecommendations()
difficultyLimits = topicGuide.getDifficultyLimits()
```

### Using Source Pack Content
- **Learn step:** Use teaching explanation from topic guide + visual from visual guidance
- **Example step:** Use worked example from examples + optional video from video recommendations
- **Practice step:** Use practice template from practiceTemplates
- **Quick Check step:** Use QC template from qcTemplates with correct answer from difficultyLimits
- **All steps:** Follow media rules from journey model

---

## Quality Gates

### Gate 1: Auto-Validation (Generator)
- All validation rules pass
- No critical defects
- Journey is complete and consistent

### Gate 2: Human Review (Victor)
- Content is accurate
- Examples are appropriate
- QC questions are fair
- Media is relevant
- Overall flow makes sense

### Gate 3: Approval (Victor)
- Journey approved for learners
- Copied from draft to published
- isAvailable set to true

**No journey reaches learners without passing all 3 gates.**
