# Grade 2 Mathematics — Human Input Needed

**Purpose:** This file tells Victor exactly what needs to be provided/approved before the source pack is complete and journey generation can begin.
**Every item marked TODO must be filled before the generator can produce quality journeys.**

---

## Critical Input Needed (Blocks All Generation)

### 1. Fractions
- [ ] Approved examples for halves (1/2)
- [ ] Approved examples for quarters (1/4)
- [ ] Real-life objects to reference (chapati, cake, pizza, paper)
- [ ] Confirmation: NO fraction arithmetic in Grade 2
- [ ] Confirmation: ONLY 1/2 and 1/4 (no 1/3, 1/8, etc.)
- [ ] Quick Check question templates for fractions
- [ ] Distractor rules (what wrong answers to include)

### 2. Subtraction
- [ ] Confirmation: NO negative answers — ever
- [ ] Approved method: decomposition vs. number line vs. both
- [ ] Approved borrowing/regrouping visual
- [ ] Common mistakes to address
- [ ] Quick Check templates for subtraction
- [ ] Distractor rules

### 3. Multiplication
- [ ] Confirmed max factor (5? 10?)
- [ ] Approved equal-groups examples (mangoes, counters, arrays)
- [ ] Confirmation: repeated addition connection required
- [ ] Confirmation: × sign introduction is in scope
- [ ] Quick Check templates for multiplication
- [ ] Distractor rules (e.g., adding instead of multiplying)

### 4. Measurement
- [ ] Confirmed units: metres, litres, kilograms (any others?)
- [ ] Non-standard units to reference (hand spans, footsteps, bottle caps)
- [ ] Classroom objects for measurement examples
- [ ] Quick Check templates for measurement

### 5. Time
- [ ] Confirmed scope: o'clock only? o'clock + half past? quarter past?
- [ ] Clock-reading method to teach
- [ ] Quick Check templates for time

### 6. Money
- [ ] Confirmed coin denominations (current Kenyan shillings)
- [ ] Confirmed note denominations
- [ ] Simple purchase scenarios to use
- [ ] Quick Check templates for money

### 7. Videos (ALL 121 lessons)
- [ ] Review all 8 unique YouTube video URLs
- [ ] Approve or replace each video
- [ ] Provide backup URLs
- [ ] Confirm child-safety of each video
- [ ] Provide new videos for lessons that need them

---

## Important Input Needed (Blocks Quality)

### 8. Number Patterns & Counting
- [ ] Confirmed upper limit (100? 1000?)
- [ ] Skip counting rules (2s, 5s, 10s — any others?)
- [ ] Approved number line visuals
- [ ] Quick Check templates

### 9. Addition
- [ ] Confirmed max (3-digit + 3-digit?)
- [ ] Regrouping method to teach
- [ ] Number line addition method
- [ ] Word problem templates
- [ ] Quick Check templates

### 10. Place Value
- [ ] Confirmed scope: ones, tens, hundreds?
- [ ] Base-ten block diagrams to use
- [ ] Common errors to address (6 vs 60)
- [ ] Quick Check templates

### 11. Geometry & Patterns
- [ ] Confirmed shapes: rectangle, circle, triangle, oval, square (any others?)
- [ ] Sorting attributes to teach
- [ ] Pattern types to include
- [ ] Quick Check templates

### 12. Word Problems
- [ ] Confirmed: single-step only? or two-step allowed?
- [ ] Kenyan context scenarios to use
- [ ] Step-by-step solving method
- [ ] Quick Check templates

### 13. Number Concept
- [ ] Confirmed number range (1-1000?)
- [ ] Concrete objects to reference
- [ ] Quick Check templates

### 14. Reading & Writing Numbers
- [ ] Confirmed range (1-100 in words and symbols?)
- [ ] Number-word mapping table
- [ ] Quick Check templates

### 15. Data Handling
- [ ] Confirmed scope: pictographs? tally marks? simple tables?
- [ ] Quick Check templates

---

## Per-Lesson Input Needed

### Child-Friendly Goals (121 lessons)
Each lesson needs a child-friendly goal written in simple English.
Example: "Today you will learn to add two-digit numbers without carrying."
**Status:** TODO for all 121 lessons

### Vocabulary (121 lessons)
Each lesson needs a list of key vocabulary words with child-friendly definitions.
**Status:** TODO for all 121 lessons

### Quick Check Templates (13 topics)
Each topic needs 2-3 approved Quick Check question templates with:
- Question format
- Correct answer rule
- Distractor rules
- Feedback text
**Status:** TODO for all 13 topics

---

## Source Conflicts to Resolve

### DB vs CSV
- DB has 121 lessons; CSV has 156 rows
- Some CSV lessons may not be imported to DB
- Some DB lessons may have different titles than CSV
- **Action needed:** Victor to confirm which is authoritative

### Strand Naming
- DB uses KICD strand names: "Numbers", "Measurement", "Geometry"
- Generator uses topic names: "Addition", "Subtraction", "Fractions"
- **Action needed:** Victor to confirm topic-to-strand mapping

---

## Recommended Order for Filling

1. **Fractions** — most critical (6 lessons, high defect count)
2. **Subtraction** — critical (16 lessons, answer leak risk)
3. **Multiplication** — critical (10 lessons, wrong answers)
4. **Videos** — all 121 lessons (blocks everything)
5. **Time** — scope confirmation needed
6. **Money** — denomination confirmation needed
7. **Measurement** — unit confirmation needed
8. **Addition** — method confirmation
9. **Number Patterns** — range confirmation
10. **Remaining topics** — QC templates, examples, practice

---

## What Happens After Victor Fills This

1. Source pack is updated with approved content
2. Generator is updated to read from source pack
3. Recovery batch (37 lessons) regenerated from source pack
4. All journeys validated against `math-validation-rules.md`
5. Victor reviews and approves
6. Old v2 journeys (81 lessons) regenerated from source pack
7. All 121 lessons published
