#!/usr/bin/env python3
"""
Batch 1 Journey Generator — Grade 2 Mathematics
Generates 10-step student journeys using structured templates + KICD content.
No AI required — uses pedagogical templates matched to lesson type.
"""

import json
import os
import sys
import uuid
from supabase import create_client

# ── Setup ──
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
env_vars = {}
with open(env_path, "r") as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            key, _, value = line.partition("=")
            env_vars[key.strip()] = value.strip().strip('"').strip("'")

url = env_vars.get("NEXT_PUBLIC_SUPABASE_URL", "")
key = env_vars.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
if not url or not key:
    print("ERROR: Missing Supabase credentials")
    sys.exit(1)

supabase = create_client(url, key)

BATCH_ID = "grade-2-math-batch-1"

# ── Lesson IDs ──
LESSON_IDS = [
    "377e0d32-066d-4bb2-8fb3-a3c790989905",  # 1. Reading Numbers 1 to 50 in Symbols
    "cfdd2c2e-c29d-4903-ab9b-cdb44037a8d0",  # 2. Counting in 2s Forward up to 100
    "f5bee6a0-8aa0-4a33-a536-dc563b53f4d1",  # 3. Introduction to Halves Using Circular Cut-outs
    "fb0e6e8e-5c88-4f48-8e65-dbb5e4c9ed0a",  # 4. Adding Single Digit Numbers Horizontally
    "11d88b45-b1a6-4143-9c04-42e88e57d080",  # 5. Subtracting Single Digit Numbers
    "6c4f60d2-f577-45cd-a25b-ca8f9eefc6e4",  # 6. Introduction to Multiplication as Repeated Addition
    "04268b1c-0e8f-4ecc-8c28-fb807617ca4a",  # 7. Measuring Length Using Fixed Units
    "2d0d0e1b-e7fc-454a-860a-5126895cce1e",  # 8. Measuring Capacity Using Fixed Units
    "ed2db75d-c71a-41d4-962d-a8e6ae561ed3",  # 9. Identifying Kenyan Currency up to Sh.100
    "15278d40-a028-40ae-91e6-b2fe6b1f647b",  # 10. Identifying Rectangles, Circles, Triangles, Ovals and Squares
]


def make_step(step_type, title, student_text, owl_text, interaction, materials=None, video_keywords="", illustration_prompt=""):
    """Create a single journey step."""
    return {
        "id": step_type,
        "stepType": step_type,
        "title": title,
        "studentText": student_text,
        "owlText": owl_text,
        "visualType": "owl_teacher",
        "illustrationPrompt": illustration_prompt,
        "interaction": interaction,
        "materials": materials or [],
        "video": {
            "required": False,
            "searchKeywords": video_keywords,
            "approvedUrl": None,
            "approvedByAdmin": False,
        },
    }


def make_mc_interaction(question, options):
    """Create a multiple choice interaction."""
    return {
        "type": "multiple_choice",
        "question": question,
        "options": [{"id": chr(97+i), "label": opt[0], "correct": opt[1]} for i, opt in enumerate(options)],
    }


def make_open_interaction(prompt):
    """Create an open response interaction."""
    return {"type": "open_response", "prompt": prompt}


def make_self_check(question, answer):
    """Create a self-check interaction."""
    return {"type": "self_check", "question": question, "answer": answer}


def make_chip_select(chips, write_prompt=""):
    """Create a chip select interaction."""
    return {"type": "chip_select_plus_write", "prompt": "Choose what you learned today:", "chips": chips, "writePrompt": write_prompt}


def make_numeric_interaction(prompt, expected):
    """Create a numeric interaction."""
    return {"type": "open_numeric", "prompt": prompt, "expectedAnswer": expected}


# ── Journey Templates ──

def generate_reading_numbers_journey():
    """Journey for: Reading Numbers 1 to 50 in Symbols"""
    return [
        make_step("welcome", "Numbers Are Everywhere!",
            "Today you will read numbers from 1 all the way up to 50! Numbers are everywhere — on clocks, books, and bottles.",
            "Hello, learner! I am excited to explore numbers with you. We will read number symbols together. Ready?",
            {"type": "none"},
            ["pencil", "notebook"],
            "Grade 2 reading numbers 1 to 50 symbols",
            "A friendly cartoon owl teacher holding up a card with '1–50' in big colorful numbers"),

        make_step("mission", "Your Number Mission",
            "By the end of this lesson, you will:\n• Read numbers 1–50 in symbols\n• Count objects and match them to the right number",
            "Your mission is to see numbers everywhere and read them aloud. I will guide you so you feel confident!",
            {"type": "none"},
            ["pencil", "notebook"]),

        make_step("think_first", "What Numbers Do You See?",
            "Look around your class or home. Write down three places where you see numbers (on a clock, a bottle, a book). What numbers do you notice?",
            "Numbers are all around us. Look at the clock, bottles, books, or bags. Write three numbers you see.",
            make_open_interaction("Write three numbers you see around you."),
            ["pencil", "notebook"]),

        make_step("learn", "Reading Numbers 1–50 in Symbols",
            "Numbers like 7, 12, 25, 36, and 49 are symbols. Say each symbol aloud: '7 is seven', '12 is twelve'. Point at each number as you read it.",
            "Let's read numbers slowly. Point at 1, say 'one'. Point at 10, say 'ten'. Go up to 50. Use your finger to trace each number.",
            make_self_check("Is 27 written as 'twenty-seven'?", "Yes"),
            ["pencil", "notebook"],
            "reading numbers 1 to 50 in symbols for Grade 2",
            "A number line from 1 to 50 with colorful dots and a child's finger pointing to numbers"),

        make_step("connect", "Count With Real Objects",
            "Collect 20 objects like bottle tops or pencils. Count them one by one. What is the last number you reach?",
            "Use safe objects like bottle tops or pencils. Put them in a line. Count aloud: one, two, three… Stop at 20.",
            make_numeric_interaction("How many objects did you count in total?", 20),
            ["bottle tops", "pencils", "stones"],
            "Grade 2 counting objects 1–50 CBC",
            "A child counting bottle tops in a line on a table, writing '20' beside the last one"),

        make_step("example", "Worked Example: From Objects to Numbers",
            "There are 36 bottle tops in a jar. Count them into groups of ten. After three full groups of ten, count six more. Write: 36.",
            "Watch how we count in tens. Ten, twenty, thirty — that's 30. Then count six more: thirty-one, thirty-two… thirty-six!",
            {"type": "none"},
            ["bottle tops", "cups", "pencil", "notebook"],
            "reading numbers 1 to 50 in symbols Grade 2",
            "Illustration showing three groups of ten bottle tops and six extra ones, with '30 + 6 = 36'"),

        make_step("practice", "Try Together: Group Count",
            "Work in groups of five. Count your fingers and toes altogether. Write the number for your group.",
            "Each person has 10 fingers. Count by tens. Two learners: 20. Five learners: 50.",
            make_numeric_interaction("How many fingers do five learners have altogether?", 50),
            ["your hands and feet", "pencil", "notebook"],
            "counting fingers and toes Grade 2 CBC",
            "Five children sitting in a circle, each holding up their fingers"),

        make_step("practice", "Try It Yourself: Number Hunt",
            "Go on a number hunt. Find 10 objects in your classroom or home. Count them and write the number symbol for each group.",
            "You are the Number Explorer! Find books, cups, pencils — anything safe. Count and write the number.",
            make_open_interaction("Write down the number symbols you found. Example: Books = __, Cups = __"),
            ["pencil", "notebook", "safe household objects"],
            "Grade 2 number hunt activity",
            "A child pointing at books, cups, and pencils, writing numbers beside each group"),

        make_step("quick_check", "Quick Check: Which Is Correct?",
            "Choose the correct way to write each number.",
            "Look carefully. Match number names to their symbols. Take your time!",
            make_mc_interaction("How do we write forty-nine?", [("49", True), ("94", False), ("409", False)]),
            ["pencil"],
            "reading number symbols 1–50 Grade 2",
            "Three cartoon owls holding cards with numbers 7, 15, 28, 36, 49"),

        make_step("reflect", "What Did You Learn Today?",
            "Choose what you learned. Then write or draw one way you will use numbers at home or school.",
            "Think carefully. Today you read numbers from 1 to 50 and counted real objects. You did a wonderful job!",
            make_chip_select([
                "I can read numbers from 1 to 50.",
                "I can count objects and write the number.",
                "I see numbers around me every day.",
                "I can work with friends to count together."
            ], "Write or draw one way you will use numbers at home or school."),
            ["pencil", "notebook"]),

        make_step("complete", "Well Done, Number Explorer!",
            "You read numbers up to 50 and counted real objects. Keep practicing at home — count spoons, books, or pencils with your family!",
            "You are brilliant! Reading numbers is a superpower. Use it every day. See you in the next lesson!",
            {"type": "none"},
            [],
            "Grade 2 reading numbers 1 to 50 symbols",
            "A cheerful owl teacher giving a thumbs-up to a child holding a notebook with numbers"),
    ]


