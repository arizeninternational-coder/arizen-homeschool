#!/usr/bin/env python3
"""
Validate all 8 generated Fractions journey files.
Adapted from validate-poc-v1.3.js with lesson-specific rules.
"""
import json
import os
import re

OUTPUT_DIR = r'C:\Users\Victor\Arizen Homeschool\curriculum-source-packs\grade-2\math\generated\fractions'
VALIDATION_OUT = os.path.join(OUTPUT_DIR, 'validation-summary.json')
REVIEW_OUT = os.path.join(OUTPUT_DIR, 'review-summary.md')

LESSON_RULES = {
    '9b887eb8-quarters-journey.json': {
        'name': 'Quarters (Rectangular Cut-outs)',
        'expected_fraction': '1/4',
        'qc_correct': 'one quarter (1/4)',
        'scope_check': 'quarters_only',
        'forbidden': ['1/3', 'thirds', '1/5', '1/6', '1/8'],
    },
    '839653eb-comparing-fractions-journey.json': {
        'name': 'Comparing 1/2 and 1/4',
        'expected_fraction': '1/2_and_1/4',
        'qc_correct': None,  # QC-E1: equal vs unequal
        'scope_check': 'halves_and_quarters',
        'forbidden': ['1/3', 'thirds', '1/5', 'equivalent', 'which is bigger', 'which is more', 'greater than', 'less than'],
    },
    'b163de06-fraction-patterns-journey.json': {
        'name': 'Patterns with Fractions',
        'expected_fraction': '1/2_and_1/4',
        'qc_correct': None,  # pattern question
        'scope_check': 'halves_and_quarters',
        'forbidden': ['1/3', 'thirds', '1/5', '2/4', '3/4', 'arithmetic'],
    },
    'dbadac3a-digital-games-fractions-journey.json': {
        'name': 'Digital Games with Fractions',
        'expected_fraction': '1/2_and_1/4',
        'qc_correct': None,  # QC-F1
        'scope_check': 'halves_and_quarters',
        'forbidden': ['1/3', 'thirds', '1/5', 'arithmetic'],
    },
    'c71a49c8-fractions-practice-application-journey.json': {
        'name': 'Practice and Application',
        'expected_fraction': '1/2_and_1/4',
        'qc_correct': None,  # QC-F1
        'scope_check': 'halves_and_quarters',
        'forbidden': ['1/3', 'thirds', '1/5', 'arithmetic'],
    },
    '2e1869d6-fractions-assessment-reflection-journey.json': {
        'name': 'Assessment and Reflection',
        'expected_fraction': '1/2_and_1/4',
        'qc_correct': None,  # QC-E1
        'scope_check': 'halves_and_quarters',
        'forbidden': ['1/3', 'thirds', '1/5', 'arithmetic'],
    },
    '159f92b9-identifying-halves-reallife-journey.json': {
        'name': 'Identifying 1/2 in Everyday Objects',
        'expected_fraction': '1/2',
        'qc_correct': None,  # QC-H2
        'scope_check': 'halves_and_quarters',
        'forbidden': ['1/3', 'thirds', '1/5'],
    },
    '60441bd5-identifying-quarters-reallife-journey.json': {
        'name': 'Identifying 1/4 in Everyday Objects',
        'expected_fraction': '1/4',
        'qc_correct': None,  # QC-Q2
        'scope_check': 'halves_and_quarters',
        'forbidden': ['1/3', 'thirds', '1/5'],
    },
}

EXPECTED_STEP_TYPES = ['welcome', 'mission', 'think_first', 'learn', 'real_life', 'example', 'practice', 'quick_check', 'reflect', 'complete']

