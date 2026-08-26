import 'server-only';
import { PrismaClient } from '@prisma/client';

/**
 * Process-wide Prisma client.
 *
 * Held on `globalThis` for the same reason the old SQLite handle was: Next
 * compiles each route handler into its own bundle, so a module-level `let`
 * would open a new pool per route and exhaust Postgres `max_connections`
 * the moment you hit listing + reviews + availability in one page load.
 */

const globals = globalThis as typeof globalThis & { __airPrisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globals.__airPrisma) {
    globals.__airPrisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return globals.__airPrisma;
}
