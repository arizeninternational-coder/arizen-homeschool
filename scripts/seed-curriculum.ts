#!/usr/bin/env tsx
/**
 * Arizen Homeschool — Curriculum Seed Script v2
 * Seeds Grade 2 and Grade 5 CBC curriculum structure into Supabase.
 * Idempotent: uses insert with skip-on-conflict for all records.
 */

import { readFileSync } from "fs";
const envFile = readFileSync(".env", "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// ── Helpers ────────────────────────────────────────────────────

const DEFAULTS = {
  learningOutcomes: "To be populated with CBC/CBE-aligned learning outcomes.",
  parentGuide: "Draft placeholder. Parent guidance will be added after curriculum review.",
  learnerActivity: "Draft placeholder. Learner activity will be added after curriculum review.",
  assessment: "Draft placeholder. Assessment task will be added after curriculum review.",
  materials: "Locally available materials to be added.",
  status: "draft" as const,
  version: 1,
};

const COMPETENCIES = ["Communication and Collaboration","Critical Thinking and Problem Solving","Creativity and Imagination","Citizenship","Digital Literacy","Learning to Learn","Self-Efficacy"];
const VALUES = ["Respect","Responsibility","Unity","Love","Integrity","Care","Peace","Patriotism","Social Justice"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

function pick<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.min(n, arr.length));
}

// ── Curriculum Data ────────────────────────────────────────────

interface CurriculumItem {
  grade: number;
  subject: string;
  strand: string;
  subStrand: string;
  topic: string;
}

