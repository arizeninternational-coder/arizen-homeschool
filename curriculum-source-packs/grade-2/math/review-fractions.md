# Grade 2 Mathematics — Fractions Source Pack Draft: Review Packet

**Status:** Draft for Victor review
**Date:** 2026-06-16
**Source file:** `curriculum-shells/grade-2/mathematics-source-extended.csv` (KICD/CBC, 156 rows)
**Audit reference:** `docs/audits/grade-2-math-topic-map.md`

---

## 1. Fractions Count Discrepancy

### Original audit count: 7 lessons
The audit (`grade-2-math-topic-map.md`, line 177) listed **7 Fractions lessons**:
1. Introduction to Halves Using Rectangular Cut-outs [RECOVERY]
2. Introduction to Quarters Using Rectangular Cut-outs [RECOVERY]
3. Comparing Fractions: 1/2 and 1/4
4. Making Patterns with Fractions [RECOVERY]
5. Digital Games with Fractions [RECOVERY]
6. Fractions: Practice and Application
7. Fractions: Assessment and Reflection

These are the lessons that exist in the **database** with `studentJourneyDraft` or `studentJourney` data and were tagged under the "1.3 Fractions" sub-strand.

### CSV source count: 12 lessons
The **source CSV** (`mathematics-source-extended.csv`, rows 30-41) lists **12 Fractions lessons** (all under sub_strand "1.3 Fractions"):
1. Introduction to Halves Using Circular Cut-outs
2. Introduction to Halves Using Rectangular Cut-outs
3. Identifying 1/2 in Everyday Objects
4. Introduction to Quarters Using Circular Cut-outs
5. Introduction to Quarters Using Rectangular Cut-outs
6. Identifying 1/4 in Everyday Objects
7. Comparing Fractions: 1/2 and 1/4
8. Fractions in Daily Life: Sharing Food
9. Making Patterns with Fractions
10. Digital Games with Fractions
11. Fractions: Practice and Application
12. Fractions: Assessment and Reflection

### The 5 additional CSV lessons not in the original audit count

| # | Lesson title | Why it was not in the audit count |
|---|-------------|----------------------------------|
| 1 | Introduction to Halves Using Circular Cut-outs | Exists in CSV but NOT in the database (no DB record found) |
| 2 | Introduction to Quarters Using Circular Cut-outs | Exists in CSV but NOT in the database (no DB record found) |
| 3 | Fractions in Daily Life: Sharing Food | Exists in CSV but NOT in the database (no DB record found) |
| 4 | Identifying 1/2 in Everyday Objects | In DB but was mapped to "Numbers" strand, not "Fractions" |
| 5 | Identifying 1/4 in Everyday Objects | In DB but was mapped to "Numbers" strand, not "Fractions" |

### Why they belong under Fractions
- **Lessons 1-3:** These are in the CSV under sub_strand "1.3 Fractions" with learning outcome "identify 1/4 as part of a whole." They are official KICD lessons. They were simply not imported into the database (or were imported under a different strand).
- **Lessons 4-5:** These are in the database but were originally mapped to the "Numbers" strand because the audit's topic-mapping function used title keywords. "Identifying 1/2 in Everyday Objects" contains "Identifying" and "Everyday Objects" but not "Fraction" in the title. However, the CSV clearly places them under "1.3 Fractions" with the learning outcome "identify 1/4 as part of a whole." They are fractions lessons.

### Source of truth
The **CSV is the authoritative source** for lesson titles and strand mapping. The database has gaps (3 CSV lessons not in DB) and mapping errors (2 lessons mapped to wrong strand). The source pack should use the CSV as the authoritative source.

### Decision needed from Victor
- Should the 3 CSV-only lessons (Circular Cut-outs x2, Sharing Food) be added to the database?
- Or should the source pack only cover the 9 lessons that exist in the database?

**Current draft covers 9 lessons** (7 from audit + 2 remapped from Numbers). The remaining 3 CSV-only lessons are NOT included in the current draft.

---

## 2. Comparing Fractions: 1/2 and 1/4

### Source evidence
CSV row 36: "Comparing Fractions: 1/2 and 1/4" — sub_strand "1.3 Fractions", learning outcome "identify 1/4 as part of a whole." Activity: "Learners in pairs to make circular paper cut-outs... fold into two equal parts... identify one of the parts as a half... fold circular paper cut-outs to get 4 equal parts and identify one of the parts as 1/4."

