# Routing and API reference

See [`architecture.md`](./architecture.md) for how these fit into the overall request flow.

## Page routes

| Path | File | Type | Renders |
|---|---|---|---|
| `/` | `src/app/page.tsx` | client | Homepage: a "Daily Tip" and "Featured Channel" card, deterministically picked from all cards (`src/utils/dailyTip.ts`) |
| `/[category]` | `src/app/[category]/page.tsx` | client | Paginated listing of playlists + cards for a category; special-cases `fanart` (renders `FanartGrid` instead of the normal grid) |
| `/[category]/[...playlistPath]` | `src/app/[category]/[...playlistPath]/page.tsx` | server | Resolves a nested playlist path and renders `PlaylistView`; redirects to the canonical URL if the given path isn't canonical |
| `/[category]/playlist/[playlistId]` | `src/app/[category]/playlist/[playlistId]/page.tsx` | server | Legacy URL shim — `permanentRedirect`s old `/category/playlist/id` links to the new nested-slug path |

## Nested playlist path resolution

Playlists can nest arbitrarily via `playlists.parentPlaylistId` (a self-referential FK, cascade-delete — see [`schema.md`](./schema.md#playlists)). The catch-all route resolves and canonicalizes paths using `src/utils/playlists.ts`:

| Function | Purpose |
|---|---|
| `getPlaylistAncestors` | Walk `parentPlaylistId` up to the root, returns ancestor chain |
| `getPlaylistPathSegments` | Ancestor slugs + the playlist's own slug, in URL order |
| `findPlaylistByPath` | Walk a list of path segments down the tree to find the matching playlist |
| `findPlaylistBySlugOrId` | Find a playlist by slug or id within a category, preferring the root-level match if there are duplicates |
| `playlistUsesCanonicalPath` | Compares a given path against the playlist's actual canonical path |
| `findPlaylistInCategory`, `playlistUsesCanonicalSlug` | `@deprecated` aliases kept for compatibility — use the functions above instead |

If a resolved playlist's canonical path doesn't match the requested URL, the route issues a `permanentRedirect` to the canonical path. See [`gotchas.md` #6](./gotchas.md#6-nestednestable-playlists) for why this exists.

## API routes

| Path | Method | File | Purpose | Data source |
|---|---|---|---|---|
| `/api/content` | GET | `src/app/api/content/route.ts` | Returns `{ cards, playlists }` | `getContent()` (cached 300s) |
| `/api/og-image` | GET | `src/app/api/og-image/route.ts` | Resolves an OG image for a `?url=` query param and 302-redirects to it | Live fetch + scrape of `og:image`/`twitter:image` meta tags; special-cases Discord invite links (resolves the guild icon via the Discord API); in-memory cache; falls back to `/images/defaultcard.jpg` on any failure |
| `/api/votes` | GET, POST | `src/app/api/votes/route.ts` | Daily poll: GET returns the current question + vote counts, POST records a vote | **Local JSON file** `src/data/votes.json`, not the Postgres DB — see [`gotchas.md` #4](./gotchas.md#4-two-persistence-models) |
| `/api/fanart` | GET | `src/pages/api/fanart.ts` (legacy Pages Router) | Returns static sample fanart data | `src/data/fanart-sample.ts` — see [`gotchas.md` #1](./gotchas.md#1-two-coexisting-routers) |

### `/api/og-image` details worth knowing

- Discord invite links (`discord.gg/*` or `discord.com/invite/*`) are special-cased: it calls the Discord API for the invite, extracts the guild icon, and redirects to the CDN icon URL instead of scraping the invite page itself.
- Uses `AbortController` timeouts (2.5s for the Discord API call, 3.5s for a general page fetch) so a slow/hanging target site can't hang the request.
- Caches both successes (24h) and negative results — no image found (10min) — in an in-memory `Map`, per server instance.

### `/api/votes` details worth knowing

- Question rotates once per day, keyed off a Central-time date string (`getCstDateString()` in `src/utils/time.ts`), not UTC midnight.
- New questions from `src/data/vote-questions.ts` get merged into the stored file on each request (`syncQuestions`), so adding a question to the seed file is picked up without a manual reset.
- POST validates the submitted `questionId` still matches the currently active question and rejects out-of-range `choiceIndex` values.
