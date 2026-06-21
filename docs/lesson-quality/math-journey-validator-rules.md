# Math Journey Validator Rules

## Automatic Fail Conditions

A Math journey **MUST FAIL** validation if ANY of the following are true:

### Subject Contamination (Critical)
- Contains "reading comprehension"
- Contains "read a short passage"
- Contains "main idea of the story"
- Contains "good readers"
- Contains "letter sound", "syllable", "phonics"
- Contains "grammar", "noun", "verb", "article", "preposition"
- Contains "vocabulary and pronunciation"
- Contains "what did you learn about reading"
- Contains "what did you learn about writing"
- Contains "spelling words", "handwriting practice"
- Contains "listen and repeat", "say the sounds", "blend the sounds"
- Contains "healthy habits", "wash your hands", "brush your teeth"
- Contains "living things", "non-living things" (unless Environmental lesson)
- Contains "weather", "season", "water cycle"
- Contains "What do good readers do?"
- Contains "read carefully and think about the meaning" (as a reading strategy, not Math word problem)

### Missing Required Elements (Critical)
- No `correctIndex` in Quick Check interaction
- Quick Check question is empty or missing
- Quick Check has fewer than 2 options
- Answer leak: owlText contains the correct answer text
- Practice step has no content AND no interaction
- Journey has fewer than 10 steps
- Any step has both empty owlText AND empty studentText

### Generic Content (High)
- More than 2 generic phrases across the journey
- Generic phrases: "here is what you need to know", "we use this every day", "take a moment to think", "let's learn about this topic", "this is important for your learning", "you will learn many things", "this is a very important skill", "keep practicing and you will get better"

### Duplicate Content (Medium)
- owlText and studentText are identical for any step (and length > 20 chars)

### Reflection Mismatch (High)
- Reflection asks about reading in a Math lesson
- Reflection asks about stories/passages in a Math lesson
- Reflection is generic ("What did you learn today?") without Math-specific prompt

## Required Positive Checks

A Math journey **SHOULD** contain (warning if missing):

### Math Vocabulary
- Lesson-specific Math terms (add, subtract, count, number, pattern, etc.)
- Strand-specific language (place value, fraction, measure, shape, etc.)
- Grade-2 appropriate difficulty (no algebra, no advanced concepts)

### Concept Explanation
- Clear explanation of the Math concept
- Worked example showing the procedure
- Connection to real-world Math contexts (not English contexts)

### Meaningful Practice
- Practice problems that require Math action (solve, calculate, draw, measure)
- Practice matches the lesson's learning objective
- Practice is NOT just "read and answer"

### Valid Quick Check
- Tests the Math concept from the lesson
- Has plausible Math-focused options
- correctIndex points to the correct Math answer
- Explanation reinforces the Math concept

### Appropriate Media
- Visual/SVG support for visual Math topics (fractions, shapes, lines, measurement)
- Video only where appropriate (not forced on every step)
- Media matches the step type

### Grade 2 Appropriate
- No advanced content (algebra, trigonometry, calculus)
- Age-appropriate language
- CBC-aligned learning outcomes

## Topic-Specific Rules

### Numbers/Counting
- Must contain number names, counting sequences
- Must have visual number line or counting objects
- Practice must involve counting or number recognition

### Addition/Subtraction
- Must contain + and - symbols
- Must show worked examples with carrying/regrouping where appropriate
- Practice must require solving addition/subtraction problems
- Quick Check must test addition/subtraction

### Fractions
- Must contain fraction language (half, quarter, equal parts, whole)
- MUST have visual fraction representation (circles, rectangles divided)
- Must NOT contain advanced fraction operations (multiplication, division of fractions)

### Measurement
- Must contain measurement language (length, unit, ruler, measure)
- MUST have visual measurement examples
- Practice must involve measuring or estimating

### Geometry/Shapes
- Must contain shape names and properties
- MUST have shape diagrams
- Practice must involve identifying, drawing, or sorting shapes

### Multiplication
- Must contain multiplication language (groups, arrays, times, repeated addition)
- MUST have visual array/group representation
- Must NOT contain division (unless explicitly taught)
