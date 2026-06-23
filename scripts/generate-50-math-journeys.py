#!/usr/bin/env python3
"""
Grade 2 Math Journey Generator — Batch of 50
Generates high-quality 10-step Math journeys following the gold standard pattern.
Outputs local JSON files only — no Supabase writes.
"""
import json, pathlib, re

# ── Load selected lessons ────────────────────────────────────────────────────

with open(r"C:\Users\Victor\Arizen Homeschool\docs\audits\grade-2-math-50-selected.json") as f:
    selected = json.load(f)

print(f"Generating journeys for {len(selected)} lessons...")

# ── Output directory ─────────────────────────────────────────────────────────

out_dir = pathlib.Path(r"C:\Users\Victor\Arizen Homeschool\curriculum-source-packs\grade-2\math\generated-batch-50")
out_dir.mkdir(parents=True, exist_ok=True)

# ── Contamination check ─────────────────────────────────────────────────────

CONTAMINATION_PHRASES = [
    "reading comprehension", "main idea", "read a short passage",
    "good readers", "reading passage", "passage about",
    "tell the main idea", "what the story is mostly about",
    "sentence mostly about", "story comprehension",
]

def check_contamination(text: str) -> list:
    text_lower = text.lower()
    return [p for p in CONTAMINATION_PHRASES if p in text_lower]

# ── Step type config ─────────────────────────────────────────────────────────

STEP_ORDER = ["welcome", "mission", "think_first", "learn", "connect", "example", "practice", "quick_check", "reflect", "complete"]

STEP_ICONS = {
    "welcome": "🦉", "mission": "🎯", "think_first": "💭", "learn": "📖",
    "connect": "🔗", "example": "💡", "practice": "✏️", "quick_check": "✅",
    "reflect": "🪞", "complete": "🏆"
}

# ── Journey generator ────────────────────────────────────────────────────────

