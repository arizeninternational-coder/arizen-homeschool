# Grade 2 Mathematics — Validation Rules

**Purpose:** These rules are checked AFTER the generator creates a journey.
**Any journey that FAILS validation is REJECTED and must be regenerated.**
**No exceptions. No "close enough."**

---

## Critical Rules (Journey Rejected If Failed)

### 1. Quick Check Must Have a Valid Correct Answer
- `interaction.correctIndex` must exist and be a valid index
- `interaction.options[correctIndex]` must exist and be non-empty
- **No journey without a correct answer can be published**

### 2. Quick Check Answer Must Be Mathematically Correct
- 4 × 4 = 16 (not 15)
- 6 × 10 = 60 (not 55)
- 4 × 2 = 8 (not 9)
- All addition facts must be verified
- All subtraction facts must be verified (no negative results)
- All multiplication facts must be verified

### 3. Subtraction Must Never Produce Negative Answers
- Minuend must be ≥ subtrahend in ALL examples and practice
- If any step shows a negative result, the journey is rejected

### 4. Quick Check Must Match the Lesson Topic
- Addition lesson → QC must test addition
- Subtraction lesson → QC must test subtraction
- Multiplication lesson → QC must test equal groups or repeated addition (NOT simple counting)
- Fractions lesson → QC must test halves or quarters (NOT addition or place value)
- Measurement lesson → QC must test measurement concepts
- Time lesson → QC must test clock reading
- Money lesson → QC must test money concepts
- Geometry lesson → QC must test shapes, lines, or patterns

### 5. No Answer Leaks Before Quick Check
- Connect, Example, and Practice steps must NOT reveal the answer
- Phrases like "the answer is..." or "equals..." in non-QC steps = rejection
- The learner must figure out the answer themselves before Quick Check

### 6. MCQ Options Must Be Well-Formed
- Minimum 4 options for multiple choice
- All options must be distinct
- At least one option must be clearly correct
- Distractors must be plausible (not obviously wrong)

### 7. Journey Must Have Exactly 10 Steps
- Required step types: welcome, mission, think_first, learn, connect, example, practice, quick_check, reflect, complete
- No missing steps
- No extra steps
- Steps must be in the correct order

### 8. No Title-Copying
- studentText must NOT contain the lesson title verbatim
- The journey must teach the topic, not just name it

### 9. No Generic Greetings
- "Welcome to today's lesson" = rejection
- "Hello there, let's learn something new" = rejection
- Welcome must be lesson-specific

### 10. Visual Must Match Topic
- Every step with an illustration must have a topic-appropriate visual
- Fractions visuals must show equal parts
- Subtraction visuals must show taking away
- Multiplication visuals must show equal groups or arrays
- Generic/unrelated visuals = rejection

### 11. Video Placement Rules
- **Maximum 1 video per journey**
- Video must be in Step 6 (Example) OR Step 4 (Learn) only
- Video in Step 4 is allowed only when the concept genuinely needs demonstration
- For Math, video should usually be in Step 6, not Step 4
- Video must NEVER be in Practice (Step 7) or Quick Check (Step 8)
- Video must NOT autoplay

### 12. Media Approval Rules
- `media.approvalStatus` must be set on every media item
- Only `approved` media may be learner-facing
- `draft`, `needs_review`, `rejected`, `missing` media must NOT appear to learners
- Unapproved YouTube URLs must not appear to learners

### 13. Text-Only Teaching Must Work
- If all media (video, audio, SVG) is removed, the journey must still teach the concept
- Text explanation in Learn (Step 4) must be sufficient
- Worked example in Example (Step 6) must exist without video
- The journey must NOT depend on video to teach the main idea

### 14. Alt Text and Transcripts Required
- All images/SVG must have `altText`
- All audio must have `transcript`
- All videos must have `title` and `caption`
- Missing alt text = rejection

### 15. No Placeholder Text
- "Illustration coming soon" = rejection
- "Video coming soon" = rejection
- "Media placeholder" = rejection
- Any text that admits missing content = rejection

### 16. Media Must Match Lesson Topic
- Math lesson → Math visuals only (no English reading content)
- Media must be relevant to the specific lesson, not just the general topic
- Cross-subject media contamination = rejection

