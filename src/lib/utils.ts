import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { quote } from '@/lib/pricing';
import type { BookingQuote, DateRange, Listing } from '@/types/listing';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRating(value: number): string {
  return value.toFixed(2).replace(/0$/, '').replace(/\.0$/, '');
}

export function nightCount(range: DateRange): number {
  if (!range.checkIn || !range.checkOut) return 0;
  const ms = range.checkOut.getTime() - range.checkIn.getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/** Preview quote for the booking card. The API recomputes it before writing. */
export function quoteBooking(listing: Listing, range: DateRange): BookingQuote | null {
  return quote({
    nightPrice: listing.nightPrice,
    cleaningFee: listing.cleaningFee,
    nights: nightCount(range),
  });
}

export function photoCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    living: 'Living room',
    bedroom: 'Bedroom',
    kitchen: 'Kitchen',
    dining: 'Dining area',
    pool: 'Pool',
    exterior: 'Exterior',
    bathroom: 'Full bathroom',
    workspace: 'Dedicated workspace',
    outdoor: 'Outdoor space',
  };
  return labels[category] ?? category;
}
