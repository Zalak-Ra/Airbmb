# Deployment

This app is a Next.js process: the listing UI and the `/api/*` Route Handlers
ship together. Postgres is the system of record; Redis is the L1 cache.
Nothing in this file belongs in git as a secret — copy [`.env.example`](.env.example)
to `.env` locally, and set the same keys in the host's dashboard.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Prisma runtime connection. On Neon this is the **pooler**. |
| `DIRECT_DATABASE_URL` | yes | Prisma migrations. On Neon this is the **direct** host (no `-pooler`). Locally it is the same URL as `DATABASE_URL`. |
| `REDIS_URL` | one of Redis vars | TCP Redis (`redis://` or `rediss://`). Compose, Render, Fly. |
| `UPSTASH_REDIS_REST_URL` | one of Redis vars | Upstash REST. Preferred on Vercel. Wins if both Redis styles are set. |
| `UPSTASH_REDIS_REST_TOKEN` | with REST URL | Upstash REST token. |
| `AIR_LATENCY_MS` | no | Teaching switch. Adds jittered latency so skeletons stay visible. |

`getCache()` picks **Upstash REST → TCP Redis → in-memory Map**. An unset Redis
is not a crash, but it is not a shared cache either — two serverless
invocations will not see each other's keys.

Do not commit `.env`. Do not put connection strings in the client bundle;
`src/server/**` is gated with `server-only`.

## Local

Requires Docker Desktop (Compose v2) and Node 22.5+. On Windows, Docker's
Linux engine needs **WSL 2** — if `docker compose up` fails with a 500 from
`dockerDesktopLinuxEngine`, run `wsl --install` in an elevated terminal,
reboot, then start Docker Desktop and retry.

```bash
cp .env.example .env
npm install
docker compose up -d          # Postgres 16 + Redis 7
npm run db:migrate            # prisma migrate deploy
npm run db:seed               # desert-horizon-villa + host-blocked nights
npm run dev
```

`docker compose up -d` starts **only** the databases. The Next app stays on
the host so hot reload is native. To run the production image against the
same databases:

```bash
docker compose --profile app up --build
```

Health: [http://localhost:3000/api/health](http://localhost:3000/api/health).
A warm listing cache shows `cache.hitRate > 0` after two reloads.

Reset the workshop world (drops data, reapplies migrations, reseeds):

```bash
npm run db:reset
```

## Neon (serverless Postgres)

1. Create a project at [neon.tech](https://neon.tech) (free tier is enough).
2. Copy two connection strings from the dashboard:

   - **Pooled** (host contains `-pooler`, port `6543`) → `DATABASE_URL`.
     Append `?pgbouncer=true` if Neon did not already.
   - **Direct** (no `-pooler`, port `5432`) → `DIRECT_DATABASE_URL`.

   `prisma migrate deploy` uses `DIRECT_DATABASE_URL`. PgBouncer does not
   speak the prepared-statement protocol Prisma needs for migrations.

3. From a machine that can reach Neon:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. Point the host (Vercel / Render / Fly) at the same two URLs.

## Upstash (serverless Redis)

1. Create a database at [upstash.com](https://upstash.com).
2. For **Vercel**, copy REST `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN`. Serverless invocations cannot hold a TCP
   connection; REST is the supported path.
3. For a **long-running container** (Render, Fly, Compose), the TCP
   `rediss://…` URL can go in `REDIS_URL` instead. TLS is required;
   Upstash does not expose plaintext Redis on the public internet.

## Vercel (native Next.js — no Docker)

Vercel builds Next.js from source. Do not push the Dockerfile here.

1. Import the repo. Framework preset: Next.js.
2. Set env vars: `DATABASE_URL`, `DIRECT_DATABASE_URL`,
   `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
3. Override **Build Command** so migrations run once per deploy:

   ```bash
   prisma migrate deploy && prisma generate && next build
   ```

   Seed is not in the build command — it would wipe bookings on every
   deploy. Run `npx prisma db seed` once from your laptop against Neon.

4. Deploy. Confirm `GET /api/health` reports `database.engine: "postgresql"`
   and `cache.backend: "upstash"`.

`output: 'standalone'` in `next.config.ts` is ignored by Vercel and required
by the Docker image; leaving it on does not change the Vercel build.

## Render (Docker)

1. New **Web Service** → this repo → **Docker**.
2. Health check path: `/api/health`.
3. Env vars: Neon pooled + direct URLs, and either Upstash REST or a Render
   Redis `REDIS_URL`.
4. Pre-deploy / release command (if the dashboard offers one):

   ```bash
   npx prisma migrate deploy
   ```

   If Render has no release phase, run migrations from CI or your laptop
   against `DIRECT_DATABASE_URL` before the first deploy.
5. The image already runs as uid `1001` (`nextjs`). Do not set the service
   to run as root.

## Fly.io (Docker)

```bash
fly launch --no-deploy          # generates fly.toml from the Dockerfile
fly secrets set DATABASE_URL="…" DIRECT_DATABASE_URL="…" REDIS_URL="…"
fly deploy
```

Point `DATABASE_URL` at Neon or at a Fly Postgres. Same split as above:
migrations need the direct URL. Health check:

```toml
[http_service]
  internal_port = 3000

  [http_service.checks]
    [http_service.checks.health]
      path = "/api/health"
      interval = "15s"
```

Run `fly ssh console -C "npx prisma migrate deploy"` once if you did not
migrate from CI.

## Verify after deploy

```bash
curl -sS https://<host>/api/health
curl -sS https://<host>/api/listings/desert-horizon-villa | head
curl -sS -X POST https://<host>/api/bookings \
  -H 'content-type: application/json' \
  -d '{"listingId":"desert-horizon-villa","checkIn":"2026-11-01","checkOut":"2026-11-04","guests":{"adults":2,"children":0,"infants":0,"pets":0}}'
```

Expect 201 with a server-computed `quote.total`, then 409 if you POST the
same range again. The calendar's greyed nights come from `blocked_nights`
plus confirmed bookings — never from the client.
