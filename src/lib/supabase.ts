import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgufndnqbvcukbxmwtvo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Lazy singleton — defers client creation until first actual use
// This prevents "supabaseKey is required" errors during next build
// when env vars are not yet available at module load time
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    if (!supabaseAnonKey) {
      // Return a dummy client that will fail gracefully at runtime
      // but won't crash during build
      return createClient(supabaseUrl, "placeholder-key-for-build");
    }
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// Create a proxy that delegates to the lazy client
export const supabase: SupabaseClient = new Proxy({} as any, {
  get(_target, prop) {
    const c = getClient();
    const value = (c as any)[prop];
    // Bind methods to preserve `this` context
    if (typeof value === "function") {
      return value.bind(c);
    }
    return value;
  },
});

export default supabase;
