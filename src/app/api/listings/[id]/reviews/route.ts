import { NextResponse } from 'next/server';
import { notFound, handle } from '@/server/http/errors';
import { simulateLatency } from '@/server/http/latency';
import { getListingRepository } from '@/server/repositories/listing.repository';
import { getReviewRepository } from '@/server/repositories/review.repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/listings/:id/reviews
 *
 * Existence is checked against the listing repository rather than inferred
 * from an empty review list: "this stay has no reviews yet" and "this listing
 * does not exist" are different answers and deserve different status codes.
 */
export function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await context.params;
    await simulateLatency();

    const listing = await getListingRepository().findById(id);
    if (!listing) throw notFound(`Listing ${id} was not found`);

    const reviews = await getReviewRepository().findByListingId(id);
    return NextResponse.json(reviews, {
      headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=600' },
    });
  });
}
