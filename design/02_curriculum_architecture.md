# SECTION 2 — CURRICULUM ARCHITECTURE

## CBC Curriculum Mapping Structure

**Core Concept:** Silent Structural Mapping Engine (SSME)

The SSME operates invisibly to learners while ensuring every activity aligns with official CBC frameworks. It's a multi-dimensional tagging and tracking system that maps learning experiences to curriculum standards without exposing the complexity to students.

**Mapping Dimensions:**
1. **Grade Level** (5)
2. **Subject Area** (Mathematics, Science & Technology, etc.)
3. **Strand** (Within each subject)
4. **Sub-strand** (Within each strand)
5. **Specific Learning Outcome (SLO)** (Measurable competency)
6. **Core Competency** (1 of 7)
7. **Core Value** (1 of 8)
8. **Pertinent and Contemporary Issue (PCI)** (Relevant themes)
9. **Lesson Duration** (Time allocation)
10. **Difficulty Level** (Cognitive complexity)

**Architecture Example:**
```javascript
// Silent mapping structure (not visible to learners)
const curriculumMapping = {
  grade: 5,
  subjects: {
    mathematics: {
      strands: {
        "numbers": {
          subStrands: {
            "whole numbers": {
              slo: "MULTIPLY_UP_TO_3_BY_2_DIGIT_NUMBERS",
              description: "Multiplies up to 3-digit by 2-digit numbers",
              competencies: ["critical_thinking", "problem_solving"],
              values: ["responsibility", "self_efficacy"],
              pcis: ["financial_literacy"],
              difficulty: 3, // 1-5 scale
              timeMinutes: 40
            }
          }
        }
      }
    },
    science: {
      strands: {
        "living_things": {
          subStrands: {
            "plants": {
              slo: "DESCRIBE_PARTS_AND_FUNCTIONS_OF_FLOWERING_PLANTS",
              description: "Describes the parts and functions of flowering plants",
              competencies: ["critical_thinking", "learning_to_learn"],
              values: ["respect", "unity"],
              pcis: ["environmental_education"],
              difficulty: 2,
              timeMinutes: 35
            }
          }
        }
      }
    }
  }
};
```

**How SSME Works in Practice:**
1. When a student completes a "Water Cycle Experiment" quest:
   - System silently tags activity with: Science strand → "earth and space" → sub-strand "water cycle"
   - Maps to SLO: "EXPLAIN_THE_WATER_CYCLE"
   - Records demonstrated competencies: critical_thinking, learning_to_learn
   - Records demonstrated values: responsibility, respect
   - Notes PCI relevance: environmental_education
   - Logs time spent and difficulty level encountered

2. **Teacher/Parent View (separate interface):**
   - Shows coverage maps: "This week covered 80% of Number SLOs, 60% of Science SLOs"
   - Competency radar: Visual representation of competency development
   - Value indicators: Which values are being actively demonstrated
   - PCI engagement: How contemporary issues are being explored

3. **Adaptive Engine Input:**
   - Mapping data feeds AI recommendations for next activities
   - Identifies gaps in curriculum coverage
   - Suggests reinforcement activities for weak areas
   - Tracks longitudinal development across competencies

## Theme-Based Organization System

**Theme Architecture:**
Themes are delivery containers that integrate multiple subjects around engaging, real-world concepts.

**Theme Structure:**
```javascript
const theme = {
  id: "water_rivers",
  title: "Water & Rivers",
  durationWeeks: 4,
  drivingQuestion: "How does water shape our community and our lives?",
  subjectsIntegrated: [
    "science",
    "mathematics", 
    "english",
    "kiswahili",
    "social_studies",
    "creative_arts"
  ],
  learningOutcomes: {
    science: ["WATER_CYCLE_EXPLANATION", "WATER_PURIFICATION_METHODS"],
    mathematics: ["VOLUME_MEASUREMENT", "RIVER_DISTANCE_CALCULATION"],
    english: ["WATER_THEME_READING_COMPREHENSION", "HYDROLOGY_REPORT_WRITING"],
    kiswahili: ["MAJI_YA_METROPOLI_VOCABULARY", "MAJI_YA_METROPOLI_STORYTELLING"],
    socialStudies: ["RIVERS_IN_KENYAN_HISTORY", "WATER_RESOURCE_MANAGEMENT"],
    creativeArts: ["RIVER_ECOSYSTEM_ILLUSTRATION", "WATER_THEME_MUSIC_COMPOSITION"]
  },
  competenciesDeveloped: ["critical_thinking", "communication", "citizenship"],
  valuesCultivated: ["responsibility", "respect", "unity"],
  pcisAddressed: ["environmental_education", "disaster_risk_reduction"],
  kickoffActivity: "River observation field trip",
  culminatingProject: "Community water conservation campaign",
  weeklyBreakdown: [
    { week: 1, focus: "Water Sources & Properties", activities: ["observation", "experiment", "journaling"] },
    { week: 2, focus: "The Water Cycle", activities: ["model_building", "simulation", "drawing"] },
    { week: 3, focus: "Rivers & Communities", activities: ["mapping", "interview", "storytelling"] },
    { week: 4, focus: "Water Conservation", activities: ["campaign_design", "implementation", "reflection"] }
  ]
};
```

