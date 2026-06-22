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

// Try with service role key first, then anon
const keys = [
  { name: 'SERVICE_ROLE', key: envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY },
  { name: 'ANON', key: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY },
].filter(k => k.key);

console.log('Available keys:', keys.map(k => k.name));
console.log('Supabase URL:', envVars.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');

async function main() {
  for (const { name, key } of keys) {
    console.log(`\n=== TRYING WITH ${name} KEY ===`);
    const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, key);
    
    try {
      const { data: buckets, error } = await db.storage.listBuckets();
      if (error) {
        console.log('Storage error:', error.message);
      } else {
        console.log('Buckets:', buckets?.length || 0);
        buckets?.forEach(b => console.log(`  [${b.id}] ${b.name} | public: ${b.public}`));
      }
    } catch(e) {
      console.log('Exception:', e.message);
    }

    // Also try to create a test bucket
    try {
      const { data, error } = await db.storage.createBucket('lesson-media', { public: true, fileSizeLimit: 5242880 });
      if (error) {
        if (error.message.includes('already exists')) {
          console.log('Bucket "lesson-media" already exists');
        } else {
          console.log('Create bucket error:', error.message);
        }
      } else {
        console.log('Created bucket "lesson-media":', data);
      }
    } catch(e) {
      console.log('Create exception:', e.message);
    }
  }
}

main().catch(e => console.error('ERROR:', e.message));
