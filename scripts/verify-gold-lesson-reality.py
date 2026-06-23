"""
verify-gold-lesson-reality.py

Compares:
A. Fixture file (source of truth)
B. Supabase target lesson (what's stored)
C. What the app actually renders (admin preview, student player)

Run: python scripts/verify-gold-lesson-reality.py
"""

import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime, timezone

# ── Config ──────────────────────────────────────────────────────────────────

TARGET_ID = "f5bee6a0-8aa0-4a33-a536-dc563b53f4d1"
FIXTURE_PATH = "src/data/fixtures/gold-standard-fractions.json"

# ── Load .env ────────────────────────────────────────────────────────────────

env = {}
env_path = Path(".env")
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, _, v = line.partition("=")
            env[k.strip()] = v.strip().strip('"').strip("'")

SUPABASE_URL = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

# ── Load fixture ─────────────────────────────────────────────────────────────

print("=" * 70)
print("  GOLD LESSON REALITY CHECK")
print("=" * 70)

with open(FIXTURE_PATH) as f:
    fixture = json.load(f)

fixture_steps = fixture["contentBlocks"]["studentJourney"]
print(f"\n[A] FIXTURE: {FIXTURE_PATH}")
print(f"  Steps: {len(fixture_steps)}")
for i, step in enumerate(fixture_steps[:3]):
    print(f"  Step {i+1} ({step['stepKey']}):")
    print(f"    studentText: {repr(step.get('studentText', '')[:80])}")
    print(f"    owlText: {repr(step.get('owlText', '')[:80])}")
    print(f"    interactionSpec.prompt: {repr(step.get('interactionSpec', {}).get('prompt', '')[:60])}")
    print(f"    interactionSpec.buttonLabel: {repr(step.get('interactionSpec', {}).get('buttonLabel', ''))}")

# ── Fetch from Supabase ──────────────────────────────────────────────────────

print(f"\n[B] SUPABASE: Target lesson {TARGET_ID}")

