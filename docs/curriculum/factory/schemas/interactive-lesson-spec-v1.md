# Arizen Interactive Lesson Specification v1

## 1. Purpose

This document defines how Arizen lessons should represent videos, illustrations, charts, diagrams, and learner interactions.

The goal is to make every generated lesson:

* visual
* interactive
* age-appropriate
* easy to validate
* easy for the app to render
* reusable across grades and subjects

A lesson should not be only text. Each lesson step should be able to include teaching content, media, interaction, feedback, and answer logic.

---

## 2. Core Principle

Every Arizen journey step may contain four layers:

1. Teaching content
2. Visual or media support
3. Learner interaction
4. Feedback and validation logic

A generated lesson should describe what the app should render using structured specs, not vague text like "add an illustration."

Bad:

"Show a nice picture of a fraction."

Good:

```json
{
  "visualSpec": {
    "type": "fraction_circle",
    "parts": 2,
    "shadedParts": 1,
    "equalParts": true,
    "labels": ["1/2"]
  }
}
```

---

## 3. Required Journey Steps

Each lesson must still follow the 10-step Arizen journey:

1. welcome
2. mission
3. think_first
4. learn
5. connect
6. example
7. practice
8. quick_check
9. reflect
10. complete

Each step may include media and interaction, but not every step needs a heavy interaction.

Recommended interaction intensity:

| Step        | Recommended Media                  | Recommended Interaction        |
| ----------- | ---------------------------------- | ------------------------------ |
| welcome     | illustration                       | none or tap continue           |
| mission     | icon or simple visual              | tap continue                   |
| think_first | simple visual choice               | tap choice                     |
| learn       | diagram, animation, optional video | step reveal                    |
| connect     | real-life illustration             | tap hotspot or simple prompt   |
| example     | worked diagram                     | step reveal                    |
| practice    | diagrams/manipulatives             | tap, drag, sort, shade         |
| quick_check | visual or text choices             | multiple choice or tap choice  |
| reflect     | chips or sentence starter          | select chips or short response |
| complete    | reward illustration                | celebration                    |

---

## 4. Standard Step Shape

Each journey step should support this structure:

```json
{
  "stepKey": "practice",
  "stepTitle": "Your Turn",
  "activityType": "guided_practice",
  "owlText": "Now it is your turn to practise.",
  "studentInstruction": "Tap one half of the circle.",
  "content": "A half is one of two equal parts.",
  "mediaSpec": null,
  "visualSpec": {},
  "interactionSpec": {},
  "feedbackSpec": {},
  "successCriteria": "Learner can identify one half."
}
```

Not all fields are required in every step, but generated lessons should use these names consistently.

---

## 5. Media Spec

Use `mediaSpec` for external or rich media such as video, audio, or images.

### 5.1 Video Spec

```json
{
  "mediaSpec": {
    "type": "video",
    "provider": "youtube",
    "url": "",
    "title": "",
    "purpose": "Show how to fold a circle into two equal parts.",
    "placement": "learn",
    "startTime": 0,
    "endTime": 120,
    "reviewStatus": "needs_review"
  }
}
```

Rules:

* Video is optional, not required.
* Only one video should be used in most lessons.
* The video should support the main concept.
* The video should usually appear in the Learn or Connect step.
* AI may suggest search phrases, but actual YouTube links must be reviewed before being approved.
* Never auto-approve an unreviewed video link.
* If no reviewed video exists, the lesson should still work without video.

### 5.2 Image Spec

```json
{
  "mediaSpec": {
    "type": "image",
    "source": "generated_or_library",
    "altText": "A circular paper folded into two equal parts.",
    "purpose": "Help the learner see one half of a circle.",
    "reviewStatus": "approved"
  }
}
```

Rules:

* Every image must have alt text.
* Images should support the learning goal, not decorate randomly.
* Images should be simple and child-friendly.
* For Math, generated diagrams are usually better than complex stock images.

---

## 6. Visual Spec

Use `visualSpec` for visuals that the app can render directly.

### 6.1 Fraction Circle

```json
{
  "visualSpec": {
    "type": "fraction_circle",
    "parts": 2,
    "shadedParts": 1,
    "equalParts": true,
    "showLabels": true,
    "labels": ["1/2"]
  }
}
```

Use for:

* halves
* quarters
* comparing fractions
* shaded parts
* equal and unequal parts

### 6.2 Fraction Rectangle

```json
{
  "visualSpec": {
    "type": "fraction_rectangle",
    "parts": 4,
    "shadedParts": 1,
    "equalParts": true,
    "orientation": "vertical",
    "showLabels": true,
    "labels": ["1/4"]
  }
}
```

Use for:

* rectangular cut-outs
* bread slice examples
* manila paper
* exercise book drawings

### 6.3 Choice Grid

