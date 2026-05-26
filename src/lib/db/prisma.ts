import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Force pooled connection (port 6543) for serverless environments.
function getDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  
  // Already pooled — no override needed
  if (url.includes(":6543/")) return undefined;
  
  // Replace direct connection (5432) with pooled (6543)
  if (url.includes(":5432/")) {
    let pooled = url.replace(":5432/", ":6543/");
    if (!pooled.includes("pgbouncer=")) {
      pooled = pooled.replace("?sslmode=require", "?pgbouncer=true&connection_limit=5&sslmode=require");
    }
    return pooled;
  }
  
  return undefined;
}

const datasourceUrl = getDatasourceUrl();

// Debug: log to Vercel function logs
if (typeof process !== "undefined" && process.env.VERCEL) {
  console.log("[PRISMA] DATABASE_URL port:", process.env.DATABASE_URL?.match(/:(\d+)\//)?.[1] || "unknown");
  console.log("[PRISMA] Override applied:", !!datasourceUrl);
  if (datasourceUrl) {
    console.log("[PRISMA] Pooled URL port:", datasourceUrl.match(/:(\d+)\//)?.[1]);
  }
}

const prismaOptions = datasourceUrl
  ? { datasources: { db: { url: datasourceUrl } } }
  : {};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
