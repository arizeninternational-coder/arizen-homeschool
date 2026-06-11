#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function main() {
  const { data: themes } = await db.from('Theme').select('id, title, slug').eq('grade', 2);
  if (!themes?.length) { console.log('No themes'); return; }
  
  for (const theme of themes) {
    const { data: quests } = await db.from('Quest').select('id').eq('themeId', theme.id);
    if (!quests?.length) { console.log(theme.title + ': 0 quests'); continue; }
    
    let all = [], off = 0;
    while (true) {
      const { data } = await db.from('Lesson').select('id, title, status, contentBlocks').in('questId', quests.map(q => q.id)).range(off, off + 199);
      if (!data?.length) break;
      all = all.concat(data); off += 200;
      if (data.length < 200) break;
    }
    
    let withDraft = 0, withApproved = 0, withNone = 0;
    const statusCounts = {};
    for (const l of all) {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
      try {
        const cb = JSON.parse(l.contentBlocks || '{}');
        const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
        const hasApproved = Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0;
        if (hasApproved) withApproved++;
        else if (hasDraft) withDraft++;
        else withNone++;
      } catch { withNone++; }
    }
    
    console.log(theme.title + ' (' + theme.slug + '):');
    console.log('  Lessons: ' + all.length + ' | Draft: ' + withDraft + ' | Approved: ' + withApproved + ' | None: ' + withNone);
    console.log('  Status:', JSON.stringify(statusCounts));
  }
}
main().catch(e => console.error(e));
