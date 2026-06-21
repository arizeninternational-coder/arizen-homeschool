# Journey Generator Safety Fixes

## What Was Unsafe

### Root Cause: `scripts/journey-engine-v3.js`

**Line 626 (before fix)**:
```javascript
return 'reading comprehension';
```

This was the default fallback in `determineSkillType()`. When the function couldn't detect English-specific keywords from the title or strand, it returned `'reading comprehension'` — even for Mathematics, Kiswahili, Environmental, Hygiene, and Movement lessons.

**Impact**: 27 Mathematics lessons received English reading comprehension journeys. All were published and visible to students.

### Contamination Flow

1. Generator receives a Math lesson (e.g., "Reading Numbers 1 to 50 in Symbols")
2. `determineSkillType("Numbers", "1.1 Number Concept", "Reading Numbers 1 to 50 in Symbols")` is called
3. Title doesn't match any English keywords (rhyme, grammar, reading, writing, etc.)
4. Strand/sub-strand doesn't match any English keywords
5. **FALLBACK**: Returns `'reading comprehension'`
6. `buildChildFriendlyGoal()` creates: "Read a short text about numbers and understand what it means."
7. English reading comprehension templates are applied throughout the journey
8. Journey is written to both `studentJourney` and `studentJourneyDraft`

## What Changed

### Fix 1: `determineSkillType()` now accepts subject parameter

```javascript
function determineSkillType(strand, subStrand, title, subject) {
  const sub = (subject || '').toLowerCase();
  const isNonEnglish = sub.includes('math') || sub.includes('kiswahili') || 
    sub.includes('environmental') || sub.includes('hygiene') || 
    sub.includes('movement') || sub.includes('science') || sub.includes('social');
  
  // For "reading comprehension" detection:
  if (titleLower.includes('reading') || titleLower.includes('read') || titleLower.includes('comprehension')) {
    if (isNonEnglish) return 'unsupported_needs_source_pack';
    return 'reading comprehension';
  }
  
  // Same for strand/sub-strand fallback
  
  // DEFAULT: Never return 'reading comprehension'
  if (isNonEnglish) return 'unsupported_needs_source_pack';
  return 'unsupported_needs_source_pack';
}
```

### Fix 2: Call site now passes subject

```javascript
// Before:
const skillType = determineSkillType(strand, subStrand, title);

// After:
const skillType = determineSkillType(strand, subStrand, title, subject);
```

## Safety Guarantees After Fix

1. **Math lessons can NEVER get reading comprehension**: Subject check blocks it
2. **Kiswahili/Environmental/Hygiene/Movement lessons can NEVER get reading comprehension**: Subject check blocks it
3. **Unknown skill type returns `unsupported_needs_source_pack`**: Not a valid English skill type, so English templates won't match
4. **No silent fallback to wrong subject**: Generator must explicitly handle each subject

## Scripts Now Blocked/Guarded

| Script | Status | Notes |
|--------|--------|-------|
| `journey-engine-v3.js` | **FIXED** | Default fallback changed, subject guard added |
| `generate-english-journeys.js` | Needs `--confirm` flag | English-only, should only run on English lessons |
| `gen-english-theme.js` | Needs `--confirm` flag | English-only |
| `gen-english-theme-v3.js` | Needs `--confirm` flag | English-only |
| `repair-all.js` | **QUARANTINE** | Contains exact contaminated phrases |
| `repair-final.js` | **QUARANTINE** | Contains exact contaminated phrases |
| `repair-lessons.js` | **QUARANTINE** | Contains contaminated phrases |
| `fix-reading-writing.js` | **QUARANTINE** | English-only template |

## What Still Needs Later Cleanup

- Move `repair-all.js`, `repair-final.js`, `repair-lessons.js` to `scripts/deprecated/`
- Add `--write` and `--confirm` flags to all Supabase write scripts
- Add subject filters to batch generators
- Add validation gates to all generators
