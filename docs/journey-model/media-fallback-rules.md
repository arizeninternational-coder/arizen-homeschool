# Arizen School — Media Fallback Rules

**Version:** 1.0.0
**Purpose:** Define what happens when media is missing, unapproved, or fails to load.
**Principle:** The lesson must always teach. Missing media never blocks learning.

---

## Core Fallback Principle

**A journey must work without any external media.**

Video is optional support. SVG is helpful but not required. The text content must be sufficient to teach the concept on its own.

If all media is removed, the journey must still be a valid learning experience.

---

## Fallback Rules by Media Type

### YouTube Video Missing or Unapproved

| Step | Fallback Behavior |
|------|-------------------|
| Learn (Step 4) | Show text explanation + SVG/diagram. If no SVG, show text-only worked example. |
| Example (Step 6) | Show text-based worked example (required backup). Remove video player entirely. |
| All other steps | Video should not be present. If it is, remove it. |

**Rule:** Never show a broken video player. Never show "Video unavailable." Never show a video placeholder.

**Implementation:**
```
IF media.type = "youtube" AND (media.approved = false OR media.url = "") THEN
  IF stepType = "learn" THEN
    render text + SVG fallback
  IF stepType = "example" THEN
    render worked example (text + SVG)
  ELSE
    render without media
```

### SVG Missing or Failed to Load

| Step | Fallback Behavior |
|------|-------------------|
| Welcome (Step 1) | Show owl avatar placeholder + text |
| Learn (Step 4) | Show text explanation only. Add simple generated visual placeholder. |
| Real Life (Step 5) | Show text-only real-life scenario |
| Example (Step 6) | Show text-based worked example |
| Practice (Step 7) | Show text-based practice task |
| Complete (Step 10) | Show celebration text + XP |

**Rule:** Never show "Illustration coming soon" or "Image placeholder" to learners.

**Implementation:**
```
IF media.type = "svg" AND (media.url = "" OR media.loadFailed = true) THEN
  IF stepType = "welcome" THEN
    render defaultOwlAvatar + text
  IF stepType = "learn" THEN
    render text + generateSimpleVisual()
  ELSE
    render text only
```

### Image Missing or Unapproved

| Step | Fallback Behavior |
|------|-------------------|
| Real Life (Step 5) | Show text-only real-life scenario |
| Example (Step 6) | Show text-based worked example |

**Rule:** Never show broken image icons. Never show unapproved external images.

### Audio Missing

| Step | Fallback Behavior |
|------|-------------------|
| Any | Show text only. Audio is supplementary. |

---

## Fallback Rules by Step

### Step 1: Welcome
- **Primary:** Owl SVG + welcome text
- **Fallback:** Default owl avatar + welcome text
- **Never show:** "Illustration coming soon"

### Step 2: Mission
- **Primary:** Mission text + optional icon
- **Fallback:** Mission text only
- **Never show:** Empty step

### Step 3: Think First
- **Primary:** Text prompt + optional image
- **Fallback:** Text prompt only
- **Never show:** Empty step

### Step 4: Learn
- **Primary:** Text explanation + SVG/diagram + optional video
- **Fallback:** Text explanation + simple generated visual
- **Last resort:** Text explanation only
- **Never show:** Video player with no video, "Media coming soon"

### Step 5: Real Life Connection
- **Primary:** Text + contextual SVG/image
- **Fallback:** Text-only real-life scenario
- **Never show:** Generic "math is everywhere" without specific example

### Step 6: Example
- **Primary:** Worked example (text + SVG) + optional video
- **Fallback:** Text-based worked example (REQUIRED — never omit)
- **Never show:** Video without text backup, unverified YouTube embed

### Step 7: Practice
- **Primary:** Interactive task + visual support
- **Fallback:** Text-based practice task with input field
- **Never show:** Video as practice, passive content

### Step 8: Quick Check
- **Primary:** MCQ with 4 options
- **Fallback:** Cannot be missing. Every journey must have a valid Quick Check.
- **Never show:** Video, question without correct answer

### Step 9: Reflect
- **Primary:** Text prompt + emoji selector
- **Fallback:** Text prompt only
- **Never show:** Video, teaching content

### Step 10: Complete
- **Primary:** Celebration SVG + summary text + XP
- **Fallback:** Summary text + XP only
- **Never show:** Video, "Coming soon"

---

## Fallback Priority

When media is missing, the renderer should try these in order:

1. **Primary media** (as specified in the journey)
2. **Fallback media** (specified in `media.fallbackType`)
3. **Generated placeholder** (simple SVG or text)
4. **Default asset** (owl avatar, default celebration)
5. **Text only** (always works)

---

## Admin Preview vs Learner View

### Admin Preview
- Shows draft journeys
- Shows unapproved media with warning badges
- Shows "UNAPPROVED" overlay on unapproved videos
- Shows fallback indicators
- Allows editing

### Learner View
- Shows published journeys only
- Never shows unapproved media
- Never shows fallback indicators
- Never shows "coming soon" text
- Always shows complete, polished content

---

## Error Handling

### Video fails to load
1. Hide video player
2. Show fallback content (worked example for Example step)
3. Log error for admin review
4. Do NOT show error message to learner

### SVG fails to load
1. Hide image element
2. Show fallback text or generated visual
3. Log error for admin review
4. Do NOT show broken image icon to learner

### Interaction fails to validate
1. In admin preview: show error message, block save
2. In learner view: show friendly "Try again" message
3. Log error for admin review

### Entire step is empty
1. In admin preview: show "Step is empty" warning, block save
2. In learner view: skip step (should never happen if validation passed)
3. Log critical error
