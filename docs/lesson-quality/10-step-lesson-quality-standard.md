# 10-Step Lesson Quality Standard

## Purpose

Every lesson in Arizen follows a 10-step journey. This document defines what each step must do, what media belongs, what must NOT appear, and what makes a lesson good enough to publish.

---

## The 10 Steps

### Step 1: Welcome
**Purpose**: Warm greeting. Set a friendly tone. Make the child feel welcome.
**Content**: Owl greets the child by name (or generically). One short paragraph.
**Media**: Owl illustration (auto-generated is fine)
**Interaction**: None
**Must NOT**:
- Be longer than 2-3 sentences
- Repeat the lesson title
- Include teaching content (save it for Learn)
**Good enough when**: A child feels welcomed and knows what's coming.

---

### Step 2: Mission
**Purpose**: Tell the child what they'll learn today. Clear learning objective.
**Content**: "Today you will learn about [concept]." One sentence. Kid-friendly language.
**Media**: Optional illustration showing the concept
**Interaction**: None
**Must NOT**:
- Be longer than 1-2 sentences
- Use jargon or academic language
- List multiple objectives (one per lesson)
**Good enough when**: A child can say "I'm going to learn about X."

---

### Step 3: Think First
**Purpose**: Activate prior knowledge. Get the child thinking before teaching.
**Content**: A question or prompt that asks the child to predict, guess, or share what they already know.
**Media**: Image or diagram related to the question
**Interaction**: Text input — "What do you think?" The child types their guess.
**Must NOT**:
- Have a "right" answer (this is about thinking, not testing)
- Be too hard (the child hasn't learned it yet)
- Require more than a sentence or two
**Good enough when**: The child has something to compare their learning against.

---

### Step 4: Learn
**Purpose**: Core teaching. This is where the concept is explained.
**Content**: Clear, simple explanation of the concept. Use examples. Build understanding step by step.
**Media**: 
- **Math**: SVG/diagrams PRIMARY. Show the concept visually. Video optional.
- **English**: Images + text. Video for stories/listening.
- **Kiswahili**: Same as English.
- **Environmental**: Images of nature/real world.
- **Hygiene**: Images showing habits/diagrams.
- **Movement**: Video or image sequence.
**Interaction**: None (reading/watching)
**Must NOT**:
- Be walls of text (break into short paragraphs, max 3-4 sentences each)
- Repeat the same content as the owl message
- Include video as the ONLY content (video supplements, doesn't replace)
**Good enough when**: A child understands the concept well enough to try it.

---

### Step 5: Connect
**Purpose**: Real-world connection. Show why this matters in the child's life.
**Content**: "You can see [concept] when you..." Connect to the child's daily life.
**Media**: Real-world photo or illustration
**Interaction**: None
**Must NOT**:
- Be generic ("math is everywhere")
- Be longer than 2-3 sentences
**Good enough when**: The child sees why this concept matters to THEM.

---

### Step 6: Example
**Purpose**: Worked example. Show the concept in action.
**Content**: A clear, step-by-one example. Show the work. Explain each step.
**Media**: 
- **Math**: Diagram/SVG showing the work. Each step labeled.
- **Other**: Image or diagram showing the example.
**Interaction**: None
**Must NOT**:
- Skip steps (show ALL work)
- Be different from what was taught in Learn
**Good enough when**: The child can follow the example and understand each step.

---

### Step 7: Practice
**Purpose**: Guided practice. The child tries with scaffolding.
**Content**: A problem or activity similar to the example. Include hints or scaffolding.
**Media**: Workspace area. For MCQ: show options. For drawing: show canvas area.
**Interaction**: 
- Multiple choice with 3-4 options, OR
- Text input for short answers, OR
- Drawing/ordering activity
**Must NOT**:
- Just say "Your Turn" with no actual practice content
- Be harder than the example (same difficulty or easier)
- Have no feedback
**Good enough when**: The child can attempt the practice with the skills they just learned.

---

### Step 8: Quick Check
**Purpose**: Check understanding. One question that tests the core concept.
**Content**: One clear question. Not tricky. Tests the main concept from Learn.
**Media**: Question text + options (if MCQ)
**Interaction**: Multiple choice (3-4 options) with immediate feedback
**Feedback rules**:
- Correct: "Great job! [Brief explanation of why it's correct]"
- Incorrect: "Not quite. [Hint that helps them think, NOT the answer]"
**Must NOT**:
- Have generic feedback ("Try again!" with no hint)
- Test something not taught in the lesson
- Have more than 4 options
- Reveal the answer in the owl message
**Good enough when**: The child knows whether they understand the concept.

---

### Step 9: Reflect
**Purpose**: Metacognition. The child thinks about their learning.
**Content**: "What did you learn today?" or "How did you figure that out?"
**Media**: Optional: reflection chips (e.g., "I got it!", "I need practice", "I want to learn more")
**Interaction**: Text input or chip selection
**Must NOT**:
- Be required to type a long response
- Feel like a test
**Good enough when**: The child has a moment to think about their own learning.

---

### Step 10: Complete
**Purpose**: Celebration. Positive closure. XP reward.
**Content**: "Great work! You learned about [concept] today!" + XP earned
**Media**: Trophy/celebration illustration
**Interaction**: "Mark Complete" button
**Must NOT**:
- Introduce new content
- Be longer than 2-3 sentences
**Good enough when**: The child feels accomplished and wants to come back tomorrow.

---

## Media Rules by Subject

| Subject | Primary Media | Secondary | Avoid |
|---------|--------------|-----------|-------|
| Mathematics | SVG/Diagrams | Images | Video-only teaching |
| English | Images + Text | Video (stories) | Audio-only |
| Kiswahili | Images + Text | Video (conversation) | Audio-only |
| Environmental | Real-world images | Video (experiments) | Text-only |
| Hygiene | Diagrams/Images | Video (demonstration) | Text-only |
| Movement | Video | Image sequences | Text-only |

---

## Quality Checklist (Before Publishing)

### Content Quality
- [ ] Each step has a clear purpose (teach, check, or connect)
- [ ] No step is empty or has placeholder text
- [ ] Student text and owl text don't repeat the same content
- [ ] Practice step has actual practice content (not just "Your Turn")
- [ ] Quick Check feedback is specific and educational
- [ ] Math lessons have visual representations (SVG/diagrams)
- [ ] Language lessons have engaging images

### Media Quality
- [ ] Every step that needs an illustration has one (generated or uploaded)
- [ ] Video only appears where it adds value (not forced on every step)
- [ ] No "Video coming soon" or "Add Video" visible to students
- [ ] Images are relevant and clear (not generic stock photos)

### UX Quality
- [ ] "Owl Teacher says:" label is NOT visible (owl + bubble is self-explanatory)
- [ ] No repeated text between owl and student content
- [ ] Navigation is clear (progress bar, step dots, next/prev buttons)
- [ ] Completion flow works (XP popup, confetti, back to quest)

### Technical Quality
- [ ] All interaction types render correctly
- [ ] Quick Check correct/incorrect feedback works
- [ ] Reflection saves correctly
- [ ] Lesson completion API call succeeds

---

## What Makes a Lesson "Good Enough"

A lesson is good enough to publish when:
1. A child can complete it without getting confused or frustrated
2. Each step teaches or checks something specific
3. The practice step actually practices (not just labels)
4. The quick check feedback helps the child learn
5. The media supports the content (not decoration)
6. The lesson feels warm, purposeful, and complete

A lesson is NOT ready when:
1. Any step is empty or has placeholder text
2. Practice is just "Your Turn" with no content
3. Quick Check feedback is generic
4. Owl text and student text say the same thing
5. Math lessons have no diagrams
6. Video "Add" buttons are visible to students
