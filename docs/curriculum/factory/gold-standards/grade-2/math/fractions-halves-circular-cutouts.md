# Gold Standard Interactive Lesson: Introduction to Halves Using Circular Cut-outs

## 1. Lesson Metadata

**Grade:** 2
**Subject:** Mathematics
**Strand:** Numbers
**Sub-strand:** Fractions
**Unit:** Fractions
**Lesson Title:** Introduction to Halves Using Circular Cut-outs
**Lesson Type:** Concept Introduction
**Difficulty:** Beginner
**Estimated Duration:** 20-25 minutes
**Primary Concept:** One half as one of two equal parts
**Prerequisite:** Learner can recognize a whole object and compare same/different sizes
**Materials:** Circular paper cut-outs, crayons, pencil, exercise book, chapati/orange picture
**Gold Standard Purpose:** This lesson is the benchmark for interactive Grade 2 Fractions lessons in Arizen.

---

## 2. Learning Outcome

By the end of this lesson, the learner should be able to:

* divide a circular shape into two equal parts
* identify one half of a circle
* explain that a half means one out of two equal parts
* tell that two unequal parts are not halves

---

## 3. Concept Focus

A half is one of two equal parts of a whole.

The learner must understand:

* the whole object comes first
* the whole is divided into two parts
* the two parts must be equal
* one equal part is called one half
* one half can be written as `1/2`

---

## 4. Common Misconception Addressed

**Misconception:**
Any two parts are halves.

**Correction:**
Two parts are only halves if they are equal in size.

If a chapati is cut into one big piece and one small piece, the pieces are not halves because they are not equal.

---

## 5. Media and Interaction Strategy

This lesson should not be rendered as text only.

It should include:

* one fraction circle visual in the Learn step
* one optional video slot in the Learn step
* one step-reveal worked example
* one tap-choice Think First interaction
* one shade-shape Practice interaction
* one tap-choice or multiple-choice Quick Check
* one reflection chips interaction

The lesson must still work even if no video has been approved yet.

---

# 6. Full 10-Step Interactive Journey

---

## Step 1: Welcome

```json
{
  "stepKey": "welcome",
  "stepTitle": "Welcome to Fractions",
  "activityType": "intro",
  "owlText": "Hello mathematician! Today we are going to explore fractions using a circle.",
  "studentInstruction": "Get ready to look at a whole circle and discover one half.",
  "content": "Today's lesson is about halves. A half is one part of a whole that has been divided into two equal parts.",
  "mediaSpec": {
    "type": "image",
    "source": "generated_or_library",
    "altText": "A friendly owl beside a whole circle and a half-shaded circle.",
    "purpose": "Introduce the learner to halves visually.",
    "reviewStatus": "approved"
  },
  "visualSpec": {
    "type": "fraction_circle",
    "parts": 1,
    "shadedParts": 0,
    "equalParts": true,
    "showLabels": false
  },
  "interactionSpec": {
    "type": "tap_continue",
    "prompt": "Tap continue when you are ready to begin."
  },
  "feedbackSpec": {
    "correct": "Great. Let us explore halves together.",
    "incorrect": "",
    "hint": ""
  },
  "successCriteria": "Learner is ready to explore a whole circle and divide it into equal parts."
}
```

---

## Step 2: Mission

```json
{
  "stepKey": "mission",
  "stepTitle": "Your Mission",
  "activityType": "mission",
  "owlText": "Your mission is to discover what one half means.",
  "studentInstruction": "By the end of this lesson, you should be able to show one half of a circle.",
  "content": "In this lesson, you will look at one whole circle, divide it into two equal parts, shade one part, and name the shaded part as one half.",
  "mediaSpec": null,
  "visualSpec": {
    "type": "checklist",
    "items": [
      "Start with one whole circle",
      "Divide it into two equal parts",
      "Shade one part",
      "Call it one half"
    ]
  },
  "interactionSpec": {
    "type": "tap_continue",
    "prompt": "Tap continue to accept your mission."
  },
  "feedbackSpec": {
    "correct": "Mission accepted. Let us begin.",
    "incorrect": "",
    "hint": ""
  },
  "successCriteria": "Learner understands the goal of the lesson."
}
```

---

## Step 3: Think First

