#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) return;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  envVars[key] = val;
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Get the g2-english theme
  const { data: themes } = await db.from('Theme').select('id, title, slug').eq('slug', 'g2-english');
  if (!themes || themes.length === 0) { console.error('Theme not found'); process.exit(1); }
  const theme = themes[0];
  console.log('Theme:', theme.title, theme.slug);

  // Get quests
  const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', theme.id);
  if (!quests || quests.length === 0) { console.error('No quests'); process.exit(1); }
  console.log('Quests:', quests.length);
  for (const q of quests) console.log(`  - ${q.title}`);

  // Get ALL lessons for these quests (paginate)
  let allLessons = [];
  let offset = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('*').in('questId', quests.map(q => q.id)).order('orderIndex').range(offset, offset + 199);
    if (!data || data.length === 0) break;
    allLessons = allLessons.concat(data);
    offset += 200;
    if (data.length < 200) break;
  }
  console.log('Total lessons:', allLessons.length);

  // Analyze
  const strandCounts = {};
  const termCounts = {};
  let withDraft = 0, withoutDraft = 0;

  for (const l of allLessons) {
    try {
      const cb = JSON.parse(l.contentBlocks);
      const strand = cb?.strand || 'unknown';
      const term = cb?.term || 'unknown';
      strandCounts[strand] = (strandCounts[strand] || 0) + 1;
      termCounts[term] = (termCounts[term] || 0) + 1;
      if (Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0) withDraft++;
      else withoutDraft++;
    } catch { withoutDraft++; }
  }

  console.log('\n=== Strand breakdown ===');
  for (const [s, c] of Object.entries(strandCounts).sort()) console.log(`  ${s}: ${c}`);
  console.log('\n=== Term breakdown ===');
  for (const [t, c] of Object.entries(termCounts).sort()) console.log(`  ${t}: ${c}`);
  console.log(`\nWith draft: ${withDraft}, Without draft: ${withoutDraft}`);

  // Show first 5 lessons
  console.log('\n=== First 5 lessons ===');
  for (const l of allLessons.slice(0, 5)) {
    try {
      const cb = JSON.parse(l.contentBlocks);
      console.log(`  [${l.status}] ord=${l.orderIndex} | ${l.title} | strand=${cb?.strand} | term=${cb?.term} | week=${cb?.week}`);
    } catch { console.log(`  [${l.status}] ord=${l.orderIndex} | ${l.title} | (parse error)`); }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
