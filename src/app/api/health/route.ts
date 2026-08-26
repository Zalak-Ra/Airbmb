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
    const [listingCount, dbOk, cacheOk] = await Promise.all([
      getPrisma().listing.count(),
      getPrisma()
        .$queryRaw`SELECT 1`
        .then(() => true)
        .catch(() => false),
      cache.ping(),
    ]);

    return NextResponse.json({
      status: dbOk && cacheOk ? 'ok' : 'degraded',
      database: { engine: 'postgresql', ok: dbOk, listings: listingCount },
      cache: { ...cache.stats(), ok: cacheOk },
      uptimeSeconds: Math.round(process.uptime()),
    });
  });
}
