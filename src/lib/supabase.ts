import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgufndnqbvcukbxmwtvo.supabase.co";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// During build (when env vars may not be set), use a placeholder to prevent
// "supabaseKey is required" crash at import time. At runtime on Vercel,
// real env vars override this.
const supabaseAnonKey = rawKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

if (!rawKey) {
  console.error("[SUPABASE] WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Using placeholder.");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
