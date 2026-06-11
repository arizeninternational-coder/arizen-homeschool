#!/usr/bin/env node
/**
 * Publish all Grade 2 lessons that have journey drafts.
 * Sets status='PUBLISHED' and isAvailable=true for all DRAFT lessons with valid journeys.
 */
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Get all Grade 2 themes
  const { data: themes } = await db.from('Theme').select('id').eq('grade', 2);
  if (!themes?.length) { console.log('No themes'); return; }
  
  const { data: quests } = await db.from('Quest').select('id').in('themeId', themes.map(t=>t.id));
  if (!quests?.length) { console.log('No quests'); return; }

  // Get all DRAFT lessons with journeys
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

  console.log('Found ' + all.length + ' DRAFT lessons to publish');

  let published = 0, skipped = 0, errors = 0;
  const batchSize = 25;
  
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    
    for (const l of batch) {
      let meta = {};
      try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
      
      // Only publish if journey draft exists
      const hasJourney = Array.isArray(meta?.studentJourneyDraft) && meta.studentJourneyDraft.length > 0;
      if (!hasJourney) { skipped++; continue; }
      
      // Update: set status=PUBLISHED, keep journey draft, mark approved journey
      const upd = {
        ...meta,
        studentJourney: meta.studentJourneyDraft,  // Copy draft to approved
        studentJourneyDraft: meta.studentJourneyDraft,  // Keep draft too
        isAvailable: true,
        aiMetadata: { ...(meta.aiMetadata||{}), publishedAt: new Date().toISOString(), publishedBy: 'batch-publish-v1' }
      };
      
      const { error } = await db.from('Lesson')
        .update({ status: 'PUBLISHED', contentBlocks: JSON.stringify(upd) })
        .eq('id', l.id);
      
      if (error) { console.error('ERROR:', l.title.substring(0,40), error.message); errors++; }
      else published++;
    }
    
    console.log('Progress: ' + (i + batch.length) + '/' + all.length + ' processed');
  }

  console.log('\n=== RESULTS ===');
  console.log('Published: ' + published);
  console.log('Skipped (no journey): ' + skipped);
  console.log('Errors: ' + errors);
}
main().catch(e => console.error(e));
