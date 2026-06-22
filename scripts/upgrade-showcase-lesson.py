#!/usr/bin/env python3
"""
Gold Standard Lesson Upgrade Script
Upgrades 'Relationship Between Addition and Subtraction' to the benchmark lesson.
Writes enhanced journey data with content blocks to Supabase.
"""
import json, pathlib, urllib.request, urllib.error, os

# Read anon key from .env
env_path = pathlib.Path(__file__).resolve().parent.parent / ".env"
anon_key = None
for line in env_path.read_text().splitlines():
    if line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
        anon_key = line.split("=", 1)[1].strip()
        break

if not anon_key:
    print("ERROR: Could not find anon key")
    exit(1)

SUPABASE_URL = "https://hgufndnqbvcukbxmwtvo.supabase.co"
LESSON_ID = "cd845a68-f275-4f7f-b8a8-7d4887b95cda"

# ── Gold Standard Journey ────────────────────────────────────────────────────

gold_standard_journey = [
    {
        "id": "step-1-welcome",
        "stepType": "welcome",
        "title": "Welcome, Math Explorer! 🦉",
        "studentText": "",
        "owlText": "Hello, friend! Today we are going to discover a special Math secret: addition and subtraction are connected! If you know an addition fact, you can find a subtraction fact. Are you ready to become a Math detective?",
        "interaction": {"type": "none"},
        "media": {
            "illustration": {
                "altText": "Owl teacher welcoming students to a math adventure",
                "description": "A friendly owl teacher at a chalkboard with math symbols",
                "prompt": "A friendly cartoon owl teacher welcoming young students to a math adventure, with a colorful chalkboard showing + and - signs, warm inviting colors, child-friendly illustration style"
            }
        },
        "estimatedMinutes": 1
    },
    {
        "id": "step-2-mission",
        "stepType": "mission",
        "title": "Today's Mission 🎯",
        "studentText": "By the end of this lesson, you will be able to:\n\n✓ Use addition facts to find subtraction facts\n✓ Find missing numbers using fact families\n✓ Solve number patterns\n✓ Explain how addition and subtraction are connected",
        "owlText": "This is your mission! By the end of this lesson, you will be able to use addition and subtraction as opposites. If you know 5 + 3 = 8, you also know 8 - 3 = 5! Let us begin!",
        "interaction": {"type": "none"},
        "media": {
            "illustration": {
                "altText": "Mission banner with fact family triangle",
                "description": "A colorful mission banner showing a fact family triangle with numbers 5, 3, and 8",
                "prompt": "A colorful math mission banner for children, showing a fact family triangle with numbers 5, 3, and 8 at the corners, with + and - signs, bright engaging colors"
            }
        },
        "estimatedMinutes": 1
    },
    {
        "id": "step-3-think-first",
        "stepType": "think_first",
        "title": "Think First! 💭",
        "studentText": "Imagine this:\n\nYou have 7 mangoes. Your friend gives you 4 more. How many do you have now?\n\n7 + 4 = 11 mangoes\n\nNow you eat 4 mangoes. How many are left?\n\n11 - 4 = 7 mangoes\n\nWe added 4, then took away 4. We ended up where we started!\n\nAddition and subtraction are **opposites**!",
        "owlText": "Think about it: when you add something and then take the same amount away, you get back to where you started. Addition puts things together. Subtraction takes them apart. They are opposites!",
        "interaction": {
            "type": "open_response",
            "prompt": "Tell a story about adding something and then taking the same amount away. What happens?",
            "hint": "Think about getting sweets, counting toys, or sharing food with friends."
        },
        "media": {
            "illustration": {
                "altText": "Mangoes being added and subtracted",
                "description": "A visual showing 7 mangoes, then 4 more being added, then 4 being taken away",
                "prompt": "A colorful illustration for children showing 7 mangoes, then 4 more being added (7+4=11), then 4 being eaten (11-4=7), bright cheerful style"
            }
        },
        "estimatedMinutes": 2
    },
    {
        "id": "step-4-learn",
        "stepType": "learn",
        "title": "Learn It 📖",
        "studentText": "Addition and subtraction are **opposites**.\n\nIf you know: **5 + 3 = 8**\n\nYou also know:\n- **3 + 5 = 8** (add the same numbers, different order)\n- **8 - 3 = 5** (take away what you added)\n- **8 - 5 = 3** (take away the other number)\n\nThese four sentences are called a **fact family**.\n\n**Finding missing numbers:**\n\nIf 7 + ___ = 15, think: what number added to 7 makes 15?\n\nUse subtraction: 15 - 7 = 8\n\nSo 7 + **8** = 15\n\n**Check:** 15 - 8 = 7 ✓",
        "owlText": "",
        "interaction": {"type": "none"},
        "media": {
            "illustration": {
                "altText": "Fact family triangle showing 5, 3, 8 with all four number sentences",
                "description": "A triangle diagram with 5, 3, and 8 at corners showing all four fact family sentences with arrows",
                "prompt": "A clear educational diagram for children showing a fact family triangle with numbers 5, 3, and 8 at the corners, with arrows showing 5+3=8, 3+5=8, 8-3=5, 8-5=3, bright colors, easy to read"
            }
        },
        "estimatedMinutes": 3
    },
    {
        "id": "step-5-connect",
        "stepType": "connect",
        "title": "Real Life Connection 🔗",
        "studentText": "We use addition and subtraction every day:\n\n• **Shopping:** You have 20 shillings. You buy a book for 12 shillings. How much is left? 20 - 12 = 8 shillings.\n\n• **Sharing fruits:** There are 15 bananas. 6 are eaten. How many are left? 15 - 6 = 9 bananas.\n\n• **Counting people:** 8 children are playing. 3 more join. How many now? 8 + 3 = 11 children.\n\nAddition puts groups together. Subtraction takes them apart. They are opposites!",
        "owlText": "Can you think of a time you added something and then took some away? Tell someone your story!",
        "interaction": {
            "type": "open_response",
            "prompt": "Write or say: A time when you added something and then took some away.",
            "hint": "Think about sharing food, counting toys, or spending money."
        },
        "media": {
            "illustration": {
                "altText": "Children using math in real life situations",
                "description": "Children shopping, sharing fruits, and counting friends",
                "prompt": "A colorful illustration showing children using math in real life: buying at a market, sharing fruits, counting friends playing, bright and engaging for young learners"
            }
        },
        "estimatedMinutes": 2
    },
    {
        "id": "step-6-example",
        "stepType": "example",
        "title": "Watch and Learn 💡",
        "studentText": "**Worked Example 1:** Find the missing number.\n\n9 + ___ = 17\n\nStep 1: Think: what number added to 9 makes 17?\nStep 2: Use subtraction: 17 - 9 = 8\nStep 3: So 9 + **8** = 17\nStep 4: Check: 17 - 8 = 9 ✓\n\n**Worked Example 2:** Complete the fact family.\n\n6 + 9 = 15\n\nThe fact family is:\n- 6 + 9 = 15\n- 9 + 6 = 15\n- 15 - 6 = 9\n- 15 - 9 = 6\n\n**Worked Example 3:** Find the pattern.\n\n20, 17, 14, 11, ___\n\nStep 1: What is the pattern? 20 - 3 = 17, 17 - 3 = 14, 14 - 3 = 11\nStep 2: The pattern is subtract 3\nStep 3: 11 - 3 = **8**\n\nThe missing number is **8**.",
        "owlText": "",
        "interaction": {"type": "none"},
        "media": {
            "illustration": {
                "altText": "Number line showing addition and subtraction jumps",
                "description": "A number line from 0 to 20 showing jumps for 9+8=17 and pattern 20,17,14,11,8",
                "prompt": "A colorful number line for children from 0 to 20, showing addition jumps (9 to 17) and subtraction patterns (20, 17, 14, 11, 8), with arrows and bright colors"
            }
        },
        "estimatedMinutes": 3
    },
    {
        "id": "step-7-practice",
        "stepType": "practice",
        "title": "Your Turn! ✏️",
        "studentText": "**Find the missing number:**\n\n1) 8 + ___ = 14 → Think: 14 - 8 = ___\n\n2) ___ + 6 = 13 → Think: 13 - 6 = ___\n\n3) 16 - ___ = 9 → Think: 16 - 9 = ___\n\n4) 7 + 9 = ___\n\n5) ___ - 5 = 8 → Think: 8 + 5 = ___\n\n**Complete the fact family:**\n\n6) 7 + 8 = 15 → 8 + ___ = 15 → 15 - 7 = ___ → 15 - 8 = ___\n\n**Find the missing number in the pattern:**\n\n7) 25, 22, 19, ___, 13 → Pattern: subtract ___\n\n8) ___, 18, 15, 12, 9 → Pattern: subtract 3",
        "owlText": "Use subtraction to find missing addition numbers. Use addition to find missing subtraction numbers. Draw a number line if you need help!",
        "interaction": {
            "type": "open_response",
            "prompt": "Write your answers. Show your working!",
            "hint": "For missing addition: subtract. For missing subtraction: think what was taken away."
        },
        "materials": ["paper", "pencil", "number line (optional)"],
        "media": {},
        "estimatedMinutes": 5
    },
    {
        "id": "step-8-quick-check",
        "stepType": "quick_check",
        "title": "Quick Check! ✅",
        "studentText": "",
        "owlText": "",
        "interaction": {
            "type": "multiple_choice",
            "question": "What is the missing number? 8 + ___ = 15",
            "options": ["6", "7", "8", "9"],
            "correctIndex": 1,
            "explanation": "Correct! 15 - 8 = 7, so 8 + 7 = 15. We used subtraction to find the missing addition number."
        },
        "media": {},
        "estimatedMinutes": 2
    },
    {
        "id": "step-9-reflect",
        "stepType": "reflect",
        "title": "Think About Your Learning 🪞",
        "studentText": "",
        "owlText": "What did you learn about addition and subtraction today? How can you find a missing number in an addition sentence? What about in a subtraction sentence? Can you explain the connection to someone?",
        "interaction": {
            "type": "open_response",
            "prompt": "Tell or write: How are addition and subtraction connected? How do you find a missing number?",
            "hint": "Think about fact families and using the opposite operation."
        },
        "reflectionOptions": [
            "I learned that addition and subtraction are opposites!",
            "I can use fact families to find missing numbers",
            "I need more practice with patterns",
            "I can explain this to someone else now"
        ],
        "media": {},
        "estimatedMinutes": 2
    },
    {
        "id": "step-10-complete",
        "stepType": "complete",
        "title": "You Did It! 🏆",
        "studentText": "",
        "owlText": "Amazing work! Today you learned that addition and subtraction are opposites. You can use one to check the other. You found missing numbers and completed fact families. Keep practising and you will be a Math champion! 🌟",
        "interaction": {"type": "none"},
        "media": {
            "illustration": {
                "altText": "Celebration with owl teacher and math symbols",
                "description": "Owl teacher celebrating with students, confetti and math symbols",
                "prompt": "A joyful celebration illustration with an owl teacher and happy students, confetti, stars, and math symbols floating around, bright golden colors, achievement theme"
            }
        },
        "estimatedMinutes": 1
    }
]

