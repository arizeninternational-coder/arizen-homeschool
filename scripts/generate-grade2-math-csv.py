#!/usr/bin/env python3
"""
Generate Grade 2 Mathematics lesson shell CSVs.
Source: seed-curriculum/route.ts (hardcoded curriculum structure).
Extended CSV includes source_reference = "SEED_DATA" (needs official CBC/KICD verification).
"""

import csv
import io
import os

# Output to the repo root curriculum-shells directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(REPO_ROOT, "curriculum-shells", "grade-2")
os.makedirs(OUTPUT_DIR, exist_ok=True)

GRADE = 2
SUBJECT = "Mathematical Activities"
STRAND = "Mathematics"
TERM = "Term 1"
DIFFICULTY = "Beginner"
ESTIMATED_DURATION = "30"
REWARD_COINS = "10"
REWARD_STARS = "1"
REWARD_XP = "50"
SOURCE_REF = "SEED_DATA"
REVIEW_STATUS = "DRAFT"

# Curriculum structure: [strand, sub_strand, [lesson_titles]]
# Based on src/app/api/admin/seed-curriculum/route.ts lines 22-37
CURRICULUM_STRUCTURE = [
    ("Numbers", "Number Concept", [
        "Counting Numbers up to 100 Forwards",
        "Counting Numbers up to 100 Backwards",
        "Comparing Numbers up to 100",
    ]),
    ("Numbers", "Place Value", [
        "Tens and Ones",
        "Identifying Values of Digits up to 100",
    ]),
    ("Numbers", "Reading and Writing", [
        "Writing Numbers in Digits up to 100",
        "Writing Numbers in Words up to 100",
    ]),
    ("Numbers", "Number Patterns", [
        "Completing Number Patterns",
    ]),
    ("Numbers", "Addition", [
        "Adding Numbers up to a Sum of 100",
        "Addition with Carrying",
    ]),
    ("Numbers", "Subtraction", [
        "Subtracting Numbers Within 100",
        "Subtraction with Borrowing",
    ]),
    ("Numbers", "Multiplication", [
        "Introduction to Multiplication",
        "Multiplication Facts up to 5 x 5",
    ]),
    ("Numbers", "Fractions", [
        "Identifying a Half",
        "Identifying a Quarter",
    ]),
    ("Measurement", "Length", [
        "Measuring Length Using Non-Standard Units",
        "Measuring Length in Metres",
    ]),
    ("Measurement", "Mass", [
        "Comparing Mass: Heavier, Lighter, Same",
    ]),
    ("Measurement", "Capacity", [
        "Measuring Liquid Using Smaller Containers",
        "Comparing How Much Liquid Containers Hold",
    ]),
    ("Measurement", "Time", [
        "Reading Time by the Hour",
        "Reading Time by the Half-Hour",
        "Identifying Days of the Week",
    ]),
    ("Measurement", "Money", [
        "Recognizing Kenyan Coins up to Ksh 100",
        "Simple Shopping Simulations",
    ]),
    ("Geometry", "Shapes", [
        "Recognizing Rectangles, Squares, Circles, Triangles",
        "Making Patterns with Shapes",
    ]),
]


def build_lessons():
    lessons = []
    order = 0

    # Group by quest: each sub-strand = one quest
    quest_groups = {}
    for strand, sub_strand, titles in CURRICULUM_STRUCTURE:
        quest_title = f"{sub_strand} Quest"
        if quest_title not in quest_groups:
            quest_groups[quest_title] = {
                "strand": strand,
                "sub_strand": sub_strand,
                "titles": [],
            }
        quest_groups[quest_title]["titles"].extend(titles)

    for quest_title, qdata in quest_groups.items():
        for title in qdata["titles"]:
            order += 1
            lessons.append({
                "grade": GRADE,
                "subject": SUBJECT,
                "strand": qdata["strand"],
                "sub_strand": qdata["sub_strand"],
                "learning_outcome": f"Learners should be able to demonstrate understanding of {title.lower()}",
                "lesson_title": title,
                "term": TERM,
                "week": f"Week {min(order, 12)}",
                "activity_title": f"Activity: {title}",
                "activity_instructions": f"Engage learners in hands-on activities related to {title.lower()}. Use locally available materials.",
                "quest_title": quest_title,
                "quest_instructions": f"Explore {qdata['sub_strand'].lower()} through interactive activities and practice.",
                "reflection_prompt": f"What did you learn about {title.lower()} today?",
                "reward_coins": REWARD_COINS,
                "reward_stars": REWARD_STARS,
                "estimated_duration": ESTIMATED_DURATION,
                "difficulty": DIFFICULTY,
            })

    return lessons


def generate_import_csv(lessons):
    """Generate the admin import CSV (matches app importer expected format)."""
    headers = [
        "grade",
        "subject",
        "strand",
        "sub_strand",
        "learning_outcome",
        "lesson_title",
        "term",
        "week",
        "activity_title",
        "activity_instructions",
        "quest_title",
        "quest_instructions",
        "reflection_prompt",
        "reward_coins",
        "reward_stars",
        "estimated_duration",
        "difficulty",
    ]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers, extrasaction='ignore', quoting=csv.QUOTE_ALL)
    writer.writeheader()
    for lesson in lessons:
        writer.writerow(lesson)

    return output.getvalue()


