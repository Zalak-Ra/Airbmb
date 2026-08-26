import type {
  Amenity,
  AmenityIconName,
  Booking,
  Highlight,
  Host,
  Listing,
  ListingPhoto,
  Review,
} from '@/types/listing';
import type { Prisma } from '@prisma/client';

/**
 * Prisma include graph → domain objects.
 *
 * Why this file still exists after leaving SQLite: Postgres returns real
 * booleans and Date values, but it still is not the domain. `saved` is a
 * wishlist row, `host.languages` is a join table, `checkIn` is a DATE that
 * the API must serialise as `YYYY-MM-DD`. The UI never imports `@prisma/client`.
 */

export const listingInclude = {
  host: { include: { languages: true } },
  photos: { orderBy: { position: 'asc' as const } },
  amenities: {
    include: { amenity: true },
    orderBy: { position: 'asc' as const },
  },
  highlights: { orderBy: { position: 'asc' as const } },
  houseRules: { orderBy: { position: 'asc' as const } },
  safetyItems: { orderBy: { position: 'asc' as const } },
  wishlist: true,
} satisfies Prisma.ListingInclude;

export type ListingRecord = Prisma.ListingGetPayload<{ include: typeof listingInclude }>;
export type ReviewRecord = Prisma.ReviewGetPayload<object>;
export type BookingRecord = Prisma.BookingGetPayload<object>;

/** Calendar date at UTC midnight — the only instant a DATE column should ever be. */
export function toDateOnly(iso: string): Date {
  const parsed = Date.parse(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) throw new Error(`Invalid calendar date: ${iso}`);
  return new Date(parsed);
}

export function fromDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function toHost(row: ListingRecord['host']): Host {
  return {
    name: row.name,
    avatarSrc: row.avatarSrc,
    isSuperhost: row.isSuperhost,
    hostingYears: row.hostingYears,
    reviewCount: row.reviewCount,
    rating: row.rating,
    livesIn: row.livesIn,
    responseRate: row.responseRate,
    responseTime: row.responseTime,
    bio: row.bio,
    languages: row.languages.map((entry) => entry.language),
  };
}

export function toPhoto(row: ListingRecord['photos'][number]): ListingPhoto {
  return {
    id: row.id,
    src: row.src,
    alt: row.alt,
    width: row.width,
    height: row.height,
    category: row.category,
    caption: row.caption,
  };
}

export function toAmenity(row: ListingRecord['amenities'][number]): Amenity {
  return {
    id: row.amenity.id,
    label: row.amenity.label,
    icon: row.amenity.icon as AmenityIconName,
    featured: row.featured,
  };
}

export function toHighlight(row: ListingRecord['highlights'][number]): Highlight {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    icon: row.icon,
  };
}

export function toReview(row: ReviewRecord): Review {
  return {
    id: row.id,
    listingId: row.listingId,
    author: row.author,
    avatarSrc: row.avatarSrc,
    dateLabel: row.dateLabel,
    yearsOnAirbnb: row.yearsOnAirbnb,
    rating: row.rating,
    stayLabel: row.stayLabel,
    text: row.body,
  };
}

export function toBooking(row: BookingRecord): Booking {
  return {
    id: row.id,
    listingId: row.listingId,
    checkIn: fromDateOnly(row.checkIn),
    checkOut: fromDateOnly(row.checkOut),
    guests: {
      adults: row.adults,
      children: row.children,
      infants: row.infants,
      pets: row.pets,
    },
    quote: {
      nights: row.nights,
      nightSubtotal: row.nightSubtotal,
      cleaningFee: row.cleaningFee,
      serviceFee: row.serviceFee,
      taxes: row.taxes,
      total: row.total,
    },
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toListing(row: ListingRecord): Listing {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    locationLabel: row.locationLabel,
    neighborhood: row.neighborhood,
    city: row.city,
    country: row.country,
    lat: row.lat,
    lng: row.lng,
    locationBlurb: row.locationBlurb,
    propertyType: row.propertyType,
    guests: row.guests,
    bedrooms: row.bedrooms,
    beds: row.beds,
    baths: row.baths,
    nightPrice: row.nightPrice,
    cleaningFee: row.cleaningFee,
    airbnbFee: row.airbnbFee,
    rating: row.rating,
    reviewCount: row.reviewCount,
    isSuperhost: row.isSuperhost,
    isGuestFavorite: row.isGuestFavorite,
    saved: row.wishlist?.saved ?? false,
    description: row.description,
    descriptionExtra: row.descriptionExtra,
    photos: row.photos.map(toPhoto),
    amenities: row.amenities.map(toAmenity),
    highlights: row.highlights.map(toHighlight),
    host: toHost(row.host),
    breakdown: {
      cleanliness: row.scoreCleanliness,
      accuracy: row.scoreAccuracy,
      checkIn: row.scoreCheckIn,
      communication: row.scoreCommunication,
      location: row.scoreLocation,
      value: row.scoreValue,
    },
    houseRules: row.houseRules.map((rule) => rule.body),
    safety: row.safetyItems.map((item) => item.body),
    cancellation: row.cancellation,
    checkInWindow: row.checkInWindow,
    checkOutTime: row.checkOutTime,
  };
}