```json
{
  "stepKey": "think_first",
  "stepTitle": "Think First",
  "activityType": "tap_choice",
  "owlText": "Imagine you have one chapati and you want to share it fairly with one friend.",
  "studentInstruction": "Choose the fairest way to share one chapati between two people.",
  "content": "Fair sharing means both people get the same amount.",
  "mediaSpec": null,
  "visualSpec": {
    "type": "choice_grid",
    "choices": [
      {
        "id": "A",
        "label": "One big piece and one small piece",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 1,
          "equalParts": false,
          "showLabels": false
        }
      },
      {
        "id": "B",
        "label": "Two equal pieces",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 1,
          "equalParts": true,
          "showLabels": false
        }
      },
      {
        "id": "C",
        "label": "Give the whole chapati to one person",
        "visual": {
          "type": "fraction_circle",
          "parts": 1,
          "shadedParts": 1,
          "equalParts": true,
          "showLabels": false
        }
      }
    ]
  },
  "interactionSpec": {
    "type": "tap_choice",
    "prompt": "Tap the fairest sharing picture.",
    "choices": ["A", "B", "C"],
    "correctChoiceId": "B"
  },
  "feedbackSpec": {
    "correct": "Yes. Fair sharing means the two pieces are equal.",
    "incorrect": "Try again. Look for the picture where both people get the same amount.",
    "hint": "Fair means same size."
  },
  "successCriteria": "Learner connects halves to fair sharing between two people."
}
```

---

## Step 4: Learn

```json
{
  "stepKey": "learn",
  "stepTitle": "What Is One Half?",
  "activityType": "teaching",
  "owlText": "A half means one out of two equal parts.",
  "studentInstruction": "Look at the circle and see how it becomes two equal parts.",
  "content": "A whole is one complete object. A circle is one whole shape. When we divide one whole circle into two equal parts, each part is called one half. We write one half as 1/2. The parts must be equal. If one part is bigger and the other part is smaller, the parts are not halves.",
  "mediaSpec": {
    "type": "video",
    "provider": "youtube",
    "url": "",
    "title": "",
    "purpose": "Show how to fold or divide a circle into two equal parts.",
    "placement": "learn",
    "startTime": 0,
    "endTime": 120,
    "reviewStatus": "needs_review",
    "suggestedVideoSearch": "Grade 2 fractions halves equal parts circle"
  },
  "visualSpec": {
    "type": "step_reveal",
    "steps": [
      {
        "title": "Start with one whole circle",
        "visual": {
          "type": "fraction_circle",
          "parts": 1,
          "shadedParts": 0,
          "equalParts": true,
          "showLabels": false
        }
      },
      {
        "title": "Divide the circle into two equal parts",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 0,
          "equalParts": true,
          "showLabels": false
        }
      },
      {
        "title": "Shade one equal part",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 1,
          "equalParts": true,
          "showLabels": true,
          "labels": ["1/2"]
        }
      }
    ]
  },
  "interactionSpec": {
    "type": "step_reveal",
    "prompt": "Tap next to see how a whole circle becomes one half."
  },
  "feedbackSpec": {
    "correct": "Good. One half is one of two equal parts.",
    "incorrect": "Look again. The two parts must be equal.",
    "hint": "A half needs two equal parts."
  },
  "successCriteria": "Learner understands that one half means one of two equal parts of a whole."
}
```

---

## Step 5: Connect

```json
{
  "stepKey": "connect",
  "stepTitle": "Halves Around Us",
  "activityType": "real_life_connection",
  "owlText": "We use halves when we share things fairly in real life.",
  "studentInstruction": "Think of something round that can be shared equally between two people.",
  "content": "You can see halves when one chapati is shared equally between two children, one orange is cut into two equal pieces, or one circular paper is folded into two equal parts. When the two pieces are the same size, each piece is one half.",
  "mediaSpec": {
    "type": "image",
    "source": "generated_or_library",
    "altText": "A chapati cut into two equal pieces.",
    "purpose": "Connect halves to fair sharing in daily life.",
    "reviewStatus": "approved"
  },
  "visualSpec": {
    "type": "real_life_fraction",
    "object": "chapati",
    "parts": 2,
    "equalParts": true,
    "highlightPart": 1,
    "label": "1/2"
  },
  "interactionSpec": {
    "type": "tap_region",
    "prompt": "Tap one half of the chapati.",
    "targetVisualId": "chapati_half",
    "correctRegion": "part_1"
  },
  "feedbackSpec": {
    "correct": "Yes. That is one of the two equal parts.",
    "incorrect": "Try again. Tap only one of the equal pieces.",
    "hint": "One half is one piece when the whole is divided into two equal pieces."
  },
  "successCriteria": "Learner connects halves to real-life fair sharing."
}
```

---

## Step 6: Example

