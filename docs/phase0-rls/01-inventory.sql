-- ============================================================================
-- Phase 0 — RLS inventory (READ ONLY)
--
-- Run in the Supabase SQL Editor. Every statement here is a SELECT: this file
-- changes nothing and is safe to run at any time, including now.
--
-- Keep the output. It is the evidence for what 02-lockdown.sql has to fix, and
-- the baseline for 03-verify.sql afterwards.
-- ============================================================================

-- 1. Every table in public, with its RLS state.
--    relrowsecurity = false  -> the table is wide open to anon, regardless of policies
SELECT c.relname            AS table_name,
       c.relrowsecurity     AS rls_enabled,
       c.relforcerowsecurity AS rls_forced,
       pg_size_pretty(pg_total_relation_size(c.oid)) AS size
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;

-- 2. Summary: how many tables are unprotected right now.
SELECT count(*) FILTER (WHERE NOT c.relrowsecurity) AS tables_without_rls,
       count(*)                                      AS tables_total
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r';

-- 3. Existing policies. An empty result means there are none — which is why
--    anon can read everything whenever RLS is off.
SELECT tablename,
       policyname,
       roles,
       cmd,
       qual        AS using_expression,
       with_check  AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Table privileges held by the anon key's role. Supabase grants these to
--    anon by default, so RLS is the only thing standing in the way — and it is
--    currently not standing.
SELECT grantee,
       table_name,
       string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY grantee, table_name
ORDER BY grantee, table_name;

-- 5. SECURITY DEFINER functions can bypass RLS. Expect none; note any that exist.
SELECT n.nspname AS schema,
       p.proname AS function_name,
       p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef;

-- 6. Anything in the public schema that is NOT a plain table (views can expose
--    rows from RLS-protected tables without RLS applying to the view itself).
SELECT c.relname AS object_name,
       CASE c.relkind WHEN 'v' THEN 'view'
                      WHEN 'm' THEN 'materialized view'
                      WHEN 'p' THEN 'partitioned table'
                      WHEN 'f' THEN 'foreign table'
                      ELSE c.relkind::text END AS kind
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('v', 'm', 'p', 'f')
ORDER BY 1;