### Clarified rule
**Allowed:**
- Comparing using the **same whole** (same-size shapes)
- Side-by-side shaded shapes: "Which shows 1/2? Which shows 1/4?"
- Food sharing: "If you cut a chapati into 2 equal pieces and a cake into 4 equal pieces, which piece is bigger?"
- Visual comparison of shaded parts
- Identifying which fraction is shown in each shape

**NOT allowed:**
- Abstract fraction comparison (no "which is bigger: 1/2 or 1/4?")
- Number-line fraction comparison
- Equivalent fractions (1/2 = 2/4)
- Symbolic inequality (1/2 > 1/4)
- Any comparison that requires understanding relative size of fractions

### Grade 2-safe approach
The lesson should show **two same-size shapes** side by side — one divided into 2 equal parts with 1 shaded, one divided into 4 equal parts with 1 shaded. The child identifies each fraction. The lesson does NOT ask "which is bigger?" — it asks "what fraction is each?"

---

## 3. Making Patterns with Fractions

### Source evidence
CSV row 38: "Making Patterns with Fractions" — sub_strand "1.3 Fractions", learning outcome "identify 1/4 as part of a whole." Activity: paper folding, identifying halves and quarters.

### Clarified approach
**Should use visual patterns with shaded halves/quarters:**
- Pattern: 1/2, 1/4, 1/2, 1/4... using shaded shapes
- Pattern: 1/2, 1/2, 1/4, 1/2, 1/2, 1/4... using shaded shapes
- Child continues the pattern by selecting/shading the next shape
- Child creates their own pattern using halves and quarters

**Should avoid:**
- Abstract sequences like 1/4, 2/4, 3/4, ___ (this is fraction arithmetic)
- Any pattern that requires adding or counting fractions
- Number-line patterns with fractions
- Written fraction notation patterns (keep it visual)

### Grade 2-safe version
The lesson uses **visual pattern recognition** with shaded shapes. The child sees a sequence of shapes (half shaded, quarter shaded, half shaded, quarter shaded...) and identifies what comes next. No abstract fraction notation in the pattern.

---

## 4. Digital Games with Fractions

### Source evidence
CSV row 39: "Digital Games with Fractions" — sub_strand "1.3 Fractions", learning outcome "identify 1/4 as part of a whole." Activity: "Learners to play digital games involving fractions."

### Clarification
**Is this an official lesson shell/title?** YES. It is an official KICD lesson title in the CSV (row 39).

**What should the child learn?** Identifying halves and quarters through interactive practice. The math objective is still halves/quarters/equal parts.

**What kind of practice without a real game engine?**
- Interactive matching: match the fraction to the shaded shape
- Interactive sorting: sort shapes into "halves" and "quarters" groups
- Interactive shading: shade the shape to show the given fraction
- Interactive identification: "Tap the shape that shows 1/4"

These can be implemented as simple tap-to-select interactions without a full game engine.

---

## 5. Assessment and Reflection

### Source evidence
CSV row 41: "Fractions: Assessment and Reflection" — sub_strand "1.3 Fractions", learning outcome "identify 1/4 as part of a whole."

### Clarification
**Is this a standalone lesson or review lesson?** It is a standalone lesson per the CSV. However, given its title and position (last in the fractions sequence), it functions as a **review/assessment lesson** covering all fractions concepts taught in previous lessons.

**Should the journey be a mixed review?** YES. It should cover:
- Identifying halves
- Identifying quarters
- Equal vs unequal parts
- Fair sharing

**What Quick Check type is appropriate?** A **comprehensive mixed review** that tests all fractions concepts. Not a single-concept QC.

**How to avoid making it too broad or generic?**
- Focus on the 4 core skills: halves identification, quarters identification, equal vs unequal, fair sharing
- Use varied question types (identify fraction, shade fraction, equal vs unequal, fair sharing scenario)
- Keep questions concrete and visual — no abstract fraction concepts

---

## 6. Nine-Lesson Review Table

