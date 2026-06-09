# GRADE 2 MATHEMATICS — Existing vs Source Gap Report

## Existing App Content (from seed-curriculum/route.ts)

The app has a hardcoded curriculum structure for Grade 2 Mathematical Activities with:
- **3 Strands:** Numbers, Measurement, Geometry
- **14 Sub-strands**
- **49 Topics** (potential lesson titles)

### Existing Lessons in Database
From previous session context:
- "Comparing Numbers" lesson (ID: f9dd1dbb-250d-4591-af46-ad35e335d40c) — has 10-step journey in DB
- This was confirmed via browser testing in the previous stabilization session

### Note on Subject Naming
- App uses "Mathematical Activities" for Grade 2 (from `cbc-subjects.ts`)
- Standard CBC uses "Mathematical Activities" as the official subject name for lower primary
- This matches the seed data in `seed-curriculum/route.ts`

## Gap Analysis Buckets

### Bucket 1: Existing and Source-Aligned
| Lesson | Strand | Sub-strand | Status |
|--------|--------|------------|--------|
| Comparing Numbers | Numbers | Number Concept | Has 10-step journey, needs verification |

### Bucket 2: Existing but Incomplete or Uncertain
| Lesson | Strand | Sub-strand | Status |
|--------|--------|------------|--------|
| (Unknown — need DB audit) | — | — | Need to query live DB |

### Bucket 3: Missing from App (Proposed for CSV)
All 28 lesson shells in the generated CSV are NEW — they don't exist in the app yet.

| Strand | Sub-strand | Lessons Proposed |
|--------|------------|-----------------|
| Numbers | Number Concept | 3 (Counting Forwards, Backwards, Comparing) |
| Numbers | Place Value | 2 (Tens and Ones, Identifying Values) |
| Numbers | Reading and Writing | 2 (Writing Digits, Writing Words) |
| Numbers | Number Patterns | 1 (Completing Patterns) |
| Numbers | Addition | 2 (Adding up to 100, Addition with Carrying) |
| Numbers | Subtraction | 2 (Subtracting Within 100, Subtraction with Borrowing) |
| Numbers | Multiplication | 2 (Introduction, Facts up to 5x5) |
| Numbers | Fractions | 2 (Half, Quarter) |
| Measurement | Length | 2 (Non-Standard Units, Metres) |
| Measurement | Mass | 1 (Comparing Mass) |
| Measurement | Capacity | 2 (Smaller Containers, Comparing) |
| Measurement | Time | 3 (Hour, Half-Hour, Days of Week) |
| Measurement | Money | 2 (Kenyan Coins, Shopping) |
| Geometry | Shapes | 2 (Recognizing, Patterns) |

## Duplicate Risk Assessment

| Risk | Level | Details |
|------|-------|---------|
| Duplicate lessons | LOW | Only "Comparing Numbers" confirmed in DB; CSV uses specific topic titles from seed data |
| Near-duplicates | LOW | Each lesson title maps to a unique sub-strand + topic combination |
| Overlap with existing 10-step journey | LOW | "Comparing Numbers" already has content; CSV includes it as a shell — will need to skip or merge during import |

## Count Summary

| Metric | Count |
|--------|-------|
| Existing Grade 2 Math records (confirmed) | 1+ (exact count needs DB audit) |
| Source-aligned existing records | Unknown (needs verification) |
| Incomplete or uncertain records | Unknown (needs DB audit) |
| Missing shells (proposed) | 28 |
| Possible duplicates | 1 ("Comparing Numbers" — already has journey) |
| Rows excluded (already exist) | 1 (Comparing Numbers — marked as duplicate) |
| Rows proposed for upload | 27 (28 minus 1 duplicate) |

## Key Finding

The generated CSV intentionally includes "Comparing Numbers up to 100" which may overlap with the existing "Comparing Numbers" lesson that already has a 10-step journey. During import preview, this will be flagged as a duplicate and should be excluded from the final import.

## Next Steps

1. **Victor review**: Verify the 28 lesson shells are appropriate for Grade 2 Mathematical Activities
2. **Official source**: Provide official CBC/KICD document to replace SEED_DATA placeholders
3. **Admin preview upload**: Upload mathematics-import.csv through admin preview flow
4. **Final import**: Only after Victor's explicit approval
