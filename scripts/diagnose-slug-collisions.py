"""
diagnose-slug-collisions.py

Queries Supabase to find lesson slug collisions and identify
why a Math Fractions lesson might show English reading comprehension content.
"""
import os
import json
from urllib.request import Request, urlopen
from urllib.parse import urlencode

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://hgufndnqbvcukbxmwtvo.supabase.co")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

def supabase_query(table, params):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{urlencode(params)}"
    req = Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    })
    with urlopen(req) as resp:
        return json.loads(resp.read().decode())

# Load .env file manually
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                key, _, val = line.partition("=")
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key == "NEXT_PUBLIC_SUPABASE_URL":
                    SUPABASE_URL = val
                elif key == "NEXT_PUBLIC_SUPABASE_ANON_KEY":
                    SUPABASE_KEY = val

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Key present: {bool(SUPABASE_KEY)}")
print("")

# Fetch all lessons with quest/theme info
try:
    lessons = supabase_query("Lesson", {
        "select": "id,title,slug,status,questId,quest:Quest(id,title,slug,theme:Theme(id,title,slug,grade))",
        "order": "slug.asc",
    })
except Exception as e:
    print(f"Error fetching lessons: {e}")
    exit(1)

print(f"Total lessons: {len(lessons)}")

# Group by slug
by_slug = {}
for l in lessons:
    slug = l.get("slug", "")
    if slug not in by_slug:
        by_slug[slug] = []
    by_slug[slug].append(l)

# Find collisions
collisions = {slug: items for slug, items in by_slug.items() if len(items) > 1}
print(f"Unique slugs: {len(by_slug)}")
print(f"Slugs with collisions: {len(collisions)}")

if collisions:
    print("\n=== SLUG COLLISIONS ===")
    for slug, items in sorted(collisions.items()):
        print(f'\nSLUG: "{slug}" ({len(items)} lessons)')
        for item in items:
            quest = item.get("quest") or {}
            themes = quest.get("theme") or []
            theme = themes[0] if themes else {}
            print(f"  ID: {item['id']}")
            print(f"  Title: {item['title']}")
            print(f"  Status: {item['status']}")
            print(f"  Quest: {quest.get('title', 'N/A')} (slug: {quest.get('slug', 'N/A')})")
            print(f"  Theme: {theme.get('title', 'N/A')} (grade: {theme.get('grade', 'N/A')})")

# Find fractions lessons
print("\n=== FRACTIONS / HALVES LESSONS ===")
for l in lessons:
    title = (l.get("title") or "").lower()
    slug = (l.get("slug") or "").lower()
    if "fraction" in title or "half" in title or "halves" in title or "fraction" in slug:
        quest = l.get("quest") or {}
        themes = quest.get("theme") or []
        theme = themes[0] if themes else {}
        print(f"  {l['title']} (slug: {l['slug']}, status: {l['status']}, id: {l['id']})")
        print(f"    Quest: {quest.get('title', 'N/A')}, Theme: {theme.get('title', 'N/A')} (grade: {theme.get('grade', 'N/A')})")

# Find reading lessons
print("\n=== READING / COMPREHENSION LESSONS ===")
for l in lessons:
    title = (l.get("title") or "").lower()
    slug = (l.get("slug") or "").lower()
    if "reading" in title or "comprehension" in title or "reading" in slug:
        quest = l.get("quest") or {}
        themes = quest.get("theme") or []
        theme = themes[0] if themes else {}
        print(f"  {l['title']} (slug: {l['slug']}, status: {l['status']}, id: {l['id']})")
        print(f"    Quest: {quest.get('title', 'N/A')}, Theme: {theme.get('title', 'N/A')} (grade: {theme.get('grade', 'N/A')})")

# Check contentBlocks for reading comprehension text
print("\n=== CHECKING CONTENT FOR READING COMPREHENSION ===")
for l in lessons:
    cb = l.get("contentBlocks")
    if isinstance(cb, str):
        try:
            cb = json.loads(cb)
        except:
            pass
    if isinstance(cb, dict):
        journey = cb.get("studentJourney") or cb.get("studentJourneyDraft") or []
        if isinstance(journey, list):
            for step in journey:
                text = f"{step.get('studentText', '')} {step.get('content', '')} {step.get('owlText', '')}"
                if "reading comprehension" in text.lower():
                    print(f"  FOUND in lesson: {l['title']} (slug: {l['slug']}, id: {l['id']})")
                    print(f"    Step: {step.get('stepKey', step.get('id', 'unknown'))}")
                    print(f"    Text snippet: {text[:100]}...")
                    break
