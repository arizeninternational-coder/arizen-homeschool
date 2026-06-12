# PHASE 3: DATA INTEGRITY REPORT

## 1. Actual Grade 2 Subject Names in Database

The database has **18 themes** (not 7 subjects). Each theme contains quests, and each quest contains lessons. The themes are:

| Theme | Lessons | With Journey | Without |
|-------|---------|--------------|---------|
| English Language Activities | 48 | 48 | 0 |
| Grade 2 English | 87 | 87 | 0 |
| Grade 2 Environmental Activities | 87 | 87 | 0 |
| Grade 2 Hygiene and Nutrition | 66 | 66 | 0 |
| Grade 2 Kiswahili | 87 | 87 | 0 |
| Grade 2 Mathematics | 92 | 21 | 71 |
| Grade 2 Movement | 87 | 87 | 0 |
| Numbers in Everyday Life | 5 | 0 | 5 |
| unknown (22 other themes) | 441 | 0 | 441 |

**Total: 1000 lessons, 483 with journeys, 517 without**

## 2. Count Discrepancies Explained

### Why earlier reports showed different numbers:
- **843 vs 1000**: Earlier queries filtered by `grade=2` through Theme→Quest→Lesson joins. The 1000 count includes ALL lessons in quests under Grade 2 themes. The 843 count was from a filtered query that missed some themes.
- **Math 6 vs 71**: Earlier sampling only checked a subset. The full count is 71 Math lessons without journeys (out of 92 total).
- **English 48+48 vs 87+48**: The "Grade 2 English" theme has 87 lessons (not 90). The 90 count from earlier was incorrect.

### The "unknown" category (441 lessons):
These are lessons under themes that don't have a clear subject/strand mapping. They appear to be from additional curriculum areas (Social Studies, CRE, etc.) that were imported but not properly mapped to the Grade 2 subject structure.

## 3. English vs English Language Activities

**They are separate curricula:**
- **Grade 2 English** (87 lessons): Theme-based, organized under quests like "School English Quest", "Transport English Quest", "Accidents English Quest". Uses strands like "Listening and Speaking", "Reading", "Writing", "Language Skills through Themes".
- **English Language Activities** (48 lessons): Skill-based, organized under a single quest. Uses strands like "1.0 Listening", "2.0 Speaking", "3.0 Reading", "4.0 Writing".

**No duplicate titles** between the two sets.

**Field health for both:**
- `learningOutcome`: 100% populated (222/222)
- `keyInquiryQuestion`: 100% populated
- `suggestedLearningExperience`: 100% populated
- `activityInstructions`: 100% populated
- `specificLearningOutcome`: Only 48/222 populated (22%) — mostly in ELA

## 4. CSV Comparison

The ELA CSV has 49 rows (48 lessons + header) with columns: grade, subject, strand, subStrand, learningOutcome, specificLearningOutcome, keyInquiryQuestion, suggestedLearningExperience, lessonTitle, lessonOrder, term, week, activityTitle, activityInstructions, assessmentMethods.

The database has 48 ELA lessons — matching the CSV row count. The CSV `lessonTitle` field maps to the database `title` field.

## 5. Published Lessons Without Journeys (517 total)

| Strand/Subject | Count | Notes |
|----------------|-------|-------|
| Numbers | 69 | Math seed data — DO NOT TOUCH |
| unknown | 12 | Various unmapped themes |
| Number Concept | 1 | Math — DO NOT TOUCH |

The remaining 435 lessons without journeys are under the "unknown" theme category — these are from unmapped curriculum areas.

## 6. Misaligned Records

No clearly misaligned English records found. The database lesson titles match the CSV source for ELA. The theme-based English lessons were generated from a separate import process.

## Key Takeaway
The two English curricula are genuine and separate. Both have complete curriculum field data. The "Grade 2 English" theme (87 lessons) is the target for this session's proof-of-concept and regeneration.