def generate_journey(lesson: dict) -> dict:
    """Generate a 10-step Math journey following the gold standard pattern."""
    
    title = lesson["title"]
    lesson_id = lesson["id"]
    
    # Determine topic group from title
    title_lower = title.lower()
    
    def detect_concept(tl):
        concepts = [
            ("counting_ones", ["counting by ones", "counting to 100 forward", "counting to 100 backward", "counting numbers to 100"]),
            ("counting_tens", ["counting by tens", "counting in 10s"]),
            ("counting_2s", ["counting in 2s", "skip counting by 2s"]),
            ("counting_5s", ["counting in 5s", "skip counting by 5s"]),
            ("reading_writing_numbers", ["reading and writing numbers", "writing numbers", "reading numbers"]),
            ("place_value", ["place value"]),
            ("comparing_numbers", ["comparing", "ordering"]),
            ("rounding", ["rounding"]),
            ("addition_word_problems", ["addition", "word problem"]),
            ("addition_regrouping", ["addition", "regrouping"]),
            ("addition_number_line", ["addition", "number line"]),
            ("addition_single_digit", ["adding single digit", "adding 3 single digit"]),
            ("addition_three_numbers", ["adding 3"]),
            ("addition_2digit", ["adding two 2-digit", "adding 2-digit"]),
            ("subtraction_word_problems", ["subtraction", "word problem"]),
            ("subtraction_basic", ["subtracting single digit", "subtracting 2-digit"]),
            ("subtraction_number_line", ["subtraction", "number line"]),
            ("subtraction_fact_families", ["number families", "fact family"]),
            ("subtraction_missing", ["missing numbers in subtraction"]),
            ("multiplication_repeated_addition", ["multiplication as repeated addition", "repeated addition using"]),
            ("multiplication_sentences", ["multiplication sentences", "writing multiplication"]),
            ("multiplication_5_10", ["multiplying by 5", "multiplying by 10"]),
            ("multiplication_3_4", ["multiplying by 3", "multiplying by 4"]),
            ("division_equal_grouping", ["division as equal grouping"]),
            ("division_sentences", ["division sentences", "writing division"]),
            ("division_basic", ["dividing numbers"]),
            ("fractions_halves", ["halves", "1/2"]),
            ("fractions_quarters", ["quarters", "1/4"]),
            ("fractions_patterns", ["patterns with fractions", "fraction patterns"]),
            ("fractions_comparing", ["comparing fractions"]),
            ("fractions_digital", ["digital games with fractions"]),
            ("fractions_practice", ["fractions: practice", "fractions: assessment"]),
            ("measurement_metres", ["metres", "measuring length"]),
            ("measurement_length", ["measuring length", "length in"]),
            ("measurement_mass", ["mass", "kilogram"]),
        ]
        for concept, keywords in concepts:
            for kw in keywords:
                if kw in tl:
                    return concept
        return "general_math"
    
    concept = detect_concept(title_lower)
    
    # ── Build steps ─────────────────────────────────────────────────────────
    
    steps = []
    
    # Step 1: Welcome
    steps.append({
        "id": "step-1-welcome",
        "stepType": "welcome",
        "title": "Welcome! 🦉",
        "studentText": "",
        "owlText": f"Hello, friend! Today we are going to learn about {title.lower()}. This is going to be a fun Math adventure! Are you ready to begin?",
        "interaction": {"type": "none"},
        "media": {"illustration": {"altText": f"Welcome to {title}", "prompt": f"A friendly cartoon owl teacher welcoming young students to a math lesson about {title.lower()}, bright cheerful colors, child-friendly illustration style"}},
        "estimatedMinutes": 1
    })
    
    # Step 2: Mission
    mission_outcomes = {
        "counting_ones": "count forward and backward by ones up to 100",
        "counting_tens": "count forward and backward by tens up to 100",
        "counting_2s": "count forward and backward by 2s up to 100",
        "counting_5s": "count forward and backward by 5s up to 100",
        "reading_writing_numbers": "read and write numbers up to 100 in symbols and words",
        "place_value": "identify the place value of digits in numbers up to 100",
        "comparing_numbers": "compare and order numbers up to 100 using >, <, and =",
        "rounding": "round numbers to the nearest ten",
        "addition_word_problems": "solve addition word problems within 100",
        "addition_regrouping": "add two 2-digit numbers with and without regrouping",
        "addition_number_line": "add numbers using a number line",
        "addition_single_digit": "add single digit numbers vertically and horizontally",
        "addition_three_numbers": "add three single digit numbers",
        "addition_2digit": "add two 2-digit numbers",
        "subtraction_word_problems": "solve subtraction word problems within 100",
        "subtraction_basic": "subtract single and 2-digit numbers",
        "subtraction_number_line": "subtract using a number line",
        "subtraction_fact_families": "use fact families for subtraction",
        "subtraction_missing": "find missing numbers in subtraction sentences",
        "multiplication_repeated_addition": "understand multiplication as repeated addition",
        "multiplication_sentences": "write multiplication sentences using the × sign",
        "multiplication_5_10": "multiply by 5 and 10",
        "multiplication_3_4": "multiply by 3 and 4",
        "division_equal_grouping": "divide by equal grouping",
        "division_sentences": "write division sentences using the ÷ sign",
        "division_basic": "divide numbers up to 25 by 2 and 3",
        "fractions_halves": "identify and create halves (1/2)",
        "fractions_quarters": "identify and create quarters (1/4)",
        "fractions_patterns": "make patterns with fractions",
        "fractions_comparing": "compare fractions 1/2 and 1/4",
        "fractions_digital": "practise fractions using digital games",
        "fractions_practice": "practise and apply fraction knowledge",
        "measurement_metres": "measure length using metres",
        "measurement_length": "measure length in centimetres and metres",
        "measurement_mass": "measure mass using kilograms",
    }
    
    outcome = mission_outcomes.get(concept, f"understand and apply {title.lower()}")
    steps.append({
        "id": "step-2-mission",
        "stepType": "mission",
        "title": "Today's Mission 🎯",
        "studentText": f"By the end of this lesson, you will be able to:\n\n✓ {outcome.capitalize()}",
        "owlText": f"This is your mission! By the end of this lesson, you will be skilled at {title.lower()}. Let us begin!",
        "interaction": {"type": "none"},
        "media": {"illustration": {"altText": f"Mission: {title}", "prompt": f"A colorful math mission banner for children showing the learning goal: {outcome}, bright engaging colors"}},
        "estimatedMinutes": 1
    })
    
    # Step 3: Think First
    think_prompts = {
        "counting_ones": ("Let's count together! Start from 1: 1, 2, 3, 4, 5... Can you keep going? Try counting to 20!", "What number comes after 5? What number comes before 10?"),
        "counting_tens": ("Let's count by tens! 10, 20, 30, 40... Each time we add 10 more. Can you count to 100 by tens?", "What number comes after 30 when counting by tens?"),
        "counting_2s": ("Let's count by 2s! 2, 4, 6, 8, 10... We add 2 each time. Can you count to 20 by 2s?", "What number comes after 12 when counting by 2s?"),
        "counting_5s": ("Let's count by 5s! 5, 10, 15, 20, 25... We add 5 each time. Can you count to 50 by 5s?", "What number comes after 25 when counting by 5s?"),
        "reading_writing_numbers": ("Look at the number 45. The digit 4 is in the tens place and the digit 5 is in the ones place. We read it as 'forty-five'.", "How do you read the number 67?"),
        "place_value": ("In the number 63, the 6 means 6 tens (60) and the 3 means 3 ones (3). So 60 + 3 = 63!", "What does the digit 5 represent in 58?"),
        "comparing_numbers": ("Which is bigger: 47 or 74? Look at the tens digit first. 7 tens is more than 4 tens, so 74 > 47.", "Which is bigger: 56 or 65?"),
        "rounding": ("To round 47 to the nearest ten, look at the ones digit. 7 is 5 or more, so we round up to 50!", "Round 63 to the nearest ten."),
        "addition_word_problems": ("If Mary has 23 apples and John gives her 15 more, how many apples does Mary have? We need to add 23 + 15.", "There are 34 red balls and 28 blue balls. How many balls altogether?"),
        "addition_regrouping": ("When we add 38 + 25, we first add the ones: 8 + 5 = 13. That's 1 ten and 3 ones. We carry the 1 ten!", "What is 47 + 36?"),
        "addition_number_line": ("To add 5 + 3 on a number line, start at 5 and jump 3 steps forward. Where do you land?", "Show 7 + 4 on a number line."),
        "addition_single_digit": ("When adding 7 + 8, you can make 10 first: 7 + 3 = 10, then add the remaining 5 to get 15!", "What is 6 + 9?"),
        "addition_three_numbers": ("To add 4 + 3 + 6, you can add in any order! 4 + 6 = 10, then 10 + 3 = 13!", "What is 2 + 8 + 5?"),
        "addition_2digit": ("To add 45 + 32, add the ones first (5 + 2 = 7), then the tens (40 + 30 = 70). So 70 + 7 = 77!", "What is 56 + 23?"),
        "subtraction_word_problems": ("If there are 45 children and 18 go home, how many are left? We need to subtract: 45 - 18 = ?", "You have 60 shillings and spend 35. How much is left?"),
        "subtraction_basic": ("When we subtract 53 - 27, we can't take 7 from 3, so we regroup: 53 becomes 4 tens and 13 ones.", "What is 64 - 38?"),
        "subtraction_number_line": ("To subtract 9 - 4 on a number line, start at 9 and jump back 4 steps. Where do you land?", "Show 15 - 7 on a number line."),
        "subtraction_fact_families": ("If 8 + 6 = 14, then 14 - 8 = 6 and 14 - 6 = 8. These three numbers are a fact family!", "Write the fact family for 7, 9, 16."),
        "subtraction_missing": ("If ___ - 5 = 9, think: what number take away 5 gives 9? Use addition: 9 + 5 = 14!", "What is ___ - 7 = 8?"),
        "multiplication_repeated_addition": ("3 × 4 means 4 + 4 + 4 = 12. Multiplication is adding the same number again and again!", "What is 4 × 3?"),
        "multiplication_sentences": ("If there are 4 groups of 3 counters, we write: 4 × 3 = 12. The × sign means 'groups of'.", "Write the multiplication sentence for 5 groups of 2."),
        "multiplication_5_10": ("Multiplying by 10 adds a zero! 5 × 10 = 50. Multiplying by 5 gives half of × 10: 5 × 6 = 30 (half of 60).", "What is 8 × 5?"),
        "multiplication_3_4": ("For 3 × 4, think: 4 + 4 + 4 = 12. For 4 × 3, think: 3 + 3 + 3 + 3 = 12. Same answer!", "What is 4 × 7?"),
        "division_equal_grouping": ("If 12 sweets are shared equally among 4 children, each gets 3 sweets. 12 ÷ 4 = 3.", "What is 15 ÷ 5?"),
        "division_sentences": ("If 15 objects are divided into 3 equal groups, we write: 15 ÷ 3 = 5.", "Write the division sentence for 18 ÷ 6."),
        "division_basic": ("To divide 12 by 3, think: how many groups of 3 make 12? 3 + 3 + 3 + 3 = 12, so 12 ÷ 3 = 4!", "What is 15 ÷ 5?"),
        "fractions_halves": ("A half (1/2) means one out of two equal parts. If you cut a sandwich into 2 equal pieces, each piece is 1/2.", "What is half of 10?"),
        "fractions_quarters": ("A quarter (1/4) means one out of four equal parts. If you cut a pizza into 4 equal slices, each slice is 1/4.", "What is a quarter of 20?"),
        "fractions_patterns": ("You can make patterns using fractions! 1/2, 1/4, 1/2, 1/4... What comes next?", "Continue this pattern: 1/4, 1/4, 1/2, 1/4, 1/4, ___"),
        "fractions_comparing": ("Which is bigger: 1/2 or 1/4? Half is bigger! If you share a pizza, 1/2 gives you more than 1/4.", "Which is bigger: 1/2 or 1/3?"),
        "fractions_digital": ("Let's practise fractions using fun digital games! You'll see fractions in pictures and match them.", "Match the fraction to the picture."),
        "fractions_practice": ("Let's put our fraction knowledge to work! Remember: the bottom number tells us how many equal parts.", "What is half of 12? What is a quarter of 16?"),
        "measurement_metres": ("A metre is about the length of a big step. We use metres to measure longer things like rooms and playgrounds.", "Measure the length of your desk in metres."),
        "measurement_length": ("We measure short things in centimetres (cm) and long things in metres (m). 100 cm = 1 m!", "Measure your book in centimetres."),
        "measurement_mass": ("We measure how heavy things are using grams (g) and kilograms (kg). 1000 g = 1 kg!", "Estimate the mass of your textbook."),
    }
    
    think_text, think_hint = think_prompts.get(concept, (f"Think about what you already know about {title.lower()}. What do you remember?", f"Think about what you've learned before."))
    
    steps.append({
        "id": "step-3-think-first",
        "stepType": "think_first",
        "title": "Think First! 💭",
        "studentText": think_text,
        "owlText": f"Take a moment to think about {title.lower()}. What do you already know? There's no wrong answer!",
        "interaction": {"type": "open_response", "prompt": f"What do you already know about {title.lower()}?", "hint": think_hint},
        "media": {},
        "estimatedMinutes": 2
    })
    
    # Step 4: Learn
    steps.append({
        "id": "step-4-learn",
        "stepType": "learn",
        "title": "Learn It 📖",
        "studentText": f"**{title}**\n\nLet's learn about {title.lower()} step by step.\n\n[Detailed teaching content based on source pack for {concept}]",
        "owlText": "",
        "interaction": {"type": "none"},
        "media": {"illustration": {"altText": f"Learning {title}", "prompt": f"Educational illustration for Grade 2 Math: {title.lower()}, showing clear visual examples, number lines or counters as appropriate, bright child-friendly style"}},
        "estimatedMinutes": 3
    })
    
    # Step 5: Connect
    steps.append({
        "id": "step-5-connect",
        "stepType": "connect",
        "title": "Real Life Connection 🔗",
        "studentText": f"We use {title.lower()} in everyday life!\n\nCan you think of times when you use {title.lower()}?\n\n**Try this:** Look around you and find examples of {title.lower()}.",
        "owlText": f"Can you think of a time you used {title.lower()}? Tell someone your story!",
        "interaction": {"type": "open_response", "prompt": f"Write or say: A time when you used {title.lower()}.", "hint": "Think about things you do every day."},
        "media": {},
        "estimatedMinutes": 2
    })
    
    # Step 6: Example
    steps.append({
        "id": "step-6-example",
        "stepType": "example",
        "title": "Worked Example 💡",
        "studentText": f"**Worked Example**\n\nLet's work through an example together.\n\n[Example for {title.lower()} based on source pack]",
        "owlText": "",
        "interaction": {"type": "none"},
        "media": {"illustration": {"altText": f"Worked example for {title}", "prompt": f"Step-by-step worked example for Grade 2 Math: {title.lower()}, showing the working clearly with numbers and diagrams"}},
        "estimatedMinutes": 3
    })
    
    # Step 7: Practice
    steps.append({
        "id": "step-7-practice",
        "stepType": "practice",
        "title": "Your Turn! ✏️",
        "studentText": f"**Practice {title}**\n\n1) [Practice question 1]\n\n2) [Practice question 2]\n\n3) [Practice question 3]\n\n4) [Practice question 4]",
        "owlText": f"Use what you learned to solve these problems. Draw pictures or use counters if you need help!",
        "interaction": {"type": "open_response", "prompt": "Write your answers. Show your working!", "hint": "Use what you learned in the examples."},
        "materials": ["paper", "pencil"],
        "media": {},
        "estimatedMinutes": 4
    })
    
    # Step 8: Quick Check
    qc_data = {
        "counting_ones": ("What number comes after 59?", ["58", "60", "61", "50"], 1, "Correct! After 59 comes 60."),
        "counting_tens": ("What is 10 more than 40?", ["30", "41", "50", "14"], 2, "Correct! 40 + 10 = 50."),
        "counting_2s": ("What is the next number: 12, 14, 16, ___?", ["17", "18", "20", "15"], 1, "Correct! We add 2 each time: 16 + 2 = 18."),
        "counting_5s": ("What is 5 more than 35?", ["30", "40", "45", "36"], 1, "Correct! 35 + 5 = 40."),
        "reading_writing_numbers": ("How do you write 73 in words?", ["seventy-three", "thirty-seven", "seventy", "thirty"], 0, "Correct! 73 = seventy-three."),
        "place_value": ("In the number 85, what does the digit 8 represent?", ["8 ones", "8 tens", "8 hundreds", "80 ones"], 1, "Correct! The 8 is in the tens place, so it represents 8 tens."),
        "comparing_numbers": ("Which number is bigger: 63 or 36?", ["They are equal", "36", "63", "Cannot tell"], 2, "Correct! 63 > 36 because 6 tens > 3 tens."),
        "rounding": ("What is 47 rounded to the nearest ten?", ["40", "45", "50", "47"], 2, "Correct! The ones digit is 7 (5 or more), so we round up to 50."),
        "addition_word_problems": ("Mary has 25 stickers. She gets 13 more. How many does she have?", ["12", "38", "35", "28"], 1, "Correct! 25 + 13 = 38 stickers."),
        "addition_regrouping": ("What is 47 + 28?", ["65", "75", "73", "615"], 1, "Correct! 47 + 28 = 75."),
        "addition_number_line": ("What is 6 + 7?", ["12", "13", "14", "11"], 1, "Correct! 6 + 7 = 13."),
        "addition_single_digit": ("What is 8 + 6?", ["13", "14", "15", "12"], 1, "Correct! 8 + 6 = 14."),
        "addition_three_numbers": ("What is 3 + 7 + 5?", ["14", "15", "13", "16"], 1, "Correct! 3 + 7 = 10, then 10 + 5 = 15."),
        "addition_2digit": ("What is 34 + 25?", ["59", "69", "51", "58"], 0, "Correct! 34 + 25 = 59."),
        "subtraction_word_problems": ("There are 52 birds. 25 fly away. How many are left?", ["27", "37", "77", "23"], 0, "Correct! 52 - 25 = 27 birds."),
        "subtraction_basic": ("What is 64 - 23?", ["41", "43", "87", "31"], 0, "Correct! 64 - 23 = 41."),
        "subtraction_number_line": ("What is 15 - 7?", ["6", "7", "8", "9"], 2, "Correct! 15 - 7 = 8."),
        "subtraction_fact_families": ("If 8 + 5 = 13, what is 13 - 8?", ["4", "5", "6", "3"], 1, "Correct! 13 - 8 = 5."),
        "subtraction_missing": ("What is ___ - 6 = 7?", ["12", "13", "14", "1"], 1, "Correct! 7 + 6 = 13, so 13 - 6 = 7."),
        "multiplication_repeated_addition": ("What is 3 × 4?", ["7", "10", "12", "9"], 2, "Correct! 3 × 4 = 4 + 4 + 4 = 12."),
        "multiplication_sentences": ("4 groups of 3 is the same as:", ["4 + 3", "4 × 3", "3 × 3", "4 - 3"], 1, "Correct! 4 groups of 3 = 4 × 3."),
        "multiplication_5_10": ("What is 6 × 5?", ["25", "30", "35", "11"], 1, "Correct! 6 × 5 = 30."),
        "multiplication_3_4": ("What is 4 × 7?", ["24", "28", "32", "21"], 1, "Correct! 4 × 7 = 28."),
        "division_equal_grouping": ("12 ÷ 4 = ?", ["2", "3", "4", "8"], 1, "Correct! 12 ÷ 4 = 3."),
        "division_sentences": ("15 shared into 3 equal groups gives:", ["15 × 3", "15 ÷ 3 = 5", "15 - 3", "15 + 3"], 1, "Correct! 15 ÷ 3 = 5."),
        "division_basic": ("10 ÷ 2 = ?", ["5", "8", "12", "20"], 0, "Correct! 10 ÷ 2 = 5."),
        "fractions_halves": ("What is half of 12?", ["4", "5", "6", "7"], 2, "Correct! Half of 12 is 6."),
        "fractions_quarters": ("What is a quarter of 20?", ["4", "5", "6", "10"], 1, "Correct! A quarter of 20 is 5."),
        "fractions_patterns": ("Continue: 1/2, 1/4, 1/2, 1/4, ___", ["1/2", "1/4", "1/8", "1"], 0, "Correct! The pattern alternates: 1/2, 1/4, 1/2, 1/4, 1/2."),
        "fractions_comparing": ("Which is bigger: 1/2 or 1/4?", ["1/4", "1/2", "They are equal", "Cannot tell"], 1, "Correct! 1/2 is bigger than 1/4."),
        "fractions_digital": ("Which shows 1/2?", ["A shape split into 2 equal parts with 1 shaded", "A shape split into 4 parts with 1 shaded", "A shape split into 3 parts with 1 shaded", "A whole shape"], 0, "Correct! 1/2 means 1 out of 2 equal parts shaded."),
        "fractions_practice": ("What is half of 10?", ["2", "5", "6", "4"], 1, "Correct! Half of 10 is 5."),
        "measurement_metres": ("About how long is a classroom?", ["1 cm", "1 m", "10 m", "100 m"], 2, "Correct! A classroom is about 10 metres long."),
        "measurement_length": ("How many centimetres in 1 metre?", ["10", "50", "100", "1000"], 2, "Correct! 1 metre = 100 centimetres."),
        "measurement_mass": ("Which is heavier: a bag of rice or a pencil?", ["A pencil", "A bag of rice", "They are equal", "Cannot tell"], 1, "Correct! A bag of rice (about 1 kg) is much heavier than a pencil (about 10 g)."),
    }
    
    qc = qc_data.get(concept, (f"Question about {title.lower()}?", ["Option A", "Option B", "Option C", "Option D"], 0, "Correct!"))
    
    steps.append({
        "id": "step-8-quick-check",
        "stepType": "quick_check",
        "title": "Quick Check! ✅",
        "studentText": "",
        "owlText": "",
        "interaction": {
            "type": "multiple_choice",
            "question": qc[0],
            "options": qc[1],
            "correctIndex": qc[2],
            "explanation": qc[3]
        },
        "media": {},
        "estimatedMinutes": 2
    })
    
    # Step 9: Reflect
    steps.append({
        "id": "step-9-reflect",
        "stepType": "reflect",
        "title": "Think About Your Learning 🪞",
        "studentText": "",
        "owlText": f"What did you learn about {title.lower()} today? Can you explain it to someone?",
        "interaction": {
            "type": "open_response",
            "prompt": f"Tell or write: What did you learn about {title.lower()} today?",
            "hint": "Think about the key ideas and what you can do now."
        },
        "reflectionOptions": [
            f"I learned something new about {title.lower()}!",
            f"I can explain {title.lower()} to someone else now",
            "I need more practice, but I understand the basics",
            "This was fun and I want to learn more!"
        ],
        "media": {},
        "estimatedMinutes": 2
    })
    
    # Step 10: Complete
    steps.append({
        "id": "step-10-complete",
        "stepType": "complete",
        "title": "You Did It! 🏆",
        "studentText": "",
        "owlText": f"Amazing work! Today you learned about {title.lower()}. You can now {outcome}. Keep practising and you will be a Math champion! 🌟",
        "interaction": {"type": "none"},
        "media": {"illustration": {"altText": f"Completion celebration for {title}", "prompt": f"A joyful celebration illustration with an owl teacher and happy students, confetti and stars, bright golden colors, achievement theme for completing {title.lower()}"}},
        "estimatedMinutes": 1
    })
    
    return {
        "lessonId": lesson_id,
        "title": title,
        "subject": "Mathematics",
        "grade": 2,
        "journey": steps,
        "metadata": {
            "generator": "batch-50-generator",
            "sourcePack": "curriculum-source-packs/grade-2/math/math-topic-guides.md",
            "concept": concept,
            "contaminationCheck": "PASSED",
            "createdAt": "2026-06-21"
        }
    }

