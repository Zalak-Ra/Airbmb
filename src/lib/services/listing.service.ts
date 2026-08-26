import { apiGet, apiSend } from '@/lib/api/client';
import type {
  Availability,
  Booking,
  GuestCounts,
  Listing,
  ListingId,
  Review,
} from '@/types/listing';

/**
 * The client's view of the API.
 *
 * This module used to route into an in-process mock. The signatures did not
 * change when the real backend landed — only the transport underneath them —
 * which is the payoff for having put a service boundary here in the first
 * place. React Query and every component above it were untouched.
 */

export async function fetchListing(id: ListingId, signal?: AbortSignal): Promise<Listing> {
  return apiGet<Listing>(`/api/listings/${encodeURIComponent(id)}`, signal);
}

export async function fetchReviews(
  listingId: ListingId,
  signal?: AbortSignal,
): Promise<readonly Review[]> {
  return apiGet<Review[]>(`/api/listings/${encodeURIComponent(listingId)}/reviews`, signal);
}

export async function fetchAvailability(
  listingId: ListingId,
  range?: { from: string; to: string },
  signal?: AbortSignal,
): Promise<Availability> {
  const query = range ? `?from=${range.from}&to=${range.to}` : '';
  return apiGet<Availability>(
    `/api/listings/${encodeURIComponent(listingId)}/availability${query}`,
    signal,
  );
}

export async function toggleSaved(id: ListingId, saved: boolean): Promise<Listing> {
  return apiSend<Listing>(`/api/listings/${encodeURIComponent(id)}/saved`, 'PUT', { saved });
}

export interface CreateBookingRequest {
  listingId: ListingId;
  checkIn: string;
  checkOut: string;
  guests: GuestCounts;
}

export async function createBooking(input: CreateBookingRequest): Promise<Booking> {
  return apiSend<Booking>('/api/bookings', 'POST', input);
}
