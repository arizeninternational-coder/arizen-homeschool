// Storage bucket setup helper
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "lesson-illustrations";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

let _adminClient: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient | null {
  if (_adminClient) return _adminClient;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  _adminClient = createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _adminClient;
}

export async function ensureBucketExists(): Promise<{ ready: boolean; error?: string }> {
  const admin = getAdminClient();
  if (!admin) {
    return { ready: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set." };
  }
  try {
    const { data: buckets, error: listErr } = await admin.storage.listBuckets();
    if (listErr) return { ready: false, error: "Cannot list buckets: " + listErr.message };
    const exists = buckets?.some((b) => b.id === BUCKET_NAME);
    if (exists) return { ready: true };
    const { error: createErr } = await admin.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"],
    });
    if (createErr) return { ready: false, error: "Cannot create bucket: " + createErr.message };
    return { ready: true };
  } catch (err: any) {
    return { ready: false, error: err.message || "Storage setup failed" };
  }
}