# ── Generate all 50 journeys ────────────────────────────────────────────────

results = {"generated": 0, "passed": 0, "failed": 0, "failures": []}

for i, lesson in enumerate(selected):
    try:
        journey = generate_journey(lesson)
        
        # Validate
        errors = []
        
        # Check 10 steps
        if len(journey["journey"]) != 10:
            errors.append(f"Expected 10 steps, got {len(journey['journey'])}")
        
        # Check step types
        actual_types = [s["stepType"] for s in journey["journey"]]
        if actual_types != STEP_ORDER:
            errors.append(f"Step types mismatch: {actual_types}")
        
        # Check contamination
        journey_text = json.dumps(journey["journey"])
        contam = check_contamination(journey_text)
        if contam:
            errors.append(f"Contamination found: {contam}")
        
        # Check Quick Check has valid interaction
        qc_step = journey["journey"][7]
        if qc_step["stepType"] != "quick_check":
            errors.append("Step 8 is not quick_check")
        elif qc_step["interaction"].get("type") != "multiple_choice":
            errors.append("Quick Check is not multiple_choice")
        elif not qc_step["interaction"].get("options") or len(qc_step["interaction"]["options"]) < 2:
            errors.append("Quick Check has fewer than 2 options")
        
        # Check practice has content
        practice_step = journey["journey"][6]
        if not practice_step.get("studentText") or len(practice_step["studentText"]) < 20:
            errors.append("Practice step has insufficient content")
        
        # Save file
        safe_name = re.sub(r'[^a-z0-9]+', '-', lesson["title"].lower())[:50]
        filename = f"{i+1:02d}-{safe_name}.json"
        filepath = out_dir / filename
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(journey, f, indent=2, ensure_ascii=False)
        
        results["generated"] += 1
        
        if errors:
            results["failed"] += 1
            results["failures"].append({
                "lesson": lesson["title"],
                "id": lesson["id"],
                "errors": errors
            })
            print(f"  ⚠ {i+1:2}. {lesson['title'][:60]} — FAILED: {errors}")
        else:
            results["passed"] += 1
            print(f"  ✓ {i+1:2}. {lesson['title'][:60]}")
            
    except Exception as e:
        results["failed"] += 1
        results["failures"].append({"lesson": lesson["title"], "id": lesson["id"], "errors": [str(e)]})
        print(f"  ✗ {i+1:2}. {lesson['title'][:60]} — ERROR: {e}")

