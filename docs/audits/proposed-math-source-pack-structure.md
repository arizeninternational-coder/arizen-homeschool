# Proposed Math Source Pack Structure

**Generated:** 2026-06-16

## Recommended Format: Markdown + JSON

The source pack should be a **human-authored, machine-readable** document that the generator uses as the single source of truth. Not AI-guessed. Not title-matched.

### File Structure

```
source-packs/
  grade-2-mathematics/
    README.md              — overview, scope, how to use
    topics/
      01-number-concept.md
      02-addition.md
      03-subtraction.md
      04-multiplication.md
      05-fractions.md
      06-measurement.md
      07-time.md
      08-money.md
      09-geometry.md
      10-data-handling.md
    lesson-map.json        — maps lesson IDs to topics + source pack sections
    videos.json            — approved video URLs per lesson/topic
    validation-rules.json  — QC rules, difficulty limits, distractor rules
```

### Per-Topic Markdown File Structure

Each `## topic-name.md` file contains:

```markdown
# Topic: Addition

## Scope
- What this topic covers for Grade 2
- Prerequisite knowledge needed
- What comes after this topic

## Vocabulary
- Child-friendly terms with definitions
- Terms to avoid

## Teaching Approach
- Concrete → Representational → Abstract progression
- Recommended manipulatives (counters, number line, base-ten blocks)
- Common misconceptions to address

## Difficulty Limits
- Maximum numbers: 3-digit + 3-digit
- No negative answers
- Regrouping: yes/no per sub-strand

## Approved Examples
### Example 1: [description]
- Worked solution
- Visual representation
- Key teaching point

### Example 2: ...

## Approved Practice Tasks
### Guided Practice
- Task description
- Expected learner actions

### Independent Practice
- Task description
- Success criteria

## Quick Check Templates
### Template A: [type]
- Question format
- Correct answer rule
- Distractor rules (what wrong answers to include)
- Feedback for correct/feedback for incorrect

### Template B: ...

## Visual Guidance
- What illustrations to generate
- What real-life objects to reference
- SVG style guidance

## Video
- Approved YouTube URL
- Timestamp if needed
- What to watch for
- Backup video URL

## Common Mistakes
- Mistake 1: description + how to address
- Mistake 2: ...

## Lesson Mapping
| Lesson ID | Lesson Title | Sub-strand | QC Template | Video | Notes |
|-----------|--------------|------------|-------------|-------|-------|
| uuid      | Title        | 1.4 Addition | A         | url   |       |
```

### lesson-map.json Structure

```json
{
  "topic": "Addition",
  "lessons": [
    {
      "id": "uuid",
      "title": "Adding Two 2-Digit Numbers Without Regrouping",
      "subStrand": "1.4 Addition",
      "learningOutcome": "By the end of the lesson...",
      "qcTemplate": "addition-no-regrouping",
      "videoId": "youtube-id",
      "difficulty": "beginner",
      "prerequisites": ["place-value-tens-ones", "single-digit-addition"]
    }
  ]
}
```

### validation-rules.json Structure

```json
{
  "grade": 2,
  "subject": "Mathematics",
  "globalRules": {
    "maxNumberValue": 1000,
    "noNegativeAnswers": true,
    "noDecimalNumbers": true,
    "noFractionsInNonFractionTopics": true,
    "requireConcreteExamples": true,
    "requireRealLifeConnection": true,
    "maxStepsPerJourney": 10,
    "requiredStepTypes": ["welcome","mission","think_first","learn","connect","example","practice","quick_check","reflect","complete"]
  },
  "topicRules": {
    "Addition": {
      "maxSum": 999,
      "allowRegrouping": true,
      "requireNumberLine": false,
      "distractorRules": ["off-by-one", "reversed-digits", "wrong-operation"]
    },
    "Subtraction": {
      "noNegativeAnswers": true,
      "maxMinuend": 999,
      "distractorRules": ["added-instead", "off-by-one", "reversed-digits"]
    },
    "Multiplication": {
      "maxFactor": 10,
      "requireEqualGroups": true,
      "distractorRules": ["added-instead", "wrong-factor", "off-by-one"]
    },
    "Fractions": {
      "allowedFractions": ["1/2", "1/4"],
      "noFractionArithmetic": true,
      "requireVisual": true,
      "distractorRules": ["wrong-denominator", "whole-number-answer"]
    }
  }
}
```

### How the Generator Uses the Source Pack

1. **Input**: Lesson shell from DB (title, strand, sub-strand, learning outcome, activities)
2. **Lookup**: Find topic file from lesson-map.json
3. **Load**: Teaching approach, examples, practice tasks, QC templates from topic file
4. **Apply**: Validation rules from validation-rules.json
5. **Generate**: 10-step journey using approved content — NOT guessing from title
6. **Verify**: All QC answers mathematically correct, all videos approved, all visuals match topic

### What the Source Pack Prevents

- Generic "learn something new" missions
- Title-copying in student text
- Wrong math answers in QC
- Unrelated videos
- Missing concrete examples
- Grade-inappropriate difficulty
- Subject contamination
- Missing real-life connections
