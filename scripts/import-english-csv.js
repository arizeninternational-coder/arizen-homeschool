#!/usr/bin/env node
/**
 * Grade 2 English Language Activities — DB Import (SAFE & IDEMPOTENT)
 *
 * Changes from original:
 * - Lessons start as DRAFT, not PUBLISHED
 * - isAvailable is false until journeys are approved
 * - Idempotent: checks for existing slug before inserting
 * - Clear console output: inserted / updated / skipped / failed counts
 * - Duplicate-safe: re-running does not create duplicates
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
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  envVars[key] = val;
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Parse CSV (quoted-field aware)
function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  let row = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(current.trim()); current = ''; }
      else if (ch === '\n' || ch === '\r') {
        row.push(current.trim());
        if (row.some(c => c.length > 0)) rows.push(row);
        row = []; current = '';
        if (text[i + 1] === '\n') i++;
      } else { current += ch; }
    }
  }
  if (current || row.length > 0) { row.push(current.trim()); rows.push(row); }
  return rows.filter(r => r.some(c => c.length > 0));
}

const csvPath = path.join(__dirname, '..', 'curriculum-shells', 'grade-2', 'english-language-activities-import.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const parsed = parseCSV(csvContent);
const headers = parsed[0];
const dataRows = parsed.slice(1);
const get = (row, name) => { const idx = headers.indexOf(name); return idx >= 0 && row[idx] ? row[idx].trim().replace(/^"|"$/g, '') : ''; };

// Group by quest
const questGroups = {};
for (const row of dataRows) {
  const qt = get(row, 'questTitle');
  if (!questGroups[qt]) {
    questGroups[qt] = { grade: get(row,'grade'), subject: get(row,'subject'), strand: get(row,'strand'), subStrand: get(row,'subStrand'), questTitle: qt, lessons: [] };
  }
  questGroups[qt].lessons.push({
    title: get(row, 'lessonTitle'),
    order: parseInt(get(row, 'lessonOrder')) || 0,
    description: get(row, 'learningOutcome'),
    cb: {
      grade: get(row,'grade'), subject: get(row,'subject'), strand: get(row,'strand'), subStrand: get(row,'subStrand'),
      learningOutcome: get(row,'learningOutcome'), specificLearningOutcome: get(row,'specificLearningOutcome'),
      keyInquiryQuestion: get(row,'keyInquiryQuestion'), suggestedLearningExperience: get(row,'suggestedLearningExperience'),
      term: get(row,'term'), week: get(row,'week'), activityTitle: get(row,'activityTitle'),
      activityInstructions: get(row,'activityInstructions'), assessmentMethod: get(row,'assessmentMethod'),
      assessmentCriteria: get(row,'assessmentCriteria'), questTitle: get(row,'questTitle'),
      questInstructions: get(row,'questInstructions'), reflectionPrompt: get(row,'reflectionPrompt'),
      learningResources: get(row,'learningResources'), coreCompetencies: get(row,'coreCompetencies'),
      importSource: 'csv',
    },
  });
}

async function supa(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; } catch { return { status: res.status, data: text }; }
}

async function main() {
  let inserted = 0, updated = 0, skipped = 0, errors = 0;

  // Get guildId
  const guildRes = await supa('GET', 'Theme?select=guildId&limit=1');
  const guildId = guildRes.data?.[0]?.guildId || 'a0000000-0000-0000-0000-000000000001';

  for (const quest of Object.values(questGroups)) {
    const subjectSlug = quest.subject.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const themeSlug = `g2-${subjectSlug}`;
    const questSlug = quest.questTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 60);

    // ── Theme (idempotent) ──
    let themeId;
    const existingTheme = await supa('GET', `Theme?slug=eq.${themeSlug}&select=id`);
    if (existingTheme.data?.length) {
      themeId = existingTheme.data[0].id;
    } else {
      const tRes = await supa('POST', 'Theme?on_conflict=slug&select=id', {
        slug: themeSlug, title: quest.subject, guildId, description: `${quest.subject} for ${quest.grade}`,
        drivingQuestion: `What will we learn about ${quest.subject.toLowerCase()}?`,
        grade: parseInt(quest.grade.replace(/\D/g, '')) || 2, status: 'PUBLISHED', durationWeeks: 4,
      });
      if (tRes.status >= 400) {
        console.error(`Theme fail: ${JSON.stringify(tRes.data).substring(0,200)}`);
        errors++; continue;
      }
      themeId = tRes.data?.[0]?.id || tRes.data?.id;
    }

    // ── Quest (idempotent) ──
    let questId;
    const existingQuest = await supa('GET', `Quest?slug=eq.${questSlug}&select=id`);
    if (existingQuest.data?.length) {
      questId = existingQuest.data[0].id;
    } else {
      const qRes = await supa('POST', 'Quest?on_conflict=slug&select=id', {
        slug: questSlug, title: quest.questTitle, themeId, description: quest.questTitle,
        questType: 'MAIN', orderIndex: 1, xpReward: { base: 50 }, status: 'PUBLISHED',
      });
      if (qRes.status >= 400) {
        const g = await supa('GET', `Quest?slug=eq.${questSlug}&select=id`);
        if (g.data?.length) questId = g.data[0].id;
        else { console.error(`Quest fail: ${JSON.stringify(qRes.data).substring(0,200)}`); errors++; continue; }
      } else { questId = qRes.data?.[0]?.id || qRes.data?.id; }
    }

    // ── Lessons (idempotent) ──
    for (const lesson of quest.lessons) {
      const ls = lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 60);

      // Check if lesson already exists
      const existingLesson = await supa('GET', `Lesson?slug=eq.${ls}&select=id,title`);
      if (existingLesson.data?.length) {
        console.log(`  SKIP (exists): ${lesson.title}`);
        skipped++;
        continue;
      }

      const lRes = await supa('POST', 'Lesson?on_conflict=slug&select=id', {
        slug: ls, title: lesson.title, questId, description: lesson.description,
        contentBlocks: JSON.stringify(lesson.cb), difficulty: { complexityScore: 2 },
        xpReward: { base: 25 }, orderIndex: lesson.order,
        status: 'DRAFT',      // ← SAFE: not published
        isAvailable: false,   // ← SAFE: not visible to students
      });

      if (lRes.status >= 400) {
        console.error(`  FAIL: ${lesson.title} — ${JSON.stringify(lRes.data).substring(0,200)}`);
        errors++;
      } else {
        console.log(`  INSERT: ${lesson.title}`);
        inserted++;
      }
    }
    console.log(`  ✓ ${quest.questTitle}: ${quest.lessons.length} lessons processed`);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  INSERTED:  ${inserted}`);
  console.log(`  SKIPPED:   ${skipped} (already existed)`);
  console.log(`  ERRORS:    ${errors}`);
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Total CSV lessons: ${dataRows.length}`);
  console.log(`  All lessons set to DRAFT + isAvailable=false`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
