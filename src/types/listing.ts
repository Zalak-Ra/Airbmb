/**
 * Domain model for the listing bounded context.
 *
 * Why a dedicated types module: the Redis cache, Prisma repositories, and
 * React Query layer must share one canonical shape. If each layer invented its
 * own DTO, optimistic updates would silently desync the booking card from the
 * photo tour.
 */

export type ListingId = string;
export type PhotoId = string;
export type ReviewId = string;

export type PhotoCategory =
  | 'living'
  | 'bedroom'
  | 'kitchen'
  | 'dining'
  | 'pool'
  | 'exterior'
  | 'bathroom'
  | 'workspace'
  | 'outdoor';

export interface ListingPhoto {
  readonly id: PhotoId;
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly category: PhotoCategory;
  readonly caption: string;
}

export interface Amenity {
  readonly id: string;
  readonly label: string;
  readonly icon: AmenityIconName;
  readonly featured: boolean;
}

export type AmenityIconName =
  | 'wifi'
  | 'kitchen'
  | 'parking'
  | 'pool'
  | 'hdtv'
  | 'washer'
  | 'ac'
  | 'workspace'
  | 'yard'
  | 'fireplace'
  | 'ev'
  | 'alarm'
  | 'gym'
  | 'hot-tub'
  | 'bbq'
  | 'coffee'
  | 'hair-dryer'
  | 'self-checkin'
  | 'beach'
  | 'ski';

export interface Highlight {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly icon: 'checkin' | 'superhost' | 'location' | 'cancellation';
}

export interface Host {
  readonly name: string;
  readonly avatarSrc: string;
  readonly isSuperhost: boolean;
  readonly hostingYears: number;
  readonly reviewCount: number;
  readonly rating: number;
  readonly livesIn: string;
  readonly responseRate: number;
  readonly responseTime: string;
  readonly bio: string;
  readonly languages: readonly string[];
}

export interface RatingBreakdown {
  readonly cleanliness: number;
  readonly accuracy: number;
  readonly checkIn: number;
  readonly communication: number;
  readonly location: number;
  readonly value: number;
}

export interface Review {
  readonly id: ReviewId;
  readonly listingId: ListingId;
  readonly author: string;
  readonly avatarSrc: string;
  readonly dateLabel: string;
  readonly yearsOnAirbnb: number;
  readonly rating: number;
  readonly stayLabel: string;
  readonly text: string;
}

export interface CalendarDay {
  readonly iso: string;
  readonly available: boolean;
  readonly price: number;
}

export interface Listing {
  readonly id: ListingId;
  readonly title: string;
  readonly subtitle: string;
  readonly locationLabel: string;
  readonly neighborhood: string;
  readonly city: string;
  readonly country: string;
  readonly lat: number;
  readonly lng: number;
  readonly locationBlurb: string;
  readonly propertyType: string;
  readonly guests: number;
  readonly bedrooms: number;
  readonly beds: number;
  readonly baths: number;
  readonly nightPrice: number;
  readonly cleaningFee: number;
  readonly airbnbFee: number;
  readonly rating: number;
  readonly reviewCount: number;
  readonly isSuperhost: boolean;
  readonly isGuestFavorite: boolean;
  readonly saved: boolean;
  readonly description: string;
  readonly descriptionExtra: string;
  readonly photos: readonly ListingPhoto[];
  readonly amenities: readonly Amenity[];
  readonly highlights: readonly Highlight[];
  readonly host: Host;
  readonly breakdown: RatingBreakdown;
  readonly houseRules: readonly string[];
  readonly safety: readonly string[];
  readonly cancellation: string;
  readonly checkInWindow: string;
  readonly checkOutTime: string;
}

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface DateRange {
  checkIn: Date | null;
  checkOut: Date | null;
}

export interface BookingQuote {
  readonly nights: number;
  readonly nightSubtotal: number;
  readonly cleaningFee: number;
  readonly serviceFee: number;
  readonly taxes: number;
  readonly total: number;
}

export type BookingStatus = 'confirmed' | 'cancelled';

/**
 * A persisted reservation. `checkIn`/`checkOut` are calendar dates
 * (`YYYY-MM-DD`), not instants: a stay is a span of local nights, and
 * modelling it as a UTC timestamp is how you end up off-by-one across
 * timezones.
 */
export interface Booking {
  readonly id: string;
  readonly listingId: ListingId;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly guests: GuestCounts;
  readonly quote: BookingQuote;
  readonly status: BookingStatus;
  readonly createdAt: string;
}

export interface Availability {
  readonly listingId: ListingId;
  /** Calendar dates (`YYYY-MM-DD`) that cannot be booked. */
  readonly unavailable: readonly string[];
  readonly rangeStart: string;
  readonly rangeEnd: string;
}

export const DEFAULT_LISTING_ID = 'desert-horizon-villa' as const;
