# CURRICULUM SOURCE AUDIT — Grade 2 Mathematics

## Source Document Status

| Item | Status |
|------|--------|
| Official CBC/KICD source document | **NOT FOUND in repo** |
| Source document name | — |
| Appears official | — |
| Complete or partial | — |
| Grade covered | Grade 2 |
| Subject covered | Mathematics |
| Pages/sections available | — |
| Enough to generate lesson shells | **NO — source missing** |

## What Was Searched

- `./docs/` directory: No curriculum source files found
- `./src/data/`: Found `grade2-environmental.ts` (Environmental Activities, NOT Mathematics)
- `./src/data/`: Found `grade5-all.ts` (Grade 5, NOT Grade 2)
- `./src/lib/curriculum/`: Found `cbc-template.ts` (import helpers, NOT source data)
- `./src/app/api/admin/seed-curriculum/route.ts`: Contains hardcoded curriculum structure (see below)
- No PDF, CSV, XLSX, DOCX files found in repo (excluding node_modules)

## Existing App Content (Seed Data)

The file `src/app/api/admin/seed-curriculum/route.ts` contains hardcoded Grade 2 Mathematics curriculum structure (lines 22-37):

**Strands found in seed data:**
1. **Numbers** — sub-strands: Number Concept, Place Value, Reading and Writing, Number Patterns, Addition, Subtraction, Multiplication, Fractions
2. **Measurement** — sub-strands: Length, Mass, Capacity, Time, Money
3. **Geometry** — sub-strands: Shapes

**Topics found in seed data (49 total):**
- Number Concept: Counting Numbers up to 100 Forwards, Counting Numbers up to 100 Backwards, Identifying Numbers up to 100
- Place Value: Hundreds, Tens, Ones, Identifying Values of Digits up to 100
- Reading and Writing: Writing Numbers in Digits up to 100, Writing Numbers in Words up to 100
- Number Patterns: Identifying Addition Patterns, Identifying Subtraction Patterns, Completing Number Patterns
- Addition: Adding Numbers up to a Sum of 100, Addition with Carrying
- Subtraction: Subtracting Numbers Within 100, Subtraction with Borrowing
- Multiplication: Introduction to Multiplication, Multiplication Facts up to 5 × 5
- Fractions: Identifying a Half, Shading a Half, Identifying a Quarter, Shading a Quarter
- Length: Measuring Length Using Non-Standard Units, Measuring Length Using Hand Spans, Measuring Length Using Metres
- Mass: Comparing Heavier Than, Comparing Lighter Than, Comparing Same As
- Capacity: Measuring Liquid Using Smaller Containers, Comparing How Much Liquid Containers Hold
- Time: Reading Time by the Hour, Reading Time by the Half-Hour, Using Analogue Clocks, Using Digital Clocks, Identifying Days of the Week
- Money: Recognizing Kenyan Coins up to Ksh 100, Recognizing Kenyan Notes up to Ksh 100, Simple Shopping Simulations
- Shapes: Recognizing Rectangles, Recognizing Squares, Recognizing Circles, Recognizing Triangles, Drawing Basic Shapes, Making Patterns with Shapes

## Key Finding

**The official CBC/KICD curriculum document for Grade 2 Mathematics is NOT in the repo.**

The seed data in `seed-curriculum/route.ts` provides a curriculum structure but:
1. It does NOT cite an official source document
2. It does NOT include specific learning outcomes (only topic titles)
3. It does NOT include key inquiry questions, suggested learning experiences, assessment methods, core competencies, values, or PCIs
4. It is NOT in CSV format for the admin import flow
5. It has already been partially imported (the "Comparing Numbers" lesson exists in the DB with a 10-step journey)

## What Is Needed From Victor

To proceed with Grade 2 Mathematics lesson shell creation, ONE of the following is required:

1. **Official CBC/KICD Grade 2 Mathematics curriculum document** (PDF, DOCX, or scanned pages)
2. **Confirmation that the seed data in `seed-curriculum/route.ts` is source-aligned** and can be used as the basis for lesson shell generation
3. **A different approved source document** that maps Grade 2 Mathematics strands, sub-strands, and learning outcomes

## Risk Assessment

| Risk | Level | Notes |
|------|-------|-------|
| Inventing curriculum | **HIGH** | Cannot generate shells without official source |
| Misalignment with CBC | **HIGH** | Seed data lacks source citations |
| Duplicate lessons | **MEDIUM** | Existing lessons in DB need to be audited first |
| Incomplete shells | **MEDIUM** | Missing pedagogical fields without source |

## Recommendation

**Do not proceed with CSV generation until Victor provides or confirms the source document.** The existing seed data can serve as a structural reference but cannot populate required CSV fields (specific_learning_outcome, key_inquiry_question, suggested_learning_experience, assessment_method, core_competencies, values) without risking invented content.
