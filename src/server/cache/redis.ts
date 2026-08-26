import 'server-only';
import { Redis as IoRedis } from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';

/**
 * L1 cache contract — the subset of Redis this app actually uses.
 *
 * Three implementations share this surface so the repositories never know
 * whether they are talking to Compose Redis, Upstash REST, or an in-process
 * Map (the last is a last-resort fallback when no URL is configured):
 *
 *   Upstash REST  →  Vercel / any serverless runtime that cannot hold TCP
 *   ioredis TCP   →  Docker Compose, Render, Fly.io
 *   InMemoryRedis →  `next build` and a laptop with no cache process
 *
 * A real Redis makes the `globalThis` singleton moot: the cache is a
 * separate process every bundle dials into. The in-memory adapter still
 * hangs off `globalThis` because Next compiles each route separately.
 */

export interface CacheStats {
  readonly backend: 'memory' | 'redis' | 'upstash';
  readonly keys: number;
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: number;
}

export interface RedisLike {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  del(key: string): Promise<void>;
  delByPrefix(prefix: string): Promise<void>;
  flush(): Promise<void>;
  ping(): Promise<boolean>;
  stats(): CacheStats;
}

class HitCounter {
  hits = 0;
  misses = 0;

  record(hit: boolean): void {
    if (hit) this.hits += 1;
    else this.misses += 1;
  }

  snapshot(
    backend: CacheStats['backend'],
    keys: number,
  ): CacheStats {
    const total = this.hits + this.misses;
    return {
      backend,
      keys,
      hits: this.hits,
      misses: this.misses,
      hitRate: total === 0 ? 0 : Number((this.hits / total).toFixed(3)),
    };
  }

  reset(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

interface MemoryEntry {
  readonly value: unknown;
  readonly expiresAt: number | null;
}

export class InMemoryRedis implements RedisLike {
  private readonly store = new Map<string, MemoryEntry>();
  private readonly counter = new HitCounter();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry || (entry.expiresAt !== null && entry.expiresAt <= Date.now())) {
      if (entry) this.store.delete(key);
      this.counter.record(false);
      return null;
    }
    this.counter.record(true);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: typeof ttlMs === 'number' ? Date.now() + ttlMs : null,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delByPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  async flush(): Promise<void> {
    this.store.clear();
    this.counter.reset();
  }

  async ping(): Promise<boolean> {
    return true;
  }

  stats(): CacheStats {
    return this.counter.snapshot('memory', this.store.size);
  }
}

/**
 * TCP Redis via ioredis. JSON round-trips through strings because Redis
 * itself is untyped — the domain object is reconstituted on the way out,
 * never stored as a Prisma row.
 */
export class IoRedisAdapter implements RedisLike {
  private readonly client: IoRedis;
  private readonly counter = new HitCounter();

  constructor(url: string) {
    this.client = new IoRedis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
    });
  }

  private async ready(): Promise<IoRedis> {
    if (this.client.status === 'wait') await this.client.connect();
    return this.client;
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await (await this.ready()).get(key);
    if (raw === null) {
      this.counter.record(false);
      return null;
    }
    this.counter.record(true);
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const payload = JSON.stringify(value);
    const client = await this.ready();
    if (typeof ttlMs === 'number') await client.set(key, payload, 'PX', ttlMs);
    else await client.set(key, payload);
  }

  async del(key: string): Promise<void> {
    await (await this.ready()).del(key);
  }

  async delByPrefix(prefix: string): Promise<void> {
    const client = await this.ready();
    let cursor = '0';
    do {
      const [next, keys] = await client.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
      cursor = next;
      if (keys.length > 0) await client.unlink(...keys);
    } while (cursor !== '0');
  }

  async flush(): Promise<void> {
    await (await this.ready()).flushdb();
    this.counter.reset();
  }

  async ping(): Promise<boolean> {
    try {
      return (await (await this.ready()).ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  stats(): CacheStats {
    return this.counter.snapshot('redis', -1);
  }

  async keyCount(): Promise<number> {
    try {
      return await (await this.ready()).dbsize();
    } catch {
      return -1;
    }
  }
}

/**
 * Upstash REST. Serverless platforms (Vercel) cannot hold a Redis TCP
 * connection across invocations; the REST API is the supported path.
 */
export class UpstashRestAdapter implements RedisLike {
  private readonly client: UpstashRedis;
  private readonly counter = new HitCounter();

  constructor(url: string, token: string) {
    this.client = new UpstashRedis({ url, token });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get<T>(key);
    this.counter.record(value !== null);
    return value;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    if (typeof ttlMs === 'number') await this.client.set(key, value, { px: ttlMs });
    else await this.client.set(key, value);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPrefix(prefix: string): Promise<void> {
    let cursor = '0';
    do {
      const [next, keys] = await this.client.scan(cursor, { match: `${prefix}*`, count: 100 });
      cursor = String(next);
      if (keys.length > 0) await this.client.del(...keys);
    } while (cursor !== '0');
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
    this.counter.reset();
  }

  async ping(): Promise<boolean> {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  stats(): CacheStats {
    return this.counter.snapshot('upstash', -1);
  }
}

const globals = globalThis as typeof globalThis & { __airCache?: RedisLike };

function createCache(): RedisLike {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) return new UpstashRestAdapter(restUrl, restToken);

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) return new IoRedisAdapter(redisUrl);

  return new InMemoryRedis();
}

export function getCache(): RedisLike {
  if (!globals.__airCache) globals.__airCache = createCache();
  return globals.__airCache;
}

export const CacheKeys = {
  listingPrefix: (id: string) => `listing:${id}`,
  listing: (id: string) => `listing:${id}:entity`,
  reviews: (id: string) => `listing:${id}:reviews`,
  availability: (id: string, from: string, to: string) =>
    `listing:${id}:availability:${from}:${to}`,
} as const;

/**
 * TTLs are short on purpose. Availability is the most volatile — a stale
 * calendar sells a night twice, so it expires fastest and is also invalidated
 * on write.
 */
export const CacheTtl = {
  listing: 60_000,
  reviews: 120_000,
  availability: 10_000,
} as const;
