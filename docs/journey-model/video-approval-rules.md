# Arizen School — Video Approval Rules

**Version:** 1.0.0
**Purpose:** Define strict rules for video selection, approval, and use.
**Principle:** Video supports the lesson. It never carries the lesson.

---

## Video Policy

### Core Rules

1. **Video is optional.** Every lesson must teach without video.
2. **Video must be human-approved.** No auto-selected YouTube videos.
3. **Video must be relevant to the exact lesson.** Not just the topic — the specific lesson.
4. **Video must be child-safe.** No ads, no inappropriate content, no comments visible.
5. **Video must be short.** Preferably under 5 minutes. Maximum 8 minutes.
6. **Video must be Grade 2 appropriate.** Not too advanced. Not too babyish.
7. **Video must work.** Not broken, not removed, not region-locked.
8. **Video must have a backup.** Every approved video needs a backup URL.
9. **Video must not be the only teaching source.** Text + visual backup required.
10. **Video must be marked as approved in the database.** `media.approved = true` AND `media.humanReviewed = true`.

---

## Where Video Is Allowed

| Step | Allowed? | Notes |
|------|----------|-------|
| 1. Welcome | ❌ No | Never |
| 2. Mission | ❌ No | Never |
| 3. Think First | ❌ No | Never |
| 4. Learn | ⚠️ Optional | Only if concept needs demonstration |
| 5. Real Life | ❌ No | Max 30 sec if used, but not recommended |
| 6. Example | ✅ Yes | **Best place for video** |
| 7. Practice | ❌ No | Never — child must act |
| 8. Quick Check | ❌ No | Never |
| 9. Reflect | ❌ No | Never |
| 10. Complete | ❌ No | Never |

**Only 2 steps may contain video:** Learn (optional) and Example (best place).

---

## Video Approval Checklist

Before a video is marked `approved = true`, a human must verify:

### Relevance
- [ ] Video teaches the exact lesson concept (not just the topic)
- [ ] Video matches the lesson's difficulty level
- [ ] Video uses appropriate examples (not too advanced)
- [ ] Video is not reused from an unrelated lesson

### Child Safety
- [ ] No inappropriate content
- [ ] No ads before/during video (or ad-blocked)
- [ ] No comments section visible
- [ ] No scary, violent, or disturbing content
- [ ] No commercial product promotion
- [ ] Suitable for 6-8 year olds

### Quality
- [ ] Video plays without errors
- [ ] Audio is clear and understandable
- [ ] Visual quality is adequate (not blurry)
- [ ] Presenter speaks clearly
- [ ] Content is accurate (no wrong math)

### Length
- [ ] Under 5 minutes (preferred)
- [ ] Under 8 minutes (maximum)
- [ ] Not too short (at least 1 minute)

### Source
- [ ] From a reputable educational channel
- [ ] Not random/unverified upload
- [ ] Channel has other quality content
- [ ] Not a competitor's branded content

### Backup
- [ ] Backup video URL provided
- [ ] Backup is also approved
- [ ] Text-based worked example exists as fallback

---

## Video Record Schema

```json
{
  "lessonId": "uuid",
  "lessonTitle": "Adding Two 2-Digit Numbers",
  "topic": "Addition",
  "stepType": "example",

  "videoUrl": "https://youtube.com/watch?v=...",
  "videoId": "abc123xyz",
  "title": "How to Add Two-Digit Numbers",
  "duration": "3:45",
  "sourceChannel": "Math Kids Kenya",
  "sourceUrl": "https://youtube.com/@mathkidskenya",

  "whyItFits": "Shows step-by-step addition with regrouping using base-ten blocks. Clear narration. Kenyan presenter.",

  "humanReviewed": true,
  "reviewedBy": "Victor",
  "reviewedAt": "2026-06-16",
  "approved": true,

  "backupUrl": "https://youtube.com/watch?v=...",
  "backupVideoId": "def456uvw",

  "notes": "Good video. Backup is slightly longer but also clear."
}
```

---

## Video Status Values

| Status | Meaning | Learner-Facing? |
|--------|---------|-----------------|
| `approved` | Human-reviewed and approved | ✅ Yes |
| `pending_review` | Awaiting human review | ❌ No |
| `rejected` | Reviewed and rejected | ❌ No |
| `unverified` | Auto-selected, not reviewed | ❌ No |
| `broken` | URL no longer works | ❌ No |
| `missing` | No video provided | ❌ No |

**Only `approved` videos are shown to learners.**

---

## Video Reuse Policy

### Within Same Topic
- ✅ **Allowed** with caution. A video about "adding with regrouping" can be used for multiple addition lessons IF it's genuinely relevant to each.
- Must be reviewed for each lesson it's used in.

### Across Different Topics
- ❌ **Not allowed.** A video about addition must NOT be used for fractions.
- Cross-strand reuse is a defect.

### Maximum Reuse
- A single video should not be used for more than 3-4 lessons.
- If reused more than 4 times, find additional videos.

---

## Video Replacement Workflow

1. Video is flagged (broken, irrelevant, or unreviewed)
2. Search for replacement using topic-specific criteria
3. Review replacement against approval checklist
4. Update `math-video-map.csv` with new URL
5. Update journey's `media.url` and `media.videoId`
6. Mark old video as `rejected`
7. Mark new video as `approved`

---

## Current State (From Audit)

- **121 Grade 2 Math lessons**
- **10 unique YouTube videos** currently in use
- **7 videos reused** across multiple lessons
- **3 videos reused across different strands** (critical issue)
- **0 videos human-approved** (all marked "needs human review")
- **0 lessons have backup video URLs**

**Action required:** Victor must review and approve/replace all videos before any Math lessons are published.
