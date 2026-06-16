# Arizen School — 10-Step Journey Experience Model

**Version:** 1.0.0
**Created:** 2026-06-16
**Status:** Specification — not yet implemented in generator

---

## Purpose

This document defines the **learning experience** for each of the 10 steps in an Arizen School student journey.

A journey is not a slideshow. It is a **structured learning experience** where each step has a clear purpose, appropriate media, and a required learner action.

The generator must follow this model. The renderer must enforce it.

---

## The 10 Steps

### Step 1: Welcome

**Learning purpose:** Greet the child, set emotional tone, create safety and excitement.

**What the child should experience:**
- A warm, personal greeting from Owl Teacher
- A sense that this lesson is for them
- Brief, friendly, not overwhelming

**Ideal length for Grade 2:** 15-30 seconds of reading/viewing.

**Best media:** Owl/avatar illustration, simple decorative SVG.

**Allowed media:** SVG illustration, owl avatar, short text.

**Forbidden media:** Video, audio, interactive elements, long text.

**Required interaction:** None. This is a passive welcome.

**Fallback if media is missing:** Show owl avatar + welcome text. Never show "Illustration coming soon."

**What should never happen:**
- No teaching content in Welcome
- No video
- No long paragraphs
- No generic "Welcome to today's lesson" — make it lesson-specific
- No subject-specific widgets (no Math manipulatives in Welcome)

---

### Step 2: Mission

**Learning purpose:** Tell the child what they will learn today, in child-friendly language.

**What the child should experience:**
- A clear, simple goal: "Today you will learn to add two-digit numbers"
- Not the raw curriculum outcome — translated into child language
- A sense of purpose

**Ideal length for Grade 2:** 1-2 short sentences.

**Best media:** Text only, optionally with a small icon or goal chip.

**Allowed media:** Text, small icon, goal chip SVG.

**Forbidden media:** Video, audio, long text, raw curriculum wording.

**Required interaction:** None. The child reads the mission.

**Fallback if media is missing:** Show mission text only.

**What should never happen:**
- Raw curriculum outcome pasted verbatim
- "The learner should be able to..." language
- Video
- More than 2 sentences

---

### Step 3: Think First

**Learning purpose:** Activate prior knowledge. Get the child thinking before teaching.

**What the child should experience:**
- A question or prompt that makes them think about something they already know
- Connection to previous learning or real-life experience
- Low-stakes — no wrong answer

**Ideal length for Grade 2:** 1 question or prompt.

**Best media:** Text prompt, optionally with a simple image if it helps context.

**Allowed media:** Text, simple illustration.

**Forbidden media:** Video, teaching content, answer reveals.

**Required interaction:** Optional — child may type a thought or select an emoji. Not graded.

**Fallback if media is missing:** Show text prompt only.

**What should never happen:**
- Teaching new content in Think First
- Revealing the answer
- Video
- Complex multi-part questions

---

### Step 4: Learn

**Learning purpose:** Teach the core concept. This is the most important step.

**What the child should experience:**
- A clear, simple explanation of the new concept
- Visual support (diagram, illustration, worked example)
- Concrete → Representational → Abstract progression
- The concept is taught here — not in the video, not in the practice

**Ideal length for Grade 2:** 30-60 seconds of focused content.

**Best media:** Short explanation text + SVG/diagram/illustration. Video optional only if the concept needs demonstration (e.g., measuring with a ruler).

**Allowed media:** Text, SVG illustration, diagram, optional short approved video.

**Forbidden media:** Long video as primary teaching, passive-only content with no visual.

**Required interaction:** None for passive learning, but the step must contain teaching content.

**Fallback if media is missing:**
- If video is missing: show worked example + text explanation
- If SVG is missing: show text explanation + simple generated visual placeholder
- The lesson must still teach without video

**What should never happen:**
- Video is the ONLY teaching content
- No visual at all for Math concepts
- Generic "let's learn" without actual teaching
- Answer leaks

---

### Step 5: Real Life Connection

**Learning purpose:** Show the child why this matters. Connect to their world.