| # | Lesson title | Source evidence | Mapped subtopic | Child-friendly goal | Approved vocabulary | Example type | Visual type | Practice type | Quick Check template | Difficulty limit | What Victor must approve |
|---|-------------|-----------------|-----------------|-------------------------------------|-------------|-------------|---------------|---------------------|-----------------|-------------------------|
| 1 | Introduction to Halves Using Rectangular Cut-outs | CSV row 31, DB recovery | Halves | "Today you will learn what a half is. A half means one of two equal parts." | whole, half, equal parts, fold, shade | Fold rectangular paper into 2 equal parts | rectangle_divided_2_equal_parts_shaded | Fold, shade, identify halves | identify-halves-shape | Halves only (1/2). NO arithmetic. | Example wording, visual description |
| 2 | Introduction to Quarters Using Rectangular Cut-outs | CSV row 34, DB recovery | Quarters | "Today you will learn what a quarter is. A quarter means one of four equal parts." | whole, quarter, equal parts, fold, shade | Fold rectangular paper into 4 equal parts | rectangle_divided_4_equal_parts_shaded | Fold, shade, identify quarters | identify-quarters-shape | Quarters only (1/4). NO arithmetic. | Example wording, visual description |
| 3 | Comparing Fractions: 1/2 and 1/4 | CSV row 36, DB published | Comparing | "Today you will learn to tell the difference between a half and a quarter." | half, quarter, equal parts, whole, compare | Side-by-side same-size shapes: one showing 1/2, one showing 1/4 | side_by_side_halves_quarters | Identify which is 1/2 and which is 1/4 | identify-fraction-halves-or-quarters | Halves and quarters only. NO comparing which is bigger. | Comparison approach (visual only, no abstract) |
| 4 | Making Patterns with Fractions | CSV row 38, DB recovery | Fraction Patterns | "Today you will learn to make patterns using halves and quarters." | half, quarter, pattern, repeat, sequence | Visual pattern: 1/2, 1/4, 1/2, 1/4... using shaded shapes | fraction_pattern_sequence | Continue and create visual fraction patterns | identify-next-in-fraction-pattern | Patterns using 1/2 and 1/4 only. NO abstract sequences. | Pattern type (visual only, no 1/4, 2/4, 3/4) |
| 5 | Digital Games with Fractions | CSV row 39, DB recovery | Digital Practice | "Today you will practice fractions by playing a fun digital game." | half, quarter, equal parts, game, score | Interactive matching: match fraction to shaded shape | interactive_fraction_game | Interactive fraction matching and identification | identify-fraction-from-shape-game | Halves and quarters identification only. | Interaction type (matching, sorting, shading) |
| 6 | Fractions: Practice and Application | CSV row 40, DB published | Practice | "Today you will practice everything you know about halves and quarters." | half, quarter, equal parts, whole, shade, identify | Mixed practice: identify, shade, create fractions | mixed_fractions_practice | Mixed tasks: identify, shade, equal vs unequal | mixed-fractions-practice | Halves and quarters. Equal vs unequal parts. | Practice task types |
| 7 | Fractions: Assessment and Reflection | CSV row 41, DB published | Assessment | "Today you will show what you know about fractions and think about what you learned." | half, quarter, equal parts, whole, reflect | Review: what is a half? what is a quarter? what are equal parts? | fractions_assessment | Assessment questions + reflection prompt | fractions-assessment-comprehensive | Halves, quarters, equal vs unequal, fair sharing. | Assessment format, reflection prompt |
| 8 | Identifying 1/2 in Everyday Objects | CSV row 32, DB recovery (remapped from Numbers) | Halves in Real Life | "Today you will find halves in everyday things like food and objects." | half, equal parts, whole, share, fair | Chapati cut into 2 equal pieces | real_objects_halves | Identify halves in real-life objects | identify-halves-real-object | Halves only (1/2). Real objects. | Real-life examples (chapati, cake, fruit) |
| 9 | Identifying 1/4 in Everyday Objects | CSV row 35, DB recovery (remapped from Numbers) | Quarters in Real Life | "Today you will find quarters in everyday things like food and objects." | quarter, equal parts, whole, share, fair | Cake cut into 4 equal slices | real_objects_quarters | Identify quarters in real-life objects | identify-quarters-real-object | Quarters only (1/4). Real objects. | Real-life examples (cake, pizza, chocolate) |

---

## 7. Six Quick Check Templates