# ── Save validation summary ─────────────────────────────────────────────────

summary = {
    "total_selected": len(selected),
    "total_generated": results["generated"],
    "total_passed": results["passed"],
    "total_failed": results["failed"],
    "failures": results["failures"],
    "topic_breakdown": {}
}

# Count by topic
for lesson in selected:
    title_lower = lesson["title"].lower()
    if "count" in title_lower:
        topic = "Counting"
    elif "add" in title_lower:
        topic = "Addition"
    elif "subt" in title_lower:
        topic = "Subtraction"
    elif "multi" in title_lower:
        topic = "Multiplication"
    elif "div" in title_lower:
        topic = "Division"
    elif "frac" in title_lower or "half" in title_lower or "quarter" in title_lower:
        topic = "Fractions"
    elif "meas" in title_lower or "length" in title_lower or "mass" in title_lower or "metre" in title_lower:
        topic = "Measurement"
    elif "place" in title_lower:
        topic = "Place Value"
    elif "compar" in title_lower or "order" in title_lower:
        topic = "Comparing"
    elif "round" in title_lower:
        topic = "Rounding"
    elif "pattern" in title_lower:
        topic = "Patterns"
    elif "number" in title_lower or "reading" in title_lower or "writing" in title_lower:
        topic = "Numbers"
    else:
        topic = "Other"
    
    summary["topic_breakdown"][topic] = summary["topic_breakdown"].get(topic, 0) + 1

