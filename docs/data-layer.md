# Data layer

See [`README.md`](./README.md) for the directory map and [`architecture.md`](./architecture.md) for how this fits into the request flow.

## Database connection

`src/db/index.ts` opens a single Drizzle connection via `drizzle-orm/neon-http` + `@neondatabase/serverless`'s `neon()`, against `process.env.DATABASE_URL` (from the gitignored `.env` — **this points at the production Neon DB**, there's no separate dev database).

There is no `drizzle.config.*` file anywhere in this repo — see [`gotchas.md` #3](./gotchas.md#3-no-drizzleconfig-anywhere). Schema/migrations conceptually live in the private [ResourceQ](https://github.com/jqhz/ResourceQ) app; when that schema changes, use the `sync-resourceq-schema` skill (`.claude/skills/sync-resourceq-schema/`) to bring `src/db/schema.ts` back in sync.

## Schema reference (`src/db/schema.ts`)

**This schema is read-only from MCSRHub's perspective — all writes happen through the private ResourceQ app.**

Full column-by-column reference (types, nullability, defaults, FKs) lives in [`schema.md`](./schema.md). Summary: `categories` (slug PK + label), `playlists` (self-referential via `parentPlaylistId` for nesting), `cards`, and two join tables — `playlistCards` (playlists ↔ cards) and `cardCategories` (cards ↔ categories, since a card can belong to more than one category).

Shared app-level types (not the raw DB row shapes) live in `src/data/content.ts`: `CategorySlug`, `Playlist`, `CardItem`, and the canonical `CATEGORIES` array (slug + display label) used for nav/labels throughout the UI.

## The single DB access point: `getContent()`

`src/db/queries.ts` exports exactly one function apps actually call:

```ts
export const getContent = unstable_cache(fetchContent, ['content-store-v3'], { revalidate: 300 });
```

`fetchContent()` fetches `cards`, `cardCategories`, `playlistCards`, and `playlists` in parallel, then joins them **in memory** (no SQL joins) into `CardItem[]` / `Playlist[]`. It's called from exactly two places: `src/app/layout.tsx` (server-side, on every request, feeding the initial page load) and `src/app/api/content/route.ts` (the client refetch path). Don't add a third call site or a separate query path without good reason — everything currently funnels through this one function so the cache stays coherent.

### Category ordering convention

Each card's `categories` array is built from its `cardCategories` rows, then reordered by `orderCategoriesWithPrimary()` so that whichever category matches the card's **id string prefix** sorts first:

```ts
const CATEGORY_PREFIX: Record<CategorySlug, string> = {
  tutorials: 'tutorial', tech: 'tech', documents: 'document', downloads: 'download',
  'apps-tools': 'app', discords: 'discord', youtube: 'youtube', fanart: 'fanart',
};
```

e.g. a card with id `tutorial-123` that's linked to both `tutorials` and `tech` will get `tutorials` sorted first. This only *reorders* categories the card is already linked to via `cardCategories` — it doesn't assign a category on its own. It's an implicit, code-only convention (nothing enforces the id-prefix ↔ category relationship at the schema level). See [`gotchas.md` #5](./gotchas.md#5-category-ordering-convention).

### Public content filtering

`src/utils/publicContent.ts` (`isPublicCard` / `filterPublicCards`) is applied at the end of `fetchContent()`, before the result is cached — so archived/non-public cards never make it into `getContent()`'s output at all.

## The exception: `votes.json`

`src/app/api/votes/route.ts` does **not** use the Postgres DB. It reads and writes a JSON file directly via `fs`:

- Path: `src/data/votes.json` (gitignored, generated at runtime)
- Shape: `{ questions, votes, currentQuestionId, lastResetDate }`
- Daily rotation is driven by `getCstDateString()` (`src/utils/time.ts`) — resets once per Central-time day
- Seed questions come from `src/data/vote-questions.ts` (`VOTE_QUESTIONS`)

This is a fundamentally different persistence model from the rest of the app's data (file writes on a serverless/Vercel deployment are not guaranteed to persist across invocations or instances) — see [`gotchas.md` #4](./gotchas.md#4-two-persistence-models).

## Backups

`scripts/backup-db.ts`, run via `npm run backup`. Uses raw `sql` template queries directly against `neon()` (not Drizzle's query builder) to dump `categories`, `playlists`, `cards`, `cardCategories`, and `playlistCards` to a timestamped JSON file under `backups/`, logging row counts on completion.