### QC-H1: Identify Halves (Shape)
| Field | Value |
|-------|-------|
| **Template ID** | QC-H1 |
| **Skill tested** | Identifying halves from a shape |
| **Question** | "This circle is divided into 2 equal parts. One part is shaded. What fraction is shaded?" |
| **Options** | A: 1/2, B: 1/4, C: 1/3, D: 2/2 |
| **Correct answer** | A: 1/2 |
| **Correct index** | 0 |
| **Distractor logic** | B (1/4): confuses halves with quarters. C (1/3): random wrong fraction. D (2/2): thinks "2 parts" = 2/2 instead of 1/2 |
| **Feedback correct** | "Yes! One out of two equal parts is one half. Well done!" |
| **Feedback incorrect** | "Look again. The shape is divided into 2 equal parts. One part is shaded. That's one half." |
| **Grade 2 safety** | Uses shape + shading. No abstract comparison. Only 1/2 as correct answer. |

### QC-H2: Identify Halves (Real Object)
| Field | Value |
|-------|-------|
| **Template ID** | QC-H2 |
| **Skill tested** | Identifying halves in real-life objects |
| **Question** | "A chapati is cut into 2 equal pieces. You get 1 piece. What fraction of the chapati do you have?" |
| **Options** | A: 1/4, B: 1/2, C: 1 whole, D: 2/2 |
| **Correct answer** | B: 1/2 |
| **Correct index** | 1 |
| **Distractor logic** | A (1/4): confuses with quarters. C (1 whole): thinks one piece = whole thing. D (2/2): confuses number of pieces with fraction |
| **Feedback correct** | "Correct! One piece out of 2 equal pieces is one half. Good thinking!" |
| **Feedback incorrect** | "The chapati was cut into 2 equal pieces. You have 1 of those pieces. That's one half." |
| **Grade 2 safety** | Uses real-life object (chapati). Concrete scenario. No abstract comparison. |

### QC-Q1: Identify Quarters (Shape)
| Field | Value |
|-------|-------|
| **Template ID** | QC-Q1 |
| **Skill tested** | Identifying quarters from a shape |
| **Question** | "This rectangle is divided into 4 equal parts. One part is shaded. What fraction is shaded?" |
| **Options** | A: 1/2, B: 1/3, C: 1/4, D: 4/4 |
| **Correct answer** | C: 1/4 |
| **Correct index** | 2 |
| **Distractor logic** | A (1/2): confuses quarters with halves. B (1/3): random wrong fraction. D (4/4): thinks "4 parts" = 4/4 instead of 1/4 |
| **Feedback correct** | "Yes! One out of four equal parts is one quarter. Excellent!" |
| **Feedback incorrect** | "Count the equal parts. There are 4. One part is shaded. That's one quarter." |
| **Grade 2 safety** | Uses shape + shading. No abstract comparison. Only 1/4 as correct answer. |

### QC-Q2: Identify Quarters (Real Object)
| Field | Value |
|-------|-------|
| **Template ID** | QC-Q2 |
| **Skill tested** | Identifying quarters in real-life objects |
| **Question** | "A cake is cut into 4 equal slices. You eat 1 slice. What fraction of the cake did you eat?" |
| **Options** | A: 1/2, B: 1/4, C: 1/3, D: 1 whole |
| **Correct answer** | B: 1/4 |
| **Correct index** | 1 |
| **Distractor logic** | A (1/2): confuses quarters with halves. C (1/3): random wrong fraction. D (1 whole): thinks eating a slice = eating whole cake |
| **Feedback correct** | "Correct! One slice out of 4 equal slices is one quarter. Well done!" |
| **Feedback incorrect** | "The cake was cut into 4 equal slices. You ate 1 slice. That's one quarter of the cake." |
| **Grade 2 safety** | Uses real-life object (cake). Concrete scenario. No abstract comparison. |

### QC-E1: Equal vs Unequal Parts
| Field | Value |
|-------|-------|
| **Template ID** | QC-E1 |
| **Skill tested** | Understanding that fractions require equal parts |
| **Question** | "Which shape shows equal parts?" |
| **Options** | A: Rectangle divided into 2 EQUAL parts, B: Rectangle divided into 2 UNEQUAL parts, C: Circle divided into 3 UNEQUAL parts, D: Square divided into 4 UNEQUAL parts |
| **Correct answer** | A |
| **Correct index** | 0 |
| **Distractor logic** | B-D all show unequal parts. Tests the core concept: fractions require EQUAL parts |
| **Feedback correct** | "Yes! Only Shape A has equal parts. Fractions need equal parts!" |
| **Feedback incorrect** | "Remember: fractions need parts that are the same size. Look for the shape where all parts are equal." |
| **Grade 2 safety** | Visual comparison only. No fraction notation. Tests foundational concept. |

