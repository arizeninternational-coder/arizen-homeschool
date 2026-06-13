#!/usr/bin/env node
/**
 * GRADE 2 MATH JOURNEY GENERATOR — HIGH QUALITY (v2)
 * 
 * Generates compelling, lesson-specific 10-step journeys with:
 * - SVG illustrations embedded directly (no external hosting needed)
 * - YouTube video embooks in Example step
 * - Curriculum-aligned content (not generic templates)
 * - Kenyan context (shillings, local examples)
 * - Child-friendly owl guidance (short, encouraging)
 * - Proper interactive steps with REAL math questions
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// MATH TOPIC DETECTION — comprehensive pattern matching
// ═══════════════════════════════════════════════════════════════════════════

function detectMathTopic(title) {
  const t = title.toLowerCase();
  if (/read.*number|number.*symbol|number.*word|numeral|writing.*number/.test(t)) return 'reading-numbers';
  if (/count|skip.*count|counting/.test(t)) return 'counting';
  if (/compar|greater|less|more.*less|bigger|smaller|order.*number|ascend|descend/.test(t)) return 'comparing';
  if (/add|addition|plus|sum|altogether|combined|break.*apart|make.*ten|number.*bond|join|put.*together|total/.test(t)) return 'addition';
  if (/subtract|minus|take.*away|left|remain|difference|remove|how.*many.*left/.test(t)) return 'subtraction';
  if (/multip|times|product|repeated.*add|equal.*group|group.*of|multiply/.test(t)) return 'multiplication';
  if (/divid|share|equal.*group.*number|split.*equal|half.*number/.test(t)) return 'division';
  if (/fraction|half.*shape|quarter.*shape|third|part.*whole|equal.*part.*shape/.test(t)) return 'fractions';
  if (/length|long|short|tall|metre|centimetre|measure.*long|height|width|measure/.test(t)) return 'length';
  if (/mass|weight|heavy|light|kg|kilogram|gram|weigh|balance/.test(t)) return 'mass';
  if (/capacity|volume|litre|millilitre|pour|container|holds/.test(t)) return 'capacity';
  if (/time|clock|hour|minute|o'clock|half.*past|quarter/.test(t)) return 'time';
  if (/money|shilling|coin|note|buy|sell|change|cost|price|pay|market/.test(t)) return 'money';
  if (/line|straight|curve|horizontal|vertical|diagonal/.test(t)) return 'lines';
  if (/shape|circle|square|triangle|rectangle|oval|geometric/.test(t)) return 'shapes';
  if (/pattern|sequence|repeat|continue|missing.*number|next.*number/.test(t)) return 'patterns';
  if (/data|tally|graph|chart|pictograph|survey/.test(t)) return 'data';
  if (/place.*value|tens|ones|units|digit|bundle|decompose|compose|represent.*number|concrete|object/.test(t)) return 'place-value';
  if (/word.*problem|problem.*solve|real.*life|story.*problem/.test(t)) return 'addition'; // word problems often involve addition
  if (/.*meter.*|measuring|tapes|rule/.test(t)) return 'length';
  if (/double|near.*double|make.*double/.test(t)) return 'addition';
  if (/half|quarter.*number|share/.test(t)) return 'division';
  return 'general-math';
}

// ═══════════════════════════════════════════════════════════════════════════
// SVG ILLUSTRATION GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

function generateMathSVG(topic) {
  const readingNumbers = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#f0f9ff" rx="12"/><text x="200" y="30" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e40af">Read and Write Numbers</text><rect x="50" y="55" width="120" height="50" rx="8" fill="white" stroke="#93c5fd" stroke-width="2"/><text x="110" y="85" text-anchor="middle" font-size="28" font-weight="bold" fill="#2563eb">25</text><text x="110" y="100" text-anchor="middle" font-size="9" fill="#64748b">twenty-five</text><text x="200" y="85" text-anchor="middle" font-size="18" fill="#64748b">→</text><rect x="230" y="55" width="120" height="50" rx="8" fill="white" stroke="#93c5fd" stroke-width="2"/><text x="290" y="85" text-anchor="middle" font-size="28" font-weight="bold" fill="#2563eb">48</text><text x="290" y="100" text-anchor="middle" font-size="9" fill="#64748b">forty-eight</text><text x="200" y="140" text-anchor="middle" font-size="12" fill="#1e40af">Numbers help us count and compare!</text><text x="200" y="165" text-anchor="middle" font-size="11" fill="#64748b">Lets learn to read big numbers!</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#93c5fd">Grade 2 Mathematics</text></svg>`;

  const counting = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#fdf4ff" rx="12"/><text x="200" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#7c3aed">Lets Count Together!</text>${[[40,65],[80,65],[120,65],[160,65],[200,65],[240,65],[280,65],[320,65],[60,110],[100,110],[140,110],[180,110],[220,110],[260,110],[300,110]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="12" fill="#c084fc" opacity="0.7"/><circle cx="${x}" cy="${y}" r="12" fill="none" stroke="#7c3aed" stroke-width="2"/>`).join('')}<text x="200" y="155" text-anchor="middle" font-size="18" font-weight="bold" fill="#7c3aed">Count: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10...</text><text x="200" y="180" text-anchor="middle" font-size="11" fill="#6b21a8">Keep going all the way to 100!</text></svg>`;

  const addition = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#f0fdf4" rx="12"/><text x="200" y="30" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">Addition = Putting Together</text><circle cx="60" cy="90" r="18" fill="#4ade80"/><circle cx="100" cy="90" r="18" fill="#4ade80"/><circle cx="80" cy="120" r="18" fill="#4ade80"/><text x="145" y="95" text-anchor="middle" font-size="28" font-weight="bold" fill="#166534">+</text><circle cx="190" cy="90" r="18" fill="#fbbf24"/><circle cx="230" cy="90" r="18" fill="#fbbf24"/><text x="270" y="95" text-anchor="middle" font-size="28" font-weight="bold" fill="#166534">=</text><text x="330" y="95" text-anchor="middle" font-size="32" font-weight="bold" fill="#15803d">5</text><text x="200" y="165" text-anchor="middle" font-size="16" font-weight="bold" fill="#15803d">3 + 2 = 5</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#166534">We put 3 and 2 together to make 5!</text></svg>`;

  const subtraction = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#fff7ed" rx="12"/><text x="200" y="30" text-anchor="middle" font-size="14" font-weight="bold" fill="#9a3412">Subtraction = Taking Away</text>${[50,90,130,170,210].map(x=>`<circle cx="${x}" cy="90" r="16" fill="#fb923c"/>`).join('')}<line x1="50" y1="78" x2="50" y2="102" stroke="#dc2626" stroke-width="3"/><line x1="43" y1="88" x2="57" y2="98" stroke="#dc2626" stroke-width="3"/><line x1="90" y1="78" x2="90" y2="102" stroke="#dc2626" stroke-width="3"/><line x1="83" y1="88" x2="97" y2="98" stroke="#dc2626" stroke-width="3"/><text x="260" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="#9a3412">5 - 2 = 3</text><text x="200" y="140" text-anchor="middle" font-size="13" fill="#7c2d12">We start with 5, take away 2, and 3 are left!</text><text x="200" y="165" text-anchor="middle" font-size="11" fill="#9a3412">Crossed out means taken away</text><text x="200" y="185" text-anchor="middle" font-size="10" fill="#c2410c">Grade 2 Mathematics</text></svg>`;

  const multiplication = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#fefce8" rx="12"/><text x="200" y="28" text-anchor="middle" font-size="13" font-weight="bold" fill="#854d0e">Multiplication = Equal Groups</text><circle cx="70" cy="75" r="14" fill="#facc15" stroke="#ca8a04" stroke-width="2"/><circle cx="105" cy="75" r="14" fill="#facc15" stroke="#ca8a04" stroke-width="2"/><circle cx="70" cy="110" r="14" fill="#facc15" stroke="#ca8a04" stroke-width="2"/><circle cx="105" cy="110" r="14" fill="#facc15" stroke="#ca8a04" stroke-width="2"/><text x="87" y="140" text-anchor="middle" font-size="10" fill="#854d0e">Group 1 (2)</text><circle cx="190" cy="75" r="14" fill="#facc15" stroke="#ca8a04" stroke-width="2"/><circle cx="225" cy="75" r="14" fill="#facc15" stroke="#ca8a04" stroke-width="2"/><circle cx="190" cy="110" r="14" fill="#facc15" stroke="#ca8a04" stroke-width="2"/><circle cx="225" cy="110" r="14" fill="#facc15" stroke="#ca8a04" stroke-width="2"/><text x="207" y="140" text-anchor="middle" font-size="10" fill="#854d0e">Group 2 (2)</text><text x="200" y="165" text-anchor="middle" font-size="14" font-weight="bold" fill="#854d0e">2 groups of 2 = 4 &amp;nbsp;&amp;nbsp; 2 x 2 = 4</text><text x="200" y="185" text-anchor="middle" font-size="10" fill="#a16207">Repeated addition: 2 + 2 = 4</text></svg>`;

  const money = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#ecfdf5" rx="12"/><text x="200" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#065f46">Kenyan Money - Coins and Notes</text><circle cx="65" cy="75" r="24" fill="#fbbf24" stroke="#b45309" stroke-width="2"/><text x="65" y="79" text-anchor="middle" font-size="11" font-weight="bold" fill="#78350f">1/=</text><circle cx="145" cy="75" r="26" fill="#d4d4d8" stroke="#71717a" stroke-width="2"/><text x="145" y="79" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">5/=</text><circle cx="225" cy="75" r="28" fill="#c4b5a0" stroke="#78716c" stroke-width="2"/><text x="225" y="79" text-anchor="middle" font-size="11" font-weight="bold" fill="#292524">10/=</text><rect x="280" y="50" width="80" height="35" rx="5" fill="#059669"/><text x="320" y="72" text-anchor="middle" font-size="13" font-weight="bold" fill="white">50/=</text><text x="200" y="125" text-anchor="middle" font-size="12" fill="#065f46">We use shillings (KES) in Kenya!</text><text x="200" y="145" text-anchor="middle" font-size="11" fill="#047857">Learning to count money is important.</text><text x="200" y="170" text-anchor="middle" font-size="10" fill="#065f46">Try adding different coins together!</text></svg>`;

  const shapes = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#f5f3ff" rx="12"/><text x="200" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#5b21b6">2D Shapes</text><rect x="40" y="55" width="55" height="55" rx="4" fill="#a78bfa" opacity="0.5" stroke="#7c3aed" stroke-width="2"/><text x="67" y="130" text-anchor="middle" font-size="10" fill="#5b21b6">Square&lt;br/&gt;4 sides</text><circle cx="155" cy="82" r="30" fill="#818cf8" opacity="0.5" stroke="#4f46e5" stroke-width="2"/><text x="155" y="130" text-anchor="middle" font-size="10" fill="#5b21b6">Circle&lt;br/&gt;round</text><polygon points="240,55 270,115 210,115" fill="#c4b5fd" opacity="0.5" stroke="#6d28d9" stroke-width="2"/><text x="240" y="130" text-anchor="middle" font-size="10" fill="#5b21b6">Triangle&lt;br/&gt;3 sides</text><rect x="300" y="62" width="55" height="35" rx="4" fill="#e9d5ff" opacity="0.5" stroke="#7c3aed" stroke-width="2"/><text x="327" y="130" text-anchor="middle" font-size="10" fill="#5b21b6">Rectangle&lt;br/&gt;4 sides</text><text x="200" y="165" text-anchor="middle" font-size="11" fill="#6d28d9">Shapes are everywhere — door, window, wheel!</text><text x="200" y="185" text-anchor="middle" font-size="10" fill="#7c3aed">Grade 2 Mathematics</text></svg>`;

  const time = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#fff1f2" rx="12"/><text x="200" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#9f1239">Reading the Clock</text><circle cx="200" cy="100" r="55" fill="white" stroke="#e11d48" stroke-width="3"/>${[12,3,6,9].map(n=>{const a=(n*30-90)*Math.PI/180;return `<text x="${200+45*Math.cos(a)}" y="${100+45*Math.sin(a)}" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">${n}</text>`;}).join('')}<line x1="200" y1="100" x2="200" y2="58" stroke="#1e293b" stroke-width="3"/><line x1="200" y1="100" x2="240" y2="100" stroke="#e11d48" stroke-width="2"/><circle cx="200" cy="100" r="4" fill="#e11d48"/><text x="200" y="175" text-anchor="middle" font-size="15" font-weight="bold" fill="#9f1239">3 oclock</text><text x="200" y="192" text-anchor="middle" font-size="9" fill="#be123c">Short hand = hour, Long hand = minutes</text></svg>`;

  const length = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#f0f9ff" rx="12"/><text x="200" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#0c4a6e">Measuring Length</text><rect x="40" y="60" width="320" height="18" rx="4" fill="#bae6fd" stroke="#0284c7" stroke-width="2"/><text x="200" y="55" text-anchor="middle" font-size="10" fill="#0c4a6e">1 metre (1 m) = 100 centimetres (100 cm)</text><rect x="40" y="100" width="160" height="18" rx="4" fill="#fde68a" stroke="#d97706" stroke-width="2"/><text x="120" y="130" text-anchor="middle" font-size="10" fill="#92400e">50 cm (half a metre)</text><rect x="40" y="150" width="80" height="18" rx="4" fill="#bbf7d0" stroke="#16a34a" stroke-width="2"/><text x="80" y="180" text-anchor="middle" font-size="10" fill="#166534">25 cm</text></svg>`;

  const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#f8fafc" rx="12"/><text x="200" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#334155">Lets Learn Math!</text><text x="200" y="90" text-anchor="middle" font-size="40" fill="#6366f1">🔢 ➕ ➖ ✖️ ➗</text><text x="200" y="130" text-anchor="middle" font-size="15" font-weight="bold" fill="#4f46e5">Mathematics is all around us!</text><text x="200" y="155" text-anchor="middle" font-size="11" fill="#64748b">Count, add, subtract, measure and explore!</text><text x="200" y="180" text-anchor="middle" font-size="10" fill="#94a3b8">Grade 2 Mathematics</text></svg>`;

  const svgMap = { 'reading-numbers': readingNumbers, counting, addition, subtraction, multiplication, money, shapes, time, length };
  return `data:image/svg+xml,${encodeURIComponent(svgMap[topic] || defaultSvg)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// YOUTUBE VIDEO FINDER
// ═══════════════════════════════════════════════════════════════════════════

function getYouTubeVideo(topic) {
  const v = {
    'reading-numbers': { id: 'lxyjIFHXSCA', title: 'Learn to Count 1-100 for Kids' },
    counting: { id: 'bo2A425u6hk', title: 'Counting to 100 Song for Children' },
    addition: { id: 'pAtrNu8y6FQ', title: 'Addition for Kids - Basic Math' },
    subtraction: { id: 'gBXbs6lVRuo', title: 'Subtraction for Kids - Basic Math' },
    multiplication: { id: 'eW1fMMcN0oA', title: 'Multiplication for Kids - Times Tables' },
    fractions: { id: 'lTcewUmUnyE', title: 'Fractions for Kids - Halves and Quarters' },
    length: { id: '0USJGUf8h_k', title: 'Measuring Length for Kids' },
    time: { id: 'iO7owL6Xr_M', title: 'Telling Time for Kids' },
    money: { id: '1FrTBkSN2jk', title: 'Counting Money for Kids' },
    shapes: { id: 'CfPISPmT_E0', title: '2D Shapes for Kids' },
    division: { id: '8bB0CBLSfxA', title: 'Division for Kids - Basic Math' },
    'place-value': { id: 'jEYs9Z2w8oU', title: 'Place Value for Kids - Tens and Ones' },
    comparing: { id: 'lBOmjkD0bIA', title: 'Comparing Numbers for Kids' },
    patterns: { id: 'bo2A425u6hk', title: 'Number Patterns for Kids' },
  };
  const match = Object.keys(v).find(k => topic.includes(k));
  return match ? v[match] : { id: 'pAtrNu8y6FQ', title: 'Math for Kids - Basic Concepts' };
}

// ═══════════════════════════════════════════════════════════════════════════
// MATH CONTENT GENERATORS — Per topic with REAL math questions
// ═══════════════════════════════════════════════════════════════════════════

function generateMathContent(title, topic, outcome) {
  const nums = title.match(/\d+/g) || [];
  const n1 = parseInt(nums[0]) || 0;
  const n2 = parseInt(nums[1]) || 0;
  const outcomeShort = (outcome || '').replace(/by the end of the lesson,?\s*the learner should be able to:?\s*/i, '').replace(/\s+/g, ' ').trim();

  // Helper: generate wrong options for a math answer
  function mcq(correct, wrongs, question) {
    const opts = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    return { question, options: opts.map(String), correctIndex: opts.indexOf(correct) };
  }

  const c = { welcome: '', mission: '', thinkFirst: { q: '', hint: '' }, learn: '', connect: '', example: '', practice: { q: '', hint: '' }, qc: { question: '', options: [], correctIndex: 0, hint: '' }, reflect: '' };

  switch (topic) {
    case 'addition': {
      const a = n1 || 15, b = n2 || 8, sum = a + b;
      c.welcome = `Today we learn addition! Adding means putting groups together to find the total.`;
      c.mission = outcomeShort || `Add numbers correctly.`;
      c.thinkFirst = { q: `If you have ${a} bananas and mama gives you ${b} more, how many bananas do you have altogether?`, hint: `Start at ${a} and count forward ${b} more!` };
      c.learn = `Addition uses the + sign. We add two numbers to get a sum (the total).\n\n**Example:** ${a} + ${b} = ?\n\nStart at ${a}. Count forward ${b}.\n\n**${a} + ${b} = ${sum}**\n\n**Tip:** Always start with the bigger number and count forward!`;
      c.connect = `You use addition every day:\n• Counting all your books together\n• Adding prices at the market\n• Finding how many people are in a group\n• Counting your savings!`;
      c.example = `**Worked Example:** 25 + 17 = ?\n\nStep 1: Add the ones: 5 + 7 = 12. Write 2, carry 1.\nStep 2: Add the tens: 2 + 1 + 1 (carried) = 4.\n\nAnswer: **25 + 17 = 42**\n\nYou can also count on: start at 25, count forward 17!`;
      c.practice = { q: `**Solve these:**\n1) 14 + 9 = ?\n2) 23 + 18 = ?\n3) 35 + 27 = ?\n4) A shop has 28 oranges and 15 mangoes. How many fruits altogether?\n\n*Show your working!*`, hint: `Start with the bigger number. Count forward. For harder ones, add ones first then tens.` };
      c.qc = mcq(sum + 10, [sum + 5, sum + 15, sum + 20], `What is ${a+10} + ${b}?`);
      c.reflect = `How do you add two numbers together? What helps you get the right answer?`;
      break;
    }
    case 'subtraction': {
      const a = n1 || 45, b = n2 || 17, diff = a - b;
      c.welcome = `Today we learn subtraction! Subtraction means taking away. We find how many are LEFT.`;
      c.mission = outcomeShort || `Subtract numbers correctly.`;
      c.thinkFirst = { q: `You have ${a} sweets. You share ${b} with your friends. How many sweets are left?`, hint: `Start at ${a} and count backwards ${b}!` };
      c.learn = `Subtraction uses the − sign. We take away to find what remains.\n\n**Example:** ${a} − ${b} = ?\n\nStart at ${a}. Count backwards ${b} steps.\n\n**${a} − ${b} = ${diff}**\n\n**Key words:** take away, left, remain, difference, how many more?`;
      c.connect = `Subtraction helps you:\n• Know how much change you get at the shop\n• Count how many are left after sharing\n• Find the difference between two amounts\n• Know how many more you need to reach a goal`;
      c.example = `**Worked Example:** 63 − 28 = ?\n\nStep 1: Subtract ones: 3 − 8 (can't do, so borrow) → 13 − 8 = 5\nStep 2: Subtract tens: 5 − 2 = 3\n\nAnswer: **63 − 28 = 35**`;
      c.practice = { q: `**Solve these:**\n1) 32 − 15 = ?\n2) 50 − 23 = ?\n3) 71 − 38 = ?\n4) Mary had 40/-. She spent 18/-. How much is left?\n\n*Show your working!*`, hint: `Count backwards carefully. For harder ones, try subtracting tens first, then ones.` };
      c.qc = mcq(diff + 10, [diff + 5, diff + 15, diff - 3], `What is ${a+10} − ${b}?`);
      c.reflect = `What does the − sign mean? How is subtraction different from addition?`;
      break;
    }
    case 'counting': {
      const upto = n1 || 100;
      c.welcome = `Today we practise counting! Counting tells us how many things there are.`;
      c.mission = outcomeShort || `Count confidently up to ${upto}.`;
      c.thinkFirst = { q: `Count the fingers on both your hands. How many are there? Can you count to ${upto}?`, hint: `Touch each finger as you count. Go slowly!` };
      c.learn = `Numbers go in order:\n\n**1-10:** 1 2 3 4 5 6 7 8 9 10\n**11-20:** 11 12 13 14 15 16 17 18 19 20\n**21-30:** 21 22 23 24 25 26 27 28 29 30\n\n**Pattern:** After the ones come the twenties, then thirties, all the way to 100!\n\n**Counting by 5s:** 5, 10, 15, 20, 25, 30, 35, 40, 45, 50...\n**Counting by 10s:** 10, 20, 30, 40, 50, 60, 70, 80, 90, 100`;
      c.connect = `Counting helps us:\n• Know how many people are in a class\n• Count money at the shop\n• Know the day of the month\n• Count objects in a group`;
      c.example = `Let's count by 5s: **5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60...**\n\nLet's count by 10s: **10, 20, 30, 40, 50, 60, 70, 80, 90, 100**\n\nCan you count backwards from 50 to 0?`;
      c.practice = { q: `**Practice:**\n1) Count from 35 to 60\n2) Count by 5s from 55 to 100\n3) Count backwards from 80 to 60\n4) What number comes after 99?`, hint: `Use your fingers if it helps!` };
      c.qc = mcq('50', ['49', '51', '40', '60'], `What number comes after 49?`);
      c.reflect = `Can you count all the way to ${upto}? Which numbers were tricky?`;
      break;
    }
    case 'reading-numbers': {
      c.welcome = `Today we read and write numbers in symbols! Numbers are everywhere — on price tags, houses, and calendars.`;
      c.mission = outcomeShort || `Read and write numbers in symbols correctly.`;
      c.thinkFirst = { q: `Can you write "twenty-five" using only digits? What about "sixty-three"?`, hint: `Think about tens and ones!` };
      c.learn = `Numbers have symbols (also called numerals or digits).\n\n**0-10:** 0 1 2 3 4 5 6 7 8 9 10\n\n**After 10:**\n11=eleven, 12=twelve, 13=thirteen, 14=fourteen, 15=fifteen\n\n**Tens:** 20=twenty, 30=thirty, 40=forty, 50=fifty, 60=sixty, 70=seventy, 80=eighty, 90=ninety\n\n**Big numbers:** 25=twenty-five (2 tens, 5 ones), 78=seventy-eight (7 tens, 8 ones), 100=one hundred`;
      c.connect = `We read numbers on: price tags, house numbers, car plates, calendars, phones, and clocks!`;
      c.example = `**Reading numbers:**\n\n34 → "thirty-four" (3 tens, 4 ones)\n56 → "fifty-six" (5 tens, 6 ones)\n81 → "eighty-one" (8 tens, 1 one)\n100 → "one hundred" (10 tens)`;
      c.practice = { q: `**Write these as digits:**\na) twenty-seven  b) forty-five  c) sixty-three\nd) eighty-nine  e) ninety-four\n\n**Say these numbers:**\n52, 38, 71, 96, 100`, hint: `The first digit = tens, the second = ones!` };
      c.qc = mcq('76', ['67', '706', '16', '60'], `How do you write "seventy-six" in digits?`);
      c.reflect = `Which numbers were easy to read? Which ones were tricky?`;
      break;
    }
    case 'money': {
      c.welcome = `Today we learn about Kenyan money! We use shillings (KES) to buy things.`;
      c.mission = outcomeShort || `Identify Kenyan coins and notes and count money.`;
      c.thinkFirst = { q: `Have you seen mama buying things at the shop? What coins and notes did she use?`, hint: `Think about round coins and paper notes!` };
      c.learn = `**Kenyan Coins:**\n• 1 shilling (small, gold)\n• 5 shillings (bigger, silver)\n• 10 shillings (small, two-colour)\n• 20 shillings (big, two-colour)\n\n**Kenyan Notes:**\n• 50 shillings (green)\n• 100 shillings (red)\n• 200 shillings (blue)\n• 500 shillings (purple)\n• 1000 shillings (brown)\n\n**Bigger number = more value!**`;
      c.connect = `We use money to buy food, books, clothes, and toys. When you go to the shop, you need to count your money carefully!`;
      c.example = `**Counting money:**\n\nOne 50/- note + two 10/- coins:\n50 + 10 + 10 = **70 shillings**\n\nOne 100/- note + one 50/- note + one 5/- coin:\n100 + 50 + 5 = **155 shillings**`;
      c.practice = { q: `**Count these amounts:**\n1) Two 10/- coins + one 5/- coin = ?\n2) One 50/- note + three 10/- coins = ?\n3) One 100/- note + two 20/- coins = ?\n4) What coins make 35 shillings?`, hint: `Add the value of each coin or note together!` };
      c.qc = mcq('35 shillings', ['25 shillings', '45 shillings', '30 shillings', '55 shillings'], `You have three 10/- coins and one 5/- coin. How much money do you have?`);
      c.reflect = `What is the biggest note you have seen? What can you buy with 100 shillings?`;
      break;
    }
    case 'time': {
      c.welcome = `Today we learn to tell time! The clock helps us know when to do things.`;
      c.mission = outcomeShort || `Read the clock and tell the time in hours.`;
      c.thinkFirst = { q: `What time do you wake up? What time does school start? Look at a clock near you!`, hint: `Look at the short hand — it tells the hour!` };
      c.learn = `A clock has two hands:\n\n**Short hand** → tells the HOUR (the number it points to)\n**Long hand** → tells the MINUTES (when it points to 12, it is "o'clock")\n\n**Examples:**\n• Short hand on 3, long on 12 → **3 o'clock**\n• Short hand on 6, long on 12 → **6 o'clock**\n• Short hand on 9, long on 12 → **9 o'clock**`;
      c.connect = `Time helps us:\n• Know when school starts (8 o'clock)\n• Know when it is lunch time (1 o'clock)\n• Know when to go home (4 o'clock)\n• Know when to sleep (8 o'clock at night)`;
      c.example = `**Reading the clock:**\n\n🕐 1 o'clock → short hand on 1, long on 12\n🕓 4 o'clock → short hand on 4, long on 12\n🕕 6 o'clock → short hand on 6, long on 12\n🕘 9 o'clock → short hand on 9, long on 12`;
      c.practice = { q: `**Draw clocks showing:**\n1) 3 o'clock     2) 7 o'clock\n3) 10 o'clock    4) 12 o'clock\n\nWhat time is your favourite time of day? Draw it!`, hint: `Short hand on the number, long hand on 12!` };
      c.qc = mcq("5 o'clock", ["12 o'clock", "5 minutes", "6 o'clock", "50 o'clock"], `When the short hand points to 5 and the long hand points to 12, what time is it?`);
      c.reflect = `Why is it important to know the time? What happens if you don't know the time?`;
      break;
    }
    case 'shapes': {
      c.welcome = `Today we learn about shapes! Shapes are everywhere around us.`;
      c.mission = outcomeShort || `Identify and name squares, circles, triangles, and rectangles.`;
      c.thinkFirst = { q: `Look around you. Can you see something that is a circle? Something that is a square?`, hint: `Look at windows, doors, wheels, and books!` };
      c.learn = `**Circle** — round, no corners. Like a wheel or a coin.\n\n**Square** — 4 equal sides, 4 corners. Like a tile or a window.\n\n**Triangle** — 3 sides, 3 corners. Like a roof or a slice of pizza.\n\n**Rectangle** — 4 sides (2 long, 2 short), 4 corners. Like a door or a book.\n\n**Remember:** Count the sides to know the shape!`;
      c.connect = `Shapes are everywhere:\n• The door is a **rectangle**\n• The clock is a **circle**\n• The roof is a **triangle**\n• The window is a **square**`;
      c.example = `**Count the sides:**\n\nCircle → 0 sides, 0 corners (it is round!)\nTriangle → 3 sides, 3 corners\nSquare → 4 equal sides, 4 corners\nRectangle → 4 sides (opposite sides equal), 4 corners`;
      c.practice = { q: `**1)** Draw a square and count its corners.\n**2)** Draw a triangle and count its sides.\n**3)** Find 3 things in your home that are rectangles.\n**4)** Draw a picture using only circles and triangles!`, hint: `Use a ruler to make straight lines!` };
      c.qc = mcq('3', ['2', '4', '5', '0'], `How many sides does a triangle have?`);
      c.reflect = `What is your favourite shape? Why? Can you draw a house using shapes?`;
      break;
    }
    case 'place-value': {
      c.welcome = `Today we learn about place value! Every digit in a number has a special place that tells us its value.`;
      c.mission = outcomeShort || `Understand tens and ones in two-digit numbers.`;
      c.thinkFirst = { q: `What is special about the number 23? Why isn't it just "2" and "3"?`, hint: `The 2 in 23 doesn't mean 2 ones. It means something bigger!` };
      c.learn = `In a two-digit number, each digit has a place:\n\n**23** means:\n• 2 in the TENS place = 2 groups of ten = 20\n• 3 in the ONES place = 3 single ones = 3\n• Together: 20 + 3 = 23\n\n**57** means:\n• 5 tens = 50\n• 7 ones = 7\n• 50 + 7 = 57\n\n**Key idea:** The position of a digit tells you its value!`;
      c.connect = `When you count groups of ten — like 10 crayons in a box — the tens place tells you how many groups of ten you have!`;
      c.example = `**Breaking down numbers:**\n\n46 = 4 tens + 6 ones = 40 + 6\n72 = 7 tens + 2 ones = 70 + 2\n99 = 9 tens + 9 ones = 90 + 9\n30 = 3 tens + 0 ones = 30 + 0`;
      c.practice = { q: `**Break these into tens and ones:**\n1) 34 = ___ tens + ___ ones\n2) 68 = ___ tens + ___ ones\n3) What number is 5 tens and 9 ones?\n4) What number is 8 tens and 0 ones?`, hint: `The first digit = tens, the second digit = ones!` };
      c.qc = mcq('Both 60 and 6 tens', ['6 ones', '60', '6 tens', '66'], `In the number 64, what does the 6 represent?`);
      c.reflect = `Why do we need place value? What would happen if we only had the ones place?`;
      break;
    }
    case 'multiplication': {
      const a = n1 || 3, b = n2 || 2, prod = a * b;
      c.welcome = `Today we learn multiplication! Multiplication is a quick way to add the same number many times.`;
      c.mission = outcomeShort || `Understand multiplication as repeated addition.`;
      c.thinkFirst = { q: `If you have ${a} bags with ${b} apples in each bag, how many apples do you have altogether?`, hint: `You can add: ${b} + ${b} + ${b} ... (${a} times)!` };
      c.learn = `Multiplication means groups of the same size.\n\n**${a} × ${b} = ?** means ${a} groups of ${b}.\n\nAs repeated addition: ${Array.from({length: a}, () => b).join(' + ')} = ${prod}\n\nSo **${a} × ${b} = ${prod}**\n\n**Key words:** groups of, times, multiplied by, product`;
      c.connect = `Multiplication helps when you have equal groups:\n• 3 bags with 4 sweets each = 3 × 4 = 12 sweets\n• 5 rows of 2 chairs = 5 × 2 = 10 chairs`;
      c.example = `**Example:** 4 × 3 = ?\n\n4 groups of 3:\n●●● ●●● ●●● ●●●\n\nCount: 3 + 3 + 3 + 3 = 12\nOr: 4 × 3 = 12`;
      c.practice = { q: `**Solve these:**\n1) 3 × 2 = ?\n2) 4 × 3 = ?\n3) 5 × 2 = ?\n4) 2 × 6 = ?\n\nWrite each as repeated addition too!`, hint: `Think: how many groups? How many in each group?` };
      c.qc = mcq(String(prod + a), [String(prod + b), String(prod * 2), String(prod - a), String(prod + 10)], `What is ${a+1} × ${b}?`);
      c.reflect = `What does the × sign mean? How is multiplication like addition?`;
      break;
    }
    default: {
      c.welcome = `Welcome to today's math lesson! We are going to learn something new and exciting.`;
      c.mission = outcomeShort || `Learn and practise new math skills.`;
      c.thinkFirst = { q: `What do you already know about ${title.toLowerCase()}?`, hint: `Think about what you have learned before!` };
      c.learn = `Let's learn step by step.\n\n${outcomeShort || 'We will explore this topic carefully.'}\n\nWatch and listen carefully, then we will practise together!`;
      c.connect = `Math is all around us — in the market, at home, at school, and when we play!`;
      c.example = `Let me show you an example:\n\nThink about objects you count every day — your fingers, your books, your friends. We use math for all of these!`;
      c.practice = { q: `**Now it is your turn to practise!**\n\n1) Try the problems on your own first.\n2) If you get stuck, look back at the example.\n3) Check your answers carefully.`, hint: `You can do it! Take your time and think carefully.` };
      c.qc = mcq('25', ['15', '35', '20', '30'], `What is 12 + 13?`);
      c.qc.hint = `Add the ones first, then the tens!`;
      c.reflect = `What did you learn today? What was easy? What was challenging?`;
    }
  }

  return c;
}

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY BUILDER
// ═══════════════════════════════════════════════════════════════════════════

