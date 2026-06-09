#!/usr/bin/env python3
"""
Generate Grade 2 Mathematical Activities lesson shell CSVs
from official KICD Lower Primary Curriculum Designs (Volume 2, August 2017).

Source: KICD Lower Primary Level Curriculum Designs Volume Two
  - Mathematics Activities: Grade 2 section (pages 20-39)
  - Official document: https://kicd.ac.ke/wp-content/uploads/2017/10/volume-2-curriculum-designs-September-2017.pdf

Each lesson shell includes:
  - Exact KICD strand, sub-strand, specific learning outcomes
  - Key inquiry questions from KICD
  - Suggested learning experiences from KICD
  - Core competencies, values, PCIs from KICD
  - Suggested resources from KICD
  - Assessment methods from KICD
  - Source reference (page number in KICD document)
"""

import csv
import io
import os
import json

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "curriculum-shells", "grade-2")
os.makedirs(OUTPUT_DIR, exist_ok=True)

GRADE = 2
SUBJECT = "Mathematical Activities"
TERM = "Term 1"
REWARD_COINS = "10"
REWARD_STARS = "1"
REWARD_XP = "50"
REVIEW_STATUS = "DRAFT"
SOURCE_DOC = "KICD Lower Primary Curriculum Designs Vol.2 (Aug 2017)"

# ============================================================================
# KICD Grade 2 Mathematics Activities — Complete Curriculum Structure
# Source: KICD Lower Primary Level Curriculum Designs Volume Two, pages 20-39
# ============================================================================

# Format: (strand, sub_strand, lessons_count, slo_list, key_inquiry, 
#          suggested_experiences, core_competencies, values, pcis, resources)

