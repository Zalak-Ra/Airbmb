import { NextResponse } from 'next/server';
import { notFound, handle } from '@/server/http/errors';
import { simulateLatency } from '@/server/http/latency';
import { parseOrThrow, readJson, savedSchema } from '@/server/http/validation';
import { getListingRepository } from '@/server/repositories/listing.repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PUT /api/listings/:id/saved
 *
 * PUT rather than POST because the wishlist heart is idempotent: the client
 * sends the state it wants, not a toggle. Sending "flip it" would make a
 * retried request undo itself, which is exactly the bug an optimistic UI with
 * automatic retries would produce.
 */
export function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await context.params;
    const body = parseOrThrow(savedSchema, await readJson(request));
    await simulateLatency();

    const repo = getListingRepository();
    const existing = await repo.findById(id);
    if (!existing) throw notFound(`Listing ${id} was not found`);

    const listing = await repo.setSaved(id, body.saved);
    return NextResponse.json(listing, { headers: { 'Cache-Control': 'no-store' } });
  });
}
