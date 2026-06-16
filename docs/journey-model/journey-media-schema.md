# Arizen School — Journey Media Schema

**Version:** 1.0.0
**Purpose:** Define the JSON schema for journey step media, interactions, and validation.
**Used by:** Journey generator, journey renderer, admin preview.

---

## Journey Step Schema

```json
{
  "stepNumber": 1,
  "stepType": "welcome",
  "title": "Welcome!",
  "purpose": "Greet the child and set emotional tone",

  "owlText": "Hello friend! Today we're going to learn something exciting about addition.",
  "studentText": "Let's learn how to add two-digit numbers together!",

  "media": {
    "type": "svg",
    "source": "generated",
    "url": "",
    "assetId": "svg-welcome-001",
    "altText": "Owl teacher waving hello",
    "caption": "",
    "approved": true,
    "humanReviewed": true,
    "required": false,
    "fallbackType": "text"
  },

  "interaction": {
    "type": "none",
    "question": "",
    "options": [],
    "correctAnswer": "",
    "correctIndex": null,
    "feedbackCorrect": "",
    "feedbackIncorrect": "",
    "requiresSave": false
  },

  "validation": {
    "requiresOwlText": true,
    "requiresStudentText": true,
    "requiresMedia": false,
    "requiresInteraction": false,
    "minTextLength": 10,
    "maxTextLength": 200
  },

  "localization": {
    "sw": {
      "owlText": "Habari rafiki! Tutajifunza kitu kuhusu kujumlisha.",
      "studentText": "Tujifunze kujumlisha nambari mbili!"
    }
  },

  "accessibility": {
    "ariaLabel": "Welcome to the lesson",
    "altText": "Owl teacher waving hello",
    "readingLevel": "grade-2"
  }
}
```

---

## Media Object Schema

```json
{
  "type": "none | svg | image | youtube | audio | animation | interactive",

  "source": "generated | approved_url | uploaded_asset | external",

  "url": "https://...",
  "assetId": "unique-asset-id",

  "altText": "Description for screen readers",
  "caption": "Optional caption below media",

  "approved": false,
  "humanReviewed": false,

  "required": false,
  "fallbackType": "text | svg | worked_example | none"
}
```

### Media Type Definitions

| Type | Description | Used In Steps |
|------|-------------|---------------|
| `none` | No media | Any step |
| `svg` | Generated or approved SVG illustration | 1, 4, 5, 6, 10 |
| `image` | Uploaded or approved image/photo | 5, 6 |
| `youtube` | Approved YouTube embed | 4 (optional), 6 (best place) |
| `audio` | Audio narration (future) | Any |
| `animation` | Lottie/CSS animation | 6, 10 |
| `interactive` | Interactive widget (future) | 7 |

### Media Source Definitions

| Source | Description |
|--------|-------------|
| `generated` | AI-generated SVG or visual |
| `approved_url` | Manually approved external URL |
| `uploaded_asset` | Uploaded to Supabase Storage |
| `external` | External URL (requires approval) |

### Fallback Type Definitions

| Fallback | When Used |
|----------|-----------|
| `text` | Show text explanation instead of media |
| `svg` | Show simple generated SVG instead of complex media |
| `worked_example` | Show worked example instead of video |
| `none` | No fallback (step still works) |

---

## Interaction Object Schema

```json
{
  "type": "none | multiple_choice | number_input | text_response | matching | ordering | drawing_prompt | reflection",

  "question": "What is 4 × 4?",

  "options": ["16", "15", "14", "12"],

  "correctAnswer": "16",
  "correctIndex": 0,

  "feedbackCorrect": "Yes! 4 groups of 4 equals 16.",
  "feedbackIncorrect": "Not quite. Count the groups: 4 + 4 + 4 + 4 = ?",

  "requiresSave": true
}
```

### Interaction Type Definitions

| Type | Description | Used In Steps |
|------|-------------|---------------|
| `none` | No interaction | 1, 2, 4, 5, 6, 10 |
| `multiple_choice` | Select one from options | 8 (Quick Check) |
| `number_input` | Type a number | 7, 8 |
| `text_response` | Type a short answer | 3, 9 |
| `matching` | Match items (future) | 7, 8 |
| `ordering` | Put items in order (future) | 7, 8 |
| `drawing_prompt` | Draw on canvas (future) | 7 |
| `reflection` | Emoji or short text | 9 |

---

## Validation Object Schema

```json
{
  "requiresOwlText": true,
  "requiresStudentText": true,
  "requiresMedia": false,
  "requiresInteraction": false,
  "minTextLength": 10,
  "maxTextLength": 200
}
```

### Validation Rules Per Step Type

| Step | requiresOwlText | requiresStudentText | requiresMedia | requiresInteraction | maxTextLength |
|------|----------------|---------------------|---------------|---------------------|---------------|
| welcome | ✅ | ✅ | ❌ | ❌ | 150 |
| mission | ❌ | ✅ | ❌ | ❌ | 100 |
| think_first | ✅ | ✅ | ❌ | ❌ | 100 |
| learn | ✅ | ✅ | ⚠️ Recommended | ❌ | 200 |
| real_life | ✅ | ✅ | ⚠️ Recommended | ❌ | 150 |
| example | ✅ | ✅ | ✅ (worked example) | ❌ | 200 |
| practice | ✅ | ✅ | ⚠️ Recommended | ✅ | 150 |
| quick_check | ❌ | ✅ (question) | ❌ | ✅ | 100 |
| reflect | ✅ | ✅ | ❌ | ❌ | 100 |
| complete | ✅ | ✅ | ⚠️ Recommended | ❌ | 100 |

---

## Complete Journey Schema

```json
{
  "version": "1.0.0",
  "lessonId": "uuid",
  "title": "Adding Two 2-Digit Numbers",
  "subject": "Mathematics",
  "grade": 2,
  "language": "en",

  "steps": [
    { /* step 1 */ },
    { /* step 2 */ },
    { /* ... */ },
    { /* step 10 */ }
  ],

  "metadata": {
    "generatedAt": "2026-06-16T00:00:00Z",
    "generator": "source-pack-v1",
    "sourcePackVersion": "1.0.0",
    "validated": false,
    "humanReviewed": false,
    "approvedForLearners": false
  }
}
```

---

## Localization Schema

```json
{
  "localization": {
    "sw": {
      "owlText": "Kiswahili version",
      "studentText": "Kiswahili version"
    }
  }
}
```

- Default language: English (`en`)
- Secondary language: Kiswahili (`sw`)
- All text fields support localization
- Media alt text must also be localized

---

## Accessibility Schema

```json
{
  "accessibility": {
    "ariaLabel": "Descriptive label for screen readers",
    "altText": "Description of visual content",
    "readingLevel": "grade-2",
    "supportsScreenReader": true,
    "supportsKeyboardNavigation": true
  }
}
```

- All media must have `altText`
- All steps must have `ariaLabel`
- Reading level must be `grade-2` or `grade-1`
- All interactions must be keyboard-navigable
