# QA scripts

## `walk-lesson.js`

Drives a real learner through a lesson in Chromium and captures every step as a
screenshot plus a text dump.

It exists because the lesson is client-rendered: `curl` only ever returns
"Loading your lesson...", so layout regressions and progression bugs are
invisible without a browser. This is what caught the journey rail overlapping the
lesson card, and a correct answer being scored wrong.

```bash
PROBE_BASE=https://your-preview-url \
PROBE_EMAIL=probe@example.test \
PROBE_PASSWORD='...' \
node scripts/qa/walk-lesson.js
```

Optional:

| Variable | Default | Meaning |
|---|---|---|
| `PROBE_LESSON` | Grade 4 ordering-and-rounding | full lesson URL to walk |
| `PROBE_WAIT_MS` | `4500` | wait after each answer |

`--decisions` also prints the `/api/learner/adaptive-decision` response bodies,
which is how the `actionType: "remediate"` misdiagnosis was identified.

### Reading the output

`step N/M` lines are the lesson's own progress. A run that repeats the same step,
or ends with `blocked: "..."`, is a finding — not a script failure. Screenshots
land in `%LOCALAPPDATA%\lesson-shots` (or `/tmp/lesson-shots`).

### Two traps this script already fell into

- **Do not sample immediately after answering.** The orchestrator takes ~2s; a
  2s wait made a working step look disabled.
- **Do not click by label alone.** The advance control's label is the *next*
  step's title, and the sidebar has wide buttons too — an early version clicked
  "Sign Out" and logged the learner out. Options are matched on content
  (`^\d{3}\s*,\s*\d{3}`) and constrained to the lesson column (`left > 330`).

### Credentials

Never commit them. Create a throwaway learner account and pass it via the
environment. Delete the account when you are done with it.
