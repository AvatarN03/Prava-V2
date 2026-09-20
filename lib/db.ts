import { Pool, PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error("Neither DATABASE_URL nor DIRECT_URL is configured in environment");
  }

  // Configure pg Pool for serverless / edge-friendly connection management
  const poolConfig: PoolConfig = {
    connectionString,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  const pool = globalForPrisma.pgPool ?? new Pool(poolConfig);
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// In development, if schema updated and cached singleton lacks new models, recreate client
if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  !("subscription" in globalForPrisma.prisma)
) {
  globalForPrisma.prisma = undefined;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export function getDb(): PrismaClient {
  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    !("subscription" in globalForPrisma.prisma)
  ) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma ?? db;
}


