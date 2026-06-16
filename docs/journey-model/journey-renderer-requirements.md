# Arizen School — Journey Renderer Requirements

**Version:** 1.0.0
**Purpose:** Define how the app renders journeys — what the learner sees.
**Applies to:** Student lesson player, Admin preview.

---

## Renderer Architecture

### Two Rendering Modes

| Mode | User | Shows Drafts | Shows Unapproved Media | Allows Editing |
|------|------|-------------|----------------------|----------------|
| Learner View | Students | ❌ No | ❌ No | ❌ No |
| Admin Preview | Admins | ✅ Yes | ✅ With warnings | ✅ Yes |

---

## Learner View Requirements

### Journey Selection
```
IF lesson.isAvailable = true THEN
  render lesson.studentJourney (published)
ELSE
  show "This lesson is being prepared"
```

**Never show draft journeys to learners.**

### Step Rendering
1. Render steps in order (1-10)
2. Show one step at a time (slide-based)
3. Navigation: Previous / Next buttons
4. Progress indicator (step X of 10)
5. No step skipping (must complete in order, except Reflect)

### Media Rendering

#### SVG
```jsx
IF media.type = "svg" AND media.url != "" THEN
  <img src={media.url} alt={media.altText} />
ELSE IF media.fallbackType = "text" THEN
  <TextContent />
ELSE
  <DefaultOwlAvatar /> // or appropriate default
```

#### YouTube Video
```jsx
IF media.type = "youtube" AND media.approved = true AND media.url != "" THEN
  <YouTubeEmbed url={media.url} />
ELSE IF stepType = "example" THEN
  <WorkedExample /> // fallback
ELSE
  // No video, render text only
```

**Never show unapproved YouTube embeds to learners.**

#### Image
```jsx
IF media.type = "image" AND media.approved = true AND media.url != "" THEN
  <img src={media.url} alt={media.altText} />
ELSE
  <FallbackContent />
```

### Interaction Rendering

#### Multiple Choice (Quick Check)
```jsx
IF interaction.type = "multiple_choice" THEN
  <MCQ
    question={interaction.question}
    options={interaction.options}
    correctIndex={interaction.correctIndex}
    onAnswer={(selected) => {
      IF selected = correctIndex THEN
        show interaction.feedbackCorrect
        play success sound
      ELSE
        show interaction.feedbackIncorrect
        allow retry
      END
    }}
  />
```

#### Number Input (Practice/Quick Check)
```jsx
IF interaction.type = "number_input" THEN
  <NumberInput
    question={interaction.question}
    correctAnswer={interaction.correctAnswer}
    onSubmit={(answer) => {
      IF answer = correctAnswer THEN
        show feedbackCorrect
      ELSE
        show feedbackIncorrect
      END
    }}
  />
```

#### Text Response (Think First / Reflect)
```jsx
IF interaction.type = "text_response" THEN
  <TextInput
    prompt={interaction.question}
    maxLength={200}
    onSubmit={(text) => saveResponse(text)}
    optional={true}
  />
```

### Fallback Rendering

```
ON media.loadFailed:
  IF media.fallbackType = "text" THEN render text explanation
  IF media.fallbackType = "svg" THEN render simple generated SVG
  IF media.fallbackType = "worked_example" THEN render worked example
  IF media.fallbackType = "none" THEN render without media
  LOG error for admin review
```

**Never show:**
- Broken image icons
- "Video unavailable" messages
- "Illustration coming soon" text
- Error messages to learners
- Raw URLs

---

## Admin Preview Requirements

### Journey Selection
```
// Admin preview shows draft if published is empty
const journey = publishedJourney.length > 0 ? publishedJourney : draftJourney
IF journey.length = 0 THEN show "No journey steps yet"
```

### Draft Indicators
- Show "DRAFT" badge on each step
- Show "UNAPPROVED MEDIA" warning on unapproved videos
- Show "MISSING: [field]" warnings for empty required fields
- Show validation errors inline

### Media Warnings
```jsx
IF media.type = "youtube" AND media.approved = false THEN
  <WarningBanner>⚠️ UNAPPROVED VIDEO — Not visible to learners</WarningBanner>
  <YouTubeEmbed url={media.url} muted={true} />
```

### Edit Mode
- Allow inline editing of text fields
- Allow media replacement
- Allow interaction editing
- Save button (writes to `studentJourneyDraft`)
- "Publish" button (copies draft → published, sets isAvailable=true)

---

## Localization

### Language Support
- Default: English (`en`)
- Secondary: Kiswahili (`sw`)
- UI labels always localized
- Content text localized per journey

### Rendering
```jsx
const text = step.localization[language]?.owlText || step.owlText
const studentText = step.localization[language]?.studentText || step.studentText
```

---

## Accessibility

### Requirements
1. All images must have `altText`
2. All videos must have captions or transcripts (future)
3. All interactions must be keyboard-navigable
4. Color contrast must meet WCAG AA
5. Font size minimum 16px for body text
6. Touch targets minimum 44x44px

### ARIA Labels
```jsx
<div aria-label={step.accessibility.ariaLabel}>
  <img alt={step.accessibility.altText} />
</div>
```

---

## Performance

### Loading
- Load current step immediately
- Preload next step in background
- Lazy-load media (images, videos)
- Cache SVGs locally after first load

### Rendering Budget
- Step transition: < 300ms
- Media load: < 2 seconds (show spinner)
- Interaction response: < 100ms
- Fallback render: immediate

---

## Error Handling

### Media Load Failure
1. Hide media element
2. Show fallback content
3. Log error to admin dashboard
4. Do NOT show error to learner

### Invalid Interaction
1. In admin preview: show validation error, block save
2. In learner view: show friendly "Try again" message
3. Log error

### Empty Step
1. In admin preview: show "Step is empty" warning
2. In learner view: skip step (should never happen)
3. Log critical error

### Network Failure
1. Cache journeys locally after first load
2. Show cached version if network fails
3. Show "Working offline" indicator
