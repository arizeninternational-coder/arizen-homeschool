-- ============================================================================
-- Phase 0 — post-lockdown verification (READ ONLY)
--
-- Run after 02-lockdown.sql commits. Every check below has an expected result;
-- anything else means the lockdown is incomplete.
-- ============================================================================

-- 1. EXPECT 0 ROWS — every table in public must have RLS enabled.
SELECT c.relname AS table_missing_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
ORDER BY 1;

-- 2. EXPECT 0 — no policy may grant anything to anon, authenticated or public.
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND roles && ARRAY['anon', 'authenticated', 'public']::name[];

-- 3. EXPECT 0 ROWS — anon must hold no table privileges.
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee = 'anon';

-- 4. EXPECT 0 ROWS — anon must hold no sequence privileges.
SELECT c.relname AS sequence_accessible_to_anon
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'S'
  AND has_sequence_privilege('anon', c.oid, 'USAGE');

-- 5. EXPECT service_role to still hold SELECT/INSERT/UPDATE/DELETE on every
--    table. If this comes back empty, the app cannot read anything.
SELECT table_name,
       string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee = 'service_role'
GROUP BY table_name
ORDER BY table_name;

-- 6. EXPECT a row per table with rls_enabled = true.
SELECT count(*) FILTER (WHERE c.relrowsecurity) AS tables_with_rls,
       count(*)                                AS tables_total
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r';

-- ── Then, outside SQL: prove it from the outside ────────────────────────────
--   node scripts/probe-tables.js        # with the anon key -> expect 401/403 on all 35
--   node scripts/verify-db.js           # with the service key -> expect PASS
--   curl -X POST <deployed>/api/auth/login -d '{"email":"x@y.z","password":"x"}'
--     -> expect 401 "Invalid email or password" (NOT 500)