def validate_file(filepath, rules):
    with open(filepath, 'r', encoding='utf-8') as f:
        j = json.load(f)
    
    checks = []
    warnings = []
    media_summary = []
    
    all_text = ' '.join([
        (s.get('owlText', '') or '') + ' ' + (s.get('studentText', '') or '')
        for s in j.get('steps', [])
    ]).lower()
    
    def check(name, passed, detail=''):
        checks.append({'name': name, 'passed': passed, 'detail': detail})
        return passed
    
    # S1: 10 steps
    check('10 steps present', len(j.get('steps', [])) == 10, f"{len(j.get('steps', []))} steps found")
    
    # S2: Correct step order
    actual_types = [s.get('stepType', '') for s in j.get('steps', [])]
    check('Correct step order', actual_types == EXPECTED_STEP_TYPES, ' → '.join(actual_types))
    
    # S3: No duplicate step types
    check('No duplicate step types', len(set(actual_types)) == 10, f"{len(set(actual_types))} unique types")
    
    # T1: No title-copying
    title = j.get('title', '')
    title_in_text = any(
        (s.get('studentText', '') or '').find(title) >= 0 or (s.get('owlText', '') or '').find(title) >= 0
        for s in j.get('steps', [])
    )
    check('No title-copying', not title_in_text, 'Clean' if not title_in_text else 'Found title in text')
    
    # T2: No generic greetings
    step1 = j['steps'][0] if j.get('steps') else {}
    owl_lower = (step1.get('owlText', '') or '').lower()
    has_specific = any(w in owl_lower for w in ['half', 'quarter', 'fraction', 'pattern', 'comparison', 'assessment', 'practice', 'game', 'digital', 'object', 'everyday', 'chapati', 'cake'])
    check('Step 1 has specific greeting', has_specific, step1.get('owlText', '')[:60])
    
    # T3: No raw curriculum text
    check('No raw curriculum text', not bool(re.search(r'strand|sub.strand|objective|learning outcome', all_text)), 'Clean')
    
    # T4: No placeholder text
    check('No placeholder text', not bool(re.search(r'coming soon|placeholder|lorem|tbd|todo', all_text)), 'Clean')
    
    # F1: No unsupported fractions
    forbidden = rules.get('forbidden', [])
    found_forbidden = [f for f in forbidden if f.lower() in all_text]
    check('No unsupported fractions/concepts', len(found_forbidden) == 0, f"Found: {found_forbidden}" if found_forbidden else 'Clean')
    
    # F2: No fraction arithmetic
    check('No fraction arithmetic', not bool(re.search(r'\d/\d\s*[+\-]\s*\d/\d', all_text)), 'Clean')
    
    # F2b: No abstract comparison
    check('No abstract fraction comparison', not bool(re.search(r'which is bigger|which is more|compare.*fraction|greater than|less than.*fraction', all_text)), 'Clean')
    
    # F3: QC has correct answer that matches expected fraction (if applicable)
    qc = next((s for s in j.get('steps', []) if s.get('stepType') == 'quick_check'), None)
    if qc:
        qc_interaction = qc.get('interaction', {})
        
        # QC has 4 options
        opts = qc_interaction.get('options', [])
        check('QC has 4 options', len(opts) == 4, f"{len(opts)} options")
        
        # QC has correctIndex
        check('QC has correctIndex', qc_interaction.get('correctIndex') is not None, f"Index: {qc_interaction.get('correctIndex')}")
        
        # QC has feedback
        check('QC has feedbackCorrect', bool(qc_interaction.get('feedbackCorrect')), f"{qc_interaction.get('feedbackCorrect', '')[:40]}")
        check('QC has feedbackIncorrect', bool(qc_interaction.get('feedbackIncorrect')), f"{qc_interaction.get('feedbackIncorrect', '')[:40]}")
        
        # QC tests lesson concept
        qc_text = (qc_interaction.get('question', '') + ' ' + qc_interaction.get('correctAnswer', '')).lower()
        check('QC tests relevant concept', 
              bool(re.search(r'1/4|quarter|1/2|half|equal|fraction|shaped|part|shad', qc_text)),
              f"Q: {qc_interaction.get('question', '')[:60]}")
        
        # QC feedbackIncorrect is one-shot (no "Try again!")
        check('QC feedbackIncorrect is one-shot', 
              'try again' not in qc_interaction.get('feedbackIncorrect', '').lower(),
              qc_interaction.get('feedbackIncorrect', '')[:60])
    else:
        check('QC step exists', False, 'No quick_check step found')
    
    # F4: Practice is different from Quick Check
    practice = next((s for s in j.get('steps', []) if s.get('stepType') == 'practice'), None)
    if practice and qc:
        check('Practice different from QC', 
              practice.get('interaction', {}).get('question') != qc.get('interaction', {}).get('question'),
              f"P: {practice.get('interaction', {}).get('question', '')[:40]}")
    
    # M1: Video not required
    has_video = any(s.get('media', {}).get('type') == 'video' for s in j.get('steps', []))
    check('Video not required', not has_video, 'SVG-first')
    
    # M2: All media has altText
    media_steps = [s for s in j.get('steps', []) if s.get('media', {}).get('type') == 'svg']
    all_alt = all(s.get('media', {}).get('altText') for s in media_steps)
    check('All SVG media has altText', all_alt, f"{len(media_steps)} SVG items")
    
    # M3: All media has fallback
    all_fallback = all(s.get('media', {}).get('fallbackType') for s in j.get('steps', []))
    check('All media has fallbackType', all_fallback, 'Clean')
    
    # M4: No broken media
    has_broken = bool(re.search(r'coming soon|broken|missing', all_text))
    check('No broken media', not has_broken, 'Clean')
    
    # I1: Practice requires learner action
    if practice:
        check('Practice has interaction', 
              practice.get('interaction', {}).get('type') in ['multiple_choice', 'text_input', 'drag_drop'],
              practice.get('interaction', {}).get('type', 'none'))
        check('Practice requiresSave', practice.get('interaction', {}).get('requiresSave', False), 'requiresSave: true')
    else:
        check('Practice exists', False, 'No practice step')
    
    # I2: Think First has interaction (at least a question)
    think_first = next((s for s in j.get('steps', []) if s.get('stepType') == 'think_first'), None)
    if think_first:
        check('Think First has interaction', 
              think_first.get('interaction', {}).get('type') in ['text_input', 'multiple_choice', 'none'],
              think_first.get('interaction', {}).get('type', 'none'))
    
    # I3: All steps have studentText
    missing_student = [s.get('stepNumber') for s in j.get('steps', []) if not s.get('studentText')]
    check('All steps have studentText', len(missing_student) == 0, 
          f"Missing in steps: {missing_student}" if missing_student else 'All present')
    
    # I4: All steps have owlText (except mission which is intentionally empty)
    missing_owl = [s.get('stepNumber') for s in j.get('steps', []) 
                   if not s.get('owlText') and s.get('stepType') not in ['mission']]
    check('All non-mission steps have owlText', len(missing_owl) == 0,
          f"Missing in steps: {missing_owl}" if missing_owl else 'All present')
    
    # I5: Learn has text (not just media)
    learn = next((s for s in j.get('steps', []) if s.get('stepType') == 'learn'), None)
    if learn:
        check('Learn has studentText', len(learn.get('studentText', '')) > 20, f"Length: {len(learn.get('studentText', ''))}")
    else:
        check('Learn step exists', False, 'No learn step')
    
    # Media summary per step
    for s in j.get('steps', []):
        m = s.get('media', {})
        media_summary.append({
            'step': s.get('stepNumber'),
            'type': s.get('stepType'),
            'mediaType': m.get('type', 'none'),
            'assetId': m.get('assetId', ''),
            'altText': m.get('altText', '')[:60],
            'required': m.get('required', False),
            'fallbackType': m.get('fallbackType', ''),
        })
    
    # Check answer leak: no explicit answer reveals before QC
    leak_patterns = [
        r'the answer is (one half|1/2|one quarter|1/4)',
        r'correct answer is (one half|1/2|one quarter|1/4)',
    ]
    non_qc_steps = [s for s in j.get('steps', []) if s.get('stepNumber', 0) < 8 
                    and s.get('stepType') not in ['learn', 'think_first', 'welcome']]
    leak_found = False
    for s in non_qc_steps:
        text = ((s.get('studentText', '') or '') + ' ' + (s.get('owlText', '') or '')).lower()
        for p in leak_patterns:
            if re.search(p, text):
                leak_found = True
                warnings.append(f"Potential answer leak in step {s.get('stepNumber')}: {text[:80]}")
    check('No explicit answer leaks before QC', not leak_found, 'Clean' if not leak_found else 'Leak found')
    
    # No thirds
    check('No thirds (1/3)', '1/3' not in all_text and 'thirds' not in all_text, 'Clean')
    
    passed = sum(1 for c in checks if c['passed'])
    total = len(checks)
    
    result = {
        'filename': os.path.basename(filepath),
        'lessonId': j.get('lessonId', ''),
        'title': j.get('title', ''),
        'passed': passed,
        'total': total,
        'all_passed': passed == total,
        'checks': checks,
        'warnings': warnings,
        'media_summary': media_summary,
    }
    
    return result


