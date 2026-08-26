# AIR — listing page workshop

Desktop clone of a vacation-rental listing page, backed by Next.js Route
Handlers, Prisma/PostgreSQL, and a Redis read-through cache.

Requires **Node 22.5+** and **Docker Desktop** (Compose v2) for local Postgres
and Redis. On Windows, enable WSL 2 (`wsl --install`, reboot) or Docker's
Linux engine will refuse to start. Deployment targets (Neon, Upstash, Vercel,
Render, Fly.io) are in [deploy.md](deploy.md).

## Run

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database is seeded
from [`src/lib/data/fixtures.ts`](src/lib/data/fixtures.ts). `npm run db:reset`
drops it, reapplies migrations, and reseeds.

The API is fast enough to hide the loading states it was built to handle. Put a
floor under it to see them:

```bash
# already in .env as AIR_LATENCY_MS=250
```

## Architecture

```
browser                                    server
─────────────────────────────────────────  ────────────────────────────────────────
component
  → React Query hook      (SWR, optimistic)
  → listing.service       (typed fetch)
  → ─────── HTTP ───────→   Route Handler  (zod validation, error mapping)
                            → Repository   (owns the query)
                              → Redis          L1, TTL 10–120s
                              → PostgreSQL     system of record
```

The service module's signatures did not change when SQLite was replaced —
only the repositories underneath them. That is the payoff for putting a
repository boundary in early.

## API

| Method | Path                                | Notes |
| ------ | ----------------------------------- | ----- |
| GET    | `/api/health`                       | Postgres + Redis ping, live cache hit ratio |
| GET    | `/api/listings/:id`                 | Cached 60s |
| GET    | `/api/listings/:id/reviews`         | Cached 120s, split off the critical path |
| PUT    | `/api/listings/:id/saved`           | Idempotent wishlist write |
| GET    | `/api/listings/:id/availability`    | `?from=&to=`, never cached at the edge |
| POST   | `/api/bookings`                     | 201, or 409 with the conflicting nights |
| GET    | `/api/bookings?listingId=`          | Stays behind the blocked calendar nights |

Errors share one shape, with a closed set of codes so the client can branch
without parsing prose:

```json
{ "error": { "code": "dates_unavailable", "message": "Those nights are already taken",
             "details": { "conflicts": ["2026-10-24", "2026-10-25"] } } }
```

## Three things worth reading the code for

**Double-sell prevention.** `PrismaBookingRepository.create` runs the
availability check and the insert inside one Serializable transaction. A GiST
exclusion constraint on `bookings` is the database's own copy of the same
rule. Checking availability outside the transaction is the textbook
time-of-check/time-of-use bug.

**The client never sets the price.** `POST /api/bookings` accepts dates and
guests, never a total. `src/lib/pricing.ts` is shared so the booking card can
render a preview instantly, but the repository re-derives the number from the
stored nightly rate inside the transaction.

**The cache is a process, not a Map.** `RedisLike` has three implementations:
Upstash REST (Vercel), ioredis TCP (Compose / Fly / Render), and an in-memory
fallback. `getCache()` picks in that order. `/api/health` reports which one
is live and the hit ratio.

## Surfaces

- Listing page (`/`) — photo mosaic, booking card, amenities, live calendar
- Photo tour — Show all photos (code-split)
- Lightbox — ←/→, Escape, adjacent-image prefetch
- Production topology — [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Deploy — [deploy.md](deploy.md)

## Scripts

| Script                | Purpose |
| --------------------- | ------- |
| `npm run dev`         | Dev server |
| `npm run build`       | `prisma generate` + production build |
| `npm run typecheck`   | `tsc --noEmit` |
| `npm run lint`        | ESLint |
| `npm run db:up`       | `docker compose up -d postgres redis` |
| `npm run db:migrate`  | `prisma migrate deploy` |
| `npm run db:seed`     | Fixture catalog into Postgres |
| `npm run db:reset`    | Drop, migrate, seed |
