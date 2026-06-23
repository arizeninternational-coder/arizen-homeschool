#!/usr/bin/env python3
"""
Grade 2 Mathematics Journey Validation Report
Scans all Grade 2 Math lessons and reports:
- Placeholder journeys
- Duplicate journeys
- Missing journeys (empty live + empty draft)
- Empty Learn steps
- Empty Example steps
- Weak Practice steps
- Invalid Quick Checks
- Lessons where live and draft are inconsistent
"""
import json, pathlib, urllib.request, re, sys

env_path = pathlib.Path(r"C:\Users\Victor\Arizen Homeschool\.env")
anon_key = None
for line in env_path.read_text().splitlines():
    if line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
        anon_key = line.split("=", 1)[1].strip()
        break

SUPABASE_URL = "https://hgufndnqbvcukbxmwtvo.supabase.co"

CONTAMINATION_PHRASES = [
    "reading comprehension", "main idea", "read a short passage",
    "good readers", "reading passage", "passage about",
    "tell the main idea", "what the story is mostly about",
]

PLACEHOLDER_PATTERNS = [
    r"\[content based on source pack\]",
    r"\[detailed teaching content",
    r"\[example to be added",
    r"\[example for",
    r"\[practice question",
    r"\[detailed content",
    r"\[content to be added",
    r"\[topic\]",
    r"\[title\]",
    r"\[concept\]",
    r"\[learning outcome\]",
    r"\[strand\]",
    r"\[sub-strand\]",
    r"\[grade\]",
    r"\[subject\]",
    r"\[step \d+\]",
    r"\[step type\]",
    r"\[interaction type\]",
    r"\[correct answer\]",
    r"\[explanation\]",
    r"\[hint\]",
    r"\[prompt\]",
    r"\[option \d+\]",
    r"\[fill in the blank\]",
    r"\[insert",
    r"\[add .+ here\]",
    r"\[write .+ here\]",
    r"\[describe",
    r"\[explain",
    r"\[list",
    r"\[provide",
    r"\[include",
    r"\[create",
    r"\[design",
    r"\[develop",
    r"todo[:\s]",
    r"placeholder",
    r"lorem ipsum",
    r"xxx+",
    r"yyy+",
    r"zzz+",
    r"\btbd\b",
    r"\btba\b",
    r"coming soon",
    r"under construction",
    r"work in progress",
    r"\bwip\b",
]

def has_placeholder(text):
    for pattern in PLACEHOLDER_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def has_contamination(text):
    text_lower = text.lower()
    return [p for p in CONTAMINATION_PHRASES if p in text_lower]

def jaccard_similarity(a, b):
    if not a or not b:
        return 0.0
    words_a = set(a.lower().split())
    words_b = set(b.lower().split())
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union) if union else 0.0

# ── Fetch all Grade 2 Math lessons ──────────────────────────────────────────

print("Fetching Grade 2 Math lessons from Supabase...")
url = f"{SUPABASE_URL}/rest/v1/Lesson?select=id,title,slug,status,isAvailable,contentBlocks&limit=200"
req = urllib.request.Request(url, headers={
    "apikey": anon_key, "Authorization": f"Bearer {anon_key}", "Accept": "application/json",
})
resp = urllib.request.urlopen(req, timeout=15)
all_lessons = json.loads(resp.read())

# Filter for Grade 2 Math
math_lessons = []
for l in all_lessons:
    cb = l.get("contentBlocks", "{}")
    if isinstance(cb, str):
        try: cb = json.loads(cb)
        except: cb = {}
    if not isinstance(cb, dict): cb = {}
    
    subject = cb.get("curriculum", {}).get("subject", "") or cb.get("subject", "")
    grade = cb.get("curriculum", {}).get("grade", "") or cb.get("grade", "")
    title = l.get("title", "")
    
    is_math = (
        "math" in subject.lower() or "Mathematics" in subject or
        any(kw in title.lower() for kw in ["number", "addition", "subtraction", "fraction",
        "multiplication", "division", "counting", "place value", "measurement", "money",
        "time", "geometry", "shape", "length", "mass", "capacity", "data", "pattern",
        "rounding", "comparing", "word problem", "digit", "measuring", "kilogram", "metre", "skip",
        "ordering"])
    )
    is_grade_2 = str(grade) == "2"
    
    if is_math and is_grade_2:
        live = cb.get("studentJourney", [])
        draft = cb.get("studentJourneyDraft", [])
        if not isinstance(live, list): live = []
        if not isinstance(draft, list): draft = []
        
        math_lessons.append({
            "id": l["id"],
            "title": title,
            "slug": l.get("slug", ""),
            "status": l.get("status", ""),
            "isAvailable": l.get("isAvailable"),
            "live": live,
            "draft": draft,
            "live_steps": len(live),
            "draft_steps": len(draft),
            "ai_metadata": cb.get("aiMetadata", {}),
        })