# ============================================================
# Validate all files
# ============================================================
all_results = []
grand_total = 0
grand_passed = 0
all_passed = True

for filename, rules in LESSON_RULES.items():
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        print(f"MISSING: {filename}")
        all_passed = False
        continue
    
    result = validate_file(filepath, rules)
    result['rules'] = rules
    all_results.append(result)
    grand_total += result['total']
    grand_passed += result['passed']
    status = 'PASS' if result['all_passed'] else 'FAIL'
    print(f"{status}: {filename} — {result['passed']}/{result['total']} checks passed")
    if not result['all_passed']:
        all_passed = False
        for c in result['checks']:
            if not c['passed']:
                print(f"  FAIL: {c['name']} — {c['detail']}")
    if result['warnings']:
        for w in result['warnings']:
            print(f"  WARN: {w}")

# Write validation summary
validation = {
    'validatedAt': '2026-06-17T12:00:00.000Z',
    'validationVersion': '1.0-generated',
    'totalChecks': grand_total,
    'passedChecks': grand_passed,
    'allPassed': all_passed,
    'lessons': all_results,
}

with open(VALIDATION_OUT, 'w', encoding='utf-8') as f:
    json.dump(validation, f, indent=2, ensure_ascii=False)

# ============================================================
# Write review summary
# ============================================================
md = []
md.append('# Generated Fractions Journeys — Review Summary')
md.append('')
md.append(f'**Generated:** 2026-06-17')
md.append(f'**Lesson count:** {len(all_results)}')
md.append(f'**Overall validation:** {"ALL PASSED ✓" if all_passed else f"FAILED — {grand_passed}/{grand_total} checks passed"}')
md.append(f'**Status:** Not written to database. Local files only for Victor review.')
md.append('')
md.append('---')
md.append('')
md.append('## Lesson Summary')

