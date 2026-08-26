# Production architecture — vacation-rental marketplace

The live Next.js app in this repo implements the **client + BFF teaching slice**:
React Query (SWR) → Route Handler → repository → Redis → PostgreSQL.
The diagram below is the production topology that slice is modelled on.

```mermaid
flowchart TB
  %% EDGE: Cloudflare Anycast. Immutable assets TTL 1y. HTML SWR.
  %% Scale by cache rules, not by adding Node processes.
  Guest["Guest browser<br/>Next.js App Router"]
  CDN["Cloudflare CDN + WAF<br/>HTTP/3 · image optimizer · bot fight"]

  %% INGRESS: Gateway owns authN, rate limits, request IDs.
  %% NLB/ALB to stateless Next.js pods. HPA on CPU + p99. Multi-AZ.
  GW["API Gateway<br/>JWT · rate limit"]
  NLB["L4/L7 Load Balancers<br/>AWS NLB + ALB"]
  WEB["Web / BFF fleet<br/>Next.js on ECS/K8s"]

  %% MICROSERVICES: independently deployable, own their datastore.
  %% Search is CQRS (Postgres write, OpenSearch read via Kafka CDC).
  AUTH["Auth service<br/>sessions · OAuth · WebAuthn"]
  SEARCH["Search service<br/>geo + filters"]
  BOOK["Booking service<br/>inventory · holds"]
  PRICE["Pricing service<br/>nightly + fees + FX"]
  REVIEW["Reviews service<br/>moderation"]
  MEDIA["Media service<br/>photo ingest"]

  %% CACHE: Redis Cluster 3 shards x 1 replica. Listing TTL 60s,
  %% quote TTL 15s. Never the ledger for bookings.
  REDIS[("Redis Cluster<br/>read-through listing cache")]

  %% ASYNC: Kafka. Idempotency keys on consumers. Partition by
  %% listingId for bookings, userId for notify.
  KAFKA["Kafka<br/>booking.confirmed · review.created · price.updated"]
  WORKERS["Async workers<br/>email · search index · fraud · invoices"]

  %% DATA: Postgres = SoR (SERIALIZABLE on overlapping dates).
  %% Mongo = review documents. OpenSearch = geo. S3 = originals.
  PG[("PostgreSQL<br/>listings · calendars · bookings")]
  MONGO[("MongoDB<br/>review documents")]
  OS[("OpenSearch<br/>geo search index")]
  S3[("S3 + img CDN<br/>original photos")]

  Guest --> CDN
  CDN --> GW
  GW --> NLB
  NLB --> WEB
  WEB --> AUTH
  WEB --> SEARCH
  WEB --> BOOK
  WEB --> PRICE
  WEB --> REVIEW
  WEB --> MEDIA
  AUTH --> REDIS
  SEARCH --> REDIS
  SEARCH --> OS
  BOOK --> REDIS
  BOOK --> PG
  PRICE --> REDIS
  PRICE --> PG
  REVIEW --> MONGO
  REVIEW --> REDIS
  MEDIA --> S3
  BOOK --> KAFKA
  REVIEW --> KAFKA
  PRICE --> KAFKA
  KAFKA --> WORKERS
  WORKERS --> OS
  WORKERS --> PG
  WORKERS --> MONGO
```

## Deployment strategy (per node)

| Node | How it scales | How it deploys |
| --- | --- | --- |
| Cloudflare CDN | Anycast POPs; cache HIT ratio is the SLO | Terraform cache rules; purge by tag on release |
| API Gateway | Horizontal; per-route rate limits | Canary 5% → 25% → 100%; schema lint in CI |
| Load balancers | Multi-AZ; connection draining 30s | Infra-as-code; no app deploys |
| Next.js BFF | HPA on p99 TTFB; min 3 / AZ | Rolling + ISR revalidation; images via `next/image` |
| Auth | CPU-bound JWT/WebAuthn; Redis session | Blue/green; key rotation runbook |
| Search | Read replicas of OpenSearch | Index blue/green; Kafka CDC lag alert |
| Booking | Vertically isolated; Postgres is the bottleneck | Feature flags; dual-write calendar holds |
| Pricing | Aggressive Redis; compute-heavy | Autoscale on quote QPS |
| Redis | Cluster, 3 shards × 1 replica | Failover < 10s; never durable bookings |
| Kafka | Partition by aggregate id | Compacted topics for price; 7-day retention for mail |
| PostgreSQL | Partition calendars by month; Citus at 50M rows | PITR, follow-the-sun replicas |
| MongoDB | Shard reviews by `listingId` | TTL on moderation drafts |
| Workers | Consumer groups; idempotency keys | KEDA scale on lag |

## Mapping to this repository

Every box above has a working counterpart here. The shapes are honest even
though the scale is not — the same seams exist, so replacing a node means
swapping one file rather than restructuring the app.

| Production | Implemented here |
| --- | --- |
| API Gateway / BFF | `src/app/api/**/route.ts` — Route Handlers |
| Request validation at the edge | `src/server/http/validation.ts` (zod) |
| Redis Cluster | `src/server/cache/redis.ts` — ioredis / Upstash REST behind `RedisLike` |
| PostgreSQL (listings, calendar) | Prisma models in `prisma/schema.prisma` |
| MongoDB (reviews) | `reviews` table, cached separately with a longer TTL |
| Booking service transaction | `PrismaBookingRepository.create` — Serializable + GiST exclusion |
| Pricing service | `src/lib/pricing.ts`, re-evaluated server-side on every write |
| CDN `stale-while-revalidate` | `Cache-Control` on each GET route |
| Client-side SWR | React Query `staleTime` / `gcTime` |
| Optimistic UI | `useToggleSaved` heart mutation |
| Health / metrics endpoint | `GET /api/health` with live cache hit ratio |

### What is deliberately missing

Naming the gaps matters as much as filling them; each of these is a service
boundary, not a missing function.

- **Auth.** No sessions or ownership checks — every request is anonymous, so
  `POST /api/bookings` would need an authenticated principal before it could
  charge anyone. The wishlist is one row per listing for the same reason.
- **Kafka.** Confirmation email, calendar sync, and search reindex are the
  async consumers in the diagram. Here the booking write is fully synchronous.
- **Payments.** The quote is computed and stored; no authorization is taken,
  which is why a booking is `confirmed` the moment it is written.