def generate_counting_2s_journey():
    """Journey for: Counting in 2s Forward up to 100"""
    return [
        make_step("welcome", "Let's Count by Twos!",
            "Today we count by 2s — 2, 4, 6, 8, 10… all the way to 100! This is called skip counting.",
            "Hello! Skip counting is like jumping on a number line. We jump by 2s today. Ready to jump?",
            {"type": "none"},
            ["pencil", "notebook"],
            "Grade 2 skip counting by 2s",
            "A number line with arrows jumping by 2s, a child hopping along it"),

        make_step("mission", "Your Skip-Counting Mission",
            "By the end of this lesson, you will:\n• Count forward by 2s up to 100\n• Use your fingers and toes to help you count",
            "Your mission is to count by 2s. I will show you how. It's like a fun jumping game!",
            {"type": "none"},
            ["pencil", "notebook"]),

        make_step("think_first", "Can You Count by 2s?",
            "Try counting by 2s from memory. Start at 2. How far can you go? Write the numbers you remember.",
            "Don't worry if you can't go all the way to 100 yet. We will learn together!",
            make_open_interaction("Write the numbers when you count by 2s: 2, 4, 6, __, __, __"),
            ["pencil", "notebook"]),

        make_step("learn", "Counting by 2s Forward",
            "When we count by 2s, we add 2 each time: 2, 4, 6, 8, 10, 12… Notice the pattern? The last digit goes 2, 4, 6, 8, 0, 2, 4, 6, 8, 0…",
            "Watch the pattern. After 10 comes 12, then 14, 16, 18, 20. The ones digit repeats: 2, 4, 6, 8, 0!",
            make_self_check("What comes after 28 when counting by 2s?", "30"),
            ["pencil", "notebook"],
            "Grade 2 counting by 2s forward",
            "A number line from 0 to 30 with circles on 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30"),

        make_step("connect", "Count Your Fingers and Toes",
            "You have 10 fingers. Count them by 2s: 2, 4, 6, 8, 10. Now count your toes by 2s. How many altogether?",
            "Your body is a counting machine! 10 fingers + 10 toes = 20. Count by 2s: 2, 4, 6… 20!",
            make_numeric_interaction("How many fingers and toes do you have altogether? Count by 2s.", 20),
            ["your hands and feet"],
            "Grade 2 counting fingers and toes by 2s",
            "A child holding up hands and toes, with numbers 2, 4, 6, 8, 10 written above each group"),

        make_step("example", "Worked Example: Counting Bottle Tops by 2s",
            "Let's count 20 bottle tops by 2s. Put them in pairs. Count: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20. Ten pairs!",
            "Watch me count. Each pair is 2. Ten pairs make 20. Now you try with 12 bottle tops.",
            make_numeric_interaction("If you have 6 pairs of bottle tops, how many bottle tops do you have?", 12),
            ["bottle tops", "pencil", "notebook"],
            "counting by 2s with objects Grade 2",
            "Bottle tops arranged in pairs, with numbers 2, 4, 6, 8, 10, 12 written below each pair"),

        make_step("practice", "Try Together: Count the Class",
            "Count the learners in your group by 2s. How many are there? Write the counting-by-2s numbers.",
            "Work with your group. Count heads by 2s. If there are 6 learners, you count: 2, 4, 6.",
            make_open_interaction("Write the counting-by-2s numbers for your group."),
            ["pencil", "notebook"]),

        make_step("practice", "Try It Yourself: Fill in the Pattern",
            "Fill in the missing numbers: 2, 4, __, 8, __, 12, __, 16, __, 20",
            "Look at the pattern. We add 2 each time. What numbers are missing?",
            make_open_interaction("Write the missing numbers: 2, 4, __, 8, __, 12, __, 16, __, 20"),
            ["pencil", "notebook"],
            "Grade 2 number patterns counting by 2s",
            "A sequence with blanks: 2, 4, _, 8, _, 12, _, 16, _, 20"),

        make_step("quick_check", "Quick Check: What Comes Next?",
            "Choose the correct answer. Look carefully!",
            "You are doing great! Let's check what you remember.",
            make_mc_interaction("What comes after 44 when counting by 2s?", [("45", False), ("46", True), ("48", False)]),
            ["pencil"],
            "Grade 2 skip counting by 2s quick check",
            "A cartoon owl holding a sign: 'What comes after 44?'"),

        make_step("reflect", "What Did You Learn?",
            "Choose what you learned. Then write one thing you want to practice more.",
            "You counted by 2s today! That's a big achievement. What will you practice?",
            make_chip_select([
                "I can count by 2s up to 100.",
                "I can count objects in groups of 2.",
                "I know the pattern: 2, 4, 6, 8, 10…",
                "I can count fingers and toes by 2s."
            ], "Write one thing you want to practice more."),
            ["pencil", "notebook"]),

        make_step("complete", "Super Skip Counter!",
            "You can count by 2s! Practice at home — count cups, spoons, or books by 2s with your family.",
            "You are a skip-counting star! Keep practicing. Next time we will count by 5s!",
            {"type": "none"},
            [],
            "Grade 2 skip counting celebration",
            "A cheerful owl with confetti and a child holding a 'I can count by 2s!' sign"),
    ]


