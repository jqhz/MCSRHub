# Gotchas

Non-obvious conventions and known rough edges — read this before spending an hour confused. Purely descriptive of the current code; none of these are proposals to fix, just things to know about.

## 1. Two coexisting routers

`src/app/` (Next.js App Router) is the primary and only router used for real pages and routes. One file, `src/pages/api/fanart.ts`, still lives under the legacy Pages Router and serves static sample fanart data. It's a historical artifact — don't use it as a model for new API routes; put those under `src/app/api/*/route.ts`.

## 2. Vite-era leftovers

The project predates its move to Next.js and still carries a few harmless leftovers: `src/assets/react.svg`, the `vite` and `@vitejs/plugin-react-swc` devDependencies, the `eslint-plugin-react-refresh` rule wired into `eslint.config.js`, and `"types": ["vite/client"]` in `tsconfig.app.json`. None of this is load-bearing — it's just noise you might trip over while browsing config files.

## 3. No `drizzle.config.*` anywhere

There's no local Drizzle config or migration tooling in this repo. `src/db/schema.ts` is a manually-maintained mirror of the schema owned by the private [ResourceQ](https://github.com/jqhz/ResourceQ) app — migrations happen there, not here. When ResourceQ's schema changes upstream, use the `sync-resourceq-schema` skill (`.claude/skills/sync-resourceq-schema/`) to update `schema.ts` (and `queries.ts` if needed) to match.

## 4. Two persistence models

Most content (cards, playlists, categories) comes from the Neon Postgres DB via the single cached `getContent()` function — read-only from this repo's side. The daily-poll feature (`/api/votes`) is different: it reads and writes a local JSON file, `src/data/votes.json`, directly via `fs`. That file has very different durability guarantees than the DB, and local file writes are not guaranteed to persist reliably across invocations/instances on a serverless deployment like Vercel — vote counts could silently reset or diverge between instances.

## 5. Category-ordering convention

A card's "primary" category isn't a column — it's derived at read time. `src/db/queries.ts`'s `CATEGORY_PREFIX` map matches a card's `id` string prefix (e.g. `tutorial-`, `tech-`, `discord-`) against its already-assigned categories (from `cardCategories`) to decide which one sorts first when a card belongs to more than one. Nothing in the schema enforces the id-prefix ↔ category relationship — it's an implicit convention, undocumented anywhere in code comments. See [`data-layer.md`](./data-layer.md#category-ordering-convention).

## 6. Nested/nestable playlists

Playlists can nest arbitrarily deep via `playlists.parentPlaylistId`, a self-referential foreign key with cascade delete. Resolving a URL to a playlist, computing its canonical path, and redirecting non-canonical URLs (`permanentRedirect`) all depend on the tree-walking logic in `src/utils/playlists.ts`. It's non-obvious but load-bearing — see [`routing-and-api.md`](./routing-and-api.md#nested-playlist-path-resolution).

## 7. `open-graph-scraper` is installed but unused

It's listed in `package.json`'s dependencies, but `/api/og-image` hand-rolls its own regex-based meta-tag scraper instead of using it.

## 8. Orphan test file

`src/utils/contentOrdering.test.ts` exists with no matching `contentOrdering.ts` source file anywhere in the repo. The logic it exercises likely lives across `sorting.ts` and `placement.ts`. Don't assume there's a missing file to find.