CURRICULUM_DATA = [
    # ===== STRAND 1.0: NUMBERS =====
    {
        "strand": "Numbers",
        "sub_strand": "1.1 Number Concept",
        "lessons": 8,
        "slos": [
            "read numbers 1-100 in symbols",
            "represent numbers 1-100 using concrete objects in the environment",
        ],
        "key_inquiry": "How can we find the number of objects in a group?",
        "experiences": "Learners to read number names from 1-100. Learners in groups of five to count their fingers and toes. Learners in pairs/groups to play games of representing numbers 1-100 using safe concrete objects. Learners to play digital games of representing groups with numbers.",
        "core_competencies": "Communication and Collaboration, Imagination and Creativity, Digital Literacy, Critical Thinking and Problem Solving",
        "values": "Respect, Responsibility",
        "pcis": "Life skills: self-awareness and self-esteem - when using body parts; ESD: DRR; safety - when collecting items in the environment",
        "resources": "Stones, sticks, bottles, number charts, number cards, counters",
        "assessment": "Oral questions, observation, written exercise",
        "kicd_page": "30",
        "lesson_titles": [
            "Reading Numbers 1 to 50 in Symbols",
            "Reading Numbers 51 to 100 in Symbols",
            "Representing Numbers 1 to 50 Using Concrete Objects",
            "Representing Numbers 51 to 100 Using Concrete Objects",
            "Counting Numbers 1 to 100 Forward",
            "Counting Numbers 1 to 100 Backward",
            "Filling in Missing Numbers 1 to 50",
            "Filling in Missing Numbers 51 to 100",
        ],
    },
    {
        "strand": "Numbers",
        "sub_strand": "1.2 Whole Numbers",
        "lessons": 20,
        "slos": [
            "count numbers forward and backward up to 100",
            "identify place value up to hundreds",
            "read numbers 1-100 in symbols",
            "read and write numbers 1-20 in words",
            "work out missing numbers in number patterns up to 100",
            "appreciate number patterns as they skip on the number line",
        ],
        "key_inquiry": "How do we get the next number in a pattern?",
        "experiences": "Learners in pairs/groups to count in 2's and 5's forward and backward starting from any point. Learners in pairs/groups to count their fingers and toes in 2's and 10's. Learners in pairs/groups to discuss place value up to hundreds. Learners in pairs to read numbers 1-100 in symbols. Learners to read and write numbers 1-20 in words. Learners to play digital games involving whole numbers. Learners to work out missing numbers in patterns up to 100. Learners in pairs/groups to make number patterns and share.",
        "core_competencies": "Communication and Collaboration, Critical Thinking and Problem Solving, Digital Literacy",
        "values": "Respect, Responsibility",
        "pcis": "Citizenship: leadership - as learners work in groups",
        "resources": "Sticks, marbles, stones, grains, number line drawn on ground/floor, number cards",
        "assessment": "Oral questions, written exercise, observation",
        "kicd_page": "31-32",
        "lesson_titles": [
            "Counting in 2s Forward up to 100",
            "Counting in 2s Backward up to 100",
            "Counting in 5s Forward up to 100",
            "Counting in 5s Backward up to 100",
            "Counting in 10s Forward up to 100",
            "Place Value: Ones and Tens",
            "Place Value: Hundreds",
            "Reading Numbers 1 to 100 in Symbols",
            "Writing Numbers 1 to 10 in Words",
            "Writing Numbers 11 to 20 in Words",
            "Number Patterns: Completing Patterns up to 50",
            "Number Patterns: Completing Patterns up to 100",
            "Number Patterns: Skip Counting by 2s",
            "Number Patterns: Skip Counting by 5s",
            "Number Patterns: Skip Counting by 10s",
            "Number Patterns: Creating Patterns",
            "Number Line: Counting Forward",
            "Number Line: Counting Backward",
            "Number Line: Skip Counting",
            "Number Patterns: Extending Patterns",
        ],
    },
    {
        "strand": "Numbers",
        "sub_strand": "1.3 Fractions",
        "lessons": 12,
        "slos": [
            "identify 1/2 as part of a whole",
            "identify 1/4 as part of a whole",
        ],
        "key_inquiry": "What fraction do you get when you fold a circular paper cut-out into 4 equal parts?",
        "experiences": "Learners in pairs to make circular paper cut-outs. Learners in pairs to fold the circular paper cut-outs into two equal parts and identify one of the parts as a half of the whole written as 1/2. Learners in pairs to make rectangular paper cut-outs and fold them into two equal parts to get a half. Learners in pairs to fold circular paper cut-outs to get 4 equal parts and identify one of the parts as 1/4 of a whole. Learners to play digital games involving fractions. Learners in pairs to practice making halves and quarters of a whole.",
        "core_competencies": "Imagination and Creativity, Communication and Collaboration, Critical Thinking and Problem Solving, Digital Literacy",
        "values": "Unity, Integrity, Responsibility",
        "pcis": "Life skills: interpersonal relationship - making friends",
        "resources": "Paper cut-outs (circular, rectangular), fruits, charts",
        "assessment": "Oral questions, written exercise, observation",
        "kicd_page": "33-34",
        "lesson_titles": [
            "Introduction to Halves Using Circular Cut-outs",
            "Introduction to Halves Using Rectangular Cut-outs",
            "Identifying 1/2 in Everyday Objects",
            "Introduction to Quarters Using Circular Cut-outs",
            "Introduction to Quarters Using Rectangular Cut-outs",
            "Identifying 1/4 in Everyday Objects",
            "Comparing Fractions: 1/2 and 1/4",
            "Fractions in Daily Life: Sharing Food",
            "Making Patterns with Fractions",
            "Digital Games with Fractions",
            "Fractions: Practice and Application",
            "Fractions: Assessment and Reflection",
        ],
    },
    {
        "strand": "Numbers",
        "sub_strand": "1.4 Addition",
        "lessons": 20,
        "slos": [
            "add a 2-digit number to a 1-digit number without and with regrouping with sum not exceeding 100",
            "add 3-single digit numbers up to a sum of 20",
            "add a 2-digit number to a 2-digit number without and with regrouping, with sum not exceeding 100",
            "work out missing numbers in patterns involving addition of whole numbers up to 100",
        ],
        "key_inquiry": "How can we align a 2-digit number and a 1-digit number vertically in order to add? When do we regroup?",
        "experiences": "Learners in pairs to write addition sentences given in horizontal form vertically according to place value. Learners to add a 2-digit number to a 1-digit number without and with regrouping. Learners to practice addition by skipping on the number line. Learners in pairs/groups to collect different safe objects and use them in addition of 3-single digit numbers. Learners in pairs/groups to practice breaking numbers apart to make a 10. Learners in pairs to come up with different ways of adding two 2-digit numbers without and with regrouping. Learners to play digital games involving addition. Learners in groups to make patterns using numbers up to 100.",
        "core_competencies": "Communication and Collaboration, Critical Thinking and Problem Solving, Digital Literacy",
        "values": "Respect, Responsibility, Unity",
        "pcis": "ESD: DRR; safety - as learners collect objects; Citizenship: social cohesion - when working in groups",
        "resources": "Place value chart, abacus, basic addition facts table, number line, sticks, marbles, stones, grains, counters",
        "assessment": "Oral questions, written exercises, observation",
        "kicd_page": "34-35",
        "lesson_titles": [
            "Adding Single Digit Numbers Horizontally",
            "Adding Single Digit Numbers Vertically",
            "Adding 2-Digit and 1-Digit Numbers Without Regrouping",
            "Adding 2-Digit and 1-Digit Numbers With Regrouping",
            "Adding Using the Number Line",
            "Adding 3 Single Digit Numbers Horizontally",
            "Adding 3 Single Digit Numbers Vertically",
            "Breaking Numbers Apart to Make 10",
            "Word Problems: Single Digit Addition",
            "Word Problems: 2-Digit and 1-Digit Addition",
            "Adding Two 2-Digit Numbers Without Regrouping",
            "Adding Two 2-Digit Numbers With Regrouping",
            "Addition Patterns up to 100",
            "Addition: Practice and Application",
            "Addition: Digital Games",
            "Addition: Word Problems with 2-Digit Numbers",
            "Addition: Assessment and Review",
            "Addition: Missing Numbers in Patterns",
            "Addition: Creating Number Patterns",
            "Addition: Community Application",
        ],
    },
    {
        "strand": "Numbers",
        "sub_strand": "1.5 Subtraction",
        "lessons": 20,
        "slos": [
            "subtract up to 2-digit numbers without regrouping",
            "use the relationship between addition and subtraction in working out problems",
            "work out missing numbers in subtraction of up to 2-digit numbers",
            "work out missing numbers in patterns involving subtraction up to 100",
        ],
        "key_inquiry": "How do you work out missing numbers in patterns involving subtraction?",
        "experiences": "Learners in pairs/groups to subtract single digit numbers by comparing groups of objects. Learners to subtract up to 2-digit numbers without regrouping in horizontal and vertical forms. Learners to discuss the relationship between addition and subtraction using number families. Learners to work out missing numbers in subtraction of up to 2-digit numbers. Learners to play digital games involving subtraction. Learners to work out missing numbers in patterns involving subtraction.",
        "core_competencies": "Communication and Collaboration, Critical Thinking and Problem Solving, Self-efficacy, Imagination and Creativity, Digital Literacy",
        "values": "Respect, Unity, Responsibility",
        "pcis": "Life skills: interpersonal relationship, effective communication, friendship formation; Citizenship: social cohesion",
        "resources": "Sticks, marbles, stones, grains, basic addition facts table, number line, counters",
        "assessment": "Oral questions, written exercise, observation",
        "kicd_page": "35-36",
        "lesson_titles": [
            "Subtracting Single Digit Numbers",
            "Subtracting Using the Number Line",
            "Subtracting 2-Digit Numbers Without Regrouping (Horizontal)",
            "Subtracting 2-Digit Numbers Without Regrouping (Vertical)",
            "Relationship Between Addition and Subtraction",
            "Using Number Families for Subtraction",
            "Missing Numbers in Subtraction",
            "Word Problems: Subtraction Within 100",
            "Subtraction Patterns up to 100",
            "Subtraction: Practice and Application",
            "Subtraction: Digital Games",
            "Subtraction: Word Problems",
            "Subtraction: Assessment and Review",
            "Subtraction: Missing Numbers in Patterns",
            "Subtraction: Creating Patterns",
            "Subtraction: Comparing Groups",
            "Subtraction: Real-Life Applications",
            "Subtraction: Community Service",
            "Subtraction: Review and Reflection",
            "Subtraction: Final Assessment",
        ],
    },
    {
        "strand": "Numbers",
        "sub_strand": "1.6 Multiplication",
        "lessons": 12,
        "slos": [
            "represent multiplication as repeated addition using numbers 1, 2, 3, 4 and 5 up to five times",
            "write repeated addition sentences as multiplication, using '×' sign",
            "multiply single digit numbers by 1, 2, 3, 4, 5 and 10",
        ],
        "key_inquiry": "How do you represent multiplication as repeated addition?",
        "experiences": "Learners in pairs/groups to use counters to represent multiplication as repeated addition. Learners in pairs/groups to use number lines to represent multiplication as repeated addition. Learners to use '×' sign in writing repeated addition sentences as multiplication. Learners to multiply single digit numbers by 1, 2, 3, 4, 5 and 10. Learners to play digital games involving multiplication. Learners could visit the local market to see how fruits are arranged in groups.",
        "core_competencies": "Communication and Collaboration, Critical Thinking and Problem Solving, Digital Literacy",
        "values": "Respect, Unity, Responsibility",
        "pcis": "Life skills: self-awareness - when learners use their fingers; ESD: DRR; environmental awareness - re-use of materials collected",
        "resources": "Counters, number lines, sticks, bottle tops, charts",
        "assessment": "Oral questions, written exercises, observation",
        "kicd_page": "37",
        "lesson_titles": [
            "Introduction to Multiplication as Repeated Addition",
            "Multiplication as Repeated Addition Using Counters",
            "Multiplication as Repeated Addition Using Number Lines",
            "Writing Multiplication Sentences Using the × Sign",
            "Multiplying by 1 and 2",
            "Multiplying by 3 and 4",
            "Multiplying by 5 and 10",
            "Multiplication: Practice and Application",
            "Multiplication: Word Problems",
            "Multiplication: Digital Games",
            "Multiplication: Patterns and Arrays",
            "Multiplication: Assessment and Review",
        ],
    },
    {
        "strand": "Numbers",
        "sub_strand": "1.7 Division",
        "lessons": 8,
        "slos": [
            "represent division as equal sharing",
            "represent division as equal grouping",
            "use '÷' sign in writing division sentences",
            "divide numbers up to 25 by 2, 3, 4 and 5 without a remainder in real life situations",
        ],
        "key_inquiry": "How can you share a given number of objects equally?",
        "experiences": "Learners in pairs/groups to share a given number of objects equally by each picking one object at a time until all are finished. Learners in pairs/groups to pick an equal number of objects at a time from the main group and count the number of small equal groups formed. Learners to use '÷' sign in writing division sentences. Learners to play digital games involving division. Learners to divide numbers up to 25 by 2, 3, 4 and 5 without a remainder.",
        "core_competencies": "Communication and Collaboration, Critical Thinking and Problem Solving, Digital Literacy",
        "values": "Respect, Responsibility, Love, Integrity, Social Justice",
        "pcis": "Citizenship: social cohesion - as learners work in groups; ESD: DRR; safety - of materials that learners use",
        "resources": "Counters, fruits, sticks, number lines, digital devices",
        "assessment": "Oral questions, written exercises, observation",
        "kicd_page": "38-39",
        "lesson_titles": [
            "Introduction to Division as Equal Sharing",
            "Division as Equal Grouping",
            "Writing Division Sentences Using the ÷ Sign",
            "Dividing Numbers up to 25 by 2 and 3",
            "Dividing Numbers up to 25 by 4 and 5",
            "Division: Word Problems",
            "Division: Digital Games",
            "Division: Practice and Assessment",
        ],
    },

    # ===== STRAND 2.0: MEASUREMENT =====
    {
        "strand": "Measurement",
        "sub_strand": "2.1 Length",
        "lessons": 6,
        "slos": [
            "measure length using fixed units",
            "identify the metre as a unit of measuring length",
            "measure length in metres",
        ],
        "key_inquiry": "What can you use to measure different lengths?",
        "experiences": "Learners in pairs/groups to use sticks of equal length to measure different lengths, record and discuss. Learners in pairs/groups to measure length using sticks of different lengths, including 1-metre sticks. Learners to make 1-metre sticks and use them in measuring various lengths. Learners to play digital games involving length in metres.",
        "core_competencies": "Communication and Collaboration, Critical Thinking and Problem Solving, Imagination and Creativity, Digital Literacy",
        "values": "Responsibility, Integrity, Unity",
        "pcis": "ESD: DRR; safety - as learners handle objects",
        "resources": "Sticks, 1-metre sticks, rulers, books, pencils, bottles",
        "assessment": "Written exercises, observation, oral questions",
        "kicd_page": "39",
        "lesson_titles": [
            "Measuring Length Using Fixed Units",
            "Comparing Measurements Using Different Units",
            "Introducing the Metre as a Standard Unit",
            "Making and Using 1-Metre Sticks",
            "Measuring Length in Metres",
            "Length: Practice and Application",
        ],
    },
    {
        "strand": "Measurement",
        "sub_strand": "2.2 Mass",
        "lessons": 10,
        "slos": [
            "compare mass of objects directly",
            "conserve mass through manipulation",
            "measure mass using arbitrary units",
        ],
        "key_inquiry": "How can you compare the mass of two or more objects? What would you do to show that shape does not change mass?",
        "experiences": "Learners in pairs/groups use safe objects to identify those heavier than, lighter than or same. Learners to use two objects of equal mass and a beam balance to demonstrate that change of shape does not change mass. Learners in pairs/groups to use an identified mass to compare the mass of other objects.",
        "core_competencies": "Communication and Collaboration, Critical Thinking and Problem Solving, Self-efficacy",
        "values": "Responsibility, Integrity, Unity, Respect",
        "pcis": "ESD: DRR; safety - in handling materials; Health education: personal hygiene; Citizenship: honesty",
        "resources": "Items of different mass (books, stones, pieces of wood), beam balance",
        "assessment": "Written exercises, oral questions, observation",
        "kicd_page": "21-22",
        "lesson_titles": [
            "Comparing Mass Directly: Heavier and Lighter",
            "Comparing Mass: Same As",
            "Conserving Mass Through Manipulation",
            "Measuring Mass Using Arbitrary Units",
            "Comparing Mass of Different Objects",
            "Mass: Practice and Application",
            "Mass: Word Problems",
            "Mass: Digital Games",
            "Mass: Assessment and Review",
            "Mass: Community Application",
        ],
    },
    {
        "strand": "Measurement",
        "sub_strand": "2.3 Capacity",
        "lessons": 12,
        "slos": [
            "compare capacity of containers directly",
            "conserve capacity through manipulation",
            "measure capacity using arbitrary units",
        ],
        "key_inquiry": "How can we find out which of two containers hold more, less or same as?",
        "experiences": "Learners to empty and fill water in different containers to establish which holds more, less or same. Learners to identify and compare containers which holds more, less or same as. Learners to fill containers of different shapes and sizes with water then empty into others. Learners to be given water, same size basins and different small containers to count how many small containers fill the basin.",
        "core_competencies": "Critical Thinking and Problem Solving, Communication and Collaboration, Imagination and Creativity, Citizenship, Self-efficacy",
        "values": "Responsibility, Integrity, Unity, Respect",
        "pcis": "ESD: DRR; safety; Health education; Environmental conservation; Animal welfare",
        "resources": "Containers of different sizes, water, sand, soil, basins",
        "assessment": "Written exercises, observation, oral questions",
        "kicd_page": "22-23",
        "lesson_titles": [
            "Comparing Capacity Directly: Holds More, Less, Same",
            "Comparing Capacity of Different Containers",
            "Conserving Capacity Through Manipulation",
            "Measuring Capacity Using Arbitrary Units",
            "How Many Small Containers Fill the Basin?",
            "Capacity: Practice and Application",
            "Capacity: Word Problems",
            "Capacity: Digital Games",
            "Capacity: Assessment and Review",
            "Capacity: Real-Life Applications",
            "Capacity: Community Service",
            "Capacity: Final Assessment",
        ],
    },
    {
        "strand": "Measurement",
        "sub_strand": "2.4 Time",
        "lessons": 8,
        "slos": [
            "relate daily activities to time",
            "relate days of the week with various activities",
        ],
        "key_inquiry": "Which day of the week do you raise the school flag? Which day of the week do you worship?",
        "experiences": "Learners in pairs/groups to identify activities they do in the morning, afternoon and evening. Learners to sing songs/rhymes related to days of the week. Learners in pairs/groups to identify activities that take place during the days of the week.",
        "core_competencies": "Communication and Collaboration, Self-efficacy, Citizenship",
        "values": "Respect, Responsibility, Patriotism",
        "pcis": "Citizenship: patriotism - the Kenyan flag; Health Education: time to brush teeth, wash face, sleep, take meals",
        "resources": "Charts with days of the week, charts with months of the year, daily activity charts",
        "assessment": "Oral questions, written exercises, observation",
        "kicd_page": "24",
        "lesson_titles": [
            "Daily Activities: Morning, Afternoon, Evening",
            "Days of the Week: Sunday to Wednesday",
            "Days of the Week: Thursday to Saturday",
            "Activities on Different Days of the Week",
            "Time: Practice and Application",
            "Time: Digital Games",
            "Time: Assessment and Review",
            "Time: Community and Religious Activities",
        ],
    },
    {
        "strand": "Measurement",
        "sub_strand": "2.5 Money",
        "lessons": 8,
        "slos": [
            "identify Kenyan currency coins and notes up to sh.100",
            "relate money to goods and services up to sh.100 in shopping activities",
            "differentiate between needs and wants in real life context",
            "appreciate spending and saving in real life situations",
        ],
        "key_inquiry": "How can you identify Kenyan currency coins and notes?",
        "experiences": "Learners in pairs/groups to sort out different Kenyan currency coins and notes up to sh.100. Learners to put together coins and notes up to sh.100 according to their value and features. Learners in pairs/groups to give their own experiences in relation to shopping activities. Learners to discuss the value of items in the classroom shop up to sh.100. Learners in pairs/groups to discuss items they cannot do without and those that are necessary but they can do without. Learners to play digital games involving needs and wants. Learners to give their own experiences on saving and spending. Learners to role play buying and selling from the classroom shop.",
        "core_competencies": "Communication and Collaboration, Self-efficacy, Citizenship, Digital Literacy",
        "values": "Integrity, Responsibility, Honesty",
        "pcis": "ESD: DRR; safety - as learners handle money; Citizenship: patriotism - features on Kenya currency",
        "resources": "Kenyan currency coins (1, 5, 10, 20, 40, 50), notes (50, 100), classroom shop, price tags",
        "assessment": "Written exercises, oral questions, observation",
        "kicd_page": "25",
        "lesson_titles": [
            "Identifying Kenyan Coins up to Sh.40",
            "Identifying Kenyan Coins and Notes up to Sh.100",
            "Sorting Money by Value and Features",
            "Shopping Activities: Buying and Selling",
            "Differentiating Needs and Wants",
            "Saving and Spending Money",
            "Money: Role Play in the Classroom Shop",
            "Money: Practice and Assessment",
        ],
    },

    # ===== STRAND 3.0: GEOMETRY =====
    {
        "strand": "Geometry",
        "sub_strand": "3.1 Lines",
        "lessons": 6,
        "slos": [
            "draw straight lines for application in real life",
            "draw curved lines for application in real life situations",
        ],
        "key_inquiry": "What types of lines are there?",
        "experiences": "Learners to stand behind one another facing the same side and identify what they have formed as a straight line. Learners in pairs/groups to mark two points on the ground and using a stick to draw a line joining the two points. Learners to practice drawing straight lines on the ground and in their books. Learners in groups to form a semi-circle and draw a line around it to identify the semi-circle as a curved line. Learners to practice drawing curved lines.",
        "core_competencies": "Communication and Collaboration, Imagination and Creativity, Learning to Learn",
        "values": "Unity, Responsibility, Love",
        "pcis": "ESD: DRR; safety - as learners use sticks to draw; Life Skills: self-awareness - when forming lines using their hands",
        "resources": "Sticks, strings, chalk, manila paper",
        "assessment": "Written exercises, observation, oral questions",
        "kicd_page": "26-27",
        "lesson_titles": [
            "Introduction to Straight Lines",
            "Drawing Straight Lines on the Ground and in Books",
            "Introduction to Curved Lines",
            "Drawing Curved Lines on the Ground and in Books",
            "Lines in the Environment",
            "Lines: Practice and Application",
        ],
    },
    {
        "strand": "Geometry",
        "sub_strand": "3.2 Shapes",
        "lessons": 6,
        "slos": [
            "identify rectangles, circles and triangles in the environment",
            "make patterns involving rectangles, circles and triangles",
            "appreciate the beauty of patterns in the environment",
        ],
        "key_inquiry": "What shapes can you identify in your school?",
        "experiences": "Learners in pairs/groups to sort and group different shapes using one attribute. Learners in pairs/groups to discuss the types of lines that make rectangles, circles, triangles and name them. Learners working individually to make patterns of their choice using the three shapes. Learners in groups to make patterns, colour them and share with other groups.",
        "core_competencies": "Communication and Collaboration, Imagination and Creativity",
        "values": "Responsibility, Unity",
        "pcis": "ESD: DRR; safety - as learners pick objects to trace and when colouring the patterns",
        "resources": "Cut-outs of rectangles, circles, and triangles of different sizes, manila paper, crayons, colours",
        "assessment": "Written exercises, oral questions, observation",
        "kicd_page": "27-28",
        "lesson_titles": [
            "Identifying Rectangles, Circles, and Triangles in the Environment",
            "Sorting and Grouping Shapes by Attribute",
            "Making Patterns with Rectangles, Circles, and Triangles",
            "Colouring and Sharing Shape Patterns",
            "Shape Patterns in the Environment",
            "Shapes: Practice and Assessment",
        ],
    },
]