def generate_halves_journey():
    """Journey for: Introduction to Halves Using Circular Cut-outs"""
    return [
        make_step("welcome", "Let's Share Equally!",
            "Today we learn about halves! When you share something equally between 2 people, each person gets a half.",
            "Hello! Fractions are about sharing equally. Today we fold paper to find halves. Ready?",
            {"type": "none"},
            ["paper", "pencil"],
            "Grade 2 introduction to halves",
            "A cartoon owl holding a circle cut in half, with two children sharing"),

        make_step("mission", "Your Fraction Mission",
            "By the end of this lesson, you will:\n• Fold a circle into two equal parts\n• Know that each part is called a half\n• Write the fraction 1/2",
            "Your mission is to discover halves by folding paper. I will guide you step by step!",
            {"type": "none"},
            ["paper", "pencil"]),

        make_step("think_first", "Have You Shared Before?",
            "Have you ever shared a fruit or a piece of bread with a friend? How did you make it fair?",
            "Sharing equally is what fractions are about. When two people share equally, each gets a half.",
            make_open_interaction("Tell about a time you shared something equally with a friend or family member."),
            ["pencil", "notebook"]),

        make_step("learn", "What Is a Half?",
            "When we fold a circle into TWO EQUAL parts, each part is called a HALF. We write it as 1/2. The bottom number (2) tells us how many equal parts. The top number (1) tells us how many parts we have.",
            "Watch carefully. I fold the circle so both sides match exactly. Each side is 1/2. They must be EQUAL!",
            make_self_check("If I fold a circle into 2 equal parts, is each part called a half?", "Yes"),
            ["paper", "pencil"],
            "Grade 2 what is a half fraction",
            "A circle being folded in half, with '1/2' written on each half"),

        make_step("connect", "Halves in Real Life",
            "Look around. Can you find things that are cut or folded in half? Think of a chapati, a piece of paper, or a fruit.",
            "Halves are everywhere! A chapati cut down the middle. A banana broken in two. Each piece is 1/2.",
            make_open_interaction("Name two things you can cut or fold into halves."),
            ["pencil", "notebook"]),

        make_step("example", "Worked Example: Folding a Circle",
            "Take a circle. Fold it so the edges match exactly. Open it. You see two equal parts. Each part is 1/2. Write 1/2 on each part.",
            "Watch me fold. The edges must match. If they don't match, it's not a half! Now you try.",
            {"type": "none"},
            ["paper", "pencil", "crayons"],
            "Grade 2 folding a circle into halves",
            "Step-by-step illustration: circle → fold → open → two equal parts labeled 1/2"),

        make_step("practice", "Try Together: Fold and Check",
            "Work with a partner. Each of you fold a circle into halves. Check: do the edges match? Write 1/2 on each part.",
            "Help each other. The fold must be exact. If the two parts are not equal, try again!",
            make_self_check("Did your circle fold into two equal parts?", "Yes"),
            ["paper", "pencil", "crayons"]),

        make_step("practice", "Try It Yourself: Draw Halves",
            "Draw a circle. Draw a line down the middle to make two equal parts. Color one part. Write 1/2 on the colored part.",
            "Your line should go right through the center. Both sides should look the same size.",
            {"type": "none"},
            ["paper", "pencil", "crayons"],
            "Grade 2 drawing halves activity",
            "A child drawing a circle, folding it, and coloring one half"),

        make_step("quick_check", "Quick Check: Which Shows a Half?",
            "Look at the pictures. Choose the one that shows a half.",
            "Remember: a half means TWO EQUAL parts. Look carefully!",
            make_mc_interaction("Which shape shows a half?", [
                ("A circle folded into 2 equal parts", True),
                ("A circle folded into 3 parts", False),
                ("A circle folded into 4 parts", False)
            ]),
            ["pencil"],
            "Grade 2 identifying halves",
            "Three shapes: one folded in 2 equal parts, one in 3, one in 4"),

        make_step("reflect", "What Did You Learn About Halves?",
            "Choose what you learned. Then draw something you can cut into halves.",
            "You discovered halves today! That's the first step into the world of fractions.",
            make_chip_select([
                "I can fold a circle into two equal parts.",
                "I know each part is called a half.",
                "I can write the fraction 1/2.",
                "I can find halves in real life."
            ], "Draw something you can cut into halves."),
            ["pencil", "notebook", "crayons"]),

        make_step("complete", "Halfway to Fractions!",
            "You learned about halves! At home, try cutting a fruit or chapati into two equal halves.",
            "You are a fraction explorer! Next time we will learn about quarters. Well done!",
            {"type": "none"},
            [],
            "Grade 2 fractions celebration",
            "A cheerful owl holding a circle cut in half, with '1/2' written on each part"),
    ]


def generate_addition_journey():
    """Journey for: Adding Single Digit Numbers Horizontally"""
    return [
        make_step("welcome", "Let's Add Numbers!",
            "Today we learn to add single digit numbers. Adding means putting numbers together to get a bigger number.",
            "Hello! Adding is like collecting things. If you have 3 pencils and get 2 more, how many do you have?",
            {"type": "none"},
            ["pencil", "notebook", "counters"],
            "Grade 2 addition single digit",
            "A cartoon owl holding 3 pencils in one hand and 2 in the other"),

        make_step("mission", "Your Addition Mission",
            "By the end of this lesson, you will:\n• Add single digit numbers horizontally\n• Use objects to help you add\n• Write addition sentences",
            "Your mission is to become an addition expert! I will show you how to add using objects.",
            {"type": "none"},
            ["pencil", "notebook", "counters"]),

        make_step("think_first", "How Many Altogether?",
            "You have 4 bottle tops. Your friend gives you 3 more. How many bottle tops do you have altogether?",
            "This is adding! We put 4 and 3 together. Try to figure it out before we learn the steps.",
            make_numeric_interaction("4 + 3 = ?", 7),
            ["bottle tops", "pencil"]),

        make_step("learn", "Adding Horizontally",
            "When we add horizontally, we write: 4 + 3 = 7. The + means 'put together'. The = means 'is the same as'. We read it as 'four plus three equals seven'.",
            "The + sign means put together. The = sign means 'the answer is'. So 4 + 3 = 7 means 'four put together with three is seven'.",
            make_self_check("What does the + sign mean?", "Put together"),
            ["pencil", "notebook"],
            "Grade 2 addition horizontal",
            "An addition sentence '4 + 3 = 7' with 4 circles and 3 circles merging into 7 circles"),

        make_step("connect", "Add With Your Fingers",
            "Hold up 5 fingers on one hand. Hold up 2 fingers on the other. Put them together. How many fingers?",
            "Your fingers are adding machines! 5 fingers + 2 fingers = 7 fingers!",
            make_numeric_interaction("5 + 2 = ?", 7),
            ["your hands"],
            "Grade 2 addition with fingers",
            "Two hands showing 5 and 2 fingers, with '5 + 2 = 7' written below"),

        make_step("example", "Worked Example: Adding With Objects",
            "There are 6 cups on the table. Add 3 more cups. Count all the cups: 6 + 3 = 9 cups altogether.",
            "Watch me count. Start at 6, then count 3 more: 7, 8, 9. So 6 + 3 = 9!",
            make_numeric_interaction("If there are 5 books and you add 4 more, how many books are there?", 9),
            ["cups", "books", "pencil", "notebook"],
            "Grade 2 addition with objects",
            "6 cups + 3 cups = 9 cups, shown with pictures"),

        make_step("practice", "Try Together: Add With Counters",
            "Take 7 counters. Add 2 more. Write the addition sentence: 7 + 2 = ?",
            "Count all your counters. Start at 7, count 2 more: 8, 9. So 7 + 2 = 9!",
            make_numeric_interaction("7 + 2 = ?", 9),
            ["counters", "bottle tops", "pencil", "notebook"]),

        make_step("practice", "Try It Yourself: Write Addition Sentences",
            "Write the addition sentence for each:\na) 3 pencils + 4 pencils = ?\nb) 5 stones + 3 stones = ?",
            "Remember: first number + second number = total. Write each one as a number sentence.",
            make_open_interaction("Write the addition sentences:\na) 3 + 4 = __\nb) 5 + 3 = __"),
            ["pencil", "notebook"],
            "Grade 2 writing addition sentences",
            "A notebook with addition sentences being written"),

        make_step("quick_check", "Quick Check: What Is the Answer?",
            "Choose the correct answer.",
            "You are doing great! Let's check your addition skills.",
            make_mc_interaction("What is 6 + 3?", [("8", False), ("9", True), ("10", False)]),
            ["pencil"],
            "Grade 2 addition quick check",
            "A cartoon owl holding a sign: '6 + 3 = ?'"),

        make_step("reflect", "What Did You Learn About Adding?",
            "Choose what you learned. Then write one addition sentence about your family.",
            "You learned to add today! Adding helps us count things in real life.",
            make_chip_select([
                "I can add single digit numbers.",
                "I know what the + and = signs mean.",
                "I can use objects to help me add.",
                "I can write addition sentences."
            ], "Write one addition sentence about your family. Example: 2 sisters + 1 brother = 3 children"),
            ["pencil", "notebook"]),

        make_step("complete", "Addition Expert!",
            "You can add single digit numbers! Practice at home — add cups, spoons, or books.",
            "You are an addition star! Keep practicing. Next time we will add bigger numbers!",
            {"type": "none"},
            [],
            "Grade 2 addition celebration",
            "A cheerful owl with a medal that says 'Addition Expert'"),
    ]


