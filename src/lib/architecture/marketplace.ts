/**
 * Production-scale architecture for a vacation-rental marketplace.
 *
 * This diagram is the "what we would ship" view. The Next.js app in this repo
 * is the client + BFF slice: Redis and PostgreSQL stand in for the cluster
 * cache and primary store so the workshop can trace the same read-through
 * path with Compose instead of Kubernetes.
 *
 * Scaling notes live on each node as Mermaid comments (`%%`).
 */

export const MARKETPLACE_ARCHITECTURE = `
flowchart TB
  %% ============================================================
  %% EDGE — terminate TLS close to the guest, cache immutable
  %% assets, and absorb bot traffic before it reaches origin.
  %% Cloudflare: Anycast POP, HTTP/3, image resizing, WAF.
  %% Horizontal scale: Cloudflare's network; we pay with cache
  %% rules, not with more Node processes.
  %% ============================================================
  Guest["Guest browser<br/>Next.js App Router"]
  CDN["Cloudflare CDN + WAF<br/>HTTP/3 · image optimizer · bot fight"]
  %% Deploy: Terraform for cache rules. Immutable hashed assets
  %% (JS/CSS/webp) TTL 1y. HTML TTL 0 with stale-while-revalidate.

  %% ============================================================
  %% INGRESS — API Gateway is the contract surface (authN, rate
  %% limit, request IDs). NLB fans out to stateless Next.js /
  %% BFF pods. Scale: HPA on CPU + p99 latency. Multi-AZ.
  %% ============================================================
  GW["API Gateway<br/>JWT · rate limit · WAF skip"]
  NLB["L4/L7 Load Balancers<br/>AWS NLB + ALB"]
  WEB["Web / BFF fleet<br/>Next.js on ECS/K8s"]

  %% ============================================================
  %% MICROSERVICES — independently deployable. Each owns its
  %% datastore. Search is CQRS: writes go to Postgres, reads from
  %% OpenSearch via Kafka CDC. Pricing is a sidecar-ish service
  %% because it is CPU-heavy and cache-friendly.
  %% ============================================================
  AUTH["Auth service<br/>sessions · OAuth · WebAuthn"]
  SEARCH["Search service<br/>geo + filters"]
  BOOK["Booking service<br/>inventory · holds"]
  PRICE["Pricing service<br/>nightly + fees + FX"]
  REVIEW["Reviews service<br/>moderation"]
  MEDIA["Media service<br/>photo ingest"]

  %% ============================================================
  %% CACHE — Redis Cluster, 3 shards × 1 replica. Listing
  %% payloads and pricing quotes. TTL 60s listing / 15s quote.
  %% The in-memory Map in this repo is the teaching analog.
  %% Failover: replica promotion < 10s. Never persist bookings
  %% only in Redis — it is a cache, not a ledger.
  %% ============================================================
  REDIS[("Redis Cluster<br/>read-through listing cache")]

  %% ============================================================
  %% ASYNC — Kafka for booking events, review fan-out, search
  %% index updates, email/SMS, fraud scoring. Exactly-once is a
  %% myth; we use idempotency keys on consumers.
  %% Partitions: listingId hash for booking; userId for notify.
  %% ============================================================
  KAFKA["Kafka<br/>booking.confirmed · review.created · price.updated"]
  WORKERS["Async workers<br/>email · search index · fraud · invoices"]

  %% ============================================================
  %% DATA — Postgres is the system of record for listings,
  %% calendars, bookings (SERIALIZABLE on overlapping dates).
  %% Citus/partition by host_id at ~50M rows. Mongo holds
  %% denormalized review documents (append-heavy, flexible
  %% schema). S3 + CloudFront for originals; CDN for derivatives.
  %% ============================================================
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
`;
