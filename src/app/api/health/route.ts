// GET /api/health — Simple health check that doesn't need Supabase
export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const keyLen = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0;
  const hasSecret = !!process.env.NEXTAUTH_SECRET;
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;
  
  return Response.json({
    ok: hasUrl && hasKey,
    env: {
      hasSupabaseUrl: hasUrl,
      hasSupabaseKey: hasKey,
      supabaseKeyLength: keyLen,
      hasNextAuthSecret: hasSecret,
      nodeEnv,
      vercelEnv,
    }
  });
}
