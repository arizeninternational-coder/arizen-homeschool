#!/usr/bin/env node
/**
 * Quick fix: repair "will + verbING" and "and + verbING" grammar in all English theme journeys.
 * Directly updates contentBlocks in DB.
 */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const t = line.trim();
  if (!t || t.startsWith('#')) return;
  const i = t.indexOf('=');
  if (i === -1) return;
  envVars[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function fixText(text) {
  if (!text) return text;
  return text
    // "will verbING" -> "will verb"
    .replace(/will (\w{3,})ing\b/gi, 'will $1')
    // "and verbING" -> "and verb" (but not "and interesting" etc)
    .replace(/and (\w{3,})ing\b/gi, (m, v) => {
      const keep = ['interesting', 'exciting', 'amazing', 'boring', 'charming', 'demanding', 'engaging', 'fascinating', 'gathering', 'living', 'moving', 'outstanding', 'puzzling', 'refreshing', 'shocking', 'stirring', 'surprising', 'thrilling', 'touching', 'warming'];
      return keep.includes(v.toLowerCase()) ? m : 'and ' + v;
    });
}

async function main() {
  const { data: themes } = await db.from('Theme').select('id').eq('slug', 'g2-english');
  if (!themes?.length) { console.error('Theme not found'); process.exit(1); }
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', themes[0].id);
  if (!quests?.length) { console.error('No quests'); process.exit(1); }

  let all = [], off = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q => q.id)).range(off, off + 199);
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }

  let fixed = 0, skipped = 0;
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const draft = meta.studentJourneyDraft || [];
    if (!draft.length) { skipped++; continue; }

    let needsFix = false;
    const fixedDraft = draft.map(s => {
      const newStudent = fixText(s.studentText);
      const newOwl = fixText(s.owlText);
      if (newStudent !== s.studentText || newOwl !== s.owlText) needsFix = true;
      return { ...s, studentText: newStudent, owlText: newOwl };
    });
    if (!needsFix) { skipped++; continue; }

    const upd = { ...meta, studentJourneyDraft: fixedDraft, aiMetadata: { ...(meta.aiMetadata||{}), batchId: 'fix-grammar-v4', generatedAt: new Date().toISOString(), generator: 'grammar-fix-v4' } };
    const { error: e2 } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (e2) console.error('ERROR:', l.title, e2.message);
    else { console.log('✓', l.title); fixed++; }
  }
  console.log('\nFixed:', fixed, '| Skipped:', skipped);
}
main().catch(e => { console.error(e); process.exit(1); });
