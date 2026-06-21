# Grade 2 Math Contaminated Journey Repair Plan

## Scope

Repair 27 PUBLISHED Mathematics lessons that contain English reading comprehension content instead of Mathematics teaching.

## Grouping by Math Topic

### Group 1: Numbers — Reading & Representing Numbers (5 lessons)
- Reading Numbers 1 to 50 in Symbols
- Representing Numbers 51 to 100 Using Concrete Objects
- Reading Numbers 1 to 100 in Symbols
- Counting in 2s Forward up to 100
- Counting in 5s Backward up to 100

**Source pack needed**: KICD Grade 2 Mathematics, Strand 1 (Numbers), Sub-strand 1.1-1.2
**Contamination**: English reading comprehension (Pattern A)
**Repair approach**: Number recognition, counting, place value with visual number lines and counters
**Visual/SVG**: Number lines, place value charts, counting objects
**Video**: Optional — counting songs, number recognition
**Risk**: Low — foundational topic, well-defined content

### Group 2: Numbers — Fractions (2 lessons)
- Introduction to Halves Using Circular Cut-outs
- Introduction to Quarters Using Circular Cut-outs

**Source pack needed**: KICD Grade 2 Mathematics, Strand 1, Sub-strand 1.3
**Contamination**: English reading comprehension (Pattern A)
**Repair approach**: Visual fraction teaching with cut-outs, folding, sharing
**Visual/SVG**: REQUIRED — fraction circles, folding diagrams, real-world examples
**Video**: Optional
**Risk**: Medium — requires accurate visual representation

### Group 3: Numbers — Addition (5 lessons)
- Adding Single Digit Numbers Horizontally
- Adding 2-Digit and 1-Digit Numbers Without Regrouping
- Addition Patterns up to 100
- Addition: Practice and Application
- Addition: Word Problems with 2-Digit Numbers

**Source pack needed**: KICD Grade 2 Mathematics, Strand 1, Sub-strand 1.4
**Contamination**: English reading comprehension (Pattern A) for first 3; generic for last 2
**Repair approach**: Addition strategies, number bonds, word problems with Math context
**Visual/SVG**: Number lines, addition towers, word problem illustrations
**Video**: Optional
**Risk**: Low — well-defined procedures

### Group 4: Numbers — Subtraction & Relationships (2 lessons)
- Relationship Between Addition and Subtraction
- Subtraction Patterns up to 100

**Source pack needed**: KICD Grade 2 Mathematics, Strand 1, Sub-strand 1.5
**Contamination**: English reading comprehension (Pattern A)
**Repair approach**: Inverse operations, fact families, subtraction strategies
**Visual/SVG**: Fact family triangles, number lines
**Video**: Optional
**Risk**: Low

### Group 5: Numbers — Multiplication (2 lessons)
- Introduction to Multiplication as Repeated Addition
- Multiplying by 1 and 2

**Source pack needed**: KICD Grade 2 Mathematics, Strand 1, Sub-strand 1.6
**Contamination**: English reading comprehension (Pattern A)
**Repair approach**: Repeated addition, equal groups, arrays
**Visual/SVG**: REQUIRED — arrays, equal groups, multiplication tables
**Video**: Optional
**Risk**: Medium — requires clear visual representation of groups

### Group 6: Measurement — Length (1 lesson)
- Measuring Length Using Fixed Units

**Source pack needed**: KICD Grade 2 Mathematics, Strand 2, Sub-strand 2.1
**Contamination**: Generic content (Pattern B) — mentions topic but doesn't teach properly
**Repair approach**: Measuring with rulers, fixed units, estimation
**Visual/SVG**: REQUIRED — rulers, measurement examples
**Video**: Optional
**Risk**: Medium — requires accurate measurement visuals

### Group 7: Geometry — Lines (5 lessons)
- Drawing Straight Lines
- Drawing Curved Lines
- Modelling Straight Lines
- Modelling Curved Lines
- Lines in the Environment: Practice and Assessment

**Source pack needed**: KICD Grade 2 Mathematics, Strand 3, Sub-strand 3.1
**Contamination**: Generic content (Pattern B)
**Repair approach**: Line types, drawing techniques, lines in shapes
**Visual/SVG**: REQUIRED — line types, drawing examples
**Video**: Optional
**Risk**: Low — visual topic, well-defined

### Group 8: Geometry — Shapes (5 lessons)
- Identifying Rectangles, Circles, Triangles, Ovals and Squares
- Sorting and Grouping Five Shapes
- Lines That Make Different Shapes
- Making Patterns with Five Shapes
- Shape Patterns: Practice and Assessment

**Source pack needed**: KICD Grade 2 Mathematics, Strand 3, Sub-strand 3.2
**Contamination**: Generic content (Pattern B)
**Repair approach**: Shape properties, sorting, patterns
**Visual/SVG**: REQUIRED — shape diagrams, pattern examples
**Video**: Optional
**Risk**: Low — visual topic, well-defined

## Repair Rules

1. **Generate locally first** — output JSON files, not DB writes
2. **Validate before writing** — run validator on every generated journey
3. **Write to `studentJourneyDraft` ONLY** — never directly to `studentJourney`
4. **Never set status automatically** — status changes require explicit approval
5. **Always backup before DB writes** — create backup script
6. **Browser-test samples** — verify in admin preview before scaling
7. **Source pack is source of truth** — use KICD curriculum data, not title guessing