def generate_subtraction_journey():
    """Journey for: Subtracting Single Digit Numbers"""
    return [
        make_step("welcome", "Let's Take Away!",
            "Today we learn to subtract. Subtracting means taking away. If you have 8 sweets and eat 3, how many are left?",
            "Hello! Subtracting is like giving away or eating. We start with a number and take some away.",
            {"type": "none"},
            ["pencil", "notebook", "counters"],
            "Grade 2 subtraction single digit",
            "A cartoon owl holding 8 sweets, with 3 being taken away"),

        make_step("mission", "Your Subtraction Mission",
            "By the end of this lesson, you will:\n• Subtract single digit numbers\n• Use objects to help you subtract\n• Write subtraction sentences",
            "Your mission is to become a subtraction expert! I will show you how to take away.",
            {"type": "none"},
            ["pencil", "notebook", "counters"]),

        make_step("think_first", "How Many Are Left?",
            "You have 7 pencils. You give 2 pencils to your friend. How many pencils do you have left?",
            "This is subtracting! We start with 7 and take away 2. Try to figure it out.",
            make_numeric_interaction("7 - 2 = ?", 5),
            ["pencils"]),

        make_step("learn", "Subtracting Horizontally",
            "When we subtract horizontally, we write: 7 - 2 = 5. The - means 'take away'. The = means 'is the same as'. We read it as 'seven take away two equals five'.",
            "The - sign means take away. The = sign means 'the answer is'. So 7 - 2 = 5 means 'seven take away two is five'.",
            make_self_check("What does the - sign mean?", "Take away"),
            ["pencil", "notebook"],
            "Grade 2 subtraction horizontal",
            "A subtraction sentence '7 - 2 = 5' with 7 circles and 2 crossed out, leaving 5"),

        make_step("connect", "Subtract With Your Fingers",
            "Hold up 8 fingers. Put down 3 fingers. How many fingers are still up?",
            "Your fingers are subtracting machines too! 8 fingers - 3 fingers = 5 fingers!",
            make_numeric_interaction("8 - 3 = ?", 5),
            ["your hands"],
            "Grade 2 subtraction with fingers",
            "Two hands showing 8 fingers with 3 folded down, showing 5 remaining"),

        make_step("example", "Worked Example: Subtracting With Objects",
            "There are 9 cups. Take away 4 cups. Count the cups left: 9 - 4 = 5 cups.",
            "Watch me count. Start at 9, take away 4: 8, 7, 6, 5. So 9 - 4 = 5!",
            make_numeric_interaction("If there are 10 books and you take away 6, how many are left?", 4),
            ["cups", "books", "pencil", "notebook"],
            "Grade 2 subtraction with objects",
            "9 cups with 4 crossed out, showing 5 remaining"),

        make_step("practice", "Try Together: Subtract With Counters",
            "Take 6 counters. Take away 4. Write the subtraction sentence: 6 - 4 = ?",
            "Count what's left. Start at 6, take away 4: 5, 4, 3, 2. So 6 - 4 = 2!",
            make_numeric_interaction("6 - 4 = ?", 2),
            ["counters", "bottle tops", "pencil", "notebook"]),

        make_step("practice", "Try It Yourself: Write Subtraction Sentences",
            "Write the subtraction sentence for each:\na) 8 stones - 3 stones = ?\nb) 10 pencils - 6 pencils = ?",
            "Remember: first number - second number = what's left. Write each one.",
            make_open_interaction("Write the subtraction sentences:\na) 8 - 3 = __\nb) 10 - 6 = __"),
            ["pencil", "notebook"]),

        make_step("quick_check", "Quick Check: What Is the Answer?",
            "Choose the correct answer.",
            "You are doing great! Let's check your subtraction skills.",
            make_mc_interaction("What is 9 - 5?", [("3", False), ("4", True), ("5", False)]),
            ["pencil"],
            "Grade 2 subtraction quick check",
            "A cartoon owl holding a sign: '9 - 5 = ?'"),

        make_step("reflect", "What Did You Learn About Subtracting?",
            "Choose what you learned. Then write one subtraction sentence about your home.",
            "You learned to subtract today! Subtracting helps us find what's left.",
            make_chip_select([
                "I can subtract single digit numbers.",
                "I know what the - and = signs mean.",
                "I can use objects to help me subtract.",
                "I can write subtraction sentences."
            ], "Write one subtraction sentence about your home. Example: 6 chairs - 2 chairs = 4 chairs"),
            ["pencil", "notebook"]),

        make_step("complete", "Subtraction Star!",
            "You can subtract single digit numbers! Practice at home — subtract fruits, cups, or books.",
            "You are a subtraction star! Keep practicing. Next time we will subtract bigger numbers!",
            {"type": "none"},
            [],
            "Grade 2 subtraction celebration",
            "A cheerful owl with a medal that says 'Subtraction Star'"),
    ]


