import { NextResponse } from 'next/server';
import { notFound, handle } from '@/server/http/errors';
import { simulateLatency } from '@/server/http/latency';
import { getListingRepository } from '@/server/repositories/listing.repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/listings/:id
 *
 * `Cache-Control` mirrors the L1 TTL so a CDN in front of this route would
 * expire on the same schedule the origin cache does. `stale-while-revalidate`
 * is the HTTP-level twin of what React Query does in the browser.
 */
export function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await context.params;
    await simulateLatency();

    const listing = await getListingRepository().findById(id);
    if (!listing) throw notFound(`Listing ${id} was not found`);

    return NextResponse.json(listing, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
    });
  });
}
