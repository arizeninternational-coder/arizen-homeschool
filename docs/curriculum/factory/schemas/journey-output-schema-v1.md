# Arizen Journey Output Schema v1

## 1. Purpose

This document defines the official output shape for generated Arizen journeys.

Every journey produced by the Curriculum Factory must conform to this schema.

The schema has two goals:

1. **Backward compatibility** — every generated step includes the legacy fields the current app expects
2. **Interactive capability** — every generated step includes the new fields the interactive renderer needs

A generated lesson that conforms to this schema will:
- render correctly in the current student player
- render interactively through `InteractiveStepRenderer`
- pass automated validation

---

## 2. Top-Level Journey Shape

```json
{
  "id": "string (uuid)",
  "title": "string",
  "slug": "string",
  "description": "string",
  "status": "DRAFT | REVIEW | PUBLISHED",
  "xpReward": { "base": 50 },
  "subject": "string",
  "grade": 2,
  "contentBlocks": {
    "studentJourney": [ JourneyStep, ... ],
    "strand": "string",
    "subStrand": "string",
    "learningOutcome": "string"
  },
  "quest": {
    "id": "string",
    "title": "string",
    "theme": { "id": "string", "title": "string", "grade": 2 }
  }
}
```

The `studentJourney` array must contain exactly 10 steps.

---

## 3. Journey Step Shape

Every step must include **both** legacy compatibility fields and interactive factory fields.

### 3.1 Legacy Compatibility Fields

These fields keep lessons working in the current app without the interactive renderer.

```json
{
  "id": "string (step key, e.g. \"welcome\")",
  "stepType": "welcome | mission | think_first | learn | connect | example | practice | quick_check | reflect | complete",
  "title": "string (child-friendly, short)",
  "studentText": "string (main teaching content for the student)",
  "owlText": "string (warm, encouraging owl guidance)",
  "visualType": "string (legacy visual type enum)",
  "illustrationPrompt": "string (AI image generation prompt)",
  "interaction": {
    "type": "none | open_response | multiple_choice | choice | self_check | draw_or_use_objects | parent_assisted | offline_activity",
    "question": "string (optional)",
    "prompt": "string (optional)",
    "options": ["string", ...],
    "correctAnswer": "number | string (optional)",
    "hint": "string (optional)"
  },
  "media": {
    "illustration": {
      "prompt": "string",
      "approvedUrl": "string | null",
      "approvedByAdmin": false,
      "status": "MISSING | GENERATING | GENERATED | UPLOADED | APPROVED | FAILED"
    },
    "video": {
      "searchKeywords": ["string"],
      "suggestedUrl": "string | null",
      "approvedUrl": "string | null",
      "approvedByAdmin": false
    }
  },
  "video": { "... (legacy video shape, optional) "},
  "reflectionOptions": ["string", ...],
  "materials": ["string", ...],
  "estimatedMinutes": "number (optional)"
}
```

### 3.2 Interactive Factory Fields

These fields power the new interactive renderer.

```json
{
  "stepKey": "welcome | mission | think_first | learn | connect | example | practice | quick_check | reflect | complete",
  "activityType": "string (e.g. intro, teaching, tap_choice, guided_practice, etc.)",
  "studentInstruction": "string (short instruction for the student)",
  "content": "string (detailed teaching content)",
  "mediaSpec": {
    "type": "image | video | audio",
    "provider": "youtube | upload | generated_or_library",
    "url": "string (empty string if not yet available)",
    "title": "string",
    "altText": "string",
    "purpose": "string",
    "placement": "learn | connect | example",
    "startTime": 0,
    "endTime": 0,
    "reviewStatus": "needs_review | approved",
    "suggestedVideoSearch": "string",
    "source": "string",
    "name": "string (for reward badges)"
  },
  "visualSpec": { "... (see Section 4) "},
  "interactionSpec": { "... (see Section 5) "},
  "feedbackSpec": {
    "correct": "string",
    "incorrect": "string",
    "hint": "string"
  },
  "successCriteria": "string (what the learner should be able to do)",
  "rewardText": "string (optional, shown on completion)"
}
```

---

## 4. Allowed visualSpec Types (v1)

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `fraction_circle` | SVG circle divided into parts | `parts`, `shadedParts`, `equalParts`, `showLabels`, `labels?` |
| `fraction_rectangle` | SVG rectangle divided into parts | `parts`, `shadedParts`, `equalParts`, `orientation?`, `showLabels`, `labels?` |
| `step_reveal` | Sequential reveal of visual steps | `steps: [{ title, description?, visual? }]` |
| `choice_grid` | Grid of visual choices | `choices: [{ id, label, description?, visual? }]` |
| `checklist` | Simple checklist display | `items: [string]` |
| `practice_set` | Container for multi-activity practice | `items: [{ id, type, visual? }]` |
| `real_life_fraction` | Real-life object shown as fraction | `object`, `parts`, `equalParts`, `highlightPart?`, `label?` |
| `recap_checklist` | End-of-lesson recap checklist | `items: [string]` |
| `reflection_card` | Reflection prompt card | `icon?`, `sentenceStarter?` |
| `reward_animation` | Completion reward display | (no required fields; uses `rewardText` and `mediaSpec.name`) |

