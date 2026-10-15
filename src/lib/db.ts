import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaSchema?: string };

// Every model and column of the generated client. It changes whenever `prisma generate` runs on a new schema.
const schema = JSON.stringify(
  Object.entries(Prisma)
    .filter(([key]) => key.endsWith("ScalarFieldEnum"))
    .map(([key, fields]) => [key, Object.keys(fields as object)]),
);

/**
 * The kept client only works if it was built from the current schema. After a migration adds a model or
 * drops a column, a dev server started earlier still holds the old client, which would query tables or
 * columns that no longer match. Then a fresh client replaces it.
 */
function reusable(client: PrismaClient | undefined): client is PrismaClient {
  if (!client) return false;
  if (globalForPrisma.prismaSchema === schema) return true;
  void client.$disconnect().catch(() => {});
  return false;
}

// The pool connects on the first query, so `next build` runs without DATABASE_URL.
export const db = reusable(globalForPrisma.prisma) ? globalForPrisma.prisma : new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaSchema = schema;
}
