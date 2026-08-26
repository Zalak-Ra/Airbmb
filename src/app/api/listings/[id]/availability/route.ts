import { NextResponse } from 'next/server';
import { notFound, handle } from '@/server/http/errors';
import { simulateLatency } from '@/server/http/latency';
import { availabilitySchema, parseOrThrow } from '@/server/http/validation';
import { getBookingRepository } from '@/server/repositories/booking.repository';
import { getListingRepository } from '@/server/repositories/listing.repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_WINDOW_DAYS = 180;

function isoDay(offsetDays: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

/**
 * GET /api/listings/:id/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Returns the nights that cannot be booked, not the ones that can. An
 * exclusion list is bounded by how busy the calendar is; an inclusion list
 * grows with the size of the window, so a two-year lookahead would ship
 * hundreds of dates the calendar already knows how to render.
 *
 * `no-store`: this is the one payload where serving a stale copy can sell the
 * same night twice.
 */
export function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await context.params;
    const url = new URL(request.url);
    const params = parseOrThrow(availabilitySchema, {
      from: url.searchParams.get('from') ?? isoDay(0),
      to: url.searchParams.get('to') ?? isoDay(DEFAULT_WINDOW_DAYS),
    });

    await simulateLatency();

    const listing = await getListingRepository().findById(id);
    if (!listing) throw notFound(`Listing ${id} was not found`);

    const availability = await getBookingRepository().findAvailability(
      id,
      params.from,
      params.to,
    );

    return NextResponse.json(availability, { headers: { 'Cache-Control': 'no-store' } });
  });
}
