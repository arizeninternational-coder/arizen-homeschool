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