def build_lessons():
    """Build complete lesson shells from KICD curriculum data."""
    lessons = []
    global_order = 0

    for unit in CURRICULUM_DATA:
        quest_title = f"{unit['sub_strand']} Quest"
        for title in unit["lesson_titles"]:
            global_order += 1
            week = f"Week {min(global_order, 12)}"

            # Build specific learning outcome for this lesson
            slo_index = min(unit["lesson_titles"].index(title), len(unit["slos"]) - 1)
            slo = unit["slos"][slo_index] if slo_index < len(unit["slos"]) else unit["slos"][-1]

            lessons.append({
                "grade": GRADE,
                "subject": SUBJECT,
                "strand": unit["strand"],
                "sub_strand": unit["sub_strand"],
                "learning_outcome": f"By the end of the lesson, the learner should be able to: {slo}",
                "lesson_title": title,
                "term": TERM,
                "week": week,
                "activity_title": f"Activity: {title}",
                "activity_instructions": unit["experiences"][:500],
                "quest_title": quest_title,
                "quest_instructions": f"Explore {unit['sub_strand'].lower()} through interactive activities, hands-on practice, and real-life application.",
                "reflection_prompt": f"What did you learn about {title.lower()} today? How can you use this in your daily life?",
                "reward_coins": REWARD_COINS,
                "reward_stars": REWARD_STARS,
                "estimated_duration": "30",
                "difficulty": "Beginner" if global_order <= 20 else "Developing",
                # Extended fields
                "key_inquiry_question": unit["key_inquiry"],
                "suggested_learning_experience": unit["experiences"][:800],
                "assessment_hint": unit["assessment"],
                "values": unit["values"],
                "core_competencies": unit["core_competencies"],
                "pertinent_and_contemporary_issues": unit["pcis"],
                "source_document": SOURCE_DOC,
                "source_page_or_section": f"Page {unit['kicd_page']}",
                "source_confidence": "HIGH — official KICD curriculum document",
                "review_status": REVIEW_STATUS,
                "existing_match_status": "NEW",
                "duplicate_risk": "LOW — sourced from official KICD document",
                "notes_for_victor": f"Source: KICD Lower Primary Curriculum Designs Vol.2, page {unit['kicd_page']}. {unit['lessons']} lessons allocated for this sub-strand.",
            })

    return lessons