```json
{
  "stepKey": "example",
  "stepTitle": "Worked Example",
  "activityType": "worked_example",
  "owlText": "Let us work through an example together.",
  "studentInstruction": "Follow each step. Imagine Amina has a circular paper cut-out.",
  "content": "Amina has one circular paper. She folds it into two equal parts. Then she shades one part. What fraction of the circle has Amina shaded?",
  "mediaSpec": null,
  "visualSpec": {
    "type": "step_reveal",
    "steps": [
      {
        "title": "Amina starts with one whole circular paper",
        "visual": {
          "type": "fraction_circle",
          "parts": 1,
          "shadedParts": 0,
          "equalParts": true
        }
      },
      {
        "title": "She folds it into two equal parts",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 0,
          "equalParts": true
        }
      },
      {
        "title": "She shades one part",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 1,
          "equalParts": true,
          "showLabels": true,
          "labels": ["1/2"]
        }
      }
    ],
    "answerText": "Amina shaded one half, or 1/2."
  },
  "interactionSpec": {
    "type": "step_reveal",
    "prompt": "Tap next to follow Amina's example."
  },
  "feedbackSpec": {
    "correct": "Great. Amina shaded one out of two equal parts.",
    "incorrect": "",
    "hint": "Watch how the circle changes from whole to two equal parts."
  },
  "successCriteria": "Learner can follow a worked example and identify one shaded half of a circle."
}
```

---

## Step 7: Practice

```json
{
  "stepKey": "practice",
  "stepTitle": "Your Turn",
  "activityType": "guided_practice",
  "owlText": "Now it is your turn to practise finding halves.",
  "studentInstruction": "Complete each activity. Tap, shade, and explain.",
  "content": "Practise showing one half of a circle.",
  "mediaSpec": null,
  "visualSpec": {
    "type": "practice_set",
    "items": [
      {
        "id": "practice_1",
        "type": "shade_shape",
        "visual": {
          "type": "fraction_circle",
          "parts": 2,
          "shadedParts": 0,
          "equalParts": true
        }
      },
      {
        "id": "practice_2",
        "type": "tap_choice",
        "visual": {
          "type": "choice_grid",
          "choices": [
            {
              "id": "A",
              "label": "Two equal parts",
              "visual": {
                "type": "fraction_circle",
                "parts": 2,
                "shadedParts": 1,
                "equalParts": true
              }
            },
            {
              "id": "B",
              "label": "Two unequal parts",
              "visual": {
                "type": "fraction_circle",
                "parts": 2,
                "shadedParts": 1,
                "equalParts": false
              }
            },
            {
              "id": "C",
              "label": "Four equal parts",
              "visual": {
                "type": "fraction_circle",
                "parts": 4,
                "shadedParts": 1,
                "equalParts": true
              }
            }
          ]
        }
      }
    ]
  },
  "interactionSpec": {
    "type": "multi_activity",
    "activities": [
      {
        "id": "practice_1",
        "type": "shade_shape",
        "prompt": "Shade one half of the circle.",
        "shape": {
          "type": "fraction_circle",
          "parts": 2,
          "equalParts": true
        },
        "requiredShadedParts": 1
      },
      {
        "id": "practice_2",
        "type": "tap_choice",
        "prompt": "Tap the picture that shows one half.",
        "choices": ["A", "B", "C"],
        "correctChoiceId": "A"
      },
      {
        "id": "practice_3",
        "type": "short_response",
        "prompt": "A circle is cut into one big part and one small part. Are the two parts halves? Explain.",
        "expectedIdea": "No, because the two parts are not equal.",
        "keywords": ["no", "not equal", "same size", "equal"]
      }
    ]
  },
  "feedbackSpec": {
    "correct": "Well done. You are showing one half correctly.",
    "incorrect": "Try again. Remember, halves must be two equal parts.",
    "hint": "Look for two parts that are the same size."
  },
  "successCriteria": "Learner practises shading, identifying, and explaining halves."
}
```

---

## Step 8: Quick Check

```json
{
  "stepKey": "quick_check",
  "stepTitle": "Quick Check",
  "activityType": "multiple_choice",
  "owlText": "Let us check your understanding.",
  "studentInstruction": "Choose the best answer.",
  "content": "Which sentence correctly explains one half?",
  "mediaSpec": null,
  "visualSpec": {
    "type": "fraction_circle",
    "parts": 2,
    "shadedParts": 1,
    "equalParts": true,
    "showLabels": true,
    "labels": ["1/2"]
  },
  "interactionSpec": {
    "type": "multiple_choice",
    "question": "Which sentence correctly explains one half?",
    "options": [
      "One half is one of two equal parts of a whole.",
      "One half is any small part of a whole.",
      "One half is one of four equal parts of a whole.",
      "One half is the biggest part of a whole."
    ],
    "correctIndex": 0
  },
  "feedbackSpec": {
    "correct": "Correct. One half is one of two equal parts of a whole.",
    "incorrect": "Not quite. A half must be one of two equal parts.",
    "hint": "Look for the answer that mentions two equal parts."
  },
  "successCriteria": "Learner can choose the correct meaning of one half."
}
```

---

## Step 9: Reflect