### QC-F1: Fair Sharing
| Field | Value |
|-------|-------|
| **Template ID** | QC-F1 |
| **Skill tested** | Applying fractions to fair sharing scenarios |
| **Question** | "2 children want to share a chapati fairly. What fraction does each child get?" |
| **Options** | A: 1/4, B: 1/3, C: 1/2, D: 1 whole |
| **Correct answer** | C: 1/2 |
| **Correct index** | 2 |
| **Distractor logic** | A (1/4): confuses 2 people with 4 parts. B (1/3): random wrong fraction. D (1 whole): thinks each person gets the whole chapati |
| **Feedback correct** | "Correct! When 2 children share fairly, each gets one half. That's fair sharing!" |
| **Feedback incorrect** | "If 2 children share one chapati fairly, we cut it into 2 equal parts. Each child gets 1 out of 2 parts. That's one half." |
| **Grade 2 safety** | Real-life scenario (sharing food). Concrete. No abstract comparison. |

---

## 8. Approval Checklist

### Items safe to approve (based on source evidence)
- [x] Fractions scope: halves (1/2) and quarters (1/4) only
- [x] No fraction arithmetic in Grade 2
- [x] No equivalent fractions in Grade 2
- [x] No comparing which fraction is bigger
- [x] Vocabulary: whole, half/halves, quarter/quarters, equal parts, fair share, fraction
- [x] Real-life examples: chapati, cake, pizza, chocolate, paper folding, oranges
- [x] Visual approach: shapes divided into equal parts with shading
- [x] Equal vs unequal parts as a core teaching moment
- [x] Fair sharing as a fractions application
- [x] 6 QC templates with correct answers and distractor logic
- [x] Video is optional for Fractions (SVG/diagrams more important)

### Items needing Victor decision
- [ ] **Comparing Fractions lesson:** Should it ask "which is bigger?" or only "identify each fraction?" (Current draft: identify only, no comparison of size)
- [ ] **Making Patterns lesson:** Should it use visual patterns only (1/2, 1/4, 1/2, 1/4...) or include abstract sequences? (Current draft: visual only)
- [ ] **Digital Games lesson:** What interaction types are appropriate? (Current draft: matching, sorting, shading, identification)
- [ ] **Assessment lesson:** Should it be a comprehensive mixed review or focus on specific skills? (Current draft: comprehensive mixed review)
- [ ] **3 CSV-only lessons:** Should "Introduction to Halves Using Circular Cut-outs," "Introduction to Quarters Using Circular Cut-outs," and "Fractions in Daily Life: Sharing Food" be added to the database?
- [ ] **"Fractions in Daily Life: Sharing Food"** — This is a separate CSV lesson (row 37) that overlaps with the fair sharing concept. Should it be a separate lesson or merged?

### Items that should be changed before generation
- [ ] **Lesson count:** Current draft covers 9 lessons. If Victor wants all 12 CSV lessons, 3 need to be added to the database first.
- [ ] **QC templates for lessons 3-7:** The current draft has QC templates for all 9 lessons, but lessons 3-7 (Comparing, Patterns, Digital Games, Practice, Assessment) need Victor confirmation of the QC approach.
- [ ] **Visual descriptions:** All 9 lessons need SVG visual descriptions confirmed by Victor.

### Can Fractions move to proof-of-concept after approval?
**YES.** Once Victor approves:
1. The Fractions topic guide is complete
2. All 9 lessons are mapped with child-friendly goals, vocabulary, examples, visuals, and QC templates
3. The journey model (10-step, media rules, validation rules) is already defined
4. We can generate a single Fractions proof-of-concept journey (e.g., "Introduction to Halves Using Rectangular Cut-outs") to validate the entire pipeline before scaling to all 9 lessons

**No journeys will be generated until Victor explicitly approves the Fractions source pack.**
