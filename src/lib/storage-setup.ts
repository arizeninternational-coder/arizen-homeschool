// Storage bucket setup helper
// Ensures the lesson-illustrations bucket exists before upload
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const BUCKET_NAME = "lesson-illustrations";

/**
 * Ensure the storage bucket exists. Returns true if ready, false if service role key is missing.
 */
export async function ensureBucketExists(): Promise<{ ready: boolean; error?: string }> {
  try {
    const admin = getSupabaseAdmin();

    // Check if bucket exists
    const { data: buckets, error: listErr } = await admin.storage.listBuckets();
    if (listErr) return { ready: false, error: `Cannot list buckets: ${listErr.message}` };

    const exists = buckets?.some(b => b.id === BUCKET_NAME);
    if (exists) return { ready: true };

    // Create the bucket (public read for student rendering)
    const { error: createErr } = await admin.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5 MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"],
    });

    if (createErr) return { ready: false, error: `Cannot create bucket: ${createErr.message}` };
    return { ready: true };
  } catch (err: any) {
    // getSupabaseAdmin() throws if SUPABASE_SERVICE_ROLE_KEY is not set
    if (err.message?.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return {
        ready: false,
        error: "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local to enable image uploads.",
      };
    }
    return { ready: false, error: err.message || "Storage setup failed" };
  }
}
