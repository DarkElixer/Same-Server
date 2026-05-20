# Same-Server

Express + React proxy/player for a Stalker IPTV portal, plus an anonymous
"viewer" persistence layer for VOD/series watch progress.

## Env setup

The app reads its config from `dotenv.config` (loaded by
`require("dotenv").config({ path: './dotenv.config' })` in `app.js`).
Keep that file out of source control if you ever put real secrets in
it; the version checked in only has placeholders.

For the `/me/*` persistence layer you need two Supabase Postgres
connection strings:

- `DATABASE_URL` — the **pooled** (pgbouncer) URL on port `6543` with
  `?pgbouncer=true&connection_limit=1`. This is what the running app
  uses.
- `DIRECT_URL` — the **direct** URL on port `5432`. This is what
  `prisma migrate` uses for DDL / advisory locks.

Both can be copied verbatim from the Supabase dashboard
(`Project Settings → Database → Connection string`).

After filling them into `dotenv.config`:

```sh
# Generate the Prisma client (runs offline, no DB needed).
npx prisma generate

# First-time setup against a fresh Supabase database:
npx prisma migrate dev --name init

# In production / Railway (replays committed migrations):
npx prisma migrate deploy
```

If `prisma/migrations/` is empty when you deploy, run
`npx prisma migrate dev --name init` once locally and commit the
generated `prisma/migrations/<timestamp>_init/migration.sql` so
`migrate deploy` has something to apply.

## /me endpoints

All four endpoints require an `X-Viewer-Key` header (any RFC 4122 UUID;
the frontend mints + caches one in `localStorage.viewerKey`).

| Method | Path           | Purpose                                   |
| ------ | -------------- | ----------------------------------------- |
| POST   | `/me/playback` | Heartbeat / pause / seek / complete write |
| GET    | `/me/progress` | Single `(contentType, contentId, ep?)` lookup |
| GET    | `/me/continue` | Latest in-progress items, one per title   |
| GET    | `/me/history`  | Paginated history, cursor on `updatedAt`  |

There is a smoke script you can run against a live server:

```sh
node scripts/smoke-me.js                    # default http://localhost:3152
node scripts/smoke-me.js https://your-host  # custom base
```

## Scripts

- `npm start` — `node --watch server.js`
- `npm run prod` — builds the React frontend into `frontend/dist/`
