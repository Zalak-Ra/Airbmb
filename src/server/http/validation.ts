import { z } from 'zod';
import { invalidRequest } from '@/server/http/errors';

/**
 * Request validation lives at the edge of the server, never inside a
 * repository. By the time a value reaches SQL it is already the right type,
 * which is why the repositories can take plain domain objects and stay free
 * of defensive checks.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a calendar date in YYYY-MM-DD form')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'Not a real date');

export const savedSchema = z.object({
  saved: z.boolean(),
});

export const availabilitySchema = z
  .object({
    from: isoDate,
    to: isoDate,
  })
  .refine((value) => value.from < value.to, {
    message: '`to` must be after `from`',
    path: ['to'],
  });

export const createBookingSchema = z
  .object({
    listingId: z.string().min(1),
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.object({
      adults: z.number().int().min(1).max(16),
      children: z.number().int().min(0).max(16),
      infants: z.number().int().min(0).max(5),
      pets: z.number().int().min(0).max(5),
    }),
  })
  .refine((value) => value.checkIn < value.checkOut, {
    message: 'Checkout must be after check-in',
    path: ['checkOut'],
  });

export type CreateBookingBody = z.infer<typeof createBookingSchema>;

/**
 * Parses with a schema and converts a Zod failure into a 422 `ApiError`.
 *
 * Issues are reduced to `{ path, message }` rather than forwarded whole: Zod's
 * internal issue objects carry codes and expected/received types that are
 * useful in a log and noise in a response body.
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw invalidRequest('Request failed validation', { fields });
  }
  return result.data;
}

/** `request.json()` throws on an empty or malformed body; that is a 422, not a 500. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw invalidRequest('Body must be valid JSON');
  }
}