def generate_extended_csv(lessons):
    """Generate the extended source-backed CSV."""
    headers = [
        "grade",
        "subject",
        "strand",
        "sub_strand",
        "learning_outcome",
        "lesson_title",
        "term",
        "week",
        "activity_title",
        "activity_instructions",
        "quest_title",
        "quest_instructions",
        "reflection_prompt",
        "reward_coins",
        "reward_stars",
        "estimated_duration",
        "difficulty",
        "key_inquiry_question",
        "suggested_learning_experience",
        "assessment_hint",
        "values",
        "core_competencies",
        "pertinent_and_contemporary_issues",
        "source_document",
        "source_page_or_section",
        "source_confidence",
        "review_status",
        "existing_match_status",
        "duplicate_risk",
        "notes_for_victor",
    ]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers, extrasaction='ignore', quoting=csv.QUOTE_ALL)
    writer.writeheader()

    for lesson in lessons:
        extended = {
            **lesson,
            "key_inquiry_question": f"How do we {lesson['lesson_title'].lower()}?",
            "suggested_learning_experience": f"Use physical objects, group activities, and guided practice for {lesson['lesson_title'].lower()}",
            "assessment_hint": f"Observe learner ability to demonstrate {lesson['lesson_title'].lower()}",
            "values": "Responsibility,Respect",
            "core_competencies": "Communication and Collaboration,Critical Thinking and Problem Solving",
            "pertinent_and_contemporary_issues": "",
            "source_document": "SEED_DATA (src/app/api/admin/seed-curriculum/route.ts)",
            "source_page_or_section": "Lines 22-37",
            "source_confidence": "MEDIUM — hardcoded seed data, not from official CBC/KICD document",
            "review_status": REVIEW_STATUS,
            "existing_match_status": "NEEDS_VERIFICATION",
            "duplicate_risk": "LOW — lesson titles match seed data topics",
            "notes_for_victor": "Generated from seed data. Needs official CBC/KICD source verification before final import.",
        }
        writer.writerow(extended)

    return output.getvalue()


def validate_csv(csv_content, label):
    """Basic validation of generated CSV."""
    lines = csv_content.strip().split("\n")
    errors = []

    if len(lines) < 2:
        errors.append(f"{label}: No data rows")
        return errors

    # Check header
    reader = csv.DictReader(io.StringIO(csv_content))
    headers = reader.fieldnames or []

    required = ["grade", "subject", "strand", "sub_strand", "learning_outcome", "lesson_title", "term", "week", "quest_title", "difficulty", "estimated_duration"]
    for r in required:
        if r not in headers:
            errors.append(f"{label}: Missing required column '{r}'")

    # Check rows
    row_count = 0
    titles = set()
    for row in reader:
        row_count += 1
        for f in required:
            if not row.get(f, "").strip():
                errors.append(f"{label}: Row {row_count} missing '{f}'")
        t = row.get("lesson_title", "").strip()
        if t in titles:
            errors.append(f"{label}: Duplicate lesson title '{t}'")
        titles.add(t)

    print(f"  {label}: {row_count} rows, {len(errors)} errors")
    for e in errors[:5]:
        print(f"    ERROR: {e}")
    if len(errors) > 5:
        print(f"    ... and {len(errors) - 5} more errors")

    return errors


def main():
    lessons = build_lessons()
    print(f"Generated {len(lessons)} lesson shells")

    # Import CSV
    import_csv = generate_import_csv(lessons)
    import_path = os.path.join(OUTPUT_DIR, "mathematics-import.csv")
    with open(import_path, "w", newline="", encoding="utf-8") as f:
        f.write(import_csv)
    print(f"Import CSV: {import_path}")

    # Extended CSV
    extended_csv_data = generate_extended_csv(lessons)
    extended_path = os.path.join(OUTPUT_DIR, "mathematics-source-extended.csv")
    with open(extended_path, "w", newline="", encoding="utf-8") as f:
        f.write(extended_csv_data)
    print(f"Extended CSV: {extended_path}")

    # Validate
    print("\nValidation:")
    validate_csv(import_csv, "import")
    validate_csv(extended_csv_data, "extended")

    # Summary
    print(f"\nSummary:")
    print(f"  Grade: {GRADE}")
    print(f"  Subject: {SUBJECT}")
    print(f"  Strands: {len(set(l['strand'] for l in lessons))}")
    print(f"  Sub-strands: {len(set(l['sub_strand'] for l in lessons))}")
    print(f"  Quests: {len(set(l['quest_title'] for l in lessons))}")
    print(f"  Lessons: {len(lessons)}")
    print(f"  Source: SEED_DATA (needs official CBC/KICD verification)")


if __name__ == "__main__":
    main()