**Theme Selection Criteria:**
1. **Relevance:** Connects to students' local environment and experiences
2. **Richness:** Offers multiple entry points across subjects
3. **Depth:** Supports sustained inquiry over 3-6 weeks
4. **Authenticity:** Based on real-world phenomena and challenges
5. **Scalability:** Can be adapted for different grades with increasing complexity

## Cross-Subject Integration Framework

**Integration Levels:**

1. **Surface Level (Weekly):** Different subjects address same theme but separately
   - *Example:* Math measures rainfall, Science studies water cycle, English reads water stories

2. **Thematic Level (Unit-Based):** Subjects collaborate on interconnected activities
   - *Example:* Students measure local stream volume (Math), test water quality (Science), write persuasive letters about conservation (English), create awareness posters (Art)

3. **Interdisciplinary Level (Project-Based):** Single activity requires multiple subject applications
   - *Example:* Designing a rainwater harvesting system requires:
     - Math: Volume calculations, cost estimation
     - Science: Evaporation principles, material properties
     - English: Design documentation, presentation
     - Kiswahili: Community communication
     - Social Studies: Water rights, community impact
     - Art: Technical drawing, aesthetic design

**Integration Mechanisms:**
- **Shared Driving Questions:** All subjects explore aspects of the same central question
- **Common Projects:** Culminating projects require multiple subject applications
- **Joint Assessments:** Rubrics evaluate learning across subject areas
- **Teacher Collaboration:** Planned common planning time for theme development
- **Flexible Scheduling:** Blocks of time for interdisciplinary work

## Grade Progression Model

**Vertical Articulation Principles:**
1. **Spiraling Complexity:** Concepts revisited with increasing depth
2. **Competency Progression:** Same competencies developed at higher levels each year
3. **Theme Evolution:** Similar themes explored with grade-appropriate complexity
4. **Skill Building:** Foundational skills support advanced applications

**Grade 5 Specific Focus:**
- Increased abstraction and symbolic representation
- Multi-step problem solving
- Extended project work (2-4 weeks)
- Peer teaching and mentoring opportunities
- Connection to local and national issues
- Preparation for more independent learning in Grade 6

**Progression Example (Water Theme):**
- **Grade 3:** Observe water uses, simple sinking/floating experiments
- **Grade 4:** Water states, basic water cycle diagram, local water sources
- **Grade 5:** Detailed water cycle processes, watershed concepts, water conservation projects
- **Grade 6:** Water pollution analysis, irrigation systems, global water issues

## Weekly Learning Structure

**Recommended Weekly Rhythm (Grade 5):**
```
Monday: Theme Launch + Exploration (60 min)
Tuesday: Skill Building + Application (60 min)
Wednesday: Project Work + Collaboration (60 min)
Thursday: Real-World Connection + Field Work (60 min)
Friday: Reflection + Sharing + Celebration (60 min)
```

**Daily Block Structure (2-3 hours total):**
- **Warm-up/Connection (10 min):** Quick engagement activity
- **Focused Learning (20-25 min):** Primary instructional activity
- **Movement/Break (5-10 min):** Physical activity or mindfulness
- **Application/Practice (20-25 min):** Hands-on work or collaborative activity
- **Reflection/Journaling (10-15 min):** Processing and documentation
- **Extension/Choice Time (10-20 min):** Optional exploration or skill practice

**Weekly Theme Example (Water & Rivers - Week 2):**
- **Monday:** Introduction to evaporation/condensation (demo + observation)
- **Tuesday:** Measuring liquid volume lab (math + science)
- **Wednesday:** Building water cycle models in groups (art + science)
- **Thursday:** Local pond/stream observation field trip (social studies + science)
- **Friday:** Create water cycle comic strips + share learning (english + art)

## Skill Dependency/Prerequisite System

**Dependency Mapping:**
Skills form a network where certain competencies unlock more advanced applications.

**Example Dependency Chain:**
```
Number Recognition → Counting → Place Value → Addition/Subtraction → 
Multiplication/Division → Fractions → Decimals → Percentages → 
Ratios → Algebraic Thinking
```

**System Features:**
1. **Prerequisite Tracking:** System knows what skills are needed for each activity
2. **Readiness Indicators:** Shows when student has necessary foundations
3. **Gap Identification:** Recommends prerequisite activities when needed
4. **Multiple Pathways:** Different routes to achieve same competency
5. **Adaptive Sequencing:** Adjusts activity order based on demonstrated readiness

