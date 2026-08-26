import type {
  Availability,
  Booking,
  GuestCounts,
  Listing,
  ListingId,
  Review,
} from '@/types/listing';

/**
 * Storage contracts.
 *
 * These interfaces are the seam in the architecture diagram: today every
 * implementation talks to one SQLite file, but in production the listing
 * catalog is Postgres, reviews are a Mongo collection, and availability is
 * served from a booking service. Because the services depend on these types
 * and not on `DatabaseSync`, that migration replaces files in this folder and
 * touches nothing above it.
 */

export interface ListingRepository {
  findById(id: ListingId): Promise<Listing | null>;
  setSaved(id: ListingId, saved: boolean): Promise<Listing>;
}

export interface ReviewRepository {
  findByListingId(listingId: ListingId): Promise<readonly Review[]>;
}

export interface CreateBookingInput {
  readonly listingId: ListingId;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly guests: GuestCounts;
}

export interface BookingRepository {
  findAvailability(listingId: ListingId, from: string, to: string): Promise<Availability>;
  /** Must be atomic: the conflict check and the insert share one transaction. */
  create(input: CreateBookingInput): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  findByListingId(listingId: ListingId): Promise<readonly Booking[]>;
}
