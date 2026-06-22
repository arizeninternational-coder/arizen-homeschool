#!/usr/bin/env node
/**
 * PHASE 1: Backup the current database record for the target lesson.
 * Saves the full contentBlocks JSON before any write.
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

const LESSON_ID = '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8';

async function main() {
  const { data, error } = await db.from('Lesson')
    .select('id, title, contentBlocks, isAvailable, updatedAt')
    .eq('id', LESSON_ID)
    .single();

  if (error) { console.error('ERROR:', error.message); process.exit(1); }

  const backupDir = path.join(__dirname, '..', 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `fractions-poc-before-write-${LESSON_ID}.json`);

  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));

  let cb = {};
  try { cb = JSON.parse(data.contentBlocks || '{}'); } catch(e) {}

  console.log('=== BACKUP CREATED ===');
  console.log('File:', backupPath);
  console.log('Lesson ID:', data.id);
  console.log('Title:', data.title);
  console.log('isAvailable:', data.isAvailable);
  console.log('strand:', cb.strand);
  console.log('subStrand:', cb.subStrand);
  console.log('studentJourney steps:', cb.studentJourney?.length || 0);
  console.log('studentJourneyDraft steps:', cb.studentJourneyDraft?.length || 0);
  console.log('aiMetadata keys:', Object.keys(cb.aiMetadata || {}).join(', '));
  console.log('updatedAt:', data.updatedAt);
}

main().catch(e => console.error('FATAL:', e.message));