**What the child should experience:**
- A real-life scenario from Kenyan context (home, school, market, community)
- Understanding that this math is useful
- Relatable characters or situations

**Ideal length for Grade 2:** 1-2 sentences + visual.

**Best media:** Contextual illustration/photo-style image/SVG showing real-life use.

**Allowed media:** SVG illustration, image, short text.

**Forbidden media:** Long video, abstract examples, non-Kenyan contexts (unless specified).

**Required interaction:** None. This is a connection moment.

**Fallback if media is missing:** Show text-only real-life scenario.

**What should never happen:**
- Generic "math is everywhere" without specific example
- Video longer than 30 seconds
- Abstract or foreign contexts

---

### Step 6: Example

**Learning purpose:** Show the child how to apply the concept. Worked example.

**What the child should experience:**
- A step-by-step worked example
- Clear reasoning at each step
- This is the best place for video IF video is used

**Ideal length for Grade 2:** 30-60 seconds.

**Best media:** Worked example (SVG or text) + optional approved short video.

**Allowed media:** SVG worked example, text worked example, approved YouTube video (under 5 min), animation.

**Forbidden media:** Unverified YouTube videos, video as ONLY teaching source.

**Required interaction:** None for the example itself, but a worked example MUST exist even if video is present.

**Fallback if media is missing:**
- If video is missing: show worked example (required)
- If SVG is missing: show text-based worked example
- A worked example is NEVER optional

**What should never happen:**
- Video with no text-based worked example backup
- Unverified YouTube video shown to learners
- Example that doesn't match the lesson topic

---

### Step 7: Practice

**Learning purpose:** The child applies the concept themselves.

**What the child should experience:**
- A task they must complete
- Active doing — not watching, not reading
- Immediate feedback after submission

**Ideal length for Grade 2:** 1-3 tasks, each taking 30-60 seconds.

**Best media:** Interactive task — number input, writing box, matching, drag-and-drop (later), drawing prompt.

**Allowed media:** Interactive elements, text prompts, visual supports.

**Forbidden media:** Passive video, reading-only tasks, tasks without clear instructions.

**Required interaction:** YES — the child must do something. This is not optional.

**Fallback if media is missing:** Show text-based practice task with input field.

**What should never happen:**
- Passive content in Practice
- No learner action required
- Video watching as "practice"
- Tasks that don't match the lesson topic

---

### Step 8: Quick Check

**Learning purpose:** Test understanding. Provide feedback.

**What the child should experience:**
- A question that tests the actual lesson concept
- Immediate feedback after answering
- Know if they got it right or wrong
- If wrong, guidance on why

**Ideal length for Grade 2:** 1 question, 15-30 seconds.

**Best media:** MCQ with 4 options, or number input, or matching.

**Allowed media:** MCQ, number input, matching, ordering, short answer.

**Forbidden media:** Video, open-ended essay questions, questions unrelated to topic.

**Required interaction:** YES — the child must answer. Must have correct answer logic.

**Fallback if media is missing:** This step cannot be missing. Every journey must have a valid Quick Check.

**What should never happen:**
- No correct answer defined
- Question unrelated to lesson topic
- Answer revealed before the child responds
- Video
- More than 2 questions (Grade 2 attention span)

---

### Step 9: Reflect

**Learning purpose:** Help the child think about their learning. Metacognition.

**What the child should experience:**
- A simple prompt: "What did you learn?" or "How do you feel?"
- Emoji self-rating or short writing box
- No right or wrong — this is reflection

**Ideal length for Grade 2:** 15-30 seconds.

**Best media:** Short text prompt + emoji selector or simple writing box.

**Allowed media:** Text prompt, emoji selector, short writing box.

**Forbidden media:** Video, teaching content, graded assessment.

**Required interaction:** Optional — child may reflect or skip.

**Fallback if media is missing:** Show text prompt only.

**What should never happen:**
- Teaching new content in Reflection
- Video
- Graded assessment disguised as reflection

---

### Step 10: Complete

**Learning purpose:** Celebrate completion. Provide closure.

