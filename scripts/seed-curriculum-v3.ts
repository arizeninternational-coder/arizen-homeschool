#!/usr/bin/env tsx
/**
 * Arizen Homeschool — Curriculum Seed Script v3
 * Uses direct PostgreSQL connection to seed curriculum structure.
 * Run: npx tsx scripts/seed-curriculum-v3.ts
 */

import { readFileSync } from "fs";
import { Client } from "pg";

// Read .env
const envFile = readFileSync(".env", "utf-8");
for (const line of envFile.split("\n")) {
  const t = line.trim();
  if (t && !t.startsWith("#") && t.includes("=")) {
    const [k, ...r] = t.split("=");
    const v = r.join("=").replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
// Strip pgbouncer params for direct connection
const directUrl = process.env.DATABASE_URL!.split("?")[0].replace(":6543/", ":5432/");
const directClient = new Client({ connectionString: directUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  await directClient.connect();
  console.log("🌱 Connected to database\n");

  // Get or create guild
  let guildId: string;
  const guildRes = await directClient.query(`SELECT id FROM "Guild" WHERE slug = 'arizen-international'`);
  if (guildRes.rows.length > 0) {
    guildId = guildRes.rows[0].id;
  } else {
    guildId = "a0000000-0000-0000-0000-000000000001";
    await directClient.query(`INSERT INTO "Guild" (id, name, slug, description) VALUES ($1, 'Arizen International', 'arizen-international', 'CBC-aligned learning.')`, [guildId]);
  }
  console.log(`✅ Guild: ${guildId}`);

  const defaults = {
    learningOutcomes: "To be populated with CBC/CBE-aligned learning outcomes.",
    parentGuide: "Draft placeholder. Parent guidance will be added after curriculum review.",
    learnerActivity: "Draft placeholder. Learner activity will be added after curriculum review.",
    assessment: "Draft placeholder. Assessment task will be added after curriculum review.",
    materials: "Locally available materials to be added.",
  };

  // ── Curriculum data ──────────────────────────────────────────
  const curriculum: Array<{
    grade: number; subject: string; strand: string; subStrand: string; topics: string[];
  }> = [
    // GRADE 2
    { grade: 2, subject: "Mathematical Activities", strand: "Numbers", subStrand: "Number Concept", topics: ["Counting Numbers up to 100 Forwards","Counting Numbers up to 100 Backwards","Identifying Numbers up to 100"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Numbers", subStrand: "Place Value", topics: ["Hundreds","Tens","Ones","Identifying Values of Digits up to 100"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Numbers", subStrand: "Reading and Writing Numbers", topics: ["Writing Numbers in Digits up to 100","Writing Numbers in Words up to 100"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Numbers", subStrand: "Number Patterns", topics: ["Identifying Addition Patterns","Identifying Subtraction Patterns","Completing Number Patterns"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Numbers", subStrand: "Addition", topics: ["Adding Numbers up to a Sum of 100","Addition with Carrying"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Numbers", subStrand: "Subtraction", topics: ["Subtracting Numbers Within 100","Subtraction with Borrowing"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Numbers", subStrand: "Multiplication", topics: ["Introduction to Multiplication","Multiplication Facts up to 5 × 5"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Numbers", subStrand: "Fractions", topics: ["Identifying a Half","Shading a Half","Identifying a Quarter","Shading a Quarter"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Measurement", subStrand: "Length", topics: ["Measuring Length Using Non-Standard Units","Measuring Length Using Hand Spans","Measuring Length Using Metres"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Measurement", subStrand: "Mass", topics: ["Comparing Heavier Than","Comparing Lighter Than","Comparing Same As"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Measurement", subStrand: "Capacity", topics: ["Measuring Liquid Using Smaller Containers","Comparing How Much Liquid Containers Hold"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Measurement", subStrand: "Time", topics: ["Reading Time by the Hour","Reading Time by the Half-Hour","Using Analogue Clocks","Using Digital Clocks","Identifying Days of the Week"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Measurement", subStrand: "Money", topics: ["Recognizing Kenyan Coins up to Ksh 100","Recognizing Kenyan Notes up to Ksh 100","Simple Shopping Simulations"] },
    { grade: 2, subject: "Mathematical Activities", strand: "Geometry", subStrand: "Shapes", topics: ["Recognizing Rectangles","Recognizing Squares","Recognizing Circles","Recognizing Triangles","Drawing Basic Shapes","Making Patterns with Shapes"] },
    { grade: 2, subject: "English Language Activities", strand: "Listening and Speaking", subStrand: "Pronunciation", topics: ["Pronouncing Sounds Correctly","Pronouncing Words Correctly"] },
    { grade: 2, subject: "English Language Activities", strand: "Listening and Speaking", subStrand: "Listening Comprehension", topics: ["Listening to Short Stories","Answering Questions from Short Stories"] },
    { grade: 2, subject: "English Language Activities", strand: "Listening and Speaking", subStrand: "Polite Language", topics: ["Using Please and Thank You","Using Excuse Me","Following Two-Step Instructions","Following Three-Step Instructions"] },
    { grade: 2, subject: "English Language Activities", strand: "Reading", subStrand: "Phonics", topics: ["Blending Letter Sounds","Reading Words with Clusters: cl Words","Reading Words with Clusters: br Words","Reading Words with Clusters: st Words"] },
    { grade: 2, subject: "English Language Activities", strand: "Reading", subStrand: "Sight Words", topics: ["Recognizing Common High-Frequency Words"] },
    { grade: 2, subject: "English Language Activities", strand: "Reading", subStrand: "Fluency", topics: ["Reading Short Paragraphs Aloud","Reading Clearly and Smoothly"] },
    { grade: 2, subject: "English Language Activities", strand: "Reading", subStrand: "Comprehension", topics: ["Understanding Simple Stories","Identifying Characters in Stories","Identifying Events in Stories"] },
    { grade: 2, subject: "English Language Activities", strand: "Language Structures and Grammar", subStrand: "Nouns", topics: ["Proper Nouns","Common Nouns","Singular Nouns","Plural Nouns Using -s","Plural Nouns Using -es"] },
    { grade: 2, subject: "English Language Activities", strand: "Language Structures and Grammar", subStrand: "Pronouns and Tense", topics: ["Pronouns: I You He She It We They","Present Continuous Tense Using -ing","Articles: a an the","Prepositions: in on under behind"] },
    { grade: 2, subject: "English Language Activities", strand: "Writing", subStrand: "Handwriting", topics: ["Formation of Uppercase Letters","Formation of Lowercase Letters"] },
    { grade: 2, subject: "English Language Activities", strand: "Writing", subStrand: "Guided Writing", topics: ["Completing Sentences","Writing Short Compositions of 3–5 Sentences","Spelling Common Vocabulary Words"] },
    { grade: 2, subject: "Kiswahili Language Activities", strand: "Kusikiliza na Kuzungumza", subStrand: "Matamshi", topics: ["Matamshi Bora ya Sauti","Matamshi Bora ya Maneno"] },
    { grade: 2, subject: "Kiswahili Language Activities", strand: "Kusikiliza na Kuzungumza", subStrand: "Maamkizi na Adabu", topics: ["Shikamoo na Marahaba","Tafadhali Asante Samahani","Kusikiliza Hadithi","Kujibu Maswali kwa Ufasaha"] },
    { grade: 2, subject: "Kiswahili Language Activities", strand: "Kusoma", subStrand: "Kusoma Silabi na Maneno", topics: ["Kusoma Silabi","Kuunda Maneno","Kusoma Vifungu Vifupi kwa Sauti"] },
    { grade: 2, subject: "Kiswahili Language Activities", strand: "Kusoma", subStrand: "Ufahamu", topics: ["Kusoma kwa Ufasaha","Ufahamu wa Kisa","Ufahamu wa Hadithi Iliyosomwa"] },
    { grade: 2, subject: "Kiswahili Language Activities", strand: "Sarufi", subStrand: "Ngeli", topics: ["Ngeli ya A-Wa: Mtu-Watu","Ngeli ya KI-VI: Kiti-Viti","Ngeli ya LI-YA","Ngeli ya I-ZI"] },
    { grade: 2, subject: "Kiswahili Language Activities", strand: "Sarufi", subStrand: "Viashiria na Vishirikishi", topics: ["Viashiria: Huyu Wale Hiki Hivi","Vishirikishi: Huyu ni Mwalimu"] },
    { grade: 2, subject: "Kiswahili Language Activities", strand: "Sarufi", subStrand: "Wakati", topics: ["Wakati Uliopo: -na-","Wakati Uliopita: -li-","Wakati Ujao: -ta-"] },
    { grade: 2, subject: "Kiswahili Language Activities", strand: "Kuandika", subStrand: "Mwandiko", topics: ["Mwandiko Nadhifu wa Herufi","Mwandiko Nadhifu wa Maneno","Kujaza Pengo","Kukamilisha Sentensi"] },
    { grade: 2, subject: "Kiswahili Language Activities", strand: "Kuandika", subStrand: "Insha", topics: ["Kuandika Insha Fupi za Kuongozwa","Kuandika Sentensi Tatu hadi Tano"] },
    { grade: 2, subject: "Environmental Activities", strand: "Weather and the Environment", subStrand: "Weather Conditions", topics: ["Sunny Weather","Rainy Weather","Windy Weather","Cloudy Weather","Observing Weather","Tracking Weather"] },
    { grade: 2, subject: "Environmental Activities", strand: "Weather and the Environment", subStrand: "Weather Symbols", topics: ["Drawing Weather Symbols","Using Charts to Record Weekly Weather"] },
    { grade: 2, subject: "Environmental Activities", strand: "Weather and the Environment", subStrand: "Effects of Weather", topics: ["Choosing Appropriate Clothing for Weather","Choosing Appropriate Activities for Weather"] },
    { grade: 2, subject: "Environmental Activities", strand: "Natural Environment and Physical Features", subStrand: "Physical Features", topics: ["Hills","Rivers","Forests","Valleys","Local Landforms"] },
    { grade: 2, subject: "Environmental Activities", strand: "Natural Environment and Physical Features", subStrand: "Plants", topics: ["Common Trees","Common Flowers","Basic Care for Plants"] },
    { grade: 2, subject: "Environmental Activities", strand: "Natural Environment and Physical Features", subStrand: "Animals", topics: ["Domestic Animals","Wild Animals","Animal Safety"] },
    { grade: 2, subject: "Environmental Activities", strand: "Social Environment and Resources", subStrand: "School Community", topics: ["Headteacher","Teachers","Cleaners","Guards","Roles of People at School"] },
    { grade: 2, subject: "Environmental Activities", strand: "Social Environment and Resources", subStrand: "Local Market", topics: ["Items Bought in the Market","Items Sold in the Market","Local Community Market"] },
    { grade: 2, subject: "Environmental Activities", strand: "Social Environment and Resources", subStrand: "National Flag", topics: ["Colours of the Kenyan Flag","Meaning of the Kenyan Flag Colours","Respect During Flag-Raising Ceremonies"] },
    { grade: 2, subject: "Environmental Activities", strand: "Social Environment and Resources", subStrand: "Child Rights", topics: ["Right to Food","Right to Education","Right to Shelter","Family Responsibilities","Personal Responsibilities"] },
    { grade: 2, subject: "Hygiene and Nutrition Activities", strand: "Health Practices and Personal Hygiene", subStrand: "Care of Body Parts", topics: ["Cleaning Teeth","Preventing Cavities","Washing Hands at Critical Times","Hair Care"] },
    { grade: 2, subject: "Hygiene and Nutrition Activities", strand: "Health Practices and Personal Hygiene", subStrand: "Personal Items", topics: ["Toothbrushes","Combs","Handkerchiefs","Items That Should Not Be Shared"] },
    { grade: 2, subject: "Hygiene and Nutrition Activities", strand: "Food and Nutrition", subStrand: "Daily Meals", topics: ["Breakfast","Lunch","Supper","Components of a Healthy Meal"] },
    { grade: 2, subject: "Hygiene and Nutrition Activities", strand: "Food and Nutrition", subStrand: "Good Eating Habits", topics: ["Chewing Properly","Washing Fruits Before Eating","Avoiding Talking with Food in Mouth"] },
    { grade: 2, subject: "Hygiene and Nutrition Activities", strand: "Food and Nutrition", subStrand: "Food Safety", topics: ["Protecting Food from Dirt","Protecting Food from Flies","Proper Food Storage"] },
    { grade: 2, subject: "Hygiene and Nutrition Activities", strand: "Medicine Safety and Common Illnesses", subStrand: "Common Illnesses", topics: ["Coughs","Colds","Stomach Aches","Recognizing Signs of Common Ailments"] },
    { grade: 2, subject: "Hygiene and Nutrition Activities", strand: "Medicine Safety and Common Illnesses", subStrand: "Safe Use of Medicine", topics: ["Following Instructions from Adults","Following Instructions from Doctors","Dangers of Taking Unknown Medicine"] },
    { grade: 2, subject: "Movement Activities", strand: "Locomotor and Non-Locomotor Skills", subStrand: "Locomotor Movements", topics: ["Walking","Running","Skipping","Galloping","Leaping"] },
    { grade: 2, subject: "Movement Activities", strand: "Locomotor and Non-Locomotor Skills", subStrand: "Non-Locomotor Movements", topics: ["Bending","Twisting","Stretching","Balancing on Different Body Parts"] },
    { grade: 2, subject: "Movement Activities", strand: "Ball Properties and Games", subStrand: "Handling Objects", topics: ["Rolling Balls","Throwing Balls","Catching Balls","Kicking Balls","Using Beanbags"] },
    { grade: 2, subject: "Movement Activities", strand: "Ball Properties and Games", subStrand: "Chasing Games", topics: ["Simple Field Games","Tracking Space","Changing Direction Safely","Non-Contact Games"] },
    { grade: 2, subject: "Movement Activities", strand: "Rhythmic Movements and Gymnastics", subStrand: "Simple Gymnastics", topics: ["Egg Rolls","Forward Rolls","Safe Movement on Mats"] },
    { grade: 2, subject: "Movement Activities", strand: "Rhythmic Movements and Gymnastics", subStrand: "Rhythmic Movements", topics: ["Moving Body Parts with Music","Moving with Drums","Moving with Clapping Beats"] },

    // GRADE 5
    { grade: 5, subject: "Mathematics", strand: "Numbers", subStrand: "Whole Numbers", topics: ["Counting Reading and Writing Numbers up to 1,000,000","Identifying Place Value and Total Value of Digits up to 1,000,000","Rounding Off Numbers to the Nearest Thousand"] },
    { grade: 5, subject: "Mathematics", strand: "Numbers", subStrand: "Divisibility Tests", topics: ["Testing Numbers for Divisibility by 2","Testing Numbers for Divisibility by 5","Testing Numbers for Divisibility by 10"] },
    { grade: 5, subject: "Mathematics", strand: "Numbers", subStrand: "Factors and Multiples", topics: ["Finding Factors of Numbers","Finding Multiples of Numbers","Finding the Greatest Common Divisor (GCD)","Finding the Least Common Multiple (LCM)"] },
    { grade: 5, subject: "Mathematics", strand: "Numbers", subStrand: "Fractions", topics: ["Comparing Proper Fractions","Ordering Proper Fractions","Adding Proper Fractions","Subtracting Proper Fractions","Working with Mixed Fractions"] },
    { grade: 5, subject: "Mathematics", strand: "Numbers", subStrand: "Decimals", topics: ["Identifying Decimal Place Value up to Thousandths","Ordering Decimals","Adding Decimals","Subtracting Decimals"] },
    { grade: 5, subject: "Mathematics", strand: "Numbers", subStrand: "Percentages", topics: ["Converting Fractions into Percentages","Converting Decimals into Percentages","Converting Percentages into Fractions and Decimals"] },
    { grade: 5, subject: "Mathematics", strand: "Measurement", subStrand: "Length", topics: ["Measuring Length in Kilometres","Converting Kilometres to Metres","Converting Metres to Centimetres"] },
    { grade: 5, subject: "Mathematics", strand: "Measurement", subStrand: "Area", topics: ["Calculating the Area of Squares","Calculating the Area of Rectangles"] },
    { grade: 5, subject: "Mathematics", strand: "Measurement", subStrand: "Volume and Capacity", topics: ["Finding Volume Using Unit Cubes","Working with Litres","Working with Millilitres","Converting Between Litres and Millilitres"] },
    { grade: 5, subject: "Mathematics", strand: "Measurement", subStrand: "Mass", topics: ["Converting Tonnes to Kilograms","Converting Kilograms to Grams"] },
    { grade: 5, subject: "Mathematics", strand: "Measurement", subStrand: "Time", topics: ["Reading Time","Converting Hours to Minutes","Converting Minutes to Seconds","Using the 24-Hour Clock"] },
    { grade: 5, subject: "Mathematics", strand: "Measurement", subStrand: "Money", topics: ["Calculating Buying Price and Selling Price","Calculating Profit","Calculating Loss","Working with Simple Transactions up to Ksh 10,000"] },
    { grade: 5, subject: "Mathematics", strand: "Geometry and Algebra", subStrand: "Angles", topics: ["Identifying Acute Angles","Identifying Obtuse Angles","Identifying Right Angles","Measuring Angles Using a Protractor","Drawing Angles Using a Protractor"] },
    { grade: 5, subject: "Mathematics", strand: "Geometry and Algebra", subStrand: "Algebraic Expressions", topics: ["Understanding Simple Variables","Simplifying Basic Algebraic Expressions","Solving Simple Equations","Solving Word Problems Using One Variable"] },
    { grade: 5, subject: "English", strand: "Listening and Speaking", subStrand: "Active Listening", topics: ["Active Listening During Short Informative Talks","Taking Notes During Short Talks","Using Advanced Polite Markers","Presentation Etiquette"] },
    { grade: 5, subject: "English", strand: "Reading", subStrand: "Intensive Reading", topics: ["Reading Short Passages","Inferring Meaning","Deducing Cause and Effect","Identifying Main Ideas"] },
    { grade: 5, subject: "English", strand: "Reading", subStrand: "Extensive Reading", topics: ["Reading Storybooks for Pleasure","Using the Library","Using Digital Tools for Reading"] },
    { grade: 5, subject: "English", strand: "Language Structures and Grammar", subStrand: "Nouns and Pronouns", topics: ["Collective Nouns","Abstract Nouns","Uncountable Nouns","Possessive Pronouns"] },
    { grade: 5, subject: "English", strand: "Language Structures and Grammar", subStrand: "Tenses and Adverbs", topics: ["Past Continuous Tense","Present Perfect Tense","Degrees of Comparison","Adverbs of Time","Adverbs of Place","Adverbs of Manner"] },
    { grade: 5, subject: "English", strand: "Writing", subStrand: "Functional Writing", topics: ["Writing Friendly Letters","Writing Lists","Writing Invitations"] },
    { grade: 5, subject: "English", strand: "Writing", subStrand: "Creative Composition", topics: ["Writing Structured Narratives","Creating a Clear Beginning Middle and End","Writing Compositions up to 150 Words"] },
    { grade: 5, subject: "Kiswahili", strand: "Kusikiliza na Kuzungumza", subStrand: "Kusikiliza kwa Makini", topics: ["Kusikiliza kwa Makini","Kutoa Muhtasari wa Taarifa","Mjadala kuhusu Mahususi","Mazungumzo kuhusu Usalama Barabarani","Mazungumzo kuhusu Afya"] },
    { grade: 5, subject: "Kiswahili", strand: "Kusikiliza na Kuzungumza", subStrand: "Methali na Vitendawili", topics: ["Kutumia Methali","Kutumia Vitendawili","Kutumia Nahau katika Mazungumzo ya Kila Siku"] },
    { grade: 5, subject: "Kiswahili", strand: "Kusoma", subStrand: "Kusoma kwa Sauti na Ufasaha", topics: ["Kusoma kwa Sauti na kwa Ufasaha","Kuzingatia Alama za Uandishi"] },
    { grade: 5, subject: "Kiswahili", strand: "Kusoma", subStrand: "Kusoma kwa Kina", topics: ["Kusoma kwa Kina","Kujibu Maswali ya Ufahamu","Kuchanganua Taarifa katika Kifungu"] },
    { grade: 5, subject: "Kiswahili", strand: "Sarufi", subStrand: "Ngeli", topics: ["Ngeli ya U-I","Ngeli ya LI-YA","Ngeli ya YA-YA","Ngeli ya I-ZI"] },
    { grade: 5, subject: "Kiswahili", strand: "Sarufi", subStrand: "Viwakilishi na Viunganishi", topics: ["Viwakilishi vya Nafsi: Mimi Wewe Yeye Sisi Nyinyi Wao","Viunganishi vya Sentensi"] },
    { grade: 5, subject: "Kiswahili", strand: "Sarufi", subStrand: "Wakati na Hali", topics: ["Wakati Uliopo","Wakati Uliopita","Wakati Ujao","Hali ya Timilifu Kutumia -me-"] },
    { grade: 5, subject: "Kiswahili", strand: "Kuandika", subStrand: "Kuandika Barua na Tawasifu", topics: ["Kuandika Barua za Kirafiki","Kuandika Tawasifu Fupi"] },
    { grade: 5, subject: "Kiswahili", strand: "Kuandika", subStrand: "Insha", topics: ["Kuandika Insha za Kubuni","Mtiririko Mzuri wa Mawazo","Kuandika Insha za Maneno 100–150"] },
    { grade: 5, subject: "Science and Technology", strand: "Living Things", subStrand: "Plants", topics: ["Classifying Plants into Flowering Plants","Classifying Plants into Non-Flowering Plants"] },
    { grade: 5, subject: "Science and Technology", strand: "Living Things", subStrand: "Fungi", topics: ["Introduction to Mushrooms","Introduction to Mould","Introduction to Yeast","Economic Importance of Fungi","Safety Precautions When Handling Fungi"] },
    { grade: 5, subject: "Science and Technology", strand: "Living Things", subStrand: "Animals", topics: ["Vertebrates","Mammals","Birds","Reptiles","Amphibians","Fish","Characteristics of Vertebrate Groups"] },
    { grade: 5, subject: "Science and Technology", strand: "Living Things", subStrand: "Human Body Systems", topics: ["Digestive System","Functions of Teeth","Common Digestive System Disorders"] },
    { grade: 5, subject: "Science and Technology", strand: "Environment", subStrand: "Pollution", topics: ["Air Pollution","Water Pollution","Soil Pollution","Effects of Pollution on Living Things","Pollution Control Measures"] },
    { grade: 5, subject: "Science and Technology", strand: "Environment", subStrand: "Waste Management", topics: ["Reduce","Reuse","Recycle","Practicing the 3Rs in the School or Home Environment"] },
    { grade: 5, subject: "Science and Technology", strand: "Matter and Force", subStrand: "Properties of Matter", topics: ["Solids","Liquids","Gases","Effects of Heating","Effects of Cooling"] },
    { grade: 5, subject: "Science and Technology", strand: "Matter and Force", subStrand: "Force and Energy", topics: ["Friction","Advantages of Friction","Disadvantages of Friction","Ways of Reducing Friction","Ways of Increasing Friction"] },
    { grade: 5, subject: "Science and Technology", strand: "Digital Technology", subStrand: "Computer Basics", topics: ["External Parts of a Computer System","Basic Typing","Word Processing","Saving Files Securely"] },
    { grade: 5, subject: "Agriculture and Nutrition", strand: "Conservation of Resources", subStrand: "Soil Conservation", topics: ["Controlling Soil Erosion","Using Trash Lines","Using Cover Crops","Constructing Simple Barriers"] },
    { grade: 5, subject: "Agriculture and Nutrition", strand: "Conservation of Resources", subStrand: "Soil Improvement", topics: ["Preparing Organic Compost Manure","Applying Organic Compost Manure to Crop Fields"] },
    { grade: 5, subject: "Agriculture and Nutrition", strand: "Conservation of Resources", subStrand: "Water Conservation", topics: ["Harvesting Rainwater Safely","Basic Drip Irrigation Models"] },
    { grade: 5, subject: "Agriculture and Nutrition", strand: "Food Production Processes", subStrand: "Growing Crops", topics: ["Sowing Climbing Fruit Plants","Managing Climbing Fruit Plants","Using Simple Trellises and Supports"] },
    { grade: 5, subject: "Agriculture and Nutrition", strand: "Food Production Processes", subStrand: "Domestic Animals", topics: ["Uses of Rabbits","Uses of Poultry","Uses of Bees","Basic Feeding Requirements"] },
    { grade: 5, subject: "Agriculture and Nutrition", strand: "Food Production Processes", subStrand: "Preservation", topics: ["Safe Storage of Cereals","Safe Storage of Pulses","Preventing Post-Harvest Losses"] },
    { grade: 5, subject: "Agriculture and Nutrition", strand: "Hygiene and Food Preparation", subStrand: "Food Nutrients", topics: ["Macronutrients","Micronutrients","Nutritional Deficiency Diseases","Kwashiorkor","Marasmus"] },
    { grade: 5, subject: "Agriculture and Nutrition", strand: "Hygiene and Food Preparation", subStrand: "Cooking Techniques", topics: ["Dry Fat Frying","Preparing Pancakes or Chapati","Safe Deep Frying Procedures"] },
    { grade: 5, subject: "Social Studies", strand: "Physical Environment", subStrand: "Maps", topics: ["Reading Map Titles","Understanding Scale","Understanding Map Keys","Understanding Compass Rose"] },
    { grade: 5, subject: "Social Studies", strand: "Physical Environment", subStrand: "Position and Size of Kenya", topics: ["Identifying Kenya's Neighbouring Countries","Understanding Boundaries"] },
    { grade: 5, subject: "Social Studies", strand: "Physical Environment", subStrand: "Physical Features", topics: ["The Rift Valley","Mountains","Plains","Drainage Basins"] },
    { grade: 5, subject: "Social Studies", strand: "Physical Environment", subStrand: "Weather and Climate", topics: ["Difference Between Weather and Climate","Tracking Rainfall Maps of Kenya","Tracking Temperature Maps of Kenya"] },
    { grade: 5, subject: "Social Studies", strand: "People and Culture", subStrand: "Language Groups", topics: ["Bantu Groups","Nilotic Groups","Cushitic Groups"] },
    { grade: 5, subject: "Social Studies", strand: "People and Culture", subStrand: "Traditional Education", topics: ["Social Values in Traditional African Societies","Survival Skills","Morals","Learning Before Formal Schools"] },
    { grade: 5, subject: "Social Studies", strand: "Governance and Citizenship", subStrand: "School Administration", topics: ["Board of Management","Headteacher","Student Council","Roles and Responsibilities"] },
    { grade: 5, subject: "Social Studies", strand: "Governance and Citizenship", subStrand: "Built Environments", topics: ["Historic Sites","Monuments in Kenya","Economic Value of Protected Sites"] },
    { grade: 5, subject: "Creative Arts", strand: "Creating and Execution", subStrand: "Visual Arts", topics: ["Still Life Drawing","Cross-Hatching","Smudging for 3D Effects","Crayon Etching","Basics of Graphic Design"] },
    { grade: 5, subject: "Creative Arts", strand: "Creating and Execution", subStrand: "Music Composition", topics: ["Creating Rhythm Beats","Clapping Patterns","Body Percussion","Writing Simple 2–4 Bar Melodies"] },
    { grade: 5, subject: "Creative Arts", strand: "Creating and Execution", subStrand: "Physical Sports Performance", topics: ["Soccer Passing","Soccer Dribbling","Soccer Shooting","Rounders Skills"] },
    { grade: 5, subject: "Creative Arts", strand: "Performance and Display", subStrand: "Performing Arts", topics: ["Kenyan Folk Dances","Playing Wind Instruments","Descant Recorder","Handmade Puppets","Puppet Manipulation"] },
    { grade: 5, subject: "Creative Arts", strand: "Performance and Display", subStrand: "Athletics", topics: ["Sprint Racing Starts","Relay Races","Visual Baton Exchange"] },
    { grade: 5, subject: "Creative Arts", strand: "Appreciation", subStrand: "Critique", topics: ["Observing Creative Works","Discussing Visual Elements","Discussing Musical Elements","Giving Feedback on Self-Made Work","Giving Feedback on Peer-Made Work"] },
  ];

  // ── Seed ──────────────────────────────────────────────────────

  let subjects = 0, strands = 0, subStrands = 0, themes = 0, quests = 0, lessons = 0;

  for (const item of curriculum) {
    // Subject
    const subjectSlug = `g${item.grade}-${item.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    await directClient.query(
      `INSERT INTO "Subject" (name, slug, grade) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`,
      [item.subject, subjectSlug, item.grade]
    );
    subjects++;

    // Strand
    const strandSlug = `${subjectSlug}-${item.strand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    await directClient.query(
      `INSERT INTO "Strand" (name, slug, "subjectName") VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`,
      [item.strand, strandSlug, item.subject]
    );
    strands++;

    // SubStrand
    const subStrandSlug = `${strandSlug}-${item.subStrand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    await directClient.query(
      `INSERT INTO "SubStrand" (name, slug, "strandName") VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`,
      [item.subStrand, subStrandSlug, item.strand]
    );
    subStrands++;

    // Create one theme + quest + lesson per topic
    for (const topic of item.topics) {
      const themeSlug = `${subStrandSlug}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
      const questSlug = `${themeSlug}-q`;
      const lessonSlug = `${themeSlug}-l`;

      // Theme
      await directClient.query(
        `INSERT INTO "Theme" (guild_id, title, slug, description, grade, status) VALUES ($1, $2, $3, $4, $5, 'DRAFT') ON CONFLICT (slug) DO NOTHING`,
        [guildId, topic, themeSlug, `Draft theme: ${topic}`, item.grade]
      );
      themes++;

      // Quest
      await directClient.query(
        `INSERT INTO "Quest" (title, slug, description, quest_type, order_index, xp_reward, status) VALUES ($1, $2, $3, 'MAIN', 1, '{"base": 50}', 'DRAFT') ON CONFLICT (slug) DO NOTHING`,
        [`${topic} Quest`, questSlug, `Draft quest: ${topic}`]
      );
      quests++;

      // Lesson with full content_blocks JSON
      const contentBlocks = JSON.stringify({
        grade: item.grade,
        subject: item.subject,
        strand: item.strand,
        subStrand: item.subStrand,
        theme: topic,
        learningOutcomes: defaults.learningOutcomes,
        parentGuide: defaults.parentGuide,
        learnerActivity: defaults.learnerActivity,
        assessment: defaults.assessment,
        materials: defaults.materials,
        competencies: ["Communication and Collaboration", "Critical Thinking and Problem Solving"],
        values: ["Respect", "Responsibility"],
        status: "draft",
        version: 1,
      });

      await directClient.query(
        `INSERT INTO "Lesson" (title, slug, description, content_blocks, xp_reward, order_index, status) VALUES ($1, $2, $3, $4::jsonb, '{"base": 50}', 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING`,
        [topic, lessonSlug, defaults.learningOutcomes, contentBlocks]
      );
      lessons++;
    }
  }

  // Summary
  const g2Subjects = [...new Set(curriculum.filter(c => c.grade === 2).map(c => c.subject))];
  const g5Subjects = [...new Set(curriculum.filter(c => c.grade === 5).map(c => c.subject))];

  console.log("\n" + "═".repeat(50));
  console.log("✅ CURRICULUM SEED COMPLETE!");
  console.log("═".repeat(50));
  console.log(`   Subjects: ${subjects}`);
  console.log(`   Strands: ${strands}`);
  console.log(`   Sub-Strands: ${subStrands}`);
  console.log(`   Themes: ${themes}`);
  console.log(`   Quests: ${quests}`);
  console.log(`   Lessons: ${lessons}`);
  console.log("═".repeat(50));
  console.log(`\n📋 Grade 2 Subjects (${g2Subjects.length}):`);
  g2Subjects.forEach(s => console.log(`   • ${s}`));
  console.log(`\n📋 Grade 5 Subjects (${g5Subjects.length}):`);
  g5Subjects.forEach(s => console.log(`   • ${s}`));

  await directClient.end();
}

main().catch(e => { console.error("❌", e); process.exit(1); });