**Not in v1 (Phase 2):** `drag_match`, `drag_sort`

---

## 5. Allowed interactionSpec Types (v1)

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `tap_continue` | Simple tap to advance | `prompt?` |
| `tap_choice` | Tap one choice from options | `prompt?`, `choices: [string]`, `correctChoiceId` |
| `multiple_choice` | Standard multiple choice | `question`, `options: [string]`, `correctIndex` |
| `step_reveal` | Sequential step reveal | `prompt?` |
| `tap_region` | Tap a region on a visual | `prompt?`, `correctRegion` |
| `shade_shape` | Tap parts to shade a shape | `prompt?`, `shape`, `requiredShadedParts` |
| `multi_activity` | Container for multiple activities | `activities: [{ id, type, ... }]` |
| `reflection_chips` | Select reflection chips + text | `prompt?`, `chips: [string]`, `sentenceStarter?` |
| `open_response` | Free-text response (ungraded) | `prompt?` |
| `short_response` | Short text response (ungraded in v1) | `prompt?`, `expectedIdea?`, `keywords?` |

**Not in v1 (Phase 2):** `drag_match`, `drag_sort`

---

## 6. Step Key Requirements

Each journey must have exactly these 10 steps in this order:

| Position | stepKey | Required visualSpec | Required interactionSpec |
|----------|---------|---------------------|--------------------------|
| 1 | `welcome` | Any supported | `tap_continue` |
| 2 | `mission` | `checklist` or none | `tap_continue` |
| 3 | `think_first` | `choice_grid` or none | `tap_choice` or `multiple_choice` |
| 4 | `learn` | `step_reveal` or `fraction_circle` | `step_reveal` or `tap_continue` |
| 5 | `connect` | `real_life_fraction` or `fraction_circle` | `tap_region` or `tap_choice` |
| 6 | `example` | `step_reveal` or `fraction_circle` | `step_reveal` or `tap_continue` |
| 7 | `practice` | `practice_set` or none | `multi_activity` or `tap_choice` |
| 8 | `quick_check` | `fraction_circle` or none | `multiple_choice` |
| 9 | `reflect` | `reflection_card` or none | `reflection_chips` or `open_response` |
| 10 | `complete` | `recap_checklist` or `reward_animation` | `tap_continue` |

---

## 7. Validation Rules

A generated journey **must fail validation** if any of the following are true:

### 7.1 Structure
- Any required step is missing
- Steps are out of order
- Step count is not exactly 10
- Any step is missing `stepKey`
- Any step is missing `stepType`
- Any step is missing `title`

### 7.2 Legacy Compatibility
- Any step is missing `studentText`
- Any step is missing `owlText`
- `interaction` object is missing for steps that need it
- `media.illustration` is missing when `illustrationPrompt` is set

### 7.3 Interactive Fields
- Any step is missing `stepKey`
- Any step is missing `content`
- Any step is missing `successCriteria`
- `visualSpec.type` is not in the allowed v1 list
- `interactionSpec.type` is not in the allowed v1 list
- `feedbackSpec` is missing for steps with interactive `interactionSpec.type`
- `feedbackSpec.correct` is empty for interactive steps

### 7.4 Content Quality
- Placeholder text appears (e.g. `[content based on source pack]`, `[example to be added]`, `TODO`, `TBD`, `XXX`)
- Learn step has fewer than 2 meaningful content lines
- Example step has no step-by-step structure
- Practice step has no real learner activity
- Quick Check has no valid `correctIndex` or `correctChoiceId`
- Quick Check has fewer than 2 options
- Title and content do not match (content is just the title repeated)

### 7.5 Media Safety
- `mediaSpec.video` is marked `approved` but `url` is empty
- `mediaSpec.video` is required for lesson completion (video must not be the only way to learn)
- `mediaSpec.image` has no `altText`

### 7.6 Fractions-Specific
- A fractions lesson does not mention "equal parts" where halves or quarters are taught
- A fractions lesson uses thirds or arithmetic beyond the scope of Grade 2

### 7.7 Duplicates
- Lesson duplicates another lesson in the same unit (same title, same content)

---

## 8. Example: Minimal Valid Step

```json
{
  "id": "welcome",
  "stepType": "welcome",
  "title": "Welcome",
  "studentText": "Welcome to the lesson.",
  "owlText": "Hello! Let us begin.",
  "visualType": "owl_teacher",
  "illustrationPrompt": "A friendly owl",
  "interaction": { "type": "none" },
  "media": { "illustration": { "prompt": "", "approvedUrl": null, "approvedByAdmin": false, "status": "MISSING" }},
  "stepKey": "welcome",
  "activityType": "intro",
  "studentInstruction": "Get ready to begin.",
  "content": "Welcome to the lesson.",
  "visualSpec": { "type": "fraction_circle", "parts": 1, "shadedParts": 0, "equalParts": true, "showLabels": false },
  "interactionSpec": { "type": "tap_continue", "prompt": "Tap to begin." },
  "feedbackSpec": { "correct": "Great!", "incorrect": "", "hint": "" },
  "successCriteria": "Learner is ready to start."
}
```

---

## 9. Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | June 2026 | Initial schema. 10 required steps. 10 visualSpec types. 10 interactionSpec types. Legacy + interactive dual-field requirement. |