function generateCurriculum(): CurriculumItem[] {
  const items: CurriculumItem[] = [];

  function add(grade: number, subject: string, strands: { strand: string; subStrands: { sub: string; topics: string[] }[] }[]) {
    for (const { strand, subStrands } of strands) {
      for (const { sub, topics } of subStrands) {
        for (const topic of topics) {
          items.push({ grade, subject, strand, subStrand: sub, topic });
        }
      }
    }
  }

  // ── GRADE 2 ─────────────────────────────────────────────────
  add(2, "Mathematical Activities", [
    { strand: "Numbers", subStrands: [
      { sub: "Number Concept", topics: ["Counting Numbers up to 100 Forwards","Counting Numbers up to 100 Backwards","Identifying Numbers up to 100"] },
      { sub: "Place Value", topics: ["Hundreds","Tens","Ones","Identifying Values of Digits up to 100"] },
      { sub: "Reading and Writing Numbers", topics: ["Writing Numbers in Digits up to 100","Writing Numbers in Words up to 100"] },
      { sub: "Number Patterns", topics: ["Identifying Addition Patterns","Identifying Subtraction Patterns","Completing Number Patterns","Creating Number Patterns"] },
      { sub: "Addition", topics: ["Adding Numbers up to a Sum of 100","Addition with Carrying or Regrouping"] },
      { sub: "Subtraction", topics: ["Subtracting Numbers Within 100","Subtraction with Borrowing or Regrouping"] },
      { sub: "Multiplication", topics: ["Introduction to Multiplication as Repeated Addition","Multiplication Facts up to 5 × 5"] },
      { sub: "Fractions", topics: ["Identifying a Half","Shading a Half","Identifying a Quarter","Shading a Quarter"] },
    ]},
    { strand: "Measurement", subStrands: [
      { sub: "Length", topics: ["Measuring Length Using Non-Standard Units","Measuring Length Using Hand Spans","Measuring Length Using Metres"] },
      { sub: "Mass", topics: ["Comparing Heavier Than","Comparing Lighter Than","Comparing Same As"] },
      { sub: "Capacity", topics: ["Measuring Liquid Using Smaller Containers","Comparing How Much Liquid Containers Hold"] },
      { sub: "Time", topics: ["Reading Time by the Hour","Reading Time by the Half-Hour","Using Analogue Clocks","Using Digital Clocks","Identifying Days of the Week"] },
      { sub: "Money", topics: ["Recognizing Kenyan Coins up to Ksh 100","Recognizing Kenyan Notes up to Ksh 100","Simple Shopping Simulations","Change and Balance"] },
    ]},
    { strand: "Geometry", subStrands: [
      { sub: "Shapes", topics: ["Recognizing Rectangles","Recognizing Squares","Recognizing Circles","Recognizing Triangles","Drawing Basic Shapes","Making Patterns with Shapes"] },
    ]},
  ]);

  add(2, "English Language Activities", [
    { strand: "Listening and Speaking", subStrands: [
      { sub: "Pronunciation", topics: ["Pronouncing Sounds Correctly","Pronouncing Words Correctly"] },
      { sub: "Listening Comprehension", topics: ["Listening to Short Stories","Answering Questions from Short Stories"] },
      { sub: "Polite Language", topics: ["Using Please and Thank You","Using Excuse Me","Following Two-Step Instructions","Following Three-Step Instructions"] },
    ]},
    { strand: "Reading", subStrands: [
      { sub: "Phonics", topics: ["Blending Letter Sounds","Reading Words with Clusters: cl Words","Reading Words with Clusters: br Words","Reading Words with Clusters: st Words"] },
      { sub: "Sight Words", topics: ["Recognizing Common High-Frequency Words"] },
      { sub: "Fluency", topics: ["Reading Short Paragraphs Aloud","Reading Clearly and Smoothly"] },
      { sub: "Comprehension", topics: ["Understanding Simple Stories","Identifying Characters in Stories","Identifying Events in Stories"] },
    ]},
    { strand: "Language Structures and Grammar", subStrands: [
      { sub: "Nouns", topics: ["Proper Nouns","Common Nouns","Singular Nouns","Plural Nouns Using -s","Plural Nouns Using -es"] },
      { sub: "Pronouns and Tense", topics: ["Pronouns: I You He She It We They","Present Continuous Tense Using -ing","Articles: a an the","Prepositions: in on under behind"] },
    ]},
    { strand: "Writing", subStrands: [
      { sub: "Handwriting", topics: ["Formation of Uppercase Letters","Formation of Lowercase Letters"] },
      { sub: "Guided Writing", topics: ["Completing Sentences","Writing Short Compositions of 3–5 Sentences","Spelling Common Vocabulary Words"] },
    ]},
  ]);

  add(2, "Kiswahili Language Activities", [
    { strand: "Kusikiliza na Kuzungumza", subStrands: [
      { sub: "Matamshi", topics: ["Matamshi Bora ya Sauti","Matamshi Bora ya Maneno"] },
      { sub: "Maamkizi na Adabu", topics: ["Shikamoo na Marahaba","Tafadhali Asante Samahani","Kusikiliza Hadithi","Kujibu Maswali kwa Ufasaha"] },
    ]},
    { strand: "Kusoma", subStrands: [
      { sub: "Kusoma Silabi na Maneno", topics: ["Kusoma Silabi","Kuunda Maneno","Kusoma Vifungu Vifupi kwa Sauti"] },
      { sub: "Ufahamu", topics: ["Kusoma kwa Ufasaha","Ufahamu wa Kisa","Ufahamu wa Hadithi Iliyosomwa"] },
    ]},
    { strand: "Sarufi", subStrands: [
      { sub: "Ngeli", topics: ["Ngeli ya A-Wa: Mtu-Watu","Ngeli ya KI-VI: Kiti-Viti","Ngeli ya LI-YA","Ngeli ya I-ZI"] },
      { sub: "Viashiria na Vishirikishi", topics: ["Viashiria: Huyu Wale Hiki Hivi","Vishirikishi: Huyu ni Mwalimu"] },
      { sub: "Wakati", topics: ["Wakati Uliopo: -na-","Wakati Uliopita: -li-","Wakati Ujao: -ta-"] },
      { sub: "Kinyume na Herufi", topics: ["Kinyume cha Maneno: Simama/Keti Refu/Fupi","Matumizi Sahihi ya Mkato","Matumizi Sahihi ya Nukta"] },
    ]},
    { strand: "Kuandika", subStrands: [
      { sub: "Mwandiko", topics: ["Mwandiko Nadhifu wa Herufi","Mwandiko Nadhifu wa Maneno","Kujaza Pengo","Kukamilisha Sentensi"] },
      { sub: "Insha", topics: ["Kuandika Insha Fupi za Kuongozwa","Kuandika Sentensi Tatu hadi Tano"] },
    ]},
  ]);

  add(2, "Environmental Activities", [
    { strand: "Weather and the Environment", subStrands: [
      { sub: "Weather Conditions", topics: ["Sunny Weather","Rainy Weather","Windy Weather","Cloudy Weather","Observing Weather","Tracking Weather"] },
      { sub: "Weather Symbols", topics: ["Drawing Weather Symbols","Using Charts to Record Weekly Weather"] },
      { sub: "Effects of Weather", topics: ["Choosing Appropriate Clothing for Weather","Choosing Appropriate Activities for Weather"] },
    ]},
    { strand: "Natural Environment and Physical Features", subStrands: [
      { sub: "Physical Features", topics: ["Hills","Rivers","Forests","Valleys","Local Landforms"] },
      { sub: "Plants", topics: ["Common Trees","Common Flowers","Basic Care for Plants"] },
      { sub: "Animals", topics: ["Domestic Animals","Wild Animals","Animal Safety"] },
    ]},
    { strand: "Social Environment and Resources", subStrands: [
      { sub: "School Community", topics: ["Headteacher","Teachers","Cleaners","Guards","Roles of People at School"] },
      { sub: "Local Market", topics: ["Items Bought in the Market","Items Sold in the Market","Local Community Market"] },
      { sub: "National Flag", topics: ["Colours of the Kenyan Flag","Meaning of the Kenyan Flag Colours","Respect During Flag-Raising Ceremonies"] },
      { sub: "Child Rights", topics: ["Right to Food","Right to Education","Right to Shelter","Family Responsibilities","Personal Responsibilities"] },
    ]},
  ]);

  add(2, "Hygiene and Nutrition Activities", [
    { strand: "Health Practices and Personal Hygiene", subStrands: [
      { sub: "Care of Body Parts", topics: ["Cleaning Teeth","Preventing Cavities","Washing Hands at Critical Times","Hair Care"] },
      { sub: "Personal Items", topics: ["Toothbrushes","Combs","Handkerchiefs","Items That Should Not Be Shared"] },
      { sub: "Cleaning", topics: ["Sweeping","Mopping","Safe Disposal of Waste Materials"] },
    ]},
    { strand: "Food and Nutrition", subStrands: [
      { sub: "Daily Meals", topics: ["Breakfast","Lunch","Supper","Components of a Healthy Meal"] },
      { sub: "Good Eating Habits", topics: ["Chewing Properly","Washing Fruits Before Eating","Avoiding Talking with Food in Mouth"] },
      { sub: "Food Safety", topics: ["Protecting Food from Dirt","Protecting Food from Flies","Proper Food Storage"] },
    ]},
    { strand: "Medicine Safety and Common Illnesses", subStrands: [
      { sub: "Common Illnesses", topics: ["Coughs","Colds","Stomach Aches","Recognizing Signs of Common Ailments"] },
      { sub: "Safe Use of Medicine", topics: ["Following Instructions from Adults","Following Instructions from Doctors","Dangers of Taking Unknown Medicine"] },
    ]},
  ]);

  add(2, "Movement Activities", [
    { strand: "Locomotor and Non-Locomotor Skills", subStrands: [
      { sub: "Locomotor Movements", topics: ["Walking","Running","Skipping","Galloping","Leaping"] },
      { sub: "Non-Locomotor Movements", topics: ["Bending","Twisting","Stretching","Balancing on Different Body Parts"] },
    ]},
    { strand: "Ball Properties and Games", subStrands: [
      { sub: "Handling Objects", topics: ["Rolling Balls","Throwing Balls","Catching Balls","Kicking Balls","Using Beanbags"] },
      { sub: "Chasing and Evading Games", topics: ["Simple Field Games","Tracking Space","Changing Direction Safely","Non-Contact Games"] },
    ]},
    { strand: "Rhythmic Movements and Gymnastics", subStrands: [
      { sub: "Simple Gymnastics", topics: ["Egg Rolls","Forward Rolls","Safe Movement on Mats"] },
      { sub: "Rhythmic Movements", topics: ["Moving Body Parts with Music","Moving with Drums","Moving with Clapping Beats"] },
    ]},
  ]);

  // ── GRADE 5 ─────────────────────────────────────────────────
  add(5, "Mathematics", [
    { strand: "Numbers", subStrands: [
      { sub: "Whole Numbers", topics: ["Counting Reading and Writing Numbers up to 1,000,000","Identifying Place Value and Total Value of Digits up to 1,000,000","Rounding Off Numbers to the Nearest Thousand"] },
      { sub: "Divisibility Tests", topics: ["Testing Numbers for Divisibility by 2","Testing Numbers for Divisibility by 5","Testing Numbers for Divisibility by 10"] },
      { sub: "Factors and Multiples", topics: ["Finding Factors of Numbers","Finding Multiples of Numbers","Finding the Greatest Common Divisor (GCD) of Two Numbers","Finding the Least Common Multiple (LCM) of Two Numbers"] },
      { sub: "Fractions", topics: ["Comparing Proper Fractions","Ordering Proper Fractions","Adding Proper Fractions","Subtracting Proper Fractions","Working with Mixed Fractions"] },
      { sub: "Decimals", topics: ["Identifying Decimal Place Value up to Thousandths","Ordering Decimals","Adding Decimals","Subtracting Decimals"] },
      { sub: "Percentages", topics: ["Converting Fractions into Percentages","Converting Decimals into Percentages","Converting Percentages into Fractions and Decimals"] },
    ]},
    { strand: "Measurement", subStrands: [
      { sub: "Length", topics: ["Measuring Length in Kilometres","Converting Kilometres to Metres","Converting Metres to Centimetres"] },
      { sub: "Area", topics: ["Calculating the Area of Squares","Calculating the Area of Rectangles"] },
      { sub: "Volume and Capacity", topics: ["Finding Volume Using Unit Cubes","Working with Litres","Working with Millilitres","Converting Between Litres and Millilitres"] },
      { sub: "Mass", topics: ["Converting Tonnes to Kilograms","Converting Kilograms to Grams"] },
      { sub: "Time", topics: ["Reading Time","Converting Hours to Minutes","Converting Minutes to Seconds","Using the 24-Hour Clock"] },
      { sub: "Money", topics: ["Calculating Buying Price and Selling Price","Calculating Profit","Calculating Loss","Working with Simple Transactions up to Ksh 10,000"] },
    ]},
    { strand: "Geometry and Algebra", subStrands: [
      { sub: "Angles", topics: ["Identifying Acute Angles","Identifying Obtuse Angles","Identifying Right Angles","Measuring Angles Using a Protractor","Drawing Angles Using a Protractor"] },
      { sub: "Algebraic Expressions", topics: ["Understanding Simple Variables","Simplifying Basic Algebraic Expressions","Solving Simple Equations","Solving Word Problems Using One Variable"] },
    ]},
  ]);

  add(5, "English", [
    { strand: "Listening and Speaking", subStrands: [
      { sub: "Active Listening", topics: ["Active Listening During Short Informative Talks","Taking Notes During Short Talks","Using Advanced Polite Markers","Presentation Etiquette","Pronunciation of Complex Consonant Clusters","Word Stress Patterns"] },
    ]},
    { strand: "Reading", subStrands: [
      { sub: "Intensive Reading", topics: ["Reading Short Passages","Inferring Meaning","Deducing Cause and Effect","Identifying Main Ideas"] },
      { sub: "Extensive Reading", topics: ["Reading Storybooks for Pleasure","Using the Library","Using Digital Tools for Reading"] },
    ]},
    { strand: "Language Structures and Grammar", subStrands: [
      { sub: "Nouns and Pronouns", topics: ["Collective Nouns","Abstract Nouns","Uncountable Nouns","Possessive Pronouns: Mine Yours Hers His Ours Theirs"] },
      { sub: "Tenses and Adverbs", topics: ["Past Continuous Tense","Present Perfect Tense","Degrees of Comparison: Positive Comparative Superlative","Adverbs of Time","Adverbs of Place","Adverbs of Manner"] },
    ]},
    { strand: "Writing", subStrands: [
      { sub: "Functional Writing", topics: ["Writing Friendly Letters","Writing Lists","Writing Invitations"] },
      { sub: "Creative Composition", topics: ["Writing Structured Narratives","Creating a Clear Beginning Middle and End","Writing Compositions up to 150 Words"] },
    ]},
  ]);

  add(5, "Kiswahili", [
    { strand: "Kusikiliza na Kuzungumza", subStrands: [
      { sub: "Kusikiliza kwa Makini", topics: ["Kusikiliza kwa Makini","Kutoa Muhtasari wa Taarifa","Mjadala kuhusu Mahususi","Mazungumzo kuhusu Usalama Barabarani","Mazungumzo kuhusu Afya"] },
      { sub: "Methali na Vitendawili", topics: ["Kutumia Methali","Kutumia Vitendawili","Kutumia Nahau katika Mazungumzo ya Kila Siku"] },
    ]},
    { strand: "Kusoma", subStrands: [
      { sub: "Kusoma kwa Sauti na Ufasaha", topics: ["Kusoma kwa Sauti na kwa Ufasaha","Kuzingatia Alama za Uandishi"] },
      { sub: "Kusoma kwa Kina", topics: ["Kusoma kwa Kina","Kujibu Maswali ya Ufahamu","Kuchanganua Taarifa katika Kifungu"] },
    ]},
    { strand: "Sarufi", subStrands: [
      { sub: "Ngeli", topics: ["Ngeli ya U-I","Ngeli ya LI-YA","Ngeli ya YA-YA","Ngeli ya I-ZI"] },
      { sub: "Viwakilishi na Viunganishi", topics: ["Viwakilishi vya Nafsi: Mimi Wewe Yeye Sisi Nyinyi Wao","Viunganishi vya Sentensi"] },
      { sub: "Wakati na Hali", topics: ["Wakati Uliopo","Wakati Uliopita","Wakati Ujao","Hali ya Timilifu Kutumia -me-"] },
      { sub: "Herufi na Alama", topics: ["Matumizi Sahihi ya Mkato","Matumizi Sahihi ya Nukta","Matumizi Sahihi ya Alama ya Kuuliza"] },
    ]},
    { strand: "Kuandika", subStrands: [
      { sub: "Kuandika Barua na Tawasifu", topics: ["Kuandika Barua za Kirafiki","Kuandika Tawasifu Fupi"] },
      { sub: "Insha", topics: ["Kuandika Insha za Kubuni","Mtiririko Mzuri wa Mawazo","Kuandika Insha za Maneno 100–150"] },
    ]},
  ]);

  add(5, "Science and Technology", [
    { strand: "Living Things", subStrands: [
      { sub: "Plants", topics: ["Classifying Plants into Flowering Plants","Classifying Plants into Non-Flowering Plants"] },
      { sub: "Fungi", topics: ["Introduction to Mushrooms","Introduction to Mould","Introduction to Yeast","Economic Importance of Fungi","Safety Precautions When Handling Fungi"] },
      { sub: "Animals", topics: ["Vertebrates","Mammals","Birds","Reptiles","Amphibians","Fish","Characteristics of Vertebrate Groups"] },
      { sub: "Human Body Systems", topics: ["Digestive System","Functions of Teeth","Common Digestive System Disorders"] },
    ]},
    { strand: "Environment", subStrands: [
      { sub: "Pollution", topics: ["Air Pollution","Water Pollution","Soil Pollution","Effects of Pollution on Living Things","Pollution Control Measures"] },
      { sub: "Waste Management", topics: ["Reduce","Reuse","Recycle","Practicing the 3Rs in the School or Home Environment"] },
    ]},
    { strand: "Matter and Force", subStrands: [
      { sub: "Properties of Matter", topics: ["Solids","Liquids","Gases","Effects of Heating","Effects of Cooling"] },
      { sub: "Force and Energy", topics: ["Friction","Advantages of Friction","Disadvantages of Friction","Ways of Reducing Friction","Ways of Increasing Friction"] },
    ]},
    { strand: "Digital Technology", subStrands: [
      { sub: "Computer Basics", topics: ["External Parts of a Computer System","Basic Typing","Word Processing","Saving Files Securely"] },
    ]},
  ]);

  add(5, "Agriculture and Nutrition", [
    { strand: "Conservation of Resources", subStrands: [
      { sub: "Soil Conservation", topics: ["Controlling Soil Erosion","Using Trash Lines","Using Cover Crops","Constructing Simple Barriers"] },
      { sub: "Soil Improvement", topics: ["Preparing Organic Compost Manure","Applying Organic Compost Manure to Crop Fields"] },
      { sub: "Water Conservation", topics: ["Harvesting Rainwater Safely","Basic Drip Irrigation Models"] },
    ]},
    { strand: "Food Production Processes", subStrands: [
      { sub: "Growing Crops", topics: ["Sowing Climbing Fruit Plants","Managing Climbing Fruit Plants","Using Simple Trellises and Supports","Examples: Passion Fruit or Berries"] },
      { sub: "Domestic Animals", topics: ["Uses of Rabbits","Uses of Poultry","Uses of Bees","Basic Feeding Requirements of Small Domestic Animals"] },
      { sub: "Preservation", topics: ["Safe Storage of Cereals","Safe Storage of Pulses","Preventing Post-Harvest Losses"] },
    ]},
    { strand: "Hygiene and Food Preparation", subStrands: [
      { sub: "Food Nutrients", topics: ["Macronutrients","Micronutrients","Nutritional Deficiency Diseases","Kwashiorkor","Marasmus"] },
      { sub: "Production and Cooking Techniques", topics: ["Dry Fat Frying","Preparing Foods Such as Pancakes or Chapati","Safe Deep Frying Procedures"] },
    ]},
  ]);

  add(5, "Social Studies", [
    { strand: "Physical Environment", subStrands: [
      { sub: "Maps", topics: ["Reading Map Titles","Understanding Scale","Understanding Map Keys","Understanding Compass Rose"] },
      { sub: "Position and Size of Kenya", topics: ["Identifying Kenya's Neighbouring Countries","Understanding Boundaries"] },
      { sub: "Physical Features", topics: ["The Rift Valley","Mountains","Plains","Drainage Basins"] },
      { sub: "Weather and Climate", topics: ["Difference Between Weather and Climate","Tracking Rainfall Maps of Kenya","Tracking Temperature Maps of Kenya"] },
    ]},
    { strand: "People and Culture", subStrands: [
      { sub: "Language Groups", topics: ["Bantu Groups","Nilotic Groups","Cushitic Groups"] },
      { sub: "Traditional Education", topics: ["Social Values in Traditional African Societies","Survival Skills","Morals","Learning Before Formal Schools"] },
    ]},
    { strand: "Governance and Citizenship", subStrands: [
      { sub: "School Administration", topics: ["Board of Management","Headteacher","Student Council","Roles and Responsibilities"] },
      { sub: "Built Environments", topics: ["Historic Sites","Monuments in Kenya","Economic Value of Protected Sites"] },
    ]},
  ]);

  add(5, "Creative Arts", [
    { strand: "Creating and Execution", subStrands: [
      { sub: "Visual Arts", topics: ["Still Life Drawing","Cross-Hatching","Smudging for 3D Effects","Crayon Etching","Basics of Graphic Design"] },
      { sub: "Music Composition", topics: ["Creating Rhythm Beats","Clapping Patterns","Body Percussion","Writing Simple 2–4 Bar Melodies"] },
      { sub: "Physical Sports Performance", topics: ["Soccer Passing","Soccer Dribbling","Soccer Shooting","Rounders Skills"] },
    ]},
    { strand: "Performance and Display", subStrands: [
      { sub: "Performing Arts", topics: ["Kenyan Folk Dances","Playing Wind Instruments","Descant Recorder","Handmade Puppets","Puppet Manipulation"] },
      { sub: "Athletics", topics: ["Sprint Racing Starts","Relay Races","Visual Baton Exchange"] },
    ]},
    { strand: "Appreciation", subStrands: [
      { sub: "Critique", topics: ["Observing Creative Works","Discussing Visual Elements","Discussing Musical Elements","Giving Feedback on Self-Made Work","Giving Feedback on Peer-Made Work"] },
    ]},
  ]);

  return items;
}

