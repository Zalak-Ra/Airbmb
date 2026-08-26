import type { BookingQuote } from '@/types/listing';

/**
 * Pricing rules, shared by the browser and the API.
 *
 * Why one module instead of two: the booking card needs an instant quote to
 * render, but the server must never trust a number that arrived over the
 * wire. Both call this function; the server's result is the one that gets
 * written. If the two ever disagree the request is rejected rather than
 * silently charging the client's figure.
 */

export const SERVICE_FEE_RATE = 0.141;
export const TAX_RATE = 0.09;

export interface PriceInputs {
  readonly nightPrice: number;
  readonly cleaningFee: number;
  readonly nights: number;
}

export function quote({ nightPrice, cleaningFee, nights }: PriceInputs): BookingQuote | null {
  if (nights <= 0) return null;
  const nightSubtotal = nights * nightPrice;
  const serviceFee = Math.round(nightSubtotal * SERVICE_FEE_RATE);
  const taxes = Math.round(nightSubtotal * TAX_RATE);
  return {
    nights,
    nightSubtotal,
    cleaningFee,
    serviceFee,
    taxes,
    total: nightSubtotal + cleaningFee + serviceFee + taxes,
  };
}

/** Nights between two `YYYY-MM-DD` dates. Checkout day is not a night. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

/** Every night occupied by a stay. Checkout day is excluded — it frees up. */
export function nightsInRange(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  const cursor = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  while (cursor < end) {
    nights.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return nights;
}

export function toIsoDate(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}`;
}