```json
{
  "visualSpec": {
    "type": "choice_grid",
    "choices": [
      {
        "id": "A",
        "label": "A",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 1,
          "equalParts": true
        }
      },
      {
        "id": "B",
        "label": "B",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 1,
          "equalParts": false
        }
      }
    ]
  }
}
```

Use for:

* tap the correct shape
* choose the half
* choose the quarter
* compare two visuals

### 6.4 Step Reveal

```json
{
  "visualSpec": {
    "type": "step_reveal",
    "steps": [
      {
        "title": "Start with one whole circle",
        "visual": {
          "type": "fraction_circle",
          "parts": 1,
          "shadedParts": 0
        }
      },
      {
        "title": "Divide it into two equal parts",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 0,
          "equalParts": true
        }
      },
      {
        "title": "Shade one part",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 1,
          "equalParts": true
        }
      }
    ]
  }
}
```

Use for:

* worked examples
* Learn steps
* showing a process
* explaining how an answer is reached

---

## 7. Interaction Spec

Use `interactionSpec` to define what the learner does.

### 7.1 Tap Choice

```json
{
  "interactionSpec": {
    "type": "tap_choice",
    "prompt": "Tap the shape that shows one half.",
    "choices": ["A", "B", "C"],
    "correctChoiceId": "A"
  }
}
```

Use for:

* selecting the correct answer
* choosing the correct visual
* identifying an example or non-example

### 7.2 Multiple Choice

```json
{
  "interactionSpec": {
    "type": "multiple_choice",
    "question": "Which sentence correctly explains one half?",
    "options": [
      "One half is one of two equal parts of a whole.",
      "One half is any small part of a whole.",
      "One half is one of four equal parts of a whole."
    ],
    "correctIndex": 0
  }
}
```

Rules:

* Must have at least 3 options.
* Must have exactly one correct answer.
* `correctIndex` must be a valid integer.
* Wrong answers should be plausible.
* Do not copy the Learn definition word-for-word too often.

### 7.3 Tap Region

```json
{
  "interactionSpec": {
    "type": "tap_region",
    "prompt": "Tap one half of the circle.",
    "targetVisualId": "circle_1",
    "correctRegion": "part_1"
  }
}
```

Use for:

* tapping one part of a shape
* identifying shaded or unshaded regions
* selecting one half or one quarter

### 7.4 Drag Match

```json
{
  "interactionSpec": {
    "type": "drag_match",
    "prompt": "Drag each label to the correct picture.",
    "draggables": [
      { "id": "label_half", "label": "1/2" },
      { "id": "label_quarter", "label": "1/4" }
    ],
    "targets": [
      { "id": "picture_half", "label": "Half-shaded circle" },
      { "id": "picture_quarter", "label": "Quarter-shaded circle" }
    ],
    "correctMatches": [
      { "dragId": "label_half", "targetId": "picture_half" },
      { "dragId": "label_quarter", "targetId": "picture_quarter" }
    ]
  }
}
```

Use for:

* matching fraction symbols to pictures
* matching words to diagrams
* matching real-life examples to fraction names

### 7.5 Drag Sort

```json
{
  "interactionSpec": {
    "type": "drag_sort",
    "prompt": "Sort the pictures.",
    "items": [
      { "id": "item_1", "label": "Circle split into 2 equal parts" },
      { "id": "item_2", "label": "Circle split into 4 equal parts" },
      { "id": "item_3", "label": "Circle split into unequal parts" }
    ],
    "buckets": [
      { "id": "halves", "label": "Halves" },
      { "id": "quarters", "label": "Quarters" },
      { "id": "not_equal", "label": "Not equal parts" }
    ],
    "correctPlacements": [
      { "itemId": "item_1", "bucketId": "halves" },
      { "itemId": "item_2", "bucketId": "quarters" },
      { "itemId": "item_3", "bucketId": "not_equal" }
    ]
  }
}
```

Use for:

* classifying examples
* sorting shapes
* separating examples from non-examples

### 7.6 Shade Shape

```json
{
  "interactionSpec": {
    "type": "shade_shape",
    "prompt": "Shade one half of the circle.",
    "shape": {
      "type": "fraction_circle",
      "parts": 2,
      "equalParts": true
    },
    "requiredShadedParts": 1
  }
}
```

Use for:

* shading halves
* shading quarters
* showing part of a whole

### 7.7 Reflection Chips

```json
{
  "interactionSpec": {
    "type": "reflection_chips",
    "prompt": "How can you tell if two parts are halves?",
    "chips": [
      "equal parts",
      "two parts",
      "same size",
      "fair sharing"
    ],
    "sentenceStarter": "I know the parts are halves when..."
  }
}
```

Use for:

* reflection
* learner self-expression
* low-friction written responses

---

## 8. Feedback Spec

Each interactive step should include feedback.

```json
{
  "feedbackSpec": {
    "correct": "Yes. One half is one of two equal parts.",
    "incorrect": "Try again. Remember, the two parts must be equal.",
    "hint": "Look for a shape divided into two same-size parts."
  }
}
```

