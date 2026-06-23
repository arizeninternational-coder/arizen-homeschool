"""
validate-interactive-journey-fixture.py

Validates a journey fixture against Journey Output Schema v1.
Checks structure, required fields, allowed types, content quality, and media safety.

Usage:
    python scripts/validate-interactive-journey-fixture.py
"""

import json
import re
import sys
from pathlib import Path

# ── Schema Constants ─────────────────────────────────────────────────────────

REQUIRED_STEP_KEYS = [
    "welcome", "mission", "think_first", "learn", "connect",
    "example", "practice", "quick_check", "reflect",
    "complete",
]

ALLOWED_VISUAL_SPEC_TYPES = [
    "fraction_circle", "fraction_rectangle", "step_reveal", "choice_grid",
    "checklist", "practice_set", "real_life_fraction", "recap_checklist",
    "reflection_card", "reward_animation",
]

ALLOWED_INTERACTION_SPEC_TYPES = [
    "tap_continue", "tap_choice", "multiple_choice", "step_reveal",
    "tap_region", "shade_shape", "multi_activity", "reflection_chips",
    "open_response", "short_response",
]

INTERACTIVE_TYPES_REQUIRING_FEEDBACK = {
    "tap_choice", "multiple_choice", "tap_region", "shade_shape",
    "multi_activity", "reflection_chips",
}

PLACEHOLDER_PATTERNS = [
    re.compile(r"\[content based on source pack\]", re.IGNORECASE),
    re.compile(r"\[detailed teaching content", re.IGNORECASE),
    re.compile(r"\[example to be added", re.IGNORECASE),
    re.compile(r"\[practice question", re.IGNORECASE),
    re.compile(r"\[detailed content", re.IGNORECASE),
    re.compile(r"\[content to be added", re.IGNORECASE),
    re.compile(r"\[topic\]", re.IGNORECASE),
    re.compile(r"\[title\]", re.IGNORECASE),
    re.compile(r"\[concept\]", re.IGNORECASE),
    re.compile(r"\[learning outcome\]", re.IGNORECASE),
    re.compile(r"\[strand\]", re.IGNORECASE),
    re.compile(r"\[sub-strand\]", re.IGNORECASE),
    re.compile(r"\[grade\]", re.IGNORECASE),
    re.compile(r"\[subject\]", re.IGNORECASE),
    re.compile(r"\[step \d+\]", re.IGNORECASE),
    re.compile(r"\[step type\]", re.IGNORECASE),
    re.compile(r"\[interaction type\]", re.IGNORECASE),
    re.compile(r"\[correct answer\]", re.IGNORECASE),
    re.compile(r"\[explanation\]", re.IGNORECASE),
    re.compile(r"\[hint\]", re.IGNORECASE),
    re.compile(r"\[prompt\]", re.IGNORECASE),
    re.compile(r"\[option \d+\]", re.IGNORECASE),
    re.compile(r"\[fill in the blank\]", re.IGNORECASE),
    re.compile(r"\[insert", re.IGNORECASE),
    re.compile(r"\[add .+ here\]", re.IGNORECASE),
    re.compile(r"\[write .+ here\]", re.IGNORECASE),
    re.compile(r"\[describe", re.IGNORECASE),
    re.compile(r"\[explain", re.IGNORECASE),
    re.compile(r"\[list", re.IGNORECASE),
    re.compile(r"\[provide", re.IGNORECASE),
    re.compile(r"\[include", re.IGNORECASE),
    re.compile(r"\[create", re.IGNORECASE),
    re.compile(r"\[design", re.IGNORECASE),
    re.compile(r"\[develop", re.IGNORECASE),
    re.compile(r"todo[: ]", re.IGNORECASE),
    re.compile(r"placeholder", re.IGNORECASE),
    re.compile(r"lorem ipsum", re.IGNORECASE),
    re.compile(r"xxx+", re.IGNORECASE),
    re.compile(r"yyy+", re.IGNORECASE),
    re.compile(r"zzz+", re.IGNORECASE),
    re.compile(r"tbd", re.IGNORECASE),
    re.compile(r"tba", re.IGNORECASE),
    re.compile(r"coming soon", re.IGNORECASE),
    re.compile(r"under construction", re.IGNORECASE),
    re.compile(r"work in progress", re.IGNORECASE),
    re.compile(r"wip", re.IGNORECASE),
]

