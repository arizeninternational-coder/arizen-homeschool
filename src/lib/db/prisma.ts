import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Force Prisma to use only DATABASE_URL (pooled connection on port 6543)
// by removing DIRECT_URL from the environment before creating the client.
// Vercel sets DIRECT_URL to port 5432 which doesn't work from serverless.
if (process.env.DIRECT_URL) {
  delete process.env.DIRECT_URL;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
