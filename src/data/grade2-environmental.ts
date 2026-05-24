// @ts-nocheck
// Grade 2 Environmental Activities — Continuation
import type { QuestGroup, GeneratedContentBlock } from "./content-types";

let blockIdCounter = 1000;
function blockId(): string { return `blk_${++blockIdCounter}`; }

function textBlock(content: string): GeneratedContentBlock {
  return { id: blockId(), type: "text", data: { content } };
}
function quizBlock(question: string, options: string[], correctIndex: number, explanation: string): GeneratedContentBlock {
  return { id: blockId(), type: "quiz", data: { question, options, correctIndex, explanation } };
}
function experimentBlock(title: string, materials: string[], steps: string[]): GeneratedContentBlock {
  return { id: blockId(), type: "experiment", data: { title, materials, steps } };
}
function journalBlock(prompt: string): GeneratedContentBlock {
  return { id: blockId(), type: "journal", data: { prompt, placeholder: "Write or draw your answer..." } };
}
function imageBlock(url: string, caption: string): GeneratedContentBlock {
  return { id: blockId(), type: "image", data: { url: `/media/grade2/${url}`, caption } };
}
function generateXp(base: number): { base: number } {
  return { base: Math.round(base * 0.8) };
}

export function generateGrade2Environmental(): QuestGroup[] {
  const quests: QuestGroup[] = [];

  // Weather Watchers
  quests.push({
    id: "g2-env-weather",
    title: "Weather Watchers",
    slug: "weather-watchers",
    description: "Observe and track weather conditions",
    orderIndex: 1,
    questType: "MAIN",
    theme: "g2-weather-watchers",
    grade: 2,
    subjects: ["Environmental Activities"],
    xpReward: generateXp(130),
    cbcMapping: {
      subjects: ["Environmental Activities"],
      strands: ["Weather and the Environment"],
      subStrands: ["Weather conditions", "Weather symbols", "Effects of weather"],
      specificLearningOutcomes: ["IDENTIFY_WEATHER", "USE_WEATHER_SYMBOLS", "CHOOSE_WEATHER_CLOTHES"],
      coreCompetencies: ["critical_thinking", "learning_to_learn"],
      coreValues: ["responsibility"],
      pertinentContemporaryIssues: ["environmental_education"],
    },
    lessons: [
      {
        topic: {} as any, title: "Types of Weather", slug: "types-of-weather",
        description: "Identify sunny, rainy, windy, and cloudy weather",
        contentBlocks: [
          textBlock("Weather changes every day! ☀️🌧️💨☁️ Sunny means the sun is shining. Rainy means water falls from the sky. Windy means the air is moving fast. Cloudy means the sky is covered with clouds."),
          experimentBlock("Weather Observation", ["window or outdoor space", "weather chart"], ["Go outside or look through the window", "What do you see? Is it sunny, rainy, windy, or cloudy?", "Draw a symbol for today's weather", "Do this every day for a week!"]),
          quizBlock("When water falls from the sky, the weather is...", ["Sunny", "Rainy", "Windy", "Cloudy"], 1, "When water falls from the sky, it's rainy!"),
          journalBlock("Draw today's weather. Write one sentence about it."),
        ],
        xpReward: generateXp(40),
        difficulty: { complexityScore: 1, cognitiveLevel: "remember", prerequisiteLoad: 0, abstractness: 1 },
        cbcMapping: { subjects: ["Environmental Activities"], strands: { environmental: ["Weather and the Environment"] }, subStrands: { environmental: ["Weather conditions"] }, specificLearningOutcomes: ["IDENTIFY_WEATHER_CONDITIONS"], coreCompetencies: ["critical_thinking", "learning_to_learn"], coreValues: ["responsibility"], pertinentContemporaryIssues: ["environmental_education"], difficultyLevel: 1, cognitiveLevel: "remember" },
      },
      {
        topic: {} as any, title: "Weather Symbols and Charts", slug: "weather-symbols-charts",
        description: "Draw and use weather symbols to record weekly changes",
        contentBlocks: [
          textBlock("We can draw symbols for weather! ☀️ = sunny, 🌧️ = rainy, 💨 = windy, ☁️ = cloudy. Let's make a chart to track the weather for a whole week!"),
          experimentBlock("Weekly Weather Chart", ["paper", "crayons"], ["Draw a chart with 7 columns (one for each day)", "Each morning, look outside", "Draw the weather symbol for that day", "At the end of the week, count: how many sunny days? rainy days?"]),
          quizBlock("Which symbol means 'rainy'?", ["☀️", "🌧️", "💨", "☁️"], 1, "🌧️ means rainy!"),
        ],
        xpReward: generateXp(40),
        difficulty: { complexityScore: 2, cognitiveLevel: "apply", prerequisiteLoad: 1, abstractness: 2 },
        cbcMapping: { subjects: ["Environmental Activities"], strands: { environmental: ["Weather and the Environment"] }, subStrands: { environmental: ["Weather symbols"] }, specificLearningOutcomes: ["USE_WEATHER_SYMBOLS"], coreCompetencies: ["critical_thinking", "creativity"], coreValues: ["responsibility"], pertinentContemporaryIssues: ["environmental_education"], difficultyLevel: 2, cognitiveLevel: "apply" },
      },
      {
        topic: {} as any, title: "Dressing for the Weather", slug: "dressing-for-weather",
        description: "Choose appropriate clothing for different weather",
        contentBlocks: [
          textBlock("We dress differently depending on the weather! 🧥 In rainy weather, we wear a raincoat and gumboots. In sunny weather, we wear light clothes and a hat."),
          quizBlock("What should you wear on a rainy day?", ["Sunglasses", "Raincoat and gumboots", "Light dress", "Sandals"], 1, "On a rainy day, wear a raincoat and gumboots!"),
          journalBlock("Draw yourself dressed for sunny weather. Now draw yourself dressed for rainy weather."),
        ],
        xpReward: generateXp(35),
        difficulty: { complexityScore: 1, cognitiveLevel: "apply", prerequisiteLoad: 1, abstractness: 1 },
        cbcMapping: { subjects: ["Environmental Activities"], strands: { environmental: ["Weather and the Environment"] }, subStrands: { environmental: ["Effects of weather"] }, specificLearningOutcomes: ["CHOOSE_WEATHER_CLOTHES"], coreCompetencies: ["critical_thinking", "self_efficacy"], coreValues: ["responsibility"], pertinentContemporaryIssues: ["environmental_education"], difficultyLevel: 1, cognitiveLevel: "apply" },
      },
    ],
  });

  // Natural Environment
  quests.push({
    id: "g2-env-natural",
    title: "Our Natural World",
    slug: "our-natural-world",
    description: "Explore physical features, plants, and animals",
    orderIndex: 2,
    questType: "MAIN",
    theme: "g2-our-natural-world",
    grade: 2,
    subjects: ["Environmental Activities"],
    xpReward: generateXp(140),
    cbcMapping: {
      subjects: ["Environmental Activities"],
      strands: ["Natural Environment & Physical Features"],
      subStrands: ["Physical features", "Plants", "Animals"],
      specificLearningOutcomes: ["IDENTIFY_LANDFORMS", "IDENTIFY_PLANTS", "DIFFERENTIATE_ANIMALS"],
      coreCompetencies: ["critical_thinking", "learning_to_learn"],
      coreValues: ["responsibility", "respect"],
      pertinentContemporaryIssues: ["environmental_education"],
    },
    lessons: [
      {
        topic: {} as any, title: "Physical Features Around Us", slug: "physical-features",
        description: "Identify hills, rivers, forests, and valleys",
        contentBlocks: [
          textBlock("Our land has different shapes! 🏔️ A hill is a high place. A river is flowing water. A forest has many trees. A valley is low land between hills."),
          imageBlock("landforms.png", "Picture showing a hill, river, forest, and valley"),
          quizBlock("Flowing water is called a...", ["Hill", "Forest", "River", "Valley"], 2, "A river is flowing water!"),
          journalBlock("Draw any two physical features you have seen near your home."),
        ],
        xpReward: generateXp(35),
        difficulty: { complexityScore: 1, cognitiveLevel: "remember", prerequisiteLoad: 0, abstractness: 1 },
        cbcMapping: { subjects: ["Environmental Activities"], strands: { environmental: ["Natural Environment & Physical Features"] }, subStrands: { environmental: ["Physical Features: Identifying local landforms"] }, specificLearningOutcomes: ["IDENTIFY_LANDFORMS"], coreCompetencies: ["critical_thinking"], coreValues: ["responsibility"], pertinentContemporaryIssues: ["environmental_education"], difficultyLevel: 1, cognitiveLevel: "remember" },
      },
      {
        topic: {} as any, title: "Plants Around Us", slug: "plants-around-us",
        description: "Identify common trees and flowers and how to care for them",
        contentBlocks: [
          textBlock("Plants are living things that grow! 🌱 Trees, flowers, and grass are all plants. They need water, sunlight, and soil to grow."),
          experimentBlock("Planting a Seed", ["bean seeds", "soil", "small pot or container", "water"], ["Fill a pot with soil", "Plant a bean seed about 1 finger deep", "Add water", "Place in a sunny spot", "Water every day and watch it grow!"]),
          quizBlock("What do plants need to grow?", ["Darkness", "Water, sunlight, and soil", "Cold", "Noise"], 1, "Plants need water, sunlight, and soil to grow!"),
          journalBlock("Draw a plant and label its parts: roots, stem, leaves."),
        ],
        xpReward: generateXp(40),
        difficulty: { complexityScore: 2, cognitiveLevel: "understand", prerequisiteLoad: 1, abstractness: 1 },
        cbcMapping: { subjects: ["Environmental Activities"], strands: { environmental: ["Natural Environment & Physical Features"] }, subStrands: { environmental: ["Plants in the Environment"] }, specificLearningOutcomes: ["IDENTIFY_PLANTS_CARE"], coreCompetencies: ["critical_thinking", "learning_to_learn"], coreValues: ["responsibility"], pertinentContemporaryIssues: ["environmental_education"], difficultyLevel: 2, cognitiveLevel: "understand" },
      },
      {
        topic: {} as any, title: "Domestic and Wild Animals", slug: "domestic-wild-animals",
        description: "Differentiate between domestic and wild animals",
        contentBlocks: [
          textBlock("Animals live all around us! 🐄🐕 Domestic animals live with people: cows, goats, dogs, cats. Wild animals live in forests and grasslands: lions, elephants, zebras."),
          quizBlock("Which is a domestic animal?", ["Lion", "Elephant", "Cow", "Zebra"], 2, "A cow is a domestic animal — it lives with people!"),
          journalBlock("Draw 2 domestic animals and 2 wild animals. Write their names."),
        ],
        xpReward: generateXp(35),
        difficulty: { complexityScore: 1, cognitiveLevel: "remember", prerequisiteLoad: 0, abstractness: 1 },
        cbcMapping: { subjects: ["Environmental Activities"], strands: { environmental: ["Natural Environment & Physical Features"] }, subStrands: { environmental: ["Animals in the Environment"] }, specificLearningOutcomes: ["DIFFERENTIATE_ANIMALS"], coreCompetencies: ["critical_thinking"], coreValues: ["respect"], pertinentContemporaryIssues: ["environmental_education"], difficultyLevel: 1, cognitiveLevel: "remember" },
      },
    ],
  });

  // Social Environment
  quests.push({
    id: "g2-env-social",
    title: "Our Community",
    slug: "our-community",
    description: "Learn about school community, market, flag, and child rights",
    orderIndex: 3,
    questType: "MAIN",
    theme: "g2-our-community",
    grade: 2,
    subjects: ["Environmental Activities"],
    xpReward: generateXp(150),
    cbcMapping: {
      subjects: ["Environmental Activities"],
      strands: ["Social Environment & Resources"],
      subStrands: ["School community", "Local market", "National flag", "Child rights"],
      specificLearningOutcomes: ["KNOW_SCHOOL_ROLES", "IDENTIFY_MARKET_ITEMS", "KNOW_FLAG_COLORS", "KNOW_CHILD_RIGHTS"],
      coreCompetencies: ["citizenship", "communication"],
      coreValues: ["responsibility", "patriotism", "unity"],
      pertinentContemporaryIssues: [],
    },
    lessons: [
      {
        topic: {} as any, title: "People Who Help at School", slug: "people-help-school",
        description: "Know the roles of headteacher, teachers, cleaners, and guards",
        contentBlocks: [
          textBlock("Many people help our school run! 🏫 The Headteacher leads the school. Teachers teach us. Cleaners keep our school clean. Guards keep us safe."),
          quizBlock("Who teaches students at school?", ["The guard", "The cleaner", "The teacher", "The cook"], 2, "The teacher teaches students!"),
          journalBlock("Draw one person who helps at your school and write what they do."),
        ],
        xpReward: generateXp(35),
        difficulty: { complexityScore: 1, cognitiveLevel: "remember", prerequisiteLoad: 0, abstractness: 1 },
        cbcMapping: { subjects: ["Environmental Activities"], strands: { environmental: ["Social Environment & Resources"] }, subStrands: { environmental: ["The School Community"] }, specificLearningOutcomes: ["IDENTIFY_SCHOOL_ROLES"], coreCompetencies: ["citizenship", "communication"], coreValues: ["respect"], pertinentContemporaryIssues: [], difficultyLevel: 1, cognitiveLevel: "remember" },
      },
      {
        topic: {} as any, title: "Our National Flag", slug: "our-national-flag",
        description: "Identify the four colors of the Kenyan flag and their meanings",
        contentBlocks: [
          textBlock("The Kenyan flag has 4 colors! 🇰🇪 Black = the people. Red = the blood of freedom fighters. Green = the land and agriculture. White = peace. There is also a shield and spears for protection."),
          imageBlock("kenyan-flag.png", "The Kenyan flag with color labels"),
          quizBlock("What does the green color on the Kenyan flag mean?", ["Peace", "The people", "The land and agriculture", "Freedom fighters"], 2, "Green represents the land and agriculture!"),
          journalBlock("Draw the Kenyan flag and color it correctly. Write what each color means."),
        ],
        xpReward: generateXp(40),
        difficulty: { complexityScore: 1, cognitiveLevel: "remember", prerequisiteLoad: 0, abstractness: 1 },
        cbcMapping: { subjects: ["Environmental Activities"], strands: { environmental: ["Social Environment & Resources"] }, subStrands: { environmental: ["Our National Flag"] }, specificLearningOutcomes: ["IDENTIFY_FLAG_COLORS", "SHOW_RESPECT_FLAG"], coreCompetencies: ["citizenship"], coreValues: ["patriotism", "unity"], pertinentContemporaryIssues: [], difficultyLevel: 1, cognitiveLevel: "remember" },
      },
      {
        topic: {} as any, title: "My Rights and Responsibilities", slug: "rights-responsibilities",
        description: "Learn basic child rights and family obligations",
        contentBlocks: [
          textBlock("Every child has rights! ✊ You have the right to food, education, and shelter. You also have responsibilities: help at home, respect elders, go to school."),
          quizBlock("Which is a RIGHT of a child?", ["Watching TV all day", "Eating junk food", "Going to school", "Never helping at home"], 2, "Every child has the right to education — going to school!"),
          journalBlock("Write 2 rights you have and 2 responsibilities at home."),
        ],
        xpReward: generateXp(40),
        difficulty: { complexityScore: 2, cognitiveLevel: "understand", prerequisiteLoad: 1, abstractness: 2 },
        cbcMapping: { subjects: ["Environmental Activities"], strands: { environmental: ["Social Environment & Resources"] }, subStrands: { environmental: ["Child Rights and Responsibilities"] }, specificLearningOutcomes: ["IDENTIFY_CHILD_RIGHTS"], coreCompetencies: ["citizenship", "communication"], coreValues: ["responsibility", "unity"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "understand" },
      },
    ],
  });

  return quests;
}

export { generateXp };
