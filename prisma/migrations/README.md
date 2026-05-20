# Prisma migrations

This directory will hold the SQL migrations that Prisma generates from
`../schema.prisma`.

It is intentionally empty in source control because the initial migration
must be generated against a live Supabase Postgres instance. After
setting `DATABASE_URL` and `DIRECT_URL` (see the project root README's
"Env setup" section), run:

```
# First-time setup against a fresh database:
npx prisma migrate dev --name init

# Production / Railway (replays committed migrations):
npx prisma migrate deploy
```

`migrate dev` will create a `prisma/migrations/<timestamp>_init/` folder
containing `migration.sql`; commit that folder so subsequent
environments can use `migrate deploy`.
