import { CacheKeys, CacheTtl, getCache, type RedisLike } from '@/server/cache/redis';
import { getPrisma } from '@/server/db/prisma';
import type { ReviewRepository } from '@/server/repositories/contracts';
import { toReview } from '@/server/repositories/mappers';
import type { ListingId, Review } from '@/types/listing';

/**
 * Reviews are cached separately from the listing and with a longer TTL.
 *
 * Why split: they are the heaviest part of the payload and the least likely
 * to change, and the client only asks for them when the below-fold section
 * mounts. Bundling them into the listing response would put text nobody has
 * scrolled to yet on the critical path.
 */
export class PrismaReviewRepository implements ReviewRepository {
  constructor(private readonly cache: RedisLike = getCache()) {}

  async findByListingId(listingId: ListingId): Promise<readonly Review[]> {
    const key = CacheKeys.reviews(listingId);
    const cached = await this.cache.get<Review[]>(key);
    if (cached) return cached;

    const rows = await getPrisma().review.findMany({
      where: { listingId },
      orderBy: { position: 'asc' },
    });

    const reviews = rows.map(toReview);
    await this.cache.set(key, reviews, CacheTtl.reviews);
    return reviews;
  }
}

let repo: PrismaReviewRepository | null = null;

export function getReviewRepository(): PrismaReviewRepository {
  if (!repo) repo = new PrismaReviewRepository();
  return repo;
}
