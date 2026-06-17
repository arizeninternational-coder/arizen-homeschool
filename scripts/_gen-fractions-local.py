#!/usr/bin/env python3
"""
Generate local journey JSON files for the remaining 8 Fractions lessons.
Uses POC v1.0.2 as structure reference and Fractions source pack content.
Output: curriculum-source-packs/grade-2/math/generated/fractions/
No database writes.
"""
import json
import os
from datetime import datetime, timezone

OUTPUT_DIR = r'C:\Users\Victor\Arizen Homeschool\curriculum-source-packs\grade-2\math\generated\fractions'
GENERATED_AT = datetime(2026, 6, 17, 12, 0, 0, tzinfo=timezone.utc).isoformat()

def make_svg_media(asset_id, alt_text, caption="", required=False, approved=False):
    return {
        "type": "svg",
        "source": "generated",
        "url": "",
        "assetId": asset_id,
        "altText": alt_text,
        "caption": caption,
        "approvalStatus": "draft" if not approved else "approved",
        "approved": approved,
        "humanReviewed": False,
        "required": required,
        "fallbackType": "text",
        "fallbackText": alt_text
    }

def make_none_media():
    return {
        "type": "none",
        "approvalStatus": "approved",
        "approved": True,
        "humanReviewed": False,
        "required": False,
        "fallbackType": "none"
    }

def make_mcq(question, options, correct_index, feedback_correct, feedback_incorrect, practice_label=None, requires_save=True):
    mcq = {
        "type": "multiple_choice",
        "question": question,
        "options": options,
        "correctAnswer": options[correct_index],
        "correctIndex": correct_index,
        "feedbackCorrect": feedback_correct,
        "feedbackIncorrect": feedback_incorrect,
        "requiresSave": requires_save
    }
    if practice_label:
        mcq["practiceLabel"] = practice_label
    return mcq

def make_step(step_number, step_type, title, purpose, owl_text, student_text, media, interaction, validation):
    return {
        "stepNumber": step_number,
        "stepType": step_type,
        "title": title,
        "purpose": purpose,
        "owlText": owl_text,
        "studentText": student_text,
        "media": media,
        "interaction": interaction,
        "validation": validation
    }