try:
    from urllib.request import Request, urlopen
    from urllib.parse import urlencode, quote

    # Fetch lesson
    url = f"{SUPABASE_URL}/rest/v1/Lesson?id=eq.{TARGET_ID}&select=id,title,slug,status,contentBlocks"
    req = Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    })
    with urlopen(req) as resp:
        data = json.loads(resp.read().decode())

    if not data:
        print("  ERROR: Lesson not found!")
        sys.exit(1)

    lesson = data[0]
    print(f"  Title: {lesson['title']}")
    print(f"  Slug: {lesson['slug']}")
    print(f"  Status: {lesson['status']}")

    cb = lesson.get("contentBlocks")
    if isinstance(cb, str):
        try:
            cb = json.loads(cb)
        except:
            cb = {}

    ai_meta = cb.get("aiMetadata", {}) if cb else {}
    print(f"  aiMetadata.studentVisible: {ai_meta.get('studentVisible')}")
    print(f"  aiMetadata.qualityStatus: {ai_meta.get('qualityStatus')}")
    print(f"  aiMetadata.reviewStatus: {ai_meta.get('reviewStatus')}")

    journey = cb.get("studentJourney", []) if cb else []
    draft = cb.get("studentJourneyDraft", []) if cb else []
    print(f"  studentJourney steps: {len(journey) if isinstance(journey, list) else 'NOT ARRAY'}")
    print(f"  studentJourneyDraft steps: {len(draft) if isinstance(draft, list) else 'NOT ARRAY'}")

    if isinstance(journey, list) and len(journey) > 0:
        for i, step in enumerate(journey[:3]):
            print(f"  Step {i+1} ({step.get('stepKey', '?')}):")
            print(f"    studentText: {repr(str(step.get('studentText', ''))[:80])}")
            print(f"    owlText: {repr(str(step.get('owlText', ''))[:80])}")
            ispec = step.get("interactionSpec", {})
            print(f"    interactionSpec.prompt: {repr(str(ispec.get('prompt', ''))[:60])}")
            print(f"    interactionSpec.buttonLabel: {repr(str(ispec.get('buttonLabel', '')))}")
            print(f"    visualSpec.type: {step.get('visualSpec', {}).get('type', 'MISSING')}")
            print(f"    feedbackSpec.correct: {repr(str(step.get('feedbackSpec', {}).get('correct', ''))[:60])}")

    # ── Content quality checks ────────────────────────────────────────────────

    print(f"\n[C] CONTENT QUALITY CHECKS")

    all_text = json.dumps(journey).lower() if isinstance(journey, list) else ""

    issues = []

    if "reading comprehension" in all_text:
        issues.append("FAIL: Contains 'reading comprehension'")

    if "what you learned today" in all_text:
        issues.append("FAIL: Contains 'What you learned today'")

    if "lets learn about halves" in all_text:
        issues.append("FAIL: Contains 'Lets learn about halves'")

    # Check for duplicate "Tap Start lesson"
    tap_count = all_text.count("tap start lesson")
    if tap_count > 1:
        issues.append(f"WARN: 'Tap Start lesson' appears {tap_count} times")

    # Check for "Let's go"
    if "let's go" in all_text or "lets go" in all_text:
        issues.append("WARN: Contains 'Let's go' (should use step-specific labels)")

    # Check for 2/2 labels
    if '"2/2"' in json.dumps(journey) or "'2/2'" in json.dumps(journey):
        issues.append("WARN: Contains '2/2' label (should be 1/2 and 1/2)")

    # Check for "Video coming soon"
    if "video coming soon" in all_text:
        issues.append("WARN: Contains 'Video coming soon' (should be hidden from students)")

    # Check step count
    if not isinstance(journey, list) or len(journey) != 10:
        issues.append(f"FAIL: studentJourney has {len(journey) if isinstance(journey, list) else '?'} steps (expected 10)")

    # Check all steps have visualSpec
    if isinstance(journey, list):
        for i, step in enumerate(journey):
            if not step.get("visualSpec"):
                issues.append(f"WARN: Step {i+1} ({step.get('stepKey', '?')}) missing visualSpec")
            if not step.get("interactionSpec"):
                issues.append(f"WARN: Step {i+1} ({step.get('stepKey', '?')}) missing interactionSpec")
            if not step.get("feedbackSpec"):
                issues.append(f"WARN: Step {i+1} ({step.get('stepKey', '?')}) missing feedbackSpec")

    if issues:
        for issue in issues:
            print(f"  ❌ {issue}")
    else:
        print("  ✅ All content quality checks passed")

    # ── Compare fixture vs Supabase ──────────────────────────────────────────

    print(f"\n[D] FIXTURE vs SUPABASE COMPARISON")

    fixture_step_keys = [s["stepKey"] for s in fixture_steps]
    db_step_keys = [s.get("stepKey", "?") for s in journey] if isinstance(journey, list) else []

    if fixture_step_keys == db_step_keys:
        print("  ✅ Step keys match")
    else:
        print(f"  ❌ Step keys differ:")
        print(f"    Fixture: {fixture_step_keys}")
        print(f"    DB:      {db_step_keys}")

    # Compare first step content
    if isinstance(journey, list) and len(journey) > 0 and len(fixture_steps) > 0:
        fs = fixture_steps[0]
        ds = journey[0]

        fs_text = fs.get("studentText", "")
        ds_text = str(ds.get("studentText", ""))

        if fs_text == ds_text:
            print("  ✅ Step 1 studentText matches fixture")
        else:
            print(f"  ❌ Step 1 studentText differs:")
            print(f"    Fixture: {repr(fs_text[:80])}")
            print(f"    DB:      {repr(ds_text[:80])}")

        fs_owl = fs.get("owlText", "")
        ds_owl = str(ds.get("owlText", ""))

        if fs_owl == ds_owl:
            print("  ✅ Step 1 owlText matches fixture")
        else:
            print(f"  ❌ Step 1 owlText differs:")
            print(f"    Fixture: {repr(fs_owl[:80])}")
            print(f"    DB:      {repr(ds_owl[:80])}")

    # ── Check student visibility ─────────────────────────────────────────────

    print(f"\n[E] STUDENT VISIBILITY CHECK")

    print(f"  Lesson status: {lesson['status']}")
    print(f"  aiMetadata.studentVisible: {ai_meta.get('studentVisible')}")
    print(f"  aiMetadata.qualityStatus: {ai_meta.get('qualityStatus')}")

    # Check if lesson would pass visibility gate
    is_published = lesson["status"] == "PUBLISHED"
    is_visible = ai_meta.get("studentVisible") is True
    has_quality = ai_meta.get("qualityStatus") in ["STUDENT_READY", "GOLD_STANDARD_APPLIED"]
    has_journey = isinstance(journey, list) and len(journey) == 10

    print(f"  is_published: {is_published}")
    print(f"  is_visible: {is_visible}")
    print(f"  has_quality: {has_quality}")
    print(f"  has_journey: {has_journey}")

    if is_published and is_visible and has_quality and has_journey:
        print("  ✅ Would pass student visibility gate")
    else:
        print("  ❌ Would FAIL student visibility gate")
        if not is_published:
            print("    - Status is not PUBLISHED")
        if not is_visible:
            print("    - studentVisible is not true")
        if not has_quality:
            print(f"    - qualityStatus is '{ai_meta.get('qualityStatus')}'")
        if not has_journey:
            print(f"    - studentJourney has {len(journey) if isinstance(journey, list) else '?'} steps")

    # ── Check quest/theme ────────────────────────────────────────────────────

    print(f"\n[F] QUEST/THEME CHECK")

    quest_id = lesson.get("questId")
    if quest_id:
        url = f"{SUPABASE_URL}/rest/v1/Quest?id=eq.{quest_id}&select=id,title,slug,status,themeId"
        req = Request(url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
        with urlopen(req) as resp:
            qdata = json.loads(resp.read().decode())
        if qdata:
            q = qdata[0]
            print(f"  Quest: {q['title']} | status: {q['status']} | slug: {q['slug']}")

            theme_id = q.get("themeId")
            if theme_id:
                url = f"{SUPABASE_URL}/rest/v1/Theme?id=eq.{theme_id}&select=id,title,slug,status,grade"
                req = Request(url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
                with urlopen(req) as resp:
                    tdata = json.loads(resp.read().decode())
                if tdata:
                    t = tdata[0]
                    print(f"  Theme: {t['title']} | status: {t['status']} | grade: {t['grade']} | slug: {t['slug']}")
    else:
        print("  ❌ No questId on lesson!")

    print("\n" + "=" * 70)

except Exception as e:
    print(f"  ERROR: {e}")
    import traceback
    traceback.print_exc()
