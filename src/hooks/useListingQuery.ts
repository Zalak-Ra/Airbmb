'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patchListingSaved, queryKeys } from '@/lib/query/client';
import {
  createBooking,
  fetchAvailability,
  fetchListing,
  fetchReviews,
  toggleSaved,
  type CreateBookingRequest,
} from '@/lib/services/listing.service';
import { DEFAULT_LISTING_ID, type ListingId } from '@/types/listing';

export function useListingQuery(id: ListingId = DEFAULT_LISTING_ID) {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: ({ signal }) => fetchListing(id, signal),
  });
}

export function useReviewsQuery(id: ListingId = DEFAULT_LISTING_ID, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reviews(id),
    queryFn: ({ signal }) => fetchReviews(id, signal),
    enabled,
  });
}

/**
 * Blocked calendar nights.
 *
 * `staleTime: 0` on purpose: this is the one query where showing a cached
 * answer can let a guest pick a night that sold thirty seconds ago. Everything
 * else in the app trades freshness for speed; availability does the opposite.
 */
export function useAvailabilityQuery(id: ListingId = DEFAULT_LISTING_ID) {
  return useQuery({
    queryKey: queryKeys.availability(id),
    queryFn: ({ signal }) => fetchAvailability(id, undefined, signal),
    staleTime: 0,
  });
}

/**
 * Optimistic wishlist toggle.
 * Why: the heart appears in the title row and again in the lightbox. Waiting
 * on a round trip would make both feel broken. We snapshot, patch, and roll
 * back if the server disagrees.
 */
export function useToggleSaved(id: ListingId = DEFAULT_LISTING_ID) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (saved: boolean) => toggleSaved(id, saved),
    onMutate: async (saved) => {
      await client.cancelQueries({ queryKey: queryKeys.listing(id) });
      return { previous: patchListingSaved(client, id, saved) };
    },
    onError: (_error, _saved, context) => {
      if (context?.previous) {
        client.setQueryData(queryKeys.listing(id), context.previous);
      }
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: queryKeys.listing(id) });
    },
  });
}

/**
 * Reservation.
 *
 * Deliberately *not* optimistic. A wishlist heart is safe to guess at because
 * being wrong costs nothing; a booking that renders as confirmed and then
 * evaporates is the worst failure this UI can produce. We wait for the server,
 * then invalidate the listing subtree so the calendar reflects the new stay.
 */
export function useCreateBooking(id: ListingId = DEFAULT_LISTING_ID) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateBookingRequest, 'listingId'>) =>
      createBooking({ ...input, listingId: id }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.listingRoot(id) });
    },
  });
}