### 17. Audio Rules (New)
- Audio must have a transcript (text fallback)
- Audio must NOT autoplay — user taps to play
- Audio files must be lightweight (< 500KB)
- Maximum 30 seconds per audio clip for Grade 2
- Voice type must be specified (`child_friendly`, `teacher`, or `tts_default`)

### 18. Video Reuse Rules (New)
- Maximum 1 video per journey
- Video must not be reused across different topics/strands
- Cross-strand video reuse = rejection

### 19. Low-Bandwidth Rules (New)
- Journey must remain usable if video fails to load
- Text/SVG fallback must load before video
- Do not block lesson completion because media failed
- Video must not autoplay on any connection

### 20. Fallback Rules (New)
- Every media item must have a defined `fallbackType`
- `fallbackText` must be provided for all audio
- If media is missing, fallback must render automatically
- Never show "Media unavailable" to learners

---

## High Rules (Journey Flagged for Review)

### 11. Video Must Be Present and Relevant
- Every journey must have a video URL
- Video must match the lesson topic (not reused from unrelated topic)
- Cross-strand video reuse = flag for review

### 12. Examples Must Teach the Topic
- Example step must show a worked solution for the specific topic
- Generic "let me show you" without actual teaching = flag

### 13. Practice Must Match Topic
- Practice tasks must require the learner to apply the specific topic
- Generic "try this" without topic-specific task = flag

### 14. Real-Life Connection Required
- Connect step must show how the topic applies to real life
- Kenyan context preferred (market, home, school)
- Generic "math is everywhere" = flag

### 15. Reflection Must Be Lesson-Specific
- Reflect step must ask about the specific topic
- Generic "what did you learn?" = flag

---

## Medium Rules (Journey Flagged but May Pass)

### 16. Difficulty Must Be Grade 2 Appropriate
- Number ranges must not exceed Grade 2 limits
- Operations must not exceed Grade 2 scope
- Word problems must be single-step (unless confirmed otherwise)

### 17. Vocabulary Must Be Child-Friendly
- Technical terms must be explained
- Grade 2 reading level required

### 18. Step Text Must Be Concise
- Owl Teacher text should be short and guiding
- StudentText should be clear and actionable
- No walls of text

---

## Topic-Specific Rules

### Fractions
- ONLY halves (1/2) and quarters (1/4)
- NO fraction arithmetic (no 1/2 + 1/4, no comparing fractions)
- MUST show equal parts
- MUST use real objects (food, shapes, paper)

### Multiplication
- MUST use equal groups or arrays as primary representation
- MUST connect to repeated addition
- MUST introduce the × sign
- NO simple counting as multiplication
- Max factor: 10

### Subtraction
- NO negative answers — ever
- MUST show borrowing/regrouping visually when needed
- MUST include number line method

### Time
- ONLY o'clock and half past (unless Victor confirms otherwise)
- MUST use analog clock face
- NO 24-hour time
- NO elapsed time calculations

### Money
- MUST use Kenyan shillings
- MUST show coins and/or notes
- MUST include simple purchase scenarios

---

## Validation Checklist (For Generator)

Before submitting a journey, the generator must verify:

- [ ] 10 steps present, correct order
- [ ] Quick Check has valid correctIndex
- [ ] Quick Check answer is mathematically correct
- [ ] Quick Check matches lesson topic
- [ ] No answer leaks in non-QC steps
- [ ] MCQ has 4+ distinct options
- [ ] No title-copying
- [ ] No generic greetings
- [ ] Visuals match topic
- [ ] Video present and topic-relevant
- [ ] Examples teach the specific topic
- [ ] Practice matches topic
- [ ] Real-life connection is lesson-specific
- [ ] Reflection is lesson-specific
- [ ] Difficulty within Grade 2 limits
- [ ] Vocabulary is child-friendly
- [ ] No negative answers in subtraction
- [ ] Fractions only use 1/2 and 1/4
- [ ] Multiplication uses equal groups/arrays
- [ ] Time only uses o'clock and half past
- [ ] Money uses Kenyan shillings

**If any critical rule fails → REJECT**
**If any high rule fails → FLAG for human review**
**If any medium rule fails → WARN but may pass**