**What the child should experience:**
- Celebration (confetti, badge, XP earned)
- Summary of what was learned
- Encouragement to continue
- Clear end point

**Ideal length for Grade 2:** 15-30 seconds.

**Best media:** Celebration animation/SVG, XP badge, summary text.

**Allowed media:** SVG celebration, badge icon, summary text, XP display.

**Forbidden media:** Video, teaching content, new tasks.

**Required interaction:** None. This is a closing moment.

**Fallback if media is missing:** Show text summary + XP earned.

**What should never happen:**
- New teaching content in Complete
- Video
- "Coming soon" or "To be continued"
- No sense of completion

---

## Media Summary Per Step

| Step | Best Media | Video Allowed? | Audio Allowed? | Required Interaction |
|------|-----------|---------------|----------------|---------------------|
| 1. Welcome | Owl/avatar SVG | ❌ No | ✅ Read-aloud | None |
| 2. Mission | Text + icon | ❌ No | ✅ Read-aloud | None |
| 3. Think First | Text prompt | ❌ No | ✅ Read-aloud | Optional |
| 4. Learn | Text + SVG/diagram | ⚠️ Optional | ✅ Read-aloud | None |
| 5. Real Life | Contextual SVG | ❌ No | ✅ Read-aloud | None |
| 6. Example | Worked example + optional video | ✅ Yes (best place) | ✅ Read-aloud | None |
| 7. Practice | Interactive task | ❌ No | ✅ Instructions | ✅ Required |
| 8. Quick Check | MCQ/number input | ❌ No | ✅ Instructions | ✅ Required |
| 9. Reflect | Text + emoji/writing | ❌ No | ✅ Read-aloud | Optional |
| 10. Complete | Celebration SVG + XP | ❌ No | ✅ Celebration | None |

---

## Minimum Viable Journey vs Enhanced Journey

### Minimum Viable Journey (MVJ)

A journey that teaches the concept without any external media.

**Must have:**
- Clear Owl guidance text (every step)
- Child-friendly student text (every step)
- Topic-appropriate SVG/visual where concept needs it (Steps 4, 5, 6)
- Practice interaction (Step 7) — child must do something
- Quick Check (Step 8) — valid question + correct answer + feedback
- Reflection prompt (Step 9)
- Completion/reward (Step 10)

**Does NOT need:**
- Video
- Audio (helpful but not required for MVJ)
- Animation
- Rich illustrations (simple SVG is fine)

**Rule:** A minimum viable journey must fully teach the concept. If removing video makes the lesson unteachable, the journey is not viable.

### Enhanced Journey

A journey that adds media to improve the learning experience.

**Adds to MVJ:**
- Approved video (Step 6 preferred, Step 4 only if concept needs demonstration)
- Audio/read-aloud for instructions, reading, vocabulary
- Richer illustrations and animations
- Stronger interactive tasks
- Sound effects and celebrations

**Rule:** Enhanced journey = MVJ + approved media. Never the other way around.

### When to Use Each

| Situation | Use |
|-----------|-----|
| Initial generation / low bandwidth | Minimum Viable Journey |
| English reading, Kiswahili | Enhanced (audio recommended) |
| Concept needs demonstration (measuring, folding) | Enhanced (video in Step 6) |
| Mobile-first learners | MVJ + audio, no video |
| Concepts that are hard to show in static images | Enhanced (video in Step 6) |

---

## Key Principles

1. **Video supports, never carries.** The lesson must teach without video.
2. **Audio helps, never replaces text.** Every audio must have a transcript fallback.
3. **Every step has a purpose.** No filler steps.
4. **Media matches the step.** No video in Welcome. No passive content in Practice.
5. **The child must act.** Steps 7 and 8 require learner action.
6. **Fallbacks always exist.** Missing media never blocks the lesson.
7. **Grade 2 appropriate.** Short, simple, concrete, visual.
8. **Kenyan context.** Real-life connections use Kenyan settings.
9. **Only approved media reaches learners.** Draft/unapproved media stays in admin preview.
10. **Low-bandwidth first.** Text/SVG loads first. Video is optional and never autoplays.