def generate_multiplication_journey():
    """Journey for: Introduction to Multiplication as Repeated Addition"""
    return [
        make_step("welcome", "Let's Multiply!",
            "Today we learn about multiplication. Multiplication is just adding the same number many times. It's like counting groups!",
            "Hello! Multiplication is a shortcut for adding the same number over and over. Ready to discover it?",
            {"type": "none"},
            ["pencil", "notebook", "counters"],
            "Grade 2 introduction to multiplication",
            "A cartoon owl holding groups of 3 counters each"),

        make_step("mission", "Your Multiplication Mission",
            "By the end of this lesson, you will:\n• Understand multiplication as repeated addition\n• Use groups to multiply\n• Write multiplication sentences",
            "Your mission is to discover multiplication! I will show you how groups make multiplying easy.",
            {"type": "none"},
            ["pencil", "notebook", "counters"]),

        make_step("think_first", "How Many in Groups?",
            "You have 3 groups of 2 pencils each. How many pencils are there altogether? Count: 2, 4, 6.",
            "When we have equal groups, we can add OR multiply. 2 + 2 + 2 = 6. That's 3 groups of 2!",
            make_numeric_interaction("3 groups of 2 = ? pencils", 6),
            ["pencils"]),

        make_step("learn", "Multiplication Is Repeated Addition",
            "3 groups of 2 means: 2 + 2 + 2 = 6. We can write this as 3 × 2 = 6. The × means 'groups of'. We read it as 'three times two equals six'.",
            "The × sign means 'groups of'. So 3 × 2 means '3 groups of 2'. It's the same as 2 + 2 + 2!",
            make_self_check("What does the × sign mean?", "Groups of"),
            ["pencil", "notebook"],
            "Grade 2 multiplication as repeated addition",
            "Three groups of 2 circles each, with '3 × 2 = 6' written below"),

        make_step("connect", "Groups in Real Life",
            "Look around. Can you see groups? Eggs in a tray (3 groups of 2). Fingers on hands (5 groups of 1). Wheels on bicycles (2 groups of 1).",
            "Multiplication is everywhere! Eggs, fingers, wheels — they all come in groups.",
            make_open_interaction("Name two things that come in groups."),
            ["pencil", "notebook"]),

        make_step("example", "Worked Example: Groups of Counters",
            "Make 4 groups of 3 counters. Count: 3 + 3 + 3 + 3 = 12. Write: 4 × 3 = 12.",
            "Watch me make the groups. Each group has 3. Four groups: 3, 6, 9, 12. So 4 × 3 = 12!",
            make_numeric_interaction("2 groups of 5 = ?", 10),
            ["counters", "bottle tops", "pencil", "notebook"],
            "Grade 2 multiplication with groups of counters",
            "4 groups of 3 counters each, with '4 × 3 = 12' written below"),

        make_step("practice", "Try Together: Make Groups",
            "Make 3 groups of 4 counters. Write the addition sentence and the multiplication sentence.",
            "Count each group: 4 + 4 + 4 = 12. Now write: 3 × 4 = 12!",
            make_numeric_interaction("3 × 4 = ?", 12),
            ["counters", "bottle tops", "pencil", "notebook"]),

        make_step("practice", "Try It Yourself: Draw Groups",
            "Draw 2 groups of 5 circles. Write the multiplication sentence: 2 × 5 = ?",
            "Draw two circles with 5 dots in each. Count all the dots: 5 + 5 = 10. So 2 × 5 = 10!",
            {"type": "none"},
            ["pencil", "notebook", "crayons"],
            "Grade 2 drawing multiplication groups",
            "A child drawing 2 groups of 5 circles"),

        make_step("quick_check", "Quick Check: What Is 3 × 2?",
            "Choose the correct answer.",
            "Remember: 3 × 2 means 3 groups of 2. That's 2 + 2 + 2 = ?",
            make_mc_interaction("What is 3 × 2?", [("5", False), ("6", True), ("8", False)]),
            ["pencil"],
            "Grade 2 multiplication quick check",
            "A cartoon owl holding a sign: '3 × 2 = ?'"),

        make_step("reflect", "What Did You Learn About Multiplication?",
            "Choose what you learned. Then draw 2 groups of 3 and write the multiplication sentence.",
            "You discovered multiplication today! It's just adding the same number many times.",
            make_chip_select([
                "I know multiplication is repeated addition.",
                "I can make groups and write multiplication sentences.",
                "I know what the × sign means.",
                "I can find groups in real life."
            ], "Draw 2 groups of 3. Write: 2 × 3 = __"),
            ["pencil", "notebook", "crayons"]),

        make_step("complete", "Multiplication Explorer!",
            "You learned about multiplication! At home, look for groups — eggs, cups, fingers — and multiply!",
            "You are a multiplication explorer! Next time we will multiply bigger numbers. Well done!",
            {"type": "none"},
            [],
            "Grade 2 multiplication celebration",
            "A cheerful owl with a medal that says 'Multiplication Explorer'"),
    ]


def generate_length_journey():
    """Journey for: Measuring Length Using Fixed Units"""
    return [
        make_step("welcome", "Let's Measure!",
            "Today we learn to measure length using fixed units. We use sticks of the same length to measure things!",
            "Hello! Measuring helps us know how long or tall things are. Today we use sticks to measure.",
            {"type": "none"},
            ["sticks of equal length", "pencil", "notebook"],
            "Grade 2 measuring length",
            "A cartoon owl holding a stick next to a desk"),

        make_step("mission", "Your Measuring Mission",
            "By the end of this lesson, you will:\n• Measure length using fixed units (sticks)\n• Record your measurements\n• Compare lengths of different objects",
            "Your mission is to become a measurer! I will show you how to use sticks to measure.",
            {"type": "none"},
            ["sticks of equal length", "pencil", "notebook"]),

        make_step("think_first", "Which Is Longer?",
            "Look at your desk and the classroom door. Which is longer? How can you tell without measuring?",
            "We can compare by looking, but measuring gives us the exact answer. Let's learn how!",
            make_open_interaction("Which do you think is longer — your desk or the classroom door? Why?"),
            ["pencil", "notebook"]),

        make_step("learn", "Measuring With Fixed Units",
            "To measure, we use sticks of the SAME length. Lay the stick along the object. Count how many sticks fit. That's the length in 'sticks'.",
            "The sticks must be the same length! If they are different sizes, our measurement won't be accurate.",
            make_self_check("Do all the sticks need to be the same length?", "Yes"),
            ["sticks of equal length", "pencil"],
            "Grade 2 measuring with fixed units",
            "A desk being measured with 4 sticks laid end-to-end"),

        make_step("connect", "Measure Your Desk",
            "Take a stick. Lay it along the edge of your desk. Count how many sticks fit. Write the number.",
            "Work carefully. Place the sticks end to end with no gaps. How many sticks is your desk?",
            make_open_interaction("My desk is __ sticks long."),
            ["sticks of equal length", "pencil", "notebook"],
            "Grade 2 measuring desk with sticks",
            "A child laying sticks along the edge of a desk, counting"),

        make_step("example", "Worked Example: Measuring a Book",
            "To measure a book, lay a stick along the long side. The book is 2 sticks long. Write: Book = 2 sticks.",
            "Watch me measure. I place the stick at the edge, mark the end, then place it again. The book is 2 sticks long!",
            {"type": "none"},
            ["sticks of equal length", "books", "pencil", "notebook"],
            "Grade 2 measuring a book with sticks",
            "A book with 2 sticks laid along its long side"),

        make_step("practice", "Try Together: Measure Three Objects",
            "Work in pairs. Measure three objects in your classroom. Record: Object = __ sticks.",
            "Help each other. Place sticks carefully. Write down each measurement.",
            make_open_interaction("Measure three objects:\n1. __ = __ sticks\n2. __ = __ sticks\n3. __ = __ sticks"),
            ["sticks of equal length", "pencil", "notebook"]),

        make_step("practice", "Try It Yourself: Estimate and Measure",
            "Estimate: How many sticks long is your pencil? Now measure. Were you close?",
            "Estimating means guessing before measuring. Then we check by measuring!",
            make_open_interaction("My pencil: I estimated __ sticks. I measured __ sticks."),
            ["sticks of equal length", "pencil", "notebook"]),

        make_step("quick_check", "Quick Check: How Many Sticks?",
            "Look at the picture. How many sticks long is the table?",
            "Count carefully. Each stick is the same length.",
            make_mc_interaction("The table is __ sticks long.", [("3", False), ("4", True), ("5", False)]),
            ["pencil"],
            "Grade 2 measuring length quick check",
            "A picture of a table with 4 sticks laid along it"),

        make_step("reflect", "What Did You Learn About Measuring?",
            "Choose what you learned. Then measure one thing at home and tell your family.",
            "You learned to measure today! Measuring helps us know the size of things.",
            make_chip_select([
                "I can measure length using fixed units.",
                "I know all sticks must be the same length.",
                "I can record measurements.",
                "I can estimate before measuring."
            ], "Measure one thing at home. Write: __ = __ sticks."),
            ["pencil", "notebook"]),

        make_step("complete", "Measuring Star!",
            "You can measure length using fixed units! At home, measure your bed, door, or table with a stick.",
            "You are a measuring star! Next time we will learn about metres. Well done!",
            {"type": "none"},
            [],
            "Grade 2 measuring celebration",
            "A cheerful owl with a medal that says 'Measuring Star'"),
    ]


