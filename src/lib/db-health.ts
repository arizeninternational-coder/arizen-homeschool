/**
 * Database table health check utility.
 * Use in API routes to detect missing tables and return helpful errors.
 */
import { supabase } from "@/lib/supabase";

/**
 * Check if a table exists and is queryable.
 * Returns { exists: true } or { exists: false, error: string }.
 */
export async function checkTableExists(tableName: string): Promise<{ exists: boolean; error?: string }> {
  try {
    const { error } = await supabase.from(tableName).select("id").limit(1);
    if (error) {
      // Check for common "table does not exist" error codes
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation")) {
        return { exists: false, error: `Table "${tableName}" does not exist. Run STABILIZATION_MIGRATION.sql in Supabase.` };
      }
      // Other errors (RLS, permissions) mean the table exists but we can't access it
      // For our purposes, that's "exists"
      return { exists: true };
    }
    return { exists: true };
  } catch (err: any) {
    return { exists: false, error: err?.message || "Unknown error checking table" };
  }
}

/**
 * Check multiple tables at once.
 * Returns the first missing table error, or null if all exist.
 */
export async function checkRequiredTables(tables: string[]): Promise<string | null> {
  for (const table of tables) {
    const result = await checkTableExists(table);
    if (!result.exists) {
      return result.error || `Table "${table}" is missing.`;
    }
  }
  return null;
}
