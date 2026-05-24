// @ts-nocheck
// Grade 5 Creative Arts + Kiswahili — Continuation
import type { QuestGroup, GeneratedContentBlock } from "./content-types";

let blockIdCounter = 7000;
function blockId(): string { return `blk_${++blockIdCounter}`; }
function textBlock(content: string): GeneratedContentBlock { return { id: blockId(), type: "text", data: { content } }; }
function quizBlock(q: string, o: string[], c: number, e: string): GeneratedContentBlock { return { id: blockId(), type: "quiz", data: { question: q, options: o, correctIndex: c, explanation: e } }; }
function experimentBlock(t: string, m: string[], s: string[]): GeneratedContentBlock { return { id: blockId(), type: "experiment", data: { title: t, materials: m, steps: s } }; }
function journalBlock(p: string): GeneratedContentBlock { return { id: blockId(), type: "journal", data: { prompt: p, placeholder: "Write your answer..." } }; }
function generateXp(base: number): { base: number } { return { base }; }

export function generateGrade5CreativeArts(): QuestGroup[] {
  return [
    {
      id: "g5-art-visual", title: "Art Studio", slug: "art-studio",
      description: "Still life drawing, crayon etching, and graphic design",
      orderIndex: 1, questType: "MAIN", theme: "g5-art-studio", grade: 5,
      subjects: ["Creative Arts"], xpReward: generateXp(180),
      cbcMapping: { subjects: ["Creative Arts"], strands: ["Creating and Execution"], subStrands: ["Visual arts", "Music composition", "Sports"], specificLearningOutcomes: ["DRAW_3D_EFFECTS", "CREATE_RHYTHMS", "PLAY_SPORTS"], coreCompetencies: ["creativity", "collaboration"], coreValues: ["self_efficacy", "unity"], pertinentContemporaryIssues: [] },
      lessons: [
        { topic: {} as any, title: "Still Life Drawing", slug: "still-life-drawing", description: "Cross-hatching and smudging for 3D effects", contentBlocks: [textBlock("Make your drawings look 3D! ✏️ Cross-hatching: draw crossing lines for shading. Smudging: blend pencil with your finger for smooth shadows. Practice with a ball or apple."), experimentBlock("3D Sphere Drawing", ["pencil", "paper", "eraser"], ["Draw a circle", "Add light cross-hatching on one side", "Smudge the shadow side with your finger", "Add a cast shadow below", "Your circle looks like a ball!"]), journalBlock("Draw an object from home using cross-hatching and smudging. Label the light source.")], xpReward: generateXp(45), difficulty: { complexityScore: 2, cognitiveLevel: "apply", prerequisiteLoad: 1, abstractness: 1 }, cbcMapping: { subjects: ["Creative Arts"], strands: { art: ["Creating and Execution"] }, subStrands: { art: ["Still life drawing techniques using cross-hatching and smudging for 3D effects"] }, specificLearningOutcomes: ["APPLY_SHADING_TECHNIQUES"], coreCompetencies: ["creativity"], coreValues: ["self_efficacy"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "apply" } },
        { topic: {} as any, title: "Crayon Etching", slug: "crayon-etching", description: "Basics of crayon etching and graphic design", contentBlocks: [textBlock("Crayon etching is magical! 🎨 Cover paper with bright crayon colors. Paint over with dark paint or ink. Scratch a design with a toothpick — the colors shine through!"), experimentBlock("Crayon Etching Art", ["crayons", "black paint or ink", "toothpick or paper clip", "white paper"], ["Color the paper with bright crayons (cover completely)", "Paint over with dark paint", "Wait for it to dry", "Scratch a design with a toothpick", "Display your masterpiece!"), "⚠️ Be careful with the toothpick!"], xpReward: generateXp(45), difficulty: { complexityScore: 2, cognitiveLevel: "create", prerequisiteLoad: 1, abstractness: 1 }, cbcMapping: { subjects: ["Creative Arts"], strands: { art: ["Creating and Execution"] }, subStrands: { art: ["Basics of crayon etching and graphic design"] }, specificLearningOutcomes: ["CREATE_CRAYON_ETCHING"], coreCompetencies: ["creativity"], coreValues: ["self_efficacy"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "create" } },
        { topic: {} as any, title: "Creating Rhythms", slug: "creating-rhythms", description: "Simple rhythm beats with clapping or body percussion", contentBlocks: [textBlock("We can make music with our bodies! 👏 Clapping, stomping, snapping — these are body percussion. Create a 4-beat pattern: clap-clap-stomp-clap. Repeat it!"), experimentBlock("Body Percussion Rhythms", ["your body!"], ["Clap 4 times: clap clap clap clap", "Now try: clap clap stomp stomp", "Try: clap snap clap snap", "Create your own 4-beat pattern", "Teach it to a friend!"), journalBlock("Write down your favorite rhythm pattern using words (clap, stomp, snap).")], xpReward: generateXp(40), difficulty: { complexityScore: 2, cognitiveLevel: "create", prerequisiteLoad: 1, abstractness: 1 }, cbcMapping: { subjects: ["Creative Arts"], strands: { art: ["Creating and Execution"] }, subStrands: { art: ["Music Composition: Creating simple rhythm beats using clapping or body percussion; writing simple 2-4 bar melodies"] }, specificLearningOutcomes: ["CREATE_RHYTHM_PATTERNS"], coreCompetencies: ["creativity", "collaboration"], coreValues: ["unity"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "create" } },
      ],
    },
    {
      id: "g5-art-performance", title: "Performance and Display", slug: "performance-display",
      description: "Folk dances, wind instruments, puppets, and athletics",
      orderIndex: 2, questType: "MAIN", theme: "g5-performance-display", grade: 5,
      subjects: ["Creative Arts"], xpReward: generateXp(180),
      cbcMapping: { subjects: ["Creative Arts"], strands: ["Performance and Display"], subStrands: ["Performing arts", "Athletics"], specificLearningOutcomes: ["PERFORM_FOLK_DANCE", "PLAY_INSTRUMENTS", "SPRINT_RELAY"], coreCompetencies: ["creativity", "collaboration", "self_efficacy"], coreValues: ["unity", "patriotism"], pertinentContemporaryIssues: [] },
      lessons: [
        { topic: {} as any, title: "Kenyan Folk Dances", slug: "kenyan-folk-dances", description: "Prepare and perform local Kenyan folk dances", contentBlocks: [textBlock("Kenya has many beautiful dances! 💃 Each community has its own: Isukuti (Luhya), Mwomboko (Kikuyu), Ohangla (Luo). Dances tell stories about our culture and history."), journalBlock("Learn a folk dance from your community. Write about it: What is it called? When is it performed? What story does it tell?")], xpReward: generateXp(40), difficulty: { complexityScore: 2, cognitiveLevel: "apply", prerequisiteLoad: 1, abstractness: 1 }, cbcMapping: { subjects: ["Creative Arts"], strands: { art: ["Performance and Display"] }, subStrands: { art: ["Performing Arts: Preparing and performing local Kenyan folk dances"] }, specificLearningOutcomes: ["PERFORM_TRADITIONAL_DANCE"], coreCompetencies: ["creativity", "citizenship"], coreValues: ["patriotism", "unity"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "apply" } },
        { topic: {} as any, title: "Sprint Racing and Relays", slug: "sprint-relays", description: "Practice sprint starts and baton exchanges", contentBlocks: [textBlock("In relays, teamwork wins! 🏃♂️ Sprint start: crouch, push off fast. Baton exchange: receiver runs, passer extends arm. Practice: 'Ready... GO!' — receiver starts when passer reaches the mark."), experimentBlock("Relay Practice", ["a baton or stick", "open space", "4 friends"], ["Line up 20 metres apart", "Practice the sprint start", "Receiver starts running when passer is 5m away", "Pass the baton without stopping", "Keep practicing until it's smooth!", "⚠️ Stay in your lane and be careful!")], xpReward: generateXp(45), difficulty: { complexityScore: 2, cognitiveLevel: "apply", prerequisiteLoad: 1, abstractness: 1 }, cbcMapping: { subjects: ["Creative Arts"], strands: { art: ["Performance and Display"] }, subStrands: { art: ["Athletics: Practicing sprint racing starts and executing visual baton exchanges in relay races"] }, specificLearningOutcomes: ["PERFORM_SPRINT_RELAY"], coreCompetencies: ["collaboration", "self_efficacy"], coreValues: ["unity"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "apply" } },
      ],
    },
    {
      id: "g5-art-appreciation", title: "Art Appreciation", slug: "art-appreciation",
      description: "Observe and discuss creative works",
      orderIndex: 3, questType: "SIDE", theme: "g5-art-appreciation", grade: 5,
      subjects: ["Creative Arts"], xpReward: generateXp(120),
      cbcMapping: { subjects: ["Creative Arts"], strands: ["Appreciation"], subStrands: ["Critique"], specificLearningOutcomes: ["DISCUSS_ART_WORKS"], coreCompetencies: ["critical_thinking", "communication"], coreValues: ["respect"], pertinentContemporaryIssues: [] },
      lessons: [
        { topic: {} as any, title: "Discussing Art", slug: "discussing-art", description: "Observe and discuss visual and musical elements", contentBlocks: [textBlock("Art is meant to be discussed! 🎨 When you see art, ask: What do I see? What colors and shapes are used? How does it make me feel? What is the artist trying to say?"), journalBlock("Look at a piece of art (in a book, online, or at home). Write 5 sentences about it: What do you see? What do you like? What would you change?")], xpReward: generateXp(40), difficulty: { complexityScore: 2, cognitiveLevel: "evaluate", prerequisiteLoad: 2, abstractness: 2 }, cbcMapping: { subjects: ["Creative Arts"], strands: { art: ["Appreciation"] }, subStrands: { art: ["Critique: Observing and discussing the visual or musical elements of both self-made and peer-made creative works"] }, specificLearningOutcomes: ["APPRECIATE_AND_CRITIQUE_ART"], coreCompetencies: ["critical_thinking", "communication"], coreValues: ["respect"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "evaluate" } },
      ],
    },
  ];
}

export function generateGrade5Kiswahili(): QuestGroup[] {
  return [
    {
      id: "g5-kis listening", title: "Mazungumzo na Mjadala", slug: "kis-mazungumzo-mjadala",
      description: "Kusikiliza kwa makini na kushiriki katika mijadala",
      orderIndex: 4, questType: "MAIN", theme: "g5-kiswahili-mastery", grade: 5,
      subjects: ["Kiswahili"], xpReward: generateXp(200),
      cbcMapping: { subjects: ["Kiswahili"], strands: ["Kusikiliza na Kuzungumza"], subStrands: ["Kusikiliza kwa makini", "Mjadala", "Methali na vitendawili"], specificLearningOutcomes: ["LISTEN_SUMMARIZE", "DEBATE_TOPICS", "USE_PROVERBS"], coreCompetencies: ["communication", "collaboration"], coreValues: ["respect", "unity"], pertinentContemporaryIssues: [] },
      lessons: [
        { topic: {} as any, title: "Kutoa Muhtasari", slug: "kutoa-muhtasari", description: "Kusikiliza kwa makini na kutoa muhtasari wa taarifa", contentBlocks: [textBlock("Wasikilizi wanaweza kutoa muhtasari! 👂 Andika maneno muhimu, si sentensi kamili. Sikiliza: nani, nini, wapi, lini, kwa nini."), journalBlock("Sikiliza mtu akisoma kifupi. Andika mambo muhimu 5 uliyokumbuka.")], xpReward: generateXp(45), difficulty: { complexityScore: 2, cognitiveLevel: "apply", prerequisiteLoad: 2, abstractness: 2 }, cbcMapping: { subjects: ["Kiswahili"], strands: { kiswahili: ["Kusikiliza na Kuzungumza"] }, subStrands: { kiswahili: ["Kusikiliza kwa makini na kutoa muhtasari wa taarifa"] }, specificLearningOutcomes: ["SUMMARIZE_SWAHILI_LISTENING"], coreCompetencies: ["communication", "learning_to_learn"], coreValues: ["responsibility"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "apply" } },
        { topic: {} as any, title: "Mijadala", slug: "mijadala-kiswahili", description: "Mjadala na mazungumzo kuhusu mada mahususi", contentBlocks: [textBlock("Mjadala ni mazungumzo ya kikundi! 🗣️ Sikiliza mengine. Toa maoni yako. Sema kwa heshima. Mada: Usalama barabarani, Afya, Mazingira."), journalBlock("Andika hoja 3 kuhusu: 'Je, ni bora kusoma kitabu au kutazama runinga?' Tumia lugha ya Kiswahili.")], xpReward: generateXp(50), difficulty: { complexityScore: 2, cognitiveLevel: "apply", prerequisiteLoad: 2, abstractness: 2 }, cbcMapping: { subjects: ["Kiswahili"], strands: { kiswahili: ["Kusikiliza na Kuzungumza"] }, subStrands: { kiswahili: ["Mjadala na mazungumzo kuhusu mada mahususi"] }, specificLearningOutcomes: ["PARTICIPATE_DEBATE_SWAHILI"], coreCompetencies: ["communication", "collaboration"], coreValues: ["respect", "unity"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "apply" } },
      ],
    },
    {
      id: "g5-kis-reading", title: "Kusoma kwa Kina", slug: "kis-reading-deep",
      description: "Kusoma kwa sauti, ufasaha, na ufahamu",
      orderIndex: 5, questType: "MAIN", theme: "g5-kiswahili-mastery", grade: 5,
      subjects: ["Kiswahili"], xpReward: generateXp(200),
      cbcMapping: { subjects: ["Kiswahili"], strands: ["Kusoma"], subStrands: ["Kusoma kwa sauti", "Ufahamu"], specificLearningOutcomes: ["READ_ALOUD_SWAHILI", "COMPREHEND_DEEP_READING"], coreCompetencies: ["communication", "critical_thinking"], coreValues: ["self_efficacy"], pertinentContemporaryIssues: [] },
      lessons: [
        { topic: {} as any, title: "Kusoma kwa Sauti na Ufasaha", slug: "kusoma-sauti-ufasaha", description: "Kusoma kwa sauti na kwa ufasaha", contentBlocks: [textBlock("Soma kwa sauti kwa ufasaha! 🗣️ Sikiliza alama za uandishi (. ! ?). Pumzika unapokuta alama. Soma kwa sauti, si kwa kukimbia."), journalBlock("Soma kifupi hii kwa sauti mara 3: 'Mvulana alikwenda sokou. Alinunua matunda matano. Akaona rafiki yake. Wakaenda nyumbani pamoja.'")], xpReward: generateXp(45), difficulty: { complexityScore: 2, cognitiveLevel: "apply", prerequisiteLoad: 2, abstractness: 1 }, cbcMapping: { subjects: ["Kiswahili"], strands: { kiswahili: ["Kusoma"] }, subStrands: { kiswahili: ["Kusoma kwa sauti na kwa ufasaha"] }, specificLearningOutcomes: ["READ_ALOUD_FLUENTLY_SWAHILI"], coreCompetencies: ["communication"], coreValues: ["self_efficacy"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "apply" } },
        { topic: {} as any, title: "Maswali ya Ufahamu", slug: "maswali-ufahamu", description: "Kusoma kwa kina na kujibu maswali ya ufahamu", contentBlocks: [textBlock("Soma kwa kina kuelewa zaidi! 📚 Sikiliza: nani alihusika? Nini kilifanyika? Kilifanyika wapi? Kwa nini? Matokeo yalikuwa nini?"), textBlock("Soma: 'Bibi alipika chakula. Alitumia mchele, nyama, na mboga. Chakula kilikuwa kitamu. Watoto walikula kwa furaha.'"), quizBlock("Bibi alipika nini?", ["Maji", "Chakula", "Maziwa", "Mkate"], 1, "Bibi alipika chakula!"), quizBlock("Watoto walifanya nini?", ["Walilala", "Walicheza", "Walikula", "Walikimbia"], 2, "Watoto walikula chakula kwa furaha!")], xpReward: generateXp(50), difficulty: { complexityScore: 2, cognitiveLevel: "understand", prerequisiteLoad: 2, abstractness: 2 }, cbcMapping: { subjects: ["Kiswahili"], strands: { kiswahili: ["Kusoma"] }, subStrands: { kiswahili: ["Kusoma kwa kina na kujibu maswali ya ufahamu yanayohitaji uchanganuzi"] }, specificLearningOutcomes: ["ANSWER_COMPREHENSION_ANALYSIS"], coreCompetencies: ["communication", "critical_thinking"], coreValues: ["self_efficacy"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "understand" } },
      ],
    },
    {
      id: "g5-kis-grammar", title: "Sarufi ya Gredi ya 5", slug: "kis-grammar-g5",
      description: "Ngeli pana, viwakilishi, nyakati, na uakifishaji",
      orderIndex: 6, questType: "MAIN", theme: "g5-sarufi-kiswahili", grade: 5,
      subjects: ["Kiswahili"], xpReward: generateXp(220),
      cbcMapping: { subjects: ["Kiswahili"], strands: ["Sarufi"], subStrands: ["Ngeli za Nomino", "Viwakilishi na Viunganishi", "Nyakati na Hali", "Uakifishaji"], specificLearningOutcomes: ["USE_ADVANCED_NGELI", "USE_PRONOUNS_CONNECTORS", "USE_TENSES_MOOD", "USE_PUNCTUATION"], coreCompetencies: ["communication", "learning_to_learn"], coreValues: ["responsibility"], pertinentContemporaryIssues: [] },
      lessons: [
        { topic: {} as any, title: "Ngeli U-I, LI-YA, YA-YA, I-ZI", slug: "ngeli-u-i-li-ya", description: "Upana wa ngeli za nomino", contentBlocks: [textBlock("Ngeli zaidi za nomino! 📦 U-I: Ukuta-Kuta (singular-plural). LI-YA: Jicho-Macho. YA-YA: Yai-Mayai. I-ZI: Nyasi-Manyasi."), quizBlock("Ngeli ya 'Ukuta' ni?", ["A-WA", "KI-VI", "U-I", "LI-YA"], 2, "Ukuta ni ngeli U-I: Ukuta-Kuta!")], xpReward: generateXp(50), difficulty: { complexityScore: 2, cognitiveLevel: "understand", prerequisiteLoad: 2, abstractness: 2 }, cbcMapping: { subjects: ["Kiswahili"], strands: { kiswahili: ["Sarufi"] }, subStrands: { kiswahili: ["Ngeli za Nomino: Upana wa ngeli kama vile U-I, LI-YA, YA-YA, na I-ZI"] }, specificLearningOutcomes: ["IDENTIFY_ADVANCED_NGELI"], coreCompetencies: ["communication", "learning_to_learn"], coreValues: ["responsibility"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "understand" } },
        { topic: {} as any, title: "Nyakati na Hali", slug: "nyakati-hali-kiswahili", description: "Tofauti kati ya wakati uliopo, uliopita, ujao, na hali ya timilifu", contentBlocks: [textBlock("Nyakati na hali zinasheshe nini kinatokea! ⏰ Uliopita (-li-): Alisoma. Uliopo (-na-): Anasoma. Ujao (-ta-): Atasoma. Hali ya timilifu (-me-): Amesoma."), quizBlock("'Amesoma' ni wakati gani?", ["Uliopita", "Uliopo", "Ujao", "Hali ya timilifu"], 3, "'Amesoma' ni hali ya timilifu (-me-) — amaliza kusoma!")], xpReward: generateXp(55), difficulty: { complexityScore: 3, cognitiveLevel: "apply", prerequisiteLoad: 3, abstractness: 3 }, cbcMapping: { subjects: ["Kiswahili"], strands: { kiswahili: ["Sarufi"] }, subStrands: { kiswahili: ["Nyakati na Hali: Tofauti kati ya wakati uliopo, uliopita, ujao, na hali ya timilifu (-me-)"] }, specificLearningOutcomes: ["USE_TENSES_MOOD_SWAHILI"], coreCompetencies: ["communication", "learning_to_learn"], coreValues: ["responsibility"], pertinentContemporaryIssues: [], difficultyLevel: 3, cognitiveLevel: "apply" } },
        { topic: {} as any, title: "Uakifishaji", slug: "uakifishaji-kiswahili", description: "Matumizi sahihi ya mkato, nukta, na alama ya kuuliza", contentBlocks: [textBlock("Alama za uandishi zinasaidia kuelewa! ✏️ Nukta (.) = mwisho wa sentensi. Koma (,) = kupumzika kidogo. Alama ya kuuliza (?) = kuuliza swali."), journalBlock("Andika sentensi 3 kwa Kiswahili: moja ya taarifa, moja ya swali, na moja ya kukimbia. Tumia alama sahihi.")], xpReward: generateXp(45), difficulty: { complexityScore: 2, cognitiveLevel: "apply", prerequisiteLoad: 2, abstractness: 1 }, cbcMapping: { subjects: ["Kiswahili"], strands: { kiswahili: ["Sarufi"] }, subStrands: { kiswahili: ["Uakifishaji: Matumizi sahihi ya mkato, nukta, na alama ya kuuliza"] }, specificLearningOutcomes: ["USE_PUNCTUATION_SWAHILI"], coreCompetencies: ["communication"], coreValues: ["responsibility"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "apply" } },
      ],
    },
    {
      id: "g5-kis-writing", title: "Kuandika kwa Gredi ya 5", slug: "kis-writing-g5",
      description: "Barua za kirafiki, tawasifu, na insha za kubuni",
      orderIndex: 7, questType: "MAIN", theme: "g5-kuandika-kiswahili", grade: 5,
      subjects: ["Kiswahili"], xpReward: generateXp(180),
      cbcMapping: { subjects: ["Kiswahili"], strands: ["Kuandika"], subStrands: ["Barua za kirafiki", "Tawasifu", "Insha za kubuni"], specificLearningOutcomes: ["WRITE_FRIENDLY_LETTER_SWAHILI", "WRITE_BIOGRAPHY", "WRITE_CREATIVE_ESSAY"], coreCompetencies: ["communication", "creativity"], coreValues: ["self_efficacy", "responsibility"], pertinentContemporaryIssues: [] },
      lessons: [
        { topic: {} as any, title: "Barua za Kirafiki", slug: "barua-kirafiki", description: "Kuandika barua za kirafiki na tawasifu fupi", contentBlocks: [textBlock("Barua ya kirafiki ina: anwani yako, tarehe, salamu (Mpendwa...), mwili wa barua, kumaliza (Rafiki yako,...). ✉️ Andika kwa urafiki na heshima."), journalBlock("Andika barua ya kirafiki kwa rafiki yako. Mwambie shule yako na unachopenda kufanya. Tumia muundo sahihi wa barua.")], xpReward: generateXp(45), difficulty: { complexityScore: 2, cognitiveLevel: "create", prerequisiteLoad: 2, abstractness: 2 }, cbcMapping: { subjects: ["Kiswahili"], strands: { kiswahili: ["Kuandika"] }, subStrands: { kiswahili: ["Kuandika barua za kirafiki na tawasifu fupi"] }, specificLearningOutcomes: ["WRITE_FORMAL_INFORMAL_LETTERS"], coreCompetencies: ["communication", "creativity"], coreValues: ["self_efficacy"], pertinentContemporaryIssues: [], difficultyLevel: 2, cognitiveLevel: "create" } },
        { topic: {} as any, title: "Insha za Kubuni", slug: "insha-kubuni", description: "Insha zenye mtiririko mzuri wa mawazo (maneno 100-150)", contentBlocks: [textBlock("Insha nzuri ina mwanzo, kati, na mwisho! 📖 Mwanzo: zianze kwa njia ya kuvutia. Kati: eleza kwa undani. Mwisho: malizia kwa njia ya kukumbuka. Tumia maneno ya kuelezea!"), journalBlock("Andika insha (maneno 100-150) kuhusu: 'Siku niliyopata zawadi ya kwanza.' Kumbuka: mwanzo, kati, mwisho. Tumia maneno angalau 5 ya kuelezea.")], xpReward: generateXp(55), difficulty: { complexityScore: 3, cognitiveLevel: "create", prerequisiteLoad: 3, abstractness: 2 }, cbcMapping: { subjects: ["Kiswahili"], strands: { kiswahili: ["Kuandika"] }, subStrands: { kiswahili: ["Insha za kubuni zenye mtiririko mzuri wa mawazo (maneno 100-150)"] }, specificLearningOutcomes: ["WRITE_STRUCTURED_ESSAY_SWAHILI"], coreCompetencies: ["communication", "creativity"], coreValues: ["self_efficacy"], pertinentContemporaryIssues: [], difficultyLevel: 3, cognitiveLevel: "create" } },
      ],
    },
  ];
}

export function generateAllGrade5(): QuestGroup[] {
  return [
    ...generateGrade5Math(),
    ...generateGrade5English(),
    ...generateGrade5Science(),
    ...generateGrade5SocialStudies(),
    ...generateGrade5Agriculture(),
    ...generateGrade5CreativeArts(),
    ...generateGrade5Kiswahili(),
  ];
}

export function getGrade5Stats() {
  const quests = generateAllGrade5();
  const totalLessons = quests.reduce((sum, q) => sum + q.lessons.length, 0);
  const totalContentBlocks = quests.reduce((sum, q) => sum + q.lessons.reduce((s, l) => s + l.contentBlocks.length, 0), 0);
  const subjects = [...new Set(quests.flatMap(q => q.subjects))];
  return { grade: 5, totalQuests: quests.length, totalLessons, totalContentBlocks, subjects, mainQuests: quests.filter(q => q.questType === "MAIN").length, sideQuests: quests.filter(q => q.questType === "SIDE").length };
}