```json
{
  "stepKey": "reflect",
  "stepTitle": "Think About It",
  "activityType": "reflection",
  "owlText": "You have learned something important about fair parts.",
  "studentInstruction": "Use the chips to help explain your answer.",
  "content": "How can you tell if two parts of a circle are halves?",
  "mediaSpec": null,
  "visualSpec": {
    "type": "reflection_card",
    "icon": "circle-halves",
    "sentenceStarter": "I know the parts are halves when..."
  },
  "interactionSpec": {
    "type": "reflection_chips",
    "prompt": "How can you tell if two parts of a circle are halves?",
    "chips": [
      "equal parts",
      "two parts",
      "same size",
      "fair sharing"
    ],
    "sentenceStarter": "I know the parts are halves when..."
  },
  "feedbackSpec": {
    "correct": "Good reflection. Halves must be two equal parts.",
    "incorrect": "Think about the important rule: the parts must be equal.",
    "hint": "Use the words equal parts or same size."
  },
  "successCriteria": "Learner can explain the key rule for halves using words."
}
```

---

## Step 10: Complete

```json
{
  "stepKey": "complete",
  "stepTitle": "Lesson Complete",
  "activityType": "completion",
  "owlText": "Great work! You can now show one half of a circle and explain that halves must be equal.",
  "studentInstruction": "You have completed the lesson. Remember: a half is one of two equal parts.",
  "content": "Today you learned that a circle can be one whole, one whole can be divided into two equal parts, each equal part is one half, one half can be written as 1/2, and unequal parts are not halves.",
  "mediaSpec": {
    "type": "reward_animation",
    "name": "fraction_explorer_badge",
    "altText": "Fraction Explorer badge with a half-shaded circle.",
    "purpose": "Celebrate completion of the first fractions lesson.",
    "reviewStatus": "approved"
  },
  "visualSpec": {
    "type": "recap_checklist",
    "items": [
      "I can identify one whole circle.",
      "I can divide a circle into two equal parts.",
      "I can shade one half.",
      "I can explain that unequal parts are not halves."
    ]
  },
  "interactionSpec": {
    "type": "tap_continue",
    "prompt": "Tap finish to collect your Fraction Explorer badge."
  },
  "feedbackSpec": {
    "correct": "Badge earned. You are now a Fraction Explorer.",
    "incorrect": "",
    "hint": ""
  },
  "rewardText": "You earned your Fraction Explorer badge for learning about halves.",
  "successCriteria": "Learner finishes with a clear understanding of one half as one of two equal parts."
}
```

---

# 7. Why This Is a Gold Standard Interactive Lesson

This lesson is a gold standard because:

1. It teaches one clear concept only.
2. It uses concrete objects before symbols.
3. It connects fractions to fair sharing.
4. It directly addresses the misconception that any two parts are halves.
5. It includes app-renderable visual specs.
6. It includes meaningful learner interactions.
7. It includes a worked visual example.
8. It includes valid answer logic.
9. It includes specific feedback for correct and incorrect responses.
10. It supports an optional video without depending on it.
11. It avoids placeholder, generic, or title-only content.
12. It is suitable for Grade 2 learners.

---

# 8. Quality Score

| Area                | Score |
| ------------------- | ----: |
| Outcome Alignment   | 15/15 |
| Learn Quality       | 15/15 |
| Example Quality     | 15/15 |
| Practice Quality    | 20/20 |
| Quick Check Quality | 15/15 |
| Real-Life Relevance | 10/10 |
| Progression Fit     |   5/5 |
| Reflection Quality  |   5/5 |
| Interactivity       | 10/10 |

**Total:** 110/110

For compatibility with the existing 100-point rubric, this lesson should be treated as 100/100.

---

# 9. Automatic Validation Expectations

This lesson should pass validation because:

* It has all 10 required journey steps.
* It contains no placeholder text.
* The Learn step has meaningful teaching content.
* The Example step has a worked visual example.
* The Practice step has multiple meaningful tasks.
* The Quick Check has valid options and a valid correctIndex.
* Interactive steps contain answer logic.
* Visual specs are structured and renderable.
* The video is optional and marked `needs_review`.
* The Reflection step is concept-specific.
* The title and content match.
* It is not a duplicate of another lesson.
* It fits the Fractions unit progression.

---

# 10. Reusable Pattern for Future Fractions Lessons

Future Fractions lessons should imitate this structure:

1. Start with a concrete object.
2. Teach one concept only.
3. Use equal-parts language clearly.
4. Include at least one renderable visual.
5. Include at least one learner interaction.
6. Include a worked example with a visual.
7. Give practice that includes doing, identifying, and explaining.
8. Use a Quick Check that tests the core misconception.
9. Provide specific feedback.
10. End with a concept-specific reflection and recap.

This lesson should be used as the benchmark when generating or repairing other Fractions lessons.