**Prerequisite Schema Example:**
```javascript
const activityPrerequisites = {
  id: "calculate_river_volume",
  title: "Calculate River Water Volume",
  prerequisites: {
    mathematics: ["VOLUME_CONCEPT", "UNIT_CONVERSION", "BASIC_MULTIPLICATION"],
    science: ["LIQUID_PROPERTIES", "MEASUREMENT_TOOLS"],
    competencies: ["critical_thinking"], // needs basic CT skills
    values: [], // no specific values required
    timeEstimate: 30, // minutes
    difficulty: 3
  },
  unlocks: [
    "design_water_collection_system",
    "compare_water_sources", 
    "calculate_daily_water_usage"
  ]
};
```

## Curriculum Metadata Structure

**Comprehensive Metadata Framework:**
Each learning asset carries rich metadata for tracking, personalization, and reporting.

**Metadata Schema:**
```javascript
const learningAssetMetadata = {
  // Identification
  id: "water_cycle_experiment_001",
  title: "Mini Water Cycle in a Bag",
  type: "experiment",
  themeId: "water_rivers",
  
  // Curriculum Mapping (Silent)
  curriculum: {
    grade: 5,
    subjects: ["science", "mathematics"],
    strands: {
      science: ["earth_and_space"],
      mathematics: ["measurement"]
    },
    subStrands: {
      science: ["water_cycle"],
      mathematics: ["volume_and_capacity"]
    },
    specificLearningOutcomes: [
      "EXPLAIN_WATER_CYCLE_PROCESSES",
      "MEASURE_LIQUID_VOLUME_USING_STANDARD_UNITS"
    ],
    coreCompetencies: ["critical_thinking", "learning_to_learn"],
    coreValues: ["responsibility", "respect"],
    pertinentContemporaryIssues: ["environmental_education"],
    estimatedDurationMinutes: 40,
    difficultyLevel: 2, // 1-5 scale
    cognitiveLevel: "application" // Bloom's taxonomy: remember, understand, apply, analyze, evaluate, create
  },
  
  // Experience Design
  experience: {
    learningModalities: ["hands_on", "visual", "collaborative"],
    realWorldConnection: "local_water_observation",
    extensionActivities: ["home_water_cycle_observation", "rain_gauge_building"],
    adaptationOptions: {
      support: ["picture_instructions", "partner_work", "pre_measured_materials"],
      challenge: ["calculate_evaporation_rate", "design_water_cycle_model"]
    },
    materials: [
      "zip_lock_bag", "water", "blue_food_coloring", "marker", "tape", "sunny_window"
    ],
    safetyConsiderations: ["adult_supervision_for_hot_water_if_used"]
  },
  
  // Engagement & Motivation
  engagement: {
    xpBase: 150,
    xpBonusForCreativity: 50,
    xpBonusForCollaboration: 30,
    streakEligible: true,
    badgePotential: ["water_explorer", "young_scientist"],
    choiceElements: ["location_selection", "decoration_choices", "observation_focus"]
  },
  
  // Assessment & Evidence
  assessment: {
    evidenceTypes: ["observation_notes", "photo_documentation", "verbal_explanation", "drawing"],
    successCriteria: [
      "Can explain evaporation, condensation, precipitation",
      "Can measure water volume accurately",
      "Works collaboratively to set up experiment",
      "Records observations clearly"
    ],
    rubricReferences: ["science_inquiry_rubric", "collaboration_rubric"],
    selfAssessmentPrompts: [
      "What surprised you about your water cycle bag?",
      "How is your bag like the real water cycle?",
      "What would you change if you did this again?"
    ]
  },
  
  // Adaptation & Personalization
  adaptation: {
    readingLevel: "grade_4-5", // For any text components
    languageSupport: ["english", "kiswahili"],
    sensoryConsiderations: ["visual_tactile", "low_auditory_distraction"],
    pacingOptions: ["self_paced", "guided_steps"],
    technologyIntegration: ["photo_documentation_app", "simple_timer"]
  },
  
  // Usage & Effectiveness Tracking
  analytics: {
    timesUsed: 0,
    averageCompletionTime: null,
    masteryRate: null,
    engagementScore: null,
    difficultyPerception: null, // Student-reported
    enjoymentRating: null, // Student-reported
    realWorldTransfer: null // Parent/teacher reported later
  },
  
  // Versioning & Provenance
  version: {
    created: "2026-05-20",
    modified: "2026-05-20",
    version: "1.0.0",
    createdBy: "curriculum_team",
    reviewedBy: "subject_experts",
    pilotTested: false,
    licenses: ["cc_by_sa_4_0"]
  }
};
```

This metadata system enables:
- Intelligent content recommendation
- Personalized learning pathways
- Comprehensive progress tracking
- Quality assurance and improvement
- Localization and adaptation
- Research and efficacy studies