def generate_capacity_journey():
    """Journey for: Measuring Capacity Using Fixed Units"""
    return [
        make_step("welcome", "Let's Measure How Much!",
            "Today we learn to measure capacity — how much liquid a container can hold. We use small containers to fill big ones!",
            "Hello! Capacity is how much a container can hold. Today we measure with water and containers.",
            {"type": "none"},
            ["containers of different sizes", "water", "pencil", "notebook"],
            "Grade 2 measuring capacity",
            "A cartoon owl pouring water from a small container into a large one"),

        make_step("mission", "Your Capacity Mission",
            "By the end of this lesson, you will:\n• Measure capacity using fixed units (small containers)\n• Count how many small containers fill a big one\n• Compare the capacity of different containers",
            "Your mission is to discover how much containers can hold! I will show you how.",
            {"type": "none"},
            ["containers of different sizes", "water", "pencil", "notebook"]),

        make_step("think_first", "Which Holds More?",
            "Look at a cup and a bucket. Which holds more water? How can you find out?",
            "We can guess, but measuring tells us exactly. Let's learn how to measure capacity!",
            make_open_interaction("Which holds more — a cup or a bucket? How can you find out?"),
            ["pencil", "notebook"]),

        make_step("learn", "Measuring Capacity With Fixed Units",
            "To measure capacity, we use a small container as our unit. Fill the small container with water. Pour it into the big container. Count how many small containers fill the big one.",
            "The small container is our 'measuring cup'. We count how many times we fill and pour. That tells us the capacity!",
            make_self_check("Do we use the same small container each time?", "Yes"),
            ["containers", "water", "pencil"],
            "Grade 2 measuring capacity with fixed units",
            "A small cup being poured into a large container, with numbers 1, 2, 3, 4 written"),

        make_step("connect", "Capacity at Home",
            "At home, your family uses containers to measure water, milk, or cooking oil. A cup, a jug, and a saucepan all have different capacities.",
            "Think about cooking. Your mother might use a cup to measure water. That's measuring capacity!",
            make_open_interaction("Name two containers your family uses at home. Which holds more?"),
            ["pencil", "notebook"]),

        make_step("example", "Worked Example: Filling a Basin",
            "Take a small cup. Fill it with water. Pour it into the basin. Count: 1, 2, 3… The basin holds 8 cups of water.",
            "Watch me pour. Each time I pour, I count. The basin holds 8 cups. We write: Basin = 8 cups.",
            make_numeric_interaction("If a jug holds 3 cups of water, how many cups fill 2 jugs?", 6),
            ["cups", "basin", "water", "pencil", "notebook"],
            "Grade 2 measuring capacity with cups",
            "A basin being filled with cups of water, numbered 1 through 8"),

        make_step("practice", "Try Together: Measure Two Containers",
            "Work in pairs. Use a small cup to measure two different containers. Record how many cups each holds.",
            "Pour carefully! Count each cup. Write down the capacity of each container.",
            make_open_interaction("Container 1 (__): __ cups\nContainer 2 (__): __ cups"),
            ["cups", "containers", "water", "pencil", "notebook"]),

        make_step("practice", "Try It Yourself: Estimate and Measure",
            "Estimate: How many cups of water does your water bottle hold? Now measure. Were you close?",
            "Estimating means guessing first. Then we measure to check!",
            make_open_interaction("My water bottle: I estimated __ cups. I measured __ cups."),
            ["cups", "water bottle", "water", "pencil", "notebook"]),

        make_step("quick_check", "Quick Check: How Many Cups?",
            "Look at the picture. How many cups of water does the pot hold?",
            "Count carefully. Each cup is the same size.",
            make_mc_interaction("The pot holds __ cups of water.", [("5", False), ("6", True), ("7", False)]),
            ["pencil"],
            "Grade 2 capacity quick check",
            "A picture of a pot with 6 cups of water poured in"),

        make_step("reflect", "What Did You Learn About Capacity?",
            "Choose what you learned. Then measure one container at home.",
            "You learned to measure capacity today! This helps us in cooking and daily life.",
            make_chip_select([
                "I can measure capacity using fixed units.",
                "I know we count how many small containers fill a big one.",
                "I can compare the capacity of different containers.",
                "I can estimate before measuring."
            ], "Measure one container at home. Write: __ holds __ cups."),
            ["pencil", "notebook"]),

        make_step("complete", "Capacity Champion!",
            "You can measure capacity! At home, help your family measure water or milk using a cup.",
            "You are a capacity champion! Well done!",
            {"type": "none"},
            [],
            "Grade 2 capacity celebration",
            "A cheerful owl with a medal that says 'Capacity Champion'"),
    ]


