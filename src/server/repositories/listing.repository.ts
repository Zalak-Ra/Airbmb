import { CacheKeys, CacheTtl, getCache, type RedisLike } from '@/server/cache/redis';
import { getPrisma } from '@/server/db/prisma';
import { LISTING_FIXTURE } from '@/lib/data/fixtures';
import type { ListingRepository } from '@/server/repositories/contracts';
import { listingInclude, toListing } from '@/server/repositories/mappers';
import type { Listing, ListingId } from '@/types/listing';

/**
 * Read-through listing repository.
 *
 *   1. L1 cache (`listing:<id>:entity`)
 *   2. PostgreSQL via Prisma, assembled into the domain object
 *   3. Fallback fixture catalog (so Vercel/demo deployments render photos & data immediately)
 */
export class PrismaListingRepository implements ListingRepository {
  constructor(private readonly cache: RedisLike = getCache()) {}

  async findById(id: ListingId): Promise<Listing | null> {
    const cached = await this.cache.get<Listing>(CacheKeys.listing(id));
    if (cached) return cached;

    const db = getPrisma();
    if (db) {
      try {
        const row = await db.listing.findUnique({
          where: { id },
          include: listingInclude,
        });
        if (row) {
          const listing = toListing(row);
          await this.cache.set(CacheKeys.listing(id), listing, CacheTtl.listing);
          return listing;
        }
      } catch {
        // Database not reachable or unpopulated — fall through to fixture
      }
    }

    if (id === LISTING_FIXTURE.id) {
      await this.cache.set(CacheKeys.listing(id), LISTING_FIXTURE, CacheTtl.listing);
      return LISTING_FIXTURE;
    }
    return null;
  }

  /**
   * Write-through: Postgres is authoritative, then the cache entry is dropped.
   * Deleting rather than overwriting avoids publishing a value assembled from
   * a partial read if two saves land at once.
   */
  async setSaved(id: ListingId, saved: boolean): Promise<Listing> {
    const db = getPrisma();
    if (db) {
      const exists = await db.listing.findUnique({
        where: { id },
        select: { id: true },
      });
      if (exists) {
        await db.wishlist.upsert({
          where: { listingId: id },
          create: { listingId: id, saved },
          update: { saved },
        });
      }
    }

    await this.cache.del(CacheKeys.listing(id));

    const fresh = await this.findById(id);
    if (!fresh) throw new Error(`Listing ${id} vanished during save`);
    return fresh;
  }
}

let repo: PrismaListingRepository | null = null;

export function getListingRepository(): PrismaListingRepository {
  if (!repo) repo = new PrismaListingRepository();
  return repo;
}