EXAMPLE_STRUCTURE_PATTERNS = [
    re.compile(r"step\s*\d", re.IGNORECASE),
    re.compile(r"→"),
    re.compile(r"->"),
    re.compile(r"^\d+[.)]", re.MULTILINE),
    re.compile(r"\b(first|then|next|finally|lastly)\b", re.IGNORECASE),
]


# ── Validator ────────────────────────────────────────────────────────────────

def validate_journey(fixture_path: str):
    errors = []
    warnings = []

    # Load fixture
    try:
        with open(fixture_path, "r", encoding="utf-8") as f:
            fixture = json.load(f)
    except Exception as e:
        return [f"Failed to load fixture: {e}"], [], False

    journey = fixture.get("contentBlocks", {}).get("studentJourney", [])

    if not journey:
        errors.append("Journey has no steps.")
        return errors, warnings, False

    # ── 1. Structure Validation ──────────────────────────────────────────────

    if len(journey) != 10:
        errors.append(f"Expected 10 steps, got {len(journey)}.")

    actual_keys = [s.get("stepKey") for s in journey]
    for i in range(max(len(actual_keys), len(REQUIRED_STEP_KEYS))):
        expected = REQUIRED_STEP_KEYS[i] if i < len(REQUIRED_STEP_KEYS) else None
        actual = actual_keys[i] if i < len(actual_keys) else None
        if expected and not actual:
            errors.append(f"[position {i + 1}] Missing step: expected '{expected}'.")
        elif expected and actual and actual != expected:
            errors.append(f"[position {i + 1}] Step has key '{actual}' but expected '{expected}'.")

    # ── 2. Per-Step Validation ───────────────────────────────────────────────

    for step in journey:
        step_key = step.get("stepKey") or step.get("id") or "unknown"

        # Required fields
        for field in ["stepKey", "stepType", "title", "studentText", "owlText", "content", "successCriteria"]:
            val = step.get(field)
            if not val or (isinstance(val, str) and val.strip() == ""):
                errors.append(f"[{step_key}] Missing required field: {field}")

        # Legacy interaction
        if not step.get("interaction"):
            errors.append(f"[{step_key}] Missing legacy interaction object.")

        # Legacy media
        if not step.get("media"):
            warnings.append(f"[{step_key}] Missing legacy media object.")

        # visualSpec type
        vs = step.get("visualSpec")
        if vs and vs.get("type") not in ALLOWED_VISUAL_SPEC_TYPES:
            errors.append(f"[{step_key}] Unsupported visualSpec.type: '{vs.get('type')}'. Allowed: {', '.join(ALLOWED_VISUAL_SPEC_TYPES)}")

        # interactionSpec type
        iss = step.get("interactionSpec")
        if iss:
            if iss.get("type") not in ALLOWED_INTERACTION_SPEC_TYPES:
                errors.append(f"[{step_key}] Unsupported interactionSpec.type: '{iss.get('type')}'. Allowed: {', '.join(ALLOWED_INTERACTION_SPEC_TYPES)}")

            # Feedback required
            if iss.get("type") in INTERACTIVE_TYPES_REQUIRING_FEEDBACK:
                fb = step.get("feedbackSpec", {})
                if not fb.get("correct") or fb.get("correct", "").strip() == "":
                    errors.append(f"[{step_key}] feedbackSpec.correct is required for interactionSpec.type '{iss.get('type')}'")

            # Multiple choice
            if iss.get("type") == "multiple_choice":
                opts = iss.get("options", [])
                if len(opts) < 2:
                    errors.append(f"[{step_key}] multiple_choice requires at least 2 options, got {len(opts)}.")
                if iss.get("correctIndex") is None and iss.get("correctAnswer") is None:
                    errors.append(f"[{step_key}] multiple_choice requires correctIndex.")

            # multi_activity
            if iss.get("type") == "multi_activity":
                activities = iss.get("activities", [])
                if len(activities) == 0:
                    errors.append(f"[{step_key}] multi_activity requires at least 1 activity.")
                for act in activities:
                    if act.get("type") not in ALLOWED_INTERACTION_SPEC_TYPES:
                        errors.append(f"[{step_key}] Unsupported activity type: '{act.get('type')}'")

            # shade_shape
            if iss.get("type") == "shade_shape":
                if not iss.get("shape"):
                    warnings.append(f"[{step_key}] shade_shape has no shape defined.")
                if iss.get("requiredShadedParts") is None:
                    warnings.append(f"[{step_key}] shade_shape has no requiredShadedParts.")

        # ── 3. Content Quality ──────────────────────────────────────────────────

        all_text = f"{step.get('studentText', '')} {step.get('content', '')} {step.get('owlText', '')}"

        for pattern in PLACEHOLDER_PATTERNS:
            match = pattern.search(all_text)
            if match:
                errors.append(f"[{step_key}] Placeholder text found: '{match.group(0)}'")
                break  # One placeholder error per step is enough

        # Learn step depth
        if step_key == "learn":
            content_text = step.get("content", "") or step.get("studentText", "")
            meaningful_lines = [l for l in content_text.split("\n") if len(l.strip()) > 10]
            # If content has no newlines, count sentences as fallback
            if len(meaningful_lines) < 2:
                sentences = [s for s in re.split(r'[.!?]+', content_text) if len(s.strip()) > 10]
                if len(sentences) < 2:
                    errors.append(f"[{step_key}] Learn step has only {len(meaningful_lines)} meaningful line(s) and {len(sentences)} sentence(s). Minimum is 2.")

        # Example step structure
        if step_key == "example":
            content_text = step.get("content", "") or step.get("studentText", "")
            has_structure = any(p.search(content_text) for p in EXAMPLE_STRUCTURE_PATTERNS)
            if not has_structure:
                warnings.append(f"[{step_key}] Example step may lack step-by-step structure.")

        # Title-content match
        if step.get("title") and step.get("content") and step["content"].strip() == step["title"].strip():
            warnings.append(f"[{step_key}] Content is identical to title.")

        # ── 4. Media Safety ─────────────────────────────────────────────────────

        ms = step.get("mediaSpec", {})
        if ms:
            if ms.get("type") == "video" and ms.get("reviewStatus") == "approved":
                if not ms.get("url") or ms.get("url", "").strip() == "":
                    errors.append(f"[{step_key}] Video is marked approved but URL is empty.")

            if ms.get("type") == "image" and not ms.get("altText"):
                warnings.append(f"[{step_key}] Image mediaSpec should include altText.")

        # ── 5. Fractions-Specific ────────────────────────────────────────────────

        is_fractions = any(w in all_text.lower() for w in ["half", "fraction", "quarter"])
        if is_fractions and step_key in ("learn", "example", "connect"):
            if "equal" not in all_text.lower():
                warnings.append(f"[{step_key}] Fractions step does not mention 'equal parts'.")

    return errors, warnings, len(errors) == 0


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    fixture_path = Path(__file__).parent.parent / "src" / "data" / "fixtures" / "gold-standard-fractions.json"

    print("═══════════════════════════════════════════════════════════")
    print("  Journey Output Schema v1 — Fixture Validator")
    print("═══════════════════════════════════════════════════════════")
    print(f"  Fixture: {fixture_path}")
    print("───────────────────────────────────────────────────────────")

    errors, warnings, valid = validate_journey(str(fixture_path))

    if errors:
        print(f"\n❌ ERRORS ({len(errors)}):")
        for i, e in enumerate(errors, 1):
            print(f"  {i}. {e}")

    if warnings:
        print(f"\n⚠️  WARNINGS ({len(warnings)}):")
        for i, w in enumerate(warnings, 1):
            print(f"  {i}. {w}")

    print("\n───────────────────────────────────────────────────────────")
    if valid:
        print(f"✅ PASSED. {len(warnings)} warning(s).")
    else:
        print(f"❌ FAILED. {len(errors)} error(s), {len(warnings)} warning(s).")
    print("═══════════════════════════════════════════════════════════\n")

    sys.exit(0 if valid else 1)


if __name__ == "__main__":
    main()
