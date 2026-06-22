#!/usr/bin/env node
/**
 * PHASE 2b: Fetch ALL Math lesson contentBlocks for journey quality audit.
 * Also fetches all Grade 2 Math lessons (not just recovery batch).
 * READ ONLY.
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

async function main() {
  console.log('=== PHASE 2b: FULL CONTENT BLOCKS FOR ALL GRADE 2 MATH ===\n');

  const { data, error } = await db.from('Lesson')
    .select('id, title, contentBlocks, updatedAt')
    .limit(1000);

  if (error) { console.error('FATAL:', error.message); process.exit(1); }

  const math2 = [];
  for (const lesson of data || []) {
    let cb = {};
    try { cb = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) { continue; }
    const grade = cb.grade;
    const subject = (cb.subject || '').toLowerCase();
    const isGrade2 = grade === 2 || grade === '2' || grade === 'Grade 2';
    const isMath = subject.includes('math') || subject.includes('mathematical');
    if (!isGrade2 || !isMath) continue;

    math2.push({
      id: lesson.id,
      title: lesson.title,
      contentBlocks: cb,
      updatedAt: lesson.updatedAt,
    });
  }

  console.log(`Total Grade 2 Math lessons with data: ${math2.length}`);

  // Save full data for Phases 3-6 processing
  const auditDir = path.join(__dirname, '..', 'docs', 'audits');
  fs.mkdirSync(auditDir, { recursive: true });
  fs.writeFileSync(
    path.join(auditDir, '_math2-full-data.json'),
    JSON.stringify(math2, null, 2)
  );
  console.log(`Saved to docs/audits/_math2-full-data.json (${math2.length} records)`);
}

main().catch(e => console.error('FATAL:', e.message));
