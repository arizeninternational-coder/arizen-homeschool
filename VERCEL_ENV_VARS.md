# Vercel Environment Variables Setup

Go to Vercel Dashboard → Project → Settings → Environment Variables

Add these for Production, Preview, and Development:

## Database (Required)
DATABASE_URL=postgresql://postgres:vKyKdWGad2ctmRlx@db.hgufndnqbvcukbxmwtvo.supabase.co:6543/postgres?pgbouncer=true&connection_limit=5&sslmode=require
DIRECT_URL=postgresql://postgres:vKyKdWGad2ctmRlx@db.hgufndnqbvcukbxmwtvo.supabase.co:5432/postgres?sslmode=require

## Auth (Required)
NEXTAUTH_URL=https://your-production-url.vercel.app
NEXTAUTH_SECRET=generate-a-new-random-secret-32-chars-min
NEXT_PUBLIC_APP_NAME=Arizen School
NEXT_PUBLIC_APP_URL=https://your-production-url.vercel.app

## Important Notes
- Replace NEXTAUTH_URL and NEXT_PUBLIC_APP_URL with your actual Vercel URL
- Generate a new NEXTAUTH_SECRET (use: openssl rand -base64 32)
- After changing env vars, redeploy the app
- Make sure Supabase database is not paused
