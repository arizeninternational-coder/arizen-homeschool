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
  // Use raw RPC to get the exact contentBlocks
  const { data, error } = await db.rpc('get_lesson_content_blocks', { lesson_id: '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8' });
  if (error) {
    // Fallback: just fetch and log raw
    const { data: d2, error: e2 } = await db.from('Lesson').select('contentBlocks').eq('id', '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8').single();
    if (e2) { console.error('ERROR:', e2.message); process.exit(1); }
    console.log('Raw contentBlocks type:', typeof d2.contentBlocks);
    console.log('Raw contentBlocks (first 500 chars):', String(d2.contentBlocks).substring(0, 500));
    return;
  }
  console.log('RPC result:', JSON.stringify(data, null, 2).substring(0, 1000));
}
main().catch(e => console.error('FATAL:', e.message));
