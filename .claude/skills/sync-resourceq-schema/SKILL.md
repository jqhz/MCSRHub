---
name: sync-resourceq-schema
description: Use when ResourceQ's database schema has changed upstream and MCSRHub's local Drizzle schema (src/db/schema.ts) needs to be brought back in sync. Walks through diffing against ResourceQ and drafting the migration here.
---

`src/db/schema.ts` in this repo mirrors the schema owned and migrated by ResourceQ (https://github.com/jqhz/ResourceQ), a separate private app. MCSRHub only reads from these tables — it does not originate schema changes independently.

When invoked:

1. Ask the user what changed on ResourceQ's side (new/removed/renamed tables, columns, enums, constraints) if they haven't already described it. If they have access to the ResourceQ repo locally or can paste its current schema, use that as the source of truth.
2. Diff the described changes against the current `src/db/schema.ts` in this repo.
3. Update `src/db/schema.ts` to match ResourceQ's schema exactly — same table/column names, types, and enum values. Do not add fields ResourceQ doesn't have, and do not change anything unrelated to the described sync.
4. Check `src/db/queries.ts` (and any other file reading from the changed tables/columns) for breakage from the schema change, and update those call sites.
5. Generate a drizzle migration for the change (`drizzle-kit generate`), reviewing the output SQL before it's applied — this repo doesn't have a `drizzle.config.*` yet, so check for one first and ask the user how migrations should be run if it's missing.
6. Confirm with the user before running any migration against the live Neon database — `.env`'s `DATABASE_URL` points at production data.