def generate_money_journey():
    """Journey for: Identifying Kenyan Currency up to Sh.100"""
    return [
        make_step("welcome", "Let's Learn About Money!",
            "Today we learn about Kenyan money — coins and notes! We use money to buy things we need.",
            "Hello! Money is important. Today we learn to identify Kenyan coins and notes up to Sh.100.",
            {"type": "none"},
            ["play money or pictures of coins/notes", "pencil", "notebook"],
            "Grade 2 Kenyan currency",
            "A cartoon owl holding Kenyan coins and notes"),

        make_step("mission", "Your Money Mission",
            "By the end of this lesson, you will:\n• Identify Kenyan coins and notes up to Sh.100\n• Know the value of each coin and note\n• Sort money by value",
            "Your mission is to become a money expert! I will show you all the coins and notes.",
            {"type": "none"},
            ["play money or pictures of coins/notes", "pencil", "notebook"]),

        make_step("think_first", "What Do You Know About Money?",
            "Have you ever seen your parents buy something? What did they use to pay? What coins or notes do you know?",
            "Money helps us buy things. Let's learn all about Kenyan money!",
            make_open_interaction("Write the names of any coins or notes you know."),
            ["pencil", "notebook"]),

        make_step("learn", "Kenyan Coins and Notes",
            "Kenyan coins: Sh.1, Sh.5, Sh.10, Sh.20. Kenyan notes: Sh.50, Sh.100. Each has different colors and pictures. The Sh.1 coin is copper. The Sh.5 coin is silver. The Sh.10 coin is silver with a gold ring. The Sh.20 coin is gold.",
            "Look at the colors. Copper = Sh.1. Silver = Sh.5. Silver with gold ring = Sh.10. Gold = Sh.20. Notes: Sh.50 and Sh.100.",
            make_self_check("What color is the Sh.10 coin?", "Silver with a gold ring"),
            ["play money or pictures", "pencil"],
            "Grade 2 Kenyan coins and notes",
            "Pictures of Sh.1, Sh.5, Sh.10, Sh.20 coins and Sh.50, Sh.100 notes with labels"),

        make_step("connect", "Money in Real Life",
            "Your parents use money to buy food, clothes, and books. At the market, people pay with coins and notes. A banana might cost Sh.10. A book might cost Sh.50.",
            "Think about shopping. Different things cost different amounts. We need to know our coins and notes!",
            make_open_interaction("Name two things you can buy at the market and guess how much they cost."),
            ["pencil", "notebook"]),

        make_step("example", "Worked Example: Counting Coins",
            "Let's count: Sh.10 + Sh.5 + Sh.5 = Sh.20. We add the values. Ten plus five plus five equals twenty!",
            "Watch me count. Start with the biggest coin. Sh.10, then Sh.5 makes Sh.15, then Sh.5 makes Sh.20!",
            make_numeric_interaction("Sh.10 + Sh.10 + Sh.5 = ?", 25),
            ["play money or pictures", "pencil", "notebook"],
            "Grade 2 counting Kenyan coins",
            "Coins arranged: Sh.10 + Sh.10 + Sh.5 = Sh.25"),

        make_step("practice", "Try Together: Sort the Money",
            "Work in pairs. Sort play money by value. Put all Sh.1 together, all Sh.5 together, all Sh.10 together.",
            "Sort by value. Count how many of each. Which group has the most?",
            make_open_interaction("I sorted the money:\nSh.1: __ coins\nSh.5: __ coins\nSh.10: __ coins"),
            ["play money or pictures", "pencil", "notebook"]),

        make_step("practice", "Try It Yourself: Make Sh.20",
            "How many ways can you make Sh.20 using different coins? Write at least two ways.",
            "Think: 10 + 10 = 20. Also: 10 + 5 + 5 = 20. Can you find more ways?",
            make_open_interaction("Ways to make Sh.20:\n1. __\n2. __"),
            ["play money or pictures", "pencil", "notebook"]),

        make_step("quick_check", "Quick Check: Which Is Sh.10?",
            "Choose the coin that is worth Sh.10.",
            "Remember: Sh.10 is silver with a gold ring. Look carefully!",
            make_mc_interaction("Which coin is Sh.10?", [
                ("Copper coin", False),
                ("Silver coin with gold ring", True),
                ("Gold coin", False)
            ]),
            ["pencil"],
            "Grade 2 identifying Sh.10 coin",
            "Three coin pictures: copper (Sh.1), silver with gold ring (Sh.10), gold (Sh.20)"),

        make_step("reflect", "What Did You Learn About Money?",
            "Choose what you learned. Then ask your parent to show you real coins at home.",
            "You learned about Kenyan money today! This helps you when shopping with your family.",
            make_chip_select([
                "I can identify Kenyan coins up to Sh.20.",
                "I can identify Kenyan notes up to Sh.100.",
                "I can count coins to find the total.",
                "I know money is used to buy things."
            ], "Ask your parent to show you real coins. Draw one coin and write its value."),
            ["pencil", "notebook"]),

        make_step("complete", "Money Expert!",
            "You can identify Kenyan coins and notes! At home, practice counting money with your family.",
            "You are a money expert! Well done!",
            {"type": "none"},
            [],
            "Grade 2 money celebration",
            "A cheerful owl with a medal that says 'Money Expert'"),
    ]


