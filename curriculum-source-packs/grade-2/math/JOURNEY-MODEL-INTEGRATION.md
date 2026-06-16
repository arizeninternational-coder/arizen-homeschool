# Source Pack — Journey Model Integration Update

**Date:** 2026-06-16
**Purpose:** Update the Math source pack plan to reflect the journey media model decisions.

---

## Key Decisions from Journey Model

### 1. Video is Optional, Not Required
- **Maximum 1 video per journey**
- Video is usually Step 6 (Example) only
- Step 4 (Learn) video only when concept genuinely needs demonstration
- For Math: video should usually be optional in Step 6, not Step 4
- **Math MVJ = text + SVG + worked example + practice + QC (no video needed)**

### 2. Audio/Read-Aloud is Now a First-Class Media Type
- Audio is especially important for: English reading, Kiswahili, vocabulary, instructions, accessibility
- Every audio item MUST have a transcript (text fallback)
- Audio does NOT autoplay — user taps to play
- Maximum 30 seconds per clip
- Voice types: `child_friendly`, `teacher`, `tts_default`

### 3. Minimum Viable Journey vs Enhanced Journey
- **MVJ:** Text + SVG + interactions (teaches without any external media)
- **Enhanced:** MVJ + approved audio + optional video + richer visuals
- Math should target MVJ first, then enhance

### 4. Media Approval Status
- 5 states: `missing`, `draft`, `needs_review`, `approved`, `rejected`
- Only `approved` media appears in learner view
- Admin preview shows all media with warning badges

### 5. Low-Bandwidth Rules
- Videos must NOT autoplay
- Text/SVG loads first
- Lesson must work if media fails
- Audio files must be lightweight (< 500KB)

### 6. Accessibility Rules
- All images/SVG need alt text
- All audio needs transcript
- All videos need title/caption
- Feedback must be text-based, not color-only
- All interactions keyboard-navigable

---

## New Source Pack Media Fields

Each lesson/topic in the source pack should now specify:

| Field | Description | Example |
|-------|-------------|---------|
| `required_media_type` | Media that must be present | `svg` |
| `optional_media_type` | Media that enhances | `audio` |
| `visual_type` | SVG/visual style | `equal_groups`, `number_line` |
| `visual_description` | Detailed SVG description | "3 groups of 2 mangoes" |
| `audio_needed` | Audio recommended? | `YES` |
| `video_needed` | Video recommended? | `NO` / `OPTIONAL` |
| `approved_video_url` | Approved YouTube URL | `https://...` |
| `backup_video_url` | Backup URL | `https://...` |
| `media_status` | Current status | `missing` |
| `fallback_required` | Fallback needed? | `YES` |
| `human_review_needed` | Needs human review? | `YES` |

---

## Updated Validation Rules (20 Total)

The math validation rules now include 20 critical rules (up from 10):

1. Quick Check must have valid correct answer
2. Quick Check answer must be mathematically correct
3. Subtraction must never produce negative answers
4. Quick Check must match lesson topic
5. No answer leaks before Quick Check
6. MCQ options must be well-formed
7. Journey must have exactly 10 steps
8. No title-copying
9. No generic greetings
10. Visual must match topic
11. **Video placement rules** (max 1, Step 6 preferred)
12. **Media approval rules** (only approved media learner-facing)
13. **Text-only teaching must work** (no video dependency)
14. **Alt text and transcripts required**
15. **No placeholder text** ("coming soon")
16. **Media must match lesson topic**
17. **Audio rules** (transcript, no autoplay, lightweight)
18. **Video reuse rules** (max 1 per journey, no cross-strand)
19. **Low-bandwidth rules** (no autoplay, fallback first)
20. **Fallback rules** (every media item must have fallback)

---

## Are We Ready to Return to Fractions Source-Pack Filling?

**YES, with the following understanding:**

1. **Fractions source pack should define MVJ first** — text + SVG (equal parts, shading) + worked example + practice + QC
2. **Video is NOT required for Fractions MVJ** — SVG showing equal parts is more important
3. **Audio is recommended** — for reading instructions aloud
4. **Visual guidance is critical** — Fractions needs clear SVG descriptions (halves, quarters, equal parts, shaded shapes)
5. **QC templates must test fractions specifically** — not generic math

### Recommended Next Step
Victor fills the Fractions section of `math-topic-guides.md` with:
- Child-friendly explanation of halves and quarters
- Approved examples (chapati, cake, pizza, paper folding)
- SVG visual descriptions
- QC question templates
- Common mistakes to avoid
- Difficulty limits (halves and quarters only, NO fraction arithmetic)

Then we can generate a **single Fractions proof-of-concept journey** to validate the model before scaling to all 121 lessons.
