#!/usr/bin/env node
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
  const { data, error } = await db.from('Lesson')
    .select('id, title, contentBlocks, isAvailable, updatedAt')
    .eq('id', '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8')
    .single();
  if (error) { console.error('ERROR:', error.message); process.exit(1); }
  
  let cb = {};
  try { cb = JSON.parse(data.contentBlocks || '{}'); } catch(e) {}
  
  console.log('=== CONTENT BLOCKS STRUCTURE ===');
  console.log('Top-level keys:', Object.keys(cb).join(', '));
  console.log('strand:', cb.strand);
  console.log('subStrand:', cb.subStrand);
  console.log('isAvailable:', cb.isAvailable);
  console.log('studentJourney type:', typeof cb.studentJourney, 'length:', cb.studentJourney?.length);
  console.log('studentJourneyDraft type:', typeof cb.studentJourneyDraft, 'length:', cb.studentJourneyDraft?.length);
  console.log('aiMetadata:', JSON.stringify(cb.aiMetadata, null, 2));
  
  if (cb.studentJourneyDraft) {
    console.log('\n=== DRAFT JOURNEY (first 2 steps) ===');
    cb.studentJourneyDraft.slice(0, 2).forEach((step, i) => {
      console.log(`Step ${i+1}:`, JSON.stringify(step, null, 2).substring(0, 300));
    });
    console.log('Total steps:', cb.studentJourneyDraft.length);
  }
}
main().catch(e => console.error('FATAL:', e.message));
