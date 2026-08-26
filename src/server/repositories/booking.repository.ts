import { randomUUID } from 'node:crypto';
import { Prisma, type PrismaClient } from '@prisma/client';
import { CacheKeys, CacheTtl, getCache, type RedisLike } from '@/server/cache/redis';
import { getPrisma } from '@/server/db/prisma';
import type { BookingRepository, CreateBookingInput } from '@/server/repositories/contracts';
import { fromDateOnly, toBooking, toDateOnly } from '@/server/repositories/mappers';
import { nightsBetween, nightsInRange, quote } from '@/lib/pricing';
import type { Availability, Booking, ListingId } from '@/types/listing';

type Db = PrismaClient | Prisma.TransactionClient;

/** Thrown when the requested nights overlap a confirmed stay or a host block. */
export class DatesUnavailableError extends Error {
  constructor(readonly conflicts: readonly string[]) {
    super(`Requested dates are unavailable: ${conflicts.join(', ')}`);
    this.name = 'DatesUnavailableError';
  }
}

export class ListingMissingError extends Error {
  constructor(id: ListingId) {
    super(`Listing ${id} does not exist`);
    this.name = 'ListingMissingError';
  }
}

function isRetryable(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
}

function isExclusionViolation(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  const meta = error.meta;
  if (!meta || typeof meta !== 'object') {
    return error.message.includes('bookings_no_overlap') || error.message.includes('23P01');
  }
  const code = (meta as Record<string, unknown>).code;
  if (code === undefined) {
    return error.message.includes('bookings_no_overlap') || error.message.includes('23P01');
  }
  return code === '23P01';
}

/**
 * Booking is the only place in this codebase where correctness beats latency.
 *
 * Two guests hitting Reserve on the same weekend is the classic double-sell
 * race. The guard is a Serializable transaction: the second request blocks
 * (or retries on P2034) until the first commits, then sees the row it needs
 * to reject against. Checking availability outside the transaction would be
 * a time-of-check/time-of-use bug that only shows up under load.
 *
 * The GiST exclusion constraint on `bookings` is the database's own copy of
 * this rule — if anything ever writes around this repository, Postgres still
 * refuses the overlap.
 */
export class PrismaBookingRepository implements BookingRepository {
  constructor(private readonly cache: RedisLike = getCache()) {}

  async findAvailability(listingId: ListingId, from: string, to: string): Promise<Availability> {
    const key = CacheKeys.availability(listingId, from, to);
    const cached = await this.cache.get<Availability>(key);
    if (cached) return cached;

    let unavailable: string[] = [];
    try {
      unavailable = await this.readUnavailable(getPrisma(), listingId, from, to);
    } catch {
      // DB unreachable
    }

    const availability: Availability = {
      listingId,
      unavailable,
      rangeStart: from,
      rangeEnd: to,
    };

    await this.cache.set(key, availability, CacheTtl.availability);
    return availability;
  }

  /**
   * Every occupied night in `[from, to)`, from both sources of truth.
   *
   * The overlap predicate is the standard half-open interval test:
   * two spans collide unless one ends on or before the other begins.
   * Using `<`/`>` rather than `<=`/`>=` is what lets one guest check out on
   * the same morning another checks in.
   */
  private async readUnavailable(
    db: Db,
    listingId: ListingId,
    from: string,
    to: string,
  ): Promise<string[]> {
    const fromDate = toDateOnly(from);
    const toDate = toDateOnly(to);

    const blocked = await db.blockedNight.findMany({
      where: { listingId, night: { gte: fromDate, lt: toDate } },
      select: { night: true },
    });

    const booked = await db.booking.findMany({
      where: {
        listingId,
        status: 'confirmed',
        checkIn: { lt: toDate },
        checkOut: { gt: fromDate },
      },
      select: { checkIn: true, checkOut: true },
    });

    const nights = new Set(blocked.map((row) => fromDateOnly(row.night)));
    for (const stay of booked) {
      for (const night of nightsInRange(fromDateOnly(stay.checkIn), fromDateOnly(stay.checkOut))) {
        if (night >= from && night < to) nights.add(night);
      }
    }

    return Array.from(nights).sort();
  }

  async create(input: CreateBookingInput): Promise<Booking> {
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const prisma = getPrisma();

    const row = await this.withSerializationRetry(() =>
      prisma.$transaction(
        async (tx) => {
          const listing = await tx.listing.findUnique({
            where: { id: input.listingId },
            select: { nightPrice: true, cleaningFee: true },
          });
          if (!listing) throw new ListingMissingError(input.listingId);

          const conflicts = await this.readUnavailable(
            tx,
            input.listingId,
            input.checkIn,
            input.checkOut,
          );
          if (conflicts.length > 0) throw new DatesUnavailableError(conflicts);

          const priced = quote({
            nightPrice: listing.nightPrice,
            cleaningFee: listing.cleaningFee,
            nights,
          });
          if (!priced) throw new Error('Cannot price a stay of zero nights');

          return tx.booking.create({
            data: {
              id: randomUUID(),
              listingId: input.listingId,
              checkIn: toDateOnly(input.checkIn),
              checkOut: toDateOnly(input.checkOut),
              adults: input.guests.adults,
              children: input.guests.children,
              infants: input.guests.infants,
              pets: input.guests.pets,
              nights: priced.nights,
              nightSubtotal: priced.nightSubtotal,
              cleaningFee: priced.cleaningFee,
              serviceFee: priced.serviceFee,
              taxes: priced.taxes,
              total: priced.total,
              status: 'confirmed',
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ),
    );

    await this.cache.delByPrefix(CacheKeys.listingPrefix(input.listingId));
    return toBooking(row);
  }

  /**
   * Serializable isolation can abort a transaction with P2034 when two
   * writers collide. Retrying is the correct response — the second attempt
   * will see the committed booking and throw DatesUnavailableError instead.
   */
  private async withSerializationRetry<T>(work: () => Promise<T>, attempts = 3): Promise<T> {
    let last: unknown;
    for (let i = 0; i < attempts; i += 1) {
      try {
        return await work();
      } catch (error) {
        if (isExclusionViolation(error)) {
          throw new DatesUnavailableError([]);
        }
        if (!isRetryable(error) || i === attempts - 1) throw error;
        last = error;
      }
    }
    throw last instanceof Error ? last : new Error('Booking transaction failed');
  }

  async findById(id: string): Promise<Booking | null> {
    const row = await getPrisma().booking.findUnique({ where: { id } });
    return row ? toBooking(row) : null;
  }

  async findByListingId(listingId: ListingId): Promise<readonly Booking[]> {
    const rows = await getPrisma().booking.findMany({
      where: { listingId },
      orderBy: { checkIn: 'asc' },
    });
    return rows.map(toBooking);
  }
}

let repo: PrismaBookingRepository | null = null;

export function getBookingRepository(): PrismaBookingRepository {
  if (!repo) repo = new PrismaBookingRepository();
  return repo;
}
