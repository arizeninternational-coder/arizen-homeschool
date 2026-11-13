/**
 * Server-only Supabase admin client.
 *
 * Uses the SERVICE ROLE KEY which bypasses RLS entirely.
 * This client must ONLY be used in server-side API routes — never expose this
 * key to the browser, and never import this module from a client component.
 *
 * Required env var: SUPABASE_SERVICE_ROLE_KEY
 * Set it in .env.local and in the Vercel project env (never NEXT_PUBLIC_).
 *
 * LAZY INITIALIZATION: The client is created on first use, not at import time,
 * so a missing key cannot break `next build`.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let _adminClient: SupabaseClient | null = null;

/** True when running in a browser (or any non-Node runtime). */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Guard: importing this module into a client bundle is a bug. Fail loudly at
 * module evaluation rather than silently shipping a broken client.
 */
if (isBrowser()) {
  throw new Error(
    "supabase-admin.ts is server-only and must never be imported by client code. " +
      "It carries the service role key, which bypasses RLS."
  );
}

/**
 * Get the server-side admin Supabase client (lazy, cached).
 * Bypasses RLS. Only works server-side with a valid service role key.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (isBrowser()) {
    throw new Error(
      "getSupabaseAdmin() called in the browser. This client uses the service role key and bypasses RLS."
    );
  }

  if (!_adminClient) {
    if (!serviceRoleKey) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (and to the Vercel project env). " +
          "Every API route now requires it, because RLS denies anon access to all tables."
      );
    }
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
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
