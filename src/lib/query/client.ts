import { QueryClient } from '@tanstack/react-query';
import { ApiRequestError } from '@/lib/api/client';
import type { Listing, ListingId } from '@/types/listing';

/**
 * Query-key factory.
 * Why a factory: typos in string keys are the most common cause of a cache
 * that will not invalidate. Keys are also hierarchical — everything for one
 * listing shares a prefix, so a booking can drop that listing's whole subtree
 * with a single `invalidateQueries`.
 */
export const queryKeys = {
  listingRoot: (id: ListingId) => ['listing', id] as const,
  listing: (id: ListingId) => ['listing', id, 'entity'] as const,
  reviews: (id: ListingId) => ['listing', id, 'reviews'] as const,
  availability: (id: ListingId) => ['listing', id, 'availability'] as const,
};

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        /**
         * Retrying a 404 or a validation failure just delays the error state —
         * the answer will not change. Only transient faults are worth a second
         * attempt.
         */
        retry: (failureCount, error) => {
          if (error instanceof ApiRequestError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

export function patchListingSaved(
  client: QueryClient,
  id: ListingId,
  saved: boolean,
): Listing | undefined {
  const key = queryKeys.listing(id);
  const current = client.getQueryData<Listing>(key);
  if (!current) return undefined;
  client.setQueryData<Listing>(key, { ...current, saved });
  return current;
}