Rules:

* Feedback should be kind and specific.
* Incorrect feedback should guide, not shame.
* Feedback should reference the concept.
* Avoid generic feedback like "Wrong answer."

---

## 9. Validation Rules

A lesson should fail validation if:

* It has placeholder text.
* It has no Learn step.
* It has no Example step.
* Practice has fewer than 2 meaningful tasks.
* Quick Check has no valid correct answer.
* A tap or drag interaction has no answer logic.
* A video link is unreviewed but marked approved.
* A visual spec is vague or missing required fields.
* The lesson title and content do not match.
* The lesson duplicates another lesson.
* A fraction lesson does not mention equal parts where needed.

---

## 10. Recommended Interaction Rules by Step

### Welcome

Allowed:

* illustration
* simple animation
* tap continue

Avoid:

* quiz
* drag task
* heavy interaction

### Mission

Allowed:

* checklist
* badge preview
* tap continue

Avoid:

* complex assessment

### Think First

Allowed:

* tap choice
* visual prediction
* simple poll

Best use:
Activate prior knowledge.

### Learn

Allowed:

* diagram
* step reveal
* optional video
* simple tap hotspot

Best use:
Teach the concept clearly.

### Connect

Allowed:

* real-life illustration
* tap hotspot
* simple choice

Best use:
Show where the concept appears in daily life.

### Example

Allowed:

* step reveal
* worked diagram

Best use:
Demonstrate how to solve or identify.

### Practice

Allowed:

* tap choice
* tap region
* drag match
* drag sort
* shade shape
* short response

Best use:
Let the learner do the work.

### Quick Check

Allowed:

* multiple choice
* tap choice
* tap region

Best use:
Check one key understanding.

### Reflect

Allowed:

* reflection chips
* sentence starter
* short typed or spoken answer

Best use:
Help the learner explain learning.

### Complete

Allowed:

* reward animation
* badge
* recap checklist

Best use:
Close with achievement.

---

## 11. Video Rules

Videos are optional. They should not carry the whole lesson.

A lesson with no video should still be complete.

If a video is used:

* It should be short.
* It should match the lesson concept.
* It should appear in Learn or Connect.
* It should be reviewed before going live.
* It should have a fallback text explanation.
* It should not contain distracting or inappropriate content.

AI-generated lessons may include:

```json
{
  "suggestedVideoSearch": "Grade 2 fractions halves equal parts circle"
}
```

But should not auto-approve a random YouTube URL.

---

## 12. Illustration Rules

Illustrations should be:

* simple
* uncluttered
* directly connected to the concept
* culturally familiar where possible
* easy for a child to understand

For Kenya-focused Math lessons, useful visual contexts include:

* chapati
* mandazi
* oranges
* bread
* classroom paper
* bottle tops
* exercise books
* school shop
* classroom objects

Avoid:

* overly complex stock photos
* irrelevant decorative cartoons
* visuals that do not support the task

---

## 13. Automation Rules

The curriculum factory should generate structured specs, not final UI code.

The generator should output:

* what to teach
* what visual to render
* what interaction to use
* what answer is correct
* what feedback to show

The app renderer should decide how to display it.

This separation makes the system scalable.

Factory output example:

```json
{
  "stepKey": "practice",
  "activityType": "shade_shape",
  "studentInstruction": "Shade one half of the circle.",
  "visualSpec": {
    "type": "fraction_circle",
    "parts": 2,
    "equalParts": true
  },
  "interactionSpec": {
    "type": "shade_shape",
    "requiredShadedParts": 1
  },
  "feedbackSpec": {
    "correct": "Good. You shaded one of two equal parts.",
    "incorrect": "Try shading only one of the two equal parts."
  }
}
```

---

## 14. Minimum Interactive Standard

A student-ready Arizen lesson should include at minimum:

* 1 visual in Learn or Example
* 1 worked visual example
* 1 meaningful Practice interaction
* 1 valid Quick Check interaction
* 1 feedback response for correct and incorrect answers

A strong lesson should include:

* 2 or more visuals
* 2 or more learner interactions
* 1 real-life context
* 1 reflection interaction
* clear answer validation

---

## 15. Priority Renderers for Grade 2 Math

Build these first:

1. multiple_choice
2. tap_choice
3. fraction_circle
4. fraction_rectangle
5. step_reveal
6. drag_match
7. drag_sort
8. shade_shape
9. reflection_chips
10. video_embed

Do not build too many renderers at once. These are enough to make Fractions, Addition, Subtraction, Multiplication, Division, Measurement, Money, and Shapes more interactive.

---

## 16. Factory Rule

A generated lesson should not be approved if it is only a text lesson.

For Grade 2 Math, a lesson must include at least:

* one meaningful visualSpec
* one meaningful interactionSpec
* one valid answer or success condition
* one useful feedbackSpec