def generate_shapes_journey():
    """Journey for: Identifying Rectangles, Circles, Triangles, Ovals and Squares"""
    return [
        make_step("welcome", "Shape Detective!",
            "Today we become shape detectives! We find rectangles, circles, triangles, ovals, and squares all around us.",
            "Hello! Shapes are everywhere — in your classroom, your home, and outside. Let's find them!",
            {"type": "none"},
            ["pencil", "notebook", "crayons"],
            "Grade 2 identifying shapes",
            "A cartoon owl detective with a magnifying glass looking at shapes"),

        make_step("mission", "Your Shape Mission",
            "By the end of this lesson, you will:\n• Identify rectangles, circles, triangles, ovals, and squares\n• Find these shapes in your environment\n• Sort shapes by their properties",
            "Your mission is to find and name shapes everywhere! I will help you become a shape expert.",
            {"type": "none"},
            ["pencil", "notebook", "crayons"]),

        make_step("think_first", "What Shapes Do You See?",
            "Look around your classroom. What shapes can you see? The clock is a circle. The door is a rectangle. What else?",
            "Shapes are everywhere! Let's learn their names and what makes each one special.",
            make_open_interaction("Write three shapes you see in your classroom."),
            ["pencil", "notebook"]),

        make_step("learn", "Five Important Shapes",
            "RECTANGLE: 4 sides, 4 corners. Opposite sides are equal. Example: door, book.\nSQUARE: 4 equal sides, 4 corners. Example: window tile.\nCIRCLE: No corners, no sides, round. Example: clock, plate.\nTRIANGLE: 3 sides, 3 corners. Example: roof shape.\nOVAL: Like a circle but stretched. Example: egg.",
            "Remember: Rectangle = door. Square = tile. Circle = clock. Triangle = roof. Oval = egg!",
            make_self_check("How many sides does a triangle have?", "3"),
            ["pencil", "notebook"],
            "Grade 2 five shapes rectangle square circle triangle oval",
            "Five shapes with labels: rectangle, square, circle, triangle, oval"),

        make_step("connect", "Shapes in Your Home",
            "At home, your plate is a circle. Your window might be a rectangle or square. Your egg is an oval. Your roof might have triangles!",
            "Look around your home. You will find these five shapes everywhere!",
            make_open_interaction("Name one thing at home for each shape:\nRectangle: __\nSquare: __\nCircle: __\nTriangle: __\nOval: __"),
            ["pencil", "notebook"]),

        make_step("example", "Worked Example: Sorting Shapes",
            "Let's sort! Put all rectangles together. Put all circles together. Count how many of each.",
            "Look at each shape. Count the sides and corners. Rectangles have 4 sides. Circles have no corners!",
            {"type": "none"},
            ["shape cut-outs or pictures", "pencil", "notebook"],
            "Grade 2 sorting shapes",
            "Shapes sorted into groups: rectangles, circles, triangles, ovals, squares"),

        make_step("practice", "Try Together: Shape Hunt",
            "Work in pairs. Go on a shape hunt in your classroom. Find 3 rectangles, 2 circles, and 1 triangle.",
            "Look carefully! Record what you find. The clock is a circle. What else?",
            make_open_interaction("We found:\nRectangles: 1. __ 2. __ 3. __\nCircles: 1. __ 2. __\nTriangle: 1. __"),
            ["pencil", "notebook"]),

        make_step("practice", "Try It Yourself: Draw and Color",
            "Draw one rectangle, one circle, one triangle, one oval, and one square. Color each one differently.",
            "Use a ruler for straight lines. Make your circle as round as possible!",
            {"type": "none"},
            ["pencil", "notebook", "crayons", "ruler"],
            "Grade 2 drawing shapes",
            "A child drawing and coloring five different shapes"),

        make_step("quick_check", "Quick Check: Name the Shape",
            "Choose the correct name for each shape.",
            "Count the sides and corners. That will help you name each shape!",
            make_mc_interception("What shape has 3 sides and 3 corners?", [("Rectangle", False), ("Triangle", True), ("Circle", False)]),
            ["pencil"],
            "Grade 2 naming shapes",
            "Three shapes: rectangle, triangle, circle"),

        make_step("reflect", "What Did You Learn About Shapes?",
            "Choose what you learned. Then draw your favorite shape and tell why you like it.",
            "You are a shape detective now! Shapes are everywhere around us.",
            make_chip_select([
                "I can identify rectangles, squares, circles, triangles, and ovals.",
                "I know how many sides each shape has.",
                "I can find shapes in my environment.",
                "I can sort shapes by their properties."
            ], "Draw your favorite shape and tell why you like it."),
            ["pencil", "notebook", "crayons"]),

        make_step("complete", "Shape Detective!",
            "You can identify five shapes! At home, go on a shape hunt and find all five shapes.",
            "You are a shape detective! Well done!",
            {"type": "none"},
            [],
            "Grade 2 shapes celebration",
            "A cheerful owl with a medal that says 'Shape Detective'"),
    ]


# ── Main Generation Logic ──

JOURNEY_GENERATORS = {
    "377e0d32-066d-4bb2-8fb3-a3c790989905": generate_reading_numbers_journey,
    "cfdd2c2e-c29d-4903-ab9b-cdb44037a8d0": generate_counting_2s_journey,
    "f5bee6a0-8aa0-4a33-a536-dc563b53f4d1": generate_halves_journey,
    "fb0e6e8e-5c88-4f48-8e65-dbb5e4c9ed0a": generate_addition_journey,
    "11d88b45-b1a6-4143-9c04-42e88e57d080": generate_subtraction_journey,
    "6c4f60d2-f577-45cd-a25b-ca8f9eefc6e4": generate_multiplication_journey,
    "04268b1c-0e8f-4ecc-8c28-fb807617ca4a": generate_length_journey,
    "2d0d0e1b-e7fc-454a-860a-5126895cce1e": generate_capacity_journey,
    "ed2db75d-c71a-41d4-962d-a8e6ae561ed3": generate_money_journey,
    "15278d40-a028-40ae-91e6-b2fe6b1f647b": generate_shapes_journey,
}


def main():
    print(f"Batch: {BATCH_ID}")
    print(f"Generating journeys for {len(LESSON_IDS)} lessons...")

    results = []

    for i, lesson_id in enumerate(LESSON_IDS):
        print(f"\n[{i+1}/10] Processing lesson {lesson_id[:8]}...")

        # Fetch lesson
        {data: lesson, error: fetch_err} = await supabase.from("Lesson").select("id, title, slug, status, contentBlocks").eq("id", lesson_id).single()

        if fetch_err or not lesson:
            print(f"  ERROR: {fetch_err.message if fetch_err else 'Not found'}")
            results.append({"id": lesson_id, "status": "error", "reason": str(fetch_err)})
            continue

        print(f"  Title: {lesson.title}")
        print(f"  Status: {lesson.status}")

        # Check if journey already exists
        try:
            cb = json.loads(lesson.contentBlocks or "{}")
            existing_journey = cb.get("studentJourney")
            existing_draft = cb.get("studentJourneyDraft")
            if existing_journey and len(existing_journey) > 0:
                print(f"  WARNING: Already has approved journey ({len(existing_journey)} steps)")
            if existing_draft and len(existing_draft) > 0:
                print(f"  WARNING: Already has draft journey ({len(existing_draft)} steps)")
        except:
            pass

        # Generate journey
        generator = JOURNEY_GENERATORS.get(lesson_id)
        if not generator:
            print(f"  ERROR: No generator for this lesson")
            results.append({"id": lesson_id, "status": "error", "reason": "No generator"})
            continue

        journey = generator()
        print(f"  Generated {len(journey)} steps")

        # Validate
        step_types = [s["stepType"] for s in journey]
        required = ["welcome", "mission", "think_first", "learn", "connect", "example", "practice", "quick_check", "reflect", "complete"]
        missing = [t for t in required if t not in step_types]
        if missing:
            print(f"  WARNING: Missing step types: {missing}")

        practice_count = step_types.count("practice")
        if practice_count < 2:
            print(f"  WARNING: Only {practice_count} practice steps (need 2)")

        # Build new contentBlocks
        try:
            existing_cb = json.loads(lesson.contentBlocks or "{}")
        except:
            existing_cb = {}

        new_cb = {
            **existing_cb,
            "studentJourneyDraft": journey,
            "batchId": BATCH_ID,
            "aiMetadata": {
                "model": "structured-template-v1",
                "promptVersion": "batch-1-template",
                "generatedAt": "2026-06-09T00:00:00.000Z",
                "reviewStatus": "NEEDS_REVIEW",
                "batchId": BATCH_ID,
            },
        }

        # Save
        {error: update_err} = await supabase.from("Lesson").update({
            "contentBlocks": json.dumps(new_cb),
            "updatedAt": "2026-06-09T00:00:00.000Z",
        }).eq("id", lesson_id)

        if update_err:
            print(f"  ERROR saving: {update_err.message}")
            results.append({"id": lesson_id, "status": "error", "reason": str(update_err)})
        else:
            print(f"  SAVED successfully")
            results.append({"id": lesson_id, "status": "saved", "steps": len(journey)})

    # Summary
    print(f"\n{'='*60}")
    print(f"Batch 1 Generation Complete")
    print(f"{'='*60}")
    saved = sum(1 for r in results if r["status"] == "saved")
    errors = sum(1 for r in results if r["status"] == "error")
    print(f"Saved: {saved}/10")
    print(f"Errors: {errors}/10")

    for r in results:
        status = "✓" if r["status"] == "saved" else "✗"
        print(f"  {status} {r['id'][:8]}... - {r['status']}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