print(f"Found {len(math_lessons)} Grade 2 Math lessons\n")

# ── Run validations ─────────────────────────────────────────────────────────

placeholder_journeys = []
duplicate_pairs = []
missing_journeys = []
empty_learn = []
empty_example = []
weak_practice = []
invalid_qc = []
inconsistent_live_draft = []

# For duplicate detection
all_journeys_text = []

for lesson in math_lessons:
    live = lesson["live"]
    draft = lesson["draft"]
    
    # Check live journey
    if live:
        live_text = json.dumps(live)
        
        # Placeholder check
        if has_placeholder(live_text):
            placeholder_journeys.append({
                "id": lesson["id"],
                "title": lesson["title"],
                "field": "live",
                "status": lesson["status"],
            })
        
        # Contamination check
        contam = has_contamination(live_text)
        if contam:
            placeholder_journeys.append({
                "id": lesson["id"],
                "title": lesson["title"],
                "field": "live (contamination)",
                "status": lesson["status"],
                "contamination": contam,
            })
        
        # Empty Learn step
        learn_steps = [s for s in live if s.get("stepType") == "learn"]
        if learn_steps:
            learn_text = (learn_steps[0].get("studentText") or "").strip()
            if len(learn_text) < 50 or has_placeholder(learn_text):
                empty_learn.append({
                    "id": lesson["id"],
                    "title": lesson["title"],
                    "learn_length": len(learn_text),
                    "has_placeholder": has_placeholder(learn_text),
                })
        
        # Empty Example step
        example_steps = [s for s in live if s.get("stepType") == "example"]
        if example_steps:
            example_text = (example_steps[0].get("studentText") or "").strip()
            if len(example_text) < 50 or has_placeholder(example_text):
                empty_example.append({
                    "id": lesson["id"],
                    "title": lesson["title"],
                    "example_length": len(example_text),
                    "has_placeholder": has_placeholder(example_text),
                })
        
        # Weak Practice step
        practice_steps = [s for s in live if s.get("stepType") == "practice"]
        if practice_steps:
            practice_text = (practice_steps[0].get("studentText") or "").strip()
            task_count = len(re.findall(r'\d+[\.\)]', practice_text)) + practice_text.count('?')
            if len(practice_text) < 30 or task_count < 2:
                weak_practice.append({
                    "id": lesson["id"],
                    "title": lesson["title"],
                    "practice_length": len(practice_text),
                    "task_count": task_count,
                })
        
        # Invalid Quick Check
        qc_steps = [s for s in live if s.get("stepType") == "quick_check"]
        if qc_steps:
            qc = qc_steps[0]
            ix = qc.get("interaction", {})
            qc_errors = []
            if ix.get("type") != "multiple_choice":
                qc_errors.append(f"type={ix.get('type')}")
            options = ix.get("options", [])
            if len(options) < 2:
                qc_errors.append(f"options={len(options)}")
            correct = ix.get("correctIndex")
            if not isinstance(correct, int) or correct < 0 or correct >= len(options):
                qc_errors.append(f"correctIndex={correct}")
            if qc_errors:
                invalid_qc.append({
                    "id": lesson["id"],
                    "title": lesson["title"],
                    "errors": qc_errors,
                })
    
    # Check draft journey
    if draft:
        draft_text = json.dumps(draft)
        if has_placeholder(draft_text):
            placeholder_journeys.append({
                "id": lesson["id"],
                "title": lesson["title"],
                "field": "draft",
                "status": lesson["status"],
            })
    
    # Missing journey (both empty)
    if len(live) == 0 and len(draft) == 0:
        missing_journeys.append({
            "id": lesson["id"],
            "title": lesson["title"],
            "status": lesson["status"],
        })
    
    # Inconsistent live/draft
    if live and draft:
        live_student = " ".join([s.get("studentText", "") for s in live])
        draft_student = " ".join([s.get("studentText", "") for s in draft])
        similarity = jaccard_similarity(live_student, draft_student)
        if similarity > 0.8:
            duplicate_pairs.append({
                "id": lesson["id"],
                "title": lesson["title"],
                "similarity": round(similarity, 2),
                "type": "live≈draft",
            })
    
    # Store for cross-lesson duplicate detection
    if live:
        live_student = " ".join([s.get("studentText", "") for s in live])
        all_journeys_text.append({
            "id": lesson["id"],
            "title": lesson["title"],
            "text": live_student[:500],
        })

# Cross-lesson duplicate detection
for i in range(len(all_journeys_text)):
    for j in range(i + 1, len(all_journeys_text)):
        a = all_journeys_text[i]
        b = all_journeys_text[j]
        if len(a["text"]) > 50 and len(b["text"]) > 50:
            sim = jaccard_similarity(a["text"], b["text"])
            if sim > 0.7:
                duplicate_pairs.append({
                    "id_1": a["id"],
                    "title_1": a["title"],
                    "id_2": b["id"],
                    "title_2": b["title"],
                    "similarity": round(sim, 2),
                    "type": "cross-lesson",
                })

