# Phase 0 — RLS lockdown

**Status: NOT APPLIED.** These scripts are committed for review and to keep the change in version control beside the code it protects. Nothing here has been run against the database.

## The hole

With the `NEXT_PUBLIC_SUPABASE_ANON_KEY` (a key that ships to every browser by design), an unauthenticated caller could read **all 35 tables** in `public` — including:

- `User.passwordHash` — 55 bcrypt hashes, offline-crackable
- `Progress`, `Reflection`, `EmotionalCheckin` — children's learning and emotional data
- `ParentChild` — family links
- `StudentWallet`, `CoinTransaction`, `InteractionResponse`

Reproduced with a plain `curl` and no session. Whether RLS was disabled or wide open is what `01-inventory.sql` resolves.

## Order of operations — do not reorder

1. `01-inventory.sql` — read-only. Run it, keep the output.
2. Deploy the app code that uses the service-role client (`security/phase0-service-key-migration`), **with `SUPABASE_SERVICE_ROLE_KEY` already present in the Vercel environment.** Without the key in place first, every API route 500s.
3. `02-lockdown.sql` — the actual fix. Only after 1 and 2.
4. `03-verify.sql` — confirms RLS is on everywhere and anon holds nothing.
5. Re-run the app probes (`scripts/probe-tables.js`) and confirm the anon key now gets 401/403.

Steps 3–5 take effect instantly and are not covered by a staging environment. If the app has not been deployed with the service client first, step 3 breaks sign-in and every data call at once.

## Why the app keeps working

`service_role` carries `BYPASSRLS` in Supabase. The lockdown enables RLS, adds no policies for `anon`/`authenticated`, and revokes anon's table grants — so `anon` is denied by both mechanisms, while the service-role client the API routes now use is unaffected.

## Rollback

`02-lockdown.sql` is wrapped in a transaction, so a failure part-way leaves nothing applied. To reverse it deliberately:

```sql
BEGIN;
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT c.relname FROM pg_class c
           JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.relname);
  END LOOP;
END $$;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
COMMIT;
```

That reopens the hole. It exists to undo a mistake, not as a routine option.
