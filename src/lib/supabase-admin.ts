/**
 * Server-only Supabase admin client.
 *
 * Uses the SERVICE ROLE KEY which bypasses RLS entirely.
 * This client must ONLY be used in server-side API routes —
 * never expose this key to the browser.
 *
 * Required env var: SUPABASE_SERVICE_ROLE_KEY
 * Set it in .env.local (never prefix with NEXT_PUBLIC_).
 *
 * LAZY INITIALIZATION: The client is created on first use, not at import time.
 * This prevents build failures when the key is not set.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let _adminClient: SupabaseClient | null = null;

/**
 * Get the server-side admin Supabase client (lazy, cached).
 * Bypasses RLS. Only works server-side with a valid service role key.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    if (!serviceRoleKey) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Add it to .env.local to use messaging and support APIs."
      );
    }
    _adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: "public",
      },
    });
  }
  return _adminClient;
}
