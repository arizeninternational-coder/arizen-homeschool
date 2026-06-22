# GRADE 2 DIAGNOSIS — FINAL

## 1. ENGLISH DUPLICATION
- **English (subject=English)**: 90 lessons, titles like "Accidents: Reading Short Texts", "Time and Months of The Year: The verb to be: was and were"
- **English Language Activities**: 48 lessons, titles like "Responding to Questions", "Listening with Attention"
- These are DIFFERENT curricula — English has theme-based titles, ELA has skill-based titles
- Both have `specificLearningOutcome` empty for most lessons
- **Recommendation**: Keep both but rename for clarity. English → "English Literacy", ELA → "English Language Skills"

## 2. OTHER/UNKNOWN LESSONS (6 records)
- 5 are seed/test lessons with IDs like `e0000001` — no curriculum data
- 1 is "Adding 2-Digit and 1-Digit Numbers With Regrouping" with no strand/subject
- **Recommendation**: Unpublish or delete these

## 3. PUBLISHED MATH WITHOUT JOURNEYS (46 records)
- All have `status: PUBLISHED` but no `studentJourneyDraft`
- All have curriculum data (learningOutcome, keyInquiryQuestion, etc.)
- **Recommendation**: Generate journeys for these

## 4. "RECORD YOUR MEASUREMENTS" SOURCE
- NOT in journey JSON (0 records contain this phrase)
- **Source**: Lesson player renderer (`page.tsx` line 443 and `LessonJourneyViewer.tsx` line 426)
- Hardcoded fallback for practice steps — shows measurement UI for ALL subjects
- **Fix**: Replace with dynamic practice content from journey data, or hide if not interactive

## 5. RENDERER HARDCODED ENGLISH LABELS
Found in `page.tsx` and `LessonJourneyViewer.tsx`:
- "Start Mission" (welcome step)
- "I'm Ready" (mission step)
- "Save My Guess" (think_first step)
- "Record your measurements" (practice step)
- "Write down 3 things that can be measured in metres:" (practice step)
- "Quick Check" (quick_check step)
- "Check Answer" (quick_check button)
- "Reflection Time" (reflect step)
- "What did you learn today?" (reflect fallback)
- "Continue to Finish" (reflect button)
- "You did it!" (complete step)
- "Back to Quest" (back button)
- "Begin 10-Step Journey" (start button)

**All of these need to be localized for Kiswahili lessons.**

## 6. FIX ORDER PROPOSED

### Phase A: Data Integrity (DO FIRST)
1. Unpublish/delete 6 Other/Unknown lessons
2. Generate journeys for 46 published Math lessons without journeys
3. Rename English subjects for clarity

### Phase B: Renderer Fixes
1. Replace hardcoded "Record your measurements" with dynamic practice content
2. Create localization map for all hardcoded English labels
3. Add Kiswahili translations for all learner-facing labels

### Phase C: New Journey Architecture
1. Blueprint layer (childFriendlyTitle + curriculum-driven content)
2. Shared journey engine
3. Subject-specific adapters
4. Validation layer

### Phase D: Proof of Concept
1. 1 Kiswahili journey
1. 1 Movement/Hygiene journey
3. Browser test

### Phase E: Subject Regeneration
1. Regenerate one full subject (REVIEW status only)
2. Quality check
3. Only then approve for PUBLISH
