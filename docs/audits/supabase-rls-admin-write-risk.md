# Supabase RLS Admin Write Risk

**Date:** 2026-06-17
**Severity:** Medium — should be audited before public launch
**Status:** Not fixed (audit only, as instructed)

## Finding

During the Fractions POC status safety fix, the Supabase **anon key** (public, client-side key) was able to successfully update `Lesson.status` from `"PUBLISHED"` to `"DRAFT"` via a direct `.update()` call.

This means Row Level Security (RLS) on the `Lesson` table either:
1. Does not have a policy restricting `UPDATE` operations to admin roles, OR
2. The existing policy does not properly check the user's role/permissions

## Risk

If the anon key can update `Lesson.status`, then:
- Any unauthenticated or learner-role client could potentially change lesson visibility
- A malicious actor with the anon key (which is exposed in client-side code) could publish/unpublish lessons
- Other admin-only fields may also be writable by non-admin users

## Recommendation (for before public launch)

1. **Audit all RLS policies** on `Lesson`, `Theme`, `Quest`, and other admin-managed tables
2. **Restrict UPDATE/DELETE** on `Lesson` to service role key only (server-side admin APIs)
3. **Add role-checking policies** if client-side writes are needed: `auth.jwt() ->> 'role' = 'ADMIN'`
4. **Move all admin mutations** to server-side API routes that use `getSupabaseAdmin()` (service role client)
5. **Never expose service role key** to the browser — it should only be in server environment variables

## What was NOT done

- No RLS changes were made (as instructed — audit only)
- No policies were modified
- This note is for the security review before launch
