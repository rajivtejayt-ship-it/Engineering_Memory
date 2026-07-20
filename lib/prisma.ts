import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Creates the database client only when a database-backed request is handled.
 * This keeps module evaluation safe during builds, while preserving a clear
 * configuration error for requests that actually need the database.
 */
export function getPrisma(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({ adapter: new PrismaPg(databaseUrl) });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
