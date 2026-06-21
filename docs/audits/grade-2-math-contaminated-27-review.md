# Grade 2 Math Contaminated 27 — Review

## Summary

**27 Mathematics lessons are PUBLISHED with English reading comprehension journeys.** All are in the `Numbers` (16) and `Geometry` (10) and `Measurement` (1) strands. Every lesson has the same contamination pattern: "today we will learn about reading comprehension together", "read a short passage", "good readers", "what did you learn about reading".

**Root cause**: `scripts/journey-engine-v3.js` line 626 defaults to `'reading comprehension'` when it can't detect English-specific keywords from the title or strand. Math lessons don't contain English keywords, so they all get reading comprehension templates.

## Contaminated Lessons

### Numbers Strand (16 lessons)

| # | Title | Sub-strand | LO summary | Status | Pub | Draft | Contamination |
|---|-------|-----------|------------|--------|-----|-------|---------------|
| 1 | Reading Numbers 1 to 50 in Symbols | 1.1 Number Concept | read numbers 1-100 in symbols | PUBLISHED | 10 | 10 | Both |
| 2 | Representing Numbers 51 to 100 Using Concrete Objects | 1.1 Number Concept | represent numbers 1-100 using objects | PUBLISHED | 10 | 10 | Both |
| 3 | Counting in 2s Forward up to 100 | 1.2 Whole Numbers | count forward and backward | PUBLISHED | 10 | 10 | Both |
| 4 | Counting in 5s Backward up to 100 | 1.2 Whole Numbers | read and write numbers | PUBLISHED | 10 | 10 | Both |
| 5 | Reading Numbers 1 to 100 in Symbols | 1.2 Whole Numbers | appreciate number patterns | PUBLISHED | 10 | 10 | Both |
| 6 | Introduction to Halves Using Circular Cut-outs | 1.3 Fractions | identify 1/2 as part of a whole | PUBLISHED | 10 | 10 | Both |
| 7 | Introduction to Quarters Using Circular Cut-outs | 1.3 Fractions | identify 1/4 as part of a whole | PUBLISHED | 10 | 10 | Both |
| 8 | Adding Single Digit Numbers Horizontally | 1.4 Addition | add 2-digit to 1-digit | PUBLISHED | 10 | 10 | Both |
| 9 | Adding 2-Digit and 1-Digit Numbers Without Regrouping | 1.4 Addition | add 2-digit to 1-digit without regrouping | PUBLISHED | 10 | 10 | Both |
| 10 | Addition Patterns up to 100 | 1.4 Addition | work out missing numbers in patterns | PUBLISHED | 10 | 10 | Both |
| 11 | Addition: Practice and Application | 1.4 Addition | work out missing numbers in patterns | PUBLISHED | 10 | 0 | Published only |
| 12 | Addition: Word Problems with 2-Digit Numbers | 1.4 Addition | work out missing numbers in patterns | PUBLISHED | 10 | 0 | Published only |
| 13 | Relationship Between Addition and Subtraction | 1.5 Subtraction | work out missing numbers in patterns | PUBLISHED | 10 | 10 | Both |
| 14 | Subtraction Patterns up to 100 | 1.5 Subtraction | work out missing numbers in patterns | PUBLISHED | 10 | 10 | Both |
| 15 | Introduction to Multiplication as Repeated Addition | 1.6 Multiplication | represent multiplication as repeated addition | PUBLISHED | 10 | 10 | Both |
| 16 | Multiplying by 1 and 2 | 1.6 Multiplication | multiply single digit numbers | PUBLISHED | 10 | 10 | Both |

### Measurement Strand (1 lesson)

| # | Title | Sub-strand | LO summary | Status | Pub | Draft | Contamination |
|---|-------|-----------|------------|--------|-----|-------|---------------|
| 17 | Measuring Length Using Fixed Units | 2.1 Length | measure length using fixed units | PUBLISHED | 10 | 10 | Both (generic) |

### Geometry Strand (10 lessons)

| # | Title | Sub-strand | LO summary | Status | Pub | Draft | Contamination |
|---|-------|-----------|------------|--------|-----|-------|---------------|
| 18 | Drawing Straight Lines | 3.1 Lines | draw straight lines | PUBLISHED | 10 | 10 | Both (generic) |
| 19 | Drawing Curved Lines | 3.1 Lines | draw curved lines | PUBLISHED | 10 | 10 | Both (generic) |
| 20 | Modelling Straight Lines | 3.1 Lines | model straight lines | PUBLISHED | 10 | 10 | Both (generic) |
| 21 | Modelling Curved Lines | 3.1 Lines | model curved lines | PUBLISHED | 10 | 10 | Both (generic) |
| 22 | Lines in the Environment: Practice and Assessment | 3.1 Lines | draw and model lines | PUBLISHED | 10 | 10 | Both (generic) |
| 23 | Identifying Rectangles, Circles, Triangles, Ovals and Squares | 3.2 Shapes | identify 5 shapes | PUBLISHED | 10 | 0 | Published only |
| 24 | Sorting and Grouping Five Shapes | 3.2 Shapes | sort and group by shape | PUBLISHED | 10 | 10 | Both (generic) |
| 25 | Lines That Make Different Shapes | 3.2 Shapes | discuss types of lines in shapes | PUBLISHED | 10 | 10 | Both (generic) |
| 26 | Making Patterns with Five Shapes | 3.2 Shapes | make patterns with shapes | PUBLISHED | 10 | 10 | Both (generic) |
| 27 | Shape Patterns: Practice and Assessment | 3.2 Shapes | identify shapes and make patterns | PUBLISHED | 10 | 10 | Both (generic) |

## Contamination Patterns

### Pattern A: English Reading Comprehension (Lessons 1-16, 13-16)
**Exact text**: "today we will learn about reading comprehension together", "read a short passage", "good readers", "words say", "what did you learn about reading"

**Source**: `journey-engine-v3.js` default fallback to 'reading comprehension'

### Pattern B: Generic Math with "exercise" flag (Lessons 17-27)
**Text**: "let us learn about [topic] together", "here is what you need to know", "take a moment to think", "are you ready"

**Source**: Likely a different generator or later fix attempt. Still generic but at least mentions the Math topic.

## Recommended Repair Approach

All 27 lessons need new Math-specific journeys. The repair should:
1. Use the lesson's actual learning outcome and strand/sub-strand
2. Include Math-specific vocabulary and concepts
3. Have proper worked examples and practice
4. Include valid Quick Check with correctIndex
5. Have appropriate visual/SVG support for visual topics (fractions, shapes, lines)

## Repair Priority

**CRITICAL (hide immediately)**: Lessons 1-16 — pure English reading comprehension in Math lessons

**HIGH (repair soon)**: Lessons 17-27 — generic content that doesn't teach the Math concept properly
