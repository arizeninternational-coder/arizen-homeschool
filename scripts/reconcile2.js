#!/usr/bin/env node
/**
 * Check what the admin page shows for Grade 2 across ALL subjects
 */
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
  // Same query as admin API
  const { data: allLessons, error } = await db
    .from('Lesson')
    .select(`
      id, title, slug, status, orderIndex, createdAt, contentBlocks,
      quest:Quest(id, title, theme:Theme(id, title, grade))
    `)
    .order('createdAt', { ascending: false })
    .limit(200);

  if (error) { console.error('Error:', error); process.exit(1); }

  // Grade 2 across ALL subjects
  const grade2 = allLessons.filter(l => l.quest?.theme?.grade === 2);
  console.log('Total Grade 2 lessons (all subjects):', grade2.length);

  // Breakdown by subject
  const bySubject = {};
  for (const l of grade2) {
    let subject = 'unknown';
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      subject = cb?.subject || 'unknown';
    } catch { /* skip */ }
    if (!bySubject[subject]) bySubject[subject] = [];
    bySubject[subject].push(l);
  }

  console.log('\n=== Grade 2 by Subject ===');
  for (const [subject, lessons] of Object.entries(bySubject).sort()) {
    console.log(`  ${subject}: ${lessons.length} lessons`);
  }

  // Check if there are more Grade 2 lessons beyond the 200 limit
  const { data: count } = await db
    .from('Lesson')
    .select('*', { count: 'exact', head: true });
  console.log(`\nTotal lessons in DB: ${count}`);

  // Check total Grade 2 count with a separate query
  // We need to fetch all lessons to check
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id, contentBlocks, quest:Quest(id, theme:Theme(id, grade))').range(offset, offset + 199);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    offset += 200;
    if (data.length < 200) break;
  }
  console.log(`Total lessons fetched (paginated): ${all.length}`);

  const allGrade2 = all.filter(l => l.quest?.theme?.grade === 2);
  console.log(`Total Grade 2 (all subjects, paginated): ${allGrade2.length}`);

  // Subject breakdown for all Grade 2
  const allBySubject = {};
  for (const l of allGrade2) {
    let subject = 'unknown';
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      subject = cb?.subject || 'unknown';
    } catch { /* skip */ }
    if (!allBySubject[subject]) allBySubject[subject] = 0;
    allBySubject[subject]++;
  }
  console.log('\n=== All Grade 2 by Subject (paginated) ===');
  for (const [subject, cnt] of Object.entries(allBySubject).sort()) {
    console.log(`  ${subject}: ${cnt}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
