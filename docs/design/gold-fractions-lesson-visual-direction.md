# Gold Fractions Lesson — Visual Direction

## 1. Visual Goal

Target: next-generation children's learning product, not a worksheet app.

The Gold Fractions lesson must feel:
- Warm and inviting (Kenyan classroom context, Amina's story)
- Visually rich (illustration areas + clean math diagrams in every step)
- Playful but structured (gamified rewards, clear progression)
- Mathematically precise (no wobbly circles, no ambiguous halves)
- Celebratory when completing milestones (badge reveal, confetti)

The lesson should look like it was designed by a team, not assembled by an engineer.

## 2. Target Learner Experience

Grade 2 Kenyan student (age 7-8), likely using on a tablet or laptop.

Flow:
1. Child opens the lesson and sees a welcoming scene with Amina and a chapati
2. Learner progresses through 10 visually distinct steps
3. Each step has a clear interactive goal (tap, shade, choose, reflect)
4. Math concepts are introduced visually before text explanation
5. Success moments are celebrated with confetti and sound cues
6. Lesson ends with a badge reward and XP gain

Emotional arc: curiosity → challenge → confusion → clarity → pride

## 3. Visual Style Direction

- **Flat design with soft depth**: subtle shadows, rounded corners, layered cards
- **Kenyan-inspired color palette**: warm oranges, earthy browns, vibrant greens, sky blues
- **Rounded, friendly typography**: sans-serif with generous spacing
- **Illustration areas**: gradient backgrounds with abstract shapes, not blank white boxes
- **Math visuals**: SVG-based, crisp at any size, consistent stroke widths
- **Interactive feedback**: animated scale, color pulse, confetti bursts
- **No cartoon characters in UI chrome**: only Amina's story illustrations are cartoon-style

## 4. Color Direction

### Primary palette
- **Background**: `#FFF8F0` (warm cream, not cold white)
- **Primary accent**: `#FF6B35` (warm orange, chapati-inspired)
- **Secondary accent**: `#004E89` (deep blue, for contrast)
- **Success**: `#2ECC71` (bright green, not mint)
- **Error**: `#E74C3C` (soft red, not alarming)

### Gradient directions
- Warm gradient: `#FF6B35` → `#FFB347` (orange to gold)
- Cool gradient: `#004E89` → `4FC3F7` (deep blue to sky)
- Success gradient: `#2ECC71` → `#A8E6CF` (green to mint)

### Semantic colors
- **Math diagram fill**: `#FFE5D9` (light chapati)
- **Math diagram stroke**: `#D4A574` (warm brown)
- **Shaded region**: `#FF6B35` (primary orange)
- **Unshaded region**: `#FFF8F0` (background cream)

## 5. Typography Direction

- **Headings**: `Inter` or `Poppins`, bold (700), generous letter-spacing
- **Body text**: `Inter` or `Poppins`, regular (400), 16px minimum
- **Math labels**: `Inter` bold, uppercase for fractions ("½"), 14px
- **Button text**: Uppercase, bold, generous padding
- **Line height**: 1.5 for body, 1.2 for headings

Font sizes:
- Step title: 28px (mobile), 32px (desktop)
- Subtitle: 18px
- Body: 16px
- Caption: 14px
- Button: 16px, uppercase

## 6. Lesson Shell Layout Rules

### Overall structure
- **Top bar**: progress indicator (step X of 10), lesson title, close button
- **Main content**: centered card (max-width 800px), vertically scrollable
- **Bottom bar**: navigation (Previous, Next), reward indicator

### Card design
- **Border radius**: 16px (large, friendly)
- **Shadow**: `0 4px 20px rgba(0, 0, 0, 0.08)` (soft, not harsh)
- **Padding**: 32px (generous breathing room)
- **Background**: white with subtle gradient overlay for warmth

### Spacing
- Step title → content: 24px
- Content → illustration: 32px
- Illustration → interaction: 32px
- Interaction → button: 32px
- Between cards: 24px

## 7. Illustration Rules

### Story illustration areas
- **Aspect ratio**: 16:9 or 4:3 (landscape for storytelling)
- **Background**: warm gradient (cream to light orange)
- **Foreground**: abstract shapes or simple icons representing Amina/chapati
- **Placeholder style**: if no real image, show a gradient card with "Illustration: Amina holding a chapati" text overlay, not a broken-image icon

### What to avoid
- **No blank white boxes** with "Image coming soon"
- **No broken image icons** or 404 placeholders
- **No emoji-based illustrations** (no 🦉 or 🎯 in the story layer)
- **No low-quality stock photos** that don't match the Kenyan context

### Acceptable placeholders
- Gradient cards with descriptive text: "Amina shares her chapati with a friend"
- Simple SVG illustrations: circle with "chapati" label, stick figure with smile
- Abstract shapes: warm circles, soft triangles, organic blobs

## 8. Math Visual Rules

### Fraction circles
- **Stroke width**: 3px (visible but not heavy)
- **Fill color**: `#FFE5D9` (light chapati)
- **Shaded color**: `#FF6B35` (primary orange)
- **Border radius**: 50% (perfect circle)
- **Size**: 200px minimum diameter (large enough to see clearly)

### Fraction lines
- **Stroke width**: 3px
- **Color**: `#D4A574` (warm brown)
- **Style**: solid line, not dashed

### Labels
- **Position**: centered below the circle
- **Font**: bold, 16px
- **Format**: "1/2" or "½" (use proper fraction character if possible)

### What to avoid
- **No wobbly circles**: use SVG with perfect geometry
- **No ambiguous halves**: if shaded, make it clear which half is shaded
- **No tiny math visuals**: if it's a teaching moment, make it big
- **No cluttered diagrams**: one concept per visual

## 9. Interaction Rules

### Button design
- **Primary button**: orange gradient background, white text, uppercase, bold
- **Hover state**: scale up 5%, brighten gradient
- **Click state**: scale down 2%, darker gradient
- **Disabled state**: gray background, light gray text, no hover effect
- **Size**: minimum 120px wide, 48px tall (generous tap target)

### Choice cards (A/B/C)
- **Layout**: horizontal row on desktop, vertical stack on mobile
- **Card size**: 120px x 120px minimum
- **Border**: 2px solid `#E0E0E0`, rounded corners 12px
- **Selected state**: 3px solid `#FF6B35`, light orange fill
- **Correct state**: green border, confetti burst
- **Incorrect state**: red border, shake animation

### Tap regions (for "tap one half")
- **Visual feedback**: when tapping a region, highlight it with a pulsing glow
- **Success feedback**: confetti burst, green checkmark overlay
- **Error feedback**: gentle shake, red outline, retry prompt

### Animation timing
- **Hover transitions**: 150ms ease-out
- **Click feedback**: 100ms ease-in
- **Confetti burst**: 800ms ease-out
- **Page transitions**: 300ms fade-in

## 10. Animation and Celebration Rules

### Step transitions
- **Fade-in**: new step content fades in over 300ms
- **Slide-up**: content slides up 20px as it fades in
- **No harsh cuts**: always animate between steps

### Success celebrations
- **Confetti burst**: 50 particles, orange and gold colors, 800ms duration
- **Scale pulse**: correct answer card scales up 10% then back to 100%
- **Sound cue**: optional "ding" sound (if audio enabled)

### Badge reveal (lesson complete)
- **Badge card**: slides in from top, scales up from 80% to 100%
- **XP gain**: counter animates from 0 to 50 over 500ms
- **Confetti**: 100 particles, full celebration
- **Text**: "Congratulations! You earned the Fractions Explorer badge!"

### What to avoid
- **No jarring animations**: nothing bounces too much or too fast
- **No infinite loops**: animations should complete and stop
- **No animation overload**: one celebration per success moment, not five

## 11. What the Current UI Must Stop Doing

### Stop immediately
- **Duplicated title/owl rendering**: one title per step, not two
- **Emoji-based icons**: no 🦉 or 🎯 in the UI chrome
- **Broken image placeholders**: no "Image coming soon" or 404 icons
- **Cramped math visuals**: no tiny circles with 10px diameter
- **Duplicate A/B/C labels**: if the card shows "A", don't show "A" again below it
- **Generic plain circles**: if the story says chapati, show a chapati-colored circle
- **Admin-dashboard feel**: no gray backgrounds, no table-like layouts
- **Dead empty spaces**: no large gaps with nothing in them

### Stop in the next iteration
- **Text-heavy steps**: minimize reading, maximize visual learning
- **Unclear interactive prompts**: make it obvious what to tap or do
- **Weak celebrations**: make success moments feel rewarding
- **Inconsistent spacing**: use the spacing rules above

## 12. Screenshot Acceptance Checklist

Before approving the visual target, verify:

- [ ] Step 1 has a warm illustration area showing "Amina with chapati" concept
- [ ] Step 2 mission card shows empty bullets (no pre-completed checkmarks)
- [ ] Step 3 choice cards are large, readable, no duplicate A/B/C labels
- [ ] Step 4 teaching panel shows clear 3-step process (whole → split → half)
- [ ] Step 5 has only one learning diagram, no duplicates, labeled "1/2"
- [ ] Step 7 practice feels interactive (crayon/brush visual, not multiple choice)
- [ ] Step 10 celebration feels rewarding (badge, confetti, XP counter)
- [ ] Math visuals are crisp SVG circles, not wobbly
- [ ] Colors match the warm orange/cream palette
- [ ] Typography is generous and readable
- [ ] Buttons are large and tap-friendly
- [ ] Illustration areas are gradient cards with context, not blank boxes
- [ ] No duplicated text or titles
- [ ] No emoji in the UI chrome (only in story illustrations if appropriate)
- [ ] Progress indicator shows clear step progression
- [ ] Overall feel is warm, child-friendly, not admin-dashboard

If any checklist item fails, the visual target is not ready for implementation.
