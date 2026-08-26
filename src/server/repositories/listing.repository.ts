import { CacheKeys, CacheTtl, getCache, type RedisLike } from '@/server/cache/redis';
import { getPrisma } from '@/server/db/prisma';
import type { ListingRepository } from '@/server/repositories/contracts';
import { listingInclude, toListing } from '@/server/repositories/mappers';
import type { Listing, ListingId } from '@/types/listing';

/**
 * Read-through listing repository.
 *
 *   1. L1 cache (`listing:<id>:entity`)
 *   2. PostgreSQL via Prisma, assembled into the domain object
 *   3. null, which the service turns into a 404
 *
 * Nested `include` is the right shape here: Postgres is a network hop, so one
 * round trip beats the five sequential queries that were free against SQLite.
 */
export class PrismaListingRepository implements ListingRepository {
  constructor(private readonly cache: RedisLike = getCache()) {}

  async findById(id: ListingId): Promise<Listing | null> {
    const cached = await this.cache.get<Listing>(CacheKeys.listing(id));
    if (cached) return cached;

    const row = await getPrisma().listing.findUnique({
      where: { id },
      include: listingInclude,
    });
    if (!row) return null;

    const listing = toListing(row);
    await this.cache.set(CacheKeys.listing(id), listing, CacheTtl.listing);
    return listing;
  }

  /**
   * Write-through: Postgres is authoritative, then the cache entry is dropped.
   * Deleting rather than overwriting avoids publishing a value assembled from
   * a partial read if two saves land at once.
   */
  async setSaved(id: ListingId, saved: boolean): Promise<Listing> {
    const exists = await getPrisma().listing.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new Error(`Listing ${id} does not exist`);

    await getPrisma().wishlist.upsert({
      where: { listingId: id },
      create: { listingId: id, saved },
      update: { saved },
    });

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
