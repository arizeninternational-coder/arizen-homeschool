// GET /api/health — Simple health check that doesn't need Supabase.
// Deliberately public (the only auth bypass in middleware): it must not require
// a session, and it must never echo a secret — only whether one is present.
export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasAuthSecret = !!process.env.NEXTAUTH_SECRET;
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;

  return Response.json({
    // Since Phase 0 the API reads through the service-role client, so the
    // service key — not the anon key — is what the app needs to function.
    // Checking this AFTER a deploy is how you catch a missing env var before
    // users do: without it every API route returns 500.
    ok: hasUrl && hasServiceRoleKey && hasAuthSecret,
    env: {
      hasSupabaseUrl: hasUrl,
      hasServiceRoleKey,
      hasNextAuthSecret: hasAuthSecret,
      nodeEnv,
      vercelEnv,
    },
  });
}
