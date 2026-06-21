# Subject-Specific Journey Validators

## Purpose

These validators define what makes a journey acceptable for each subject. A journey that fails validation must NOT be published.

## Mathematics Journey Validator

### MUST NOT contain (automatic fail):
- "reading comprehension"
- "read a short passage"
- "main idea of the story"
- "good readers"
- "letter sound", "syllable", "phonics"
- "grammar", "noun", "verb", "article", "preposition"
- "vocabulary and pronunciation"
- "what did you learn about reading"
- "what did you learn about writing"
- "spelling words", "handwriting practice"
- "healthy habits", "wash your hands", "brush your teeth"
- "living things", "non-living things" (unless Environmental)
- "weather", "season", "water cycle"

### SHOULD contain (warning if missing):
- Subject-specific mathematical language (add, subtract, count, number, pattern, etc.)
- Visual/diagram references for concrete topics (halves, shapes, measurement)
- Practice that requires mathematical action (solve, calculate, draw, measure)
- Quick Check that tests the mathematical objective

### Practice step requirements:
- Must have actual practice problems OR interactive elements
- Must match the lesson's learning objective
- Must require mathematical thinking (not just reading)

### Quick Check requirements:
- Must have a correctIndex
- Must test the mathematical concept from the lesson
- Must NOT leak the answer in owlText
- Options must be mathematically plausible

### Reflection requirements:
- Must ask about the mathematical concept
- Must NOT ask about reading, stories, or unrelated subjects

## English Journey Validator

### MUST NOT contain (automatic fail):
- "addition and subtraction" (unless word problems)
- "number pattern", "place value", "tens and ones"
- "fraction", "numerator", "denominator"
- "multiply", "divide", "times table"
- "measure the length", "weigh", "ruler"
- "shillings", "coins", "money", "price"
- "shape has", "sides and corners"
- "graph", "data", "tally"

### SHOULD contain:
- Language skill focus (reading, writing, speaking, listening)
- Age-appropriate text references
- Vocabulary building activities
- Comprehension questions (for reading lessons)
- Writing prompts (for writing lessons)

### Practice step requirements:
- Must have language-based practice (read, write, speak, listen)
- Must match the language skill being taught

### Quick Check requirements:
- Must test language skill, not math
- Must have plausible language-focused options

## Kiswahili Journey Validator

### MUST NOT contain:
- Math-only content without Kiswahili context
- English subject content without intentional translation support

### SHOULD contain:
- Kiswahili vocabulary and phrases
- Cultural context
- Translation support where appropriate

## Environmental Journey Validator

### MUST NOT contain:
- Reading comprehension as the main focus
- Math computation
- English grammar instruction

### SHOULD contain:
- Nature/real-world observation
- Living and non-living things
- Environmental awareness activities

## Hygiene & Nutrition Journey Validator

### MUST NOT contain:
- Reading comprehension as the main focus
- Math computation
- English grammar instruction

### SHOULD contain:
- Health habits
- Nutrition concepts
- Practical hygiene activities

## Movement & Creative Journey Validator

### MUST NOT contain:
- Reading comprehension as the main focus
- Math computation
- English grammar instruction

### SHOULD contain:
- Physical movement instructions
- Creative expression
- Safety awareness

## Generic Validators (All Subjects)

### Journey structure:
- Must have 10 steps (welcome, mission, think_first, learn, connect, example, practice, quick_check, reflect, complete)
- Each step must have a title
- Each step must have owlText or studentText (not both empty)

### Duplicate detection:
- owlText and studentText must NOT be identical (unless intentionally so)

### Generic content limit:
- No more than 2 generic phrases per journey
- Generic phrases: "here is what you need to know", "we use this every day", "take a moment to think", etc.

### Media:
- Video controls only on steps where video is appropriate
- Math lessons should have visual/diagram support
- Language lessons should have text/image support