// ── Seed Logic ────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting curriculum seed...\n");

  const guildId = await getOrCreateGuild();
  console.log(`✅ Guild: ${guildId}`);

  const curriculum = generateCurriculum();
  console.log(`📚 Generated ${curriculum.length} curriculum items`);

  // Build unique subjects
  const subjectMap = new Map<string, { grade: number; name: string }>();
  for (const c of curriculum) {
    const key = `${c.grade}-${c.subject}`;
    if (!subjectMap.has(key)) subjectMap.set(key, { grade: c.grade, name: c.subject });
  }

  // Insert subjects
  console.log("\n📝 Inserting subjects...");
  let subjectCount = 0;
  for (const [key, s] of Array.from(subjectMap.entries())) {
    const slug = slugify(`${s.grade}-${s.name}`);
    const { error } = await supabase.from("Subject").upsert({ name: s.name, slug, grade: s.grade }, { onConflict: "slug" });
    if (!error) subjectCount++;
    else if (!error.message.includes("duplicate")) console.warn(`  ⚠️ Subject ${s.name}: ${error.message}`);
  }
  console.log(`✅ Subjects: ${subjectCount}`);

  // Insert strands
  console.log("\n📝 Inserting strands...");
  const strandMap = new Map<string, { subjectName: string; name: string }>();
  for (const c of curriculum) {
    const key = `${c.grade}-${c.subject}-${c.strand}`;
    if (!strandMap.has(key)) strandMap.set(key, { subjectName: c.subject, name: c.strand });
  }
  let strandCount = 0;
  for (const [key, s] of Array.from(strandMap.entries())) {
    const slug = slugify(key);
    const { error } = await supabase.from("Strand").upsert({ name: s.name, slug, subjectName: s.subjectName }, { onConflict: "slug" });
    if (!error) strandCount++;
    else if (!error.message.includes("duplicate")) console.warn(`  ⚠️ Strand ${s.name}: ${error.message}`);
  }
  console.log(`✅ Strands: ${strandCount}`);

  // Insert sub-strands
  console.log("\n📝 Inserting sub-strands...");
  const subStrandMap = new Map<string, { strandName: string; name: string }>();
  for (const c of curriculum) {
    const key = `${c.grade}-${c.subject}-${c.strand}-${c.subStrand}`;
    if (!subStrandMap.has(key)) subStrandMap.set(key, { strandName: c.strand, name: c.subStrand });
  }
  let subStrandCount = 0;
  for (const [key, s] of Array.from(subStrandMap.entries())) {
    const slug = slugify(key);
    const { error } = await supabase.from("SubStrand").upsert({ name: s.name, slug, strandName: s.strandName }, { onConflict: "slug" });
    if (!error) subStrandCount++;
    else if (!error.message.includes("duplicate")) console.warn(`  ⚠️ SubStrand ${s.name}: ${error.message}`);
  }
  console.log(`✅ Sub-Strands: ${subStrandCount}`);

  // Insert themes
  console.log("\n📝 Inserting themes...");
  const themeMap = new Map<string, { subStrandName: string; name: string; grade: number }>();
  for (const c of curriculum) {
    const key = `${c.grade}-${c.subject}-${c.strand}-${c.subStrand}-${c.topic}`;
    if (!themeMap.has(key)) themeMap.set(key, { subStrandName: c.subStrand, name: c.topic, grade: c.grade });
  }
  let themeCount = 0;
  for (const [key, t] of Array.from(themeMap.entries())) {
    const slug = slugify(key);
    const { error } = await supabase.from("Theme").upsert({
      guildId, title: t.name, slug, description: `Draft theme for ${t.name}`,
      grade: t.grade, status: "DRAFT", durationWeeks: 1,
    }, { onConflict: "slug" });
    if (!error) themeCount++;
    else if (!error.message.includes("duplicate")) console.warn(`  ⚠️ Theme ${t.name}: ${error.message}`);
  }
  console.log(`✅ Themes: ${themeCount}`);

  // Insert quests
  console.log("\n📝 Inserting quests...");
  let questCount = 0;
  for (const c of curriculum) {
    const themeKey = `${c.grade}-${c.subject}-${c.strand}-${c.subStrand}-${c.topic}`;
    const themeSlug = slugify(themeKey);
    const questSlug = slugify(`${themeSlug}-quest`);
    const { error } = await supabase.from("Quest").upsert({
      themeId: null, title: `${c.topic} Quest`, slug: questSlug,
      description: `Draft quest for ${c.topic}`, questType: "MAIN",
      orderIndex: 1, xpReward: JSON.stringify({ base: 50 }), status: "DRAFT",
    }, { onConflict: "slug" });
    if (!error) questCount++;
  }
  console.log(`✅ Quests: ${questCount}`);

  // Insert lessons
  console.log("\n📝 Inserting lessons...");
  let lessonCount = 0;
  for (let i = 0; i < curriculum.length; i++) {
    const c = curriculum[i];
    const themeKey = `${c.grade}-${c.subject}-${c.strand}-${c.subStrand}-${c.topic}`;
    const themeSlug = slugify(themeKey);
    const questSlug = slugify(`${themeSlug}-quest`);
    const lessonSlug = slugify(`${questSlug}-lesson`);

    const termNumber = (i % 3) + 1;
    const weekNumber = (i % 13) + 1;

    const { error } = await supabase.from("Lesson").upsert({
      questId: null, title: c.topic, slug: lessonSlug,
      description: DEFAULTS.learningOutcomes,
      contentBlocks: JSON.stringify({
        grade: c.grade, subject: c.subject, strand: c.strand,
        subStrand: c.subStrand, theme: c.topic,
        termNumber, weekNumber,
        learningOutcomes: DEFAULTS.learningOutcomes,
        parentGuide: DEFAULTS.parentGuide,
        learnerActivity: DEFAULTS.learnerActivity,
        assessment: DEFAULTS.assessment,
        materials: DEFAULTS.materials,
        competencies: pick(COMPETENCIES, 2),
        values: pick(VALUES, 2),
        status: DEFAULTS.status,
        version: DEFAULTS.version,
      }),
      xpReward: JSON.stringify({ base: 50 }),
      orderIndex: weekNumber, status: "DRAFT",
    }, { onConflict: "slug" });

    if (!error) lessonCount++;
  }
  console.log(`✅ Lessons: ${lessonCount}`);

  // Summary
  const { count: totalLessons } = await supabase.from("Lesson").select("id", { count: "exact", head: true });
  const { count: totalQuests } = await supabase.from("Quest").select("id", { count: "exact", head: true });
  const { count: totalThemes } = await supabase.from("Theme").select("id", { count: "exact", head: true });

  console.log("\n" + "═".repeat(50));
  console.log("✅ CURRICULUM SEED COMPLETE!");
  console.log("═".repeat(50));
  console.log(`   Total lessons in DB: ${totalLessons || 0}`);
  console.log(`   Total quests in DB: ${totalQuests || 0}`);
  console.log(`   Total themes in DB: ${totalThemes || 0}`);
  console.log("═".repeat(50));

  const g2Subjects = Array.from(new Set(curriculum.filter(c => c.grade === 2).map(c => c.subject)));
  const g5Subjects = Array.from(new Set(curriculum.filter(c => c.grade === 5).map(c => c.subject)));
  console.log("\n📋 Grade 2 Subjects:", g2Subjects.length);
  g2Subjects.forEach(s => console.log(`   • ${s}`));
  console.log("\n📋 Grade 5 Subjects:", g5Subjects.length);
  g5Subjects.forEach(s => console.log(`   • ${s}`));
}

async function getOrCreateGuild() {
  const { data: existing } = await supabase.from("Guild").select("id").eq("slug", "arizen-international").single();
  if (existing) return existing.id;
  const { data, error } = await supabase.from("Guild").insert({
    name: "Arizen International", slug: "arizen-international",
    description: "Arizen Homeschool Hub — CBC-aligned learning.",
  }).select("id").single();
  if (error) throw new Error(`Guild: ${error.message}`);
  return data.id;
}

seed().then(() => { console.log("\n🎉 Done!"); process.exit(0); }).catch(e => { console.error("\n❌", e); process.exit(1); });
