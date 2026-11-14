-- ============================================================================
-- Phase 0 — RLS lockdown
--
-- *** DO NOT RUN UNTIL THE APP IS DEPLOYED WITH THE SERVICE-ROLE CLIENT ***
--
-- Prerequisite: the application is running with SUPABASE_SERVICE_ROLE_KEY set
-- (branch security/phase0-service-key-migration). Applying this first takes the
-- site down: RLS is enabled with no policies for anon, and anon's grants are
-- revoked, so every request that still uses the anon key is denied.
--
-- Effect: anon and authenticated are denied by two independent mechanisms —
-- RLS with no policies, and revoked table privileges. service_role carries
-- BYPASSRLS and keeps its grants, so the app is unaffected.
--
-- Wrapped in a transaction. If any step fails, nothing is applied.
-- Rollback instructions: docs/phase0-rls/README.md
-- ============================================================================

BEGIN;

-- ── Preflight: refuse to run if service_role has no table grants ────────────
-- If service_role lost its grants, applying this would lock every client out of
-- the database with no way back through the API.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND grantee = 'service_role'
      AND privilege_type = 'SELECT'
  ) THEN
    RAISE EXCEPTION
      'service_role holds no SELECT grant in public — aborting. Applying the lockdown now would leave no working client.';
  END IF;
END $$;

-- ── 1. Enable RLS on every table in public. No policies = deny by default. ──
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.relname);
  END LOOP;
END $$;

-- ── 2. Drop any policy that grants anything to anon / authenticated / public ─
-- Policies for service_role, or for specific named roles, are left alone.
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND roles && ARRAY['anon', 'authenticated', 'public']::name[]
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
    RAISE NOTICE 'dropped policy % on %.%', p.policyname, p.schemaname, p.tablename;
  END LOOP;
END $$;

-- ── 3. Revoke anon's table privileges ────────────────────────────────────────
-- Belt and braces: even if a permissive policy is added later by mistake, anon
-- still has no grant to exercise it.
REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- The app reaches the database only through PostgREST table access and calls no
-- RPCs, so anon has no reason to execute functions either.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- ── 4. New tables inherit the same posture ──────────────────────────────────
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL     ON TABLES    FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL     ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- ── 5. In-transaction check: fail the whole migration if anything slipped ───
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n
  FROM pg_class c
  JOIN pg_namespace ns ON ns.oid = c.relnamespace
  WHERE ns.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity;

  IF n > 0 THEN
    RAISE EXCEPTION 'BLOCKED: % table(s) in public still have RLS disabled. Rolling back.', n;
  END IF;

  SELECT count(*) INTO n
  FROM pg_policies
  WHERE schemaname = 'public'
    AND roles && ARRAY['anon', 'authenticated', 'public']::name[];

  IF n > 0 THEN
    RAISE EXCEPTION 'BLOCKED: % policy/policies still grant anon or authenticated. Rolling back.', n;
  END IF;
END $$;

COMMIT;

-- After COMMIT: run 03-verify.sql, then scripts/probe-tables.js with the anon key.
