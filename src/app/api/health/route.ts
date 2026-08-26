import { NextResponse } from 'next/server';
import { getCache } from '@/server/cache/redis';
import { getPrisma } from '@/server/db/prisma';
import { handle } from '@/server/http/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Liveness plus cache telemetry.
 *
 * Reload the listing a few times and watch the hit rate climb, then wait out
 * the 60s TTL and watch it dip. That feedback loop is why `/api/health`
 * reports cache stats instead of a bare `{ ok: true }`.
 */
export function GET() {
  return handle(async () => {
    const cache = getCache();
    const db = getPrisma();
    let listingCount = 0;
    let dbOk = false;

    if (db) {
      try {
        [listingCount, dbOk] = await Promise.all([
          db.listing.count(),
          db.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
        ]);
      } catch {
        dbOk = false;
      }
    }

    const cacheOk = await cache.ping();

    return NextResponse.json({
      status: 'ok',
      database: { engine: db ? 'postgresql' : 'demo-in-memory', ok: dbOk, listings: listingCount },
      cache: { ...cache.stats(), ok: cacheOk },
      uptimeSeconds: Math.round(process.uptime()),
    });
  });
}
