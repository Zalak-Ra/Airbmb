import { CacheKeys, CacheTtl, getCache, type RedisLike } from '@/server/cache/redis';
import { getPrisma } from '@/server/db/prisma';
import { LISTING_FIXTURE, REVIEW_FIXTURES } from '@/lib/data/fixtures';
import type { ReviewRepository } from '@/server/repositories/contracts';
import { toReview } from '@/server/repositories/mappers';
import type { ListingId, Review } from '@/types/listing';

/**
 * Reviews are cached separately from the listing and with a longer TTL.
 */
export class PrismaReviewRepository implements ReviewRepository {
  constructor(private readonly cache: RedisLike = getCache()) {}

  async findByListingId(listingId: ListingId): Promise<readonly Review[]> {
    const key = CacheKeys.reviews(listingId);
    const cached = await this.cache.get<Review[]>(key);
    if (cached) return cached;

    try {
      const rows = await getPrisma().review.findMany({
        where: { listingId },
        orderBy: { position: 'asc' },
      });

      if (rows.length > 0) {
        const reviews = rows.map(toReview);
        await this.cache.set(key, reviews, CacheTtl.reviews);
        return reviews;
      }
    } catch {
      // Fall through to fixture
    }

    if (listingId === LISTING_FIXTURE.id) {
      await this.cache.set(key, REVIEW_FIXTURES as Review[], CacheTtl.reviews);
      return REVIEW_FIXTURES;
    }
    return [];
  }
}

let repo: PrismaReviewRepository | null = null;

export function getReviewRepository(): PrismaReviewRepository {
  if (!repo) repo = new PrismaReviewRepository();
  return repo;
}