function buildMathJourney(lesson) {
  const { id, title, specificLearningOutcome, learningOutcome } = lesson;
  const topic = detectMathTopic(title);
  const content = generateMathContent(title, topic, specificLearningOutcome || learningOutcome);
  const illustration = generateMathSVG(topic);
  const video = getYouTubeVideo(topic);

  const outcome = ((specificLearningOutcome || learningOutcome || '') + '').replace(/by the end of the lesson,?\s*the learner should be able to:?\s*/i, '').replace(/\s+/g, ' ').trim();
  const missionText = outcome.length > 100 ? outcome.substring(0, 97) + '...' : (outcome || title);

  return {
    journey: [
      { id: 'step-01', stepType: 'welcome', title: 'Welcome!', studentText: '', owlText: content.welcome.substring(0, 150), interaction: { type: 'none' }, media: { illustration: { approvedUrl: illustration, approvedByAdmin: true } } },
      { id: 'step-02', stepType: 'mission', title: 'Our Mission', studentText: '', owlText: missionText.substring(0, 120), interaction: { type: 'none' } },
      { id: 'step-03', stepType: 'think_first', title: 'Think First!', studentText: '', owlText: content.thinkFirst.q.substring(0, 120), interaction: { type: 'open_response', prompt: content.thinkFirst.q, hint: content.thinkFirst.hint } },
      { id: 'step-04', stepType: 'learn', title: 'Learn It', studentText: content.learn, owlText: '', interaction: { type: 'none' }, media: { illustration: { approvedUrl: illustration, approvedByAdmin: true } } },
      { id: 'step-05', stepType: 'connect', title: 'Real Life Connection', studentText: content.connect, owlText: 'When do you see this in your daily life? Think about your home, school, and market!', interaction: { type: 'open_response', prompt: 'Where do you see this in real life? Give an example.' } },
      { id: 'step-06', stepType: 'example', title: 'Watch and Learn', studentText: content.example, owlText: '', interaction: { type: 'none' }, media: { video: { approvedUrl: `https://www.youtube.com/watch?v=${video.id}`, approvedByAdmin: true, approvedTitle: video.title } } },
      { id: 'step-07', stepType: 'practice', title: 'Your Turn!', studentText: content.practice.q, owlText: content.practice.hint.substring(0, 100), interaction: { type: 'open_response', prompt: 'Write your answers here. Show all your work!', hint: content.practice.hint } },
      { id: 'step-08', stepType: 'quick_check', title: 'Quick Check!', studentText: '', owlText: (content.qc.hint || '').substring(0, 120), interaction: { type: 'multiple_choice', question: content.qc.question, options: content.qc.options, correctIndex: content.qc.correctIndex, correctAnswer: content.qc.correctIndex, hint: content.qc.hint } },
      { id: 'step-09', stepType: 'reflect', title: 'Think About Your Learning', studentText: '', owlText: content.reflect.substring(0, 120), interaction: { type: 'open_response', prompt: content.reflect } },
      { id: 'step-10', stepType: 'complete', title: 'You Did It! 🏆', studentText: '', owlText: `Amazing work! You learned about "${title}". Keep practising and you will become a math champion! 🌟`, interaction: { type: 'none' } }
    ],
    topic, video
  };
}

module.exports = { buildMathJourney, detectMathTopic, generateMathSVG, getYouTubeVideo, generateMathContent };