# ── Print Report ─────────────────────────────────────────────────────────────

print("=" * 80)
print("GRADE 2 MATHEMATICS — JOURNEY VALIDATION REPORT")
print("=" * 80)

print(f"\nTotal Grade 2 Math lessons: {len(math_lessons)}")
print(f"Lessons with live journeys: {sum(1 for l in math_lessons if l['live_steps'] > 0)}")
print(f"Lessons with draft journeys: {sum(1 for l in math_lessons if l['draft_steps'] > 0)}")

print(f"\n{'─' * 80}")
print(f"PLACEHOLDER JOURNEYS: {len(placeholder_journeys)}")
print(f"{'─' * 80}")
for p in placeholder_journeys:
    print(f"  [{p['field']}] {p['title'][:60]} ({p['id'][:8]}...)")

print(f"\n{'─' * 80}")
print(f"DUPLICATE JOURNEYS: {len(duplicate_pairs)}")
print(f"{'─' * 80}")
for d in duplicate_pairs:
    if d["type"] == "live≈draft":
        print(f"  Live≈Draft: {d['title'][:60]} (sim={d['similarity']})")
    else:
        print(f"  Cross-lesson: '{d['title_1'][:40]}' ≈ '{d['title_2'][:40]}' (sim={d['similarity']})")

print(f"\n{'─' * 80}")
print(f"MISSING JOURNEYS (no live, no draft): {len(missing_journeys)}")
print(f"{'─' * 80}")
for m in missing_journeys:
    print(f"  [{m['status']}] {m['title'][:60]}")

print(f"\n{'─' * 80}")
print(f"EMPTY/WEAK LEARN STEPS: {len(empty_learn)}")
print(f"{'─' * 80}")
for e in empty_learn:
    print(f"  {e['title'][:60]} (len={e['learn_length']}, placeholder={e['has_placeholder']})")

print(f"\n{'─' * 80}")
print(f"EMPTY/WEAK EXAMPLE STEPS: {len(empty_example)}")
print(f"{'─' * 80}")
for e in empty_example:
    print(f"  {e['title'][:60]} (len={e['example_length']}, placeholder={e['has_placeholder']})")

print(f"\n{'─' * 80}")
print(f"WEAK PRACTICE STEPS: {len(weak_practice)}")
print(f"{'─' * 80}")
for w in weak_practice:
    print(f"  {w['title'][:60]} (len={w['practice_length']}, tasks={w['task_count']})")

print(f"\n{'─' * 80}")
print(f"INVALID QUICK CHECKS: {len(invalid_qc)}")
print(f"{'─' * 80}")
for q in invalid_qc:
    print(f"  {q['title'][:60]} (errors: {q['errors']})")

# ── Summary ──────────────────────────────────────────────────────────────────

print(f"\n{'=' * 80}")
print("SUMMARY")
print(f"{'=' * 80}")
print(f"  Placeholder journeys:    {len(placeholder_journeys)}")
print(f"  Duplicate journeys:      {len(duplicate_pairs)}")
print(f"  Missing journeys:        {len(missing_journeys)}")
print(f"  Empty Learn steps:       {len(empty_learn)}")
print(f"  Empty Example steps:     {len(empty_example)}")
print(f"  Weak Practice steps:     {len(weak_practice)}")
print(f"  Invalid Quick Checks:    {len(invalid_qc)}")
print(f"  ─────────────────────────────────")
total_issues = (len(placeholder_journeys) + len(duplicate_pairs) + len(missing_journeys) +
                len(empty_learn) + len(empty_example) + len(weak_practice) + len(invalid_qc))
print(f"  TOTAL ISSUES:            {total_issues}")

# Save JSON report
report = {
    "summary": {
        "total_lessons": len(math_lessons),
        "with_live": sum(1 for l in math_lessons if l["live_steps"] > 0),
        "with_draft": sum(1 for l in math_lessons if l["draft_steps"] > 0),
        "placeholder_journeys": len(placeholder_journeys),
        "duplicate_journeys": len(duplicate_pairs),
        "missing_journeys": len(missing_journeys),
        "empty_learn": len(empty_learn),
        "empty_example": len(empty_example),
        "weak_practice": len(weak_practice),
        "invalid_qc": len(invalid_qc),
        "total_issues": total_issues,
    },
    "placeholder_journeys": placeholder_journeys,
    "duplicate_pairs": duplicate_pairs,
    "missing_journeys": missing_journeys,
    "empty_learn": empty_learn,
    "empty_example": empty_example,
    "weak_practice": weak_practice,
    "invalid_qc": invalid_qc,
}

with open(r"C:\Users\Victor\Arizen Homeschool\docs\audits\grade-2-math-validation-report.json", "w") as f:
    json.dump(report, f, indent=2)

print(f"\nJSON report saved to: docs/audits/grade-2-math-validation-report.json")