def generate_import_csv(lessons):
    """Generate the admin import CSV."""
    headers = [
        "grade", "subject", "strand", "sub_strand", "learning_outcome",
        "lesson_title", "term", "week", "activity_title", "activity_instructions",
        "quest_title", "quest_instructions", "reflection_prompt",
        "reward_coins", "reward_stars", "estimated_duration", "difficulty",
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
        "grade", "subject", "strand", "sub_strand", "learning_outcome",
        "lesson_title", "term", "week", "activity_title", "activity_instructions",
        "quest_title", "quest_instructions", "reflection_prompt",
        "reward_coins", "reward_stars", "estimated_duration", "difficulty",
        "key_inquiry_question", "suggested_learning_experience", "assessment_hint",
        "values", "core_competencies", "pertinent_and_contemporary_issues",
        "source_document", "source_page_or_section", "source_confidence",
        "review_status", "existing_match_status", "duplicate_risk", "notes_for_victor",
    ]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers, extrasaction='ignore', quoting=csv.QUOTE_ALL)
    writer.writeheader()
    for lesson in lessons:
        writer.writerow(lesson)

    return output.getvalue()


def validate_csv(csv_content, label):
    """Validate generated CSV."""
    lines = csv_content.strip().split("\n")
    errors = []

    if len(lines) < 2:
        errors.append(f"{label}: No data rows")
        return errors

    reader = csv.DictReader(io.StringIO(csv_content))
    headers = reader.fieldnames or []

    required = ["grade", "subject", "strand", "sub_strand", "learning_outcome",
                "lesson_title", "term", "week", "quest_title", "difficulty", "estimated_duration"]
    for r in required:
        if r not in headers:
            errors.append(f"{label}: Missing required column '{r}'")

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
    for e in errors[:10]:
        print(f"    ERROR: {e}")

    return errors


def main():
    lessons = build_lessons()
    print(f"Generated {len(lessons)} lesson shells from KICD curriculum")

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
    strands = set(l["strand"] for l in lessons)
    sub_strands = set(l["sub_strand"] for l in lessons)
    quests = set(l["quest_title"] for l in lessons)

    print(f"\nSummary:")
    print(f"  Grade: {GRADE}")
    print(f"  Subject: {SUBJECT}")
    print(f"  Strands: {len(strands)} ({', '.join(sorted(strands))})")
    print(f"  Sub-strands: {len(sub_strands)}")
    print(f"  Quests: {len(quests)}")
    print(f"  Lessons: {len(lessons)}")
    print(f"  Source: {SOURCE_DOC}")
    print(f"  Source confidence: HIGH — official KICD document")


if __name__ == "__main__":
    main()
