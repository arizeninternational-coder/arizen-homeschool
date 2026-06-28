# Environment Variables for Local Development

Copy this file to `.env.local` and fill in the values.

## Required

```bash
# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Supabase (public - safe for browser)
NEXT_PUBLIC_SUPABASE_URL="https://hgufndnqbvcukbxmwtvo.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## Required for Image Upload

```bash
# Supabase Service Role Key (server-only, NEVER expose to browser)
# Get from: Supabase Dashboard > Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY="eyJhbG..."
```

## Optional: AI Image Generation

```bash
# OpenAI API key for AI image generation (DALL-E 3)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-..."
```

## After Setup

1. Create the storage bucket:
   ```bash
   npx ts-node scripts/setup-lesson-illustrations-bucket.ts
   ```
   Or run the SQL in `supabase/migrations/001_create_lesson_illustrations_bucket.sql`
   in Supabase SQL Editor.

2. Restart dev server:
   ```
   npm run dev
   ```

## Vercel Deployment

Set these environment variables in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|-------------|
| `NEXTAUTH_SECRET` | your-secret | All |
| `NEXT_PUBLIC_SUPABASE_URL` | https://... | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... | All |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... | All |
| `OPENAI_API_KEY` | sk-... | All (optional) |
