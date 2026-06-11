#!/usr/bin/env node
/**
 * Publish remaining Grade 2 DRAFT lessons that already have approved journeys.
 * These are Mathematics lessons that were already approved but have status DRAFT.
 */
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Get all Grade 2 DRAFT lessons with approved journeys
  const { data: themes } = await db.from('Theme').select('id').eq('grade', 2);
  const { data: quests } = await db.from('Quest').select('id').in('themeId', themes.map(t=>t.id));
  
  let all = [], off = 0;
  while (true) {
    const { data, error } = await db.from('Lesson')
      .select('id, title, status, contentBlocks')
      .in('questId', quests.map(q=>q.id))
      .eq('status', 'DRAFT')
      .range(off, off+199);
    if (error) { console.error(error); break; }
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }

  console.log('Found ' + all.length + ' DRAFT lessons');

  let published = 0, skipped = 0, errors = 0;
  const batchSize = 25;
  
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    
    for (const l of batch) {
      let meta = {};
      try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
      
      // Check if it has an approved journey or journey draft
      const hasApprovedJourney = Array.isArray(meta?.studentJourney) && meta.studentJourney.length > 0;
      const hasDraftJourney = Array.isArray(meta?.studentJourneyDraft) && meta.studentJourneyDraft.length > 0;
      
      if (hasApprovedJourney) {
        // Already approved, just update status
        const upd = {
          ...meta,
          isAvailable: true,
          aiMetadata: { ...(meta.aiMetadata||{}), publishedAt: new Date().toISOString(), publishedBy: 'batch-publish-math-v1' }
        };
        const { error } = await db.from('Lesson')
          .update({ status: 'PUBLISHED', contentBlocks: JSON.stringify(upd) })
          .eq('id', l.id);
        if (error) { console.error('ERROR:', l.title.substring(0,40), error.message); errors++; }
        else published++;
      } else if (hasDraftJourney) {
        // Has draft, publish it
        const upd = {
          ...meta,
          studentJourney: meta.studentJourneyDraft,
          isAvailable: true,
          aiMetadata: { ...(meta.aiMetadata||{}), publishedAt: new Date().toISOString(), publishedBy: 'batch-publish-draft-v1' }
        };
        const { error } = await db.from('Lesson')
          .update({ status: 'PUBLISHED', contentBlocks: JSON.stringify(upd) })
          .eq('id', l.id);
        if (error) { console.error('ERROR:', l.title.substring(0,40), error.message); errors++; }
        else published++;
      } else {
        skipped++;
      }
    }
    
    console.log('Progress: ' + Math.min(i + batchSize, all.length) + '/' + all.length);
  }

  console.log('\n=== RESULTS ===');
  console.log('Published: ' + published);
  console.log('Skipped (no journey): ' + skipped);
  console.log('Errors: ' + errors);
}
main().catch(e => console.error(e));
