/**
 * Setup script: Create the lesson-illustrations Supabase Storage bucket.
 *
 * Run with:
 *   npx ts-node scripts/setup-lesson-illustrations-bucket.ts
 *
 * Requires environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... (service role key, NOT anon key)
 *
 * Get the service role key from:
 *   Supabase Dashboard → Settings → API → service_role key
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL is not set");
  process.exit(1);
}
if (!serviceRoleKey) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY is not set");
  console.error("Get it from: Supabase Dashboard → Settings → API → service_role key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const BUCKET_ID = "lesson-illustrations";

  // Check if bucket exists
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error("ERROR: Failed to list buckets:", listErr.message);
    process.exit(1);
  }

  const exists = buckets?.some((b) => b.id === BUCKET_ID);
  if (exists) {
    console.log(`✓ Bucket "${BUCKET_ID}" already exists.`);
    process.exit(0);
  }

  // Create bucket
  console.log(`Creating bucket "${BUCKET_ID}"...`);
  const { error: createErr } = await supabase.storage.createBucket(BUCKET_ID, {
    public: true,
    fileSizeLimit: 5242880, // 5 MB
    allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"],
  });

  if (createErr) {
    console.error("ERROR: Failed to create bucket:", createErr.message);
    process.exit(1);
  }

  console.log(`✓ Bucket "${BUCKET_ID}" created successfully.`);
  console.log("  - Public read: Yes");
  console.log("  - File size limit: 5 MB");
  console.log("  - Allowed types: PNG, JPEG, JPG, WEBP, SVG");
  process.exit(0);
}

main();
