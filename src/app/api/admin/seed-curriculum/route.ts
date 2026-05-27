// POST /api/admin/seed-curriculum — Seed curriculum data (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuthPost } from "@/lib/api-guard";
import { readFileSync } from "fs";

// Read .env for direct DB access
const envFile = readFileSync(".env", "utf-8");
for (const line of envFile.split("\n")) {
  const t = line.trim();
  if (t && !t.startsWith("#") && t.includes("=")) {
    const [k, ...r] = t.split("=");
    const v = r.join("=").replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

// Dynamic import for pg to avoid build issues
let pg: any;
async function getPg() {
  if (!pg) {
    pg = await import("pg");
  }
  return pg;
}

export const POST = withAuthPost(async (req, user, body: any) => {
  try {
    const pgModule = await getPg();
    const client = new pgModule.Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();

    const results: string[] = [];

    // Get or create guild
    let guildId: string;
    const guildRes = await client.query(`SELECT id FROM "Guild" WHERE slug = 'arizen-international'`);
    if (guildRes.rows.length > 0) {
      guildId = guildRes.rows[0].id;
    } else {
      guildId = "a0000000-0000-0000-0000-000000000001";
      await client.query(
        `INSERT INTO "Guild" (id, name, slug, description) VALUES ($1, 'Arizen International', 'arizen-international', 'CBC-aligned learning.') ON CONFLICT DO NOTHING`,
        [guildId]
      );
    }
    results.push(`Guild: ${guildId}`);

    // Curriculum data: [grade, subject, strand, subStrand, topics[]]
    const curriculum: Array<[number, string, string, string, string[]]> = [
      // GRADE 2
      [2, "Mathematical Activities", "Numbers", "Number Concept", ["Counting Numbers up to 100 Forwards","Counting Numbers up to 100 Backwards","Identifying Numbers up to 100"]],
      [2, "Mathematical Activities", "Numbers", "Place Value", ["Hundreds","Tens","Ones","Identifying Values of Digits up to 100"]],
      [2, "Mathematical Activities", "Numbers", "Reading and Writing", ["Writing Numbers in Digits up to 100","Writing Numbers in Words up to 100"]],
      [2, "Mathematical Activities", "Numbers", "Number Patterns", ["Identifying Addition Patterns","Identifying Subtraction Patterns","Completing Number Patterns"]],
      [2, "Mathematical Activities", "Numbers", "Addition", ["Adding Numbers up to a Sum of 100","Addition with Carrying"]],
      [2, "Mathematical Activities", "Numbers", "Subtraction", ["Subtracting Numbers Within 100","Subtraction with Borrowing"]],
      [2, "Mathematical Activities", "Numbers", "Multiplication", ["Introduction to Multiplication","Multiplication Facts up to 5 × 5"]],
      [2, "Mathematical Activities", "Numbers", "Fractions", ["Identifying a Half","Shading a Half","Identifying a Quarter","Shading a Quarter"]],
      [2, "Mathematical Activities", "Measurement", "Length", ["Measuring Length Using Non-Standard Units","Measuring Length Using Hand Spans","Measuring Length Using Metres"]],
      [2, "Mathematical Activities", "Measurement", "Mass", ["Comparing Heavier Than","Comparing Lighter Than","Comparing Same As"]],
      [2, "Mathematical Activities", "Measurement", "Capacity", ["Measuring Liquid Using Smaller Containers","Comparing How Much Liquid Containers Hold"]],
      [2, "Mathematical Activities", "Measurement", "Time", ["Reading Time by the Hour","Reading Time by the Half-Hour","Using Analogue Clocks","Using Digital Clocks","Identifying Days of the Week"]],
      [2, "Mathematical Activities", "Measurement", "Money", ["Recognizing Kenyan Coins up to Ksh 100","Recognizing Kenyan Notes up to Ksh 100","Simple Shopping Simulations"]],
      [2, "Mathematical Activities", "Geometry", "Shapes", ["Recognizing Rectangles","Recognizing Squares","Recognizing Circles","Recognizing Triangles","Drawing Basic Shapes","Making Patterns with Shapes"]],
      [2, "English Language Activities", "Listening and Speaking", "Pronunciation", ["Pronouncing Sounds Correctly","Pronouncing Words Correctly"]],
      [2, "English Language Activities", "Listening and Speaking", "Listening Comprehension", ["Listening to Short Stories","Answering Questions from Short Stories"]],
      [2, "English Language Activities", "Listening and Speaking", "Polite Language", ["Using Please and Thank You","Using Excuse Me","Following Two-Step Instructions","Following Three-Step Instructions"]],
      [2, "English Language Activities", "Reading", "Phonics", ["Blending Letter Sounds","Reading Words with Clusters: cl Words","Reading Words with Clusters: br Words","Reading Words with Clusters: st Words"]],
      [2, "English Language Activities", "Reading", "Sight Words", ["Recognizing Common High-Frequency Words"]],
      [2, "English Language Activities", "Reading", "Fluency", ["Reading Short Paragraphs Aloud","Reading Clearly and Smoothly"]],
      [2, "English Language Activities", "Reading", "Comprehension", ["Understanding Simple Stories","Identifying Characters in Stories","Identifying Events in Stories"]],
      [2, "English Language Activities", "Language Structures and Grammar", "Nouns", ["Proper Nouns","Common Nouns","Singular Nouns","Plural Nouns Using -s","Plural Nouns Using -es"]],
      [2, "English Language Activities", "Language Structures and Grammar", "Pronouns and Tense", ["Pronouns: I You He She It We They","Present Continuous Tense Using -ing","Articles: a an the","Prepositions: in on under behind"]],
      [2, "English Language Activities", "Writing", "Handwriting", ["Formation of Uppercase Letters","Formation of Lowercase Letters"]],
      [2, "English Language Activities", "Writing", "Guided Writing", ["Completing Sentences","Writing Short Compositions of 3–5 Sentences","Spelling Common Vocabulary Words"]],
      [2, "Kiswahili Language Activities", "Kusikiliza na Kuzungumza", "Matamshi", ["Matamshi Bora ya Sauti","Matamshi Bora ya Maneno"]],
      [2, "Kiswahili Language Activities", "Kusikiliza na Kuzungumza", "Maamkizi na Adabu", ["Shikamoo na Marahaba","Tafadhali Asante Samahani","Kusikiliza Hadithi","Kujibu Maswali kwa Ufasaha"]],
      [2, "Kiswahili Language Activities", "Kusoma", "Kusoma Silabi na Maneno", ["Kusoma Silabi","Kuunda Maneno","Kusoma Vifungu Vifupi kwa Sauti"]],
      [2, "Kiswahili Language Activities", "Kusoma", "Ufahamu", ["Kusoma kwa Ufasaha","Ufahamu wa Kisa","Ufahamu wa Hadithi Iliyosomwa"]],
      [2, "Kiswahili Language Activities", "Sarufi", "Ngeli", ["Ngeli ya A-Wa: Mtu-Watu","Ngeli ya KI-VI: Kiti-Viti","Ngeli ya LI-YA","Ngeli ya I-ZI"]],
      [2, "Kiswahili Language Activities", "Sarufi", "Viashiria na Vishirikishi", ["Viashiria: Huyu Wale Hiki Hivi","Vishirikishi: Huyu ni Mwalimu"]],
      [2, "Kiswahili Language Activities", "Sarufi", "Wakati", ["Wakati Uliopo: -na-","Wakati Uliopita: -li-","Wakati Ujao: -ta-"]],
      [2, "Kiswahili Language Activities", "Kuandika", "Mwandiko", ["Mwandiko Nadhifu wa Herufi","Mwandiko Nadhifu wa Maneno","Kujaza Pengo","Kukamilisha Sentensi"]],
      [2, "Kiswahili Language Activities", "Kuandika", "Insha", ["Kuandika Insha Fupi za Kuongozwa","Kuandika Sentensi Tatu hadi Tano"]],
      [2, "Environmental Activities", "Weather and the Environment", "Weather Conditions", ["Sunny Weather","Rainy Weather","Windy Weather","Cloudy Weather","Observing Weather","Tracking Weather"]],
      [2, "Environmental Activities", "Weather and the Environment", "Weather Symbols", ["Drawing Weather Symbols","Using Charts to Record Weekly Weather"]],
      [2, "Environmental Activities", "Weather and the Environment", "Effects of Weather", ["Choosing Appropriate Clothing for Weather","Choosing Appropriate Activities for Weather"]],
      [2, "Environmental Activities", "Natural Environment and Physical Features", "Physical Features", ["Hills","Rivers","Forests","Valleys","Local Landforms"]],
      [2, "Environmental Activities", "Natural Environment and Physical Features", "Plants", ["Common Trees","Common Flowers","Basic Care for Plants"]],
      [2, "Environmental Activities", "Natural Environment and Physical Features", "Animals", ["Domestic Animals","Wild Animals","Animal Safety"]],
      [2, "Environmental Activities", "Social Environment and Resources", "School Community", ["Headteacher","Teachers","Cleaners","Guards","Roles of People at School"]],
      [2, "Environmental Activities", "Social Environment and Resources", "National Flag", ["Colours of the Kenyan Flag","Meaning of the Kenyan Flag Colours","Respect During Flag-Raising Ceremonies"]],
      [2, "Environmental Activities", "Social Environment and Resources", "Child Rights", ["Right to Food","Right to Education","Right to Shelter","Family Responsibilities","Personal Responsibilities"]],
      [2, "Hygiene and Nutrition Activities", "Health Practices and Personal Hygiene", "Care of Body Parts", ["Cleaning Teeth","Preventing Cavities","Washing Hands at Critical Times","Hair Care"]],
      [2, "Hygiene and Nutrition Activities", "Health Practices and Personal Hygiene", "Personal Items", ["Toothbrushes","Combs","Handkerchiefs","Items That Should Not Be Shared"]],
      [2, "Hygiene and Nutrition Activities", "Food and Nutrition", "Daily Meals", ["Breakfast","Lunch","Supper","Components of a Healthy Meal"]],
      [2, "Hygiene and Nutrition Activities", "Food and Nutrition", "Good Eating Habits", ["Chewing Properly","Washing Fruits Before Eating","Avoiding Talking with Food in Mouth"]],
      [2, "Hygiene and Nutrition Activities", "Food and Nutrition", "Food Safety", ["Protecting Food from Dirt","Protecting Food from Flies","Proper Food Storage"]],
      [2, "Hygiene and Nutrition Activities", "Medicine Safety and Common Illnesses", "Common Illnesses", ["Coughs","Colds","Stomach Aches","Recognizing Signs of Common Ailments"]],
      [2, "Hygiene and Nutrition Activities", "Medicine Safety and Common Illnesses", "Safe Use of Medicine", ["Following Instructions from Adults","Following Instructions from Doctors","Dangers of Taking Unknown Medicine"]],
      [2, "Movement Activities", "Locomotor and Non-Locomotor Skills", "Locomotor Movements", ["Walking","Running","Skipping","Galloping","Leaping"]],
      [2, "Movement Activities", "Locomotor and Non-Locomotor Skills", "Non-Locomotor Movements", ["Bending","Twisting","Stretching","Balancing on Different Body Parts"]],
      [2, "Movement Activities", "Ball Properties and Games", "Handling Objects", ["Rolling Balls","Throwing Balls","Catching Balls","Kicking Balls","Using Beanbags"]],
      [2, "Movement Activities", "Ball Properties and Games", "Chasing Games", ["Simple Field Games","Tracking Space","Changing Direction Safely","Non-Contact Games"]],
      [2, "Movement Activities", "Rhythmic Movements and Gymnastics", "Simple Gymnastics", ["Egg Rolls","Forward Rolls","Safe Movement on Mats"]],
      [2, "Movement Activities", "Rhythmic Movements and Gymnastics", "Rhythmic Movements", ["Moving Body Parts with Music","Moving with Drums","Moving with Clapping Beats"]],

      // GRADE 5
      [5, "Mathematics", "Numbers", "Whole Numbers", ["Counting Reading and Writing Numbers up to 1,000,000","Identifying Place Value up to 1,000,000","Rounding Off to Nearest Thousand"]],
      [5, "Mathematics", "Numbers", "Divisibility Tests", ["Testing Divisibility by 2","Testing Divisibility by 5","Testing Divisibility by 10"]],
      [5, "Mathematics", "Numbers", "Factors and Multiples", ["Finding Factors of Numbers","Finding Multiples of Numbers","Finding GCD of Two Numbers","Finding LCM of Two Numbers"]],
      [5, "Mathematics", "Numbers", "Fractions", ["Comparing Proper Fractions","Ordering Proper Fractions","Adding Proper Fractions","Subtracting Proper Fractions","Working with Mixed Fractions"]],
      [5, "Mathematics", "Numbers", "Decimals", ["Decimal Place Value up to Thousandths","Ordering Decimals","Adding Decimals","Subtracting Decimals"]],
      [5, "Mathematics", "Numbers", "Percentages", ["Converting Fractions to Percentages","Converting Decimals to Percentages","Converting Percentages to Fractions and Decimals"]],
      [5, "Mathematics", "Measurement", "Length", ["Measuring Length in Kilometres","Converting Kilometres to Metres","Converting Metres to Centimetres"]],
      [5, "Mathematics", "Measurement", "Area", ["Area of Squares","Area of Rectangles"]],
      [5, "Mathematics", "Measurement", "Volume and Capacity", ["Volume Using Unit Cubes","Working with Litres","Working with Millilitres","Converting Litres and Millilitres"]],
      [5, "Mathematics", "Measurement", "Mass", ["Converting Tonnes to Kilograms","Converting Kilograms to Grams"]],
      [5, "Mathematics", "Measurement", "Time", ["Reading Time","Converting Hours to Minutes","Converting Minutes to Seconds","Using the 24-Hour Clock"]],
      [5, "Mathematics", "Measurement", "Money", ["Calculating Buying and Selling Price","Calculating Profit","Calculating Loss","Simple Transactions up to Ksh 10,000"]],
      [5, "Mathematics", "Geometry and Algebra", "Angles", ["Identifying Acute Angles","Identifying Obtuse Angles","Identifying Right Angles","Measuring Angles with Protractor","Drawing Angles with Protractor"]],
      [5, "Mathematics", "Geometry and Algebra", "Algebraic Expressions", ["Understanding Simple Variables","Simplifying Algebraic Expressions","Solving Simple Equations","Solving Word Problems with One Variable"]],
      [5, "English", "Listening and Speaking", "Active Listening", ["Active Listening During Talks","Taking Notes","Using Polite Markers","Presentation Etiquette","Pronunciation of Consonant Clusters","Word Stress Patterns"]],
      [5, "English", "Reading", "Intensive Reading", ["Reading Short Passages","Inferring Meaning","Deducing Cause and Effect","Identifying Main Ideas"]],
      [5, "English", "Reading", "Extensive Reading", ["Reading Storybooks for Pleasure","Using the Library","Using Digital Tools for Reading"]],
      [5, "English", "Language Structures and Grammar", "Nouns and Pronouns", ["Collective Nouns","Abstract Nouns","Uncountable Nouns","Possessive Pronouns"]],
      [5, "English", "Language Structures and Grammar", "Tenses and Adverbs", ["Past Continuous Tense","Present Perfect Tense","Degrees of Comparison","Adverbs of Time","Adverbs of Place","Adverbs of Manner"]],
      [5, "English", "Writing", "Functional Writing", ["Writing Friendly Letters","Writing Lists","Writing Invitations"]],
      [5, "English", "Writing", "Creative Composition", ["Writing Structured Narratives","Creating Beginning Middle and End","Writing Compositions up to 150 Words"]],
      [5, "Kiswahili", "Kusikiliza na Kuzungumza", "Kusikiliza kwa Makini", ["Kusikiliza kwa Makini","Kutoa Muhtasari wa Taarifa","Mjadala","Mazungumzo kuhusu Usalama","Mazungumzo kuhusu Afya"]],
      [5, "Kiswahili", "Kusikiliza na Kuzungumza", "Methali na Vitendawili", ["Kutumia Methali","Kutumia Vitendawili","Kutumia Nahau"]],
      [5, "Kiswahili", "Kusoma", "Kusoma kwa Sauti", ["Kusoma kwa Sauti na Ufasaha","Kuzingatia Alama za Uandishi"]],
      [5, "Kiswahili", "Kusoma", "Kusoma kwa Kina", ["Kusoma kwa Kina","Kujibu Maswali ya Ufahamu","Kuchanganua Taarifa"]],
      [5, "Kiswahili", "Sarufi", "Ngeli", ["Ngeli ya U-I","Ngeli ya LI-YA","Ngeli ya YA-YA","Ngeli ya I-ZI"]],
      [5, "Kiswahili", "Sarufi", "Viwakilishi", ["Viwakilishi vya Nafsi","Viunganishi vya Sentensi"]],
      [5, "Kiswahili", "Sarufi", "Wakati na Hali", ["Wakati Uliopo","Wakati Uliopita","Wakati Ujao","Hali ya Timilifu"]],
      [5, "Kiswahili", "Kuandika", "Barua na Tawasifu", ["Kuandika Barua za Kirafiki","Kuandika Tawasifu Fupi"]],
      [5, "Kiswahili", "Kuandika", "Insha", ["Kuandika Insha za Kubuni","Mtiririko wa Mawazo","Kuandika Insha za Maneno 100-150"]],
      [5, "Science and Technology", "Living Things", "Plants", ["Flowering Plants","Non-Flowering Plants"]],
      [5, "Science and Technology", "Living Things", "Fungi", ["Mushrooms","Mould","Yeast","Economic Importance of Fungi","Safety Precautions"]],
      [5, "Science and Technology", "Living Things", "Animals", ["Vertebrates","Mammals","Birds","Reptiles","Amphibians","Fish","Characteristics of Vertebrate Groups"]],
      [5, "Science and Technology", "Living Things", "Human Body Systems", ["Digestive System","Functions of Teeth","Common Digestive Disorders"]],
      [5, "Science and Technology", "Environment", "Pollution", ["Air Pollution","Water Pollution","Soil Pollution","Effects of Pollution","Pollution Control"]],
      [5, "Science and Technology", "Environment", "Waste Management", ["Reduce","Reuse","Recycle","Practicing the 3Rs"]],
      [5, "Science and Technology", "Matter and Force", "Properties of Matter", ["Solids","Liquids","Gases","Effects of Heating","Effects of Cooling"]],
      [5, "Science and Technology", "Matter and Force", "Force and Energy", ["Friction","Advantages of Friction","Disadvantages of Friction","Reducing Friction","Increasing Friction"]],
      [5, "Science and Technology", "Digital Technology", "Computer Basics", ["External Parts of a Computer","Basic Typing","Word Processing","Saving Files Securely"]],
      [5, "Agriculture and Nutrition", "Conservation of Resources", "Soil Conservation", ["Controlling Soil Erosion","Using Trash Lines","Using Cover Crops","Constructing Barriers"]],
      [5, "Agriculture and Nutrition", "Conservation of Resources", "Soil Improvement", ["Preparing Organic Compost Manure","Applying Organic Compost Manure"]],
      [5, "Agriculture and Nutrition", "Conservation of Resources", "Water Conservation", ["Harvesting Rainwater Safely","Basic Drip Irrigation Models"]],
      [5, "Agriculture and Nutrition", "Food Production Processes", "Growing Crops", ["Sowing Climbing Fruit Plants","Managing Climbing Fruit Plants","Using Trellises and Supports"]],
      [5, "Agriculture and Nutrition", "Food Production Processes", "Domestic Animals", ["Uses of Rabbits","Uses of Poultry","Uses of Bees","Basic Feeding Requirements"]],
      [5, "Agriculture and Nutrition", "Food Production Processes", "Preservation", ["Safe Storage of Cereals","Safe Storage of Pulses","Preventing Post-Harvest Losses"]],
      [5, "Agriculture and Nutrition", "Hygiene and Food Preparation", "Food Nutrients", ["Macronutrients","Micronutrients","Nutritional Deficiency Diseases","Kwashiorkor","Marasmus"]],
      [5, "Agriculture and Nutrition", "Hygiene and Food Preparation", "Cooking Techniques", ["Dry Fat Frying","Preparing Pancakes or Chapati","Safe Deep Frying"]],
      [5, "Social Studies", "Physical Environment", "Maps", ["Reading Map Titles","Understanding Scale","Understanding Map Keys","Understanding Compass Rose"]],
      [5, "Social Studies", "Physical Environment", "Position and Size of Kenya", ["Neighbouring Countries","Understanding Boundaries"]],
      [5, "Social Studies", "Physical Environment", "Physical Features", ["The Rift Valley","Mountains","Plains","Drainage Basins"]],
      [5, "Social Studies", "Physical Environment", "Weather and Climate", ["Difference Between Weather and Climate","Tracking Rainfall Maps","Tracking Temperature Maps"]],
      [5, "Social Studies", "People and Culture", "Language Groups", ["Bantu Groups","Nilotic Groups","Cushitic Groups"]],
      [5, "Social Studies", "People and Culture", "Traditional Education", ["Social Values in Traditional Societies","Survival Skills","Morals","Learning Before Formal Schools"]],
      [5, "Social Studies", "Governance and Citizenship", "School Administration", ["Board of Management","Headteacher","Student Council","Roles and Responsibilities"]],
      [5, "Social Studies", "Governance and Citizenship", "Built Environments", ["Historic Sites","Monuments in Kenya","Economic Value of Protected Sites"]],
      [5, "Creative Arts", "Creating and Execution", "Visual Arts", ["Still Life Drawing","Cross-Hatching","Smudging for 3D Effects","Crayon Etching","Basics of Graphic Design"]],
      [5, "Creative Arts", "Creating and Execution", "Music Composition", ["Creating Rhythm Beats","Clapping Patterns","Body Percussion","Writing Simple Melodies"]],
      [5, "Creative Arts", "Creating and Execution", "Physical Sports Performance", ["Soccer Passing","Soccer Dribbling","Soccer Shooting","Rounders Skills"]],
      [5, "Creative Arts", "Performance and Display", "Performing Arts", ["Kenyan Folk Dances","Playing Wind Instruments","Descant Recorder","Handmade Puppets","Puppet Manipulation"]],
      [5, "Creative Arts", "Performance and Display", "Athletics", ["Sprint Racing Starts","Relay Races","Visual Baton Exchange"]],
      [5, "Creative Arts", "Appreciation", "Critique", ["Observing Creative Works","Discussing Visual Elements","Discussing Musical Elements","Giving Feedback on Self-Made Work","Giving Feedback on Peer-Made Work"]],
    ];

    let subjects = 0, subStrands = 0, themes = 0, quests = 0, lessons = 0;

    for (const [grade, subject, strand, subStrand, topics] of curriculum) {
      // Insert subject
      const subjectSlug = `g${grade}-${subject.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      await client.query(
        `INSERT INTO "Subject" (name, slug, grade) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`,
        [subject, subjectSlug, grade]
      );
      subjects++;

      // Insert sub-strand
      const subStrandSlug = `${subjectSlug}-${subStrand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      await client.query(
        `INSERT INTO "SubStrand" (name, slug, "strandName") VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`,
        [subStrand, subStrandSlug, strand]
      );
      subStrands++;

      // Create one theme per sub-strand
      const themeSlug = `theme-${subStrandSlug}`;
      const themeRes = await client.query(
        `INSERT INTO "Theme" (guild_id, title, slug, description, grade, status) VALUES ($1, $2, $3, $4, $5, 'DRAFT') ON CONFLICT (slug) DO NOTHING RETURNING id`,
        [guildId, `${subStrand} Theme`, themeSlug, `Draft theme: ${subStrand}`, grade]
      );
      themes++;

      // Create one quest per theme
      const questSlug = `quest-${subStrandSlug}`;
      const questRes = await client.query(
        `INSERT INTO "Quest" (theme_id, title, slug, description, quest_type, order_index, xp_reward, status) VALUES ($1, $2, $3, $4, 'MAIN', 1, '{"base": 50}', 'DRAFT') ON CONFLICT (slug) DO NOTHING RETURNING id`,
        [themeRes.rows[0]?.id, `${subStrand} Quest`, questSlug, `Draft quest: ${subStrand}`]
      );
      quests++;

      // Create lessons for each topic
      const questId = questRes.rows[0]?.id;
      if (questId) {
        for (const topic of topics) {
          const lessonSlug = `lesson-${subStrandSlug}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
          const contentBlocks = JSON.stringify({
            grade, subject, strand, subStrand, theme: subStrand,
            learningOutcomes: "To be populated with CBC/CBE-aligned learning outcomes.",
            parentGuide: "Draft placeholder. Parent guidance will be added after curriculum review.",
            learnerActivity: "Draft placeholder. Learner activity will be added after curriculum review.",
            assessment: "Draft placeholder. Assessment task will be added after curriculum review.",
            materials: "Locally available materials to be added.",
            competencies: ["Communication and Collaboration", "Critical Thinking and Problem Solving"],
            values: ["Respect", "Responsibility"],
            status: "draft", version: 1,
          });

          await client.query(
            `INSERT INTO "Lesson" (quest_id, title, slug, description, content_blocks, xp_reward, order_index, status) VALUES ($1, $2, $3, $4, $5::jsonb, '{"base": 50}', 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING`,
            [questId, topic, lessonSlug, "To be populated with CBC/CBE-aligned learning outcomes.", contentBlocks]
          );
          lessons++;
        }
      }
    }

    await client.end();

    return NextResponse.json({
      success: true,
      message: "Curriculum seeded successfully",
      results: {
        subjects,
        subStrands,
        themes,
        quests,
        lessons,
      },
    });
  } catch (err: any) {
    console.error("[SEED_CURRICULUM] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to seed curriculum" }, { status: 500 });
  }
}, { roles: ["ADMIN"] });