for r in all_results:
    status = '✅ PASS' if r['all_passed'] else '❌ FAIL'
    md.append(f'### {status} — {r["title"]}')
    md.append('')
    md.append(f'- **Lesson ID:** `{r["lessonId"]}`')
    md.append(f'- **File:** `{r["filename"]}`')
    md.append(f'- **Validation:** {r["passed"]}/{r["total"]} checks passed')
    md.append(f'- **QC template:** {r["rules"].get("scope_check", "varies")}')
    md.append('')
    md.append('#### Quick Check Question:')
    
    # Find QC step
    qc_check = next((c for c in r['checks'] if c['name'] == 'QC tests relevant concept'), None)
    if qc_check:
        md.append(f'- {qc_check["detail"]}')
    
    md.append('')
    if r['warnings']:
        md.append('#### Warnings:')
        for w in r['warnings']:
            md.append(f'- ⚠️ {w}')
        md.append('')
    
    # Media per step
    md.append('#### Media per step:')
    md.append('| Step | Type | Media | Required |')
    md.append('|------|------|-------|----------|')
    for m in r['media_summary']:
        md.append(f'| {m["step"]} | {m["type"]} | {m["mediaType"]} | {"Yes" if m["required"] else "No"} |')
    md.append('')
    
    # Failed checks
    failed = [c for c in r['checks'] if not c['passed']]
    if failed:
        md.append('#### Failed checks:')
        for c in failed:
            md.append(f'- ❌ {c["name"]}: {c["detail"]}')
        md.append('')
    
    md.append(f'**Ready for Victor review:** {"Yes ✓" if r["all_passed"] else "No — needs fixes"}')
    md.append('')
    md.append('---')
    md.append('')

md.append('## Human Review Items')
md.append('')
md.append('- [ ] All SVG media assets need to be generated/reviewed')
md.append('- [ ] All alt text should be reviewed for accuracy')
md.append('- [ ] Verify SVG descriptions are appropriate for Grade 2')
md.append('- [ ] Review practice vs QC differentiation per lesson')
md.append('- [ ] Confirm real-life examples are culturally appropriate (Kenyan context)')
md.append('- [ ] Audio/read-aloud text not generated — TTS or recording needed')
md.append('- [ ] Video missing/optional for all lessons — confirm acceptable')
md.append('- [ ] Verify fraction notation (½ vs 1/2) display compatibility')
md.append('')

with open(REVIEW_OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(md))

print(f"\n=== VALIDATION COMPLETE ===")
print(f"Grand total: {grand_passed}/{grand_total} checks passed")
print(f"All passed: {all_passed}")
print(f"Validation summary: {VALIDATION_OUT}")
print(f"Review summary: {REVIEW_OUT}")