# ── Build contentBlocks ──────────────────────────────────────────────────────

content_blocks = {
    "importSource": "manual-gold-standard",
    "curriculum": {
        "version": "",
        "country": "Kenya",
        "system": "CBC",
        "grade": "2",
        "term": "Term 2",
        "week": "Week 1",
        "subject": "Mathematics",
        "strand": "Numbers",
        "subStrand": "1.5 Subtraction",
        "specificLearningOutcome": "By the end of the lesson, the learner should be able to work out missing numbers in patterns involving subtraction up to 100"
    },
    "studentJourney": gold_standard_journey,
    "studentJourneyDraft": [],
    "isAvailable": True,
    "aiMetadata": {
        "model": "gold-standard-manual",
        "promptVersion": "v1",
        "generatedAt": "2026-06-21T00:00:00Z",
        "reviewStatus": "APPROVED",
        "validated": True
    }
}

# ── Write to Supabase ────────────────────────────────────────────────────────

url = f"{SUPABASE_URL}/rest/v1/Lesson?id=eq.{LESSON_ID}"
patch_data = json.dumps({"contentBlocks": json.dumps(content_blocks, ensure_ascii=False)}).encode("utf-8")

req = urllib.request.Request(url, data=patch_data, method="PATCH", headers={
    "apikey": anon_key,
    "Authorization": f"Bearer {anon_key}",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Prefer": "return=representation",
})

try:
    resp = urllib.request.urlopen(req, timeout=15)
    result = json.loads(resp.read())
    print(f"✅ Successfully upgraded lesson {LESSON_ID}")
    print(f"   Steps: {len(gold_standard_journey)}")
    print(f"   Status: {result[0].get('status', 'unknown') if result else 'unknown'}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"❌ HTTP Error {e.code}: {body}")
except Exception as e:
    print(f"❌ Error: {e}")