def make_journey(lesson_id, title, qa_word, wc_question, wc_options, wc_correct_idx, wc_fb_ok, wc_fb_no, qc_question, qc_options, qc_correct_idx, qc_fb_ok, qc_fb_no, practice_question, pr_options, pr_correct_idx, pr_fb_ok, pr_fb_no, pr_label):
    """
    Generate a complete 10-step journey for a Fractions lesson.
    word_check_type: 'mcq' or other
    """
    steps = [
        # Step 1: Welcome
        make_step(1, "welcome", "Welcome!",
            f"Greet the child and set emotional tone for learning about {qa_word}",
            f"Hello friend! Today we are going to learn about {qa_word}. Are you ready? Let us go!",
            f"Today we learn about {qa_word}!",
            make_svg_media(f"svg-welcome-{qa_word.replace('/', '-').replace(' ', '-')}-gen", f"Owl teacher waving hello with a shape showing {qa_word} beside it", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        # Step 2: Mission
        make_step(2, "mission", "Our Mission",
            f"Tell the child what they will learn about {qa_word}",
            "",  # no owlText for mission
            f"Today you will learn about {qa_word}. This means understanding how things are divided into equal parts.",
            make_none_media(),
            {"type": "none"},
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        # Step 3: Think First
        make_step(3, "think_first", "Think First!",
            "Activate prior knowledge about equal parts and sharing",
            f"Before we start, think about this: {wc_question}",
            f"{wc_question} Think about it!",
            make_svg_media(f"svg-think-{qa_word.replace('/', '-').replace(' ', '-')}-gen", f"A real-life object with a question mark, thinking about {qa_word}", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        # Step 4: Learn It
        make_step(4, "learn", "Learn It",
            f"Teach the core concept of {qa_word}",
            f"Let me show you what {qa_word} means. When we divide something into equal parts, each part is a fraction. {qa_word} is one part of the whole that is divided equally.",
            f"{qa_word} means one part of something that has been divided into equal parts. The parts must be the same size!",
            make_svg_media(f"svg-learn-{qa_word.replace('/', '-').replace(' ', '-')}-gen", f"A shape divided into equal parts with one part shaded to show {qa_word}", f"This shows {qa_word}", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        # Step 5: Real Life Connection
        make_step(5, "real_life", "Real Life Connection",
            f"Connect {qa_word} to everyday life with real examples",
            f"We see {qa_word} in real life! When you share food fairly, when paper is folded evenly, when shapes are divided equally — that is {qa_word} in action!",
            f"We see {qa_word} every day! Look for things divided into equal parts around you.",
            make_svg_media(f"svg-reallife-{qa_word.replace('/', '-').replace(' ', '-')}-gen", f"Real-life objects showing {qa_word}: food, paper, shapes", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        # Step 6: Watch and Learn (Example)
        make_step(6, "example", "Watch and Learn",
            f"Show a worked example of identifying {qa_word}",
            f"Look at this shape. It is divided into equal parts. One part is shaded. The shaded part shows {qa_word}. Both parts are the same size — that is what makes them equal.",
            f"Look at this shape. It is divided into equal parts. One part is shaded. The shaded part shows {qa_word}. Both parts are the same size.",
            make_svg_media(f"svg-example-{qa_word.replace('/', '-').replace(' ', '-')}-gen", f"A shape divided into equal parts with one part shaded, labeled {qa_word}", f"The shaded part is {qa_word}", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        # Step 7: Practice
        make_step(7, "practice", "Your Turn!",
            f"Child practices identifying {qa_word} — different from Quick Check",
            f"Now it is your turn! Look at these shapes. One shape shows {qa_word}. The other does not. Which shape shows {qa_word}? Tap the correct one.",
            f"Which shape shows {qa_word}? Tap the correct shape.",
            make_svg_media(f"svg-practice-{qa_word.replace('/', '-').replace(' ', '-')}-gen", f"Two shapes side by side: one showing {qa_word}, one not", required=True),
            make_mcq(practice_question, pr_options, pr_correct_idx, pr_fb_ok, pr_fb_no, practice_label=pr_label),
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        # Step 8: Quick Check
        make_step(8, "quick_check", "Quick Check!",
            f"Test understanding of {qa_word} — fraction identification",
            f"Quick check! {qc_question}",
            qc_question,
            make_svg_media(f"svg-qc-{qa_word.replace('/', '-').replace(' ', '-')}-gen", f"A shape for the quick check question showing fraction concepts", required=True),
            make_mcq(qc_question, qc_options, qc_correct_idx, qc_fb_ok, qc_fb_no),
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        # Step 9: Reflect
        make_step(9, "reflect", "Think About Your Learning",
            "Help the child reflect on what they learned",
            f"You did great today! Think about what you learned. What is {qa_word}? When something is divided into equal parts, each part is a fraction.",
            f"What did you learn about {qa_word} today?",
            make_none_media(),
            {"type": "reflection", "question": f"How do you feel about {qa_word} today?",
             "options": ["😊 I understand!", "🤔 I am still learning", "😟 I need more help"],
             "correctAnswer": "", "correctIndex": None,
             "feedbackCorrect": "", "feedbackIncorrect": "", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        # Step 10: Complete
        make_step(10, "complete", "You Did It!",
            "Celebrate completion and provide closure",
            f"Wonderful! You learned about {qa_word} today. Remember: fractions need equal parts. Keep looking for fractions around you!",
            f"You learned about {qa_word}! Look for equal parts around you!",
            make_svg_media(f"svg-complete-{qa_word.replace('/', '-').replace(' ', '-')}-gen", f"Celebration with stars and a badge that says 'I know {qa_word}!'", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
    ]

    return {
        "version": "1.0.0",
        "lessonId": lesson_id,
        "title": title,
        "subject": "Mathematics",
        "grade": 2,
        "language": "en",
        "generatedFrom": "fractions-source-pack-draft-v1",
        "generatedAt": GENERATED_AT,
        "steps": steps,
        "metadata": {
            "generatedAt": GENERATED_AT,
            "generator": "fractions-source-pack-generated-v1",
            "sourcePackVersion": "1.0.0-draft",
            "validated": False,
            "humanReviewed": False,
            "approvedForLearners": False
        }
    }


# ============================================================
# LESSON 1: Introduction to Quarters Using Rectangular Cut-outs
# ============================================================
journey_9b887eb8 = make_journey(
    lesson_id="9b887eb8-0a48-4f37-9689-b53113904728",
    title="Introduction to Quarters Using Rectangular Cut-outs",
    qa_word="one quarter (1/4)",
    wc_question="If you have one cake and want to share it fairly with 3 friends, how would you cut it so everyone gets the same amount?",
    wc_options=None,  # not used for think_first
    wc_correct_idx=None,
    wc_fb_ok=None,
    wc_fb_no=None,
    qc_question="This rectangle is divided into 4 equal parts. One part is shaded. What fraction is shaded?",
    qc_options=["one half (1/2)", "one quarter (1/4)", "one third (1/3)", "four quarters (4/4)"],
    qc_correct_idx=1,
    qc_fb_ok="Yes! One out of four equal parts is one quarter. We write it as 1/4. Excellent!",
    qc_fb_no="Count the equal parts. There are 4. One part is shaded. That's one quarter (1/4).",
    practice_question="Which shape shows one quarter (1/4)?",
    pr_options=["Shape A — 4 equal parts, 1 shaded", "Shape B — 2 equal parts, 1 shaded", "Shape C — 4 unequal parts, 1 shaded", "Shape D — 3 equal parts, 1 shaded"],
    pr_correct_idx=0,
    pr_fb_ok="Yes! Shape A has 4 equal parts with 1 shaded. That is one quarter!",
    pr_fb_no="Look for a shape with 4 equal parts. One of those parts should be shaded. That shows one quarter.",
    pr_label="practice-identify-quarters-shape"
)

# Override steps with quarter-specific content
journey_9b887eb8["steps"][0]["owlText"] = "Hello friend! Today we are going to learn about quarters! A quarter is one of four equal parts. Are you ready?"
journey_9b887eb8["steps"][0]["studentText"] = "Today we learn about quarters. A quarter is one of four equal parts!"
journey_9b887eb8["steps"][0]["media"]["altText"] = "Owl teacher waving hello with a rectangle divided into 4 equal parts"
journey_9b887eb8["steps"][0]["media"]["fallbackText"] = "Hello friend! Today we learn about quarters."

journey_9b887eb8["steps"][1]["studentText"] = "Today you will learn what a quarter is. A quarter means one of four equal parts of something whole."

journey_9b887eb8["steps"][2]["owlText"] = "Before we start, think about this: If you have one cake and want to share it fairly with 3 friends (4 people total), how would you cut it so everyone gets the same amount?"
journey_9b887eb8["steps"][2]["studentText"] = "How would you share one cake fairly with 3 friends? Think about it!"
journey_9b887eb8["steps"][2]["media"]["altText"] = "A whole cake with a question mark above it"
journey_9b887eb8["steps"][2]["media"]["fallbackText"] = "Think about sharing one cake fairly with 3 friends."

journey_9b887eb8["steps"][3]["owlText"] = "When we cut something into four equal parts, each part is called a quarter. Look at this rectangle. I will fold it into four equal parts. Each part is one quarter. We write it as 1/4."
journey_9b887eb8["steps"][3]["studentText"] = "A quarter means one of four equal parts. When you fold a paper into four equal parts, each part is one quarter. We write: 1/4"
journey_9b887eb8["steps"][3]["media"]["altText"] = "A rectangle being folded into 4 equal parts. One part is shaded. Shows 1/4."
journey_9b887eb8["steps"][3]["media"]["caption"] = "One quarter. We write it as 1/4."
journey_9b887eb8["steps"][3]["media"]["fallbackText"] = "A rectangle divided into 4 equal parts. One part is shaded. This is one quarter. We write it as 1/4."

journey_9b887eb8["steps"][4]["owlText"] = "We see quarters every day! When you cut a cake into four equal slices, each slice is one quarter. When you fold a paper into four equal parts, each part is one quarter. Quarters are all around us!"
journey_9b887eb8["steps"][4]["studentText"] = "We see quarters every day! When you cut a cake into four equal slices, each slice is one quarter. Quarters are all around us!"
journey_9b887eb8["steps"][4]["media"]["altText"] = "A cake cut into 4 equal slices. A paper folded into 4 equal parts."
journey_9b887eb8["steps"][4]["media"]["caption"] = "Quarters in real life: cake and paper folding."
journey_9b887eb8["steps"][4]["media"]["fallbackText"] = "A cake cut into 4 equal slices. Each slice is one quarter."

journey_9b887eb8["steps"][5]["owlText"] = "Let me show you. This rectangle is divided into 4 equal parts. One part is shaded. The shaded part is one quarter of the whole rectangle. We write it as 1/4. All four parts are the same size — that is what makes them equal."
journey_9b887eb8["steps"][5]["studentText"] = "Look at this rectangle. It is divided into 4 equal parts. One part is shaded. The shaded part is one quarter of the whole rectangle. We write: 1/4. All four parts are the same size."
journey_9b887eb8["steps"][5]["media"]["altText"] = "A rectangle divided into 4 equal parts. One part is shaded. Arrow points to shaded part labeled 1/4."
journey_9b887eb8["steps"][5]["media"]["caption"] = "The shaded part is one quarter. We write: 1/4"
journey_9b887eb8["steps"][5]["media"]["fallbackText"] = "A rectangle divided into 4 equal parts. One part is shaded. This is one quarter. We write: 1/4."

journey_9b887eb8["steps"][6]["owlText"] = "Now it is your turn! Look at these two shapes. One shape is divided into four equal parts. The other is not. Which shape shows quarters? Tap the correct one."
journey_9b887eb8["steps"][6]["studentText"] = "Which shape is divided into 4 equal parts? Tap the shape that shows quarters."
journey_9b887eb8["steps"][6]["media"]["altText"] = "Two shapes side by side. Shape A: rectangle divided into 4 equal parts. Shape B: rectangle divided into 4 unequal parts."
journey_9b887eb8["steps"][6]["media"]["fallbackText"] = "Two rectangles. One has 4 equal parts. One has 4 unequal parts. Which shows quarters?"

journey_9b887eb8["steps"][7]["owlText"] = "Quick check! This circle is divided into 4 equal parts. One part is shaded. What fraction is shaded? Choose the correct answer."
journey_9b887eb8["steps"][7]["studentText"] = "This circle is divided into 4 equal parts. One part is shaded. What fraction is shaded?"
journey_9b887eb8["steps"][7]["media"]["altText"] = "A circle divided into 4 equal parts. One part is shaded."
journey_9b887eb8["steps"][7]["media"]["fallbackText"] = "A circle divided into 4 equal parts. One part is shaded."

journey_9b887eb8["steps"][8]["owlText"] = "You did great today! Think about what you learned. What is a quarter? When something is divided into four equal parts, each part is one quarter."
journey_9b887eb8["steps"][8]["studentText"] = "What did you learn about quarters today? A quarter means one of four equal parts."
journey_9b887eb8["steps"][8]["interaction"]["question"] = "How do you feel about quarters today?"

journey_9b887eb8["steps"][9]["owlText"] = "Wonderful! You learned about quarters today. A quarter means one of four equal parts. You can find quarters in cake, paper, and many things around you. Keep practicing!"
journey_9b887eb8["steps"][9]["studentText"] = "You learned about quarters! A quarter is one of four equal parts. Look for quarters around you!"
journey_9b887eb8["steps"][9]["media"]["altText"] = "Celebration with stars and a badge that says 'I know quarters!'"
journey_9b887eb8["steps"][9]["media"]["fallbackText"] = "Wonderful! You learned about quarters today!"


# ============================================================
# LESSON 2: Comparing Fractions — 1/2 and 1/4
# ============================================================
journey_839653eb = {
    "version": "1.0.0",
    "lessonId": "839653eb-cd5e-405b-a483-b6d307fee352",
    "title": "Comparing Fractions: 1/2 and 1/4",
    "subject": "Mathematics",
    "grade": 2,
    "language": "en",
    "generatedFrom": "fractions-source-pack-draft-v1",
    "generatedAt": GENERATED_AT,
    "steps": [
        make_step(1, "welcome", "Welcome!",
            "Greet the child and set emotional tone",
            "Hello friend! Today we are going to learn about two special fractions: one half and one quarter. Are you ready?",
            "Today we learn about one half (1/2) and one quarter (1/4)!",
            make_svg_media("svg-welcome-compare-fractions-gen", "Owl teacher waving hello with two shapes: one showing 1/2 and one showing 1/4", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(2, "mission", "Our Mission",
            "Tell the child what they will learn",
            "",
            "Today you will learn to tell the difference between one half (1/2) and one quarter (1/4). Both are fractions, but they are different!",
            make_none_media(),
            {"type": "none"},
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(3, "think_first", "Think First!",
            "Activate prior knowledge about halves and quarters",
            "Before we start, think about this: If you cut a chapati into 2 equal pieces, and your friend cuts the same size chapati into 4 equal pieces, which piece is bigger — your piece or your friend's piece?",
            "Think about it: Is a half bigger or smaller than a quarter? Draw or describe your thinking.",
            make_svg_media("svg-think-compare-fractions-gen", "Two chapatis side by side: one cut into 2 pieces, one cut into 4 pieces, with a question mark", required=False),
            {"type": "text_input", "question": "Is one half (1/2) bigger or smaller than one quarter (1/4)? Why do you think so?", "placeholder": "I think... because...", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": True}
        ),
        make_step(4, "learn", "Learn It",
            "Teach the difference between 1/2 and 1/4 visually",
            "Let me show you. Here are two same-size rectangles. The first is divided into 2 equal parts. One part is shaded — that is one half (1/2). The second is divided into 4 equal parts. One part is shaded — that is one quarter (1/4). Look at the shaded parts. The half is bigger! Both are fractions, but they are different.",
            "One half (1/2) and one quarter (1/4) are both fractions. When the wholes are the same size, one half is bigger than one quarter. The more parts you make, the smaller each part becomes.",
            make_svg_media("svg-learn-compare-fractions-gen", "Two same-size rectangles side by side. Left: divided into 2 equal parts, 1 shaded (1/2). Right: divided into 4 equal parts, 1 shaded (1/4). The 1/2 shaded area is visibly larger.", "One half (1/2) and one quarter (1/4). The half is bigger.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(5, "real_life", "Real Life Connection",
            "Connect comparing fractions to real life",
            "We see this in real life! If you share a pizza with one friend (2 people), you get a bigger slice than if you share with 3 friends (4 people). More people means smaller pieces. The same chapati cut into 2 gives bigger pieces than cut into 4!",
            "When you share with more people, each person gets a smaller piece. A half is bigger than a quarter because there are fewer parts.",
            make_svg_media("svg-reallife-compare-fractions-gen", "Two pizzas: one cut into 2 big slices, one cut into 4 small slices. People sharing.", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(6, "example", "Watch and Learn",
            "Show worked examples of identifying 1/2 vs 1/4",
            "Let me show you how to tell them apart. This shape is divided into 2 equal parts. One is shaded. That is one half (1/2). This shape is divided into 4 equal parts. One is shaded. That is one quarter (1/4). Count the total parts to know which fraction it is!",
            "To tell fractions apart: Count the total number of equal parts. 2 parts total = one half. 4 parts total = one quarter. One shaded part in both cases.",
            make_svg_media("svg-example-compare-fractions-gen", "Two shapes: one labeled 1/2 (2 parts, 1 shaded), one labeled 1/4 (4 parts, 1 shaded). Counting arrows show total parts.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(7, "practice", "Your Turn!",
            "Practice identifying whether a shape shows 1/2 or 1/4",
            "Now it is your turn! Look at this shape. Is it showing one half (1/2) or one quarter (1/4)? Tap the correct answer.",
            "This shape has one part shaded. How many equal parts is the whole divided into? Is it 1/2 or 1/4?",
            make_svg_media("svg-practice-compare-fractions-gen", "A rectangle divided into 4 equal parts with 1 part shaded.", required=True),
            make_mcq("What fraction is shaded?", ["one half (1/2)", "one quarter (1/4)", "one whole", "one third (1/3)"], 1,
                "Yes! The shape is divided into 4 equal parts and 1 is shaded. That is one quarter (1/4)!",
                "Count the total equal parts. There are 4. One is shaded. That is one quarter (1/4).",
                practice_label="practice-identify-half-or-quarter"),
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(8, "quick_check", "Quick Check!",
            "Test understanding of equal vs unequal parts (QC-E1)",
            "Quick check! Which shape shows equal parts? Remember: fractions need parts that are the same size.",
            "Which shape shows equal parts?",
            make_svg_media("svg-qc-equal-unequal-gen", "Four shapes: A has 2 equal parts, B has 2 unequal parts, C has 3 unequal parts, D has 4 unequal parts.", required=True),
            make_mcq("Which shape shows equal parts?",
                ["Shape A: rectangle divided into 2 equal parts", "Shape B: rectangle divided into 2 unequal parts",
                 "Shape C: circle divided into 3 unequal parts", "Shape D: square divided into 4 unequal parts"], 0,
                "Yes! Only Shape A has equal parts. Fractions need equal parts!",
                "Remember: fractions need parts that are the same size. Look for the shape where all parts are equal."),
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(9, "reflect", "Think About Your Learning",
            "Help the child reflect",
            "You did great today! Think about what you learned. What is the difference between one half and one quarter? Both are fractions, but they are different!",
            "What did you learn about one half (1/2) and one quarter (1/4) today?",
            make_none_media(),
            {"type": "reflection", "question": "How do you feel about halves and quarters today?",
             "options": ["😊 I understand!", "🤔 I am still learning", "😟 I need more help"],
             "correctAnswer": "", "correctIndex": None, "feedbackCorrect": "", "feedbackIncorrect": "", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(10, "complete", "You Did It!",
            "Celebrate completion",
            "Wonderful! You learned about one half (1/2) and one quarter (1/4) today. Remember: count the equal parts to know the fraction. Keep practicing!",
            "You learned about halves and quarters! Count the equal parts to tell them apart!",
            make_svg_media("svg-complete-compare-fractions-gen", "Celebration with stars and a badge that says 'I know 1/2 and 1/4!'", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
    ],
    "metadata": {
        "generatedAt": GENERATED_AT,
        "generator": "fractions-source-pack-generated-v1",
        "sourcePackVersion": "1.0.0-draft",
        "validated": False,
        "humanReviewed": False,
        "approvedForLearners": False
    }
}


# ============================================================
# LESSON 3: Making Patterns with Fractions
# ============================================================
journey_b163de06 = {
    "version": "1.0.0",
    "lessonId": "b163de06-c0e5-4a42-8bce-ba7dcab330a9",
    "title": "Making Patterns with Fractions",
    "subject": "Mathematics",
    "grade": 2,
    "language": "en",
    "generatedFrom": "fractions-source-pack-draft-v1",
    "generatedAt": GENERATED_AT,
    "steps": [
        make_step(1, "welcome", "Welcome!",
            "Greet the child and set emotional tone",
            "Hello friend! Today we are going to have fun making patterns using fractions! We will use halves and quarters to make beautiful patterns. Ready?",
            "Today we make patterns using fractions! We use halves (1/2) and quarters (1/4).",
            make_svg_media("svg-welcome-patterns-gen", "Owl teacher waving hello with a pattern of shaded shapes: half, quarter, half, quarter", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(2, "mission", "Our Mission",
            "Tell the child what they will learn",
            "",
            "Today you will learn to make patterns using halves (1/2) and quarters (1/4). A pattern is something that repeats in a regular way!",
            make_none_media(),
            {"type": "none"},
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(3, "think_first", "Think First!",
            "Activate prior knowledge about patterns",
            "Before we start, think about this: You know patterns like: big, small, big, small... Today we will make patterns with fractions! What do you think a fraction pattern might look like?",
            "What do you think a pattern using fractions might look like? Think about it!",
            make_svg_media("svg-think-patterns-gen", "A simple pattern: big, small, big, small... with a question mark for the next item", required=False),
            {"type": "text_input", "question": "Can you think of a pattern using shapes or numbers? What comes next: circle, square, circle, square, ...?", "placeholder": "The next one is...", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": True}
        ),
        make_step(4, "learn", "Learn It",
            "Teach fraction patterns",
            "Look at this pattern: a shape with one half shaded, then a shape with one quarter shaded, then one half, then one quarter. It repeats! The pattern is: half, quarter, half, quarter. Can you see what comes next?",
            "A fraction pattern repeats the same fractions in order. Example: half, quarter, half, quarter... The pattern repeats every two shapes. One part is always half shaded, the next is always quarter shaded.",
            make_svg_media("svg-learn-patterns-gen", "A sequence of 6 shapes: half-shaded, quarter-shaded, half-shaded, quarter-shaded, half-shaded, quarter-shaded. Arrows show the repeating pattern.", "Pattern: half, quarter, half, quarter...", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(5, "real_life", "Real Life Connection",
            "Connect fraction patterns to real life",
            "We see patterns everywhere! When you fold paper: fold in half, fold in quarters, fold in half, fold in quarters. When you share food: half a chapati, quarter of a cake, half a chapati, quarter of a cake. These are fraction patterns in real life!",
            "Fraction patterns are everywhere! Folding paper, sharing food, arranging shapes — all can make fraction patterns.",
            make_svg_media("svg-reallife-patterns-gen", "Real-life pattern: half chapati, quarter cake, half chapati, quarter cake.", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(6, "example", "Watch and Learn",
            "Show a worked example of continuing a fraction pattern",
            "Let me show you. Here is a pattern: half, quarter, half, quarter, half... What comes next? The pattern is: half, quarter, repeating. After half comes quarter! So the next shape should show one quarter shaded.",
            "To continue a fraction pattern: Look at the order. What comes next in the repeating sequence? Draw the next shape with the correct fraction shaded.",
            make_svg_media("svg-example-patterns-gen", "Pattern sequence: half, quarter, half, quarter, half, [question mark]. Arrow points to blank space for the answer.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(7, "practice", "Your Turn!",
            "Practice continuing a fraction pattern",
            "Now it is your turn! Look at this pattern: half, quarter, half, quarter... What comes next? Tap the correct shape.",
            "What comes next in this pattern: half, quarter, half, quarter, ...?",
            make_svg_media("svg-practice-patterns-gen", "Pattern: half-shaded, quarter-shaded, half-shaded, quarter-shaded, [blank]. Below: 4 shape options to choose from.", required=True),
            make_mcq("What comes next in the pattern: half, quarter, half, quarter, ...?",
                ["A shape showing one half (1/2) shaded", "A shape showing one quarter (1/4) shaded",
                 "A shape showing one whole shaded", "A shape with no shading"], 0,
                "Yes! The pattern is half, quarter, half, quarter, half... The next one is one half!",
                "Look at the pattern: half, quarter, half, quarter... It keeps repeating. What comes after quarter in the pattern? It is half!",
                practice_label="practice-fraction-pattern"),
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(8, "quick_check", "Quick Check!",
            "Test understanding of fraction patterns",
            "Quick check! Look at this pattern: quarter, half, quarter, half, quarter... What comes next?",
            "What comes next in this pattern: quarter, half, quarter, half, quarter...?",
            make_svg_media("svg-qc-patterns-gen", "Pattern sequence: quarter-shaded, half-shaded, quarter-shaded, half-shaded, quarter-shaded, [question mark].", required=True),
            make_mcq("What comes next in the pattern: quarter, half, quarter, half, quarter...?",
                ["one quarter (1/4)", "one half (1/2)", "one whole", "one third (1/3)"], 1,
                "Yes! The pattern is quarter, half, quarter, half... After quarter comes half!",
                "The pattern repeats: quarter, half, quarter, half... After quarter comes one half."),
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(9, "reflect", "Think About Your Learning",
            "Help the child reflect",
            "You did great today! Think about what you learned. What is a pattern? How can you make a pattern using fractions?",
            "What did you learn about fraction patterns today?",
            make_none_media(),
            {"type": "reflection", "question": "How do you feel about fraction patterns today?",
             "options": ["😊 I understand!", "🤔 I am still learning", "😟 I need more help"],
             "correctAnswer": "", "correctIndex": None, "feedbackCorrect": "", "feedbackIncorrect": "", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(10, "complete", "You Did It!",
            "Celebrate completion",
            "Wonderful! You learned to make patterns with fractions today. A pattern repeats in order. You can make patterns with halves and quarters. Keep creating!",
            "You learned about fraction patterns! A pattern repeats: half, quarter, half, quarter...",
            make_svg_media("svg-complete-patterns-gen", "Celebration with stars and a badge that says 'I know fraction patterns!'", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
    ],
    "metadata": {
        "generatedAt": GENERATED_AT,
        "generator": "fractions-source-pack-generated-v1",
        "sourcePackVersion": "1.0.0-draft",
        "validated": False,
        "humanReviewed": False,
        "approvedForLearners": False
    }
}


# ============================================================
# LESSON 4: Digital Games with Fractions
# ============================================================
journey_dbadac3a = {
    "version": "1.0.0",
    "lessonId": "dbadac3a-b59b-4f76-bebf-efda6fb3e261",
    "title": "Digital Games with Fractions",
    "subject": "Mathematics",
    "grade": 2,
    "language": "en",
    "generatedFrom": "fractions-source-pack-draft-v1",
    "generatedAt": GENERATED_AT,
    "steps": [
        make_step(1, "welcome", "Welcome!",
            "Greet the child and set emotional tone",
            "Hello friend! Today we are going to play fun games with fractions! We will match, sort, and identify halves and quarters. Ready to play?",
            "Today we play fraction games! We match fractions to shapes and sort them.",
            make_svg_media("svg-welcome-digital-gen", "Owl teacher waving hello with game-style elements: shapes, fraction cards, and a score board", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(2, "mission", "Our Mission",
            "Tell the child what they will learn",
            "",
            "Today you will practice fractions by playing matching and sorting games. You will match fractions to shapes and sort shapes into halves and quarters!",
            make_none_media(),
            {"type": "none"},
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(3, "think_first", "Think First!",
            "Activate prior knowledge about fractions",
            "Before we play, think about this: What is a half? What is a quarter? How can you tell them apart? Remember: count the equal parts!",
            "What is a half? What is a quarter? How are they different? Think about it!",
            make_svg_media("svg-think-digital-gen", "Two shapes: one showing 1/2 and one showing 1/4, with a question mark between them", required=False),
            {"type": "text_input", "question": "What is the difference between one half (1/2) and one quarter (1/4)?", "placeholder": "One half is... and one quarter is...", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": True}
        ),
        make_step(4, "learn", "Learn It",
            "Teach fraction matching and sorting",
            "Let me show you how the games work. In the matching game, you see a fraction like 1/2 and you tap the shape that shows one half. In the sorting game, you drag shapes into the correct group: halves or quarters. Count the equal parts to know which is which!",
            "Game 1 — Matching: See a fraction, tap the correct shape. Game 2 — Sorting: Drag shapes into 'halves' or 'quarters' groups. Count the equal parts to decide!",
            make_svg_media("svg-learn-digital-gen", "Game-style layout: fraction cards on one side, shapes on the other. Arrows show matching. Two sorting bins labeled 'halves' and 'quarters'.", "Match the fraction to the shape. Sort shapes into halves and quarters.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(5, "real_life", "Real Life Connection",
            "Connect digital fraction practice to real life",
            "These games help you recognize fractions quickly! When you see a chapati cut in half, you will know it is 1/2. When you see a cake cut into 4 equal slices, you will know each slice is 1/4. The games train your eyes to spot fractions everywhere!",
            "Practicing fractions in games helps you recognize them in real life. Look for halves and quarters around you!",
            make_svg_media("svg-reallife-digital-gen", "Real objects: chapati cut in half (labeled 1/2), cake cut in 4 slices (labeled 1/4 each)", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(6, "example", "Watch and Learn",
            "Show worked example of fraction matching",
            "Let me show you. Here is the fraction 1/2. Which shape matches? This shape is divided into 2 equal parts with 1 shaded. That is one half! It matches. Here is 1/4. Which shape matches? This shape is divided into 4 equal parts with 1 shaded. That is one quarter! It matches.",
            "To match a fraction to a shape: Count the total equal parts. 2 parts = 1/2. 4 parts = 1/4. Find the shape that matches the fraction.",
            make_svg_media("svg-example-digital-gen", "Fraction cards: 1/2 and 1/4. Shapes below with matching arrows. One correct match shown.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(7, "practice", "Your Turn!",
            "Practice fraction matching game",
            "Now it is your turn! Play the matching game. Here is the fraction 1/4. Which shape shows one quarter? Tap the correct shape.",
            "Match the fraction to the shape. Which shape shows 1/4?",
            make_svg_media("svg-practice-digital-gen", "Fraction card showing 1/4. Below: 4 shape options — one with 4 equal parts 1 shaded, others with different divisions.", required=True),
            make_mcq("Which shape shows one quarter (1/4)?",
                ["Shape A: 4 equal parts, 1 shaded", "Shape B: 2 equal parts, 1 shaded",
                 "Shape C: 3 equal parts, 1 shaded", "Shape D: 4 unequal parts, 1 shaded"], 0,
                "Yes! Shape A has 4 equal parts with 1 shaded. That is one quarter!",
                "Look for a shape with 4 equal parts. One of those parts should be shaded. That shows one quarter.",
                practice_label="practice-fraction-matching"),
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(8, "quick_check", "Quick Check!",
            "Test understanding of fair sharing (QC-F1)",
            "Quick check! 2 children want to share a chapati fairly. What fraction does each child get?",
            "2 children share one chapati fairly. What fraction does each child get?",
            make_svg_media("svg-qc-fair-sharing-gen", "A chapati with 2 children beside it. The chapati is divided into 2 equal parts.", required=True),
            make_mcq("2 children share one chapati fairly. What fraction does each child get?",
                ["1/4", "1/3", "1/2", "1 whole"], 2,
                "Correct! When 2 children share fairly, each gets one half. That is fair sharing!",
                "If 2 children share one chapati fairly, we cut it into 2 equal parts. Each child gets 1 out of 2 parts. That is one half."),
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(9, "reflect", "Think About Your Learning",
            "Help the child reflect",
            "You did great today! Think about what you learned. How do you match a fraction to a shape? How do you sort shapes into halves and quarters?",
            "What did you learn about fraction games today?",
            make_none_media(),
            {"type": "reflection", "question": "How do you feel about fraction games today?",
             "options": ["😊 I understand!", "🤔 I am still learning", "😟 I need more help"],
             "correctAnswer": "", "correctIndex": None, "feedbackCorrect": "", "feedbackIncorrect": "", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(10, "complete", "You Did It!",
            "Celebrate completion",
            "Wonderful! You played fraction games today! You matched fractions to shapes and sorted them. Remember: count the equal parts to know the fraction. Keep practicing!",
            "You played fraction games! You can match and sort fractions!",
            make_svg_media("svg-complete-digital-gen", "Celebration with stars and a badge that says 'I played fraction games!'", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
    ],
    "metadata": {
        "generatedAt": GENERATED_AT,
        "generator": "fractions-source-pack-generated-v1",
        "sourcePackVersion": "1.0.0-draft",
        "validated": False,
        "humanReviewed": False,
        "approvedForLearners": False
    }
}


# ============================================================
# LESSON 5: Fractions — Practice and Application
# ============================================================
journey_c71a49c8 = {
    "version": "1.0.0",
    "lessonId": "c71a49c8-e9c6-41e5-b6ef-ad0aa386a59f",
    "title": "Fractions: Practice and Application",
    "subject": "Mathematics",
    "grade": 2,
    "language": "en",
    "generatedFrom": "fractions-source-pack-draft-v1",
    "generatedAt": GENERATED_AT,
    "steps": [
        make_step(1, "welcome", "Welcome!",
            "Greet the child and set emotional tone",
            "Hello friend! Today we are going to practice everything we know about fractions! We will identify halves and quarters, find equal parts, and share fairly. Ready?",
            "Today we practice everything about fractions: halves, quarters, equal parts, and fair sharing!",
            make_svg_media("svg-welcome-practice-gen", "Owl teacher waving hello with various fraction shapes: halves, quarters, equal parts", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(2, "mission", "Our Mission",
            "Tell the child what they will learn",
            "",
            "Today you will practice identifying halves and quarters, finding equal parts, and solving fair sharing problems. It is a fractions workout!",
            make_none_media(),
            {"type": "none"},
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(3, "think_first", "Think First!",
            "Activate prior knowledge about all fraction concepts",
            "Before we start, think about this: What do you remember about fractions? What is a half? What is a quarter? What does 'equal parts' mean? Think about everything you know!",
            "What do you remember about fractions? What is a half? What is a quarter? What are equal parts?",
            make_svg_media("svg-think-practice-gen", "A mind-map style image with 'fractions' in the center and branches: half, quarter, equal parts, sharing", required=False),
            {"type": "text_input", "question": "What do you remember about fractions? Tell me about halves, quarters, and equal parts.", "placeholder": "I remember that...", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": True}
        ),
        make_step(4, "learn", "Learn It",
            "Review all fraction concepts",
            "Let us review everything! A half (1/2) is one of two equal parts. A quarter (1/4) is one of four equal parts. Fractions need equal parts — the parts must be the same size. When you share fairly, everyone gets the same amount. Let us practice all of these!",
            "Review: One half (1/2) = one of two equal parts. One quarter (1/4) = one of four equal parts. Fractions need equal parts. Fair sharing means everyone gets the same amount.",
            make_svg_media("svg-learn-practice-gen", "Four panels: (1) rectangle 2 parts 1 shaded = 1/2, (2) rectangle 4 parts 1 shaded = 1/4, (3) equal vs unequal comparison, (4) 2 children sharing 1 chapati equally", "All fraction concepts: halves, quarters, equal parts, fair sharing.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(5, "real_life", "Real Life Connection",
            "Connect all fraction concepts to real life",
            "Fractions are everywhere! When you cut a chapati in half, that is 1/2. When you cut a cake into 4 equal slices, each is 1/4. When you share food fairly, you are using fractions. When you fold paper evenly, you are making fractions. You use fractions every day!",
            "Fractions are everywhere: food, paper folding, sharing, shapes. Look for halves and quarters around you!",
            make_svg_media("svg-reallife-practice-gen", "Real life collage: chapati cut in half, cake in 4 slices, paper folded evenly, children sharing food", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(6, "example", "Watch and Learn",
            "Show worked examples of mixed fraction tasks",
            "Let me show you some examples. Example 1: This shape is divided into 2 equal parts. One is shaded. What fraction? One half (1/2)! Example 2: This shape is divided into 4 equal parts. One is shaded. What fraction? One quarter (1/4)! Example 3: 2 children share a chapati fairly. What fraction each? One half (1/2)!",
            "Practice identifying: Count the equal parts. 2 parts = 1/2. 4 parts = 1/4. Fair sharing: same number of people = same fraction each.",
            make_svg_media("svg-example-practice-gen", "Three worked examples: (1) 1/2 shape, (2) 1/4 shape, (3) fair sharing with 2 children. Each with answer shown.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(7, "practice", "Your Turn!",
            "Practice mixed fraction identification",
            "Now it is your turn! Look at this shape. It is divided into equal parts. One part is shaded. What fraction is shaded?",
            "This shape has one part shaded. How many equal parts is the whole divided into? What fraction is shaded?",
            make_svg_media("svg-practice-practice-gen", "A rectangle divided into 2 equal parts with 1 part shaded.", required=True),
            make_mcq("What fraction is shaded?",
                ["one half (1/2)", "one quarter (1/4)", "one whole", "one third (1/3)"], 0,
                "Yes! The shape is divided into 2 equal parts and 1 is shaded. That is one half!",
                "Count the total equal parts. There are 2. One is shaded. That is one half (1/2).",
                practice_label="practice-mixed-fraction-identification"),
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(8, "quick_check", "Quick Check!",
            "Test understanding of fair sharing (QC-F1)",
            "Quick check! 2 children want to share a chapati fairly. What fraction does each child get?",
            "2 children share one chapati fairly. What fraction does each child get?",
            make_svg_media("svg-qc-fair-sharing-2-gen", "A chapati with 2 children beside it. The chapati is divided into 2 equal parts.", required=True),
            make_mcq("2 children share one chapati fairly. What fraction does each child get?",
                ["1/4", "1/3", "1/2", "1 whole"], 2,
                "Correct! When 2 children share fairly, each gets one half. That is fair sharing!",
                "If 2 children share one chapati fairly, we cut it into 2 equal parts. Each child gets 1 out of 2 parts. That is one half."),
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(9, "reflect", "Think About Your Learning",
            "Help the child reflect",
            "You did great today! Think about what you learned. You practiced halves, quarters, equal parts, and fair sharing. You are becoming a fractions expert!",
            "What did you learn about fractions today?",
            make_none_media(),
            {"type": "reflection", "question": "How do you feel about fractions today?",
             "options": ["😊 I understand!", "🤔 I am still learning", "😟 I need more help"],
             "correctAnswer": "", "correctIndex": None, "feedbackCorrect": "", "feedbackIncorrect": "", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(10, "complete", "You Did It!",
            "Celebrate completion",
            "Wonderful! You practiced all your fraction skills today. You can identify halves and quarters, find equal parts, and share fairly. Keep looking for fractions everywhere!",
            "You practiced fractions! You know halves, quarters, equal parts, and fair sharing!",
            make_svg_media("svg-complete-practice-gen", "Celebration with stars and a badge that says 'I practiced fractions!'", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
    ],
    "metadata": {
        "generatedAt": GENERATED_AT,
        "generator": "fractions-source-pack-generated-v1",
        "sourcePackVersion": "1.0.0-draft",
        "validated": False,
        "humanReviewed": False,
        "approvedForLearners": False
    }
}


# ============================================================
# LESSON 6: Fractions — Assessment and Reflection
# ============================================================
journey_2e1869d6 = {
    "version": "1.0.0",
    "lessonId": "2e1869d6-f5df-46a1-9d02-b4b53a1062fe",
    "title": "Fractions: Assessment and Reflection",
    "subject": "Mathematics",
    "grade": 2,
    "language": "en",
    "generatedFrom": "fractions-source-pack-draft-v1",
    "generatedAt": GENERATED_AT,
    "steps": [
        make_step(1, "welcome", "Welcome!",
            "Greet the child and set emotional tone",
            "Hello friend! Today we are going to show what we know about fractions! We will answer questions about halves, quarters, equal parts, and fair sharing. Then we will think about what we have learned. Ready?",
            "Today we show what we know about fractions and think about our learning!",
            make_svg_media("svg-welcome-assessment-gen", "Owl teacher waving hello with a checklist and fraction shapes", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(2, "mission", "Our Mission",
            "Tell the child what they will learn",
            "",
            "Today you will answer questions about fractions to show what you know. Then you will think about what you have learned and how you feel. This is your fractions reflection!",
            make_none_media(),
            {"type": "none"},
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(3, "think_first", "Think First!",
            "Activate prior knowledge — comprehensive review",
            "Before we begin, think about everything you know about fractions. What is a half? What is a quarter? What does 'equal parts' mean? What is fair sharing? Think about all the fraction things you have learned!",
            "What do you know about fractions? Think about halves, quarters, equal parts, and fair sharing.",
            make_svg_media("svg-think-assessment-gen", "A brain with fraction symbols inside: 1/2, 1/4, equal signs, sharing images", required=False),
            {"type": "text_input", "question": "Tell me everything you know about fractions. What is a half? What is a quarter? What are equal parts?", "placeholder": "I know that...", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": True}
        ),
        make_step(4, "learn", "Learn It",
            "Review all fraction concepts before assessment",
            "Let us review everything before we start! A half (1/2) is one of two equal parts. A quarter (1/4) is one of four equal parts. Fractions need equal parts — all parts must be the same size. Fair sharing means everyone gets the same amount. Now you are ready!",
            "Review: 1/2 = one of two equal parts. 1/4 = one of four equal parts. Equal parts = same size. Fair sharing = everyone gets the same.",
            make_svg_media("svg-learn-assessment-gen", "Four review panels: (1) 1/2 shape, (2) 1/4 shape, (3) equal vs unequal, (4) fair sharing. Each with a checkmark.", "Review: halves, quarters, equal parts, fair sharing.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(5, "real_life", "Real Life Connection",
            "Connect all fraction concepts to real life",
            "Fractions are all around us! When you cut a chapati in half, that is 1/2. When you cut a cake into 4 equal slices, each is 1/4. When you share food fairly with friends, you are using fractions. When you fold paper evenly, you are making fractions. You have learned so much!",
            "Fractions are everywhere in real life. You have learned to see them in food, paper, sharing, and shapes!",
            make_svg_media("svg-reallife-assessment-gen", "Real life collage: chapati half, cake quarters, paper folding, children sharing, shapes with fractions", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(6, "example", "Watch and Learn",
            "Show examples of assessment-style questions",
            "Let me show you the kinds of questions you will see. Question: This shape is divided into 2 equal parts. One is shaded. What fraction? Answer: one half (1/2)! Question: A cake is cut into 4 equal slices. You eat 1. What fraction? Answer: one quarter (1/4)! You know this!",
            "Assessment questions ask you to: identify fractions from shapes, count equal parts, and solve fair sharing problems. You know how to do all of these!",
            make_svg_media("svg-example-assessment-gen", "Two example questions with answers: (1) shape showing 1/2 with answer, (2) cake with 4 slices with answer", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(7, "practice", "Your Turn!",
            "Practice assessment-style question: identify fraction from shape",
            "Now it is your turn! This circle is divided into 2 equal parts. One part is shaded. What fraction is shaded? Choose the correct answer.",
            "This circle is divided into 2 equal parts. One part is shaded. What fraction is shaded?",
            make_svg_media("svg-practice-assessment-gen", "A circle divided into 2 equal parts. One part is shaded.", required=True),
            make_mcq("What fraction is shaded?",
                ["one quarter (1/4)", "one half (1/2)", "one whole", "one third (1/3)"], 1,
                "Yes! The circle is divided into 2 equal parts and 1 is shaded. That is one half!",
                "Count the equal parts. There are 2. One is shaded. That is one half (1/2).",
                practice_label="practice-assessment-identify-fraction"),
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(8, "quick_check", "Quick Check!",
            "Comprehensive assessment question: equal vs unequal (QC-E1)",
            "Quick check! Which shape shows equal parts? Remember: fractions need parts that are the same size.",
            "Which shape shows equal parts?",
            make_svg_media("svg-qc-equal-unequal-2-gen", "Four shapes: A has 2 equal parts, B has 2 unequal parts, C has 3 unequal parts, D has 4 unequal parts.", required=True),
            make_mcq("Which shape shows equal parts?",
                ["Shape A: rectangle divided into 2 equal parts", "Shape B: rectangle divided into 2 unequal parts",
                 "Shape C: circle divided into 3 unequal parts", "Shape D: square divided into 4 unequal parts"], 0,
                "Yes! Only Shape A has equal parts. Fractions need equal parts!",
                "Remember: fractions need parts that are the same size. Look for the shape where all parts are equal."),
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(9, "reflect", "Think About Your Learning",
            "Deep reflection on all fraction learning",
            "You did great today! Think about everything you have learned about fractions. You learned about halves, quarters, equal parts, fair sharing, patterns, and more. You are a fractions champion!",
            "What did you learn about fractions? How do you feel about what you know?",
            make_none_media(),
            {"type": "reflection", "question": "How do you feel about fractions now?",
             "options": ["😊 I am a fractions champion!", "🤔 I know some things, still learning", "😟 I need more practice"],
             "correctAnswer": "", "correctIndex": None, "feedbackCorrect": "", "feedbackIncorrect": "", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(10, "complete", "You Did It!",
            "Celebrate completion",
            "Wonderful! You completed your fractions assessment today! You know about halves, quarters, equal parts, fair sharing, and patterns. You are a fractions champion! Keep practicing and looking for fractions everywhere!",
            "You completed your fractions assessment! You are a fractions champion!",
            make_svg_media("svg-complete-assessment-gen", "Celebration with stars and a trophy that says 'Fractions Champion!'", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
    ],
    "metadata": {
        "generatedAt": GENERATED_AT,
        "generator": "fractions-source-pack-generated-v1",
        "sourcePackVersion": "1.0.0-draft",
        "validated": False,
        "humanReviewed": False,
        "approvedForLearners": False
    }
}


# ============================================================
# LESSON 7: Identifying 1/2 in Everyday Objects
# ============================================================
journey_159f92b9 = {
    "version": "1.0.0",
    "lessonId": "159f92b9-69c7-45ea-8376-2b15af491360",
    "title": "Identifying 1/2 in Everyday Objects",
    "subject": "Mathematics",
    "grade": 2,
    "language": "en",
    "generatedFrom": "fractions-source-pack-draft-v1",
    "generatedAt": GENERATED_AT,
    "steps": [
        make_step(1, "welcome", "Welcome!",
            "Greet the child and set emotional tone",
            "Hello friend! Today we are going to look for halves in everyday things around us! Food, objects, nature — halves are everywhere! Ready to go on a halves hunt?",
            "Today we look for halves (1/2) in everyday objects around us!",
            make_svg_media("svg-welcome-halves-reallife-gen", "Owl teacher waving hello with everyday objects: chapati, orange, paper, cake — all cut in half", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(2, "mission", "Our Mission",
            "Tell the child what they will learn",
            "",
            "Today you will learn to find halves in everyday objects. A half means one of two equal parts. You will see halves in food, paper, and things around you!",
            make_none_media(),
            {"type": "none"},
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(3, "think_first", "Think First!",
            "Activate prior knowledge about halves in real life",
            "Before we start, think about this: Can you think of something at home that you can cut or fold into two equal parts? What would each part be called?",
            "What things at home can you cut or fold into two equal parts? What is each part called?",
            make_svg_media("svg-think-halves-reallife-gen", "A home scene with various objects: chapati, paper, fruit, cloth — with question marks", required=False),
            {"type": "text_input", "question": "Name something at home that you can divide into two equal parts. What would each part be called?", "placeholder": "I can cut/fold... into two equal parts. Each part is...", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": True}
        ),
        make_step(4, "learn", "Learn It",
            "Teach identifying halves in everyday objects",
            "Let me show you. When you cut a chapati into two equal pieces, each piece is one half of the chapati. When you fold a paper into two equal parts, each part is one half. When you cut an orange into two equal halves, each half is one half of the orange. The key is: the two parts must be equal — the same size!",
            "A half in real life: Cut or fold something into two equal parts. Each part is one half. The parts must be the same size!",
            make_svg_media("svg-learn-halves-reallife-gen", "Three examples: (1) chapati cut into 2 equal pieces, (2) paper folded into 2 equal parts, (3) orange cut into 2 equal halves. Each labeled '1/2'.", "Halves in everyday objects: chapati, paper, orange.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(5, "real_life", "Real Life Connection",
            "Connect halves to many real-life contexts",
            "We see halves everywhere! A chapati cut in half. A piece of paper folded in half. An orange cut into two equal halves. A ribbon cut into two equal pieces. Even a door — each side is one half of the door! Halves are all around us!",
            "Halves are everywhere: food, paper, fruit, ribbons, doors. Look for things divided into two equal parts!",
            make_svg_media("svg-reallife-halves-reallife-gen", "Collage of everyday objects showing halves: chapati, paper, orange, ribbon, door", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(6, "example", "Watch and Learn",
            "Show worked examples of identifying halves in objects",
            "Let me show you how to spot halves. This chapati is cut into two equal pieces. Each piece is one half. How do I know? The two pieces are the same size! This paper is folded into two equal parts. Each part is one half. The parts match exactly — that is how you know they are equal.",
            "To spot halves: Look for two parts that are the same size. If both parts match exactly, each one is one half.",
            make_svg_media("svg-example-halves-reallife-gen", "Two examples: (1) chapati cut into 2 equal pieces with '1/2' label on each, (2) paper folded into 2 equal parts with matching edges shown.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(7, "practice", "Your Turn!",
            "Practice identifying which object shows halves",
            "Now it is your turn! Look at these two objects. One object is divided into two equal parts. The other is not. Which object shows halves? Tap the correct one.",
            "Which object shows halves? Look for two equal parts.",
            make_svg_media("svg-practice-halves-reallife-gen", "Two objects: (A) a chapati cut into 2 equal pieces, (B) a chapati cut into 2 unequal pieces.", required=True),
            make_mcq("Which object shows halves?",
                ["Object A: chapati cut into 2 equal pieces", "Object B: chapati cut into 2 unequal pieces",
                 "Both objects", "Neither object"], 0,
                "Yes! Object A has two equal pieces. Each piece is one half. The parts are the same size!",
                "Look for the object where both parts are the same size. That is what makes halves — equal parts!",
                practice_label="practice-identify-halves-reallife"),
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(8, "quick_check", "Quick Check!",
            "Test understanding of halves in real objects (QC-H2)",
            "Quick check! A chapati is cut into 2 equal pieces. You get 1 piece. What fraction of the chapati do you have?",
            "A chapati is cut into 2 equal pieces. You get 1 piece. What fraction of the chapati do you have?",
            make_svg_media("svg-qc-halves-reallife-gen", "A chapati cut into 2 equal pieces. One piece is highlighted for the child.", required=True),
            make_mcq("A chapati is cut into 2 equal pieces. You get 1 piece. What fraction do you have?",
                ["1/4", "1/2", "1 whole", "2/2"], 1,
                "Correct! One piece out of 2 equal pieces is one half. Good thinking!",
                "The chapati was cut into 2 equal pieces. You have 1 of those pieces. That is one half."),
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(9, "reflect", "Think About Your Learning",
            "Help the child reflect",
            "You did great today! Think about what you learned. Where can you find halves in everyday life? What does 'equal parts' mean? You are a halves detective!",
            "What did you learn about finding halves in everyday objects?",
            make_none_media(),
            {"type": "reflection", "question": "How do you feel about finding halves in everyday objects?",
             "options": ["😊 I can find halves everywhere!", "🤔 I am still learning", "😟 I need more help"],
             "correctAnswer": "", "correctIndex": None, "feedbackCorrect": "", "feedbackIncorrect": "", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(10, "complete", "You Did It!",
            "Celebrate completion",
            "Wonderful! You learned to find halves in everyday objects today. Look around you — halves are in your food, your paper, your world! Keep being a halves detective!",
            "You learned to find halves in everyday objects! Look for halves everywhere!",
            make_svg_media("svg-complete-halves-reallife-gen", "Celebration with stars and a badge that says 'I found halves!'", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
    ],
    "metadata": {
        "generatedAt": GENERATED_AT,
        "generator": "fractions-source-pack-generated-v1",
        "sourcePackVersion": "1.0.0-draft",
        "validated": False,
        "humanReviewed": False,
        "approvedForLearners": False
    }
}


# ============================================================
# LESSON 8: Identifying 1/4 in Everyday Objects
# ============================================================
journey_60441bd5 = {
    "version": "1.0.0",
    "lessonId": "60441bd5-774f-4135-9871-666fc481b13b",
    "title": "Identifying 1/4 in Everyday Objects",
    "subject": "Mathematics",
    "grade": 2,
    "language": "en",
    "generatedFrom": "fractions-source-pack-draft-v1",
    "generatedAt": GENERATED_AT,
    "steps": [
        make_step(1, "welcome", "Welcome!",
            "Greet the child and set emotional tone",
            "Hello friend! Today we are going to look for quarters in everyday things around us! Food, objects, nature — quarters are everywhere! Ready to go on a quarters hunt?",
            "Today we look for quarters (1/4) in everyday objects around us!",
            make_svg_media("svg-welcome-quarters-reallife-gen", "Owl teacher waving hello with everyday objects: cake, pizza, chocolate — all cut into 4 equal parts", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(2, "mission", "Our Mission",
            "Tell the child what they will learn",
            "",
            "Today you will learn to find quarters in everyday objects. A quarter means one of four equal parts. You will see quarters in food, paper, and things around you!",
            make_none_media(),
            {"type": "none"},
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(3, "think_first", "Think First!",
            "Activate prior knowledge about quarters in real life",
            "Before we start, think about this: Can you think of something at home that you can cut or fold into four equal parts? What would each part be called?",
            "What things at home can you cut or fold into four equal parts? What is each part called?",
            make_svg_media("svg-think-quarters-reallife-gen", "A home scene with various objects: cake, pizza, paper, chocolate — with question marks", required=False),
            {"type": "text_input", "question": "Name something at home that you can divide into four equal parts. What would each part be called?", "placeholder": "I can cut/fold... into four equal parts. Each part is...", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": True}
        ),
        make_step(4, "learn", "Learn It",
            "Teach identifying quarters in everyday objects",
            "Let me show you. When you cut a cake into four equal slices, each slice is one quarter of the cake. When you fold a paper twice to make four equal parts, each part is one quarter. When you break a chocolate bar into four equal pieces, each piece is one quarter. The key is: the four parts must be equal — the same size!",
            "A quarter in real life: Cut or fold something into four equal parts. Each part is one quarter. All four parts must be the same size!",
            make_svg_media("svg-learn-quarters-reallife-gen", "Three examples: (1) cake cut into 4 equal slices, (2) paper folded into 4 equal parts, (3) chocolate bar broken into 4 equal pieces. Each labeled '1/4'.", "Quarters in everyday objects: cake, paper, chocolate.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(5, "real_life", "Real Life Connection",
            "Connect quarters to many real-life contexts",
            "We see quarters everywhere! A cake cut into four equal slices. A pizza cut into four equal pieces. A paper folded into four equal parts. A chocolate bar broken into four equal pieces. Even a window with four equal panes — each pane is one quarter of the window! Quarters are all around us!",
            "Quarters are everywhere: cake, pizza, paper, chocolate, windows. Look for things divided into four equal parts!",
            make_svg_media("svg-reallife-quarters-reallife-gen", "Collage of everyday objects showing quarters: cake, pizza, paper, chocolate, window", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(6, "example", "Watch and Learn",
            "Show worked examples of identifying quarters in objects",
            "Let me show you how to spot quarters. This cake is cut into four equal slices. Each slice is one quarter. How do I know? All four slices are the same size! This paper is folded into four equal parts. Each part is one quarter. All four parts match exactly — that is how you know they are equal.",
            "To spot quarters: Look for four parts that are the same size. If all four parts match exactly, each one is one quarter.",
            make_svg_media("svg-example-quarters-reallife-gen", "Two examples: (1) cake cut into 4 equal slices with '1/4' label on each, (2) paper folded into 4 equal parts with matching edges shown.", required=True),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": False}
        ),
        make_step(7, "practice", "Your Turn!",
            "Practice identifying which object shows quarters",
            "Now it is your turn! Look at these two objects. One object is divided into four equal parts. The other is not. Which object shows quarters? Tap the correct one.",
            "Which object shows quarters? Look for four equal parts.",
            make_svg_media("svg-practice-quarters-reallife-gen", "Two objects: (A) a cake cut into 4 equal slices, (B) a cake cut into 4 unequal slices.", required=True),
            make_mcq("Which object shows quarters?",
                ["Object A: cake cut into 4 equal slices", "Object B: cake cut into 4 unequal slices",
                 "Both objects", "Neither object"], 0,
                "Yes! Object A has four equal slices. Each slice is one quarter. All parts are the same size!",
                "Look for the object where all four parts are the same size. That is what makes quarters — four equal parts!",
                practice_label="practice-identify-quarters-reallife"),
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(8, "quick_check", "Quick Check!",
            "Test understanding of quarters in real objects (QC-Q2)",
            "Quick check! A cake is cut into 4 equal slices. You eat 1 slice. What fraction of the cake did you eat?",
            "A cake is cut into 4 equal slices. You eat 1 slice. What fraction of the cake did you eat?",
            make_svg_media("svg-qc-quarters-reallife-gen", "A cake cut into 4 equal slices. One slice is highlighted as eaten.", required=True),
            make_mcq("A cake is cut into 4 equal slices. You eat 1 slice. What fraction did you eat?",
                ["1/2", "1/4", "1/3", "1 whole"], 1,
                "Correct! One slice out of 4 equal slices is one quarter. Well done!",
                "The cake was cut into 4 equal slices. You ate 1 slice. That is one quarter of the cake."),
            {"requiresOwlText": False, "requiresStudentText": True, "requiresMedia": True, "requiresInteraction": True}
        ),
        make_step(9, "reflect", "Think About Your Learning",
            "Help the child reflect",
            "You did great today! Think about what you learned. Where can you find quarters in everyday life? What does 'four equal parts' mean? You are a quarters detective!",
            "What did you learn about finding quarters in everyday objects?",
            make_none_media(),
            {"type": "reflection", "question": "How do you feel about finding quarters in everyday objects?",
             "options": ["😊 I can find quarters everywhere!", "🤔 I am still learning", "😟 I need more help"],
             "correctAnswer": "", "correctIndex": None, "feedbackCorrect": "", "feedbackIncorrect": "", "requiresSave": False},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
        make_step(10, "complete", "You Did It!",
            "Celebrate completion",
            "Wonderful! You learned to find quarters in everyday objects today. Look around you — quarters are in your food, your paper, your world! Keep being a quarters detective!",
            "You learned to find quarters in everyday objects! Look for quarters everywhere!",
            make_svg_media("svg-complete-quarters-reallife-gen", "Celebration with stars and a badge that says 'I found quarters!'", required=False),
            {"type": "none"},
            {"requiresOwlText": True, "requiresStudentText": True, "requiresMedia": False, "requiresInteraction": False}
        ),
    ],
    "metadata": {
        "generatedAt": GENERATED_AT,
        "generator": "fractions-source-pack-generated-v1",
        "sourcePackVersion": "1.0.0-draft",
        "validated": False,
        "humanReviewed": False,
        "approvedForLearners": False
    }
}


# ============================================================
# Write all files
# ============================================================
journeys = {
    "9b887eb8-quarters-journey.json": journey_9b887eb8,
    "839653eb-comparing-fractions-journey.json": journey_839653eb,
    "b163de06-fraction-patterns-journey.json": journey_b163de06,
    "dbadac3a-digital-games-fractions-journey.json": journey_dbadac3a,
    "c71a49c8-fractions-practice-application-journey.json": journey_c71a49c8,
    "2e1869d6-fractions-assessment-reflection-journey.json": journey_2e1869d6,
    "159f92b9-identifying-halves-reallife-journey.json": journey_159f92b9,
    "60441bd5-identifying-quarters-reallife-journey.json": journey_60441bd5,
}

for filename, journey in journeys.items():
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(journey, f, indent=2, ensure_ascii=False)
    print(f"Written: {filename} ({len(journey['steps'])} steps)")

print(f"\nAll {len(journeys)} journey files written to {OUTPUT_DIR}")