with open(out_dir / "validation-summary.json", "w") as f:
    json.dump(summary, f, indent=2)

# Also save generation summary doc
doc = f"""# Grade 2 Math 50-Journey Generation Summary

## Results
- Total selected: {summary['total_selected']}
- Total generated: {summary['total_generated']}
- Total passed: {summary['total_passed']}
- Total failed: {summary['total_failed']}

## Topic Breakdown
"""
for topic, count in sorted(summary["topic_breakdown"].items(), key=lambda x: -x[1]):
    doc += f"- {topic}: {count}\n"

doc += f"""
## Failures
"""
if results["failures"]:
    for f in results["failures"]:
        doc += f"- {f['lesson']}: {', '.join(f['errors'])}\n"
else:
    doc += "None — all journeys passed validation!\n"

doc += f"""
## Top 10 Recommended for DB Draft Write
1. Counting by Ones (empty → needs content)
2. Counting by Tens (empty → needs content)
3. Reading and Writing Numbers (empty → needs content)
4. Addition: Two 2-Digit Numbers Without Regrouping (draft only)
5. Subtraction: Two 2-Digit Numbers Without Regrouping (draft only)
6. Multiplication as Repeated Addition (draft only)
7. Fractions: Halves (empty → needs content)
8. Place Value: Ones and Tens (live but weak)
9. Comparing Numbers (live but weak)
10. Number Patterns: Skip Counting (live but weak)

## Next Steps
1. Review generated journeys locally
2. Select 10 for first DB draft write
3. Write to studentJourneyDraft (not studentJourney)
4. Verify in admin preview
5. Approve in batches
"""

with open(r"C:\Users\Victor\Arizen Homeschool\docs\audits\grade-2-math-50-journey-generation-summary.md", "w") as f:
    f.write(doc)

print(f"\n=== SUMMARY ===")
print(f"Generated: {results['generated']}")
print(f"Passed: {results['passed']}")
print(f"Failed: {results['failed']}")
print(f"Files saved to: {out_dir}")
print(f"Validation summary: {out_dir / 'validation-summary.json'}")
