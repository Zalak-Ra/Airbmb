import { NextResponse } from 'next/server';
import { ApiError, invalidRequest, handle } from '@/server/http/errors';
import { simulateLatency } from '@/server/http/latency';
import { createBookingSchema, parseOrThrow, readJson } from '@/server/http/validation';
import {
  DatesUnavailableError,
  ListingMissingError,
  getBookingRepository,
} from '@/server/repositories/booking.repository';
import { getListingRepository } from '@/server/repositories/listing.repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/bookings
 *
 * The request carries dates and guests — never a price. The repository
 * re-derives the total from the stored nightly rate inside the same
 * transaction that checks availability, so a client that tampers with the
 * quote gets charged the real number.
 *
 * A conflict is a 409, not a 422: the request was well-formed, the world just
 * changed underneath it. The client distinguishes the two to decide whether
 * to highlight a field or refetch the calendar.
 */
export function POST(request: Request) {
  return handle(async () => {
    const body = parseOrThrow(createBookingSchema, await readJson(request));
    await simulateLatency();

    const listing = await getListingRepository().findById(body.listingId);
    if (!listing) throw new ApiError('not_found', `Listing ${body.listingId} was not found`);

    const headcount = body.guests.adults + body.guests.children;
    if (headcount > listing.guests) {
      throw invalidRequest(`This place sleeps ${listing.guests} guests`, {
        maxGuests: listing.guests,
        requested: headcount,
      });
    }

    try {
      const booking = await getBookingRepository().create({
        listingId: body.listingId,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        guests: body.guests,
      });
      return NextResponse.json(booking, { status: 201, headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
      if (error instanceof DatesUnavailableError) {
        throw new ApiError('dates_unavailable', 'Those nights are already taken', {
          conflicts: error.conflicts,
        });
      }
      if (error instanceof ListingMissingError) {
        throw new ApiError('not_found', error.message);
      }
      throw error;
    }
  });
}

/** GET /api/bookings?listingId=… — the stays behind the blocked calendar nights. */
export function GET(request: Request) {
  return handle(async () => {
    const listingId = new URL(request.url).searchParams.get('listingId');
    if (!listingId) throw invalidRequest('`listingId` query parameter is required');

    const bookings = await getBookingRepository().findByListingId(listingId);
    return NextResponse.json(bookings, { headers: { 'Cache-Control': 'no-store' } });
  });
}
