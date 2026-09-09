# Components and utils reference

Quick lookup for "which file does X." See [`architecture.md`](./architecture.md) for how these fit together at runtime.

## Components (`src/components/`)

Flat — all components live directly in `src/components/*.tsx`, no subfolders.

| Component | Purpose | Notes |
|---|---|---|
| `AppShell.tsx` | Top-level client wrapper | MUI dark theme (custom `Minecraftia` font), `CssBaseline`, mounts `ContentProvider`, renders `Header` + `Sidebar` + main content + `Footer`, owns responsive drawer state |
| `ContentProvider.tsx` | React Context data provider | Exposes `{ cards, playlists, loading, refresh }`; `useContent()` is the sole read API for the rest of the tree — see [`architecture.md`](./architecture.md#state-management) |
| `Header.tsx` | App bar | Search box (`Fuse.js` via `src/utils/search.ts`), category label lookups, routing via `src/utils/navigation.ts` + `src/utils/pagination.ts` |
| `Sidebar.tsx` | Category navigation drawer | |
| `Footer.tsx` | Footer | |
| `CardGrid.tsx` | Grid layout for playlists + cards | Used on category pages |
| `RegularCard.tsx` | Generic card display | Largest component; used for tutorials/tech/etc. cards as well as the homepage's daily tip and featured channel |
| `PlaylistCard.tsx` | Card variant for playlist tiles | |
| `PlaylistView.tsx` | Renders a resolved playlist's contents | Used by the `[...playlistPath]` catch-all route |
| `FanartGrid.tsx` | Fanart-specific grid | Tweet-embed-style layout; fanart is manually curated via Discord, not scraped (see `CLAUDE.md`) |

## Utils (`src/utils/`)

Pure functions, no React. A few have colocated `*.test.ts` files.

| File | Exports | Purpose |
|---|---|---|
| `publicContent.ts` | `isPublicCard`, `filterPublicCards` | Filters out non-public (e.g. archived) cards |
| `placement.ts` | `showsOnCategoryRoot` | Whether a card shows on a category's root page vs. only inside a playlist |
| `dailyTip.ts` | `getDailyTip`, `getDailyChannel` | Deterministic "pick of the day" from a card list, used on the homepage |
| `time.ts` | `getCstDateString` | Central-time date string; drives the daily vote rotation |
| `navigation.ts` | `getCategoryRoute`, `getPlaylistRoute`, `getPlaylistRouteBySlug`, `getPlaylistRouteByPlaylistId`, `getHighlightIdForPlaylist`, `appendQuerySuffix` | Route-building helpers |
| `sorting.ts` | content ordering helpers | Sort/order logic for cards and playlists |
| `playlists.ts` | see [`routing-and-api.md`](./routing-and-api.md#nested-playlist-path-resolution) | Nested-playlist path resolution and canonicalization |
| `pagination.ts` | `PAGE_SIZE`, `getCategoryCards`, `getCategoryPlaylists`, `getCategoryPageForItem`, `getPlaylistPageForCard` | Pagination for category listings |
| `search.ts` | `buildSearchIndex`, `createSearch` | Builds the `Fuse.js` index used by `Header`'s search box |

**Known discrepancy:** `src/utils/contentOrdering.test.ts` exists but there's no matching `contentOrdering.ts` source file — the logic it tests likely lives across `sorting.ts`/`placement.ts`. Worth confirming if you touch this area; not asserted here as a bug, just flagged so you don't go looking for a file that isn't there.
