# Journey Generation Quality Rules

**Last updated:** 2026-06-08  
** Applies to:** All journey generators (Grade 2 Math Batch 1, Batch 2, and future batches/subjects)

---

## 1. Answer Leak Prevention (CRITICAL)

- **Owl Teacher text must NEVER reveal the answer** before the learner has attempted it.
- Bad: `` The answer is ${answer}. ``
- Bad: `` Real addition! The answer is 15. ``
- Good: `` Try this one on your own. Use what you learned in the example. You've got this! ``
- Good: `` Good thinking. Now let's connect this idea to something you might see in real life. ``
- The `interaction` field (multiple_choice, open_numeric, self_check) is the **only** place the answer should live.
- Owl Teacher provides **guidance and encouragement**, not answers.
- Applies to: `think_first`, `connect`, `practice`, `learn` (check) steps.

## 2. Exactly 10 Steps

Every journey must have exactly 10 steps, in this order:

| # | Step Type | Purpose |
|---|-----------|---------|
| 1 | `welcome` | Warm greeting, set the mood |
| 2 | `mission` | Clear learning objective |
| 3 | `think_first` | Activate prior knowledge (open response) |
| 4 | `learn` | Core teaching content |
| 5 | `connect` | Real-world connection |
| 6 | `example` | Worked example (teacher shows) |
| 7 | `practice` | Guided practice (learner tries) |
| 8 | `quick_check` | Assess understanding (interactive) |
| 9 | `reflect` | Metacognition — "What did you learn?" |
| 10 | `complete` | Celebration and closure |

- Do NOT add extra practice steps to reach a "2 practice steps" requirement.
- Do NOT merge steps to compensate for bad prompts.
- Each step must have **one clear purpose**.

## 3. Quick Check (Step 8) Rules

- Must be **interactive** — `interaction.type` must be set.
- Valid types: `multiple_choice`, `open_numeric`, `self_check`.
- Must NOT render as plain text — if `interaction` is missing or wrong type, Quick Check will show raw text.
- Feedback (correct/incorrect messages) shown **only after** the learner responds.
- Question must be answerable from the journey's content — not trivia.

## 4. Owl Teacher Voice

- **Short**: 1-3 sentences max per step.
- **Guiding, not lecturing**: Ask questions, hint, encourage — don't explain everything.
- **Non-repetitive**: Don't use the same phrase across multiple steps.
- **Child-friendly**: Warm, age-appropriate for Grade 2 (~7–8 years old).
- **Never reveals answers**: See Rule 1.
- Never uses JSON, code, or raw data structures in text.

## 5. No Raw Illustration Prompts in Student Content

- `illustrationPrompt` is an **admin-only metadata field** for image generation.
- Must NEVER appear in `studentText` or `owlText`.
- Scanner check: grep student-facing text for strings like `"illustrationPrompt"`, `"A colorful"`, `"cartoon style"`.

## 6. Step Content Rules

- **Content above the fold**: Each step should feel like a slide — minimal scrolling.
- **No JSON in learner-facing content**: All JSON must be in the data structure, never in text fields.
- **Media relevance**: Video keywords and illustrations must match the exact lesson topic.
- **Materials**: List concrete, classroom-available items (counters, bottles, coins) — not vague.

## 7. Journey-Lesson Alignment

- Journey content must match the **lesson shell exactly** (same sub-strand, same topic).
- Do not generate content from adjacent sub-strands.
- Title, grade, and subject must all align.

## 8. Interaction Field Integrity

- Every interactive step (`think_first`, `connect`, `practice`, `quick_check`) must have a valid `interaction` object.
- Required fields per type:
  - `multiple_choice`: `question`, `options` (array of `{id, label, correct}`)
  - `open_numeric`: `prompt`, `expectedAnswer`
  - `self_check`: `question`, `answer`
  - `chip_select_plus_write`: `prompt`, `chips` (array), `writePrompt`
  - `open_response`: `prompt`
- Type string must be exact: `"multiple_choice"` not `"choice"` (the viewer has a fallback map for `"choice"` → `"multiple_choice"`, but don't rely on it).

## 9. Generator Code Rules

- **Never use hooks inside IIFEs**: `useState`, `useEffect`, etc. must be at the top level of React components.
- **Use service role key** for server-side Supabase writes (not RLS-dependent anon key).
- **Never overwrite existing journeys** without explicit approval.
- Generator must save to `contentBlocks.studentJourneyDraft` (not `studentJourney`) for admin review.

## 10. Quality Scanner Checklist

Before committing any batch, run:

1. **Answer leak scan**: grep all owlText and studentText for answer patterns (`"answer is"`, `"equals ${"`, `"result is"`)
2. **Step count verify**: all journeys must have exactly 10 steps
3. **Step type verify**: all 10 required step types present in order
4. **Interaction verify**: `connect`, `practice`, `quick_check` must have non-none interaction types
5. **Illustration prompt leak**: grep studentText for illustration prompt text
6. **JSON in text**: grep for `{` and `}` in studentText (should only appear in actual JSON, not in content strings)

---

## Violations Found in Grade 2 Math

### Batch 1 (10 lessons, June 2026)
- **11-step issue**: All 10 journeys had 11 steps (extra practice step). Fixed by merging consecutive practice steps.
- **Answer leak in `standardJourney` helper**: Connect step had `` `The answer is ${connectAns}.` `` — patched.
- **Answer leak in `standardJourney` helper**: Practice step had `` `The answer is ${practiceAns}.` `` — patched.
- **3 DB journeys patched**: 2 via Batch 2 script (`standardJourney` journeys), 1 remaining ("Adding 3 Single Digit Numbers Vertically").

### Batch 2 (19 lessons, June 2026)
- All 19 generated with patched `standardJourney` helper — no answer leaks introduced.
- Step count: 10 steps confirmed for all 19.

---

## Future Generator Improvements

- [ ] Replace template-based generation with AI-powered (OpenRouter) when quality baseline is stable
- [ ] Add automatic quality scanner as pre-commit hook
- [ ] Add per-step word count limits to enforce "slide-like" feel
- [ ] Add illustration prompt auto-generation that's always separated from student content
- [ ] Add journey playback simulator that walks all 10 steps and flags issues
